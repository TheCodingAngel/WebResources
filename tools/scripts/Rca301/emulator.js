var emulator;

class Emulator {
    #cpu;
    #instructions;

    #buttonRun;
    #buttonCancel;
    #executionIntervalElement;

    #runInterval = null;

    static #defaultExecutionInterval = 10;
    static #minExecutionInterval = 10;

    constructor(cpu, instructions, buttonRun, buttonCancel, executionIntervalElement) {
        this.#cpu = cpu;
        this.#instructions = instructions;

        this.#buttonRun = buttonRun;
        this.#buttonCancel = buttonCancel;
        this.#buttonCancel.style.display = "none";

        this.#executionIntervalElement = executionIntervalElement;
        this.#executionIntervalElement.value = Emulator.#defaultExecutionInterval;
    }

    run() {
        let delay = parseIntOrNull(this.#executionIntervalElement.value, 10);
        if (delay) {
            this._runInteractive(delay);
        } else if (delay === 0) {
            // Tight loop execution - cannot get faster than this
            this._runLoop();
        } else {
            alert(`Incorrect delay - resetting to default (${Emulator.#defaultExecutionInterval}).`);
            this.#executionIntervalElement.value = Emulator.#defaultExecutionInterval;
        }
    }

    _runLoop() {
        let nextInstructionStr = this.#cpu.getNextInstruction();
        try {
            this.#buttonRun.disabled = true;
            while(this.#instructions.executeInstruction(nextInstructionStr)) {
                nextInstructionStr = this.#cpu.getNextInstruction();
            }
        } catch(err) {
            if (err instanceof InstructionError) {
                alert("Error executing " + nextInstructionStr + ":\n" + err.message);
                console.log("Error executing " + nextInstructionStr + ": " + err.message);
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

    _runInteractive(delay) {
        if (this.#runInterval) {
            return;
        }
        let timeout = Math.max(delay, Emulator.#minExecutionInterval);
        timeout = Math.min(timeout, this.#executionIntervalElement.max);
        if (timeout != delay) {
            this.#executionIntervalElement.value = timeout;
        }

        this.#runInterval = setInterval(() => {
            if (!this.stepOver()) {
                this.cancel();
            }
        }, timeout);
        
        this.#buttonRun.style.display = "none";
        this.#buttonCancel.style.display = "block";
        // immediate execution - the timer from above will wait for its first call
        if (!this.stepOver()) {
            this.cancel();
        }
    }

    cancel() {
        clearInterval(this.#runInterval);
        this.#runInterval = null;

        this.#buttonCancel.style.display = "none";
        this.#buttonRun.style.display = "block";
    }

    stepOver() {
        try {
            return this.#instructions.executeInstruction(this.#cpu.getNextInstruction());
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
        }
        return false;
    }

    stepIn() {

    }

    stepOut() {
        
    }
}
