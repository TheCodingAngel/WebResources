window.onload = function() {
    textApi = new TextApi("languageList", "glyphs", "modifiers", "textField", "codePointTree",
        ["encUtf8", "encUtf16Le", "encUtf16Be"],
        "popupStrings", "popupCodePointTree");
};
