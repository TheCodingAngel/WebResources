var assembler;

class Assembler {
    #input;
    #memory;
    
    #statements = [];
    
    #origin = 0;
    #variables = [];
    #labels = [];
    #procedures = [];  // labels (call instead of jump; body ends with "ret")
    
    #instructions = [];
    #data = [];
    
    //static #DEF_SECTION = ["SECTION", "SEGMENT"]; // both are equivalent
    //static #DEF_EXPORT = "GLOBAL";
    static #DEF_ORIGIN = "ORG";
    static #DEF_CONST = "EQU";  // Hex: 0x1F, Oct: 0q17
    static #DEF_CURRENT_ADDRESS = "$";
    
    // Each type allows multitude of comma separated values
    static #DEF_TYPES = new Map([
        ["DB", 1],  // Could be a string ("") or a character ('')
        ["DW", 2],  // Word is 2 characters (for RCA-301 it is called a "diad")
        ["DD", 4],  // Double word
        ["DQ", 8],  // Quad word
    ]);
    
    static #registers = null;
    
    
    static assembleAtStartAddress() {
        if (!isValid(this.#registers)) {
            this.#registers = new Map();
            
            let regIdSize = CPU.registerSize - 1;
            for (let [key, value] of CPU.registersInfo) {
                if (value.hasSubRegisters) {
                    this.#registers.set(value.registerId[1] + "l", padOrCutString(key, regIdSize, "0") + "1");
                    this.#registers.set(value.registerId[1] + "h", padOrCutString(key, regIdSize, "0") + "2");
                    this.#registers.set(value.registerId[1] + "x", padOrCutString(key, regIdSize, "0") + "3");
                    this.#registers.set(value.registerId, padOrCutString(key, regIdSize, "0") + "4");
                } else {
                    this.#registers.set(value.registerId, padOrCutString(key, regIdSize, "0") + "4");
                }
            }
        }
        
        if (isValid(assembler)) {
            assembler._clear();
        }
        assembler = new Assembler(io.getPunchReader(), memory);
        assembler.generateCode();
    }
    
    constructor(input, memory) {
        this.#input = input;
        this.#memory = memory;
        
        this._parseSourceStatements();
    }
    
    generateCode() {
        for (let statement of this.#statements) {
            this._onSecondPass(statement);
        }
        
        //this.#memory.onLoadTextAtStartAddress(this.#instructions.join("") + this.#data.join(""));
    }
    
    _clear() {
        this.#statements.splice(0);
        
        this.#variables.splice(0);
        this.#labels.splice(0);
        this.#procedures.splice(0);
        
        this.#instructions.splice(0);
        this.#data.splice(0);
    }
    
    _parseSourceStatements() {
        //let lines = this.#input.value.split(/\r\n|\r|\n/g);
        
        let src = this.#input.value;
        if (src.length <= 0) {
            return;
        }
        
        let lineIndex = 1;
        let lineStart = 0;
        let lineEnd = 0;
        while (lineEnd < src.length) {
            let ch = src[lineStart];
            
            let leadingCR = false;
            while (lineStart < src.length && this._isNewLine(ch)) {
                lineStart++;
                ch = src[lineStart];
                
                if (ch != '\n' || !leadingCR) {
                    lineIndex++;
                }
                leadingCR = ch == '\r';
            }
            
            if (lineStart >= src.length) {
                break;
            }
            
            lineEnd = lineStart + 1;
            ch = src[lineEnd];
            while (lineEnd < src.length && !this._isNewLine(ch)) {
                lineEnd++;
                ch = src[lineEnd];
            }
            if (lineEnd < src.length) {
                this._onNextStatement(lineIndex, lineStart, lineEnd, src.substring(lineStart, lineEnd));
                lineStart = lineEnd;
            } else {
                this._onNextStatement(lineIndex, lineStart, src.length, src.substring(lineStart));
                break;
            }
        }
    }
    
    _isNewLine(ch) {
        return ch == '\n' || ch == '\r';
    }
    
    _onNextStatement(lineIndex, start, end, text) {
        let withoutComment = text.split(";")[0];
        let expressionTokens = withoutComment.trim().split(" ");
        let statementInfo = this._onFirstPass(lineIndex, start, end, text, expressionTokens);
        if (isValid(statementInfo)) {
            this.#statements.push(statementInfo);
        }
    }
    
    _onFirstPass(lineIndex, start, end, text, expressionTokens) {
        let success = true;
        
        let tokens = [];
        for (let token of expressionTokens) {
            let trimmedToken = token.trim();
            if (trimmedToken.length > 0) {
                tokens.push(trimmedToken);
            }
        }
        
        if (!success) {
            alert(`Error on line ${lineIndex}:\n${text}`);
            this._selectSourceLine(start, end);
            return null;
        }
        
        return {lineIndex: lineIndex, start: start, end: end, expression: tokens};
    }
    
    _onSecondPass(statementInfo) {
        statementInfo.memoryAddress = 60;  // null if not an instruction
    }
    
    _selectStatement(statementInfo) {
        this._selectSourceLine(statementInfo.start, statementInfo.end);
    }
    
    _selectSourceLine(start, end) {
        this.#input.focus();
        this.#input.setSelectionRange(start, end);
    }
}
