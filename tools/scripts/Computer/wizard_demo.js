class Wizard extends WizardBase {
    constructor() {
        super([
            new WizardActionOpacity(["memorySection"]),
            new WizardActionLayout(["cardReader", "loadAtStartAddress", "memoryHeader", "memorySelection"]),
            new WizardActionOpacity(["cpuSection"]),
            new WizardActionOpacity(["outputSection"]),
            new WizardActionOpacity(["instructionReference"]),
            new WizardActionOpacity(["registersSection", "controlSection"]),
            new WizardActionOpacity(["teleprinterSection"]),
            new WizardActionOpacity(["memoryScrolling"]),
            new WizardActionOpacity(["memoryEditing"]),
            new WizardActionLayout(["punchReaderWrap", "resizerInput"]),
            new WizardActionLayout(["siteHeader", "pageHeader", "pageFooter"]),
            
            new WizardActionLayout(["assembleAtStartAddress"]),
            new WizardActionLayout(["espRow", "ebpRow"]),
            new WizardActionLayout(["csRow"]),
            new WizardActionLayout(["idtRow"]),
        ]);
        
        for (let i = 0; i < 11; i++) {
            this.onNext();
        }
    }
}

var wizard = new Wizard();
