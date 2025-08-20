class Counter {
    #NON_DIGIT_TEXT = " ";
    #DIGIT_HEIGHT = 32;
    #UPDATE_PRECISION = 0.00001;
  
    static #rcaCharacters = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', // 00 - 9
        '\u2420',                                         // 10 - space; '˽'
        '#', '@', '(', ')',                               // 11 - 14
        '\u2047',                                         // 15 - missing character
        '&', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', // 16 - 25
        '+', '.', ';', ':', '\'',                         // 26 - 30
        '\u2047',                                         // 31 - missing character
        '-', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', // 32 - 41
        '\u241F',                                         // 42   End of Item (EI) -> Unit Separator (US); '\u291E'
        '$', '*',                                         // 43 - 44
        '\u241E',                                         // 45 - End of Data (ED) -> Record Separator (RS); '\u21E5'
        '\u241C',                                         // 46 - End of File (EF) -> File Separator (FS); '\u2913'
        '\u2047',                                         // 47 - missing character
        '"', '/', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', // 48 - 57
        '\u241D',                                         // 58 - End of Block (EB) -> Group Separator (GS); '\u21F2'
        ',', '%',                                         // 59 - 60
        '\u2401',                                         // 61 - Item Separator Symbol (ISS) -> Start Of Heading (SOH); '↔'
        '=',                                              // 62
        '\u2047',                                         // 63 - missing character; '✕'
    ];
  
    // Add this to ASCII character codes from 0 to 32 (0x20) and you get Unicode symbols to visualize them
    static #asciiControlToSymbol = 0x2400;
    // Unicode symbol for visualizing ASCII 127 (DEL)
    static #asciiDelSymbol = '\u2421';
    // Unicode symbol for NewLine - different than LineFeed (0x240A) and CarriageReturn (0x240D)
    static #asciiNewLineSymbol = '\u2424';
    // ASCII codes from 0 to 127
    static #asciiCharactersCount = 128;
    
    #radix;
    #currentValue = 0;

    #isOverflowing = false;
    #maxValue = 0;
    #upperBound = 0;
    #lowerBound = 0;
    #allowNegative = false;
    
    #digitCount;
    #digits = [];  // Little Endian order
    
    #overflowSelector;
    #overflowTooltip;
    #digitsParent;
  
    #scrollingDigits = [];
    #last = null;
    #charactersForADigit = 1;
    #useLevelsForDigits = false;
  
    constructor(config) {
        this.#radix = config.radix;
        this.#currentValue = config.initial || 0;
    
        this.#overflowSelector = document.getElementById(config.overflowSelectorId);
        this.#overflowTooltip = this.#overflowSelector.firstElementChild.firstElementChild.textContent;
        this.#digitsParent = document.getElementById(config.parentId);
        
        this._buildCounterElement(config.allPositions, config.positionsForDigit);
        this._hideOverflowSelector();
        this._calcBounds();
        this.set(this.#currentValue);
    }

    get() {
        return Math.floor(this.#currentValue);
    }
  
    set(value) {
        this._set(value);
    }

    getRadix() {
        return this.#radix;
    }
    
    getSegment(left, right) {
        let digitWidth = this.#digits[0].clientWidth;
        let startPosition = Math.round(left / digitWidth);
        let positionCount = Math.round((right - left) / digitWidth);

        return { startDigit: this._getActualDigit(0, startPosition),
                 digitCount: this._getActualDigit(startPosition, positionCount)};
    }

    getSubString(left, right) {
        let segment = this.getSegment(left, right);
        let str = this._getAllVisibleDigits();
        
        // return the digits between "left" and "right"
        return str.substring(segment.startDigit, segment.startDigit + segment.digitCount);
    }

    setSubString(left, right, strValue) {
        let segment = this.getSegment(left, right);
        let str = this._getAllVisibleDigits();
        
        // replce the digits between "left" and "right" with "strValue"
        let newStrValue = str.substring(0, segment.startDigit) +
            padOrCutString(strValue, segment.digitCount, '0') +
            str.substring(segment.startDigit + segment.digitCount);
        
        this.set(parseInt(newStrValue, this.#radix));
        return this.get();
    }
    
    isAllowNegative() {
        return this.#allowNegative;
    }

    setAllowNegative(allowNegative) {
        this.#allowNegative = allowNegative;
        
        this._hideOverflowSelector();
        this._calcBounds();
        
        let res = this.#currentValue % this.#maxValue;
        if (res > this.#upperBound) {
            res = res - this.#maxValue;
        } else if (res < this.#lowerBound) {
            res = this.#maxValue + res;
        }
        return res % this.#maxValue;
    }
  
    setCharactersForADigit(characters) {
        this.#charactersForADigit = characters;
        this._set(this.#currentValue, true);
    }

    setDigits(digitCount) {
        this._buildCounterElement(digitCount, 1);
        this._calcBounds();
        this._set(this.#currentValue, true);
    }

    getUpperBound() {
        return this.#upperBound;
    }

    getLowerBound() {
        return this.#lowerBound;
    }

    getParentElement() {
        return this.#digitsParent;
    }

    static getRcaCharacterRadix() {
        return Counter.#rcaCharacters.length;
    }

    static getAsciiCharacterRadix() {
        return Counter.#asciiCharactersCount;
    }
    
    static numberToRcaCharacter(number) {
        return Counter.#rcaCharacters[number];
    }
  
    static numberToAsciiCharacter(number) {
        if (number == 127) {
            return Counter.#asciiDelSymbol;
        }
      
        return String.fromCharCode(number < 33 ? number + Counter.#asciiControlToSymbol : number);
    }
  
    /*
    changeRadix(newRadix) {
        if (typeof newRadix === "number" && newRadix >= 2 && newRadix <= 36) {
            this.#radix = newRadix;
            this.#last = null;
        }
    }
    */

    setLevelsForDigits(useLevels) {
        this.#useLevelsForDigits = useLevels;
        this._set(this.#currentValue, true);
    }
  
    _buildCounterElement(allPositions, positionsForDigit) {
        this.#digitCount = Math.ceil(allPositions / positionsForDigit);
        this.#digits.length = 0;
        
        let counterElement = document.createElement("div");
        counterElement.className = "counter";
        for (let i = 0; i < allPositions; i++) {
            let isDigit = (i % positionsForDigit) == 0;
          
            let digit = document.createElement("div");
            digit.className = "digit";
          
            let digitCurrent = document.createElement("div");
            digitCurrent.className = "digit-current";
            digitCurrent.innerHTML = this._formatDigit(isDigit ? "0" : this.#NON_DIGIT_TEXT);
            
            let digitNext = document.createElement("div");
            digitNext.className = "digit-next";
            digitNext.innerHTML = this._formatDigit(isDigit ? "1" : this.#NON_DIGIT_TEXT);
            
            digit.appendChild(digitCurrent);
            digit.appendChild(digitNext);
          
            // Add digits right-to-left
            if (counterElement.children.length > 0) {
                counterElement.insertBefore(digit, counterElement.firstElementChild);
            } else {
                counterElement.appendChild(digit);
            }
          
            if (isDigit) {
                this.#digits.push(digit);
            }
        }
      
        if (this.#digitsParent.children.length > 1) {
            this.#digitsParent.replaceChild(counterElement, this.#digitsParent.firstElementChild);
        } else {
            //let background = this.#digitsParent.children[0];
            let background = this.#digitsParent.firstElementChild;
            this.#digitsParent.insertBefore(counterElement, background);
        }
    }
    
    _calcBounds() {
        this.#maxValue = Math.pow(this.#radix, this.#digitCount);
        this.#upperBound = this.#maxValue - 1;
        this.#lowerBound = 0;
        if (this.#allowNegative) {
            switch(this.#radix) {
            case 3:
                // Balanced ternary
                this.#upperBound = (this.#maxValue - 1) / 2;
                this.#lowerBound = -this.#upperBound;
                break;
            case 10:
            // One character is taken for the minus sign
                this.#lowerBound = -this.#maxValue / 10 + 1;
                break;
            default:
                // Two's complement
                this.#upperBound = this.#maxValue / 2 - 1;
                this.#lowerBound = -this.#maxValue / 2;
                break;
            }
        }
    }
    
    _set(value, forceUpdate = false) {
        this.#currentValue = value;
        value = Math.floor(value);
  
        if (forceUpdate || value !== this.#last) {
            this.#last = value;
            this.#scrollingDigits = [];
            
            let overflow = false;
            
            overflow = value < this.#lowerBound || value > this.#upperBound;
            value = value % this.#maxValue;
            if (value < 0) {
                if (this.#radix == 10) {
                    value = value % (this.#maxValue / 10); // One character is taken for the minus sign
                } else {
                    value = this.#maxValue + value; // Two's complement
                }
            }
      
            let current = this._numberToString(value);
            let next = this._numberToString(value + 1);
        
            for (let i = 0; i < this.#digitCount; i++) {
                let currentText = this._formatDigit(current[current.length - i - 1] || this._numberToString(0)[0]);
                let nextText = this._formatDigit(next[next.length - i - 1] || this._numberToString(0)[0]);

                this.#digits[i].querySelector(".digit-current").innerHTML = currentText;
                this.#digits[i].querySelector(".digit-next").innerHTML = nextText;

                this.#digits[i].style.top = "0px";

                if (currentText !== nextText) {
                    this.#scrollingDigits.push(i);
                }
          
                if (!this.isOverflowing && overflow) {
                    this.isOverflowing = true;
                    this._showOverflowSelector();
                } else if (this.isOverflowing && !overflow) {
                    this.isOverflowing = false;
                    this._hideOverflowSelector();
                }
            }
        }
  
        // Adjust the scroll between digits.
        let fraction = this.#currentValue % 1;
        if (fraction < -this.#UPDATE_PRECISION) {
            fraction = fraction + 1;
        }
        let _scrollAmount = fraction * -this.#DIGIT_HEIGHT;
        let newTopValue = Math.round(_scrollAmount);
        let scale = getElementScale(this.#digitsParent.parentElement);
        if (scale < 1) {
            scale /= 2; // patch for the rounding of scaling transformations
        }
        
        let _digits = this.#digits;
        this.#scrollingDigits.forEach(function(n) {
            let digit = _digits[n];
            let pos = digit.style.top.substring(0, digit.style.top.length - 2);
            let px = parseIntOrZero(pos);
            //if (digit.style.top != newTopValue) {
            if (Math.round(px * scale) != Math.round(newTopValue * scale)) {
                digit.style.top = newTopValue.toString() + "px";
            }
        });
    }
    
    _formatDigit(digit) {
        let res = digit;

        let pad = this.#charactersForADigit;

        if (this.#radix == 2) {
            switch(res) {
                case "0":
                    res = this.#useLevelsForDigits ? "͟ " : "0";
                    break;
                case "1":
                    res = this.#useLevelsForDigits ? "͞ " : "1";
                    break;
            }
            if (this.#useLevelsForDigits) {
                pad = pad + 1;
            }
        } else if (this.#radix == 3) {
            if (this.#useLevelsForDigits) {
                switch(res) {
                    case "-":
                        res = "͟ ";
                        break;
                    case "0":
                        res = this.#allowNegative ? "̶ " : "͟ ";
                        break;
                    case "1":
                        res = "̶ ";
                        break;
                    case "+":
                        res = "͞ ";
                        break;
                    case "2":
                        res = "͞ ";
                        break;
                }
                if (this.#useLevelsForDigits) {
                    pad = pad + 1;
                }
            } else if (this.#allowNegative && this.#charactersForADigit > 1) {
                switch(res) {
                    case "-":
                        res = this.#useLevelsForDigits ? "͟ " : "-1";
                        break;
                    case "0":
                        res = this.#useLevelsForDigits ? "̶ " : " 0";
                        break;
                    case "+":
                        res = this.#useLevelsForDigits ? "͞ " : " 1";
                        break;
                }
            }
        }

        return res.padStart(pad, ' ');
    }
  
    _numberToString(value) {
        if (this._isBalancedTernary()) {
            return this._decimalToBalancedTernary(value);
        }
      
        if (this._isUsingRcaCharacters()) {
            return this._customRadixToString(value, Counter.numberToRcaCharacter);
        }
      
        if (this._isUsingAsciiCharacters()) {
            return this._customRadixToString(value, Counter.numberToAsciiCharacter);
        }
      
        return value.toString(this.#radix).toUpperCase();
    }
  
    _isBalancedTernary() {
        return this.#radix == 3 && this.#allowNegative;
    }
  
    _isUsingRcaCharacters() {
        return this.#radix == Counter.getRcaCharacterRadix();
    }
  
    _isUsingAsciiCharacters() {
        return this.#radix == Counter.getAsciiCharacterRadix();
    }
    
    _customRadixToString(value, transformCallback) {
        if (value == 0) {
            return transformCallback(0);
        }
      
        let res = "";
        let v = Math.abs(value);
        while (v > 0) {
            let mod = v % this.#radix;
            res = transformCallback(mod) + res;
            v = Math.floor(v / this.#radix);
        }
      
        return res;
    }
  
    _decimalToBalancedTernary(decimal) {
        if (decimal === 0) {
            return "0";
        }

        let result = "";

        while (decimal !== 0) {
            if (((decimal % 3) + 3) % 3 === 0) {
                result = "0" + result;
            } else if (((decimal % 3) + 3) % 3 === 1) {
                result = "+" + result;
                decimal -= 1;
            } else {
                result = "-" + result;
                decimal += 1;
            }

            decimal = Math.floor(decimal / 3);
        }

        return result;
    }
    
    _getActualDigit(startPosition, positionCount) {
        let result = 0;
      
        let positions = this.#digits[0].parentElement.childNodes;
        for (let i = startPosition; i < positions.length; i++) {
            if (i >= startPosition + positionCount) {
                break;
            }
            let isDigit = positions[i].firstElementChild.textContent != this.#NON_DIGIT_TEXT;
            if (isDigit) {
                result++;
            }
        }
      
        return result;
    }
  
    _getAllVisibleDigits() {
        let result = "";
        for (let i = this.#digits.length - 1; i >= 0; i--) {
            result += this.#digits[i].firstElementChild.textContent;
        }
        return result;
    }
  
    _showOverflowSelector() {
        this.#overflowSelector.style.removeProperty("opacity");
        this.#overflowSelector.firstElementChild.firstElementChild.textContent = this.#overflowTooltip;
    }
  
    _hideOverflowSelector() {
        this.#overflowSelector.style.opacity = "0";
        this.#overflowSelector.firstElementChild.firstElementChild.textContent = "";
    }
}
