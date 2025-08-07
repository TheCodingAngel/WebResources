class PopupCenter {
    static #popupText;
    static #popupNumeric;

    static init(popupTextId, popupNumericId) {
        this.#popupText = new PopupText(popupTextId);
        this.#popupNumeric = new PopupText(popupNumericId);
    }

    static showTextPopup(value, charCount, left, top, width, onEditDone) {
        this.#popupText.showTextPopup(value, charCount, left, top, width, onEditDone);
    }

    static hideTextPopup() {
        this.#popupText.hideTextPopup();
    }

    static showNumericPopup(value, charCount, min, max, left, top, width, onEditDone) {
        let popupElement = this.#popupNumeric.getPopupElement();
        popupElement.setAttribute("min", min);
        popupElement.setAttribute("max", max);
        
        this.#popupNumeric.showTextPopup(value, charCount, left, top, width, onEditDone);
    }

    static hideNumericPopup() {
        this.#popupNumeric.hideTextPopup();
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

