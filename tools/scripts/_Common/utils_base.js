class Keys {
    static isEscape(key) {
        return key == "Escape";
    }

    static isSpace(key) {
        return key == " " || key == "Spacebar";
    }

    static isBackspace(key) {
        return key == "Backspace";
    }

    static isDelete(key) {
        return key == "Delete";
    }

    static isTab(key) {
        return key == "Tab";
    }

    static isEnter(key) {
        return key == "Enter";
    }
    
    // Note - the event flags that are used here are set on keydown 
    static isHotKeyCombination(e) {
        return e.ctrlKey || e.altKey || e.shiftKey || e.metaKey;
    }
}

var ComparerConfig = {
    isCaseSensitive: 1,
    isSubstring: 2,
    forceNotEqual: 4,
}

class Comparer {
    #config;
    
    constructor(comparerConfig) {
        this.#config = comparerConfig;
    }
    
    stringsEqual(baseString, compareTo) {
        if (this.#config & ComparerConfig.forceNotEqual) {
            return false;
        }
        
        if (this.#config & ComparerConfig.isCaseSensitive) {
            if (this.#config & ComparerConfig.isSubstring) {
                return baseString.includes(compareTo);
            }
            return baseString == compareTo;
        }
        
        if (this.#config & ComparerConfig.isSubstring) {
            return baseString.toUpperCase().includes(compareTo.toUpperCase());
        }
        return baseString.toUpperCase() == compareTo.toUpperCase();
    }
    
    arrayContains(array, str) {
        if (this.#config & ComparerConfig.forceNotEqual) {
            return false;
        }
        
        if ((this.#config & ComparerConfig.isCaseSensitive) &&
            !(this.#config & ComparerConfig.isSubstring)) {
            return array.includes(str);
        }
        
        for (const item of array) {
            if (this.stringsEqual(item, str)) {
                return true;
            }
        }
        
        return false;
    }
    
    arrayMatches(array, callback) {
        if (this.#config & ComparerConfig.forceNotEqual) {
            return false;
        }
        
        for (let i = 0; i < array.length; i++) {
            const str = callback(i);
            if (str !== null && !this.stringsEqual(array[i], str)) {
                return false;
            }
        }
        
        return true;
    }
}

function checkWord(str, word, isCaseSensitive = true) {
    const allowedSeparator = '\\\s,;"\'|';

    const regex = new RegExp(
        `(^.*[${allowedSeparator}]${word}$)|(^${word}[${allowedSeparator}].*)|(^${word}$)|(^.*[${allowedSeparator}]${word}[${allowedSeparator}].*$)`,

        isCaseSensitive ? '' : 'i',
    );

    return regex.test(str);
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

String.prototype.isLowerCase = function() {
    return this === this.toLowerCase() && this !== this.toUpperCase();
}

String.prototype.isUpperCase = function() {
    return this === this.toUpperCase() && this !== this.toLowerCase();
}

// Use TextEncoder and TextDecoder for UTF-8
class TextCode {
    // The input hex string must use 2 digits per byte (so there must be even number of characters)
    static invertEndianness(hexString) {
        let result = [];
        let len = hexString.length - 2;
        while (len >= 0) {
          result.push(hexString.substr(len, 2));
          len -= 2;
        }
        return result.join("");
    }
    
    static stringToCodePoints(str) {
        const res = [];
        for (let i = 0; i < str.length; i++) {
            const codePoint = str.codePointAt(i);
            res.push(codePoint);
            // If the character is a surrogate pair, skip the next character
            // which will come as a following "code point"
            if (codePoint > 0xFFFF) i++; 
        }
        return res;
    }
    
    static codePointsToString(codePoints) {
        return codePoints.map(cp => String.fromCodePoint(cp)).join("");
    }
    
    static stringToUtf32(str) {
        // The code points are the direct values of UTF-32's 32-bit integers
        return new Uint32Array(stringToCodePoints(str));
    }
    
    static utf32ToString(utf32Array) {
        // Canot use map() on Uint32Array
        let result = "";
        for (let codePoint of utf32Array) {
            // UTF-32's 32-bit integers contain 1:1 code point values
            result += String.fromCodePoint(codePoint);
        }
        return result;
    }
    
    static utf32BytesToString(bytes) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        let result = "";
        for (let i = 0; i < bytes.length; i += 4) {
            result += String.fromCodePoint(view.getInt32(i, true));
        }
        return result;
    }
    
    static stringToUtf16(str) {
        var buf = new ArrayBuffer(str.length*2);
        var bufView = new Uint16Array(buf);
        for (var i=0, strLen=str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return bufView;
    }
    
    static utf16ToString(utf16Array) {
        // Canot use map() on Uint16Array
        let result = "";
        for (let charCode of utf16Array) {
            result += String.fromCharCode(charCode);
        }
        return result;
    }
}

function getTextAreaSelection(textarea) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    return {
        start: start,
        end: end,
        length: end - start,
        text: textarea.value.slice(start, end)
    };
}

// Note - "onpaste" is fired before paste is performed.
function setPasteCompleteCallback(textarea, callback) {
    textarea.onpaste = function() {
        let sel = getTextAreaSelection(textarea);
        let initialLength = textarea.value.length;
        setTimeout(function() {
            let val = textarea.value;
            let pastedTextLength = val.length - (initialLength - sel.length);
            let end = sel.start + pastedTextLength;
            callback({
                start: sel.start,
                end: end,
                length: pastedTextLength,
                text: val.slice(sel.start, end),
                element: textarea
            });
        }, 1);
    };
}

function isValid(variable) {
    return typeof(variable) != "undefined" && variable !== null;
}

function getInvertedMask(fullMask, specificMask) {
    return ~specificMask & fullMask;
}

function setMask(value, fullMask, specificMask, isSet) {
    if (isSet === true) {
        return value | specificMask;
    } else if (isSet === false) {
        return value & getInvertedMask(fullMask, specificMask);
    }
    return value;
}

// returns true when ALL bits in the mask are set
function isMaskSet(value, fullMask, specificMask) {
    return (value & specificMask) === specificMask;
}

function getPropertiesCount(obj) {
    return Object.keys(obj).length;
}

function loadJavascript(id, url, callbackLoad, callbackError) {
    if (document.getElementById(id)) {
        return;
    }
    
    let script = document.createElement('script');
    script.id   = id;
    script.type = 'text/javascript';
    script.src = url;

    if (callbackLoad) {
        script.onload = callbackLoad;
    }
    if (callbackError) {
        script.onerror = callbackError;
    }

    // initiate the loading by adding a script element to the HTML head
    let head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
}

function loadCss(id, url, callbackLoad, callbackError) {
    if (document.getElementById(id)) {
        return;
    }
    
    let link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    
    if (callbackLoad) {
        link.onload = callbackLoad;
    }
    if (callbackError) {
        link.onerror = callbackError;
    }
    
    // initiate the loading by adding a script element to the HTML head
    let head  = document.getElementsByTagName('head')[0];
    head.appendChild(link);
}

function loadFont(family, url, callbackLoad, callbackError) {
    let promise = loadFont(family, url);
    promise.then(callbackLoad, callbackError);
}

// returns a Promise so you can "await" on it...
function loadFont(family, url) {
    const font = new FontFace(family, `url(${url})`);
    document.fonts.add(font);
    return font.load();
}

function scrollIntoView(element, container, topOffset = 0) {
    const containerTop = container.scrollTop; 
    const containerBottom = containerTop + container.clientHeight; 
    const elemTop = Math.max(0, element.offsetTop - topOffset);
    const elemBottom = element.offsetTop + element.clientHeight;
    if (elemTop < containerTop) {
        container.scrollTop = elemTop;
    } else if (elemBottom > containerBottom) {
        container.scrollTop = elemBottom - container.clientHeight;
    }
}

function disableAutomaticResizing(element) {
    element.style.width = element.clientWidth.toString() + "px";
    element.style.height = element.clientHeight.toString() + "px";
}

// Negative result means "not found".
// The offset with 1 is for saying "not found" when the insertion index is 0.
// So, if the result is negative then the actual insertion index is (-result - 1)
function binarySearch(array, item, compare_callback) {
    let start = 0;
    let end = array.length - 1;
    while (start <= end) {
        let mid = (start + end) >> 1;
        let cmp = compare_callback(item, array[mid]);
        if (cmp > 0) {
            start = mid + 1;
        } else if(cmp < 0) {
            end = mid - 1;
        } else {
            return mid;
        }
    }
    return -start - 1;
}

function toHexString(num, paddinZeroes) {
    let res = num.toString(16).toUpperCase();
    if (paddinZeroes) {
        res = res.padStart(paddinZeroes, '0');
    }
    return res;
}

function parseIntOrZero(str, radix = 10) {
    let res = parseInt(str, radix);
    return isNaN(res) ? 0 : res;
}

function parseIntOrNull(str, radix = 10) {
    let res = parseInt(str, radix);
    return isNaN(res) ? null : res;
}

function padOrCutNumber(number, charCount) {
    if (number >= 0) {
        return padOrCutString(number.toString(10), charCount, '0');
    }
    number = -number;
    return "-" + padOrCutString(number.toString(10), charCount - 1, '0');
}

function padOrCutString(str, characterCount, fill = ' ') {
    if (str.length >= characterCount) {
        return str.substring(0, characterCount);
    }
    return str.padStart(characterCount, fill);
}

function saveFileUrl(filename, url) {
    let element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function saveTextToFile(filename, text) {
    saveFileUrl(filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
}

function browseForFile(acceptMultiple, callback) {
    let element = document.createElement('input');
    element.type = 'file';
    element.style.display = 'none';
    if (acceptMultiple) {
        element.multiple = acceptMultiple;
    }
    
    element.addEventListener("change", callback);
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}

function readTextFromFile(callback) {
    browseForFile(false, (e) => {
        const fileList = e.target.files;
        if (!fileList) {
            return;
        }
        let reader = new FileReader();
        reader.onload = function(evt) {
            callback(evt.target.result);
        }
        reader.readAsText(fileList[0]);
    });
}

function clearSubElements(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function clearSelect(selectElement) {
    while (selectElement.options.length > 0) {
        selectElement.options.remove(0);
    }
}

function clearTableData(tableDataElement) {
    while (tableDataElement.rows.length > 0) {
        tableDataElement.deleteRow(0);
    }
}
