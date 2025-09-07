var wizard;

class Wizard extends WizardBase {
    constructor() {
        super([
            new WizardActionLayout(["wordSection"]),
        ]);
        
        this.onNext();
    }
}
