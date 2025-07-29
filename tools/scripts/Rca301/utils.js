var popups;

class Popups {
    static #popupText;
    static #popupNumeric;

    static #allPopups = new Map();

    constructor(popupTextId, popupNumericId) {
        Popups.#popupText = document.getElementById(popupTextId);
        Popups.#allPopups.set(popupTextId, {element: Popups.#popupText, callback: null});

        Popups.#popupNumeric = document.getElementById(popupNumericId);
        Popups.#allPopups.set(popupNumericId, {element: Popups.#popupNumeric, callback: null});

        Popups.#allPopups.forEach(value => {
            value.element.addEventListener("keyup", this._onKeyUp);
            value.element.addEventListener("focusout", this._onLostFocus);
        })
    }

    static showTextPopup(value, charCount, left, top, width, onEditDone) {
        Popups._showPopup(popupText, value, charCount, null, null, left, top, width, onEditDone);
    }

    static hideTextPopup() {
        popupText.style.display = "none";
    }

    static showNumericPopup(value, charCount, min, max, left, top, width, onEditDone) {
        Popups._showPopup(popupNumeric, value, charCount, min, max, left, top, width, onEditDone);
    }

    static hideNumericPopup() {
        popupNumeric.style.display = "none";
    }

    static _showPopup(popupElement, value, charCount, min, max, left, top, width, onEditDone) {
        Popups.#allPopups.get(popupElement.id).callback = onEditDone;

        popupElement.setAttribute("maxlength", charCount);
        if (min != null) {
            popupElement.setAttribute("min", min);
        }
        if (max != null) {
            popupElement.setAttribute("max", max);
        }
        popupElement.value = value;

        // Some browsers use "documentElement" while others - "body" for scrolling
        let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        
        popupElement.style.left = `${ left + scrollLeft }px`;
        popupElement.style.top = `${ top + scrollTop }px`;
        popupElement.style.width = `${ width }px`;
    
        popupElement.style.zIndex = 1;
        popupElement.select();
        popupElement.style.display = "block";
        popupElement.focus();
    }

    _onKeyUp(event) {
        let popup = Popups.#allPopups.get(this.id); // "this" is the element dispatching the event
        if (event.key === "Enter") {
            popup.callback(popup.element.value);
        }
        if (event.key === "Enter" || event.key === "Escape") {
            popup.element.style.display = "none";
        }
    }

    _onLostFocus() {
        Popups.#allPopups.get(this.id).element.style.display = "none";
    }
}

function padWithHaltOrCut(str, characterCount) {
    // '.' is the halt instruction
    return padOrCutString(str, characterCount, '.');
}

function fixIfOverflown(number, charCount) {
    let stringValue = number.toString(10);
    if (stringValue.length <= charCount) {
        return number;
    }
    if (number < 0) {
        return - parseIntOrZero(stringValue.substring(stringValue.length - charCount + 1));
    }
    return parseIntOrZero(stringValue.substring(stringValue.length - charCount));
}

function activateOverlay(overlayElement, cursorElement) {
    if (!overlayElement) {
        return;
    }
    if (cursorElement) {
        overlayElement.style.setProperty('cursor', window.getComputedStyle(cursorElement).cursor);
    }
    overlayElement.style.display = "block";
}

function deactivateOverlay(overlayElement) {
    if (!overlayElement) {
        return;
    }
    overlayElement.style.removeProperty('cursor');
    overlayElement.style.removeProperty("display");
}

function initResizer(resizer, isVertical) {
    if (!resizer) {
        return;
    }

    let pos;

    let toResize = [{element:resizer.parentElement, size:0}];
    if ("resize" in resizer.dataset) {
        let resizeIds = resizer.dataset.resize.split(",");
        resizeIds.forEach(id => {
            let elementToResize = document.getElementById(id.trim());
            if (elementToResize) {
                toResize.push({element:elementToResize, size:0});
            }
        });
    }

    let overlay = null;
    if ("overlay" in resizer.dataset) {
        overlay = document.getElementById(resizer.dataset.overlay);
    }

    let userSelect = document.body.style.userSelect;

    function mousedownHandler(e) {
        activateOverlay(overlay, resizer);
        userSelect = document.body.style.userSelect;
        document.body.style.userSelect = "none";

        pos = isVertical ? e.clientX : e.clientY;

        toResize.forEach(item => {
            let elementStyle = window.getComputedStyle(item.element);
            item.size = parseInt( isVertical ? elementStyle.width : elementStyle.height, 10 );
        });

        document.addEventListener("mousemove", mousemoveHandler);
        document.addEventListener("mouseup", mouseupHandler);
    }

    function mousemoveHandler(e) {
        let delta = isVertical ? e.clientX - pos : e.clientY - pos;

        toResize.forEach(item => {
            let finalSize = item.size + delta;
            if ( finalSize < 1000 ) {
                if (isVertical) {
                    item.element.style.width = `${ finalSize }px`;
                } else {
                    item.element.style.height = `${ finalSize }px`;
                }
            }
        });
    }
    
    function mouseupHandler() {
        deactivateOverlay(overlay);
        document.body.style.userSelect = userSelect;

        // remove event mousemove && mouseup
        document.removeEventListener("mouseup", mouseupHandler);
        document.removeEventListener("mousemove", mousemoveHandler);
    }
    
    resizer.addEventListener("mousedown", mousedownHandler);
}

