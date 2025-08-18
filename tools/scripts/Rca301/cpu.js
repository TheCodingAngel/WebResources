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
    static #interruptOffset = 10;
    static #registerMaxIntValue = 9999;
    static #registerDefaultStrValue = "0000";
    static #defaultPointerValue = 0;
    static #invalidPointerValue = -1;
    static #instructionPointerId = "eip";
    static #codeSegmentId = "cs";

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
        [CPU.#codeSegmentId, {value: CPU.#invalidPointerValue}],

        ["eax", {value: CPU.#registerDefaultStrValue}],
        ["ebx", {value: CPU.#registerDefaultStrValue}],
        ["ecx", {value: CPU.#registerDefaultStrValue}],
        ["idt", {value: CPU.#invalidPointerValue}],
    ]);
    
    static registersInfo = new Map([
        ['0', {registerId: CPU.#instructionPointerId, hasSubRegisters: false}],
        ['1', {registerId: "eax", hasSubRegisters: true}],
        ['2', {registerId: "ebx", hasSubRegisters: true}],
        ['3', {registerId: "ecx", hasSubRegisters: true}],
        ['4', {registerId: "esp", hasSubRegisters: false}],
        ['5', {registerId: "ebp", hasSubRegisters: false}],
        ['6', {registerId: "idt", hasSubRegisters: false}],
        ['7', {registerId: CPU.#codeSegmentId, hasSubRegisters: false}],
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

        let instructionAddress = this.logicalToPhysicalAddress(this.getInstructionPointer());
        memory.markAddresses(instructionAddress, CPU.instructionSize, Memory.markType.NextInstruction, true);
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
        
        this.setRegisterValueById(CPU.#codeSegmentId, CPU.#invalidPointerValue);
        this.setInstructionPointer(CPU.#defaultPointerValue);
        
        this.setRegisterValueById("idt", CPU.#invalidPointerValue);
        this.setRegisterValueById("esp", CPU.#invalidPointerValue);
        this.setRegisterValueById("ebp", CPU.#invalidPointerValue);
        
        this.setRegisterValueById("eax", CPU.#registerDefaultStrValue);
        this.setRegisterValueById("ebx", CPU.#registerDefaultStrValue);
        this.setRegisterValueById("ecx", CPU.#registerDefaultStrValue);
    }

    getNextInstruction() {
        let physicalAddress = this.logicalToPhysicalAddress(this.getInstructionPointer());
        return this.#memory.getTextAtAddress(physicalAddress, CPU.instructionSize);
    }
    
    getInstructionPointer() {
        return this.getRegisterValueById(CPU.#instructionPointerId);
    }

    incrementInstructionPointer() {
        return this.setInstructionPointer(this.getInstructionPointer() + CPU.instructionSize);
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
    
    // returns a string value of all registers
    getAllRegisters() {
        let res = "";
        
        for (let i = 0; i < CPU.registersInfo.size; i++) {
            let id = CPU.registersInfo.get(i.toString()).registerId;
            let value = this.getRegisterValueById(id);
            if (this._isGeneralPurposeRegister(id)) {
                res += padWithHaltOrCut(value, CPU.registerSize);
            } else {
                res += padOrCutNumber(value, CPU.registerSize);
            }
        }
        
        res += padOrCutNumber(this.#flags, 2);
        res += padOrCutNumber(this.#control, 2);
        return res;
    }
    
    setAllRegisters(strValues) {
        const flagsChars = 4; // the characters used for this.#flags and this.#control
        let registerItems = Math.floor((strValues.length - flagsChars) / CPU.registerSize);
        for (let i = 0; i < registerItems; i++) {
            let charIndex = i * CPU.registerSize;
            let value = strValues.substring(charIndex, charIndex + CPU.registerSize);
            let id = CPU.registersInfo.get(i.toString()).registerId;
            if (!this._isGeneralPurposeRegister(id)) {
                value = parseIntOrZero(value);
            }
            this.setRegisterValueById(id, value);
        }
        
        let flags = parseIntOrZero(strValues.slice(-4, -2));
        this.setFlags(isMaskSet(flags, CPU.FlagsMask.All, CPU.FlagsMask.Positive),
                      isMaskSet(flags, CPU.FlagsMask.All, CPU.FlagsMask.Negative),
                      isMaskSet(flags, CPU.FlagsMask.All, CPU.FlagsMask.Overflown));
        
        let control = parseIntOrZero(strValues.slice(-2));
        this.setControl(isMaskSet(control, CPU.ControlMask.All, CPU.ControlMask.NegativeDirection),
                        isMaskSet(control, CPU.ControlMask.All, CPU.ControlMask.StepByStep));
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
        return parseIntOrMinusOne(this.getRegisterValueById(CPU.#codeSegmentId));
    }
    
    // the registers should be already saved (this function changes them)
    enterInterrupt(interrupt) {
        let prevCodeSegment = this.getCodeSegment();
        this.setRegisterValueById(CPU.#codeSegmentId, -CPU.#interruptOffset - interrupt);
        if (prevCodeSegment < 0) {
            return;
        }
        
        let esp = this.getStackPointer();
        if (esp >= 0) {
            this.setRegisterValueById("esp", esp + prevCodeSegment);
        }
        
        let ebp = this.getBasePointer();
        if (ebp >= 0) {
            this.setRegisterValueById("ebp", ebp + prevCodeSegment);
        }
    }
    
    // the registers should be already restored (most probaly through setAllRegisters())
    exitInterrupt() {
        // No need to correct pointer registers back to logical addresses.
        // They have been saved and restored together with the CodeSegment register.
    }
    
    // return negative value if not in interrupt
    getCurrentInterrupt() {
        let cs = this.getCodeSegment();
        return cs <= -CPU.#interruptOffset ? -cs - CPU.#interruptOffset : -1;
    }
    
    logicalToPhysicalAddress(address) {
        let cs = this.getCodeSegment();
        return cs < 0 ? address : address + cs;
    }
    
    physicalToLogicalAddress(address) {
        let cs = this.getCodeSegment();
        return cs < 0 ? address : Math.max(0, address - cs);
    }
    
    getStackPointer() {
        return parseIntOrMinusOne(this.getRegisterValueById("esp"));
    }
    
    getBasePointer() {
        return parseIntOrMinusOne(this.getRegisterValueById("ebp"));
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
        return parseIntOrMinusOne(this.getRegisterValueById("idt"));
    }
    
    getIDTSize() {
        return getPropertiesCount(CPU.Interrupts) * CPU.registerSize;
    }
    
    setInterruptData(eax, ebx, ecx) {
        this.setGeneralRegisterValueSafe("eax", eax);
        this.setGeneralRegisterValueSafe("ebx", ebx);
        this.setGeneralRegisterValueSafe("ecx", ecx);
    }
    
    getRegisterValueById(registerId) {
        if (registerId) {
            return this.#registers.get(registerId).value;
        }
        return null;
    }
    
    setGeneralRegisterValueSafe(registerId, value) {
        if (typeof(value) == "number") {
            value = padOrCutNumber(value, CPU.registerSize);
        } else if (typeof(value) == "string") {
            value = padWithHaltOrCut(value, CPU.registerSize)
        } else {
            return;
        }
        this.setRegisterValueById(registerId, value);
    }

    setRegisterValueById(registerId, value) {
        if (registerId) {
            this._setRegisterValue(this.#registers.get(registerId).rowElement, value);
        }
    }

    isOperandInstructionPointer(operand) {
        let registerInfo = CPU.registersInfo.get(operand[2]);
        if (!registerInfo) {
            return false;
        }
        return registerInfo.registerId == CPU.#instructionPointerId;
    }

    getRegisterValueByOperand(operand) {
        let registerInfo = CPU.registersInfo.get(operand[2]);
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
        let registerInfo = CPU.registersInfo.get(operand[2]);
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
            let oldAddress = this.#registers.get(CPU.#instructionPointerId).value;
            this.#memory.markAddresses(this.logicalToPhysicalAddress(oldAddress), CPU.instructionSize, Memory.markType.NextInstruction, false);
            this.#memory.markAddresses(this.logicalToPhysicalAddress(value), CPU.instructionSize, Memory.markType.NextInstruction, true);
        }
        
        if (registerId == CPU.#codeSegmentId) {
            let address = this.getInstructionPointer();
            this.#memory.markAddresses(this.logicalToPhysicalAddress(address), CPU.instructionSize, Memory.markType.NextInstruction, false);
            this.#registers.get(registerId).value = value;
            this.#memory.markAddresses(this.logicalToPhysicalAddress(address), CPU.instructionSize, Memory.markType.NextInstruction, true);
        } else {
            this.#registers.get(registerId).value = value;
        }

        let stringValue = typeof(value) == "string" ? value : padOrCutNumber(value, CPU.registerSize);
        this._updateRegisterView(rowElement, stringValue);

        if (this.#autoScrollToNextInstruction &&
            (registerId == CPU.#instructionPointerId || registerId == CPU.#codeSegmentId)) {
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
        let physicalAddress = this.logicalToPhysicalAddress(this.getInstructionPointer());
        this.#memory.scrollAddressesIntoView(physicalAddress, physicalAddress + CPU.instructionSize - 1);
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
            let isGeneralPurposeRegister = this._isGeneralPurposeRegister(registerId);
            let defaultValue = isGeneralPurposeRegister ? CPU.#registerDefaultStrValue :
                (registerId == CPU.#instructionPointerId ? CPU.#defaultPointerValue : CPU.#invalidPointerValue);
            this._showEditPopup(rowElement, this.getRegisterValueById(registerId), isGeneralPurposeRegister, defaultValue);
            return;
        }

        if (!cell.id) {
            return;
        }

        let cellRect = cell.getBoundingClientRect();
        let value = cell.childNodes[0].nodeValue;
        
        PopupCenter.showNumericPopup(value, 1, 0, 1, cellRect.left, cellRect.top + 3, cellRect.width, newValue => {
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
        for (const registerInfo of CPU.registersInfo.values()) {
            if (registerInfo.registerId == registerId) {
                return registerInfo.hasSubRegisters;
            }
        }
        return true;
    }

    _showEditPopup(rowElement, value, isGeneralPurpose, defaultValue) {
        let startCellRect = rowElement.cells[1].getBoundingClientRect();
        let endCellRect = rowElement.cells[CPU.registerSize].getBoundingClientRect();
        let width = endCellRect.right - startCellRect.left;

        if (isGeneralPurpose) {
            PopupCenter.showTextPopup(value, CPU.registerSize,
                startCellRect.left, startCellRect.top + 3, width, newValue => {
                    cpu.setRegisterValueById(rowElement.cells[0].id, padWithHaltOrCut(newValue, CPU.registerSize));
                });
        } else {
            PopupCenter.showNumericPopup(value, CPU.registerSize, CPU.#invalidPointerValue, CPU.#registerMaxIntValue,
                startCellRect.left, startCellRect.top + 3, width, newValue => {
                    let value = parseIntOrNull(newValue, 10);
                    if (value == null) {
                        value = defaultValue;
                    }
                    cpu.setRegisterValueById(rowElement.cells[0].id, value);
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
