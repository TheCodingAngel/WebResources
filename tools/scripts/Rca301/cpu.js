var cpu;

class CPU {
    #memory;
    #io;

    #registersElement;
    #registerPointersElement;
    #controlElement;
    #flagsElement;

    #autoScrollToNextInstruction = true;

    static registerSize = 4;
    static instructionSize = 10;
    static #registerMaxIntValue = 9999;
    static #registerDefaultStrValue = "0000";
    static #defaultPointerValue = 0;
    static #invalidPointerValue = -1;
    static #instructionPointerId = "eip";

    static #PopupType = {
        Register: 0,
        Flags: 1,
        Control: 2,
    }

    static FlagsMask = {
        None: 0x00,
        Positive: 0x01,
        Negative: 0x02,
        Overflown: 0x04,
        All: 0x07
    }

    static ControlMask = {
        None: 0x00,
        NegativeDirection: 0x01,
        StepByStep: 0x02,
        All: 0x03
    }
    
    // Multiply by 4 to get the address offset
    static Interrupts = {
        DivideByZero: 0,
        InvalidOpcode: 1,
        Halt: 2,
        Breakpoint: 3,
        Teleprinter: 4,
    }

    #registers = new Map([
        [CPU.#instructionPointerId, {value: CPU.#defaultPointerValue}],
        ["esp", {value: CPU.#invalidPointerValue}],
        ["ebp", {value: CPU.#invalidPointerValue}],
        ["cs", {value: CPU.#invalidPointerValue}],

        ["eax", {value: CPU.#registerDefaultStrValue}],
        ["ebx", {value: CPU.#registerDefaultStrValue}],
        ["ecx", {value: CPU.#registerDefaultStrValue}],
        ["idt", {value: CPU.#invalidPointerValue}],
    ]);

    #registersInfo = new Map([
        ['0', {registerId: CPU.#instructionPointerId, hasSubRegisters: false}],
        ['1', {registerId: "eax", hasSubRegisters: true}],
        ['2', {registerId: "ebx", hasSubRegisters: true}],
        ['3', {registerId: "ecx", hasSubRegisters: true}],
        ['4', {registerId: "esp", hasSubRegisters: false}],
        ['5', {registerId: "ebp", hasSubRegisters: false}],
        ['6', {registerId: "idt", hasSubRegisters: false}],
        ['7', {registerId: "cs", hasSubRegisters: false}],
    ]);

    #flags = CPU.FlagsMask.None;
    #control = CPU.ControlMask.None;

    constructor(memory, io, registersElement, registerPointersElement, controlElement, flagsElement, autoScrollToNextInstruction){
        this.#memory = memory;
        this.#io = io;
        this.#registersElement = registersElement;
        this.#registerPointersElement = registerPointersElement;
        this.#controlElement = controlElement;
        this.#flagsElement = flagsElement;

        this.#autoScrollToNextInstruction = autoScrollToNextInstruction;

        this.#registers.forEach( (register, registerId) => {
            register.rowElement = document.getElementById(registerId).parentElement;
            this._updateRegisterView(register.rowElement,
                this._isGeneralPurposeRegister(registerId)
                    ? padWithHaltOrCut(register.value, CPU.registerSize)
                    : padOrCutNumber(register.value, CPU.registerSize));
        });

        memory.markAddresses(this.#registers.get(CPU.#instructionPointerId).value, CPU.instructionSize, Memory.markType.NextInstruction, true);
        CPU._setHtmlRegisterBackground(CPU.#instructionPointerId, Memory.nextInstructionColor);

        this.#registersElement.addEventListener('click', function (e) {
            cpu._onEditRegisterValue(e.target.closest('td'), CPU.#PopupType.Register);
        });

        this.#registerPointersElement.addEventListener('click', function (e) {
            cpu._onEditRegisterValue(e.target.closest('td'), CPU.#PopupType.Register);
        });

        this.#controlElement.addEventListener('click', function (e) {
            cpu._onEditRegisterValue(e.target.closest('td'), CPU.#PopupType.Control);
        });

        this.#flagsElement.addEventListener('click', function (e) {
            cpu._onEditRegisterValue(e.target.closest('td'), CPU.#PopupType.Flags);
        });
    }
    
    reset() {
        this.setFlags(false, false, false);
        this.setControl(false, false);
        
        this.setInstructionPointer(CPU.#defaultPointerValue);
        
        this.setRegisterValueById("idt", CPU.#invalidPointerValue);
        this.setRegisterValueById("esp", CPU.#invalidPointerValue);
        this.setRegisterValueById("ebp", CPU.#invalidPointerValue);
        
        this.setRegisterValueById("eax", CPU.#registerDefaultStrValue);
        this.setRegisterValueById("ebx", CPU.#registerDefaultStrValue);
        this.setRegisterValueById("ecx", CPU.#registerDefaultStrValue);
    }

    getNextInstruction() {
        return this.#memory.getTextAtAddress(this.#registers.get(CPU.#instructionPointerId).value, CPU.instructionSize);
    }
    
    getInstructionPointer() {
        return this.getRegisterValueById(CPU.#instructionPointerId);
    }

    incrementInstructionPointer() {
        this.setInstructionPointer(this.#registers.get(CPU.#instructionPointerId).value + CPU.instructionSize);
    }

    setInstructionPointer(newAddress) {
        this.setRegisterValueById(CPU.#instructionPointerId, newAddress);
    }

    setAutoScrollToNextInstruction(autoScroll) {
        this.#autoScrollToNextInstruction = autoScroll;
        if (autoScroll) {
            this._scrollInstructionIntoView();
        }
    }
    
    getAllRegistersSize() {
        // controls and flags are converted to 2-character values, so together they take 1 register size
        return (this.#registers.size + 1) * CPU.registerSize;
    }
    
    // as a string value
    getAllRegisters() {
        let res = "";
        for (let i = 0; i < this.#registersInfo.size(); i++) {
            let id = this.#registersInfo.get(i).registerId;
            let value = this.getRegisterValueById(id);
            res += value;
        }
        
        res += padOrCutNumber(this.#flags, 2);
        res += padOrCutNumber(this.#control, 2);
        return res;
    }
    
    setAllRegisters(strValues) {
        let items = Math.floor(strValues.length / CPU.registerSize);
        for (let i = 0; i < items - 2; i++) {
            let charIndex = i * CPU.registerSize;
            let value = strValues.substring(charIndex, charIndex + CPU.registerSize);
            let id = this.#registersInfo.get(i).registerId;
            this.setRegisterValueById(id, value);
        }
        
        let flags = parseIntOrZero(strValues.slice(-4, -2));
        setFlags(this.isMaskSet(flags, CPU.FlagsMask.All, CPU.FlagsMask.Positive),
                 this.isMaskSet(flags, CPU.FlagsMask.All, CPU.FlagsMask.Negative),
                 this.isMaskSet(flags, CPU.FlagsMask.All, CPU.FlagsMask.Overflown));
        
        let control = parseIntOrZero(strValues.slice(-2));
        setControl(this.isMaskSet(control, CPU.ControlMask.All, CPU.ControlMask.NegativeDirection),
                   this.isMaskSet(control, CPU.ControlMask.All, CPU.ControlMask.StepByStep));
    }

    setFlags(isPositive, isNegative, isOverflown) {
        this.#flags = this._setMask(this.#flags, CPU.#PopupType.Flags, CPU.FlagsMask.Positive, isPositive);
        this.#flags = this._setMask(this.#flags, CPU.#PopupType.Flags, CPU.FlagsMask.Negative, isNegative);
        this.#flags = this._setMask(this.#flags, CPU.#PopupType.Flags, CPU.FlagsMask.Overflown, isOverflown);
    }

    isFlagsMaskSet(flagsMask) {
        return isMaskSet(this.#flags, CPU.FlagsMask.All, flagsMask);
    }

    setControl(isNegativeDirection, isStepByStep) {
        this.#control = this._setMask(this.#control, CPU.#PopupType.Control, CPU.ControlMask.NegativeDirection, isNegativeDirection);
        this.#control = this._setMask(this.#control, CPU.#PopupType.Control, CPU.ControlMask.StepByStep, isStepByStep);
    }

    isControlSet(controlMask) {
        return isMaskSet(this.#control, CPU.ControlMask.All, controlMask);
    }

    getCustomCounter() {
        return parseIntOrNull(this.getRegisterValueById("ecx"));
    }

    setCustomCounter(value) {
        if (typeof(value) == "number") {
            value = padOrCutNumber(value, CPU.registerSize);
        }
        if (typeof(value) != "string") {
            return false;
        }

        this.setRegisterValueById("ecx", value);
    }
    
    getCodeSegment() {
        return parseIntOrNull(this.getRegisterValueById("cs"));
    }
    
    getStackPointer() {
        return parseIntOrNull(this.getRegisterValueById("esp"));
    }
    
    pushStackPointer(numCharacters) {
        let value = this.getStackPointer();
        if (value < numCharacters) {
            return -1;
        }
        
        value -= numCharacters;
        this.setRegisterValueById("esp", value);
        return value;
    }
    
    popStackPointer(numCharacters) {
        let value = this.getStackPointer();
        if (value >= this.#memory.getCapacity() - numCharacters) {
            return -1;
        }
        
        this.setRegisterValueById("esp", value + numCharacters);
        return value;
    }
    
    getIDT() {
        return parseIntOrNull(this.getRegisterValueById("idt"));
    }
    
    getIDTSize() {
        return getPropertiesCount(CPU.Interrupts) * CPU.registerSize;
    }

    getRegisterValueById(registerId) {
        if (registerId) {
            return this.#registers.get(registerId).value;
        }
        return null;
    }

    setRegisterValueById(registerId, value) {
        if (registerId) {
            this._setRegisterValue(this.#registers.get(registerId).rowElement, value);
        }
    }

    isOperandInstructionPointer(operand) {
        let registerInfo = this.#registersInfo.get(operand[2]);
        if (!registerInfo) {
            return false;
        }
        return registerInfo.registerId == CPU.#instructionPointerId;
    }

    getRegisterValueByOperand(operand) {
        let registerInfo = this.#registersInfo.get(operand[2]);
        if (!registerInfo) {
            return null;
        }

        let value = this.#registers.get(registerInfo.registerId).value;
        if (!registerInfo.hasSubRegisters) {
            return value;
        }

        if (typeof(value) != "string") {
            return null;
        }

        switch (operand[3]) {
            case '1':
                return value[3];
            case '2':
                return value[2];
            case '3':
                return value.substring(2);
            case '4':
                return value;
        }

        return null;
    }

    static getRegisterSizeByOperand(operand) {
        switch (operand[3]) {
            case '1':
                return 1;
            case '2':
                return 1;
            case '3':
                return 2;
            case '4':
                return 4;
        }

        return null;
    }

    setRegisterValueByOperand(operand, value) {
        let registerInfo = this.#registersInfo.get(operand[2]);
        if (!registerInfo) {
            return false;
        }

        if (!registerInfo.hasSubRegisters) {
            this._setRegisterValue(this.#registers.get(registerInfo.registerId).rowElement, value);
            return true;
        }

        if (typeof(value) == "number") {
            value = padOrCutNumber(value, CPU.registerSize);
        }
        if (typeof(value) != "string") {
            return false;
        }

        let registerValue = this.#registers.get(registerInfo.registerId).value;
        switch (operand[3]) {
            case '1':
                registerValue = registerValue.substring(0, 3) + value[value.length-1];
                break;
            case '2':
                registerValue = registerValue.substring(0, 2) + value[value.length-1] + registerValue[3];
                break;
            case '3':
                registerValue = registerValue.substring(0, 2) + padWithHaltOrCut(value.substring(Math.max(value.length-2, 0)), 2);
                break;
            case '4':
                registerValue = padWithHaltOrCut(value, CPU.registerSize);
                break;
            default:
                registerValue = null;
                break;
        }

        if (registerValue == null) {
            return false;
        }

        this._setRegisterValue(this.#registers.get(registerInfo.registerId).rowElement, registerValue);
        return true;
    }

    _setRegisterValue(rowElement, value) {
        let registerId = rowElement.cells[0].id;
        value = typeof(value) == "string" ?
            padWithHaltOrCut(value, CPU.registerSize) :
            CPU._cutNumberToPointer(value);

        if (registerId == CPU.#instructionPointerId) {
            this.#memory.markAddresses(this.#registers.get(CPU.#instructionPointerId).value, CPU.instructionSize, Memory.markType.NextInstruction, false);
            this.#memory.markAddresses(value, CPU.instructionSize, Memory.markType.NextInstruction, true);
        }

        this.#registers.get(registerId).value = value;

        let stringValue = typeof(value) == "string" ? value : padOrCutNumber(value, CPU.registerSize);
        this._updateRegisterView(rowElement, stringValue);

        if (this.#autoScrollToNextInstruction && registerId == CPU.#instructionPointerId) {
            this._scrollInstructionIntoView();
        }
    }
    
    _updateRegisterView(rowElement, stringValue) {
        for (let i = 0; i < CPU.registerSize; i++) {
            // The first row cell is a "header", so data cells start at index 1
            let textNode = rowElement.cells[i+1].childNodes[0];
            textNode.nodeValue = stringValue[i];
        }
    }

    _scrollInstructionIntoView() {
        this.#memory.scrollAddressesIntoView(
            this.#registers.get(CPU.#instructionPointerId).value,
            this.#registers.get(CPU.#instructionPointerId).value + CPU.instructionSize - 1);
    }

    static _setHtmlRegisterBackground(registerId, color) {
        let columnHeader = document.getElementById(registerId);
        if (!columnHeader) {
            return;
        }

        let rowElement = columnHeader.parentElement;
        for (let i = 0; i < CPU.registerSize; i++) {
            // The first row cell is a "header", so data cells start at index 1
            let cell = rowElement.cells[i+1];
            if (color) {
                cell.style.backgroundColor = "#" + color.toString(16).padStart(6, '0');
            } else {
                cell.style.removeProperty("background-color");
            }
        }
    }

    _onEditRegisterValue(cell, popupType) {
        if (!cell) {
            return;
        }

        if (popupType == CPU.#PopupType.Register) {
            let rowElement = cell.parentElement;
            let registerId = rowElement.cells[0].id;
            this._showEditPopup(rowElement, this.getRegisterValueById(registerId), this._isGeneralPurposeRegister(registerId));
            return;
        }

        if (!cell.id) {
            return;
        }

        let cellRect = cell.getBoundingClientRect();
        let value = cell.childNodes[0].nodeValue;
        
        Popups.showNumericPopup(value, 1, 0, 1, cellRect.left, cellRect.top + 3, cellRect.width, newValue => {
            let isSet = parseIntOrZero(newValue) != 0;
            switch (popupType) {
                case CPU.#PopupType.Control:
                    this._setCellFlag(cell, isSet);
                    this.#control = setMask(this.#control, CPU.ControlMask.All, parseIntOrZero(cell.id.substring(1)), isSet);
                    break;
                case CPU.#PopupType.Flags:
                    this._setCellFlag(cell, isSet);
                    this.#flags = setMask(this.#flags, CPU.FlagsMask.All, parseIntOrZero(cell.id.substring(1)), isSet);
                    break;
            }
        });
    }

    _setMask(value, popupType, specificMask, isSet) {
        switch (popupType) {
            case CPU.#PopupType.Control:
                this._setCellFlag(document.getElementById("c" + specificMask), isSet);
                return setMask(value, CPU.ControlMask.All, specificMask, isSet);
            case CPU.#PopupType.Flags:
                this._setCellFlag(document.getElementById("f" + specificMask), isSet);
                return setMask(value, CPU.FlagsMask.All, specificMask, isSet);
        }
        return 0;
    }

    _setCellFlag(cell, isSet) {
        cell.childNodes[0].nodeValue = isSet ? "1" : "0";
    }

    _isGeneralPurposeRegister(registerId) {
        for (const registerInfo of this.#registersInfo.values()) {
            if (registerInfo.registerId == registerId) {
                return registerInfo.hasSubRegisters;
            }
        }
        return true;
    }

    _showEditPopup(rowElement, value, isGeneralPurpose) {
        let startCellRect = rowElement.cells[1].getBoundingClientRect();
        let endCellRect = rowElement.cells[CPU.registerSize].getBoundingClientRect();
        let width = endCellRect.right - startCellRect.left;

        if (isGeneralPurpose) {
            Popups.showTextPopup(value, CPU.registerSize,
                startCellRect.left, startCellRect.top + 3, width, newValue => {
                    cpu.setRegisterValueById(rowElement.cells[0].id, padWithHaltOrCut(newValue, CPU.registerSize));
                });
        } else {
            Popups.showNumericPopup(value, CPU.registerSize, CPU.#invalidPointerValue, CPU.#registerMaxIntValue,
                startCellRect.left, startCellRect.top + 3, width, newValue => {
                    cpu.setRegisterValueById(rowElement.cells[0].id, parseIntOrZero(newValue, 10));
                });
        }
    }

    static _toRegisterString(value) {
        return typeof(value) != "string" ?
            padOrCutNumber(value, CPU.registerSize) :
            padWithHaltOrCut(value, CPU.registerSize);
    }

    static _cutNumberToPointer(value) {
        // address registers use 4 characters even for negative numbers and '-' takes 1 character
        return value >= 0 ? value % 10000 : value % 1000;
    }
}
