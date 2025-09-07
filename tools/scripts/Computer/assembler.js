var assembler;

class AssemblerError extends Error {
    constructor(message) {
        super("\n" + message);
        // Using this.constructor.name leads to weird names when minifying
        this.name = "AssemblerError";
    }
}

class Assembler {
    #input;
    #memory;
    
    #statements = [];
    
    #origin = 0;
    #variablesSize = 0;
    
    #constants = [];
    #variables = [];
    #labels = [];
    #procedures = [];  // labels (call instead of jump; body ends with "ret")
    
    #instructions = [];
    #data = [];
    
    static #STR_MARKS = ['"', "'"];
    static #ESCAPE_CHARS = new Map([
        ["\\", "\\"],
        ["n", "\n"],
        ["r", "\r"],
        ["t", "\t"],
        ["'", "'"],
        ['"', '"'],
    ]);
    
    //static #DEF_SECTION = ["SECTION", "SEGMENT"]; // both are equivalent
    //static #DEF_EXPORT = "GLOBAL";
    static #DEF_ORIGIN = "ORG";
    static #DEF_CONST = "EQU";  // Hex: 0x1F, Oct: 0q17, Bin: 0b1010_1100
    static #DEF_CURRENT_ADDRESS = "$";
    
    // Each type allows multitude of comma separated values
    static #DEF_TYPES = new Map([
        ["DC", 1],  // Could be a string ("") or a character ('')
        ["DW", 2],  // Word is 2 characters (for RCA-301 it is called a "diad")
        ["DD", 4],  // Double word
        ["DQ", 8],  // Quad word
    ]);
    
    static #DEF_RESERVE = "RES";  // Like DC but without initialization
    
    static #registers = null;  // "EAX" -> "0014", ...
    static #mnemonics = null;  // "HLT" -> ".", ...
    
    
    static assembleAtStartAddress() {
        if (!isValid(this.#registers)) {
            this.#registers = new Map();
            
            let regIdSize = CPU.registerSize - 1;
            for (let [key, value] of CPU.registersInfo) {
                if (value.hasSubRegisters) {
                    this.#registers.set(value.registerId[1].toUpperCase() + "L", padOrCutString(key, regIdSize, "0") + "1");
                    this.#registers.set(value.registerId[1].toUpperCase() + "H", padOrCutString(key, regIdSize, "0") + "2");
                    this.#registers.set(value.registerId[1].toUpperCase() + "X", padOrCutString(key, regIdSize, "0") + "3");
                    this.#registers.set(value.registerId.toUpperCase(), padOrCutString(key, regIdSize, "0") + "4");
                } else {
                    this.#registers.set(value.registerId.toUpperCase(), padOrCutString(key, regIdSize, "0") + "4");
                }
            }
        }
        
        if (!isValid(this.#mnemonics)) {
            this.#mnemonics = instructions.getMnemonics();
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
        
        this.#constants.splice(0);
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
        
        let tokens = this._getTrimmedTokens(expressionTokens);
        
        try
        {
            if (tokens.length <= 0) {
                return null;
            }
            
            if (tokens.length >= 2) {
                let first = tokens[0].toUpperCase();
                let second = tokens[1].toUpperCase();
                switch(second) {
                    case Assembler.#DEF_CONST:
                        if (tokens.length != 3) {
                            throw new AssemblerError(tokens.length > 3 ? "too many values for constant" : "constant needs a value");
                        }
                        this.#constants.push({name: tokens[0], value: this._getValue(tokens[2])});
                        break;
                    case Assembler.#DEF_RESERVE:
                        if (tokens.length != 3) {
                            throw new AssemblerError(tokens.length > 3 ? "too many values for reservation" : "reservation needs a number of characters");
                        }
                        let size = this._getIntValue(tokens[2]);
                        this.#variables.push({name: tokens[0], value: "".padEnd(size, "0"), address: this.#variablesSize});
                        this.#variablesSize += size;
                        break;
                    default:
                        let varSize = Assembler.#DEF_TYPES.get(second);
                        if (isValid(varSize)) {
                            let value = this._getVariableValue(varSize, tokens);
                            this.#variables.push({name: tokens[0], value: value, address: this.#variablesSize});
                            this.#variablesSize += value.length;
                        } else {
                            if (first == Assembler.#DEF_ORIGIN) {
                                this.#origin = this._getIntValue(tokens[1]);
                            } else {
                                this._parseInstruction(tokens);
                            }
                        }
                        break;
                }
            } else {
                let t = tokens[0];
                if (t.endsWith(":")) {
                    this.#labels.push({name: t.substring(0, t.length - 1),
                        address: this.#instructions.length * CPU.instructionSize});
                } else {
                    this._parseInstruction(tokens);
                }
            }
        } catch(err) {
            if (err instanceof AssemblerError) {
                alert(`Error on line ${lineIndex} - ${err.message}:\n${text}`);
                console.log(`Error on line ${lineIndex} - ${err.message}: ${text}`);
                this._selectSourceLine(start, end);
                if (err.stack) {
                    console.log(err.stack);
                }
                return null;
            } else {
                throw err;
            }
        }
        
        return {lineIndex: lineIndex, start: start, end: end, expression: tokens};
    }
    
    _onSecondPass(statementInfo) {
        statementInfo.memoryAddress = 60;  // null if a directive or a constant
        
        for (let label of this.#labels) {
            label.address += this.#origin;
        }
        
        let address = this.#origin;
        for (let i of this.#instructions) {
            i.address = address;
            address += CPU.instructionSize;
        }
        
        address += CPU.instructionSize;  // buffer of 1 empty instruction
        
        for (let v of this.#variables) {
            v.address += address;
        }
    }
    
    _getTrimmedTokens(tokens) {
        let result = [];
        for (let t of tokens) {
            let trimmedToken = t.trim();
            if (trimmedToken.length > 0) {
                this._addNonEmptyTokens(result, trimmedToken.split(","));
            }
        }
        return result;
    }
    
    _addNonEmptyTokens(base, tokens) {
        for (let t of tokens) {
            if (t.length > 0) {
                base.push(t);
            }
        }
    }
    
    _parseInstruction(tokens) {
        let opcode = Assembler.#mnemonics.get(tokens[0].toUpperCase());
        if (!isValid(opcode)) {
            throw new AssemblerError(`incorrect mnemonic code ${tokens[0]}`);
        }
        let first = tokens.length > 1 ? tokens[1] : null;
        let second = tokens.length > 2 ? tokens[2] : null;
        this.#instructions.push({opcode: opcode, first: first, second: second});
    }
    
    _getValue(str) {
        if (Assembler.#STR_MARKS.includes(str[0])) {
            return this._getStringValue(str);
        }
        
        return this._getIntValue(str);
    }
    
    _getIntValue(str) {
        let value = parseIntOrNull(str); // converts correctly hexadecimals that start with "0x"
        if (value != null) {
            return value;
        }
        
        if (str.startsWith("0q")) {
            value = parseIntOrNull(str.substring(2), 8);
            if (value == null) {
                throw new AssemblerError(`invalid octal value "${str}"`);
            }
            return value;
        }
        
        if (str.startsWith("0b")) {
            value = parseIntOrNull(str.substring(2).replaceAll("_", ""), 2);
            if (value == null) {
                throw new AssemblerError(`invalid binary value "${str}"`);
            }
            return value;
        }
        
        throw new AssemblerError(`invalid value "${str}"`);
    }
    
    _getStringValue(str) {
        if (str.length < 2) {
            throw new AssemblerError(`invalid string value (${str})`);
        }
        let mark = str[0];
        if (mark != str[str.length - 1]) {
            throw new AssemblerError(`invalid string value (${str})`);
        }
        if (!Assembler.#STR_MARKS.includes(str[0])) {
            throw new AssemblerError(`invalid string value (${str})`);
        }
        let result = "";
        for (let i = 1; i < str.length - 1; i++) {
            let ch = str[i];
            if (ch == mark) {
                throw new AssemblerError(`invalid string value (${str})`);
            }
            if (ch == "\\") {
                i++;
                if (i >= str.length - 1) {
                    throw new AssemblerError(`string ending with escape character (${str})`);
                }
                ch = str[i];
                let esc = Assembler.#ESCAPE_CHARS.get(ch);
                if (esc) {
                    result += esc;
                } else {
                    throw new AssemblerError(`invalid escape sequence - to have "\\" you need to duplicate it (${str})`);
                }
            } else {
                result += ch;
            }
        }
        return result;
    }
    
    _getVariableValue(varSize, tokens) {
        let value = "";
        for (let i = 2; i < tokens.length; i++) {
            let v = this._getValue(tokens[i]);
            if (typeof(v) == "number") {
                value += varSize == 1 ? String.fromCodePoint(v) : padOrCutNumber(v, varSize);
            } else if (typeof(v) == "string") {
                value += v;
            } else {
                throw new AssemblerError("incorrect value");
            }
        }
        let padChars = Math.ceil(value.length / varSize) * varSize;
        return padWithHaltOrCut(value, padChars);
    }
    
    _selectStatement(statementInfo) {
        this._selectSourceLine(statementInfo.start, statementInfo.end);
    }
    
    _selectSourceLine(start, end) {
        this.#input.focus();
        this.#input.setSelectionRange(start, end);
    }
}
