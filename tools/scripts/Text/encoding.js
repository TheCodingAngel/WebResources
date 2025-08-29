var codeUnits;

class DigitSelector {
    static INACTIVE = "info-inactive";
    static ACTIVE = "info-active";
    static STATIC = "info-static";
    static IGNORE = "info-ignore";
    static MODIFIED = "info-modified";
    
    #activeIndex;
    #elements;
    
    constructor() {
        this.#activeIndex = 0;
        this.#elements = [];
    }
    
    clear() {
        this.#activeIndex = 0;
        this.#elements.length = 0;
    }
    
    push(item) {
        this.#elements.push(item);
    }
    
    selectNext() {
        if (this.#activeIndex >= this.#elements.length - 1) {
            return;
        }
        
        this._setClassNames(DigitSelector.INACTIVE);
        this.#activeIndex++;
        this._setClassNames(DigitSelector.ACTIVE);
    }
    
    selectPrevious() {
        if (this.#activeIndex <= 0) {
            return;
        }
        
        this._setClassNames(DigitSelector.INACTIVE);
        this.#activeIndex--;
        this._setClassNames(DigitSelector.ACTIVE);
    }
    
    _setClassNames(className) {
        for (let item of this.#elements[this.#activeIndex]) {
            item.className = className;
        }
    }
}

class DigitCreator {
    static addCodePoint(parent, text, className) {
        let result = DigitCreator.addDigits(parent, text, className);
        
        DigitCreator.addBase(parent, 16);
        parent.appendChild(document.createTextNode("\n"));
        
        return result;
    }
    
    static addDigitGroup(parent, text, className, base) {
        let result = DigitCreator.addDigits(parent, text, className);
        
        if (base) {
            DigitCreator.addBase(parent, base);
        }
        parent.appendChild(document.createTextNode("\n"));
        
        return result;
    }
    
    static addDigits(parent, text, className) {
        let result = DigitCreator.createDigits(text, className);
        parent.appendChild(result);
        return result;
    }
    
    static addBase(parent, base) {
        let result = DigitCreator.createBase(base);
        parent.appendChild(result);
        return result;
    }
    
    static createDigits(text, className) {
        let result = document.createElement("a");
        
        result.textContent = text;
        if (className) {
            result.className = className;
        }
        
        return result;
    }
    
    static createBase(base) {
        let bold = document.createElement("b");
        bold.textContent = base;
        
        let result = document.createElement("sub");
        result.appendChild(bold);
        return result;
    }
}

class BitList {
    #parent;
    #digits;
    
    constructor(parent) {
        this.#parent = parent;
        this.#digits = new DigitSelector();
    }
    
    setBinaryString(binaryString, ignoredDigits, activationList) {
        clearSubElements(this.#parent);
        
        this.#digits.clear();
        
        let activationIndex = 0;
        let activationGroup = [];
        for (let i = 0; i < binaryString.length; i++) {
            if (i < ignoredDigits) {
                DigitCreator.addDigits(this.#parent, binaryString[i], DigitSelector.IGNORE);
            } else {
                let digitElement = DigitCreator.addDigits(this.#parent, binaryString[i],
                    activationIndex == 0 ? DigitSelector.ACTIVE : DigitSelector.INACTIVE);
                    
                activationGroup.push(digitElement);
                
                if (activationGroup.length == activationList[activationIndex]) {
                    this.#digits.push(activationGroup);
                    activationGroup = []; // each push in digits requires a new array
                    activationIndex++;
                }
            }
            
            if ((i % 4) == 0 && i < binaryString.length - 1) {
                this.#parent.appendChild(document.createTextNode("\n"));
            }
        }
        
        this.#parent.appendChild(DigitCreator.createBase(2));
    }
    
    selectNextBits() {
        this.#digits.selectNext();
    }
    
    selectPreviousBits() {
        this.#digits.selectPrevious();
    }
}

class CodeUnits {
    static #SPECIAL_CODE_POINTS = [0, 0x80, 0x800, 0x10000, 0x20000, 0x30000, 0xF0000, 0x100000, 0x10FFFF];
    
    #characterPreview;
    #characterCode;
    #operationUtf16;
    
    #utf8Bits;
    #utf8CodeUnits;
    #utf8Bytes;
    
    #utf16Bits;
    #utf16CodeUnits;
    #utf16WordsBe;
    #utf16WordsLe;
    
    #utf8DigitGroups;
    #utf16DigitGroups;
                
    #utf8Encode;
    
    #codePoint;
    #smallUpdates;
    
    constructor(characterPreviewId, characterCodeId, operationUtf16Id,
                codePointForUtf8Id, utf8CodeUnitsId, utf8BytesId,
                codePointForUtf16Id, utf16CodeUnitsId, utf16WordsBeId, utf16WordsLeId) {
        this.#characterPreview = document.getElementById(characterPreviewId);
        this.#characterCode = document.getElementById(characterCodeId);
        this.#operationUtf16 = document.getElementById(operationUtf16Id);
        
        this.#utf8Bits = new BitList(document.getElementById(codePointForUtf8Id));
        this.#utf8CodeUnits = document.getElementById(utf8CodeUnitsId);
        this.#utf8Bytes = document.getElementById(utf8BytesId);
        
        this.#utf16Bits = new BitList(document.getElementById(codePointForUtf16Id));
        this.#utf16CodeUnits = document.getElementById(utf16CodeUnitsId);
        this.#utf16WordsBe = document.getElementById(utf16WordsBeId);
        this.#utf16WordsLe = document.getElementById(utf16WordsLeId);
        
        this.#utf8DigitGroups = new DigitSelector();
        this.#utf16DigitGroups = new DigitSelector();
        
        this.#utf8Encode = new TextEncoder();
        
        this.setCodePoint(0);
        
        let _this = this;
        
        this.#smallUpdates = new Updater(UnicodeBlock.MIN_CODE_POINT_NUM, UnicodeBlock.MAX_CODE_POINT_NUM, 1, function (value, increment) {
            _this.setCodePoint(value);
        });
    }
    
    setCodePoint(newCodePoint) {
        if (!isValid(newCodePoint) || isNaN(newCodePoint)) {
            return;
        }
        
        newCodePoint = Math.max(newCodePoint, UnicodeBlock.MIN_CODE_POINT_NUM);
        newCodePoint = Math.min(newCodePoint, UnicodeBlock.MAX_CODE_POINT_NUM);
        
        if (newCodePoint == this.#codePoint) {
            return;
        }
        
        this.#codePoint = newCodePoint;
        
        const codePointBinary = padOrCutString(this.#codePoint.toString(2), 21, "0");
        
        this.#characterPreview.textContent = String.fromCodePoint(this.#codePoint);
        this.#characterCode.textContent = "U+" + toHexString(this.#codePoint, 4);
        
        this.#operationUtf16.parentElement.style.display = this.#codePoint < 0x10000 ? "none" : "flex";
        
        this._setUtf8CodeUnits(codePointBinary);
        this._setUtf16CodeUnits(codePointBinary);
        
        clearSubElements(this.#utf8Bytes);
        const utf8 = this.#utf8Encode.encode(this.#characterPreview.textContent);
        for (let i = 0; i < utf8.length; i++) {
            DigitCreator.addCodePoint(this.#utf8Bytes, toHexString(utf8[i]));
        }
        
        clearSubElements(this.#utf16WordsBe);
        clearSubElements(this.#utf16WordsLe);
        const utf16 = TextCode.stringToUtf16(this.#characterPreview.textContent);
        for (let i = 0; i < utf16.length; i++) {
            let bigEndianStr = toHexString(utf16[i], 4);
            DigitCreator.addCodePoint(this.#utf16WordsBe, bigEndianStr);
            DigitCreator.addCodePoint(this.#utf16WordsLe, TextCode.invertEndianness(bigEndianStr));
        }
    }
    
    nextBits(e, utfType) {
        if (utfType == "utf8") {
            this.#utf8Bits.selectNextBits();
            this.#utf8DigitGroups.selectNext();
        } else {
            this.#utf16Bits.selectNextBits();
            this.#utf16DigitGroups.selectNext();
        }
    }
    
    prevBits(e, utfType) {
        if (utfType == "utf8") {
            this.#utf8Bits.selectPreviousBits();
            this.#utf8DigitGroups.selectPrevious();
        } else {
            this.#utf16Bits.selectPreviousBits();
            this.#utf16DigitGroups.selectPrevious();
        }
    }
    
    nextSpecial(e) {
        let index = binarySearch(CodeUnits.#SPECIAL_CODE_POINTS, this.#codePoint, (cp, item) => cp - item);
        if (index < 0) {
            // The "not found" results are offset with 1 to support "-0" (which becomes "-1" with the offset).
            index = -index - 1;
        } else {
            index++;
        }
        this.setCodePoint(CodeUnits.#SPECIAL_CODE_POINTS[Math.min(index, CodeUnits.#SPECIAL_CODE_POINTS.length - 1)]);
    }
    
    prevSpecial(e) {
        let index = binarySearch(CodeUnits.#SPECIAL_CODE_POINTS, this.#codePoint, (cp, item) => cp - item);
        if (index < 0) {
            // The "not found" results are offset with 1 to support "-0" (which becomes "-1" with the offset).
            let insertIndex = -index - 1;
            // We subtract an additional 1 since we are interested in the previous "special"
            index = insertIndex - 1;
        } else {
            index--;
        }
        this.setCodePoint(CodeUnits.#SPECIAL_CODE_POINTS[Math.max(index, 0)]);
    }
    
    nextCharacterStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        this.setCodePoint(this.#codePoint + 1);
        this.#smallUpdates.start(this.#codePoint, 1);
    }
    
    nextCharacterStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#smallUpdates.stop();
    }
    
    prevCharacterStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        this.setCodePoint(this.#codePoint - 1);
        this.#smallUpdates.start(this.#codePoint, -1);
    }
    
    prevCharacterStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#smallUpdates.stop();
    }
    
    _setUtf8CodeUnits(codePointBinary) {
        this.#utf8DigitGroups.clear();
        clearSubElements(this.#utf8CodeUnits);
        
        if (this.#codePoint < CodeUnits.#SPECIAL_CODE_POINTS[1]) {
            this.#utf8Bits.setBinaryString(codePointBinary, 14, [3, 4]);
            
            DigitCreator.addDigits(this.#utf8CodeUnits, "0", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(14, 17), DigitSelector.ACTIVE),
            ]);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(17, 21), DigitSelector.INACTIVE, 2),
            ]);
        } else if (this.#codePoint < CodeUnits.#SPECIAL_CODE_POINTS[2]) {
            this.#utf8Bits.setBinaryString(codePointBinary, 10, [1, 4, 6]);
            
            DigitCreator.addDigits(this.#utf8CodeUnits, "110", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(10, 11), DigitSelector.ACTIVE),
            ]);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(11, 15), DigitSelector.INACTIVE, 2),
            ]);
            
            DigitCreator.addDigits(this.#utf8CodeUnits, "10", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(15, 17), DigitSelector.INACTIVE),
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(17, 21), DigitSelector.INACTIVE, 2),
            ]);
        } else if (this.#codePoint < CodeUnits.#SPECIAL_CODE_POINTS[3]) {
            this.#utf8Bits.setBinaryString(codePointBinary, 5, [4, 2, 4, 6]);
            
            DigitCreator.addDigitGroup(this.#utf8CodeUnits, "1110", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(5, 9), DigitSelector.ACTIVE, 2),
            ]);
            
            DigitCreator.addDigits(this.#utf8CodeUnits, "10", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(9, 11), DigitSelector.INACTIVE),
            ]);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(11, 15), DigitSelector.INACTIVE, 2),
            ]);
            
            DigitCreator.addDigits(this.#utf8CodeUnits, "10", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(15, 17), DigitSelector.INACTIVE),
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(17, 21), DigitSelector.INACTIVE, 2),
            ]);
        } else {
            this.#utf8Bits.setBinaryString(codePointBinary, 0, [3, 6, 2, 4, 6]);
            
            DigitCreator.addDigitGroup(this.#utf8CodeUnits, "1111", DigitSelector.STATIC);
            DigitCreator.addDigits(this.#utf8CodeUnits, "0", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(0, 3), DigitSelector.ACTIVE, 2),
            ]);
            
            DigitCreator.addDigits(this.#utf8CodeUnits, "10", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(3, 5), DigitSelector.INACTIVE),
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(5, 9), DigitSelector.INACTIVE, 2),
            ]);
            
            DigitCreator.addDigits(this.#utf8CodeUnits, "10", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(9, 11), DigitSelector.INACTIVE),
            ]);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(11, 15), DigitSelector.INACTIVE, 2),
            ]);
            
            DigitCreator.addDigits(this.#utf8CodeUnits, "10", DigitSelector.STATIC);
            this.#utf8DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(15, 17), DigitSelector.INACTIVE),
                DigitCreator.addDigitGroup(this.#utf8CodeUnits, codePointBinary.substring(17, 21), DigitSelector.INACTIVE, 2),
            ]);
        }
    }
    
    _setUtf16CodeUnits(codePointBinary) {
        this.#utf16DigitGroups.clear();
        clearSubElements(this.#utf16CodeUnits);
        
        if (this.#codePoint < CodeUnits.#SPECIAL_CODE_POINTS[3]) {
            this.#utf16Bits.setBinaryString(codePointBinary, 5, [4, 4, 4, 4]);
            
            this.#utf16DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf16CodeUnits, codePointBinary.substring(5, 9), DigitSelector.ACTIVE),
            ]);
            this.#utf16DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf16CodeUnits, codePointBinary.substring(9, 13), DigitSelector.INACTIVE),
            ]);
            this.#utf16DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf16CodeUnits, codePointBinary.substring(13, 17), DigitSelector.INACTIVE),
            ]);
            this.#utf16DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf16CodeUnits, codePointBinary.substring(17, 21), DigitSelector.INACTIVE, 2),
            ]);
        } else {
            let nonBmpPlane = (this.#codePoint >>> 16) - 1;
            let fixedBinaryString = padOrCutString(nonBmpPlane.toString(2), 4, "0") + codePointBinary.substring(5);
            
            this.#utf16Bits.setBinaryString(codePointBinary, 0, [5, 4, 2, 6, 4]);
            
            DigitCreator.addDigitGroup(this.#utf16CodeUnits, "1101", DigitSelector.STATIC);
            DigitCreator.addDigitGroup(this.#utf16CodeUnits, "10", DigitSelector.STATIC);
            
            this.#utf16DigitGroups.push([]);
            DigitCreator.addDigitGroup(this.#utf16CodeUnits, fixedBinaryString.substring(0, 4), DigitSelector.MODIFIED);
            
            this.#utf16DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf16CodeUnits, fixedBinaryString.substring(4, 8), DigitSelector.INACTIVE),
            ]);
            this.#utf16DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf16CodeUnits, fixedBinaryString.substring(8, 10), DigitSelector.INACTIVE, 2),
            ]);
            
            DigitCreator.addDigitGroup(this.#utf16CodeUnits, "1101", DigitSelector.STATIC);
            DigitCreator.addDigitGroup(this.#utf16CodeUnits, "11", DigitSelector.STATIC);
            
            this.#utf16DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf16CodeUnits, fixedBinaryString.substring(10, 12), DigitSelector.INACTIVE),
                DigitCreator.addDigitGroup(this.#utf16CodeUnits, fixedBinaryString.substring(12, 16), DigitSelector.INACTIVE),
            ]);
            this.#utf16DigitGroups.push([
                DigitCreator.addDigitGroup(this.#utf16CodeUnits, fixedBinaryString.substring(16, 20), DigitSelector.INACTIVE, 2),
            ]);
        }
    }
}
