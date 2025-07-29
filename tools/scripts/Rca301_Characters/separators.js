function initSeparators(separatorList, positionsConfig, overlayElement) {
    if (!separatorList) {
        return;
    }
    
    // Dragging the mouse while left button is down may cause selection throughout the document.
    // We will disable this and after dragging is finished will restore the initial value.
    let userSelect = document.body.style.userSelect;
    
    let startPos = 0;
    let draggedElement = null;
    let initialMargin = 0;
    let initialMarkerPos = 0;
    
    function getIntValue(strValue) {
        if (strValue) {
            return parseInt(strValue.slice(0, -2), 10);
        }
        return 0;
    }
    
    function getStrValue(intValue) {
        return intValue.toString() + "px";
    }
    
    function setSeparatorPosition(newValue, separatorElement) {
        if (positionsConfig) {
            let step = (positionsConfig.max - positionsConfig.min) / positionsConfig.count;
            let index = Math.round((newValue - positionsConfig.min) / step);
            if (index <= 0) {
                newValue = positionsConfig.min;
            } else if (index >= positionsConfig.count) {
                newValue = positionsConfig.max;
            } else {
                newValue = positionsConfig.min + Math.round(index * step);
            }
        }
        
        separatorElement.style.marginLeft = getStrValue(newValue - Math.round(separatorElement.clientWidth / 2));
    }
    
    function mouseDownHandler(e) {
        startPos = e.clientX;
        draggedElement = e.target;
        initialMargin = getIntValue(draggedElement.style.marginLeft);
        initialMarkerPos = initialMargin + Math.round(draggedElement.clientWidth / 2);
        
        userSelect = document.body.style.userSelect;
        document.body.style.userSelect = "none";
        if (overlayElement) {
            overlayElement.style.setProperty('cursor', window.getComputedStyle(draggedElement).cursor);
            overlayElement.style.display = "block";
        }

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
    }

    function mouseMoveHandler(e) {
        let delta = e.clientX - startPos;
        
        let newValue = initialMargin + delta;
        if (positionsConfig) {
            if (positionsConfig.snap) {
                setSeparatorPosition(initialMarkerPos + delta, draggedElement);
                return;
            }
            newValue = Math.min(positionsConfig.max - Math.round(draggedElement.clientWidth / 2),
                Math.max(positionsConfig.min - Math.round(draggedElement.clientWidth / 2), newValue));
        }
        draggedElement.style.marginLeft = getStrValue(newValue);
    }
    
    function mouseUpHandler(e) {
        let delta = e.clientX - startPos;
        setSeparatorPosition(initialMarkerPos + delta, draggedElement);
        
        document.body.style.userSelect = userSelect;
        if (overlayElement) {
            overlayElement.style.removeProperty('cursor');
            overlayElement.style.removeProperty("display");
        }

        // remove events that were added in mousedown
        document.removeEventListener("mouseup", mouseUpHandler);
        document.removeEventListener("mousemove", mouseMoveHandler);
    }
    
    for (let separator of separatorList) {
        setSeparatorPosition(positionsConfig ? positionsConfig.min : 0, separator);
        separator.addEventListener("mousedown", mouseDownHandler);
    }
}
