var popupComboBin;
var popupComboHex;

window.onload = function() {
    popupComboBin = new PopupCombo("popupComboBin");
    popupComboHex = new PopupCombo("popupComboHex");
    
    codeUnits = new CodeUnits("characterInfoPreview", "characterInfoCode", "characterInfoUtf16Operation",
        "characterInfoUtf8Code", "characterInfoUtf8", "characterInfoUtf8Bytes",
        "characterInfoUtf16Code", "characterInfoUtf16", "characterInfoUtf16BE", "characterInfoUtf16LE");
    codePointData = new CodePointData("codePointData", "textCodePoint", "numeditCodePoint", "sliderCodePoint",
        "planes", "showBlock",
        "popupCodePoints", "popupBlock", "blockTitle", "blockCharactersData");
    characters = new Characters("charDescription", "charName", "textSearch", "characterList",
        "popupCategories", "popupCharacterInfo", "encodedData", "characterPreview", "linkDetails", "cat_", "applyCategories",
        ["category_0", "category_1", "category_2", "category_3"]);
    
    codePointData.setValueCallback(value => characters.onCodePointChanged(value));
    characters.setCharacterCallback(character => codePointData.onUpdateCharacter(character));
};
