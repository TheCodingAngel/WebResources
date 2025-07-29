class Table {
    static ClearType = {
        NoClear: 0,
        ClearBefore: 1,
        ClearAfter: 2,
        ClearBeforeAndAfter: 3,
    };

    static DEFAULT_CELL_VALUE = " ";
    static DEFAULT_MIN_CHARS_PER_CELL = 1;
    
    static #ID_PREFIX_CELL = "dc";
    static #ID_PREFIX_ROW = "dr";
    
    #rowHeaderClass;
    #dataCellClass;
    #idPrefixCell;
    #idPrefixRow;
    
    #elementData;
    #columnCount;
    #rowHeaderCells;
    #rowCount;
    
    #defaultCellValue;
    #minCharsPerCell;
    
    #popupCallback;
    #rowHeaderCallback;
    
    #data;
    
    // negative values (or zero) for columnCount indicate the number of header cells on each row
    constructor(elementData, columnCount, rowHeaderClass, dataCellClass,
                data = null, idPrefixCell = null, idPrefixRow = null) {
        this.#elementData = elementData;
        this.#rowHeaderClass = rowHeaderClass;
        this.#dataCellClass = dataCellClass;
        this.#idPrefixCell = idPrefixCell ? idPrefixCell : Table.#ID_PREFIX_CELL;
        this.#idPrefixRow = idPrefixRow ? idPrefixRow : Table.#ID_PREFIX_ROW;
        
        this.#rowHeaderCells = 0;
        if (!isValid(columnCount)) {
            columnCount = elementData.parentElement.rows[0].cells.length;
        } else if (columnCount <= 0) {
            this.#rowHeaderCells = -columnCount;
            columnCount += elementData.parentElement.rows[0].cells.length;
        }
        this.#columnCount = columnCount;
        this.#rowCount = elementData.rows.length;
        
        this.#defaultCellValue = Table.DEFAULT_CELL_VALUE;
        this.#minCharsPerCell = Table.DEFAULT_MIN_CHARS_PER_CELL;
        
        this.#popupCallback = null;
        this.#rowHeaderCallback = null;
        
        this.#data = data;
    }
    
    initCells(initialCellValue, rowCount, minCharsPerCell, rowHeaderCallback = null) {
        this.#defaultCellValue = initialCellValue ? initialCellValue : Table.DEFAULT_CELL_VALUE;
        this.#minCharsPerCell = minCharsPerCell > 0 ? minCharsPerCell : Table.DEFAULT_MIN_CHARS_PER_CELL;
        this.#rowHeaderCallback = rowHeaderCallback;
        
        let _this = this;
        this.setRows(rowCount, (cellAddress, row, column, data) => _this.#defaultCellValue);
        return this;
    }
    
    cellEvent(event, cellCallback) {
        let _this = this;
        
        if (event && cellCallback) {
            this.#elementData.addEventListener(event, function (e) {
                const cell = e.target.closest('td');
                if (cell) {
                    cellCallback(cell, e, _this.#data);
                }
            });
        }
        
        return this;
    }
    
    popup(popupEvent, popupCallback) {
        this.#popupCallback = popupCallback;
        
        let _this = this;
        
        if (popupEvent && popupCallback) {
            this.#elementData.addEventListener(popupEvent, function (e) {
                const cell = e.target.closest('td');
                if (cell) {
                    _this._showEditCellPopup(cell);
                }
            });
        }
        
        return this;
    }
    
    setData(data) {
        this.#data = data;
    }
    
    setRows(rowCount, cellValueCallback) {
        if (!isValid(rowCount) || rowCount < 0) {
            return;
        }
        
        if (rowCount < this.#elementData.rows.length) {
            while(rowCount < this.#elementData.rows.length) {
                this.#elementData.deleteRow(-1);
            }
            this.#rowCount = rowCount;
        }
        
        for (let row = 0; row < rowCount; row++) {
            let isNewRow = row >= this.#elementData.rows.length;
            let rowElement = isNewRow ? this.#elementData.insertRow() : this.#elementData.rows[row];
            
            if (isNewRow) {
                this._createRowHeaderCells(row, rowElement);
            }
            
            this._initDataCells(row, rowElement, isNewRow, cellValueCallback);
        }
        
        this.#rowCount = rowCount;
    }
    
    getColumnCount() {
        return this.#columnCount;
    }
    
    getRowCount() {
        return this.#rowCount;
    }
    
    getMinCharsPerCell() {
        return this.#minCharsPerCell;
    }
    
    getDefaultCellValue() {
        return this.#defaultCellValue;
    }
    
    getValueAt(row, column) {
        let address = this._getAddress(row, column);
        let cell = this._getDataCellElementAtAddress(address);
        return cell.textContent;
    }
    
    setValueAt(row, column, value) {
        let address = this._getAddress(row, column);
        let cell = this._getDataCellElementAtAddress(address);
        cell.textContent = value;
    }
    
    getAllValues() {
        return this.getValuesAtAddress(0, this.#rowCount * this.#columnCount);
    }
    
    getValuesAtAddress(addressStart, count) {
        let startCell = this._getDataCellElementAtAddress(addressStart);
        if (startCell) {
            return this._getData(startCell, count);
        }
        return [];
    }
    
    setValuesAtAddress(addressStart, data, clearType = Table.ClearType.NoClear) {
        let startCell = this._getDataCellElementAtAddress(addressStart);
        if (startCell) {
            this._setCells(addressStart, startCell, data, clearType);
        }
    }
    
    _createRowHeaderCells(rowIndex, rowElement) {
        for (let column = 0; column < this.#rowHeaderCells; column++) {
            rowElement.id = this.#idPrefixRow + rowIndex;
        
            let newCell = rowElement.insertCell();
            
            // First cells form the row header => add "h" to the row ID
            let rowHeader = this.#idPrefixRow + "h" + rowIndex;
            newCell.id = this.#rowHeaderCells > 1 ? rowHeader + "_" + column : rowHeader;
            newCell.className = this.#rowHeaderClass;
    
            // Append a text node to the cell
            let cellAddress = this._getAddress(rowIndex, column);
            let header = this.#rowHeaderCallback ? this.#rowHeaderCallback(cellAddress, rowIndex, column, this.#data) : cellAddress;
            newCell.appendChild(document.createTextNode(header));
        }
    }
    
    _initDataCells(rowIndex, rowElement, isNewRow, cellValueCallback) {
        for (let column = 0; column < this.#columnCount; column++) {
            let cellAddress = this._getAddress(rowIndex, column);
            let cellValue = cellValueCallback ? cellValueCallback(cellAddress, rowIndex, column, this.#data) : this.#defaultCellValue;
            let cellDataElement = isNewRow ? rowElement.insertCell() : rowElement.cells[column + this.#rowHeaderCells];
            
            if (isNewRow) {
                cellDataElement.id = this._getDataCellId(cellAddress);
                cellDataElement.className = this.#dataCellClass;
                
                // Append a text node to the cell
                cellDataElement.appendChild(document.createTextNode(cellValue));
            } else {
                cellDataElement.textContent = cellValue;
            }
        }
    }
    
    _getData(startCell, count) {
        let context = {data: []};
        this._forEachCell(startCell, count, context, (cell, context) => {
            context.data.push(cell.textContent);
        });
        return context.data;
    }
    
    _setCells(startCellAddr, startCell, data, clearType) {
        let clearContext = {};
        if (startCellAddr > 0 && (clearType == Table.ClearType.ClearBefore || clearType == Table.ClearType.ClearBeforeAndAfter)) {
            this._forEachCell(this._getDataCellElementAtAddress(0), startCellAddr, clearContext, (cell, context) => {
                cell.textContent = this.#defaultCellValue;
            });
        }
        
        let context = {data: data, index: 0};
        this._forEachCell(startCell, data.length, context, (cell, context) => {
            cell.textContent = context.data[context.index];
            context.index++;
        });
        
        let startEmptyCellAddr = startCellAddr + data.length;
        let totalLength = this.#columnCount * this.#rowCount;
        if (startEmptyCellAddr < totalLength && (clearType == Table.ClearType.ClearAfter || clearType == Table.ClearType.ClearBeforeAndAfter)) {
            startCell = this._getDataCellElementAtAddress(startEmptyCellAddr);
            this._forEachCell(startCell, totalLength - startEmptyCellAddr, clearContext, (cell, context) => {
                cell.textContent = this.#defaultCellValue;
            });
        }
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
            cellIndex = this.#rowHeaderCells;
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

    _showEditCellPopup(cellElement) {
        if (!this.#popupCallback || !this._isDataCell(cellElement)) {
            return;
        }
        
        let address = this._getDataCellAddress(cellElement);
        let value = this.getValuesAtAddress(address, 1)[0];

        let cellRect = cellElement.getBoundingClientRect();
        
        let _this = this;
        this.#popupCallback(this, {value: value, data: this.#data, address: address, charCount: this.#minCharsPerCell,
            left: cellRect.left, top: cellRect.top + 3, width: cellRect.width});
    }
    
    _getAddress(row, column) {
        return row * this.#columnCount + column;
    }
    
    _getDataCellId(address) {
        return this.#idPrefixCell + address;
    }
    
    _isDataCell(cellElement) {
        return cellElement.id.startsWith(this.#idPrefixCell);
    }

    _getDataCellAddress(cellElement) {
        return parseIntOrZero(cellElement.id.substring(this.#idPrefixCell.length));
    }
    
    _getDataCellElementAtAddress(address) {
        let row = Math.floor(address / this.#columnCount);
        let column = (address % this.#columnCount) + this.#rowHeaderCells;
        return this.#elementData.rows[row].cells[column];
        
        // Don't use the cell ID because there could be many tables and the cell IDs could be duplicated
        //return document.getElementById(this._getDataCellId(address));
    }
}
