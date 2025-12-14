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
    #instructionsModule;
    
    #statements = [];
    
    #origin = 0;
    
    #constants = new Map();
    #variables = new Map();
    #labels = new Map();
    #procedures = new Map();  // labels (call instead of jump; body ends with "ret")
    
    #instructions = [];
    #data = [];
    
    static #STR_MARKS = ['"', "'"];
    static #ESCAPE_CHARS = new Map([
        ["\\", "\\"],
        ["n", "\n"],
        ["r", "\r"],
        ["t", "\t"],
        ["v", "\v"],
        ["b", "\b"],
        ["'", "'"],
        ['"', '"'],
    ]);
    
    //static #DEF_SECTION = ["SECTION", "SEGMENT"]; // both are equivalent
    //static #DEF_EXPORT = "GLOBAL";
    static #DEF_ORIGIN = "ORG";
    static #DEF_CONST = "EQU";  // Examples: Hex - 0x1F; Oct - 0q17; Bin - 0b1010_1100
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
        
        let assembler = new Assembler(io.getPunchReader(), memory, instructions);
        if (assembler.parseSourceStatements()) {
            if (assembler.generateCode()) {
                alert("Assembling Successful");
            }
        }
    }
    
    constructor(input, memory, instructionsModule) {
        this.#input = input;
        this.#memory = memory;
        this.#instructionsModule = instructionsModule;
    }
    
    clear() {
        this.#statements.splice(0);
        
        this.#constants.clear();
        this.#variables.clear();
        this.#labels.clear();
        this.#procedures.clear();
        
        this.#instructions.splice(0);
        this.#data.splice(0);
    }
    
    parseSourceStatements() {
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
                if (!this._onNextStatement(lineIndex, lineStart, lineEnd, src.substring(lineStart, lineEnd))) {
                    return false;
                }
                lineStart = lineEnd;
            } else {
                if (!this._onNextStatement(lineIndex, lineStart, src.length, src.substring(lineStart))) {
                    return false;
                }
                break;
            }
        }
        
        return true;
    }
    
    generateCode() {
        for (let label of this.#labels.values()) {
            label.address += this.#origin;
        }
        
        let address = this.#origin;
        for (let i of this.#instructions) {
            i.address = address;
            address += CPU.instructionSize;
        }
        
        address += CPU.instructionSize;  // buffer of 1 empty instruction
        
        for (let v of this.#variables.values()) {
            v.address = address;
            address += v.size;
        }
        
        let dataText = "";
        let codeText = "";
        for (let statementInfo of this.#statements) {
            try
            {
                if (statementInfo.variable) {
                    dataText += this._onSecondPass(statementInfo);
                } else if (statementInfo.instruction) {
                    codeText += this._onSecondPass(statementInfo);
                } else {
                    this._onSecondPass(statementInfo);
                }
            } catch(err) {
                if (err instanceof AssemblerError) {
                    alert(`Error on line ${statementInfo.lineIndex}: ${err.message}:\n${statementInfo.expression.join(", ")}`);
                    console.log(`Error on line ${statementInfo.lineIndex} - ${err.message}: ${statementInfo.expression.join(", ")}`);
                    this._selectSourceLine(statementInfo.start, statementInfo.end);
                    if (err.stack) {
                        console.log(err.stack);
                    }
                    return false;
                } else {
                    throw err;
                }
            }
        }
        
        this.#memory.onLoadTextAtStartAddress(codeText +
            padOrCutString("", CPU.instructionSize, Instructions.INVALID_OPCODE) + dataText);
        
        return true;
    }
    
    _isNewLine(ch) {
        return ch == '\n' || ch == '\r';
    }
    
    _onNextStatement(lineIndex, start, end, text) {
        try
        {
            let withoutComment = text.split(";")[0];
            let expressionTokens = withoutComment.trim().split(" ");
            let statementInfo = this._onFirstPass(lineIndex, start, end, text, expressionTokens);
            if (isValid(statementInfo)) {
                this.#statements.push(statementInfo);
            }
            return true;
        } catch(err) {
            if (err instanceof AssemblerError) {
                alert(`Error on line ${lineIndex}: ${err.message}:\n${text}`);
                console.log(`Error on line ${lineIndex} - ${err.message}: ${text}`);
                this._selectSourceLine(start, end);
                if (err.stack) {
                    console.log(err.stack);
                }
                return false;
            } else {
                throw err;
            }
        }
    }
    
    _onFirstPass(lineIndex, start, end, text, expressionTokens) {
        let tokens = this._getTrimmedTokens(expressionTokens);
        if (tokens.length <= 0) {
            return null;
        }
        
        let statementInfo = {lineIndex: lineIndex, start: start, end: end, expression: tokens};
        
        if (tokens.length >= 2) {
            let first = tokens[0].toUpperCase();
            let second = tokens[1].toUpperCase();
            switch(second) {
                case Assembler.#DEF_CONST:
                    if (tokens.length != 3) {
                        throw new AssemblerError(tokens.length > 3 ? "too many values for constant" : "constant needs a value");
                    }
                    this.#constants.set(tokens[0], {name: tokens[0], value: Assembler._getValue(tokens[2])});
                    break;
                case Assembler.#DEF_RESERVE:
                    if (tokens.length != 3) {
                        throw new AssemblerError(tokens.length > 3 ? "too many values for reservation" : "reservation needs a number of characters");
                    }
                    let size = Assembler._getIntValue(tokens[2]);
                    let variable = {name: tokens[0], value: "0", size: size};
                    this.#variables.set(tokens[0], variable);
                    statementInfo.variable = variable;
                    break;
                default:
                    let varSize = Assembler.#DEF_TYPES.get(second);
                    if (isValid(varSize)) {
                        let variable = {name: tokens[0], tokens: tokens, size: varSize};
                        this.#variables.set(tokens[0], variable);
                        statementInfo.variable = variable;
                    } else {
                        if (!this._parseDirective(first, tokens)) {
                            statementInfo.instruction = this._parseInstruction(tokens);
                        }
                    }
                    break;
            }
        } else {
            let t = tokens[0];
            if (t.endsWith(":")) {
                let labelName = t.substring(0, t.length - 1);
                this.#labels.set(labelName, {name: labelName,
                    address: this.#instructions.length * CPU.instructionSize});
            } else {
                statementInfo.instruction = this._parseInstruction(tokens);
            }
        }
        
        return statementInfo;
    }
    
    _onSecondPass(statementInfo) {
        if (statementInfo.variable) {
            statementInfo.memoryAddress = statementInfo.variable.address;
            if (isValid(statementInfo.variable.tokens)) {
                statementInfo.variable.value = this._getVariableValue(statementInfo.variable.size,
                    statementInfo.variable.tokens);
            }
            if (statementInfo.variable.size == 1) {
                statementInfo.variable.size = statementInfo.variable.value.length;
            }
            return padOrCutString(statementInfo.variable.value.toString(), statementInfo.variable.size, '0');
        }
        
        if (statementInfo.instruction) {
            statementInfo.memoryAddress = statementInfo.instruction.address;
            
            let firstOperand = this._getOperandInfo(statementInfo.instruction.first)
            let secondOperand = this._getOperandInfo(statementInfo.instruction.second)
            if (firstOperand != null && secondOperand != null) {
                let suffix = this.#instructionsModule.getTwoValueSuffix(firstOperand.suffix, secondOperand.suffix);
                return statementInfo.instruction.opcode + suffix + firstOperand.value + secondOperand.value;
            } else if (firstOperand != null) {
                return statementInfo.instruction.opcode + firstOperand.suffix + firstOperand.value + "0000";
            } else {
                return statementInfo.instruction.opcode + " 00000000";
            }
        }
        
        return "";
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
    
    _parseDirective(identifier, tokens) {
        switch(identifier) {
            case Assembler.#DEF_ORIGIN:
                this.#origin = Assembler._getIntValue(tokens[1]);
                return true;
        }
        return false;
    }
    
    _parseInstruction(tokens) {
        let opcode = Assembler.#mnemonics.get(tokens[0].toUpperCase());
        if (!isValid(opcode)) {
            throw new AssemblerError(`incorrect mnemonic code ${tokens[0]}`);
        }
        let first = tokens.length > 1 ? tokens[1] : null;
        let second = tokens.length > 2 ? tokens[2] : null;
        
        let res = {opcode: opcode, first: first, second: second};
        this.#instructions.push(res);
        return res;
    }
    
    static _getValue(str) {
        if (this.#STR_MARKS.includes(str[0])) {
            return this._getStringValue(str);
        }
        
        return this._getIntValue(str);
    }
    
    static _getIntValue(str) {
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
        
        throw new AssemblerError(`invalid value (${str})`);
    }
    
    static _getStringValue(str) {
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
            let v = this._getValueFromToken(tokens[i]);
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
    
    _getValueFromToken(token) {
        if (Assembler.#STR_MARKS.includes(token[0])) {
            return Assembler._getStringValue(token);
        }
        
        let constant = this.#constants.get(token);
        if (isValid(constant)) {
            return constant.value;
        }
        
        let referenced = this._getReference(token);
        if (referenced != null) {
            let variable = this.#variables.get(referenced);
            if (isValid(variable)) {
                return variable.value;
            }
        } else {
            let variable = this.#variables.get(token);
            if (isValid(variable)) {
                return variable.address;
            }
        }
        
        let label = this.#labels.get(token);
        if (isValid(label)) {
            return label.address;
        }
        
        return Assembler._getIntValue(token);
    }
    
    _getOperandInfo(operand) {
        if (!isValid(operand)) {
            return null;
        }
        
        if (typeof(operand) == "number") {
            return {suffix: "V", value: Assembler._getOperandValue(operand)};
        }
        
        let referenced = this._getReference(operand);
        if (referenced != null) {
            let referenced = operand.slice(1, -1);
            
            let constant = this.#constants.get(referenced);
            if (isValid(constant)) {
                referenced = constant;
            }
            
            let operandData = this._getOperandData(referenced);
            return {suffix: operandData.isRegister ? "A" : "P", value: operandData.value};
        } else if (operand.length > 0) {
            let constant = this.#constants.get(operand);
            if (isValid(constant)) {
                operand = constant.value;
            }
            
            let operandData = this._getOperandData(operand);
            return {suffix: operandData.isRegister ? "R" : "V", value: operandData.value};
        }
    }
    
    _getReference(value) {
        if (value.length > 2 && value[0] == '[' && value[value.length - 1] == ']') {
            return value.slice(1, -1);
        }
        return null;
    }
    
    _getOperandData(operand) {
        if (typeof(operand) == "string") {
            let register =  Assembler.#registers.get(operand.toUpperCase());
            if (isValid(register)) {
                return {isRegister: true, value: Assembler._getOperandValue(register)};
            }
        }
        
        let variable = this.#variables.get(operand);
        if (isValid(variable)) {
            return {isRegister: false, value: Assembler._getOperandValue(variable.address)};
        }
        
        let label = this.#labels.get(operand);
        if (isValid(label)) {
            return {isRegister: false, value: Assembler._getOperandValue(label.address)};
        }
        
        return {isRegister: false, value: Assembler._getOperandValue(operand)};
    }
    
    static _getOperandValue(operand) {
        let value = this._getValue(operand);
        if (typeof(value) == "number") {
            return padOrCutNumber(value, CPU.registerSize);
        }
        return padOrCutString(value, CPU.registerSize, '0');
    }
    
    _selectStatement(statementInfo) {
        if (isValid(statementInfo)) {
            this._selectSourceLine(statementInfo.start, statementInfo.end);
        }
    }
    
    _selectSourceLine(start, end) {
        this.#input.focus();
        this.#input.setSelectionRange(start, end);
    }
}
