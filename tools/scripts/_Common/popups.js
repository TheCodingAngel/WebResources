class PopupBase {
    constructor() {
    }

    _showPopup(popupElement, zIndex, left, top, width) {
        // Some browsers use "documentElement" while others - "body" for scrolling
        let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        
        popupElement.style.left = `${ left + scrollLeft }px`;
        popupElement.style.top = `${ top + scrollTop }px`;
        if (width) {
            popupElement.style.width = `${ width }px`;
        }
    
        popupElement.style.zIndex = zIndex;
        if (popupElement.select) {
            popupElement.select();
        }
        
        popupElement.style.display = "block";
        if (popupElement.focus) {
            popupElement.focus();
        }
    }
    
    _hidePopup(popupElement) {
        if (popupElement) {
            popupElement.style.display = "none";
        }
    }
}

// requires a "popup-background" class customized for the page - example:
// 
// .popup-background {
//   /* Cover the entire visible part of the page - no changes are necessary */
//   display: block;
//   position: fixed;
//   left: 0;
//   top: 0;
//   width: 100%;
//   height: 100%;
//   /* Change the following to match the page style and max z-index (check notification popups)*/
//   z-index: 99;
//   background-color: #888;
//   opacity: 0.7;
// }
// 
class PopupDialog extends PopupBase {
    #background;
    #popupElement;
    #keyUpCallback;
    
    constructor() {
        super();
        
        this.#background = document.createElement("div");
        this.#background.className = "popup-background";
        
        let _this = this;
        
        this.#keyUpCallback = function (e) {
            if (Keys.isEscape(e.key)) {
                _this.hide();
            }
        };
        
        this.#background.addEventListener("mouseup", function (e) {
            e.preventDefault();
            _this.hide();
        });
        this.#background.addEventListener("touchend", function (e) {
            e.preventDefault();
            _this.hide();
        });
    }
    
    isShown() {
        return this.#popupElement && this.#popupElement.style.display === "block";
    }
    
    show(popupElement, left, top) {
        this.#popupElement = popupElement;
        
        document.body.appendChild(this.#background);
        
        super._showPopup(this.#popupElement,
            parseInt(window.getComputedStyle(this.#background).zIndex) + 1,
            left, top, null);
        
        document.addEventListener("keyup", this.#keyUpCallback);
    }
    
    hide() {
        document.removeEventListener("keyup", this.#keyUpCallback);
        
        super._hidePopup(this.#popupElement);
        this.#popupElement = null;
        
        document.body.removeChild(this.#background);
    }
}

class PopupText extends PopupBase {
    #popupText;
    #callback;
    
    constructor(popupTextId) {
        super();
        
        this.#popupText = document.getElementById(popupTextId);
        
        let _this = this;
        
        this.#popupText.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                _this.#callback(_this.#popupText.value);
            }
            if (event.key === "Enter" || event.key === "Escape") {
                _this.hideTextPopup();
            }
        });
        
        this.#popupText.addEventListener("focusout", function(event) {
            _this.hideTextPopup();
        });
    }
    
    showTextPopup(value, charCount, left, top, width, onEditDone) {
        this.#callback = onEditDone;
        this.#popupText.setAttribute("maxlength", charCount);
        this.#popupText.value = value;
        super._showPopup(this.#popupText, 1, left, top, width);
    }

    hideTextPopup() {
        super._hidePopup(this.#popupText);
    }
    
    setValidationPattern(regexPattern) {
        this.#popupText.pattern = regexPattern;
    }
}

class PopupCombo extends PopupBase {
    #popupCombo;
    #callback;
    
    constructor(popupComboId) {
        super();
        
        this.#popupCombo = document.getElementById(popupComboId);
        
        let _this = this;
        
        this.#popupCombo.addEventListener("keyup", function(event) {
            if (event.key === "Enter" || event.key === "Escape") {
                _this.hideComboPopup();
            }
        });
        
        this.#popupCombo.addEventListener("change", function(event) {
            _this.#callback(_this.#popupCombo.value);
            _this.hideComboPopup();
        });
        
        this.#popupCombo.addEventListener("focusout", function(event) {
            _this.hideComboPopup();
        });
    }
    
    showComboPopup(value, left, top, onEditDone) {
        this.#callback = onEditDone;
        this.#popupCombo.value = value;
        super._showPopup(this.#popupCombo, 1, left, top, null);
        //this.#popupCombo.click();
    }

    hideComboPopup() {
        super._hidePopup(this.#popupCombo);
    }
}
