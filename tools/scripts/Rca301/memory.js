var memory;

class Memory {
    #addressStartInput;
    #addressEndInput;
    #elementContainer;
    #elementData;
    #editMemoryByRows;

    #headerHeight;

    #selectedAddressStart = -1;
    #selectedAddressEnd = -1;
    #columnCount = 10;
    #rowCount = 1000;

    static markType = {
        NoMark: 0x00,
        Selected: 0x01,
        NextInstruction: 0x02,
        Value: 0x04,
        Label: 0x08,
        All: 0x0f
    };

    static nextInstructionColor = 0xff0000;
    
    #markColors = [
        {type: Memory.markType.Selected, color: 0xbbbbbb},
        {type: Memory.markType.NextInstruction, color: Memory.nextInstructionColor},
        {type: Memory.markType.Value, color: 0x00e700},
        {type: Memory.markType.Label, color: 0x00aaff},
        {type: Memory.markType.NextInstruction | Memory.markType.Value, color: 0xdf4635},
        {type: Memory.markType.NextInstruction | Memory.markType.Label, color: 0xff24f3},
    ];

    static #characterValueMap = [
        //{character:' ',  value:"\u02fd"},  // ˽
        {character:'\n', value:"LF"},  // "\ua71b"  ꜛ
        {character:'\r', value:"CR"},  // "\u2190"  ←
        {character:'\t', value:"HT"},  // "\u2194"  ↔
        {character:'\v', value:"VT"},  // "\u2195"  ↕
        {character:'\b', value:"BS"},  // "\u25c4"  ◄
    ];

    constructor(addressStartElement, addressEndElement, containerElement, dataElement, magneticTape, editMemoryByRows) {
        this.#addressStartInput = addressStartElement;
        this.#addressEndInput = addressEndElement;
        this.#elementContainer = containerElement;
        this.#elementData = dataElement;
        this.#editMemoryByRows = editMemoryByRows;

        //this.#headerHeight = this.#elementData.parentElement.rows[0].clientHeight;
        this.#headerHeight = this.#elementData.parentElement.clientHeight;

        for (let row = 0; row < this.#rowCount; row++) {
            let newRow = this.#elementData.insertRow();
            newRow.id = "mr" + row
    
            let newCell = newRow.insertCell();
            newCell.id = "mrh" + row;
            newCell.className = "memory-address";
    
            // Append a text node to the cell
            newCell.appendChild(document.createTextNode(row * this.#columnCount));
            
            for (let column = 0; column < this.#columnCount; column++) {
                let newCell = newRow.insertCell();
                newCell.id = "ma" + (row * this.#columnCount + column);
                newCell.className = "memory-cell";
    
                // Append a text node to the cell
                newCell.appendChild(document.createTextNode('0'));
            }
        }

        magneticTape.addEventListener('change', (e) => {
            const fileList = e.target.files;
            if (!fileList) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function(evt) {
                let startAddress = memory.#selectedAddressStart > 0 ? memory.#selectedAddressStart : 0;
                memory.setTextAtAddress(startAddress, evt.target.result);
                
                let endAddress = memory.#selectedAddressEnd >= 0 ?
                    memory.#selectedAddressEnd :
                    memory.#columnCount * memory.#rowCount - 1;
                memory.scrollAddressesIntoView(startAddress, endAddress);
            };
            //alert(fileList[0].name);
            //alert(fileList[0].type);
            //alert(fileList[0].size);
            reader.readAsText(fileList[0]);
        });


        this.#elementContainer.addEventListener('scroll', function (e) {
            Popups.hideTextPopup();
        });

        this.#elementData.addEventListener('dblclick', function (e) {
            const cell = e.target.closest('td');
            if (!cell) {
                return;
            }
            if (memory.#editMemoryByRows) {
                memory._showEditRowPopup(cell.parentElement);
            } else {
                memory._showEditCellPopup(cell);
            }
        });
        
        let shiftClickAddress = this.#selectedAddressEnd;

        this.#elementData.addEventListener('click', function (e) {
            const cell = e.target.closest('td');
            if (!cell) {
                return;
            }

            const row = cell.parentElement;
            let clickedAddress = row.rowIndex > 0 && cell.cellIndex > 0 ?
                (row.rowIndex - 1) * memory.#columnCount + cell.cellIndex - 1 :
                -1;
            
            if (e.shiftKey && clickedAddress < 0) {
                return;
            }

            let addressStart = clickedAddress;
            if (e.shiftKey) {
                addressStart = shiftClickAddress == memory.#selectedAddressEnd ?
                    memory.#selectedAddressStart :
                    memory.#selectedAddressEnd;
                shiftClickAddress = clickedAddress;
            } else {
                shiftClickAddress = memory.#selectedAddressEnd;
            }

            memory._setSelectedAddresses(addressStart, clickedAddress);
        });

        let draggedCell = null;

        this.#elementData.addEventListener('mousedown', function (e) {
            if (!e.shiftKey) {
                draggedCell = e.target.closest('td');
            }
            return true;
        });

        this.#elementData.addEventListener('mouseover', function (e) {
            if (!draggedCell) {
                return;
            }
            const draggedAddress = memory._getCellAddress(draggedCell);

            const cell = e.target.closest('td');
            if (!cell) {
                return;
            }

            const hoveredAddress = memory._getCellAddress(cell);
            if (hoveredAddress >= 0) {
                memory._setSelectedAddresses(draggedAddress, hoveredAddress);
            }
        });

        document.addEventListener('mouseup', function (e) {
            draggedCell = null;
        });

        this.#addressStartInput.value = this.#selectedAddressStart;
        this.#addressEndInput.value = this.#selectedAddressEnd;
    }

    scrollToAddress(addressElement) {
        let address = addressElement.value ? addressElement.value : 0;
        address = Math.max(address, 0);
        let cell = document.getElementById("ma" + address);
        scrollIntoView(cell.parentElement, this.#elementContainer, this.#headerHeight);
        addressElement.value = address;
    }

    scrollAddressesIntoView(addressStart, addressEnd) {
        this.scrollCellsIntoView(
            document.getElementById("ma" + addressStart),
            document.getElementById("ma" + addressEnd));
    }

    scrollCellsIntoView(cellStart, cellEnd) {
        if (cellEnd) {
            scrollIntoView(cellEnd.parentElement, this.#elementContainer, this.#headerHeight);
        }
        if (cellStart) {
            scrollIntoView(cellStart.parentElement, this.#elementContainer, this.#headerHeight);
        }
    }

    setEditMemoryByRows(editMemoryByRows) {
        this.#editMemoryByRows = editMemoryByRows;
    }

    saveToFile() {
        let text = this.#selectedAddressEnd < 0
            ? this.getTextAtAddress(0, this.#rowCount * this.#columnCount)
            : this.onGetTextAtSelectedAddresses();
        saveTextToFile("MagneticTape.txt", text);
    }

    onShowHelp() {
        alert("1. Selecting Memory cells:\n" +
            "- by dragging the mouse while having the left button pressed;\n" +
            "- by left clicking on a starting cell followed by a left clicking along with pressed Shift key on an end cell;\n" +
            "- clicking the column with addresses (on the left of the cell matrix) clears the selection.\n" +
            "\n2. Loading Card Reader characters starts from the first selected memory cell or from address zero when there is no selection.\n" +
            "\n3. Filling with zeroes works on the selected cells or on all cells if there is no selection.\n" +
            "\n4. Loading from a file works like point 2 (loading from the first selected memory cell or from address zero when there is no selection).\n" +
            "\n5. Saving to a file works like point 3 (saving the selected cells or all cells if there is no selection).\n" +
            "\n6. Direct editing of memory cells is done by double clicking with the left mouse button (unlike the single click for registers).\n" +
            "\n7. Popup values are applied by the Return/Enter key and canceled by the Esc key or clicking outside the popup.");
    }

    onSelectAddresses() {
        // Numbers starting with zero are (by default) in base octal, so enforce decimal
        let startAddress = parseInt(this.#addressStartInput.value, 10);
        let endAddress = parseInt(this.#addressEndInput.value, 10);
        this._setSelectedAddresses(startAddress, endAddress);
    }

    onSelectStartAddress() {
        // Numbers starting with zero are (by default) in base octal, so enforce decimal
        let startAddress = parseInt(this.#addressStartInput.value, 10);
        let endAddress = parseInt(this.#addressEndInput.value, 10);
        this._setSelectedAddresses(startAddress, endAddress < 0 || endAddress < startAddress ? startAddress : endAddress);
    }

    onSelectEndAddress() {
        // Numbers starting with zero are (by default) in base octal, so enforce decimal
        let startAddress = parseInt(this.#addressStartInput.value, 10);
        let endAddress = parseInt(this.#addressEndInput.value, 10);
        this._setSelectedAddresses(startAddress < 0 ? 0 : startAddress, endAddress);
    }

    onFillWithZeroes() {
        let startAddress = Math.max(this.#selectedAddressStart, 0);
        let startCell = document.getElementById("ma" + startAddress);
        if (startCell) {
            let endAddress = this.#selectedAddressEnd >= 0 ?
                this.#selectedAddressEnd :
                this.#columnCount * this.#rowCount - 1;
            this._zeroCells(startCell, endAddress - startAddress + 1);
            
            if (this.#selectedAddressStart >= 0) {
                this.scrollAddressesIntoView(startAddress, endAddress);
            }
        }
    }

    onLoadTextAtStartAddress(text) {
        let startAddress = Math.max(this.#selectedAddressStart, 0);
        let startCell = document.getElementById("ma" + startAddress);
        if (startCell) {
            this._setCells(startCell, text);
            
            let endAddress = this.#selectedAddressEnd >= 0 ?
                this.#selectedAddressEnd :
                this.#columnCount * this.#rowCount - 1;
            this.scrollAddressesIntoView(startAddress, endAddress);
        }
    }

    onGetTextAtSelectedAddresses() {
        return this.getTextAtAddress(this.#selectedAddressStart,
            this.#selectedAddressEnd - this.#selectedAddressStart + 1);
    }

    getTextAtAddress(addressStart, count) {
        let startCell = document.getElementById("ma" + addressStart);
        if (startCell) {
            return this._getText(startCell, count);
        }
        return "";
    }

    setTextAtAddress(addressStart, text) {
        let startCell = document.getElementById("ma" + addressStart);
        if (startCell) {
            this._setCells(startCell, text);
        }
    }

    markAddresses(addressStart, count, markType, isOn) {
        let startCell = document.getElementById("ma" + addressStart);
        if (startCell) {
            this._markCells(startCell, count, markType, isOn);
        }
    }

    _setSelectedAddresses(startAddress, endAddress) {
        if (startAddress == this.#selectedAddressStart && endAddress == this.#selectedAddressEnd) {
            return;
        }

        if (isNaN(startAddress) || isNaN(endAddress)) {
            startAddress = -1;
            endAddress = -1;
        } else {
            let maxAddress = this.#rowCount * this.#columnCount - 1;
            startAddress = Math.min(startAddress, maxAddress);
            endAddress = Math.min(endAddress, maxAddress);
            if (startAddress < 0) {
                endAddress = -1;
            }
            if (endAddress < 0) {
                startAddress = -1;
            }
        }

        if (startAddress > endAddress) {
            let temp = startAddress;
            startAddress = endAddress;
            endAddress = temp;
        }
    
        let startCell = document.getElementById("ma" + this.#selectedAddressStart);
        if (startCell) {
            this._markCells(startCell, this.#selectedAddressEnd - this.#selectedAddressStart + 1, Memory.markType.Selected, false);
        }
    
        this.#selectedAddressStart = startAddress;
        this.#selectedAddressEnd = endAddress;
    
        let newStartCell = document.getElementById("ma" + startAddress);
        if (newStartCell) {
            this._markCells(newStartCell, endAddress - startAddress + 1, Memory.markType.Selected, true);
            this.scrollCellsIntoView(newStartCell, document.getElementById("ma" + endAddress));
        }

        this.#addressStartInput.value = this.#selectedAddressStart;
        this.#addressEndInput.value = this.#selectedAddressEnd;
    }

    _markCells(startCell, count, markType, isOn) {
        let context = {markType:markType, isOn:isOn};
        this._forEachCell(startCell, count, context, (cell, context) => {
            memory._markOneCell(cell, context);
        });
    }

    _setCells(startCell, text) {
        let context = {text:text, index:0};
        this._forEachCell(startCell, text.length, context, (cell, context) => {
            let textNode = cell.childNodes[0];
            textNode.nodeValue = Memory._getValueFromCharacter(context.text[context.index]);
            context.index++;
        });
    }

    _zeroCells(startCell, count) {
        let context = {index:0};
        this._forEachCell(startCell, count, context, (cell, context) => {
            let textNode = cell.childNodes[0];
            textNode.nodeValue = "0";
            context.index++;
        });
    }

    _getText(startCell, count) {
        let context = {text:""};
        this._forEachCell(startCell, count, context, (cell, context) => {
            let textNode = cell.childNodes[0];
            context.text += Memory._getCharacterFromValue(textNode.nodeValue);
        });
        return context.text;
    }

    _markOneCell(cell, context) {
        let cellMark = Memory.markType.NoMark;
        if ("mark" in cell.dataset) {
            cellMark = parseIntOrZero(cell.dataset.mark, 10);
        }
        if (context.isOn) {
            cellMark = cellMark | context.markType;
        } else {
            let negative = ~context.markType & Memory.markType.All;
            cellMark = cellMark & negative;
        }

        if (cellMark == Memory.markType.NoMark) {
            delete cell.dataset.mark;
        } else {
            cell.dataset.mark = cellMark;
        }
        
        let color = null;
        let cellMarkNoSelection = cellMark & (~Memory.markType.Selected & Memory.markType.All);
        for (let i = 0; i < this.#markColors.length; i++) {
            let element = this.#markColors[i];
            if (element.type == Memory.markType.Selected) {
                continue;
            }
            if (cellMarkNoSelection == element.type) {
                color = element.color;
                break;
            } else if ((cellMarkNoSelection & element.type) != 0) {
                color = element.color;
            }
        }
        if ((cellMark & Memory.markType.Selected) == Memory.markType.Selected) {
            if (!color) {
                color = this.#markColors[0].color;
            } else {
                color = color | this.#markColors[0].color;
            }
        }

        if (context.isOn) {
            cell.style.backgroundColor = "#" + (color ? color.toString(16).padStart(6, '0') : 0x000000);
        } else {
            if (color) {
                cell.style.backgroundColor = "#" + color.toString(16).padStart(6, '0');
            } else {
                cell.style.removeProperty("background-color");
            }
        }
    }

    _showEditRowPopup(rowElement) {
        let startCell = rowElement.cells[1];
        let startAddress = parseIntOrZero(startCell.id.substring(2));
        let value = this.getTextAtAddress(startAddress, this.#columnCount);

        let startCellRect = startCell.getBoundingClientRect();
        let endCellRect = rowElement.cells[this.#columnCount].getBoundingClientRect();
        let width = endCellRect.right - startCellRect.left;

        Popups.showTextPopup(value, this.#columnCount, startCellRect.left, startCellRect.top + 3, width, newValue => {
            let fixedValue = padWithHaltOrCut(newValue, memory.#columnCount);
            memory.setTextAtAddress(startAddress, fixedValue);
        });
    }

    _showEditCellPopup(cellElement) {
        const charCount = 1;
        let address = parseIntOrZero(cellElement.id.substring(2));
        let value = this.getTextAtAddress(address, charCount);

        let cellRect = cellElement.getBoundingClientRect();
        
        Popups.showTextPopup(value, charCount, cellRect.left, cellRect.top + 3, cellRect.width, newValue => {
            let fixedValue = padWithHaltOrCut(newValue, charCount);
            memory.setTextAtAddress(address, fixedValue);
        });
    }

    static _getValueFromCharacter(character) {
        let tuple = Memory.#characterValueMap.find(tuple => tuple.character == character);
        if (tuple) {
            return tuple.value;
        }
        return character;
    }

    static _getCharacterFromValue(value) {
        let tuple = Memory.#characterValueMap.find(tuple => tuple.value == value);
        if (tuple) {
            return tuple.character;
        }
        return value;
    }

    _getCellAddress(cell) {
        const row = cell.parentElement;
        // There are headers both for rows and cells, so the indexes for actual data
        // start from 1 rather than from 0.
        return row.rowIndex > 0 && cell.cellIndex > 0 ?
            (row.rowIndex - 1) * this.#columnCount + cell.cellIndex - 1 :
            -1;
    }

    _forEachCell(startCell, count, context, callback) {
        if (count <= 0) {
            return;
        }

        // There are headers both for rows and cells, so the indexes for actual data
        // start from 1 rather than from 0.
        let cellIndex = startCell.cellIndex;
        let rowIndex = startCell.parentElement.rowIndex;
        while (count > 0) {
            count -= this._forEachCellInRow(this.#elementData.rows[rowIndex-1], cellIndex, count, context, callback);
            cellIndex = 1;
            rowIndex++;
            if (rowIndex > this.#rowCount) {
                break;
            }
        }
    }

    _forEachCellInRow(rowElement, cellIndex, count, context, callback) {
        let res = 0;
        for (let ci = cellIndex; ci <= this.#columnCount && res < count; ci++) {
            callback(rowElement.cells[ci], context);
            res++;
        }
        return res;
    }
}
