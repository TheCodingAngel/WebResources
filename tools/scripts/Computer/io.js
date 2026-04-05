var io;

class IO {
    #memory;
    #cpu;
    
    #isUpdatingMappedMemory;
    #memoryMapping;

    #printer;
    #punchReader;
    #teleprinter;
    #dmaController;
    
    #ignoreSingleNewLines;
    

    static emptyCharacter = "□";
    
    // Multiply by 4 to get the address offset
    static Interrupts = {
        DivideByZero: 0,
        InvalidOpcode: 1,
        Halt: 2,
        Breakpoint: 3,
        Teleprinter: 4,
        DmaFinished: 5,
        Custom: 6,
    }
    
    static #BlockingTraps = [
        // errors
        this.Interrupts.DivideByZero,
        this.Interrupts.InvalidOpcode,
        // breaks
        this.Interrupts.Halt,
        this.Interrupts.Breakpoint,
    ];
    
    static Ports = {
        Printer: 0,
        CardReader: 1,
        Teleprinter: 2,
        
        DmaControl: 3,
        DmaSource: 4,
        DmaDestination: 5,
        DmaCount: 6,
    };

    // we may have unassigned port numbers so use map istead of array
    #devices = new Map([
        [IO.Ports.DmaControl, {
            read: (maxChars) => this.#dmaController.readRegister(DmaController.Registers.Control),
            write: (value, maxChars) => this.#dmaController.writeRegister(DmaController.Registers.Control, value, maxChars),
            hasData : null}],
        
        [IO.Ports.DmaSource, {
            read: (maxChars) => this.#dmaController.readRegister(DmaController.Registers.Source),
            write: (value, maxChars) => this.#dmaController.writeRegister(DmaController.Registers.Source, value, maxChars),
            hasData : null}],
        
        [IO.Ports.DmaDestination, {
            read: (maxChars) => this.#dmaController.readRegister(DmaController.Registers.Destination),
            write: (value, maxChars) => this.#dmaController.writeRegister(DmaController.Registers.Destination, value, maxChars),
            hasData : null}],
        
        [IO.Ports.DmaCount, {
            read: (maxChars) => this.#dmaController.readRegister(DmaController.Registers.Count),
            write: (value, maxChars) => this.#dmaController.writeRegister(DmaController.Registers.Count, value, maxChars),
            hasData : null}],
    ]);

    constructor(memory, cpu, readerElement, ignoreSingleNewLinesCheckbox, writerElement, teleprinterElement) {
        this.#memory = memory;
        this.#cpu = cpu;
        
        this.#printer = new Printer(writerElement);
        this.#punchReader = new CardReader(readerElement);
        this.#teleprinter = new Teleprinter(teleprinterElement);
        
        this.#devices.set(IO.Ports.Printer, this.#printer);
        this.#devices.set(IO.Ports.CardReader, this.#punchReader);
        this.#devices.set(IO.Ports.Teleprinter, this.#teleprinter);
        
        this.#dmaController = new DmaController();
        
        this.#isUpdatingMappedMemory = false;
        this.#memoryMapping = new MemoryMapping(memory, this.#printer, this.#teleprinter, this.#dmaController);
        
        this.#ignoreSingleNewLines = !ignoreSingleNewLinesCheckbox || ignoreSingleNewLinesCheckbox.checked;
    }
    
    static canContinueAfterTrap(interruptNumber) {
        return !this.#BlockingTraps.includes(interruptNumber);
    }
    
    onFlush() {
        this.#memoryMapping.onFlush();
    }
    
    onMemoryRead(startAddress, value) {
        if (!isValid(startAddress)) {
            return;
        }
        this.#memoryMapping.onMemoryRead(startAddress, value);
    }
    
    onMemorySet(startAddress, value) {
        if (this.#isUpdatingMappedMemory || !isValid(startAddress)) {
            return;
        }
        this.#isUpdatingMappedMemory = true;
        this.#memoryMapping.onMemorySet(startAddress, value);
        this.#isUpdatingMappedMemory = false;
    }
    
    onMemoryClear(startAddress, count) {
        if (this.#isUpdatingMappedMemory || !isValid(startAddress)) {
            return;
        }
        this.#isUpdatingMappedMemory = true;
        this.#memoryMapping.onMemoryClear(startAddress, value);
        this.#isUpdatingMappedMemory = false;
    }
    
    onShowConfigurationDialog() {
        this.#memoryMapping.showConfigDialog();
    }
    
    onLoadTextAtStartAddress() {
        if (!this.#ignoreSingleNewLines) {
            this.#memory.onLoadTextAtStartAddress(this.#punchReader.getFullText());
            return;
        }
        
        // Ignore new line characters but treat an empty line as a new line character
        let lines = this.#punchReader.getFullText().split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].length <= 0) {
                lines[i] = "\n";
            }
        }
        this.#memory.onLoadTextAtStartAddress(lines.join(""));
    }
    
    getPunchReader() {
        return this.#punchReader;
    }

    toggleReaderWrap(checkBox) {
        this.#punchReader.setWrapEnabled(checkBox.checked);
    }
    
    toggleIgnoreSingleNewLines(checkBox) {
        this.#ignoreSingleNewLines = checkBox.checked;
    }

    onPrintTextAtSelectedAddresses() {
        let text = this.#memory.onGetTextAtSelectedAddresses();
        this.#printer.write(text, text.length);
    }

    onClearPrintedText() {
        this.#printer.clear();
    }

    onClearTeleprinter() {
        this.#teleprinter.clear();
    }
    
    getPendingHardwareInterrupt() {
        if (this.#teleprinter.hasData()) {
            let handlerAddress = this.getValidInterruptHandler(IO.Interrupts.Teleprinter, true);
            if (!this.isDefaultInterrupt(handlerAddress, IO.Interrupts.Teleprinter)) {
                let _this = this;
                let data = this.#teleprinter.read(CPU.registerSize);
                return new InterruptHandler(IO.Interrupts.Teleprinter, IO.Ports.Teleprinter, handlerAddress,
                    (ih) => _this.#cpu.setInterruptData(data, null, data.length));
            }
        }
        
        return null;
    }
    
    getValidInterruptHandler(interruptNumber, ignoreErrors) {
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
    
    isDefaultInterrupt(handlerAddress, interruptNumber) {
        // Address 0 is the same as the default values so it is not allowed
        // to be the address of a custom interrupt handler.
        let isAddressIncorrect = handlerAddress == null || handlerAddress == 0;
        return isAddressIncorrect || this.#cpu.getCurrentInterrupt() == interruptNumber;
    }
    
    _getInterruptDescriptor(idt, interruptNumber) {
        return this.#memory.getTextAtAddress(idt + interruptNumber * CPU.registerSize, CPU.registerSize);
    }

    readFromPort(port, maxCharCount) {
        let device = this.#devices.get(port);
        if (!device) {
            return null;
        }
        if (!device.read) {
            return 0;
        }
        return maxCharCount > 0 ? device.read(maxCharCount) : "";
    }

    writeToPort(port, value, maxCharCount) {
        let device = this.#devices.get(port);
        if (!device) {
            return null;
        }
        if (!device.write) {
            return -1;
        }
        return maxCharCount > 0 ? device.write(value, maxCharCount) : 0;
    }
    
    isMoreDataOnPort(port) {
        let device = this.#devices.get(port);
        if (!device) {
            return null;
        }
        if (!device.hasData) {
            return false;
        }
        return device.hasData();
    }
}

class InterruptHandler {
    #interrupt;
    #port;
    #handlerAddress;
    #prepareCallback;
    
    constructor(interrupt, port, handlerAddress, prepareCallback) {
        this.#interrupt = interrupt;
        this.#port = port;
        this.#handlerAddress = handlerAddress;
        this.#prepareCallback = prepareCallback;
    }
    
    getInterruptNumber() {
        return this.#interrupt;
    }
    
    prepare() {
        this.#prepareCallback(this);
        return this.#handlerAddress;
    }
}

class MemoryMapping {
    #dialog;
    #memory;
    
    #memoryBuffers = [];
    
    constructor(memory, printer, teleprinter, dmaController) {
        this.#dialog = document.querySelector('.io_config_popup');
        this.#memory = memory;
        
        if (!isValid(this.#dialog)) {
            return;
        }
        
        let _this = this;
        
        document.getElementById('btnIoConfigOK').onclick = () => _this.onOK();
        document.getElementById('btnIoConfigCancel').onclick = () => _this.onCancel();
        
        this.#memoryBuffers = [
            {
                device: printer,
                isInputBuffer: false,
                enableMmio: document.getElementById('enablePrinterMMIO'),
                capacity: Printer.memoryBufferCapacity,
                startAddress: document.getElementById('printerStartAddress'),
                endAddress: document.getElementById('printerEndAddress')
            },
            {
                device: teleprinter,
                isInputBuffer: true,
                enableMmio: document.getElementById('enableTeleprinterInputMMIO'),
                capacity: Teleprinter.inputCapacity,
                startAddress: document.getElementById('teleprinterInputStartAddress'),
                endAddress: document.getElementById('teleprinterInputEndAddress')
            },
            {
                device: teleprinter,
                isInputBuffer: false,
                enableMmio: document.getElementById('enableTeleprinterOuputMMIO'),
                capacity: Teleprinter.printCapacity,
                startAddress: document.getElementById('teleprinterOutputStartAddress'),
                endAddress: document.getElementById('teleprinterOutputEndAddress')
            },
            {
                device: dmaController,
                isInputBuffer: false,
                enableMmio: document.getElementById('enableDmaMMIO'),
                capacity: DmaController.bufferCapacity,
                startAddress: document.getElementById('dmaStartAddress'),
                registers: [
                    {
                        startAddress: document.getElementById('dmaControlStartAddress'),
                        endAddress: document.getElementById('dmaControlEndAddress')
                    },
                    {
                        startAddress: document.getElementById('dmaSourceStartAddress'),
                        endAddress: document.getElementById('dmaSourceEndAddress')
                    },
                    {
                        startAddress: document.getElementById('dmaDestinationStartAddress'),
                        endAddress: document.getElementById('dmaDestinationEndAddress')
                    },
                    {
                        startAddress: document.getElementById('dmaCountStartAddress'),
                        endAddress: document.getElementById('dmaCountEndAddress')
                    },
                ]
            },
        ];
        
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            
            buffer.dataBeforeMapping = "";
            buffer.mappedAddress = 0;
            buffer.isMmioEnabled = buffer.enableMmio.checked;
            buffer.startAddress.disabled = !buffer.isMmioEnabled;
            
            buffer.enableMmio.addEventListener('change', function (e) {
                buffer.startAddress.disabled = !e.target.checked;
            });
            
            buffer.startAddress.addEventListener('input', function (e) {
                _this._onStartAddressChanged(buffer, e.target.value);
            });
        }
    }
    
    showConfigDialog() {
        if (!isValid(this.#dialog)) {
            return;
        }
        
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            buffer.enableMmio.checked = buffer.isMmioEnabled;
            buffer.startAddress.value = buffer.mappedAddress.toString(10);
        }
        
        this.#dialog.classList.add('activeic');
    }
    
    onOK() {
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            this.#memory.markAddresses(buffer.mappedAddress, buffer.capacity, Memory.markType.MmioBuffer, false);
            this.#memory.setReadOnlyCells(buffer.mappedAddress, buffer.capacity, false);
            
            buffer.isMmioEnabled = buffer.enableMmio.checked;
            buffer.mappedAddress = parseIntOrZero(buffer.startAddress.value);
        }
        
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            if (buffer.isMmioEnabled) {
                this.#memory.markAddresses(buffer.mappedAddress, buffer.capacity, Memory.markType.MmioBuffer, true);
                this.#memory.setReadOnlyCells(buffer.mappedAddress, buffer.capacity, buffer.isInputBuffer);
                buffer.dataBeforeMapping = this.#memory.getTextAtAddress(buffer.mappedAddress, buffer.capacity);
                this._forceBufferToMemory(buffer);
            } else {
                this.#memory.setTextAtAddress(buffer.mappedAddress, buffer.dataBeforeMapping);
            }
        }
        
        this._hide();
    }
    
    onCancel() {
        this._hide();
    }
    
    onFlush() {
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            if (buffer.isMmioEnabled && buffer.device.flush) {
                let data = buffer.isInputBuffer ? null :
                    this.#memory.getTextAtAddress(buffer.mappedAddress, buffer.capacity);
                if (buffer.device.flush(data)) {
                    this._forceBufferToMemory(buffer);
                }
            }
        }
    }
    
    _hide() {
        this.#dialog.classList.remove('activeic');
    }
    
    onMemoryRead(startAddress, value) {
    }
    
    onMemorySet(startAddress, value) {
    }
    
    onMemoryClear(startAddress, count) {
    }
    
    _forceBufferToMemory(buffer) {
        this.#memory.setTextAtAddress(buffer.mappedAddress, buffer.isInputBuffer ?
            buffer.device.getInputMemoryBuffer() :
            buffer.device.getOutputMemoryBuffer(), true);
    }
    
    _onStartAddressChanged(buffer, startAddressStr) {
        let newValue = parseIntOrZero(startAddressStr);
        if (buffer.endAddress) {
            buffer.endAddress.value = (newValue + buffer.capacity - 1).toString(10);
        } else if (buffer.registers) {
            for (let i = 0; i < buffer.registers.length; i++) {
                buffer.registers[i].startAddress.value = newValue.toString(10);
                buffer.registers[i].endAddress.value = (newValue + 3).toString(10);
                newValue += 4;
            }
        }
        return newValue;
    }
}

class Printer {
    static memoryBufferCapacity = 10;
    
    #writerElement;
    #emptyBuffer;
    
    constructor(writerElement) {
        this.#writerElement = writerElement;
        this.clear();
    }
    
    clear() {
        this.#writerElement.value = "";
        this.#emptyBuffer = null;
    }
    
    write(value, maxCharCount) {
        this.#writerElement.value += value.substr(0, maxCharCount);
        return 0;
    }
    
    getOutputMemoryBuffer() {
        if (!this.#emptyBuffer) {
            this.#emptyBuffer = "".padEnd(Printer.memoryBufferCapacity, IO.emptyCharacter);
        }
        return this.#emptyBuffer;
    }
    
    updateMemoryBuffer(startMemoryAddress, index, data) {
    }
    
    clearMemoryBuffer(startMemoryAddress, index, count) {
    }
    
    flush(data) {
        if (!data) {
            return false;
        }
        
        data = data.replaceAll(IO.emptyCharacter, "");
        if (!data) {
            return false;
        }
        
        this.#writerElement.value += data;
        return true;
    }
}

class CardReader {
    #readerElement;
    #buffer;
    
    constructor(readerElement) {
        this.#readerElement = readerElement;
        this.#buffer = new ReaderBuffer(readerElement.value);
    }
    
    read(maxCharCount) {
        this.#buffer.resetIfChanged(this.#readerElement.value);
        return this.#buffer.read(maxCharCount);
    }
    
    hasData() {
        return this.#buffer.hasData();
    }
    
    getFullText() {
        return this.#readerElement.value;
    }
    
    setWrapEnabled(isWrapEnabled) {
        if (isWrapEnabled) {
            this.#readerElement.classList.remove('disable-wrap');
        } else {
            this.#readerElement.classList.add('disable-wrap');
        }
    }
    
    selectRange(start, end) {
        this.#readerElement.setSelectionRange(start, end);
        this.#readerElement.focus();
    }
    
    clearRange() {
        this.#readerElement.setSelectionRange(this.#readerElement.selectionStart, this.#readerElement.selectionStart);
    }
}

class Teleprinter {
    static inputCapacity = 10;
    static printCapacity = 10;
    
    #teleprinterElement;
    #buffer;
    
    #inputMemoryBuffer;
    #outputMemoryBuffer;
    
    constructor(teleprinterElement) {
        this.#teleprinterElement = teleprinterElement;
        
        this.#buffer = new CircularBuffer(Teleprinter.inputCapacity);
        this.#inputMemoryBuffer = null;
        this.#outputMemoryBuffer = null;
        
        teleprinterElement.addEventListener('select', function() {
            this.selectionStart = this.value.length;
            this.selectionEnd = this.value.length;
        }, false);
        
        let _this = this;

        teleprinterElement.addEventListener('keydown', function (e) {
            if (e.isComposing || e.keyCode === 229) {
                // Instead of "keydown" we use "input" for software keyboard / IME (Input Method Editor)
                return;
            }
            
            if (Keys.isEscape(e.key)) {
                this.value += "\n";
                _this.#buffer.reset();
                return;
            }

            let char = Teleprinter._getPrintableCharacter(e.key);

            if (Keys.isEnter(e.key)) {
                this.value += "\n";
                _this.#buffer.append("\n");
            } else if (char != null) {
                this.value += char;
                _this.#buffer.append(char);
            }
            
            if (!Keys.isTab(e.key)) {
                e.preventDefault();
            }
        }, false);

        teleprinterElement.addEventListener('keyup', function (e) {
            if (!this.readOnly) {
                return;
            }
            let char = Teleprinter._getPrintableCharacter(e.key);
            if (!Keys.isEnter(e.key) && (char != null) && !Keys.isTab(e.key)) {
                e.preventDefault();
            }
        }, false);
        
        // Handle software keyboard / IME (Input Method Editor)
        teleprinterElement.addEventListener('input', function (e) {
            if (Keys.isEscape(e.data)) {
                this.value += "\n";
                _this.#buffer.reset();
                return;
            }
            
            let char = Teleprinter._getPrintableCharacter(e.data);

            if (Keys.isEnter(e.data)) {
                this.value += "\n";
                _this.#buffer.append("\n");
            } else if (char != null) {
                this.value += char;
                _this.#buffer.append(char);
            }
            
            e.preventDefault();
        }, false);
    }
    
    clear() {
        this.#buffer.reset();
        this.#inputMemoryBuffer = null;
        this.#outputMemoryBuffer = null;
        
        this.#teleprinterElement.value = "";
        this.#teleprinterElement.focus();
    }
    
    read(maxCharCount) {
        maxCharCount = Math.min(maxCharCount, Teleprinter.inputCapacity)
        return this.#buffer.read(maxCharCount);
    }

    write(value, maxCharCount) {
        let max = Math.min(maxCharCount, Teleprinter.printCapacity)
        this.#teleprinterElement.value += value.substr(0, max);
        return maxCharCount - max;
    }
    
    hasData() {
        return this.#buffer.hasData();
    }
    
    getOutputMemoryBuffer() {
        if (!this.#outputMemoryBuffer) {
            this.#outputMemoryBuffer = "".padEnd(Teleprinter.printCapacity, IO.emptyCharacter);
        }
        return this.#outputMemoryBuffer;
    }
    
    getInputMemoryBuffer() {
        if (!this.#inputMemoryBuffer) {
            this.#inputMemoryBuffer = "".padEnd(Teleprinter.inputCapacity, IO.emptyCharacter);
        }
        return this.#inputMemoryBuffer;
    }
    
    readMemoryBuffer(startMemoryAddress, index, data) {
    }
    
    updateMemoryBuffer(startMemoryAddress, index, data) {
    }
    
    clearMemoryBuffer(startMemoryAddress, index, count) {
    }
    
    static _getPrintableCharacter(key) {
        if ((typeof key) != "string") {
            return null;
        }
        
        if (Keys.isSpace(key)) {
            return ' ';
        }
        if (Keys.isBackspace(key)) {
            return '\u25c4';  // ◄
        }
        if (Keys.isDelete(key)) {
            return '\u25cf';  // ●
        }
        //if (Keys.isEscape(key)) {
        //    return '\u02df';  // ˟
        //}
        
        if (Keys.isLeft(key)) {
            return '\u2190';  // ←
        }
        if (Keys.isRight(key)) {
            return '\u2192';  // →
        }
        if (Keys.isUp(key)) {
            return '\u2191';  // ↑
        }
        if (Keys.isDown(key)) {
            return '\u2193';  // ↓
        }
        if (Keys.isHome(key)) {
            return '\u21B6';  // ↶
        }
        if (Keys.isEnd(key)) {
            return '\u21B7';  // ↷
        }
        
        // Control characters contain only letters and numbers
        if (key.length > 1 && /[a-zA-Z0-9]/.test(key)) {
            return null;
        }

        return key.toUpperCase();
    }
}

class DmaController {
    static #registerSize = 4;
    static #controlData = 2;
    
    static Registers = {
        Control: 0,
        Source: 1,
        Destination: 2,
        Count: 3,
    }
    
    static bufferCapacity = getPropertiesCount(DmaController.Registers) * DmaController.#registerSize;
    
    #control = "MM";
    #dataRegisters = [0, 0, 0];
    #memoryBuffer = null;
    
    
    constructor() {
        this.reset();
    }
    
    reset() {
        this.#control = this.#control.substr(0, DmaController.#controlData)
            .padEnd(DmaController.#registerSize, "-");
        this.#dataRegisters.fill(0);
        this.#memoryBuffer = null;
    }
    
    readRegister(registerIndex, maxCharCount) {
        if (registerIndex == DmaController.Registers.Control) {
            return this.#control.substr(0, maxCharCount);
        } else {
            return _getDataRegisterAsString(registerIndex - 1, maxCharCount);
        }
    }
    
    writeRegister(registerIndex, value, maxCharCount) {
        this.#memoryBuffer = null;
        
        if (registerIndex == DmaController.Registers.Control) {
            this.#control = value.substr(0, Math.min(maxCharCount, DmaController.#controlData)) + ">-";
            this._startCopy();
        } else {
            this.#dataRegisters[registerIndex - 1] = this._getRegisterDataFromString(value, maxCharCount);
        }
    }
    
    getOutputMemoryBuffer() {
        if (!this.#memoryBuffer) {
            this.#memoryBuffer = this.#dataRegisters.reduce(
                (str, value) => str + padOrCutNumber(value, DmaController.#registerSize),
                this.#control);
        }
        return this.#memoryBuffer;
    }
    
    updateMemoryBuffer(startMemoryAddress, index, data) {
    }
    
    clearMemoryBuffer(startMemoryAddress, index, count) {
    }
    
    _startCopy() {
        let ioConfig = this.#control.substr(0, DmaController.#controlData);
        switch(ioConfig) {
            case "MM":
                break;
            case "MP":
                break;
            case "PM":
                break;
            case "PP":
                break;
            default:
                throw new InstructionError('The first ("source") and second ("destination") characters of the DMA Control register can be:\n' +
                    "- 'P' - copy using Port I/O, i.e. the corresponding Source / Destination register contains a Port Address;\n" +
                    "- 'M' - copy using Memory I/O, i.e. the corresponding Source / Destination register contains a Memory Address.");
        }
    }
    
    _getDataRegisterAsString(registerIndex, maxCharCount) {
        return padOrCutNumber(this.#dataRegisters[registerIndex],
            Math.min(maxCharCount, DmaController.#registerSize));
    }
    
    _getRegisterDataFromString(value, maxCharCount) {
        let newStringValue = value.substr(0, Math.min(maxCharCount, DmaController.#registerSize));
        return parseIntOrZero(newStringValue, 10);
    }
}
