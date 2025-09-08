var emulator;

class Emulator {
    #memory;
    #io;
    #cpu;
    
    #executeInstructionCallback;
    
    #buttonRun;
    #buttonCancel;
    #executionIntervalElement;

    #runInterval = null;

    static #defaultExecutionInterval = 10;
    static #minExecutionInterval = 10;
    
    static ExecutionMode = {
        Stopped: 0,
        SteppingOut: 1,
        Running: 2,
    }
    
    #currentExecution = Emulator.ExecutionMode.Stopped;
    #steppedInCount = 0;
    #stepOutAtCount = 0;
    #returnFromInterruptToNext = [];
    
    #ioBufferCapacity = 80;
    #lastBreakpointAddress = -1;
    
    #nonFailingInterrupts = [CPU.Interrupts.Halt, CPU.Interrupts.Breakpoint];
    #hardwareInterrupts = new Map([
        [CPU.Interrupts.Teleprinter, {port: 2, queue: []}],
    ]);
    
    
    constructor(memory, io, cpu, buttonRun, buttonCancel, executionIntervalElement) {
        this.#memory = memory;
        this.#io = io;
        this.#cpu = cpu;

        this.#buttonRun = buttonRun;
        this.#buttonCancel = buttonCancel;
        this.#buttonCancel.style.display = "none";

        this.#executionIntervalElement = executionIntervalElement;
        this.#executionIntervalElement.value = Emulator.#defaultExecutionInterval;
    }
    
    setExecuteInstructionCallback(executeInstructionCallback) {
        this.#executeInstructionCallback = executeInstructionCallback;
    }

    run() {
        let delay = parseIntOrNull(this.#executionIntervalElement.value, 10);
        if (delay) {
            this._runInteractive(delay, Emulator.ExecutionMode.Running);
        } else if (delay === 0) {
            // Tight loop execution - cannot get faster than this
            this._runLoop();
        } else {
            alert(`Incorrect delay - resetting to default (${Emulator.#defaultExecutionInterval}).`);
            this.#executionIntervalElement.value = Emulator.#defaultExecutionInterval;
        }
    }

    _runLoop() {
        if (!confirm("The page will not be interactive during this execution.\n" +
                     "Press OK only if the program finishes (halts) and doesn't need user input.\n" +
                     "Programs with infinite loops will make the page unresponsive!")) {
            return;
        }
        
        this.#currentExecution = Emulator.ExecutionMode.Running;
        
        try {
            this.#buttonRun.disabled = true;
            while(this.#currentExecution != Emulator.ExecutionMode.Stopped) {
                this.executeInstruction(this.#cpu.getNextInstruction());
            }
        } catch(err) {
            if (err instanceof InstructionError) {
                alert("Instruction Error: " + err.message);
                console.log("Instruction Error: " + err.message);
                if (err.stack) {
                    console.log(err.stack);
                }
            } else {
                throw err;
            }
        } finally {
            this.#buttonRun.disabled = false;
        }
    }

    _runInteractive(delay, executionMode) {
        if (this.#runInterval) {
            return;
        }
        let timeout = Math.max(delay, Emulator.#minExecutionInterval);
        timeout = Math.min(timeout, this.#executionIntervalElement.max);
        if (timeout != delay) {
            this.#executionIntervalElement.value = timeout;
        }
        
        this.#currentExecution = executionMode;
        if (this.#currentExecution == Emulator.ExecutionMode.Stopped) {
            return;
        }

        this.#runInterval = setInterval(() => {
            if (this.#currentExecution != Emulator.ExecutionMode.Stopped) {
                this.stepIn();
            }
        }, timeout);
        
        this.#buttonRun.style.display = "none";
        this.#buttonCancel.style.display = "block";
        
        // immediate execution - the timer from above will wait for its first call
        if (this.#currentExecution == Emulator.ExecutionMode.Running) {
            this.stepIn();
        }
    }

    cancel() {
        this.#currentExecution = Emulator.ExecutionMode.Stopped;
        
        clearInterval(this.#runInterval);
        this.#runInterval = null;

        this.#buttonCancel.style.display = "none";
        this.#buttonRun.style.display = "block";
    }
    
    step() {
        if (this.#cpu.isControlSet(CPU.ControlMask.StepByStep)) {
            this.stepIn();
        } else {
            this.stepOver();
        }
    }

    stepOver() {
        let oldCount = this.#steppedInCount;
        
        this.stepIn();
        
        if (this.#steppedInCount > oldCount) {
            this.stepOut();
        }
    }

    stepIn() {
        try {
            this.executeInstruction(this.#cpu.getNextInstruction());
        } catch(err) {
            if (err instanceof InstructionError) {
                alert("Instruction Error: " + err.message);
                console.log("Instruction Error: " + err.message);
                if (err.stack) {
                    console.log(err.stack);
                }
                this.cancel();
            } else {
                throw err;
            }
        }
    }

    stepOut() {
        if (this.#steppedInCount <= 0) {
            return;
        }
        
        this.#stepOutAtCount = this.#steppedInCount - 1;
        
        let delay = parseIntOrNull(this.#executionIntervalElement.value, 10);
        if (delay == null || delay < Emulator.#defaultExecutionInterval) {
            delay = Emulator.#defaultExecutionInterval;
        }
        this._runInteractive(delay, Emulator.ExecutionMode.SteppingOut);
    }
    
    executeInstruction(characters) {
        if (typeof(characters) != "string") {
            throw new InstructionError("Invalid instruction data");
        }
        if (characters.length != CPU.instructionSize) {
            throw new InstructionError(`Instructions must have ${CPU.instructionSize} characters but the next one is with ${characters.length}. Maybe EIP has incorrect value?`);
        }
        
        for (let [interrupt, portData] of this.#hardwareInterrupts) {
            let handlerAddress = this._checkHardwareInterrupt(interrupt, portData);
            if (handlerAddress != null) {
                this.#cpu.setInstructionPointer(handlerAddress);
                return;
            }
        }
        
        let nextInstructionAddress = this.#executeInstructionCallback(characters);
        
        if (typeof(nextInstructionAddress) == "undefined" || nextInstructionAddress === null) {
            this.#cpu.incrementInstructionPointer();
        } else if (typeof(nextInstructionAddress) == "number") {
            this.#cpu.setInstructionPointer(nextInstructionAddress);
        } else {
            throw new InstructionError("Incorrect result for instruction with opcode " + opcode);
        }
        
        if (this.#currentExecution == Emulator.ExecutionMode.SteppingOut && this.#steppedInCount <= this.#stepOutAtCount) {
            this.cancel();
        }
    }
    
    pushValue(value) {
        let stackAddress = this.#cpu.pushStackPointer(value.length);
        if (stackAddress < 0) {
            return;
        }
        
        stackAddress = this.#cpu.logicalToPhysicalAddress(stackAddress);
        this.#memory.setTextAtAddress(stackAddress, value);
    }
    
    popValue(numCharacters) {
        let stackAddress = this.#cpu.popStackPointer(numCharacters);
        stackAddress = this.#cpu.logicalToPhysicalAddress(stackAddress);
        return this.#memory.getTextAtAddress(stackAddress, numCharacters);
    }
    
    executeError(interruptNumber) {
        return this._executeInterrupt(interruptNumber, true);
    }
    
    executeInterrupt(interruptNumber) {
        return this._executeInterrupt(interruptNumber, false);
    }
    
    returnFromInterrupt() {
        if (this.#steppedInCount > 0) {
            this.#steppedInCount--;
        }
        
        let numCharacters = this.#cpu.getAllRegistersSize();
        let registers = this.popValue(numCharacters);
        this.#cpu.setAllRegisters(registers);
        this.#cpu.exitInterrupt();
        
        let result = this.#cpu.getInstructionPointer();
        if (this.#returnFromInterruptToNext.pop()) {
            result += CPU.instructionSize;
        }
        return result;
    }
    
    clearGlobalInterrupt() {
        if (this.#steppedInCount > 0) {
            this.#steppedInCount--;
        }
        
        this.#cpu.exitInterrupt();
        this.#returnFromInterruptToNext.pop();
        
        return this.#cpu.getInstructionPointer() + CPU.instructionSize;
    }
    
    enterCall() {
        let stackPointer = this.#cpu.getStackPointer();
        if (stackPointer <= CPU.registerSize) {
            throw new InstructionError(`Incorrect Stack Pointer value for calls: "${stackPointer}" (must be at least ${CPU.registerSize}).`);
        }
        
        this.#steppedInCount++;
        
        let returnAddress = this.#cpu.getInstructionPointer() + CPU.instructionSize;
        this.pushValue(padOrCutNumber(returnAddress, CPU.registerSize));
    }
    
    exitCall() {
        if (this.#steppedInCount > 0) {
            this.#steppedInCount--;
        }
        
        let returnAddress = this.popValue(CPU.registerSize);
        let result = parseIntOrNull(returnAddress);
        if (result == null) {
            let stackPointer = this.#cpu.getStackPointer();
            throw new InstructionError(`Incorrect return address "${returnAddress}" in the stack (Stack Pointer after pop: "${stackPointer}").`);
        }
        
        return result;
    }
    
    _executeInterrupt(interruptNumber, ignoreErrors) {
        ignoreErrors = ignoreErrors || this.#nonFailingInterrupts.includes(interruptNumber);
        
        let returnToNext = this._isTrap(interruptNumber);
        
        let handlerAddress = this._getValidInterruptHandler(interruptNumber, ignoreErrors);
        if (this._isDefaultInterrupt(handlerAddress, interruptNumber)) {
            this._defaultInterruptHandler(interruptNumber);
            
            let result = this.#cpu.getInstructionPointer();
            if (returnToNext) {
                result += CPU.instructionSize;
            }
            return result;
        }
        
        this.#returnFromInterruptToNext.push(returnToNext);
        this._customInterruptHandler(interruptNumber, ignoreErrors);
        return handlerAddress;
    }
    
    _isTrap(interruptNumber) {
        return [CPU.Interrupts.Teleprinter].includes(interruptNumber);
    }
    
    _checkHardwareInterrupt(interruptNumber, portData) {
        let handlerAddress = this._getValidInterruptHandler(interruptNumber, true);
        if (this._isDefaultInterrupt(handlerAddress, interruptNumber)) {
            return null;
        }
        
        if (this.#io.isMoreDataOnPort(portData.port)) {
            let data = this.#io.readFromPort(portData.port, this.#ioBufferCapacity);
            for (let ch of data) {
                portData.queue.push(ch);
            }
        }
        
        if (portData.queue.length > 0) {
            let nonHandled = portData.queue.splice(CPU.registerSize, Infinity);
            let characters = portData.queue.join("");
            this.#returnFromInterruptToNext.push(false);
            this._customInterruptHandler(interruptNumber, false);
            this.#cpu.setInterruptData(characters, null, characters.length);
            portData.queue = nonHandled;
            return handlerAddress;
        }
        
        return null;
    }
    
    _getValidInterruptHandler(interruptNumber, ignoreErrors) {
        let memoryCapacity = this.#memory.getCapacity();
        
        let idt = this.#cpu.getIDT();
        if (idt < 0) {
            return null;
        }
        
        let maxIdtValue = memoryCapacity - this.#cpu.getIDTSize();
        if (idt > maxIdtValue) {
            if (ignoreErrors) {
                return null;
            } else {
                throw new InstructionError(`Not enough space for the Interrupt Description Table: IDT is ${idt} while it cannot be bigger then ${maxIdtValue}.`);
            }
        }
        
        let interruptDescriptor = this._getInterruptDescriptor(idt, interruptNumber);
        let handlerAddress = parseIntOrNull(interruptDescriptor);
        if (handlerAddress == null) {
            if (ignoreErrors) {
                return null;
            } else {
                throw new InstructionError(`Incorrect address in the Interrupt Description Table for interrupt ${interruptNumber}: "${interruptDescriptor}".`);
            }
        }
        
        return handlerAddress;
    }
    
    _isDefaultInterrupt(handlerAddress, interruptNumber) {
        // Address 0 is the same as the default values so it is not allowed
        // to be the address of a custom interrupt handler.
        let isAddressIncorrect = handlerAddress == null || handlerAddress == 0;
        return isAddressIncorrect || this.#cpu.getCurrentInterrupt() == interruptNumber;
    }
    
    _getInterruptDescriptor(idt, interruptNumber) {
        return this.#memory.getTextAtAddress(idt + interruptNumber * CPU.registerSize, CPU.registerSize);
    }
    
    _defaultInterruptHandler(interruptNumber) {
        switch(interruptNumber) {
            case CPU.Interrupts.DivideByZero:
                this.cancel();
                alert("Division by Zero:\nSystem halted");
                break;
            case CPU.Interrupts.InvalidOpcode:
                this.cancel();
                alert("Invalid opcode:\nSystem halted");
                break;
            case CPU.Interrupts.Halt:
                this.cancel();
                alert("Reached the end of execution:\nSystem halted");
                break;
            case CPU.Interrupts.Breakpoint:
                let currentAddr = this.#cpu.getInstructionPointer();
                currentAddr = this.#cpu.logicalToPhysicalAddress(currentAddr);
                
                let shouldContinue = this.#lastBreakpointAddress == currentAddr;
                if (shouldContinue) {
                    this.#lastBreakpointAddress = -1;
                    this.#cpu.incrementInstructionPointer();
                } else {
                    this.cancel();
                    this.#lastBreakpointAddress = currentAddr;
                    alert("Reached a breakpoint");
                }
                break;
            case CPU.Interrupts.Teleprinter:
                break;
            default:
                throw new InstructionError(`Incorrect interrupt number: ${interruptNumber}.`);
        }
    }
    
    _customInterruptHandler(interruptNumber, ignoreErrors) {
        this.#steppedInCount++;
        
        let registers = this.#cpu.getAllRegisters();
        
        let stackPointer = this.#cpu.getStackPointer();
        if (stackPointer <= registers.length) {
            if (ignoreErrors) {
                this._defaultInterruptHandler(interruptNumber);
                return this.#cpu.getInstructionPointer();
            } else {
                throw new InstructionError(`Incorrect Stack Pointer value for interrupts: "${stackPointer}" (must be between ${registers.length} and ${memoryCapacity - 1}).`);
            }
        }
        
        this.pushValue(registers);
        this.#cpu.enterInterrupt(interruptNumber); // CS becomes negative and all addresses become physical
    }
    
    _showErrorPopup($message) {
        document.querySelector('.cpu_popup').classList.add('activecpup');
    }
}
