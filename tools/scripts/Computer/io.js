var io;

class IO {
    #memory;

    #readerElement;
    #writerElement;
    #teleprinterElement;

    #punchReader;
    #teleprinter;
    
    #ignoreSingleNewLines;

    static #teleprinterInputCapacity = 80;
    static #teleprinterPrintCapacity = 80;

    // we may have unassigned port numbers so use map istead of array
    #devices = new Map([
        [0, {read: null,                             write: this._print.bind(this),            hasData : null}],
        [1, {read: this._readPunch.bind(this),       write: null,                              hasData : this._isPunchReady.bind(this)}],
        [2, {read: this._readTeleprinter.bind(this), write: this._printTeleprinter.bind(this), hasData : this._isTeleprinterReady.bind(this)}],
        [3, {read: this._readFile.bind(this),        write: this._writeFile.bind(this),        hasData : this._isFileReady.bind(this)}],
    ]);

    constructor(memory, readerElement, ignoreSingleNewLinesCheckbox, writerElement, teleprinterElement) {
        this.#memory = memory;

        this.#readerElement = readerElement;
        this.#writerElement = writerElement;
        this.#teleprinterElement = teleprinterElement;

        this.#punchReader = new ReaderBuffer(readerElement.value);
        this.#teleprinter = new CircularBuffer(IO.#teleprinterInputCapacity);
        
        this.#ignoreSingleNewLines = !ignoreSingleNewLinesCheckbox || ignoreSingleNewLinesCheckbox.checked;

        teleprinterElement.addEventListener('select', function() {
            this.selectionStart = this.value.length;
            this.selectionEnd = this.value.length;
        }, false);

        teleprinterElement.addEventListener('keydown', function (e) {
            if (e.isComposing || e.keyCode === 229) {
                // Instead of "keydown" we use "input" for software keyboard / IME (Input Method Editor)
                return;
            }
            
            if (Keys.isEscape(e.key)) {
                this.value += "\n";
                io.#teleprinter.reset();
                return;
            }

            let char = IO._getTeleprinterCharacter(e.key);

            if (Keys.isEnter(e.key)) {
                this.value += "\n";
                io.#teleprinter.append("\n");
            } else if (char != null) {
                this.value += char;
                io.#teleprinter.append(char);
            }
            
            if (!Keys.isTab(e.key)) {
                e.preventDefault();
            }
        }, false);

        teleprinterElement.addEventListener('keyup', function (e) {
            if (!this.readOnly) {
                return;
            }
            let char = IO._getTeleprinterCharacter(e.key);
            if (!Keys.isEnter(e.key) && (char != null) && !Keys.isTab(e.key)) {
                e.preventDefault();
            }
        }, false);
        
        // Handle software keyboard / IME (Input Method Editor)
        teleprinterElement.addEventListener('input', function (e) {
            let char = IO._getTeleprinterCharacter(e.data);

            if (Keys.isEnter(e.data)) {
                io.#teleprinter.append("\n");
                this.value = io.#teleprinter.getValue();
            } else if (char != null) {
                io.#teleprinter.append(char);
                this.value = io.#teleprinter.getValue();
            }
            
            e.preventDefault();
        }, false);
    }

    onLoadTextAtStartAddress() {
        if (!this.#ignoreSingleNewLines) {
            this.#memory.onLoadTextAtStartAddress(this.#readerElement.value);
            return;
        }
        
        // Ignore new line characters but treat an empty line as a new line character
        let lines = this.#readerElement.value.split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].length <= 0) {
                lines[i] = "\n";
            }
        }
        this.#memory.onLoadTextAtStartAddress(lines.join(""));
    }
    
    getPunchReader() {
        return this.#readerElement;
    }

    toggleReaderWrap(checkBox) {
        if (checkBox.checked) {
            this.#readerElement.classList.remove('disable-wrap');
        } else {
            this.#readerElement.classList.add('disable-wrap');
        }
    }
    
    toggleIgnoreSingleNewLines(checkBox) {
        this.#ignoreSingleNewLines = checkBox.checked;
    }

    onPrintTextAtSelectedAddresses() {
        let text = this.#memory.onGetTextAtSelectedAddresses();
        this.#writerElement.value += text;
    }

    onClearPrintedText() {
        this.#writerElement.value = "";
    }

    onClearTeleprinter() {
        this.#teleprinter.reset();
        this.#teleprinterElement.value = "";
        this.#teleprinterElement.focus();
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

    _readPunch(maxCharCount) {
        this.#punchReader.resetIfChanged(this.#readerElement.value);
        return this.#punchReader.read(maxCharCount);
    }
    
    _isPunchReady() {
        return this.#punchReader.hasData();
    }

    _print(value, maxCharCount) {
        // no printing limit
        this.#writerElement.value += value.substring(0, maxCharCount);
        return 0;
    }

    _readTeleprinter(maxCharCount) {
        maxCharCount = Math.min(maxCharCount, IO.#teleprinterInputCapacity)
        return this.#teleprinter.read(maxCharCount);
    }

    _printTeleprinter(value, maxCharCount) {
        let max = Math.min(maxCharCount, IO.#teleprinterPrintCapacity)
        this.#teleprinterElement.value += value.substring(0, max);
        return maxCharCount - max;
    }
    
    _isTeleprinterReady() {
        return this.#teleprinter.hasData();
    }

    _readFile(maxCharCount) {

    }

    _writeFile(value, maxCharCount) {
        
    }
    
    _isFileReady() {
        return false;
    }

    static _getTeleprinterCharacter(key) {
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

class ReaderBuffer {
    #value;
    #position;

    constructor(value = "") {
        this.reset(value);
    }

    reset(value = "") {
        this.#value = value ? value : "";
        this.#position = 0;
    }

    resetIfChanged(newValue = "") {
        if (newValue != this.#value) {
            this.reset(newValue);
        }
    }

    read(maxCharCount) {
        if (maxCharCount <= 0) {
            return "";
        }

        let oldPosition = this.#position;
        this.#position = Math.min(this.#position + maxCharCount, this.#value.length);
        return this.#value.substring(oldPosition, this.#position);
    }
    
    hasData() {
        return this.#position >= 0 && this.#position < this.#value.length;
    }
}

class CircularBuffer {
    #capacity;
    #value;

    constructor(capacity, value = "") {
        // allow usage of non initialized or null parameters
        this.#capacity = capacity ? capacity : 0;
        this.reset(value);
    }

    reset(value = "") {
        this.#value = value ? value : "";
    }

    append(value) {
        let newValue = this.#value + (value ? value : "");
        this.#value = this.#capacity ? newValue.substring(newValue.length - this.#capacity) : newValue;
    }

    read(maxCharCount) {
        if (maxCharCount <= 0) {
            return "";
        }

        let end = Math.min(maxCharCount, this.#value.length);
        let res = this.#value.substring(0, end);
        this.#value = this.#value.substring(end);
        return res;
    }
    
    getValue() {
        return this.#value;
    }
    
    hasData() {
        return this.#value.length > 0;
    }
}
