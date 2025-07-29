class UnicodeBlock {
    static MAX_CODE_POINTS_IN_BLOCK = 0x100;
    
    static MIN_CODE_POINT_NUM = 0;
    static MAX_CODE_POINT_NUM = 0x10FFFF;
    static CODEPOINTS_IN_PLANE = 0x10000;
    
    static SPECIALS = [
        {start:   0xD800, end:   0xDB7F, isBlock: true, name: "High Surrogate"},
        {start:   0xDB80, end:   0xDBFF, isBlock: true, name: "High Private Use Surrogate"},
        {start:   0xDC00, end:   0xDFFF, isBlock: true, name: "Low Surrogate"},
        {start:   0xE000, end:   0xF8FF, isBlock: true, name: "Private Use"},
        
        {start:   0xFDD0, end:   0xFDEF, isBlock: true, name: "Non Character"},
        
        {start:   0xFFFE, end:   0xFFFF, isBlock: false, name: "Non Character"},
        {start:  0x1FFFE, end:  0x1FFFF, isBlock: false, name: "Non Character"},
        {start:  0x2FFFE, end:  0x2FFFF, isBlock: false, name: "Non Character"},
        {start:  0x3FFFE, end:  0x3FFFF, isBlock: false, name: "Non Character"},
        {start:  0x4FFFE, end:  0x4FFFF, isBlock: false, name: "Non Character"},
        {start:  0x5FFFE, end:  0x5FFFF, isBlock: false, name: "Non Character"},
        {start:  0x6FFFE, end:  0x6FFFF, isBlock: false, name: "Non Character"},
        {start:  0x7FFFE, end:  0x7FFFF, isBlock: false, name: "Non Character"},
        {start:  0x8FFFE, end:  0x8FFFF, isBlock: false, name: "Non Character"},
        {start:  0x9FFFE, end:  0x9FFFF, isBlock: false, name: "Non Character"},
        {start:  0xAFFFE, end:  0xAFFFF, isBlock: false, name: "Non Character"},
        {start:  0xBFFFE, end:  0xBFFFF, isBlock: false, name: "Non Character"},
        {start:  0xCFFFE, end:  0xCFFFF, isBlock: false, name: "Non Character"},
        {start:  0xDFFFE, end:  0xDFFFF, isBlock: false, name: "Non Character"},
        {start:  0xEFFFE, end:  0xEFFFF, isBlock: false, name: "Non Character"},
        
        {start:  0xF0000, end:  0xFFFFD, isBlock: true, name: "Supplementary Private Use A"},
        {start:  0xFFFFE, end:  0xFFFFF, isBlock: false, name: "Non Character"},
        
        {start: 0x100000, end: 0x10FFFD, isBlock: true, name: "Supplementary Private Use B"},
        {start: 0x10FFFE, end: 0x10FFFF, isBlock: false, name: "Non Character"},
    ];
    
    #blk;
    #blkEnd;
    #index;
    
    #start;
    #end;
    #characterCount;
    
    constructor(blk, index, codePoint) {
        this.#blk = blk;
        this.#index = index;
        
        let start = blk.first;
        let end = index < UnicodeBlocks.length - 1 ? UnicodeBlocks[index + 1].first - 1 : UnicodeBlock.MAX_CODE_POINT_NUM;
        
        this.#blkEnd = end;
        let characterCount = end - start + 1;
        
        if (characterCount > UnicodeBlock.MAX_CODE_POINTS_IN_BLOCK) {
            let offset = codePoint - start;
            start = Math.max(blk.first, codePoint - offset % UnicodeBlock.MAX_CODE_POINTS_IN_BLOCK);
            end = Math.min(end, start + UnicodeBlock.MAX_CODE_POINTS_IN_BLOCK - 1);
            characterCount = end - start + 1;
        }
        
        this.#start = start;
        this.#end = end;
        this.#characterCount = characterCount;
    }
    
    getName() {
        return this.#blk.name;
    }
    
    getStart() {
        return this.#start;
    }
    
    getEnd() {
        return this.#end;
    }
    
    getCharacterCount() {
        return this.#characterCount;
    }
    
    getNextBlock() {
        let nextStart = this.#end + 1;
        if (nextStart <= this.#blkEnd) {
            return new UnicodeBlock(this.#blk, this.#index, nextStart);
        }
        
        let nextIndex = this.#index + 1;
        if (nextIndex < UnicodeBlocks.length) {
            let blk = UnicodeBlocks[nextIndex];
            return new UnicodeBlock(blk, nextIndex, blk.first);
        }
        
        return null;
    }
    
    getPrevBlock() {
        if (this.#start > this.#blk.first) {
            let prevStart = Math.max(this.#blk.first, this.#start - UnicodeBlock.MAX_CODE_POINTS_IN_BLOCK);
            return new UnicodeBlock(this.#blk, this.#index, prevStart);
        }
        
        let prevIndex = this.#index - 1;
        if (prevIndex >= 0) {
            let blk = UnicodeBlocks[prevIndex];
            
            let prevSize = (this.#start - blk.first) % UnicodeBlock.MAX_CODE_POINTS_IN_BLOCK;
            if (prevSize < 1) {
                prevSize = UnicodeBlock.MAX_CODE_POINTS_IN_BLOCK;
            }
            
            let start = Math.max(blk.first, this.#start - prevSize);
            return new UnicodeBlock(blk, prevIndex, start);
        }
        
        return null;
    }
    
    static getNextSpecial(fromCodePoint) {
        let index = UnicodeBlock._getSpecialIndex(fromCodePoint);
        
        let specialInfo = UnicodeBlock.SPECIALS[index];
        
        if (fromCodePoint < specialInfo.start) {
            return specialInfo.start;
        }
        
        if (specialInfo.isBlock && fromCodePoint < specialInfo.end) {
            return specialInfo.end;
        }
        
        fromCodePoint++;
        
        if (specialInfo.isBlock || fromCodePoint > specialInfo.end) {
            if (index < UnicodeBlock.SPECIALS.length - 1) {
                return UnicodeBlock.SPECIALS[index + 1].start;
            } else {
                return null;
            }
        }
        
        return fromCodePoint;
    }
    
    static getPrevSpecial(fromCodePoint) {
        let index = UnicodeBlock._getSpecialIndex(fromCodePoint);
        
        let specialInfo = UnicodeBlock.SPECIALS[index];
        
        if (fromCodePoint > specialInfo.end) {
            return specialInfo.end;
        }
        
        if (specialInfo.isBlock && fromCodePoint > specialInfo.start) {
            return specialInfo.start;
        }
        
        fromCodePoint--;
        
        if (specialInfo.isBlock || fromCodePoint < specialInfo.start) {
            if (index > 0) {
                return UnicodeBlock.SPECIALS[index - 1].end;
            }
            return null;
        }
        
        return fromCodePoint;
    }
    
    static getZeroBlock() {
        return new UnicodeBlock(UnicodeBlocks[0], 0, 0);
    }
    
    static getBlock(codePoint) {
        let index = binarySearch(UnicodeBlocks, codePoint, (cp, item) => cp - item.first);
        if (index < 0) {
            // The "not found" results are offset with 1 to support "-0" (which becomes "-1" with the offset).
            let insertIndex = -index - 1;
            // We subtract an additional 1 since we are interested after which block we are "inserting"
            index = Math.max(insertIndex - 1, 0);
        }
        return new UnicodeBlock(UnicodeBlocks[index], index, codePoint);
    }
    
    static getSpecial(codePoint) {
        let index = UnicodeBlock._getSpecialIndex(codePoint);
        let specialInfo = UnicodeBlock.SPECIALS[index];
        
        return (codePoint >= specialInfo.start && codePoint <= specialInfo.end) ? specialInfo : null;
    }
    
    static getSpecialDescription(special) {
        if (special.isBlock) {
            return `${special.name} (U+${toHexString(special.start, 4)} - U+${toHexString(special.end, 4)})`;
        }
        return special.name;
    }
    
    static _getSpecialIndex(codePoint) {
        let index = binarySearch(UnicodeBlock.SPECIALS, codePoint, (cp, item) => cp - item.start);
        if (index < 0) {
            // The "not found" results are offset with 1 to support "-0" (which becomes "-1" with the offset).
            let insertIndex = -index - 1;
            // We subtract an additional 1 since we are interested after which specials we are "inserting"
            index = Math.max(insertIndex - 1, 0);
        }
        return index;
    }
    
    /*
    static collectScriptBlocks(scriptName) {
        let res = [];
        
        let asciiNames = ["ASCII", "Latin", "Basic Latin"];
        if (asciiNames.includes(scriptName)) {
            res.push(new UnicodeBlock(UnicodeBlocks[0], 0, 0));
        }
        
        for (let i = 1; i < UnicodeBlocks.length; i++) {
            let blk = UnicodeBlocks[i];
            if (blk.name.startsWith(scriptName)) {
                res.push(new UnicodeBlock(blk, i, blk.first));
            }
        }
        
        return res;
    }
    */
}
