var ascii;
var popupText;

class ExtendedAscii {
    // There are more code pages here:
    // https://github.com/inexorabletash/text-encoding/blob/master/lib/encoding-indexes.js
    // Information about the code pages:
    // https://en.wikipedia.org/wiki/ISO/IEC_8859
    // https://en.wikipedia.org/wiki/ISO/IEC_8859-1
    // https://en.wikipedia.org/wiki/Windows-1252
    // All code pages for Windows:
    // https://learn.microsoft.com/en-us/windows/win32/intl/code-page-identifiers
    #codePages = new Map([
        ["windows-1251", [1026,1027,8218,1107,8222,8230,8224,8225,8364,8240,1033,8249,1034,1036,1035,1039,1106,8216,8217,8220,8221,8226,8211,8212,152,8482,1113,8250,1114,1116,1115,1119,160,1038,1118,1032,164,1168,166,167,1025,169,1028,171,172,173,174,1031,176,177,1030,1110,1169,181,182,183,1105,8470,1108,187,1112,1029,1109,1111,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103]],
  
        ["windows-1252", [8364,129,8218,402,8222,8230,8224,8225,710,8240,352,8249,338,141,381,143,144,8216,8217,8220,8221,8226,8211,8212,732,8482,353,8250,339,157,382,376,160,  161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255]],
        ["iso-8859-1",   [ 128,129, 130,131, 132, 133, 134, 135,136, 137,138, 139,140,141,142,143,144, 145, 146, 147, 148, 149, 150, 151,152, 153,154, 155,156,157,158,159,160,  161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255]],
        
        ["iso-8859-2",   [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  260,728,321,164,317,346,167,168,352,350,356,377,173,381,379,176,261,731,322,180,318,347,711,184,353,351,357,378,733,382,380,340,193,194,258,196,313,262,199,268,201,280,203,282,205,206,270,272,323,327,211,212,336,214,215,344,366,218,368,220,221,354,223,341,225,226,259,228,314,263,231,269,233,281,235,283,237,238,271,273,324,328,243,244,337,246,247,345,367,250,369,252,253,355,729]],
        ["iso-8859-3",   [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  294,728,163,164,null,292,167,168,304,350,286,308,173,null,379,176,295,178,179,180,181,293,183,184,305,351,287,309,189,null,380,192,193,194,null,196,266,264,199,200,201,202,203,204,205,206,207,null,209,210,211,212,288,214,215,284,217,218,219,220,364,348,223,224,225,226,null,228,267,265,231,232,233,234,235,236,237,238,239,null,241,242,243,244,289,246,247,285,249,250,251,252,365,349,729]],
        ["iso-8859-4",   [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  260,312,342,164,296,315,167,168,352,274,290,358,173,381,175,176,261,731,343,180,297,316,711,184,353,275,291,359,330,382,331,256,193,194,195,196,197,198,302,268,201,280,203,278,205,206,298,272,325,332,310,212,213,214,215,216,370,218,219,220,360,362,223,257,225,226,227,228,229,230,303,269,233,281,235,279,237,238,299,273,326,333,311,244,245,246,247,248,371,250,251,252,361,363,729]],
        ["iso-8859-5",   [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,173,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,8470,1105,1106,1107,1108,1109,1110,1111,1112,1113,1114,1115,1116,167,1118,1119]],
        ["iso-8859-6",   [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  null,null,null,164,null,null,null,null,null,null,null,1548,173,null,null,null,null,null,null,null,null,null,null,null,null,null,1563,null,null,null,1567,null,1569,1570,1571,1572,1573,1574,1575,1576,1577,1578,1579,1580,1581,1582,1583,1584,1585,1586,1587,1588,1589,1590,1591,1592,1593,1594,null,null,null,null,null,1600,1601,1602,1603,1604,1605,1606,1607,1608,1609,1610,1611,1612,1613,1614,1615,1616,1617,1618,null,null,null,null,null,null,null,null,null,null,null,null,null]],
        ["iso-8859-7",   [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  8216,8217,163,8364,8367,166,167,168,169,890,171,172,173,null,8213,176,177,178,179,900,901,902,183,904,905,906,187,908,189,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,null,931,932,933,934,935,936,937,938,939,940,941,942,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,null]],
        ["iso-8859-8",   [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  null,162,163,164,165,166,167,168,169,215,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,247,187,188,189,190,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,8215,1488,1489,1490,1491,1492,1493,1494,1495,1496,1497,1498,1499,1500,1501,1502,1503,1504,1505,1506,1507,1508,1509,1510,1511,1512,1513,1514,null,null,8206,8207,null]],
        ["iso-8859-10",  [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  260,274,290,298,296,310,167,315,272,352,358,381,173,362,330,176,261,275,291,299,297,311,183,316,273,353,359,382,8213,363,331,256,193,194,195,196,197,198,302,268,201,280,203,278,205,206,207,208,325,332,211,212,213,214,360,216,370,218,219,220,221,222,223,257,225,226,227,228,229,230,303,269,233,281,235,279,237,238,239,240,326,333,243,244,245,246,361,248,371,250,251,252,253,254,312]],
        ["iso-8859-13",  [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  8221,162,163,164,8222,166,167,216,169,342,171,172,173,174,198,176,177,178,179,8220,181,182,183,248,185,343,187,188,189,190,230,260,302,256,262,196,197,280,274,268,201,377,278,290,310,298,315,352,323,325,211,332,213,214,215,370,321,346,362,220,379,381,223,261,303,257,263,228,229,281,275,269,233,378,279,291,311,299,316,353,324,326,243,333,245,246,247,371,322,347,363,252,380,382,8217]],
        ["iso-8859-14",  [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  7682,7683,163,266,267,7690,167,7808,169,7810,7691,7922,173,174,376,7710,7711,288,289,7744,7745,182,7766,7809,7767,7811,7776,7923,7812,7813,7777,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,372,209,210,211,212,213,214,7786,216,217,218,219,220,221,374,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,373,241,242,243,244,245,246,7787,248,249,250,251,252,253,375,255]],
        ["iso-8859-15",  [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  161,162,163,8364,165,352,167,353,169,170,171,172,173,174,175,176,177,178,179,381,181,182,183,382,185,186,187,338,339,376,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255]],
        ["iso-8859-16",  [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,  260,261,321,8364,8222,352,167,353,169,536,171,377,173,378,379,176,177,268,322,381,8221,182,183,382,269,537,187,338,339,376,380,192,193,194,258,196,262,198,199,200,201,202,203,204,205,206,207,272,323,210,211,212,336,214,346,368,217,218,219,220,280,538,223,224,225,226,259,228,263,230,231,232,233,234,235,236,237,238,239,273,324,242,243,244,337,246,347,369,249,250,251,252,281,539,255]],
    ]);
    
    #defaultText = [
        ["windows-1251, iso-8859- 5", "cake ~ саке"],
        ["windows-1252, iso-8859- 1 (2, 3), 4", "he is disappointed = il est déçu"],
        ["iso-8859- 2, 3, 16", "simți șef ~ simţi şef"],
        //["___________", null],
    ];
    
    #comboDefaultText;
    #textEncode;
    #comboEncodePage;
    #asciiBytes;
    #comboDecodePage;
    #textDecode;
    
    #encodePage;
    #decodePage;
    
    #codePagePopup;
    #codePageTitle;
    #comboCodePage;
    #codePageCharactersData;
    #popupDialog;
    #popupTable;
    
    #MIN_ENCODED_ROWS = 7;
    #INVALID_ASCII_CODE = 256;
    #INVALID_ASCII_CODE_TEXT = "??";
    #INVALID_ASCII_CHARACTER = "☐";
    #DEFAULT_CODE_PAGE = "windows-1251";
    
    
    constructor(comboDefaultTextId, textEncodeId, comboEncodePageId,
                codePagePopupId, codePageTitleId, comboCodePageId, codePageCharactersDataId,
                asciiBytesId, comboDecodePageId, textDecodeId) {
        this.#comboDefaultText = document.getElementById(comboDefaultTextId);
        this.#textEncode = document.getElementById(textEncodeId);
        
        this.#comboEncodePage = document.getElementById(comboEncodePageId);
        this.#asciiBytes = new Table(document.getElementById(asciiBytesId), -1, "byte-indexes", "byte-cell")
            .initCells(null, this.#MIN_ENCODED_ROWS, 2)
            .popup('click', (table, e) => {
                popupText.showTextPopup(e.value, e.charCount, e.left, e.top, e.width, newValue => {
                    let fixedValue = _this._fixHexValue(newValue, e.charCount);
                    table.setValuesAtAddress(e.address, [fixedValue]);
                    _this._setDecodedText(_this._getEncodedBytes());
                });
            });
        
        this.#comboDecodePage = document.getElementById(comboDecodePageId);
        this.#textDecode = document.getElementById(textDecodeId);
        
        this.#comboCodePage = document.getElementById(comboCodePageId);
        
        this._fillCombo(this.#defaultText, this.#comboDefaultText);
        this._fillCombo(this.#codePages.keys(), this.#comboEncodePage);
        this._fillCombo(this.#codePages.keys(), this.#comboDecodePage);
        this._fillCombo(this.#codePages.keys(), this.#comboCodePage);
        
        let intialText = this.#defaultText[0][1];
        
        this.#comboDefaultText.value = intialText;
        this.#comboEncodePage.value = this.#DEFAULT_CODE_PAGE;
        this.#comboDecodePage.value = this.#DEFAULT_CODE_PAGE;
        this.#comboCodePage.value = this.#DEFAULT_CODE_PAGE;
        this.#encodePage = this.#codePages.get(this.#DEFAULT_CODE_PAGE);
        this.#decodePage = this.#encodePage;
        
        this.#codePagePopup = document.getElementById(codePagePopupId);
        this.#codePageTitle = document.getElementById(codePageTitleId);
        this.#codePageCharactersData = document.getElementById(codePageCharactersDataId);
        this.#popupDialog = new PopupDialog();
        
        this.#popupTable = new Table(this.#codePageCharactersData, -1, "byte-indexes", "byte-cell")
            .initCells(null, 1, 1, (cellAddress, row, column, data) => toHexString(cellAddress + 128, 2))
            .cellEvent('click', (cell, e, data) => {
                let characterCode = parseInt(cell.id.substring(2)) + 128;
                _this._setDecodedText(_this._addAsciiByte(characterCode));
                _this.closePopup();
            });
        
        this.setText(intialText);
        
        let _this = this;
        
        this.#comboDefaultText.addEventListener("change", function() {
            _this.setText(this.value);
        });
        
        this.#comboEncodePage.addEventListener("change", function() {
            _this.#encodePage = _this.#codePages.get(this.value);
            _this._setDecodedText(_this._setAsciiBytes(_this.#textEncode.value));
        });
        
        this.#comboDecodePage.addEventListener("change", function() {
            _this.#decodePage = _this.#codePages.get(this.value);
            _this._setDecodedText(_this._getEncodedBytes());
        });
        
        this.#comboCodePage.addEventListener("change", function() {
            let page = _this.#codePages.get(this.value);
            _this._fillCodePageData(page);
        });
        
        this.#textEncode.addEventListener("input", function(e) {
            _this._setDecodedText(_this._setAsciiBytes(this.value));
        });
        
        this.#textEncode.addEventListener('keydown', function(e) {
            if (e.key.length == 1 && !Keys.isHotKeyCombination(e) && !_this._isValidCode(e.key)) {
                // TODO: use CSS animation for flashing the border
                // https://stackoverflow.com/questions/23635271/how-to-make-an-elements-border-flash
                this.setCustomValidity("Invalid character.");
                beep();
                setTimeout(() => this.setCustomValidity(""), 300);
            }
        }, false);
        
        setPasteCompleteCallback(this.#textEncode, function(e) {
            if (!_this._isValidCode(e.text)) {
                // TODO: use CSS animation for flashing the border
                // https://stackoverflow.com/questions/23635271/how-to-make-an-elements-border-flash
                e.element.setCustomValidity("Text contains invalid characters.");
                beep();
                setTimeout(() => e.element.setCustomValidity(""), 300);
            }
        });
    }
    
    setText(text) {
        this.#textEncode.value = text;
        this._setDecodedText(this._setAsciiBytes(text));
    }
    
    showEncodePagePopup(button) {
        this._prepareCodePagePopup("Code page ", this.#comboEncodePage.value, this.#encodePage);
        this.#popupDialog.show(this.#codePagePopup,
            button.parentElement.parentElement.getBoundingClientRect().left + 30,
            button.getBoundingClientRect().bottom);
    }
    
    showDecodePagePopup(button) {
        this._prepareCodePagePopup("Code page ", this.#comboDecodePage.value, this.#decodePage);
        let h = 280; // this.#codePagePopup.getBoundingClientRect().height;
        this.#popupDialog.show(this.#codePagePopup,
            button.parentElement.parentElement.getBoundingClientRect().left + 30,
            button.getBoundingClientRect().top - h);
    }
    
    closePopup() {
        this.#popupDialog.hide();
    }
    
    _decode(bytes, page) {
        let res = "";
        
        for (let i = 0; i < bytes.length; i++) {
            const b = bytes[i];
            if (b >= 0 && b <= 127) {
                res += String.fromCodePoint(b);
            } else if (b >= 128 && b <= 255) {
                const codePoint = page[b - 128];
                res += codePoint ? String.fromCodePoint(codePoint) : this.#INVALID_ASCII_CHARACTER;
            } else {
                res += this.#INVALID_ASCII_CHARACTER;
            }
        }
        
        return res;
    }
    
    _encode(str) {
        let res = [];
        
        for (let i = 0; i < str.length; i++) {
            const codePoint = str.codePointAt(i);
            // Push the code point as an ASCII code
            res.push(this._getAsciiCode(codePoint));
            // If the character is a surrogate pair, skip the next character
            if (codePoint > 0xFFFF) i++; 
        }
        
        return res;
    }
    
    _getAsciiCode(codePoint) {
        if (!isValid(codePoint)) {
            return this.#INVALID_ASCII_CODE;
        }
        
        if (codePoint >= 0 && codePoint <= 127) {
            return codePoint;
        }
        
        for (let i = 0; i < this.#encodePage.length; i++) {
            if (this.#encodePage[i] == codePoint) {
                return i + 128;
            }
        }
        return this.#INVALID_ASCII_CODE;
    }
    
    _isValidCode(text) {
        for (let i = 0; i < text.length; i++) {
            if (this._getAsciiCode(text.codePointAt(i)) == this.#INVALID_ASCII_CODE) {
                return false;
            }
        }
        return true;
    }
    
    _getByte(strValue) {
        if (strValue == Table.DEFAULT_CELL_VALUE) {
            return null;
        }
        if (strValue == this.#INVALID_ASCII_CODE_TEXT) {
            return this.#INVALID_ASCII_CODE;
        }
        return parseIntOrNull(strValue, 16);
    }
    
    _getEncodedBytes() {
        let values = this.#asciiBytes.getAllValues();
        
        let res = [];
        for (let v of values) {
            let b = this._getByte(v);
            if (b != null) {
                res.push(b);
            }
        }
        return res;
    }
    
    _fixHexValue(hexStr, charCount) {
        if (hexStr.length <= 0 || hexStr == Table.DEFAULT_CELL_VALUE) {
            return Table.DEFAULT_CELL_VALUE;
        }
        
        let res = parseInt(hexStr, 16);
        if (isNaN(res)) {
            return this.#INVALID_ASCII_CODE_TEXT;
        }
        return toHexString(res, charCount);
    }
    
    _fillCombo(enumerable, comboElement) {
        for (let x of enumerable) {
            let option = document.createElement("option");
            if (Array.isArray(x) && x[1] == null) {
                option.disabled = true;
                option.appendChild(document.createTextNode(x[0]));
            } else {
                option.value = Array.isArray(x) ? x[1] : x;
                option.appendChild(document.createTextNode(Array.isArray(x) ? x[0] : x));
            }
            comboElement.appendChild(option);
        }
    }
    
    _setEncodedText(encodedBytes) {
        this.#textEncode.value = this._decode(encodedBytes, this.#encodePage);
        return this.#textEncode.value;
    }
    
    _setAsciiBytes(text) {
        let encodedBytes = this._encode(text);
        
        let data = [];
        for (let b of encodedBytes) {
            data.push(b != this.#INVALID_ASCII_CODE ?
                toHexString(b, this.#asciiBytes.getMinCharsPerCell()) : this.#INVALID_ASCII_CODE_TEXT);
        }
        
        let rows = Math.max(this.#MIN_ENCODED_ROWS, Math.ceil(data.length / this.#asciiBytes.getColumnCount()));
        if (rows != this.#asciiBytes.getRowCount()) {
            this.#asciiBytes.setRows(rows, null);
        }
        
        this.#asciiBytes.setValuesAtAddress(0, data, Table.ClearType.ClearAfter);
        
        return encodedBytes;
    }
    
    _addAsciiByte(byteNumber) {
        let encodedBytes = [];
        let tableSize = this.#asciiBytes.getRowCount() * this.#asciiBytes.getColumnCount();
        let newByteAddress = this.#textEncode.value.length;
        
        let encodedValues = this.#asciiBytes.getValuesAtAddress(newByteAddress, tableSize - newByteAddress);
        for (let i = encodedValues.length - 1; i >= 0; i--) {
            let byteStr = encodedValues[i];
            if (byteStr != this.#asciiBytes.getDefaultCellValue()) {
                newByteAddress += i + 1;
                break;
            }
        }
        
        newByteAddress = Math.min(newByteAddress, tableSize - 1);
        
        let byteStr = toHexString(byteNumber, this.#asciiBytes.getMinCharsPerCell());
        this.#asciiBytes.setValuesAtAddress(newByteAddress, [byteStr], Table.ClearType.NoClear);
        return this._getEncodedBytes();
    }
    
    _setDecodedText(encodedBytes) {
        this.#textDecode.value = this._decode(encodedBytes, this.#decodePage);
        return this.#textDecode.value;
    }
    
    _prepareCodePagePopup(pageName, comboValue, page) {
        this.#codePageTitle.textContent = pageName;
        this.#comboCodePage.value = comboValue;
        this._fillCodePageData(page);
    }
    
    _fillCodePageData(page) {
        this.#popupTable.setRows(8, (cellAddress, row, column, data) => String.fromCodePoint(page[cellAddress]));
    }
}

window.onload = function() {
    popupText = new PopupText("popupText");
    ascii = new ExtendedAscii("comboDefaultText", "textEncode", "comboEncodePage",
        "popupCodePage", "codePageTitle", "comboCodePage", "codePageCharactersData",
        "asciiBytes", "comboDecodePage", "textDecode");
}

