class Wizard extends WizardBase {
    constructor() {
        super([
            new WizardActionLayout(["assembleAtStartAddress"]),
            new WizardActionLayout(["espRow", "ebpRow"]),
            new WizardActionLayout(["csRow"]),
            new WizardActionLayout(["idtRow"]),
        ]);
    }
}

var wizard = new Wizard();
