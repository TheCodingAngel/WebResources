var io;

class IO {
    #memory;
    #cpu;
    
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
        
        this.#dmaController = new DmaController(memory);
        
        this.#memoryMapping = new MemoryMapping(memory, this.#printer, this.#teleprinter, this.#dmaController);
        
        this.#ignoreSingleNewLines = !ignoreSingleNewLinesCheckbox || ignoreSingleNewLinesCheckbox.checked;
    }
    
    static canContinueAfterTrap(interruptNumber) {
        return !this.#BlockingTraps.includes(interruptNumber);
    }
    
    EnableMemoryNotifications() {
        this.#memoryMapping.EnableMemoryNotifications();
    }
    
    DisableMemoryNotifications() {
        this.#memoryMapping.DisableMemoryNotifications();
    }
    
    onFlush() {
        this.#memoryMapping.onFlush();
    }
    
    onMemoryRead(startAddress, value) {
        if (isValid(startAddress)) {
            this.#memoryMapping.onMemoryRead(startAddress, value);
        }
    }
    
    onMemoryChanged(startAddress, value) {
        if (isValid(startAddress)) {
            this.#memoryMapping.onMemoryChanged(startAddress, value);
        }
    }
    
    onMemoryZeroed(startAddress, count) {
        if (isValid(startAddress)) {
            this.#memoryMapping.onMemoryZeroed(startAddress, count);
        }
    }
    
    onShowConfigurationDialog() {
        this.#memoryMapping.showConfigDialog();
    }
    
    onLoadTextAtStartAddress() {
        if (!this.#ignoreSingleNewLines) {
            try {
                this.#memoryMapping.DisableMemoryNotifications();
                this.#memory.onLoadTextAtStartAddress(this.#punchReader.getFullText());
            } finally {
                this.#memoryMapping.EnableMemoryNotifications();
            }
            return;
        }
        
        // Ignore new line characters but treat an empty line as a new line character
        let lines = this.#punchReader.getFullText().split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].length <= 0) {
                lines[i] = "\n";
            }
        }
        
        try {
            this.#memoryMapping.DisableMemoryNotifications();
            this.#memory.onLoadTextAtStartAddress(lines.join(""));
        } finally {
            this.#memoryMapping.EnableMemoryNotifications();
        }
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
        try {
            this.#memoryMapping.DisableMemoryNotifications();
            let text = this.#memory.onGetTextAtSelectedAddresses();
            this.#printer.write(text, text.length);
        } finally {
            this.#memoryMapping.EnableMemoryNotifications();
        }
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
                    (ih) => _this.#cpu.setInterruptData(data, null, data.length, null));
            }
        }
        
        if (this.#dmaController.hasData()) {
            let handlerAddress = this.getValidInterruptHandler(IO.Interrupts.DmaFinished, true);
            if (!this.isDefaultInterrupt(handlerAddress, IO.Interrupts.DmaFinished)) {
                let _this = this;
                let data = this.#dmaController.getParameters();
                return new InterruptHandler(IO.Interrupts.DmaFinished, IO.Ports.DmaControl, handlerAddress,
                    (ih) => _this.#cpu.setInterruptData(data[1], data[2], data[3], data[0]));
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
        try {
            this.#memoryMapping.DisableMemoryNotifications();
            return this.#memory.getTextAtAddress(idt + interruptNumber * CPU.registerSize, CPU.registerSize);
        } finally {
            this.#memoryMapping.EnableMemoryNotifications();
        }
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
    
    isInMappedBuffer(address) {
        return this.#memoryMapping ? this.#memoryMapping.isInMappedBuffer(address) : false;
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
    
    #ignoreMemoryNotifications;
    #memoryBuffers = [];
    
    constructor(memory, printer, teleprinter, dmaController) {
        this.#dialog = document.querySelector('.io_config_popup');
        this.#memory = memory;
        this.#ignoreMemoryNotifications = 0;
        
        if (!isValid(this.#dialog)) {
            return;
        }
        
        let _this = this;
        
        document.getElementById('btnIoConfigOK').onclick = () => _this.onOK();
        document.getElementById('btnIoConfigCancel').onclick = () => _this.onCancel();
        
        this.#memoryBuffers = [
            {
                device: printer,
                isReadOnly: false,
                enableMmio: document.getElementById('enablePrinterMMIO'),
                capacity: Printer.memoryBufferCapacity,
                startAddress: document.getElementById('printerStartAddress'),
                endAddress: document.getElementById('printerEndAddress')
            },
            {
                device: teleprinter,
                isReadOnly: true,
                enableMmio: document.getElementById('enableTeleprinterInputMMIO'),
                capacity: Teleprinter.inputCapacity,
                startAddress: document.getElementById('teleprinterInputStartAddress'),
                endAddress: document.getElementById('teleprinterInputEndAddress')
            },
            {
                device: teleprinter,
                isReadOnly: false,
                enableMmio: document.getElementById('enableTeleprinterOuputMMIO'),
                capacity: Teleprinter.printCapacity,
                startAddress: document.getElementById('teleprinterOutputStartAddress'),
                endAddress: document.getElementById('teleprinterOutputEndAddress')
            },
            {
                device: dmaController,
                isReadOnly: false,
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
            
            buffer.device.setBufferChangedCallback(buffer.isReadOnly,
                (isReadOnly, data) => _this._forceBufferToMemory(buffer, isReadOnly, data));
            
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
            
            buffer.startAddress.disabled = !buffer.isMmioEnabled;
            this._onStartAddressChanged(buffer, buffer.startAddress.value);
        }
        
        this.#dialog.classList.add('activeic');
    }
    
    onOK() {
        let mmioBufferRanges = [];
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            if (buffer.enableMmio.checked) {
                let bufferRange = this._getBufferRange(buffer);
                if (this._intersectsWith(bufferRange, mmioBufferRanges)) {
                    alert("The memory mapped buffers must not intersect!");
                    return;
                }
                mmioBufferRanges.push(bufferRange);
            }
        }
        
        try {
            this.DisableMemoryNotifications();
            
            for (let i = 0; i < this.#memoryBuffers.length; i++) {
                let buffer = this.#memoryBuffers[i];
                
                this.#memory.markAddresses(buffer.mappedAddress, buffer.capacity, Memory.markType.MmioBuffer, false);
                this.#memory.setReadOnlyCells(buffer.mappedAddress, buffer.capacity, false);
                
                if (buffer.dataBeforeMapping) {
                    this.#memory.setTextAtAddress(buffer.mappedAddress, buffer.dataBeforeMapping);
                    buffer.dataBeforeMapping = "";
                }
                
                buffer.isMmioEnabled = buffer.enableMmio.checked;
                buffer.mappedAddress = parseIntOrZero(buffer.startAddress.value);
            }
            
            for (let i = 0; i < this.#memoryBuffers.length; i++) {
                let buffer = this.#memoryBuffers[i];
                if (buffer.isMmioEnabled) {
                    this.#memory.markAddresses(buffer.mappedAddress, buffer.capacity, Memory.markType.MmioBuffer, true);
                    buffer.dataBeforeMapping = this.#memory.getTextAtAddress(buffer.mappedAddress, buffer.capacity);
                    buffer.device.onMmioEnabled(buffer.isReadOnly);
                } else {
                    buffer.device.onMmioDisabled(buffer.isReadOnly);
                }
            }
        } finally {
            this.EnableMemoryNotifications();
        }
        
        this._hide();
    }
    
    onCancel() {
        this._hide();
    }
    
    _hide() {
        this.#dialog.classList.remove('activeic');
    }
    
    onFlush() {
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            if (buffer.isMmioEnabled && buffer.device.flush) {
                let data = null;
                try {
                    this.DisableMemoryNotifications();
                    if (!buffer.isReadOnly) {
                        data = this.#memory.getTextAtAddress(buffer.mappedAddress, buffer.capacity);
                    }
                } finally {
                    this.EnableMemoryNotifications();
                }
                buffer.device.flush(data);
            }
            if (!buffer.isMmioEnabled && buffer.device.flushNoMmio) {
                buffer.device.flushNoMmio();
            }
        }
    }
    
    EnableMemoryNotifications() {
        this.#ignoreMemoryNotifications--;
    }
    
    DisableMemoryNotifications() {
        this.#ignoreMemoryNotifications++;
    }
    
    onMemoryRead(startAddress, value) {
        if (this.#ignoreMemoryNotifications > 0) {
            return;
        }
        
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            if (buffer.isMmioEnabled && buffer.isReadOnly && buffer.device.onMemoryRead) {
                let section = this._getSection(startAddress, value.length, buffer);
                if (section.isValid) {
                    buffer.device.onMemoryRead(section.indexInBuffer, section.indexAfterEnd);
                }
            }
        }
    }
    
    onMemoryChanged(startAddress, value) {
        if (this.#ignoreMemoryNotifications > 0) {
            return;
        }
        
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            if (buffer.isMmioEnabled && buffer.device.onMemoryChanged) {
                let section = this._getSection(startAddress, value.length, buffer);
                if (section.isValid) {
                    buffer.device.onMemoryChanged(section.indexInBuffer, section.indexAfterEnd);
                }
            }
        }
    }
    
    onMemoryZeroed(startAddress, count) {
        if (this.#ignoreMemoryNotifications > 0) {
            return;
        }
        
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            if (buffer.isMmioEnabled && buffer.device.onMemoryZeroed) {
                let section = this._getSection(startAddress, count, buffer);
                if (section.isValid) {
                    buffer.device.onMemoryZeroed(section.indexInBuffer, section.indexAfterEnd);
                }
            }
        }
    }
    
    isInMappedBuffer(address) {
        for (let i = 0; i < this.#memoryBuffers.length; i++) {
            let buffer = this.#memoryBuffers[i];
            if (buffer.isMmioEnabled && address >= buffer.mappedAddress &&
                address < buffer.mappedAddress + buffer.capacity) {
                return true;
            }
        }
        return false;
    }
    
    _forceBufferToMemory(buffer, isReadOnly, data) {
        if (isValid(isReadOnly)) {
            buffer.isReadOnly = isReadOnly;
            if (buffer.isMmioEnabled) {
                this.#memory.setReadOnlyCells(buffer.mappedAddress, buffer.capacity, buffer.isReadOnly);
            }
        }
        
        if (!buffer.isMmioEnabled) {
            return;
        }
        
        try {
            this.DisableMemoryNotifications();
            this.#memory.setTextAtAddress(buffer.mappedAddress, data, true);
        } finally {
            this.EnableMemoryNotifications();
        }
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
    
    _getSection(memoryAddress, dataSize, buffer) {
        let indexInBuffer = Math.max(memoryAddress, buffer.mappedAddress) - buffer.mappedAddress;
        let indexAfterEnd = Math.min(memoryAddress + dataSize - buffer.mappedAddress, buffer.capacity);
        return {
            isValid: indexAfterEnd > indexInBuffer && indexInBuffer < buffer.capacity,
            indexInBuffer: indexInBuffer,
            indexAfterEnd: indexAfterEnd,
        };
    }
    
    _intersectsWith(bufferRange, mmioBufferRanges) {
        for (const br of mmioBufferRanges) {
            if (bufferRange.startAddress >= br.startAddress && bufferRange.startAddress <= br.endAddress) {
                return true;
            }
            if (bufferRange.endAddress >= br.startAddress && bufferRange.endAddress <= br.endAddress) {
                return true;
            }
        }
        return false;
    }
    
    _getBufferRange(buffer) {
        let startAddress = parseIntOrZero(buffer.startAddress.value);
        return {startAddress: startAddress, endAddress: startAddress + buffer.capacity - 1};
    }
}

class Printer {
    static memoryBufferCapacity = 10;
    
    #writerElement;
    #emptyBuffer;
    #bufferChangedCallback;
    
    constructor(writerElement) {
        this.#writerElement = writerElement;
        this.#emptyBuffer = null;
        this.clear();
    }
    
    clear() {
        this._onBufferChanged();
        this.#writerElement.value = "";
    }
    
    setBufferChangedCallback(isReadOnly, callback) {
        this.#bufferChangedCallback = callback;
    }
    
    onMmioEnabled(isReadOnly) {
        this._onBufferChanged();
    }
    
    onMmioDisabled(isReadOnly) {
        this.#emptyBuffer = null;
    }
    
    write(value, maxCharCount) {
        this.#writerElement.value += value.substring(0, maxCharCount);
        return Math.max(0, maxCharCount - value.length);
    }
    
    flush(data) {
        if (!data) {
            return;
        }
        
        data = data.replaceAll(IO.emptyCharacter, "");
        if (!data) {
            return;
        }
        
        this.#writerElement.value += data; // "print" the data
        this._onBufferChanged();
    }
    
    _getEmptyBuffer() {
        if (!this.#emptyBuffer) {
            this.#emptyBuffer = "".padEnd(Printer.memoryBufferCapacity, IO.emptyCharacter);
        }
        return this.#emptyBuffer;
    }
    
    _onBufferChanged() {
        if (this.#bufferChangedCallback) {
            this.#bufferChangedCallback(null, this._getEmptyBuffer());
        }
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
    #inputChangedCallback;
    #outputChangedCallback;
    
    #inputBuffer;
    #emptyBuffer;
    
    constructor(teleprinterElement) {
        this.#teleprinterElement = teleprinterElement;
        
        this.#inputBuffer = new CircularBuffer(Teleprinter.inputCapacity);
        this.#emptyBuffer = null;
        
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
                _this.#inputBuffer.reset();
                _this._onInputBufferChanged(null);
                return;
            }

            let char = Teleprinter._getPrintableCharacter(e.key);

            if (Keys.isEnter(e.key)) {
                this.value += "\n";
                _this.#inputBuffer.append("\n");
                _this._onInputBufferChanged(null);
            } else if (char != null) {
                this.value += char;
                _this.#inputBuffer.append(char);
                _this._onInputBufferChanged(null);
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
                _this.#inputBuffer.reset();
                _this._onInputBufferChanged(null);
                return;
            }
            
            let char = Teleprinter._getPrintableCharacter(e.data);

            if (Keys.isEnter(e.data)) {
                this.value += "\n";
                _this.#inputBuffer.append("\n");
                _this._onInputBufferChanged(null);
            } else if (char != null) {
                this.value += char;
                _this.#inputBuffer.append(char);
                _this._onInputBufferChanged(null);
            }
            
            e.preventDefault();
        }, false);
    }
    
    clear() {
        this.#inputBuffer.reset();
        this._onInputBufferChanged(null);
        this._onOutputBufferChanged();
        this.#emptyBuffer = null;
        
        this.#teleprinterElement.value = "";
        this.#teleprinterElement.focus();
    }
    
    setBufferChangedCallback(isReadOnly, callback) {
        if (isReadOnly) {
            this.#inputChangedCallback = callback;
        } else {
            this.#outputChangedCallback = callback;
        }
    }
    
    onMmioEnabled(isReadOnly) {
        if (isReadOnly) {
            this._onInputBufferChanged(true);
        } else {
            this._onOutputBufferChanged();
        }
    }
    
    onMmioDisabled(isReadOnly) {
        this.#emptyBuffer = null;
    }
    
    read(maxCharCount) {
        maxCharCount = Math.min(maxCharCount, Teleprinter.inputCapacity)
        let res = this.#inputBuffer.read(maxCharCount);
        this._onInputBufferChanged(null);
        return res;
    }

    write(value, maxCharCount) {
        let capacity = Math.min(maxCharCount, Teleprinter.printCapacity)
        this.#teleprinterElement.value += value.substring(0, capacity);
        return Math.max(0, maxCharCount - Math.min(capacity, value.length));
    }
    
    hasData() {
        return this.#inputBuffer.hasData();
    }
    
    onMemoryRead(indexInBuffer, indexAfterEnd) {
        if (this.#inputBuffer.hasData()) {
            this.#inputBuffer.remove(indexInBuffer, indexAfterEnd);
            this._onInputBufferChanged(null);
        }
    }
    
    flush(data) {
        if (!data) {
            return;
        }
        
        data = data.replaceAll(IO.emptyCharacter, "");
        if (!data) {
            return;
        }
        
        this.#teleprinterElement.value += data; // "print" the data
        this._onOutputBufferChanged();
    }
    
    _getEmptyBuffer() {
        if (!this.#emptyBuffer) {
            this.#emptyBuffer = "".padEnd(Teleprinter.printCapacity, IO.emptyCharacter);
        }
        return this.#emptyBuffer;
    }
    
    _getInputMemoryBuffer() {
        return this.#inputBuffer.getEntireData().padEnd(Teleprinter.inputCapacity, IO.emptyCharacter);
    }
    
    _onInputBufferChanged(isReadOnly) {
        if (this.#inputChangedCallback) {
            this.#inputChangedCallback(isReadOnly, this._getInputMemoryBuffer());
        }
    }
    
    _onOutputBufferChanged() {
        if (this.#outputChangedCallback) {
            this.#outputChangedCallback(null, this._getEmptyBuffer());
        }
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
    static #statusDefault = "-";
    static #statusProgress = ">";
    
    static Registers = {
        Control: 0,
        Source: 1,
        Destination: 2,
        Count: 3,
    }
    
    static Status = {
        Idle: 0,
        Pending: 1,
        Copy: 2,
    }
    
    static bufferCapacity = getPropertiesCount(DmaController.Registers) * DmaController.#registerSize;
    
    #memory;
    #memoryBuffer;
    #bufferChangedCallback;
    
    #control = "MM";
    #dataRegisters = [0, 0, 0];
    #status;
    #executeInterrupt;
    
    #inverseDirection;
    #initialDataRegisters = [0, 0, 0];
    
    
    constructor(memory) {
        this.#memory = memory;
        this._reset();
    }
    
    _reset() {
        this.#memoryBuffer = null;
        
        this.#control = this.#control.substring(0, DmaController.#controlData)
            .padEnd(DmaController.#registerSize, DmaController.#statusDefault);
        this.#dataRegisters.fill(0);
        this.#status = DmaController.Status.Idle;
        this.#executeInterrupt = false;
        
        this.#inverseDirection = false;
        this.#initialDataRegisters.fill(0);
    }
    
    setBufferChangedCallback(isReadOnly, callback) {
        this.#bufferChangedCallback = callback;
    }
    
    onMmioEnabled(isReadOnly) {
        this._onBufferChanged(isReadOnly);
    }
    
    onMmioDisabled(isReadOnly) {
        this.#memoryBuffer = null;
    }
    
    readRegister(registerIndex, maxCharCount) {
        if (registerIndex == DmaController.Registers.Control) {
            return this.#control.substring(0, maxCharCount);
        } else {
            return _getDataRegisterAsString(registerIndex - 1, maxCharCount);
        }
    }
    
    writeRegister(registerIndex, value, maxCharCount) {
        this.#memoryBuffer = null;
        
        let capacity = Math.min(maxCharCount, DmaController.#registerSize);
        if (registerIndex == DmaController.Registers.Control) {
            this.#control = value.substring(0, capacity)
                .padEnd(DmaController.#registerSize, DmaController.#statusDefault);
            let ioConfig = this.#control.substring(0, DmaController.#controlData);
            if (this._shouldStartCopy(ioConfig)) {
                this.#status = DmaController.Status.Pending;
            } else {
                throw new InstructionError('The first ("source") and second ("destination") characters of the DMA Control register can be:\n' +
                    "- 'P' - copy using Port I/O, i.e. the corresponding Source / Destination register contains a Port Address;\n" +
                    "- 'M' - copy using Memory I/O, i.e. the corresponding Source / Destination register contains a Memory Address.");
            }
            
            this._onBufferChanged(null);
            return maxCharCount - capacity;
        }
        
        this.#dataRegisters[registerIndex - 1] = this._getRegisterDataFromString(value, maxCharCount);
        this._onBufferChanged(null);
        return Math.max(0, maxCharCount - Math.min(capacity, value.length));
    }
    
    hasData() {
        let result = this.#executeInterrupt;
        this.#executeInterrupt = false;
        return result;
    }
    
    getParameters() {
        return [this.#control].concat(this.#initialDataRegisters);
    }
    
    onMemoryChanged(indexInBuffer, indexAfterEnd) {
        if (this.#status == DmaController.Status.Idle && this._isControlRegister(indexInBuffer, indexAfterEnd)) {
            this.#status = DmaController.Status.Pending;
        }
    }
    
    flush(data) {
        if (this.#status == DmaController.Status.Idle) {
            return;
        }
        
        this.#memoryBuffer = null;
        let makeBufferReadOnly = null;
        this.#executeInterrupt = false;
        
        if (this.#status == DmaController.Status.Pending) {
            if (!data) {
                this.#status = DmaController.Status.Idle;
                return;
            }
            
            this.#control = data.substring(0, DmaController.#registerSize);
            
            let ioConfig = this.#control.substring(0, DmaController.#controlData);
            if (!this._shouldStartCopy(ioConfig)) {
                this.#status = DmaController.Status.Idle;
                return;
            }
            
            let startIndex = 0;
            for (let i = 0; i < this.#dataRegisters.length; i++) {
                startIndex += DmaController.#registerSize;
                let endIndex = startIndex + DmaController.#registerSize;
                
                let value = this._getRegisterDataFromString(data.substring(startIndex, endIndex),
                    DmaController.#registerSize);
                
                this.#dataRegisters[i] = value;
                this.#initialDataRegisters[i] = value;
            }
            
            this.#status = DmaController.Status.Copy;
            this._setStatusProgress();
            makeBufferReadOnly = true;
        }
        
        if (this.#status == DmaController.Status.Copy) {
            if (!this._copyNextData(makeBufferReadOnly === true)) {
                this.#status = DmaController.Status.Idle;
                this._clearStatusProgress();
                this.#executeInterrupt = true;
                this.#inverseDirection = false;
                makeBufferReadOnly = false;
            }
            
            this._onBufferChanged(makeBufferReadOnly);
        }
    }
    
    flushNoMmio() {
        if (this.#status != DmaController.Status.Idle) {
            this.flush(this.#status == DmaController.Status.Pending ? this._getMemoryBuffer() : 0);
        }
    }
    
    _onBufferChanged(isReadOnly) {
        if (this.#bufferChangedCallback) {
            this.#bufferChangedCallback(isReadOnly, this._getMemoryBuffer());
        }
    }
    
    _getMemoryBuffer() {
        if (!this.#memoryBuffer) {
            this.#memoryBuffer = this.#dataRegisters.reduce(
                (str, value) => str + padOrCutNumber(value, DmaController.#registerSize),
                this.#control);
        }
        return this.#memoryBuffer;
    }
    
    _shouldStartCopy(ioConfig) {
        switch(ioConfig) {
            case "MM":
                return true;
            case "MP":
                return true;
            case "PM":
                return true;
            case "PP":
                return true;
        }
        return false;
    }
    
    _copyNextData(isFirstCopy) {
        let ioConfig = this.#control.substring(0, DmaController.#controlData);
        let isSourceMemory = ioConfig[0] == "M";
        let isDestinationMemory = ioConfig[1] == "M";
        
        let source = this.#dataRegisters[DmaController.Registers.Source - 1];
        let destination = this.#dataRegisters[DmaController.Registers.Destination - 1];
        let count = this.#dataRegisters[DmaController.Registers.Count - 1];
        
        if (count <= 0 || destination == source) {
            this.#dataRegisters[DmaController.Registers.Count - 1] = 0;
            return false;
        }
        
        let isSourceMapped = io.isInMappedBuffer(source);
        let isDestinationMapped = io.isInMappedBuffer(destination);
        
        
        if (isFirstCopy) {
            this.#inverseDirection = isSourceMemory && isDestinationMemory &&
                destination > source && destination < source + count;
            if (this.#inverseDirection) {
                source += count;
                destination += count;
            }
        }
        
        let data = null;
        let chunk = Math.min(count, DmaController.#registerSize);
        
        if (isSourceMemory) {
            if (this.#inverseDirection) {
                data = this.#memory.getTextAtAddress(source - chunk, chunk);
                if (!isSourceMapped) {
                    this.#dataRegisters[DmaController.Registers.Source - 1] = source - chunk;
                }
            } else {
                data = this.#memory.getTextAtAddress(source, chunk);
                if (!isSourceMapped) {
                    this.#dataRegisters[DmaController.Registers.Source - 1] = source + chunk;
                }
            }
            if (isSourceMapped) {
                data = data.replaceAll(IO.emptyCharacter, "");
            }
        } else {
            data = io.readFromPort(source, chunk);
            if (data === null || data === 0) {
                return false;
            }
        }
        
        if (isDestinationMemory) {
            chunk = data.length;
            try {
                io.DisableMemoryNotifications();
                
                if (this.#inverseDirection) {
                    this.#memory.setTextAtAddress(destination - chunk, data);
                    if (!isDestinationMapped) {
                        this.#dataRegisters[DmaController.Registers.Destination - 1] = destination - chunk;
                    }
                } else {
                    this.#memory.setTextAtAddress(destination, data);
                    if (!isDestinationMapped) {
                        this.#dataRegisters[DmaController.Registers.Destination - 1] = destination + chunk;
                    }
                }
            } finally {
                io.EnableMemoryNotifications();
            }
        } else {
            chunk -= io.writeToPort(destination, data, chunk);
        }
        
        this.#dataRegisters[DmaController.Registers.Count - 1] = count - chunk;
        return count > chunk;
    }
    
    _getDataRegisterAsString(registerIndex, maxCharCount) {
        return padOrCutNumber(this.#dataRegisters[registerIndex],
            Math.min(maxCharCount, DmaController.#registerSize));
    }
    
    _getRegisterDataFromString(value, maxCharCount) {
        let newStringValue = value.substring(0, Math.min(maxCharCount, DmaController.#registerSize));
        return parseIntOrZero(newStringValue, 10);
    }
    
    _setStatusProgress(isInProgress) {
        let ioConfig = this.#control.substring(0, DmaController.#controlData);
        this.#control = (ioConfig + DmaController.#statusProgress)
            .padEnd(DmaController.#registerSize, DmaController.#statusDefault);
    }
    
    _clearStatusProgress(isInProgress) {
        this.#control = this.#control.substring(0, DmaController.#controlData)
            .padEnd(DmaController.#registerSize, DmaController.#statusDefault);
    }
    
    _isControlRegister(indexInBuffer, indexAfterEnd) {
        return indexInBuffer >= 0 && indexInBuffer < 2 && indexAfterEnd > indexInBuffer;
    }
}
