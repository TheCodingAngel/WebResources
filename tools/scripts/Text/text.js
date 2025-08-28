var textApi;

class TextApi {
    #elementStrings;
    #elementGlyphs;
    #elementModifiers;
    #elementText;
    #radioButtons;
    
    #codePointTree;
    
    #stringsPopup;
    #codePointsPopup;
    #popupDialog;
    
    #graphemeSplitter;
    #currentEncodingIdx;
    #utf8Encode;
    
    // https://wordsmith.org/pangram/
    // Directions of Writing Systems
    // https://www.omniglot.com/writing/direction.htm
    // Strings in different languages:
    // https://clagnut.com/blog/2380/
    // For Mongolian - translated "Wolves come during rain":
    // https://www.stars21.com/translator/english/mongolian_traditional/
    // For Tifinagh - translated "All human beings are born free and equal in dignity and rights":
    // https://anythingtranslate.com/translators/english-tifinagh-translator/
    // For Japanese - proverb meaning "It is easier to do something than worry about it":
    // https://maggiesensei.com/2022/01/04/%E3%81%93%E3%81%A8%E3%82%8F%E3%81%96%EF%BC%88%E8%AB%BA%EF%BC%89-kotowaza-japanese-proverbs/
    #strings = [
        {language: "English",  text: "A quick brown fox jumps over the lazy dog"},
        {language: "Spanish",  text: "Benjamín pidió una bebida de kiwi y fresa; Noé, sin vergüenza, la más exquisita champaña del menú"},
        //{language: "Russian",  text: "Счастье – это быть любимым"},
        {language: "Russian",  text: "Широкая электрификация южных губерний даст мощный толчок подъёму сельского хозяйства"},
        //{language: "Japanese (Hiragana)", text: "いろはにほへと ちりぬるを わかよたれそ つねならむ うゐのおくやま けふこえて あさきゆめみし ゑひもせす（ん）"},
        {language: "Japanese (Hiragana)", text: "あんずるよりうむがやすし"},
        {language: "Hindi (Devanagari)", text: "अनुच्छेद"},
        {language: "Arabic",   text: "صِف خَلقَ خَودِ كَمِثلِ الشَمسِ إِذ بَزَغَت — يَحظى الضَجيعُ بِها نَجلاءَ مِعطارِ"},
        {language: "Hudum Mongol bichig",   text: "ᠴᠢᠨᠣ᠎ᠠ ᠪᠣᠷᠣᠭᠠᠨ ᠳᠤ ᠢᠷᠡᠵᠡᠢ ᠃"},
        {language: "Chinese Vertical",  text: "紅樓夢横竖撇捺勾点"},
        {language: "Chinese Horizontal",  text: "紅樓夢横竖撇捺勾点"},
        {language: "Tifinagh",   text: "ⴰⵍⵍ ⵀⵙⵓⵏ ⴱⴰⵏⴰⵢⴻⵏ ⴰⵎⵏⵉ ⴼⵔⵉ ⴰⵏⴷ ⵉⵇⵏⴰ ⴱⴰⵣⵣⵉⵏ ⴰⵙⴻⵙ"},
        {language: "English UD",  text: "ɐǝᵷɥᴉʞꞁɯɹʇʌʍʎ ɔɟɾ"},  // nothing for f (ɟ) and j (ɾ)
        {language: "Shrug string", text: "¯\\_(ツ)_/¯"},
        {language: "Music", text: "𝄞𝄢𝄰♩♪♫♬𝅗𝆋𝅘𝆇𝅝𝅗𝅥𝆱𝅘𝅥𝆲𝅘𝅥𝅮𝅘𝅥𝅯𝅘𝅥𝅰𝅘𝅥𝅱𝅘𝅥𝅲𝆔𝆕"},
        {language: "Zalgo", text: "Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞"},
    ];
    
    constructor(elementStringsId, glyphsId, modifiersId, textFieldId, codePointTreeId, radioButtonIds,
                stringsPopupId, codePointsPopupId) {
        this.#elementStrings = document.getElementById(elementStringsId);
        this.#elementGlyphs = document.getElementById(glyphsId);
        this.#elementModifiers = document.getElementById(modifiersId);
        this.#elementText = document.getElementById(textFieldId);
        this.#radioButtons = radioButtonIds.map(rbId => document.getElementById(rbId));
        
        this.#codePointTree = document.getElementById(codePointTreeId);
        
        this.#stringsPopup = document.getElementById(stringsPopupId);
        this.#codePointsPopup = document.getElementById(codePointsPopupId);
        this.#popupDialog = new PopupDialog();
        
        this.#elementStrings.size = this.#strings.length;
        for (let str of this.#strings) {
            let option = document.createElement("option");
            option.id = str.language;
            option.value = str.text;
            option.appendChild(document.createTextNode(str.language + ": " + str.text));
            this.#elementStrings.appendChild(option);
        }
        
        let _this = this;
        
        this.#currentEncodingIdx = 0;
        for (let i = 0; i < this.#radioButtons.length; i++) {
            const rb = this.#radioButtons[i];
            rb.checked = i == this.#currentEncodingIdx;
            rb.addEventListener("change", function() {
                _this._selectEncoding(this);
            });
        }
        
        this.#elementStrings.addEventListener("change", function() {
            let rightToLeft = ["Arabic", "Tifinagh"];
            if (rightToLeft.includes(this.options[this.selectedIndex].id)) {
                _this.#elementText.dir = "rtl";
            } else {
                _this.#elementText.dir = "ltr";
            }
            
            if (this.options[this.selectedIndex].id == "Hudum Mongol bichig") {
                _this.#elementText.style.setProperty("writing-mode", "vertical-lr");
            } else if (this.options[this.selectedIndex].id == "Chinese Vertical") {
                _this.#elementText.style.setProperty("writing-mode", "vertical-rl");
            } else if (this.options[this.selectedIndex].id == "Tifinagh") {
                _this.#elementText.style.setProperty("writing-mode", "vertical-lr");
            } else {
                _this.#elementText.style.removeProperty("writing-mode");
            }
            
            _this.setText(this.value);
        });
        
        this.#elementText.addEventListener("input", function(e) {
            _this._applyText(this.value);
        });
        
        this.#graphemeSplitter = new GraphemeSplitter();
        
        // encoding: utf-8 (the default), windows-1251, utf-16be, utf-16le, utf-16 (BOM, le by default)
        // https://encoding.spec.whatwg.org/#interface-textdecoder
        // https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings
        this.#utf8Encode = new TextEncoder();
    }
    
    showStringsPopup(button) {
        this.#popupDialog.show(this.#stringsPopup,
            button.parentElement.parentElement.getBoundingClientRect().left + 30,
            button.getBoundingClientRect().bottom);
    }
    
    showCodePointsPopup(button) {
        this.#popupDialog.show(this.#codePointsPopup,
            button.parentElement.parentElement.getBoundingClientRect().left - 450,
            button.getBoundingClientRect().bottom);
    }
    
    closePopup() {
        this.#popupDialog.hide();
    }
    
    addGlyphs() {
        let pos = this.#elementText.selectionStart;
        let before = this.#elementText.value.substring(0, pos);
        let after = this.#elementText.value.substring(pos);
        
        let newValue = "";
        if (this.#elementGlyphs.value != "None") {
            newValue += this.#elementGlyphs.value;
        }
        this.#elementGlyphs.value = "None";
        
        if (this.#elementModifiers.value != "None") {
            newValue += this.#elementModifiers.value;
        }
        this.#elementModifiers.value = "None";
        
        this.#elementText.value = before + newValue + after;
        pos += newValue.length;
        this.#elementText.setSelectionRange(pos, pos);
        
        this._applyText(this.#elementText.value);
    }
    
    setText(text) {
        this.#elementText.value = text;
        this._applyText(text);
    }
    
    _selectEncoding(radioButton) {
        for (let i = 0; i < this.#radioButtons.length; i++) {
            const cb = this.#radioButtons[i];
            if (cb === radioButton) {
                this.#currentEncodingIdx = i;
            } else {
                cb.checked = false;
            }
        }
        this._applyText(this.#elementText.value);
    }
    
    _applyText(text) {
        clearSubElements(this.#codePointTree);
        this._fillCodePoints(text, this.#codePointTree);
    }
    
    _fillCodePoints(text, parentElement) {
        let codePointIndex = 0;
        let graphemes = this.#graphemeSplitter.splitGraphemes(text);
        for (let g of graphemes) {
            let codePoints = TextCode.stringToCodePoints(g);
            if (codePoints.length > 1) {
                let subElement = this._addTreeParent(parentElement, g);
                for (let cp of codePoints) {
                    this._addTreeItem(subElement, cp, codePointIndex);
                    codePointIndex++;
                }
            } else if (codePoints.length > 0) {
                this._addTreeItem(parentElement, codePoints[0], codePointIndex);
                codePointIndex++;
            }
        }
        
        let toggler = parentElement.getElementsByClassName("caret");
        for (let t of toggler) {
          t.addEventListener("click", function() {
            this.parentElement.querySelector(".nested").classList.toggle("active");
            this.classList.toggle("caret-down");
          });
        }
    }
    
    _getCodeUnitText(str) {
        switch (this.#currentEncodingIdx) {
            case 0:
                return this._getTreeItemText(this.#utf8Encode.encode(str), 1, false);
            case 1:
                return this._getTreeItemText(TextCode.stringToUtf16(str), 2, true);
            case 2:
                return this._getTreeItemText(TextCode.stringToUtf16(str), 2, false);
        }
    }
    
    _getTreeItemText(data, bytes, isLittleEndian) {
        // Note - map() doesn't work on the special array types used for encoding
        let res = [];
        for (let val of data) {
            let bigEndianStr = toHexString(val, bytes * 2);
            res.push(isLittleEndian ? TextCode.invertEndianness(bigEndianStr) : bigEndianStr);
        }
        return "[" + res.join(" ") + "]";
    }
    
    _addTreeItem(listElement, codePoint, codePointIndex) {
        let li = document.createElement("li");
        li.className = "tree-item data";
        
        let codePointStr = String.fromCodePoint(codePoint);
        
        // Left div (codepoint's character and code units)
        
        let leftDiv = document.createElement("div");
        leftDiv.className = "codepoint-content";
        
        // Character part wrapped in span
        let charSpan = document.createElement("span");
        charSpan.className = "unicode-char";
        charSpan.textContent = codePointStr;
        leftDiv.appendChild(charSpan);

        // Code part wrapped in span
        let codeSpan = document.createElement("span");
        codeSpan.className = "unicode-code";
        codeSpan.textContent = TextApi.getCodePointText(codePoint);
        leftDiv.appendChild(codeSpan);
        
        let code = document.createElement("label");
        code.textContent = this._getCodeUnitText(codePointStr);
        leftDiv.appendChild(code);
        
        li.appendChild(leftDiv);
        
        // Right div (buttons)
        
        let rightDiv = document.createElement("div");
        rightDiv.className = "codepoint-buttons";
        
        let _this = this;
        
        let upBtn = document.createElement("button");
        upBtn.appendChild(document.createTextNode("↑"));
        upBtn.addEventListener("click", function() {
            _this._cpMoveUp(codePointIndex);
        });
        rightDiv.appendChild(upBtn);
        
        let downBtn = document.createElement("button");
        downBtn.appendChild(document.createTextNode("↓"));
        downBtn.addEventListener("click", function() {
            _this._cpMoveDown(codePointIndex);
        });
        rightDiv.appendChild(downBtn);
        
        let delBtn = document.createElement("button");
        delBtn.appendChild(document.createTextNode("x"));
        delBtn.addEventListener("click", function() {
            _this._cpDelete(codePointIndex);
        });
        rightDiv.appendChild(delBtn);
        
        li.appendChild(rightDiv);
        
        // Add new lines when selecting and copying items to clipboard (for example, Firefox needs it)
        //li.appendChild(document.createElement("br"));
        
        listElement.appendChild(li);
        return li;
    }
    
    _addTreeParent(listElement, graphemeCluster) {
        let span = document.createElement("span");
        span.className = "caret caret-down";
        span.appendChild(document.createTextNode(graphemeCluster));
        
        let sub = document.createElement("ul");
        sub.className = "nested active";
        
        let li = document.createElement("li");
        li.className = "tree-item data";
        li.appendChild(span);
        li.appendChild(sub);
        
        listElement.appendChild(li);
        
        return sub;
    }
    
    _cpMoveUp(codePointIndex) {
        if (codePointIndex > 0) {
            let codePoints = TextCode.stringToCodePoints(this.#elementText.value);
            let movingCodePoint = codePoints[codePointIndex];
            codePoints[codePointIndex] = codePoints[codePointIndex - 1];
            codePoints[codePointIndex - 1] = movingCodePoint;
            
            this.setText(TextCode.codePointsToString(codePoints));
        }
    }
    
    _cpMoveDown(codePointIndex) {
        let codePoints = TextCode.stringToCodePoints(this.#elementText.value);
        if (codePoints.length > 0 && codePointIndex < codePoints.length - 1) {
            let movingCodePoint = codePoints[codePointIndex];
            codePoints[codePointIndex] = codePoints[codePointIndex + 1];
            codePoints[codePointIndex + 1] = movingCodePoint;
            
            this.setText(TextCode.codePointsToString(codePoints));
        }
    }
    
    _cpDelete(codePointIndex) {
        let codePoints = TextCode.stringToCodePoints(this.#elementText.value);
        codePoints.splice(codePointIndex, 1);
        
        this.setText(TextCode.codePointsToString(codePoints));
    }
    
    static getCodePointText(codePoint) {
        return "U+" + toHexString(codePoint, 4);
    }
}
