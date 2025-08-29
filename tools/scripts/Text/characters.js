var characters;

class Characters {
    static #CATEGORY_SEPARATOR = "\\";
    static #DEFAULT_DESCRIPTION = "Code Point";
    static #DEFAULT_ENCODED_TEXT = "-";
    static #DEFAULT_CATEGORY = "Any";
    
    #characterInfoPopup;
    #categoriesPopup;
    #popupDialog;
    
    #charDescription;
    #charName;
    
    #textSearch;
    
    #categorySelect = [];
    #categories = new Map();
    #characterList;
    
    #encodedData;
    #characterPreview;
    #linkPreview;
    #categoriesPreview = [];
    #applyCategories;
    
    #characterChangedCallback;
    
    #utf8Encode;
    
    
    constructor(charDescriptionId, charNameId, textSearchId, characterListId,
                categoriesPopupId, characterInfoPopupId, encodedDataId, characterPreviewId, linkPreviewId,
                categoryPreviewPrefix, applyCategoriesId, categoryIds) {
        this.#charDescription = document.getElementById(charDescriptionId);
        this.#charName = document.getElementById(charNameId);
        
        this.#textSearch = document.getElementById(textSearchId);
        this.#characterList = document.getElementById(characterListId);
        
        this.#characterInfoPopup = document.getElementById(characterInfoPopupId);
        this.#categoriesPopup = document.getElementById(categoriesPopupId);
        this.#popupDialog = new PopupDialog();
        
        this.#encodedData = document.getElementById(encodedDataId);
        this.#characterPreview = document.getElementById(characterPreviewId);
        this.#linkPreview = document.getElementById(linkPreviewId);
        
        let i = 0;
        let categoryItem = document.getElementById(categoryPreviewPrefix + i);
        while(categoryItem) {
            this.#categoriesPreview.push(categoryItem);
            i++;
            categoryItem = document.getElementById(categoryPreviewPrefix + i);
        }
        
        this.#applyCategories = document.getElementById(applyCategoriesId);
        
        for(const id of categoryIds) {
            this.#categorySelect.push(document.getElementById(id));
        }
        
        // encoding: utf-8 (the default), windows-1251, utf-16be, utf-16le, utf-16 (BOM, le by default)
        // https://encoding.spec.whatwg.org/#interface-textdecoder
        // https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings
        this.#utf8Encode = new TextEncoder();
        
        this.onCodePointChanged(0);
        
        let _this = this;
        
        this.#textSearch.addEventListener("keyup", function(e) {
            if (Keys.isEnter(e.key)) {
                _this.searchCharacter();
            }
        });
        
        this._fillCategories(UnicodeCategories, this.#categories);
        
        this._setupCategoryElements(this.#categorySelect[0], this.#categories);
        for (let i = 1; i < this.#categorySelect.length; i++) {
            this._addDefaultCategory(this.#categorySelect[i]);
        }
        
        // Note - the last combo doesn't need to dynamicaly change following combos
        for (let i = 0; i < this.#categorySelect.length - 1; i++) {
            this.#categorySelect[i].addEventListener("change", function() {
                _this._setupNextCategoryElements(i, this.value);
            });
        }
        
        this.#characterList.addEventListener("change", function() {
            _this.onSelectedCharacterChanged(_this.#characterList.options[_this.#characterList.selectedIndex]);
        });
    }
    
    setCharacterCallback(callback) {
        this.#characterChangedCallback = callback;
    }
    
    showCharacterInfoPopup(button) {
        codeUnits.setCodePoint(this.#characterPreview.value.codePointAt(0));
        this.#popupDialog.show(this.#characterInfoPopup,
            button.parentElement.getBoundingClientRect().left + 30, button.getBoundingClientRect().bottom);
    }
    
    showCategoriesPopup(button) {
        this.#popupDialog.show(this.#categoriesPopup,
            button.parentElement.getBoundingClientRect().left + 30, button.getBoundingClientRect().bottom - 350);
    }
    
    closePopup() {
        this.#popupDialog.hide();
    }
    
    saveCategories() {
        // More details about this text file - in CodePointParser
        /*fetch("categories.txt")
            .then((res) => res.text())
            .then((text) => {
                saveTextToFile("Unicode.js", new CodePointParser(text).toString());
            })
            .catch((e) => console.error(e));*/
        readTextFromFile(text => saveTextToFile("Unicode.js", new CodePointParser(text).toString()));
    }
    
    saveBlocks() {
        // More details about this text file - in BlocksParser
        /*fetch("ppucd.txt")
            .then((res) => res.text())
            .then((text) => {
                saveTextToFile("UnicodeBlocks.js", new BlocksParser(text).toString());
            })
            .catch((e) => console.error(e));*/
        readTextFromFile(text => saveTextToFile("UnicodeBlocks.js", new BlocksParser(text).toString()));
    }
    
    onCodePointChanged(codePoint) {
        let name = null;
        let description = null;
        let categories = null;
        
        let index = binarySearch(CodePoints, codePoint, (cp, item) => cp - item.Code);
        if (index >= 0) {
            let characterData = CodePoints[index];
            name = characterData.Name;
            description = this._getDescription(characterData.GeneralCategory);
            categories = characterData.Categories;
        } else {
            let special = UnicodeBlock.getSpecial(codePoint);
            if (special) {
                description = UnicodeBlock.getSpecialDescription(special);
            }
        }
        
        this._setPreviewCharacter(String.fromCodePoint(codePoint), codePoint,
            name, description, categories, true);
    }
    
    onSelectedCharacterChanged(characterOptionElement) {
        let codePoint = parseInt(characterOptionElement.id.substring(2), 16);
        let name = characterOptionElement.textContent.split("(")[1];
        let description = this._getDescription(characterOptionElement.dataset["d00"]);
        let categoriesStr = characterOptionElement.dataset["d01"];
        let categories = categoriesStr ? categoriesStr.split(Characters.#CATEGORY_SEPARATOR) : null;
        
        this._setPreviewCharacter(characterOptionElement.value, codePoint,
            name.substring(0, name.length - 1), description, categories);
    }
    
    // Supports range search: U+0080-0FDA
    searchCharacter() {
        let foundCharacters = this._findCharacters(this.#textSearch.value,
            ComparerConfig.isSubstring, ComparerConfig.forceNotEqual);
        
        this._setCharacters(foundCharacters);
    }
    
    applyCategories() {
        for (let i = 0; i < this.#categorySelect.length; i++) {
            let category = Characters.#DEFAULT_CATEGORY;
            
            if (i < this.#categoriesPreview.length) {
                let preview = this.#categoriesPreview[i];
                if (preview && preview.textContent) {
                    category = preview.textContent;
                }
            }
            
            if (i < this.#categorySelect.length - 1) {
                this._setupCategoryElements(this.#categorySelect[i + 1], this._getSubCategories(i, category));
            }
            this.#categorySelect[i].value = category;
        }
    }
    
    getCharactersByCategory() {
        let foundCharacters = [];
        
        let categoryComparer = new Comparer(ComparerConfig.isCaseSensitive);
        
        let _this = this;
        
        for (const character of CodePoints) {
            let isMatch = categoryComparer.arrayMatches(character.Categories, (index) => {
                let category = index < _this.#categorySelect.length ?
                    _this.#categorySelect[index].value : Characters.#DEFAULT_CATEGORY;
                return category != Characters.#DEFAULT_CATEGORY ? category : null;
            });
            
            if (isMatch && !this._areMoreCategoryFilters(character.Categories)) {
                foundCharacters.push(character);
            }
        }
        
        this._setCharacters(foundCharacters);
    }
    
    _areMoreCategoryFilters(categories) {
        for (let i = categories.length; i < this.#categorySelect.length; i++) {
            if (this.#categorySelect[i].value != Characters.#DEFAULT_CATEGORY) {
                return true;
            }
        }
        return false;
    }
    
    _fillCategories(arr, map) {
        for (const c of arr) {
            let subCategories = new Map();
            if (c.SubCategories) {
                this._fillCategories(c.SubCategories, subCategories);
            }
            map.set(c.Name, subCategories);
        }
    }
    
    _setupNextCategoryElements(depth, categoryName) {
        for (let i = depth; i < this.#categorySelect.length - 1; i++) {
            this._setupCategoryElements(this.#categorySelect[i + 1], this._getSubCategories(i, categoryName));
        }
    }
    
    _setupCategoryElements(element, map) {
        clearSelect(element);
        this._addDefaultCategory(element);
        
        if (!isValid(map)) {
            return;
        }
        
        let sortedCategories = map.keys().toArray().sort();
        for (const categoryName of sortedCategories) {
            this._addOption(element, categoryName, categoryName, categoryName);
        }
    }
    
    _getSubCategories(depth, categoryName) {
        let parentMap = this.#categories;
        for (let i = 0; i < depth; i++) {
            parentMap = parentMap.get(this.#categorySelect[i].value);
            if (!isValid(parentMap)) {
                return parentMap;
            }
        }
        return parentMap.get(categoryName);
    }
    
    _addDefaultCategory(element) {
        this._addOption(element, "anyCategory", Characters.#DEFAULT_CATEGORY, "[Any]");
    }
    
    _getDescription(generalCategory) {
        let gc = GeneralCategories.get(generalCategory);
        if (gc) {
            return `${gc.CharacterType} (${gc.Name})`;
        }
        return null;
    }
    
    _setPreviewCharacter(character, codePoint, name, description, categories, ignoreCallback = false) {
        if (!character) {
            if (!isValid(codePoint)) {
                return;
            }
            character = String.fromCodePoint(codePoint);
        } else {
            if (!codePoint) {
                codePoint = character.codePointAt(0);
            }
        }
        
        this._setPreviewEncoding(character);
        
        this.#charDescription.textContent = description ? description : Characters.#DEFAULT_DESCRIPTION;
        this.#charName.textContent = name ? name : "(NO METADATA FOUND)";
        this.#characterPreview.value = character;
        
        let codePointStr = codePoint.toString(16).toUpperCase().padStart(4, '0');
        this.#linkPreview.href = "https://icu4c-demos.unicode.org/icu-bin/ubrowse?ch=" + codePointStr;
        this.#linkPreview.text = "ICU for U+" + codePointStr;
        
        for (let i = 0; i < this.#categoriesPreview.length; i++) {
            let category = categories ? categories[i] : null;
            let preview = this.#categoriesPreview[i];
            preview.textContent = category ? category : "";
        }
        
        this.#applyCategories.style.display = categories ? "block" : "none";
        
        if (!ignoreCallback && this.#characterChangedCallback) {
            this.#characterChangedCallback(character);
        }
    }
    
    _setPreviewEncoding(character) {
        let utf8Row = this.#encodedData.rows[0];
        let utf16LeRow = this.#encodedData.rows[1];
        let utf16BeRow = this.#encodedData.rows[2];
        
        // Note - map() doesn't work on the special array types used for encoding
        
        const utf8 = this.#utf8Encode.encode(character);
        for (let i = 1; i < utf8Row.cells.length; i++) {
            const dataIndex = i - 1;
            utf8Row.cells[i].textContent = dataIndex < utf8.length ?
                toHexString(utf8[dataIndex], 2) : Characters.#DEFAULT_ENCODED_TEXT;
        }
        
        const utf16 = TextCode.stringToUtf16(character);
        for (let i = 1; i < utf16LeRow.cells.length; i++) {
            const dataIndex = i - 1;
            if (dataIndex < utf16.length) {
                let bigEndianStr = toHexString(utf16[dataIndex], 4);
                utf16LeRow.cells[i].textContent = TextCode.invertEndianness(bigEndianStr);
                utf16BeRow.cells[i].textContent = bigEndianStr;
            } else {
                utf16LeRow.cells[i].textContent = Characters.#DEFAULT_ENCODED_TEXT;
                utf16BeRow.cells[i].textContent = Characters.#DEFAULT_ENCODED_TEXT;
            }
        }
    }
    
    _findCharacters(searchText, nameComparerConfig, categoryComparerConfig) {
        let foundCharacters = [];
        
        if (searchText.startsWith("U+") || searchText.startsWith("u+")) {
            let codeRange = searchText.substring(2).split("-");
            let codeStart = parseInt(codeRange[0], 16);
            let codeEnd = codeStart;
            if (codeRange.length > 0 && codeRange[1]) {
                let endRange = codeRange[1];
                if (endRange.startsWith("U+") || endRange.startsWith("u+")) {
                    endRange = endRange.substring(2);
                }
                codeEnd = parseInt(endRange, 16);
            }
            
            if (isNaN(codeStart)) {
                if (codeRange.length > 0) {
                    alert("Invalid hexadecimal number for start range: " + codeRange[0]);
                } else {
                    alert("Invalid hexadecimal number for code: " + codeRange[0]);
                }
            } else if (isNaN(codeEnd)) {
                alert("Invalid hexadecimal number for end range: " + codeRange[1]);
            } else {
                for (const character of CodePoints) {
                    if (character.Code >= codeStart && character.Code <= codeEnd) {
                        foundCharacters.push(character);
                    }
                }
            }
            
            return foundCharacters;
        }
        
        let nameComparer = new Comparer(nameComparerConfig);
        let categoryComparer = new Comparer(categoryComparerConfig);
        
        for (const character of CodePoints) {
            if (!searchText ||
                nameComparer.stringsEqual(character.Name, searchText) ||
                character.Character == searchText ||
                //character.GeneralCategory == searchText ||
                categoryComparer.arrayContains(character.Categories, searchText)) {
                    foundCharacters.push(character);
            }
        }
        
        return foundCharacters;
    }
    
    _setCharacters(characters) {
        clearSelect(this.#characterList);
        
        for (const characterData of characters) {
            let code = "U+" + characterData.Code.toString(16).toUpperCase().padStart(4, '0');
            this._addOption(this.#characterList,
                code,
                characterData.Character,
                `${characterData.Character} ${code} (${characterData.Name})`,
                [characterData.GeneralCategory, characterData.Categories.join(Characters.#CATEGORY_SEPARATOR)]);
        }
    }
    
    _addOption(selectElement, optionId, optionValue, optionText, customData = null) {
        let option = document.createElement("option");
        option.id = optionId;
        option.value = optionValue;
        if (customData) {
            for (let i = 0; i < customData.length; i++) {
                option.dataset["d" + i.toString().padStart(2, "0")] = customData[i];
            }
        }
        option.appendChild(document.createTextNode(optionText));
        selectElement.appendChild(option);
    }
}
