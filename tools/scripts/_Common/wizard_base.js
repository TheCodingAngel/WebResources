class WizardBase {
    #currentPosition = 0;
    #actions = [];

    constructor(actions) {
        this.#actions = actions;
    }

    hasNext() {
        return this.#currentPosition < this.#actions.length;
    }

    hasPrevious() {
        return this.#currentPosition > 0;
    }

    onNext() {
        if (!this.hasNext()) {
            return;
        }

        this.#actions[this.#currentPosition].show();
        this.#currentPosition++;
    }

    onPrevious() {
        if (!this.hasPrevious()) {
            return;
        }

        this.#currentPosition--;
        this.#actions[this.#currentPosition].hide();
    }
}

class WizardActionBase {
    #elements = [];
    
    constructor(ids) {
        ids.forEach(elementId => {
            let e = document.getElementById(elementId);
            if (e) {
                this._hideElement(e);
                this.#elements.push(e);
            }
        });
    }
    
    show() {
        this.#elements.forEach(e => {
            this._showElement(e);
        });
    }
    
    hide() {
        this.#elements.forEach(e => {
            this._hideElement(e);
        });
    }
    
    _showElement(element) {
        throw new Error("Method _showElement() must be implemented!");
    }
    
    _hideElement(element) {
        throw new Error("Method _hideElement() must be implemented!");
    }
}

class WizardActionLayout extends WizardActionBase {
    _showElement(element) {
        element.style.removeProperty("display");
    }
    
    _hideElement(element) {
        element.style.display = "none";
    }
}

class WizardActionOpacity extends WizardActionBase {
    _showElement(element) {
        element.style.removeProperty("opacity");
    }
    
    _hideElement(element) {
        element.style.opacity = "0";
    }
}

