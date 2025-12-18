var instructions;

class InstructionError extends Error {
    constructor(message) {
        super("\n" + message);
        // Using this.constructor.name leads to weird names when minifying
        this.name = "InstructionError";
    }
}

class Instructions {
    #memory;
    #io;
    #cpu;
    #emulator;
    
    static INVALID_OPCODE = '&';
    static IRET_OPCODE = ':';
    
    #all = new Map([
        [' ', {mnemonic: "NOP",  execute: this._nop.bind(this)}],

        ['M', {mnemonic: "MOV",  execute: this._move.bind(this)}],
        ['S', {mnemonic: "MOVS", execute: this._moveString.bind(this)}],
        ['"', {mnemonic: "STOS", execute: this._storeString.bind(this)}],

        ['?', {mnemonic: "CMP",  execute: this._compare.bind(this)}],
        ['C', {mnemonic: "CMPS", execute: this._compareString.bind(this)}],
        ['F', {mnemonic: "SCAS", execute: this._find.bind(this)}],

        ['J', {mnemonic: "JMP",  execute: this._jump.bind(this)}],
        ['=', {mnemonic: "JE",   execute: this._jumpIfEqual.bind(this)}],
        ['!', {mnemonic: "JNE",  execute: this._jumpIfNotEqual.bind(this)}],
        ['<', {mnemonic: "JL",   execute: this._jumpIfLess.bind(this)}],
        ['>', {mnemonic: "JG",   execute: this._jumpIfGreater.bind(this)}],
        ['L', {mnemonic: "JLE",  execute: this._jumpIfLessOrEqual.bind(this)}],
        ['G', {mnemonic: "JGE",  execute: this._jumpIfGreaterOrEqual.bind(this)}],
        ['$', {mnemonic: "JO",   execute: this._jumpIfOverflow.bind(this)}],

        ['T', {mnemonic: "INT",  execute: this._int.bind(this)}],  // inTerrupt = Trap
        ['.', {mnemonic: "HLT",  execute: this._halt.bind(this)}],
        [',', {mnemonic: "INT3", execute: this._breakpoint.bind(this)}],
        [Instructions.IRET_OPCODE, {mnemonic: "IRET", execute: this._iret.bind(this)}],
        ["'", {mnemonic: "CLGI", execute: this._clgi.bind(this)}],
        ['@', {mnemonic: "CALL", execute: this._call.bind(this)}],
        [';', {mnemonic: "RET",  execute: this._ret.bind(this)}],
        ['(', {mnemonic: "PUSH", execute: this._push.bind(this)}],
        [')', {mnemonic: "POP",  execute: this._pop.bind(this)}],
        
        ['+', {mnemonic: "ADD",  execute: this._add.bind(this)}],
        ['-', {mnemonic: "SUB",  execute: this._subtract.bind(this)}],
        ['*', {mnemonic: "MUL",  execute: this._multiply.bind(this)}],
        ['/', {mnemonic: "DIV",  execute: this._divide.bind(this)}],
        ['%', {mnemonic: "MOD",  execute: this._modulus.bind(this)}],
        ['#', {mnemonic: "INC",  execute: this._increment.bind(this)}],
        ['D', {mnemonic: "DEC",  execute: this._decrement.bind(this)}],

        ['I', {mnemonic: "IN",   execute: this._in.bind(this)}],
        ['O', {mnemonic: "OUT",  execute: this._out.bind(this)}],
    ]);

    #forcedCharacterCount = new Map([
        ['R', CPU.registerSize], // for a Register
        ['A', 0],                // for an Address in a register
        ['V', CPU.registerSize], // for a Value
        ['P', 0],                // for a Pointer (an address given as value)
    ]);

    static ForceCharCount = {
        None: 0,
        OnlyLeftRegister: 1,
        OnlyRight: 2,
        ExcludeLeftValue: 3,
        LeftAndRight: 4,
    }

    #twoValueSufixes = new Map([
        ['C', ['R', 'R']],
        ['D', ['R', 'A']],
        ['E', ['R', 'V']],
        ['F', ['R', 'P']],

        ['H', ['A', 'R']],
        ['I', ['A', 'A']],
        ['J', ['A', 'V']],
        ['K', ['A', 'P']],

        ['M', ['V', 'R']],
        ['N', ['V', 'A']],
        ['U', ['V', 'V']],
        ['Q', ['V', 'P']],

        ['W', ['P', 'R']],
        ['X', ['P', 'A']],
        ['Y', ['P', 'V']],
        ['Z', ['P', 'P']],
    ]);

    constructor(memory, io, cpu, emulator) {
        this.#memory = memory;
        this.#io = io;
        this.#cpu = cpu;
        this.#emulator = emulator;
    }

    executeInstruction(characters) {
        let opcode = characters[0];
        let instruction = this.#all.get(opcode);
        if (!instruction) {
            throw new InstructionError("Unknown opcode: " + opcode);
        }
        return instruction.execute(opcode, characters[1], characters.substring(2, 6), characters.substring(6));
    }
    
    getMnemonics() {
        let result = new Map();
        for (let [key, value] of this.#all) {
            result.set(value.mnemonic, key);
        }
        return result;
    }
    
    getTwoValueSuffix(first, second) {
        for (const [key, value] of this.#twoValueSufixes) {
            if (value[0] == first && value[1] == second) {
                return key;
            }
        }
        return null;
    }
    
    _halt(opcode, suffix, a, b) {
        return this.#emulator.executeInterrupt(CPU.Interrupts.Halt);
    }
    
    _breakpoint(opcode, suffix, a, b) {
        return this.#emulator.executeInterrupt(CPU.Interrupts.Breakpoint);
    }
    
    _int(opcode, suffix, a, b) {
        if (suffix != ' ' && suffix != 'V') {
            throw new InstructionError(`Incorrect suffix "${suffix}" for instruction "${opcode}" (int); allowed suffixes are 'V' and the default one (empty space).`);
        }
        let interruptNumber = parseIntOrNull(a);
        if (interruptNumber == null) {
            throw new InstructionError(`Incorrect interrupt number: "${a}" for instruction "${opcode}" (int).`);
        }
        return this.#emulator.executeInterrupt(interruptNumber);
    }
    
    _iret(opcode, suffix, a, b) {
        let esp = this.#cpu.getStackPointer();
        let allRegistersSize = this.#cpu.getAllRegistersSize();
        if (esp < allRegistersSize) {
            throw new InstructionError(`The iret instruction ("${opcode}") requires the stack to have all registers, so the "stack pointer" register should be at least ${allRegistersSize} (now ESP is ${esp})`);
        }
        
        return this.#emulator.returnFromInterrupt();
    }
    
    _clgi(opcode, suffix, a, b) {
        return this.#emulator.clearGlobalInterrupt();
    }
    
    _call(opcode, suffix, a, b) {
        let esp = this.#cpu.getStackPointer();
        if (esp <= 0) {
            throw new InstructionError(`The call instruction ("${opcode}") requires positive value for the "stack pointer" register (now ESP is ${esp})`);
        }
        
        this.#emulator.enterCall();
        
        let valueType = this._getValueType("call", opcode, suffix, 'V');
        let valuesInfo = new ValuesInfo(this.#cpu, this.#memory, CPU.registerSize, false);
        let newAddressStr = valuesInfo.getValue(valueType, a, ValuesInfo.IndirectionType.None);
        let newAddress = parseIntOrNull(newAddressStr);
        if (newAddress == null) {
            switch (valueType) {
                case 'R':
                    throw new InstructionError(`"call" expects address while register ${a} does not contain a number: ${newAddressStr}.`);
                case 'A':
                    throw new InstructionError(`"call" expects address while register ${a} does not point to a number: ${newAddressStr}.`);
                case 'P':
                    throw new InstructionError(`"call" expects address while at address ${a} there is no number: ${newAddressStr}.`);
                default:
                    throw new InstructionError(`"call" expects address while the first operand is not a number: ${newAddressStr}.`);
            }
        }
        return newAddress;
    }
    
    _ret(opcode, suffix, a, b) {
        let esp = this.#cpu.getStackPointer();
        if (esp < CPU.registerSize) {
            throw new InstructionError(`The ret instruction ("${opcode}") requires the stack to have an address, so the "stack pointer" register should be at least ${CPU.registerSize} (now ESP is ${esp})`);
        }
        
        return this.#emulator.exitCall();
    }
    
    _push(opcode, suffix, a, b) {
        let esp = this.#cpu.getStackPointer();
        if (esp <= 0) {
            throw new InstructionError(`The push instruction ("${opcode}") requires positive value for the "stack pointer" register (now ESP is ${esp})`);
        }
        
        let valueType = this._getValueType("push", opcode, suffix, 'R');
        let valuesInfo = this._getValuesInfo(valueType, null, a, null);
        
        let value = valuesInfo.getValue(valueType, a, ValuesInfo.IndirectionType.None);
        this.#emulator.pushValue(value);
    }
    
    _pop(opcode, suffix, a, b) {
        let esp = this.#cpu.getStackPointer();
        if (esp <= 0) {
            throw new InstructionError(`The pop instruction ("${opcode}") requires positive value for the "stack pointer" register (now ESP is ${esp})`);
        }
        
        let valueType = this._getValueType("pop", opcode, suffix, 'R');
        this._verifyInstructionPointer("pop", opcode, "change", valueType, a);
        
        let valuesInfo = this._getValuesInfo(valueType, null, a, null);
        
        let numCharacters = valuesInfo.getCharacterCount();
        let newValue = this.#emulator.popValue(numCharacters);
        valuesInfo.setValue(valueType, a, newValue);
    }
    
    _nop(opcode, suffix, a, b) {
        if (suffix != ' ') {
            throw new InstructionError(`Incorrect suffix "${suffix}" for instruction " " (nop); only the default suffix of empty space is allowed as a suffix.`);
        }
    }

    _move(opcode, suffix, a, b) {
        let valueTypePair = this._getValueTypePair("move", opcode, suffix, ['R', 'V']);
        this._verifyInstructionPointer("move", opcode, "set", valueTypePair[0], a);
        
        let valuesInfo = this._getValuesInfo(valueTypePair[0], valueTypePair[1], a, b);
        let value = valuesInfo.getValue(valueTypePair[1], b, ValuesInfo.IndirectionType.None);
        
        valuesInfo.setValue(valueTypePair[0], a, value);
        if (valuesInfo.isUsingCustomCounter()) {
            this.#cpu.setCustomCounter(0);
        }
    }

    _moveString(opcode, suffix, a, b) {

    }

    _storeString(opcode, suffix, a, b) {
        let valueTypePair = this._getValueTypePair("stos", opcode, suffix, ['A', 'P']);
        this._verifyInstructionPointer("stos", opcode, "change", valueTypePair[0], a);
        
        let valuesInfo = this._getValuesInfo(valueTypePair[0], valueTypePair[1], a, b);
        let value = valuesInfo.getValue(valueTypePair[1], b, ValuesInfo.IndirectionType.None);

        let destinationValue = "".padEnd(this.#cpu.getCustomCounter(), value.charAt(0));
        valuesInfo.setValue(valueTypePair[0], a, destinationValue, true);
        
        this.#cpu.setCustomCounter(0);
    }

    _compare(opcode, suffix, a, b) {
        let valueTypePair = this._getValueTypePair("compare", opcode, suffix, ['R', 'V']);
        let valuesInfo = this._getValuesInfo(valueTypePair[0], valueTypePair[1], a, b, Instructions.ForceCharCount.LeftAndRight);

        let valueA = valuesInfo.getValue(valueTypePair[0], a, ValuesInfo.IndirectionType.None);
        let valueANum = parseIntOrNull(valueA);

        let valueB = valuesInfo.getValue(valueTypePair[1], b, ValuesInfo.IndirectionType.None);
        let valueBNum = parseIntOrNull(valueB);

        if (valueANum != null && valueBNum != null) {
            this.#cpu.setFlags(valueANum > valueBNum, valueANum < valueBNum, null);
        } else {
            let cmp = valueA.localeCompare(valueB);
            this.#cpu.setFlags(cmp > 0, cmp < 0, null);
            // Setting both positive and negative flags means "Invalid" state
            //this.#cpu.setFlags(true, true, null);
        }

        if (valuesInfo.isUsingCustomCounter()) {
            this.#cpu.setCustomCounter(0);
        }
    }

    _compareString(opcode, suffix, a, b) {
        let valueTypePair = this._getValueTypePair("compare", opcode, suffix, ['P', 'P']);
        let valuesInfo = this._getValuesInfo(valueTypePair[0], valueTypePair[1], a, b, Instructions.ForceCharCount.None);

        let valueA = valuesInfo.getValue(valueTypePair[0], a, ValuesInfo.IndirectionType.MemoryAndRegisters);
        let valueB = valuesInfo.getValue(valueTypePair[1], b, ValuesInfo.IndirectionType.MemoryAndRegisters);

        for (let i = 0; i < valuesInfo.getCharacterCount(); i++) {
            let charA = valueA.charAt(i);
            let charB = valueB.charAt(i);
            let cmp = charA.localeCompare(charB);
            if (cmp != 0) {
                this.#cpu.setFlags(cmp > 0, cmp < 0, null);
                if (valuesInfo.isUsingCustomCounter()) {
                    this.#cpu.setCustomCounter(i);
                }
                return;
            }
        }

        this.#cpu.setFlags(false, false, null);
        if (valuesInfo.isUsingCustomCounter()) {
            this.#cpu.setCustomCounter(0);
        }
    }

    _find(opcode, suffix, a, b) {
        let valueTypePair = this._getValueTypePair("compare", opcode, suffix, ['R', 'V']);
        let valuesInfo = this._getValuesInfo(valueTypePair[0], valueTypePair[1], a, b, Instructions.ForceCharCount.None);

        let searchPattern = valuesInfo.getValue(valueTypePair[1], b, ValuesInfo.IndirectionType.None, false);
        let count = parseInt(searchPattern[0]);
        let chars = []
        if (count) {
            for (let i = 0; i < count; i++) {
                chars.push(searchPattern[searchPattern.length - i - 1]);
            }
        } else {
            throw new InstructionError(`Incorrect characters value (${searchPattern}) used in "find" - the first character can be 1, 2 or 3.`);
        }

        let valueStr = valuesInfo.getValue(valueTypePair[0], a, ValuesInfo.IndirectionType.MemoryAndRegisters);
        for (let i = 0; i < valuesInfo.getCharacterCount(); i++){
            if (chars.includes(valueStr.charAt(i))) {
                this.#cpu.setFlags(false, false, false);
                if (valuesInfo.isUsingCustomCounter()) {
                    this.#cpu.setCustomCounter(i);
                }
                return;
            }
        }

        this.#cpu.setFlags(false, false, true);
        if (valuesInfo.isUsingCustomCounter()) {
            this.#cpu.setCustomCounter(0);
        }
    }

    _jump(opcode, suffix, a, b) {
        return this._jumpInternal("jump", opcode, suffix, a, b, null, null);
    }

    _jumpIfEqual(opcode, suffix, a, b) {
        return this._jumpInternal("jumpIfEqual", opcode, suffix, a, b, null, (isPositive, isNegative) => {
            return !isPositive && !isNegative;
        });
    }

    _jumpIfNotEqual(opcode, suffix, a, b) {
        return this._jumpInternal("jumpIfNotEqual", opcode, suffix, a, b, null, (isPositive, isNegative) => {
            return isPositive || isNegative;
        });
    }

    _jumpIfLess(opcode, suffix, a, b) {
        return this._jumpInternal("jumpIfLess", opcode, suffix, a, b, null, (isPositive, isNegative) => {
            return isNegative;
        });
    }

    _jumpIfGreater(opcode, suffix, a, b) {
        return this._jumpInternal("jumpIfGreater", opcode, suffix, a, b, null, (isPositive, isNegative) => {
            return isPositive;
        });
    }

    _jumpIfLessOrEqual(opcode, suffix, a, b) {
        return this._jumpInternal("jumpIfLessOrEqual", opcode, suffix, a, b, null, (isPositive, isNegative) => {
            return !isPositive;
        });
    }

    _jumpIfGreaterOrEqual(opcode, suffix, a, b) {
        return this._jumpInternal("jumpIfGreaterOrEqual", opcode, suffix, a, b, null, (isPositive, isNegative) => {
            return !isNegative;
        });
    }

    _jumpIfOverflow(opcode, suffix, a, b) {
        return this._jumpInternal("jumpIfOverflow", opcode, suffix, a, b, () => {
            return this.#cpu.isFlagsMaskSet(CPU.FlagsMask.Overflown);
        }, null);
    }

    _jumpInternal(name, opcode, suffix, a, b, condition, conditionPosNeg) {
        let valueType = this._getValueType(name, opcode, suffix, 'V');
        if (condition) {
            if (!condition()) {
                return;
            }
        }
        if (conditionPosNeg) {
            let isPositive = this.#cpu.isFlagsMaskSet(CPU.FlagsMask.Positive);
            let isNegative = this.#cpu.isFlagsMaskSet(CPU.FlagsMask.Negative);
            if (isPositive && isNegative) {
                // it is not valid to have both positive and negative state
                return;
            }
            if (!conditionPosNeg(isPositive, isNegative)) {
                return;
            }
        }
        let valuesInfo = new ValuesInfo(this.#cpu, this.#memory, CPU.registerSize, false);
        let newAddressStr = valuesInfo.getValue(valueType, a, ValuesInfo.IndirectionType.None);
        let newAddress = parseIntOrNull(newAddressStr);
        if (newAddress == null) {
            switch (valueType) {
                case 'R':
                    throw new InstructionError(`"${name}" expects address while register ${a} does not contain a number: ${newAddressStr}.`);
                case 'A':
                    throw new InstructionError(`"${name}" expects address while register ${a} does not point to a number: ${newAddressStr}.`);
                case 'P':
                    throw new InstructionError(`"${name}" expects address while at address ${a} there is no number: ${newAddressStr}.`);
                default:
                    throw new InstructionError(`"${name}" expects address while the first operand is not a number: ${newAddressStr}.`);
            }
        }
        return newAddress;
    }

    _add(opcode, suffix, a, b) {
        this._arithmetic_2("add", opcode, suffix, a, b, (valueA, valueB) => {
            return valueA + valueB;
        });
    }

    _subtract(opcode, suffix, a, b) {
        this._arithmetic_2("subtract", opcode, suffix, a, b, (valueA, valueB) => {
            return valueA - valueB;
        });
    }

    _multiply(opcode, suffix, a, b) {
        this._arithmetic_2("mul", opcode, suffix, a, b, (valueA, valueB) => {
            return valueA * valueB;
        });
    }

    _divide(opcode, suffix, a, b) {
        let res = this._arithmetic_2("div", opcode, suffix, a, b, (valueA, valueB) => {
            return Math.floor(valueA / valueB);
        });
        if (!Number.isFinite(res)) {
            return this.#emulator.executeError(CPU.Interrupts.DivideByZero);
        }
    }

    _modulus(opcode, suffix, a, b) {
        this._arithmetic_2("mod", opcode, suffix, a, b, (valueA, valueB) => {
            return valueA % valueB;
        });
    }

    _increment(opcode, suffix, a, b) {
        this._arithmetic_1("increment", opcode, suffix, a, valueA => {
            return valueA + 1;
        });
    }

    _decrement(opcode, suffix, a, b) {
        this._arithmetic_1("decrement", opcode, suffix, a, valueA => {
            return valueA - 1;
        });
    }

    _in(opcode, suffix, a, b) {
        let valueTypePair = this._getValueTypePair("input", opcode, suffix, ['V', 'V']);
        this._verifyInstructionPointer("input", opcode, "change", valueTypePair[0], a);
        this._verifyInstructionPointer("input", opcode, "use as a port number", valueTypePair[1], b);
        
        let valuesInfo = this._getValuesInfo(valueTypePair[0], valueTypePair[1], a, b, Instructions.ForceCharCount.OnlyLeftRegister);
        
        // The false flag for limiting char count is because we don't want limitations for port value
        // to affect the actual value
        let portValue = valuesInfo.getValue(valueTypePair[1], b, ValuesInfo.IndirectionType.None, false);
        let port = parseIntOrNull(portValue);
        if (port == null) {
            throw new InstructionError("Invalid port value (must be a number): " + portValue);
        }

        let characterCount = valuesInfo.getCharacterCount();
        let newValue = this.#io.readFromPort(port, characterCount);
        
        if (newValue == null) {
            throw new InstructionError("Device not found on port " + port);
        } else if (typeof newValue != 'string') {
            throw new InstructionError("Input not supported for the device on port " + port);
        }

        valuesInfo.setValue(valueTypePair[0], a, newValue, true);
        this.#cpu.setCustomCounter(characterCount - newValue.length);
        this.#cpu.setFlags(null, null, this.#io.isMoreDataOnPort(port));
    }

    _out(opcode, suffix, a, b) {
        let valueTypePair = this._getValueTypePair("output", opcode, suffix, ['V', 'P']);
        this._verifyInstructionPointer("output", opcode, "use as a port number", valueTypePair[0], a);
        
        let valuesInfo = this._getValuesInfo(valueTypePair[0], valueTypePair[1], a, b, Instructions.ForceCharCount.OnlyRight);
        
        // The false flag for limiting char count is because we don't want limitations for port value
        // to affect the actual value
        let portValue = valuesInfo.getValue(valueTypePair[0], a, ValuesInfo.IndirectionType.None, false);
        let port = parseIntOrNull(portValue);
        if (port == null) {
            throw new InstructionError("Invalid port value (must be a number): " + portValue);
        }

        let value = valuesInfo.getValue(valueTypePair[1], b, ValuesInfo.IndirectionType.None);
        let charsNotWritten = this.#io.writeToPort(port, value, valuesInfo.getCharacterCount());
        if (charsNotWritten == null) {
            throw new InstructionError("Device not found on port " + port);
        } else if (charsNotWritten < 0) {
            throw new InstructionError("Output not supported for the device on port " + port);
        }
        
        this.#cpu.setCustomCounter(charsNotWritten);
        this.#cpu.setFlags(null, null, charsNotWritten > 0);
    }

    _arithmetic_2(name, opcode, suffix, a, b, operation) {
        let valueTypePair = this._getValueTypePair(name, opcode, suffix, ['R', 'V']);
        this._verifyInstructionPointer(name, opcode, "change", valueTypePair[0], a);
        
        let valuesInfo = this._getValuesInfo(valueTypePair[0], valueTypePair[1], a, b);
        let valueA = parseIntOrNull(valuesInfo.getValue(valueTypePair[0], a, ValuesInfo.IndirectionType.Memory));
        let valueB = parseIntOrNull(valuesInfo.getValue(valueTypePair[1], b, ValuesInfo.IndirectionType.None));
        
        let newValue = 0;
        if (valueA != null && valueB != null) {
            newValue = operation(valueA, valueB);
            if (!Number.isFinite(newValue)) {
                // Setting both positive and negative flags means "Invalid" state
                this.#cpu.setFlags(true, true, null);
                return newValue;
            }
            let fixedValue = fixIfOverflown(newValue, valuesInfo.getCharacterCount());
            this.#cpu.setFlags(fixedValue > 0, fixedValue < 0, fixedValue != newValue);
            newValue = fixedValue;
        } else {
            // Setting both positive and negative flags means "Invalid" state
            this.#cpu.setFlags(true, true, null);
        }

        valuesInfo.setValue(valueTypePair[0], a, newValue);
        if (valuesInfo.isUsingCustomCounter()) {
            this.#cpu.setCustomCounter(0);
        }
        
        return newValue;
    }

    _arithmetic_1(name, opcode, suffix, a, operation) {
        let valueType = this._getValueType(name, opcode, suffix, 'R');
        this._verifyInstructionPointer(name, opcode, "change", valueType, a);
        
        let valuesInfo = this._getValuesInfo(valueType, null, a, null);
        let value = parseIntOrNull(valuesInfo.getValue(valueType, a, ValuesInfo.IndirectionType.Memory));
        
        let newValue = 0;
        if (value != null) {
            newValue = operation(value);
            if (!Number.isFinite(newValue)) {
                // Setting both positive and negative flags means "Invalid" state
                this.#cpu.setFlags(true, true, null);
                return newValue;
            }
            let isOverflown = newValue.toString(10).length > valuesInfo.getCharacterCount();
            this.#cpu.setFlags(newValue > 0, newValue < 0, isOverflown);
        } else {
            // Setting both positive and negative flags means "Invalid" state
            this.#cpu.setFlags(true, true, null);
        }

        valuesInfo.setValue(valueType, a, newValue);
        if (valuesInfo.isUsingCustomCounter()) {
            this.#cpu.setCustomCounter(0);
        }
        
        return newValue;
    }
    
    _getValueTypePair(name, opcode, suffix, defaultValueTypePair) {
        let valueTypePair = suffix != ' ' ? this.#twoValueSufixes.get(suffix) : defaultValueTypePair;
        if (!valueTypePair) {
            throw new InstructionError(`Incorrect suffix "${suffix}" for instruction "${opcode}" (${name}).\n` +
                `Allowed suffixes: ${Array.from(this.#twoValueSufixes.keys()).join(", ")}.\n` +
                `The default suffix of empty space treats the operands as [${defaultValueTypePair.join(", ")}].`);
        }
        return valueTypePair;
    }
    
    _getValueType(name, opcode, suffix, defaultValueType) {
        let valueType = suffix != ' ' ? suffix : defaultValueType;
        if (!this.#forcedCharacterCount.has(valueType)) {
            throw new InstructionError(`Incorrect suffix "${suffix}" for instruction "${opcode}" (${name}).\n` +
            `Allowed suffixes: ${Array.from(this.#forcedCharacterCount.keys()).join(", ")}.\n` +
            `The default suffix of empty space is the same as ${defaultValueType}.`);
        }
        return valueType;
    }
    
    _verifyInstructionPointer(name, opcode, action, valueType, a) {
        if (valueType == 'R' && this.#cpu.isOperandInstructionPointer(a)) {
            throw new InstructionError(`Cannot ${action} with "${opcode}" (${name}) the instruction pointer (EIP or register identifier ${a}).\n` +
                `Either change the register identifier or use a jump instruction if you want to change EIP.`);
        }
    }

    _getValuesInfo(valueTypeLeft, valueTypeRight, a, b, forceCharCount = Instructions.ForceCharCount.ExcludeLeftValue) {
        let charCountLeft = 0;
        let charCountRight = 0;

        switch (forceCharCount) {
            case Instructions.ForceCharCount.LeftAndRight:
                charCountLeft = this.#forcedCharacterCount.get(valueTypeLeft);
                charCountRight = this.#forcedCharacterCount.get(valueTypeRight);
                break;
            case Instructions.ForceCharCount.ExcludeLeftValue:
                if (valueTypeLeft != 'V') {
                    charCountLeft = this.#forcedCharacterCount.get(valueTypeLeft);
                }
                charCountRight = this.#forcedCharacterCount.get(valueTypeRight);
                break;
            case Instructions.ForceCharCount.OnlyRight:
                charCountRight = this.#forcedCharacterCount.get(valueTypeRight);
                break;
            case Instructions.ForceCharCount.OnlyLeftRegister:
                if (valueTypeLeft == 'R') {
                    charCountLeft = this.#forcedCharacterCount.get(valueTypeLeft);
                }
                break;
        }

        if (charCountLeft > 0 && valueTypeLeft == 'R') {
            let regSize = CPU.getRegisterSizeByOperand(a);
            if (regSize) {
                charCountLeft = Math.min(charCountLeft, regSize);
            }
        }

        if (charCountRight > 0 && valueTypeRight == 'R') {
            let regSize = CPU.getRegisterSizeByOperand(b);
            if (regSize) {
                charCountRight = Math.min(charCountRight, regSize);
            }
        }

        let characterCount = 0;
        let isUsingCustomCounter = false;
        if (charCountLeft > 0 && charCountRight > 0) {
            characterCount = Math.min(charCountLeft, charCountRight);
        } else if (charCountLeft > 0) {
            characterCount = charCountLeft;
        } else if (charCountRight > 0) {
            characterCount = charCountRight;
        } else {
            characterCount = this.#cpu.getCustomCounter();
            if (characterCount != null && characterCount > 0) {
                isUsingCustomCounter = true;
            } else {
                characterCount = CPU.registerSize;
            }
        }
        return new ValuesInfo(this.#cpu, this.#memory, characterCount, isUsingCustomCounter);
    }

    /*
    _getRegisterId(operand) {
        switch(operand[3]) {
            case '1':
                return this._compileRegisterId('a', operand[2]);
            case '2':
                return this._compileRegisterId('b', operand[2]);
            case '3':
                return this._compileRegisterId('c', operand[2]);
            case '4':
                return "esp";
            case '5':
                return "ebp";
        }
        return null;
    }

    _compileRegisterId(letter, type) {
        switch (type) {
            case '1':
                return letter + 'l';
            case '2':
                return letter + 'h';
            case '3':
                return letter + 'x';
            case '4':
                return 'e' + letter + 'x';
        }
        return null;
    }
    */
}

class ValuesInfo {
    static IndirectionType = {
        None: 0,
        Memory: 1,
        MemoryAndRegisters: 2,
    }

    #cpu;
    #memory;
    #characterCount;
    #isUsingCustomCounter;

    constructor(cpu, memory, characterCount, isUsingCustomCounter) {
        this.#cpu = cpu;
        this.#memory = memory;
        this.#characterCount = characterCount;
        this.#isUsingCustomCounter = isUsingCustomCounter;
    }

    isUsingCustomCounter() {
        return this.#isUsingCustomCounter;
    }

    getCharacterCount() {
        return this.#characterCount;
    }

    // The char count should not limited when the operands contain independent information
    getValue(valueType, operand, indirection, limitCharCount = true) {
        let value = this._getValueInternal(valueType, operand, indirection);
        // value might be limited by using a subregister or an address near the end of the memory
        if (limitCharCount) {
            this.#characterCount = Math.min(this.#characterCount, value.length);
        }
        return value;
    }

    setValue(valueType, operand, value, ignoreCharCount = false) {
        switch (valueType) {
            case 'R':
                if (!this.#cpu.setRegisterValueByOperand(operand, value)) {
                    throw new InstructionError(`Could not set value "${value}" to register "${operand}".`);
                }
                break;
            case 'A':
                let address = this.#cpu.getRegisterValueByOperand(operand);
                if (address == null) {
                    throw new InstructionError("Invalid register identifier: " + operand);
                }
                this._setInMemory(address, value, ignoreCharCount ? value.length : this.#characterCount);
                break;
            case 'V':
                this._setInMemory(operand, value, ignoreCharCount ? value.length : this.#characterCount);
                break;
            case 'P':
                this._setInMemory(this._dereference(operand, 0), value, ignoreCharCount ? value.length : this.#characterCount);
                break;
            default:
                throw new InstructionError("Incorrect value type (expected R, A, V or P): " + valueType);
        }
    }

    _getValueInternal(valueType, operand, indirection) {
        let indirectRegisters = indirection == ValuesInfo.IndirectionType.MemoryAndRegisters;
        let indirectMemory = indirectRegisters || indirection == ValuesInfo.IndirectionType.Memory;
        switch (valueType) {
            case 'R':
                let value = this.#cpu.getRegisterValueByOperand(operand);
                if (value == null) {
                    throw new InstructionError("Invalid register identifier: " + operand);
                }
                if (indirectRegisters) {
                    return this._dereference(value, this.#characterCount);
                }
                // numeric values come from registers with no subregisters
                return typeof(value) == "string" ? value : padOrCutNumber(value, 4);
            case 'A':
                let address = this.#cpu.getRegisterValueByOperand(operand);
                if (address == null) {
                    throw new InstructionError("Invalid register identifier: " + operand);
                }
                if (indirectRegisters) {
                    address = this._dereference(address, 0);
                }
                return this._dereference(address, this.#characterCount);
            case 'V':
                return indirectMemory ? this._dereference(operand, this.#characterCount) : operand;
            case 'P':
                if (indirectMemory) {
                    operand = this._dereference(operand, 0);
                }
                return this._dereference(operand, this.#characterCount);
            default:
                throw new InstructionError("Incorrect value type (expected R, A, V or P): " + valueType);
        }
    }

    _dereference(address, characterCount) {
        let addressNumber = this._getValidAddress(address);
        addressNumber = this.#cpu.logicalToPhysicalAddress(addressNumber);
        return this.#memory.getTextAtAddress(addressNumber, characterCount > 0 ? characterCount : CPU.registerSize);
    }

    _setInMemory(address, value, characterCount) {
        let addressNumber = this._getValidAddress(address);
        addressNumber = this.#cpu.logicalToPhysicalAddress(addressNumber);
        this.#memory.setTextAtAddress(addressNumber, typeof(value) == "string" ?
            padWithHaltOrCut(value, characterCount) :
            padOrCutNumber(value, characterCount));
    }

    _getValidAddress(address) {
        if (!isValid(address)) {
            throw new InstructionError("Empty address.");
        }
        let addressNumber = typeof(address) == "string" ? parseInt(address, 10) : address;
        if (isNaN(addressNumber)) {
            throw new InstructionError("Invalid address.");
        }
        return addressNumber;
    }
}
