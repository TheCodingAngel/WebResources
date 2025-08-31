function init() {
    /*
    videoManager = new VideoManager();
    */

    PopupCenter.init("popupText", "popupNumeric");

    let addressStartElement = document.getElementById("addressStart");
    let addressEndElement = document.getElementById("addressEnd");
    let memoryPanel = document.getElementById("memoryPanel");
    let memoryData = document.getElementById("memoryData");
    let editMemoryByRows = document.getElementById("editMemoryByRows");
    let magneticTape = document.getElementById("magneticTape");
    memory = new Memory(addressStartElement, addressEndElement, memoryPanel, memoryData, magneticTape, editMemoryByRows.checked);

    let punchReader = document.getElementById("punchReader");
    let ignoreSingleNewLinesCheckbox = document.getElementById("punchReaderIgnoreSingleNewLinesCheckbox");
    let printer = document.getElementById('printer');
    let teleprinter = document.getElementById('teleprinter');
    io = new IO(memory, punchReader, ignoreSingleNewLinesCheckbox, printer, teleprinter);

    let registersElement = document.getElementById("REGS_GENERAL");
    let registerPointersElement = document.getElementById("REGS_POINTERS");
    let controlElement = document.getElementById("ECONTROL");
    let flagsElement = document.getElementById("EFLAGS");
    let autoScrollElement = document.getElementById("autoScrollMemory");
    cpu = new CPU(memory, io, registersElement, registerPointersElement, controlElement, flagsElement, autoScrollElement.checked);

    let executionIntervalElement = document.getElementById("executionInterval");
    let runExecutionButon = document.getElementById("runExecution");
    let cancelExecutionButton = document.getElementById("cancelExecution");
    emulator = new Emulator(memory, io, cpu, runExecutionButon, cancelExecutionButton, executionIntervalElement);
    
    instructions = new Instructions(memory, io, cpu, emulator);
    emulator.setExecuteInstructionCallback(instructions.executeInstruction.bind(instructions));

    let addressScroll = document.getElementById("addressScroll");
    addressScroll.onkeyup = function (e) {
        if (Keys.isEnter(e.key)) {
            memory.scrollToAddress(this);
        }
    }

    addressStartElement.onkeyup = function (e) {
        if (Keys.isEnter(e.key)) {
            memory.onSelectStartAddress();
        }
    }

    addressEndElement.onkeyup = function (e) {
        if (Keys.isEnter(e.key)) {
            memory.onSelectEndAddress();
        }
    }

    document.onkeydown = function (e) {
        switch(e.key.toUpperCase()) {
            case 'C':
                if (e.altKey) {
                    emulator.cancel();
                }
                break;
            case 'P':
                if (e.altKey) {
                    emulator.stepOver();
                }
                break;
            case 'I':
                if (e.altKey) {
                    emulator.stepIn();
                }
                break;
            case 'O':
                if (e.altKey) {
                    emulator.stepOut();
                }
                break;
        }
    };

    document.onkeyup = function (e) {
        switch(e.key.toUpperCase()) {
            case 'G':
                if (e.altKey) {
                    emulator.run();
                }
                break;
            case '+':
                if (e.altKey) {
                    wizard.onNext();
                }
                break;
            case '-':
                if (e.altKey) {
                    wizard.onPrevious();
                }
                break;
        }
    };

    let verticalResizers = document.querySelectorAll(".resizer-vertical");
    if (verticalResizers) {
        verticalResizers.forEach(function(node) {
            initResizer(node, true);
        });
    }

    let horizontalResizers = document.querySelectorAll(".resizer-horizontal");
    if (horizontalResizers) {
        horizontalResizers.forEach(function(node) {
            initResizer(node, false);
        });
    }
}

window.onload = init;
