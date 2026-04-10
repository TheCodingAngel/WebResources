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
    
    #lastBreakpointAddress = -1;
    
    #nonFailingInterrupts = [IO.Interrupts.Halt, IO.Interrupts.Breakpoint];
    
    
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
                this._executeInstruction(this.#cpu.getNextInstruction());
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
            this._executeInstruction(this.#cpu.getNextInstruction());
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
    
    _executeInstruction(characters) {
        if (typeof(characters) != "string") {
            throw new InstructionError("Invalid instruction data");
        }
        if (characters.length != CPU.instructionSize) {
            throw new InstructionError(`Instructions must have ${CPU.instructionSize} characters but the next one is with ${characters.length}. Maybe EIP has incorrect value?`);
        }
        
        this.#io.onFlush();
        let nextInstructionAddress = this.#executeInstructionCallback(characters);
        
        if (typeof(nextInstructionAddress) == "undefined" || nextInstructionAddress === null) {
            this.#cpu.incrementInstructionPointer();
        } else if (typeof(nextInstructionAddress) == "number") {
            this.#cpu.setInstructionPointer(nextInstructionAddress);
        } else {
            throw new InstructionError("Incorrect result for instruction with opcode " + opcode);
        }
        
        if (characters[0] != Instructions.IRET_OPCODE) {
            let pendingInterrupt = this.#io.getPendingHardwareInterrupt();
            if (isValid(pendingInterrupt)) {
                this.#returnFromInterruptToNext.push(false);
                this._prepareCustomInterruptHandler(pendingInterrupt.getInterruptNumber(), false);
                let handlerAddress = pendingInterrupt.prepare()
                this.#cpu.setInstructionPointer(handlerAddress);
                return;
            }
        }
        
        if (this.#currentExecution == Emulator.ExecutionMode.SteppingOut && this.#steppedInCount <= this.#stepOutAtCount) {
            this.cancel();
        }
    }
    
    _executeInterrupt(interruptNumber, ignoreErrors) {
        ignoreErrors = ignoreErrors || this.#nonFailingInterrupts.includes(interruptNumber);
        
        let returnToNextInstruction = IO.canContinueAfterTrap(interruptNumber);
        
        let handlerAddress = this.#io.getValidInterruptHandler(interruptNumber, ignoreErrors);
        if (this.#io.isDefaultInterrupt(handlerAddress, interruptNumber)) {
            this._defaultInterruptHandler(interruptNumber);
            
            let result = this.#cpu.getInstructionPointer();
            if (returnToNextInstruction) {
                result += CPU.instructionSize;
            }
            return result;
        }
        
        this.#returnFromInterruptToNext.push(returnToNextInstruction);
        this._prepareCustomInterruptHandler(interruptNumber, ignoreErrors);
        return handlerAddress;
    }
    
    _defaultInterruptHandler(interruptNumber) {
        switch(interruptNumber) {
            case IO.Interrupts.DivideByZero:
                this.cancel();
                alert("Division by Zero:\nSystem halted");
                break;
            case IO.Interrupts.InvalidOpcode:
                this.cancel();
                alert("Invalid opcode:\nSystem halted");
                break;
            case IO.Interrupts.Halt:
                this.cancel();
                alert("Reached the end of execution:\nSystem halted");
                break;
            case IO.Interrupts.Breakpoint:
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
            case IO.Interrupts.Teleprinter:
                break;
            case IO.Interrupts.DmaFinished:
                break;
            case IO.Interrupts.Custom:
                break;
            default:
                let interruptValues = Object.entries(IO.Interrupts).reduce((str, value) => str + `\n${value[1]} - ${value[0]}`, "");
                throw new InstructionError(`Incorrect interrupt number: ${interruptNumber}.\nSupported numbers: ${interruptValues}`);
        }
    }
    
    _prepareCustomInterruptHandler(interruptNumber, ignoreErrors) {
        this.#steppedInCount++;
        
        let registers = this.#cpu.getAllRegisters();
        
        let stackPointer = this.#cpu.getStackPointer();
        if (stackPointer <= registers.length) {
            if (ignoreErrors) {
                this._defaultInterruptHandler(interruptNumber);
                return this.#cpu.getInstructionPointer();
            } else {
                let memoryCapacity = this.#memory.getCapacity();
                throw new InstructionError(`Incorrect Stack Pointer value for interrupts: "${stackPointer}" (must be between ${registers.length + 1} and ${memoryCapacity - 1}).`);
            }
        }
        
        this.pushValue(registers);
        this.#cpu.enterInterrupt(interruptNumber); // CS becomes negative and all addresses become physical
    }
    
    _showErrorPopup($message) {
        document.querySelector('.cpu_popup').classList.add('activecpup');
    }
}
