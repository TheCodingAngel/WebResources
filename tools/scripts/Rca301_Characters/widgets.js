var counterTernary;
var counterOctHex;

class CounterWidgetTernary extends CounterWidgetBase {
    #radioDigits = new Map();
    
    #binaryLine;
    #ternaryLine;
    #radioButtonBoth;
    #checkboxLevelsToDigits;
    
    #labelUnbalancedTernary;
    #labelBalancedTernary;
    #checkboxShortSymbolsPanel;
    #checkboxShortSymbols;
    
    constructor() {
        super({
            speedSliderId: "btSpeedSlider",
            valueInputId: "btNumberInput",
            valueSliderId: "btValSlider",
            minValueLabelId: "btMinValue",
            maxValueLabelId: "btMaxValue",
            counters : [
                new Counter({parentId: "btDivBin", overflowSelectorId: 'btDivBinOverflow', allPositions: 8, positionsForDigit: 1, radix: 2}),
                new Counter({parentId: "btDivTer", overflowSelectorId: 'btDivTerOverflow', allPositions: 8, positionsForDigit: 1, radix: 3}),
            ],
            leadingCounterIdx: 0,
        });
        
        this.#radioDigits.set(3, document.getElementById("btDigits_3"));
        this.#radioDigits.set(4, document.getElementById("btDigits_4"));
        this.#radioDigits.set(6, document.getElementById("btDigits_6"));
        this.#radioDigits.set(8, document.getElementById("btDigits_8"));
        
        this.#checkboxLevelsToDigits = document.getElementById("btUseVoltLevels");
        
        this.#labelUnbalancedTernary = document.getElementById("btLabelTerUnbalanced");
        this.#labelBalancedTernary = document.getElementById("btLabelTerBalanced");
        this.#checkboxShortSymbolsPanel = document.getElementById("btDivShortBalancedTernary");
        this.#checkboxShortSymbols = document.getElementById("btShortBalancedTernary");
        this._switchTernaryToBalanced(false);
        
        this.#binaryLine = {
            radio: document.getElementById("btOnlyBinary"),
            label: document.getElementById("btLabelBin"),
            row: document.getElementById("btRowBin"),
            overflow: document.getElementById("btDivBinOverflow"),
        };
        
        this.#ternaryLine = {
            radio: document.getElementById("btOnlyTernary"),
            label: document.getElementById("btLabelTer"),
            row: document.getElementById("btRowTer"),
            overflow: document.getElementById("btDivTerOverflow"),
        };
        
        this.#radioButtonBoth = document.getElementById("btBinaryTernary");
        this.showBinary();
        
        this.setVoltLevels(true);
        this.setDigits(3);
    }
    
    start() {
        if (this.#checkboxLevelsToDigits.checked) {
            super.start();
            return;
        }
        document.querySelector('.character_popup').classList.add('activemp');
    }
    
    setValueSlider(val) {
        if (this.#checkboxLevelsToDigits.checked) {
            super.setValueSlider(val);
            return;
        }
        this._setValue(Math.round(val));
    }
    
    setDigits(digitCount) {
        super.setDigits(digitCount);
        this._selectRadioButton(digitCount);
    }
    
    showBinary() {
        this._show(this.#binaryLine);
        this._hide(this.#ternaryLine);
        
        this.#binaryLine.radio.checked = true;
        this.#ternaryLine.radio.checked = false;
        this.#radioButtonBoth.checked = false;
        
        this.setLeadingCounterIdx(0);
    }
    
    showTernary() {
        this._hide(this.#binaryLine);
        this._show(this.#ternaryLine);
        
        this.#binaryLine.radio.checked = false;
        this.#ternaryLine.radio.checked = true;
        this.#radioButtonBoth.checked = false;
        
        this.setLeadingCounterIdx(1);
    }
    
    showBoth() {
        this._show(this.#binaryLine);
        this._show(this.#ternaryLine);
        
        this.#binaryLine.radio.checked = false;
        this.#ternaryLine.radio.checked = false;
        this.#radioButtonBoth.checked = true;
        
        this.setLeadingCounterIdx(0);
    }
    
    setAllowNegative(allowNegative) {
        super.setAllowNegative(allowNegative);
        
        this.#checkboxShortSymbols.checked = true;
        this.setShortSymbols(true);
        
        this._switchTernaryToBalanced(allowNegative);
    }
    
    setVoltLevels(useVoltLevels) {
        if (useVoltLevels) {
            this.pause();
            this._setValue(Math.floor(this._getValue()), true, true);
        }
        
        for (let i in this._allCounters) {
            this._allCounters[i].setLevelsForDigits(useVoltLevels);
        }
    }
    
    setShortSymbols(useShortSymbols) {
        for (let i in this._allCounters) {
            this._allCounters[i].setCharactersForADigit(useShortSymbols ? 1 : 2);
        }
    }
    
    _selectRadioButton(digitCount) {
        for (let [key, value] of this.#radioDigits) {
            if (key == digitCount) {
                value.checked = true;
            } else {
                value.checked = false;
            }
        }
    }
    
    _switchTernaryToBalanced(isBalanced) {
        if (isBalanced) {
            this.#labelUnbalancedTernary.style.display = "none";
            this.#labelBalancedTernary.style.removeProperty("display");
            this.#checkboxShortSymbolsPanel.style.removeProperty("display");
        } else {
            this.#labelUnbalancedTernary.style.removeProperty("display");
            this.#labelBalancedTernary.style.display = "none";
            this.#checkboxShortSymbolsPanel.style.display = "none";
        }
    }
    
    _show(counterLine) {
        counterLine.label.style.removeProperty("display");
        counterLine.row.style.removeProperty("display");
        counterLine.overflow.style.removeProperty("display");
    }
    
    _hide(counterLine) {
        counterLine.label.style.display = "none";
        counterLine.row.style.display = "none";
        counterLine.overflow.style.display = "none";
    }
}


class CounterWidgetOctHex extends CounterWidgetBase {
    static #ALL_POSITIONS = 12;
    
    #digitalCountersRadioAll;
    #digitalCounters = [];
    #digitalCountersIndex = {
        octal: 0,
        hexadecimal: 1,
    };
    
    #characterCountersRadioAll;
    #characterCounters = [];
    #characterCountersIndex = {
        charRca: 0,
        charAscii: 1,
    }
    
    #popupText;
    #popupPatterns = new Map([
        [2, "[0-1]+"],
        [8, "[0-7]+"],
        [16, "[0-9a-fA-F]+"],
    ]);
    
    #popupCharactersElement;
    #popupCharactersTitle;
    #popupCharactersData;
    #popupTable;
    #popupDialog;


    constructor() {
        super({
            speedSliderId: "ohSpeedSlider",
            valueInputId: "ohNumberInput",
            valueSliderId: "ohValSlider",
            minValueLabelId: "ohMinValue",
            maxValueLabelId: "ohMaxValue",
            counters : [
                new Counter({parentId: "ohDivBin", overflowSelectorId: 'ohDivBinOverflow', allPositions: CounterWidgetOctHex.#ALL_POSITIONS, positionsForDigit: 1, radix: 2}),
                new Counter({parentId: "ohDivOct", overflowSelectorId: 'ohDivOctOverflow', allPositions: CounterWidgetOctHex.#ALL_POSITIONS, positionsForDigit: 3, radix: 8}),
                new Counter({parentId: "ohDivHex", overflowSelectorId: 'ohDivHexOverflow', allPositions: CounterWidgetOctHex.#ALL_POSITIONS, positionsForDigit: 4, radix: 16}),
                new Counter({parentId: "ohDivCharRca", overflowSelectorId: 'ohDivCharRcaOverflow', allPositions: CounterWidgetOctHex.#ALL_POSITIONS, positionsForDigit: 6, radix: 64}),
                new Counter({parentId: "ohDivCharAscii", overflowSelectorId: 'ohDivCharAsciiOverflow', allPositions: CounterWidgetOctHex.#ALL_POSITIONS, positionsForDigit: 7, radix: 128}),
            ],
            leadingCounterIdx: 0,
        });
        
        this.#popupText = new PopupText("popupText");
        this.#popupCharactersElement = document.getElementById("popupCharacters");
        this.#popupCharactersTitle = document.getElementById("charactersTitle");
        this.#popupCharactersData = document.getElementById("charactersData");
        let overlayElement = document.getElementById("frameOverlay");
        
        let _this = this;
        
        for (let counter of this._allCounters) {
            let counterParent = counter.getParentElement();
            let separators = counterParent.getElementsByClassName("separator");
            
            initSeparators(separators,
                {min: 0, max: counterParent.clientWidth, count: CounterWidgetOctHex.#ALL_POSITIONS, snap: true},
                overlayElement);
            
            counterParent.addEventListener("click", function (e) {
                let radix = counter.getRadix();
                switch(radix) {
                    case 64:
                        _this._showCharsPopup(radix, counter, separators, e.offsetX, counterParent.getBoundingClientRect());
                        break;
                    case 128:
                        _this._showCharsPopup(radix, counter, separators, e.offsetX, counterParent.getBoundingClientRect());
                        break;
                    default:
                        _this._showPopup(radix, counter, separators, e.offsetX, counterParent.getBoundingClientRect());
                        break;
                }
            });
        }
        
        let octLine = {
            radio: document.getElementById("ohUseOctal"),
            label: document.getElementById("ohLabelOct"),
            row: document.getElementById("ohRowOct"),
            overflow: document.getElementById("ohDivOctOverflow"),
        };
        
        let hexLine = {
            radio: document.getElementById("ohUseHex"),
            label: document.getElementById("ohLabelHex"),
            row: document.getElementById("ohRowHex"),
            overflow: document.getElementById("ohDivHexOverflow"),
        };
        
        this.#digitalCounters.push(octLine);
        this.#digitalCounters.push(hexLine);
        this.#digitalCountersRadioAll = document.getElementById("ohUseOctHex");
        
        let charRcaLine = {
            radio: document.getElementById("ohUseCharRca"),
            label: document.getElementById("ohLabelCharRca"),
            row: document.getElementById("ohRowCharRca"),
            overflow: document.getElementById("ohDivCharRcaOverflow"),
        };
        
        let charAsciiLine = {
            radio: document.getElementById("ohUseCharAscii"),
            label: document.getElementById("ohLabelCharAscii"),
            row: document.getElementById("ohRowCharAscii"),
            overflow: document.getElementById("ohDivCharAsciiOverflow"),
        };
        
        this.#characterCounters.push(charRcaLine);
        this.#characterCounters.push(charAsciiLine);
        this.#characterCountersRadioAll = document.getElementById("ohUseCharBoth");
        
        this.showOct();
        this.showCharRca();
    }
    
    showOct() {
        this._hideCounter(this.#digitalCountersRadioAll, this.#digitalCounters, this.#digitalCountersIndex.hexadecimal);
    }
    
    showHex() {
        this._hideCounter(this.#digitalCountersRadioAll, this.#digitalCounters, this.#digitalCountersIndex.octal);
    }
    
    showOctHex() {
        this._hideCounter(this.#digitalCountersRadioAll, this.#digitalCounters, null);
    }
    
    showCharRca() {
        this._hideCounter(this.#characterCountersRadioAll, this.#characterCounters, this.#characterCountersIndex.charAscii);
    }
    
    showCharAscii() {
        this._hideCounter(this.#characterCountersRadioAll, this.#characterCounters, this.#characterCountersIndex.charRca);
    }
    
    showCharBoth() {
        this._hideCounter(this.#characterCountersRadioAll, this.#characterCounters, null);
    }
    
    closePopup() {
        if (this.#popupDialog) {
            this.#popupDialog.hide();
        }
    }
    
    _hideCounter(radioAll, counters, index) {
        for (let i = 0; i < counters.length; i++) {
            let counterLine = counters[i];
            if (i == index) {
                this._hide(counterLine);
                counterLine.radio.checked = false;
            } else {
                this._show(counterLine);
                counterLine.radio.checked = isValid(index);
            }
        }
        
        radioAll.checked = !isValid(index);
    }
    
    _show(counterLine) {
        counterLine.label.style.removeProperty("display");
        counterLine.row.style.removeProperty("display");
        counterLine.overflow.style.removeProperty("display");
    }
    
    _hide(counterLine) {
        counterLine.label.style.display = "none";
        counterLine.row.style.display = "none";
        counterLine.overflow.style.display = "none";
    }
    
    _showCharsPopup(radix, counter, separators, clickHorizontalPosition, boundingRect) {
        let clickedSegment = this._getClosestSegment(separators, clickHorizontalPosition, 0, boundingRect.width);
        let str = counter.getSubString(clickedSegment.left, clickedSegment.right);
        if (str.length <= 0) {
            return;
        }
        
        let isLesserCharacter = str.length == 2;
        if (str.length == 1) {
            let segment = counter.getSegment(clickedSegment.left, clickedSegment.right);
            isLesserCharacter = segment.startDigit > 0;
        }
        
        if (!this.#popupDialog) {
            this.#popupDialog = new PopupDialog();
        }
        
        let _this = this;
        
        if (!this.#popupTable) {
            this.#popupTable = new Table(this.#popupCharactersData, -1, "character-indexes", "character-cell")
                .initCells(null, 1, 1, (cellAddress, row, column, data) => toHexString(cellAddress, 2))
                .cellEvent('click', (cell, e, data) => {
                    _this._onClickedCharacter(data.counter, data.radix, parseInt(cell.id.substring(2)), data.isLesserCharacter);
                });
        }
        
        this.#popupCharactersTitle.textContent = radix == 64 ? "RCA-301 Characters" : "ASCII Characters";
        this.#popupTable.setData({counter: counter, radix: radix, isLesserCharacter: isLesserCharacter});
        
        this.#popupTable.setRows(radix / this.#popupTable.getColumnCount(),
            (cellAddress, row, column, data) => {
                return data.radix == 64
                    ? Counter.numberToRcaCharacter(cellAddress)
                    : Counter.numberToAsciiCharacter(cellAddress)
            });
        
        this.#popupDialog.show(this.#popupCharactersElement, 100, 150);
    }
    
    _onClickedCharacter(counter, radix, newValue, isLesserCharacter) {
        // get current value and force it between 0 and the full range
        let range = counter.getUpperBound() - counter.getLowerBound() + 1;
        let value = counter.get() % range;
        if (value < 0) {
            value += range;
        }
        
        if (isLesserCharacter) {
            value -= value % radix;
            value += newValue;
        } else {
            value = value % radix;
            value += newValue * radix;
        }
        
        if (counter.isAllowNegative() && value > counter.getUpperBound()) {
            value -= range;
        }
        
        this._setValue(value);
        
        this.closePopup();
    }
    
    _showPopup(radix, counter, separators, clickHorizontalPosition, boundingRect) {
        let clickedSegment = this._getClosestSegment(separators, clickHorizontalPosition, 0, boundingRect.width);
        
        this.#popupText.setValidationPattern(this.#popupPatterns.get(radix));
        
        let strValue = counter.getSubString(clickedSegment.left, clickedSegment.right);
        let popupWidth = clickedSegment.right - clickedSegment.left;
        
        this.#popupText.showTextPopup(strValue, strValue.length, boundingRect.x + clickedSegment.left, boundingRect.y, popupWidth, newValue => {
            let newValueNum = counter.setSubString(clickedSegment.left, clickedSegment.right, newValue);
            this._setValue(newValueNum);
        });
    }
    
    _getClosestSegment(separators, position, minPosition, maxPosition) {
        let separatorPositions = [];
        for (let s of separators) {
            // the visible line of a separator is in its middle, so is its "position" over the counter
            separatorPositions.push(s.offsetLeft + s.clientWidth / 2);
        }
        
        separatorPositions.sort((a, b) => a > b);  // sort incrementally
        let index = binarySearch(separatorPositions, position, (i, item) => i - item);
        if (index < 0) {
            // The "not found" results are offset with 1 to support "-0" (which becomes "-1" with the offset).
            index = -index - 1;
        }
        
        let left = index > 0 ? Math.max(separatorPositions[index - 1], minPosition) : minPosition;
        let right = index <= separatorPositions.length - 1 ?
            Math.min(separatorPositions[index], maxPosition) : maxPosition;
        
        return {left: left, right: right};
    }
}
