var codePointData;

class CodePointData {
    #BIN_DIGITS = 21;
    #HEX_DIGITS = 6;
    
    #codeUnitDataElement;
    #textCodePoint;
    #numeditCodePoint;
    #sliderCodePoint;
    
    #planesCombo;
    #blockButton;
    
    #codePointsPopup;
    #blockPopup;
    #blockTitle;
    #blockCharactersData;
    #popupDialog;
    
    #currentBlock;
    
    #smallUpdates;
    #blockUpdates;
    #specialUpdates;
    #planeUpdates;
    
    #value;
    #valueChangedCallback;
    
    constructor(codeUnitDataElementId, textCodePointId, numeditCodePointId, sliderCodePointId,
                planesComboId, blockButtonId,
                codePointsPopupId, blockPopupId, blockTitleId, blockCharactersDataId) {
        this.#codeUnitDataElement = document.getElementById(codeUnitDataElementId);
        this.#textCodePoint = document.getElementById(textCodePointId);
        this.#numeditCodePoint = document.getElementById(numeditCodePointId);
        this.#sliderCodePoint = document.getElementById(sliderCodePointId);
        
        this.#planesCombo = document.getElementById(planesComboId);
        this.#blockButton = document.getElementById(blockButtonId);
        
        this.#codePointsPopup = document.getElementById(codePointsPopupId);
        this.#blockPopup = document.getElementById(blockPopupId);
        this.#blockTitle = document.getElementById(blockTitleId);
        this.#blockCharactersData = document.getElementById(blockCharactersDataId);
        this.#popupDialog = new PopupDialog();
        
        this._initRange(this.#numeditCodePoint);
        this._initRange(this.#sliderCodePoint);
        this.setValue(UnicodeBlock.MIN_CODE_POINT_NUM, true, true);
        
        let _this = this;
        
        this.#smallUpdates = new Updater(UnicodeBlock.MIN_CODE_POINT_NUM, UnicodeBlock.MAX_CODE_POINT_NUM, 1, function (value, increment) {
            _this.setValue(value, true);
        });
        
        this.#blockUpdates = new Updater(UnicodeBlock.MIN_CODE_POINT_NUM, UnicodeBlock.MAX_CODE_POINT_NUM, 1, function (value, increment) {
            if (!_this.#currentBlock) {
                _this.#blockUpdates.stop();
                return;
            }
            
            let newBlock = increment < 0 ? _this.#currentBlock.getPrevBlock() : _this.#currentBlock.getNextBlock();
            if (!newBlock) {
                _this.#blockUpdates.stop();
                return;
            }
            
            _this.#currentBlock = newBlock;
            
            if (_this.#popupDialog.isShown()) {
                _this._prepareBlockPopup();
            } else {
                _this.setValue(_this.#currentBlock.getStart(), true);
            }
        });
        
        this.#specialUpdates = new Updater(UnicodeBlock.MIN_CODE_POINT_NUM, UnicodeBlock.MAX_CODE_POINT_NUM, 1, function (value, increment) {
            let newValue = increment < 0 ? UnicodeBlock.getPrevSpecial(_this.#value) : UnicodeBlock.getNextSpecial(_this.#value);
            if (!isValid(newValue)) {
                _this.setValue(increment < 0 ? UnicodeBlock.MIN_CODE_POINT_NUM : UnicodeBlock.MAX_CODE_POINT_NUM, true);
                _this.#specialUpdates.stop();
                return;
            }
            
            _this.setValue(newValue, true);
        });
        
        this.#planeUpdates = new Updater(UnicodeBlock.MIN_CODE_POINT_NUM, UnicodeBlock.MAX_CODE_POINT_NUM, 1, function (value, increment) {
            _this.setValue(value, true);
        });
        
        this.#planesCombo.addEventListener("change", function (e) {
            _this.setValue(parseInt(e.target.value, 16), true);
        });
        
        this.#codeUnitDataElement.addEventListener('click', function (e) {
            const cell = e.target.closest('td');
            if (cell) {
                _this._showEditCellPopup(cell);
            }
        });
        
        this.#blockCharactersData.addEventListener('click', function (e) {
            const cell = e.target.closest('td');
            if (cell) {
                let character = _this._getCellText(cell);
                _this.setValue(character.codePointAt(0));
                _this.#popupDialog.hide();
            }
        });
    }
    
    _initRange(element) {
        element.value = 0;
        element.min = UnicodeBlock.MIN_CODE_POINT_NUM;
        element.max = UnicodeBlock.MAX_CODE_POINT_NUM;
        element.step = 1;
    }
    
    getValue() {
        return this.#value;
    }
    
    onUpdateCharacter(character) {
        this.setValue(character.codePointAt(0), false, true);
    }
    
    setValue(newValue, enforceRange = false, ignoreCallback = false) {
        if (!isValid(newValue) || isNaN(newValue)) {
            return;
        }
        
        if (enforceRange) {
            newValue = Math.max(newValue, UnicodeBlock.MIN_CODE_POINT_NUM);
            newValue = Math.min(newValue, UnicodeBlock.MAX_CODE_POINT_NUM);
        }
        
        if (newValue == this.#value || newValue < UnicodeBlock.MIN_CODE_POINT_NUM || newValue > UnicodeBlock.MAX_CODE_POINT_NUM) {
            return;
        }
        
        this.#value = newValue;
        
        let hexValue = newValue.toString(16).toUpperCase();
        
        this._setRowText("cub", newValue.toString(2).padStart(this.#BIN_DIGITS, '0'));
        this._setRowText("cuh", hexValue.padStart(this.#HEX_DIGITS, '0'));
        
        this.#numeditCodePoint.value = newValue;
        this.#textCodePoint.value = "U+" + hexValue.padStart(4, '0');
        this.#sliderCodePoint.value = newValue;
        
        this.#planesCombo.value = toHexString(newValue - newValue % UnicodeBlock.CODEPOINTS_IN_PLANE, 5);
        this.#currentBlock = UnicodeBlock.getBlock(newValue);
        this.#blockButton.textContent = this.#currentBlock ? this.#currentBlock.getName() : "Block";
        
        if (!ignoreCallback && this.#valueChangedCallback) {
            this.#valueChangedCallback(this.#value);
        }
    }
    
    setValueCallback(valueChangedCallback) {
        this.#valueChangedCallback = valueChangedCallback;
    }
    
    showBlockPopup(button) {
        this.#currentBlock = UnicodeBlock.getBlock(this.#value);
        this._prepareBlockPopup();
        this.#popupDialog.show(this.#blockPopup,
            button.parentElement.parentElement.getBoundingClientRect().left + 30, button.getBoundingClientRect().bottom);
    }
    
    showCodePointsPopup(button) {
        this.#popupDialog.show(this.#codePointsPopup,
            button.parentElement.getBoundingClientRect().left + 30, button.getBoundingClientRect().bottom);
    }
    
    closePopup() {
        this.#popupDialog.hide();
    }
    
    incrementStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        this.setValue(this.#value + 1, true);
        this.#smallUpdates.start(this.#value, 1);
    }
    
    incrementStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#smallUpdates.stop();
    }
    
    decrementStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        this.setValue(this.#value - 1, true);
        this.#smallUpdates.start(this.#value, -1);
    }
    
    decrementStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#smallUpdates.stop();
    }
    
    nextBlockStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        this.#currentBlock = UnicodeBlock.getBlock(this.#value).getNextBlock();
        if (!this.#currentBlock) {
            this.setValue(UnicodeBlock.MAX_CODE_POINT_NUM, true);
            this.#blockUpdates.stop();
            return;
        }
        
        this.setValue(this.#currentBlock.getStart(), true);
        this.#blockUpdates.start(this.#value, 1);
    }
    
    nextBlockStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#blockUpdates.stop();
    }
    
    prevBlockStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        this.#currentBlock = UnicodeBlock.getBlock(this.#value).getPrevBlock();
        if (!this.#currentBlock) {
            this.setValue(UnicodeBlock.MIN_CODE_POINT_NUM, true);
            this.#blockUpdates.stop();
            return;
        }
        
        this.setValue(this.#currentBlock.getStart(), true);
        this.#blockUpdates.start(this.#value, -1);
    }
    
    prevBlockStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#blockUpdates.stop();
    }
    
    nextSpecialStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        let newValue = UnicodeBlock.getNextSpecial(this.#value);
        if (!isValid(newValue)) {
            this.setValue(UnicodeBlock.MAX_CODE_POINT_NUM, true);
            this.#specialUpdates.stop();
            return;
        }
        
        this.setValue(newValue, true);
        this.#specialUpdates.start(this.#value, 1);
    }
    
    nextSpecialStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#specialUpdates.stop();
    }
    
    prevSpecialStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        let newValue = UnicodeBlock.getPrevSpecial(this.#value);
        if (!isValid(newValue)) {
            this.setValue(UnicodeBlock.MIN_CODE_POINT_NUM, true);
            this.#specialUpdates.stop();
            return;
        }
        
        this.setValue(newValue, true);
        this.#specialUpdates.start(this.#value, -1);
    }
    
    prevSpecialStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#specialUpdates.stop();
    }
    
    nextPlaneStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        let newValue = UnicodeBlock.CODEPOINTS_IN_PLANE * Math.ceil(this.#value / UnicodeBlock.CODEPOINTS_IN_PLANE);
        if (newValue == this.#value) {
            newValue = newValue + UnicodeBlock.CODEPOINTS_IN_PLANE;
        }
        this.setValue(newValue, true);
        this.#planeUpdates.start(this.#value, UnicodeBlock.CODEPOINTS_IN_PLANE);
    }
    
    nextPlaneStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#planeUpdates.stop();
    }
    
    prevPlaneStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        let newValue = UnicodeBlock.CODEPOINTS_IN_PLANE * Math.floor(this.#value / UnicodeBlock.CODEPOINTS_IN_PLANE);
        if (newValue == this.#value) {
            newValue = newValue - UnicodeBlock.CODEPOINTS_IN_PLANE;
        }
        this.setValue(newValue, true);
        this.#planeUpdates.start(this.#value, -UnicodeBlock.CODEPOINTS_IN_PLANE);
    }
    
    prevPlaneStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#planeUpdates.stop();
    }
    
    viewNextBlockStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        if (!this.#currentBlock) {
            this.#currentBlock = UnicodeBlock.getBlock(this.#value);
        }
        
        let nextBlock = this.#currentBlock.getNextBlock();
        if (!nextBlock) {
            return;
        }
        
        this.#currentBlock = nextBlock;
        this._prepareBlockPopup();
        this.#blockUpdates.start(this.#currentBlock.getStart(), 1);
    }
    
    viewNextBlockStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#blockUpdates.stop();
    }
    
    viewPrevBlockStart(e) {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        
        if (!this.#currentBlock) {
            this.#currentBlock = UnicodeBlock.getBlock(this.#value);
        }
        
        let prevBlock = this.#currentBlock.getPrevBlock();
        if (!prevBlock) {
            return;
        }
        
        this.#currentBlock = prevBlock;
        this._prepareBlockPopup();
        this.#blockUpdates.start(this.#currentBlock.getStart(), -1);
    }
    
    viewPrevBlockStop(e) {
        e.preventDefault();
        e.target.releasePointerCapture(e.pointerId);
        
        this.#blockUpdates.stop();
    }
    
    _prepareBlockPopup() {
        this.#blockTitle.textContent = this.#currentBlock.getName();
        clearTableData(this.#blockCharactersData);
        
        let columnCount = 16;
        
        let currentCodePoint = this.#currentBlock.getStart();
        let rowCount = Math.ceil(this.#currentBlock.getCharacterCount() / columnCount);
        
        for (let row = 0; row < rowCount; row++) {
            let newRow = this.#blockCharactersData.insertRow();
            newRow.id = "row" + toHexString(row);
    
            let newCell = newRow.insertCell();
            newCell.id = "rh" + toHexString(row);
            newCell.className = "character-indexes";
    
            // Append a text node to the cell
            newCell.appendChild(document.createTextNode(toHexString(currentCodePoint, 4)));
            
            for (let column = 0; column < columnCount; column++) {
                let newCell = newRow.insertCell();
                newCell.id = "bc" + (row * columnCount + column);
                newCell.className = "character-cell";
    
                // Append a text node to the cell
                newCell.appendChild(document.createTextNode(String.fromCodePoint(currentCodePoint)));
                currentCodePoint++;
            }
        }
    }
    
    _setRowText(rowIdPrefix, text) {
        for (let i = 0; i < text.length; i++) {
            let digitIndex = text.length - i - 1;
            this._setCellText(document.getElementById(rowIdPrefix + digitIndex.toString()), text[i]);
        }
    }
    
    _setCellText(cell, text) {
        if (!cell) {
            return;
        }
        
        let textNode = cell.childNodes[0];
        if (!textNode) {
            return;
        }
        
        textNode.nodeValue = text;
    }
    
    _getCellText(cell) {
        if (!cell) {
            return "";
        }
        
        let textNode = cell.childNodes[0];
        if (!textNode) {
            return "";
        }
        
        return textNode.nodeValue;
    }
    
    _showEditCellPopup(cellElement) {
        if (!cellElement || !cellElement.id || !cellElement.id.startsWith("cu")) {
            return;
        }
        
        let combo = cellElement.id.startsWith("cub") || cellElement.id == "cuh5" ?
            popupComboBin : popupComboHex;
        
        let value = this._getCellText(cellElement);
        let cellRect = cellElement.getBoundingClientRect();
        
        let _this = this;
        combo.showComboPopup(value, cellRect.left, cellRect.top + 3, cellElement.clientWidth, newValue => {
            let isHex = cellElement.id[2] == 'h';
            let textValue = isHex ? _this.#value.toString(16) : _this.#value.toString(2);
            
            let digitIndex = parseInt(cellElement.id.substring(3));
            if (digitIndex >= textValue.length) {
                textValue = textValue.padStart(isHex ? _this.#HEX_DIGITS : _this.#BIN_DIGITS, '0');
            }
            
            if (digitIndex < 0 || digitIndex >= textValue.length) {
                return;
            }
            
            let newText = textValue.replaceAt(textValue.length - digitIndex - 1, newValue);
            let val = parseInt(newText, isHex ? 16 : 2);
            _this.setValue(val);
        });
    }
}
