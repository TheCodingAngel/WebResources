class Updater {
    #speedSlider;
    #updateCallback;
    
    #timer;
    #tickValue;
    
    constructor(speedSliderId, updateCallback) {
        this.#speedSlider = document.getElementById(speedSliderId);
        this.#updateCallback = updateCallback;
        this.setSpeed(this.#speedSlider.value);
    }
    
    start() {
        if (this.#timer == null) {
            let _this = this;
            this.#timer = setInterval(function() {_this.#updateCallback(_this.#tickValue);}, 20);
        }
    }

    pause() {
        if (this.#timer) {
            clearInterval(this.#timer);
            this.#timer = null;
        }
    }

    setSpeed(value) {
        if (value === this.#speedSlider.max) {
            this.#tickValue = 1;
        }
        else {
            this.#tickValue = parseFloat(value);
        }
    }
}


class CounterWidgetBase {
    #updater;
    
    _allCounters = [];
    #leadingCounterIdx = 0;
    #value = 0;
    
    #valueSlider;
    #valueNumberInput;
    #minValueLabel;
    #maxValueLabel;

    constructor(config) {
      let _this = this;
      this.#updater = new Updater(config.speedSliderId, function(delta) {
        _this.#value += delta;
        _this._setValue(_this.#value);
      });
      
      this.#valueNumberInput = document.getElementById(config.valueInputId);
      this.#valueSlider = document.getElementById(config.valueSliderId);
      this.#minValueLabel = document.getElementById(config.minValueLabelId);
      this.#maxValueLabel = document.getElementById(config.maxValueLabelId);
      
      this._allCounters = config.counters;
      this.#leadingCounterIdx = config.leadingCounterIdx;
      this._setBounds();
      this._setValue(this.#value);
    }
    
    setSpeed(value) {
        this.#updater.setSpeed(value);
    }
    
    start() {
        this.#updater.start();
    }
    
    pause() {
        this.#updater.pause();
    }
    
    reset() {
      this.#updater.pause();
      this.#value = 0;
      for (let i in this._allCounters) {
        this._allCounters[i].set(0);
      }
      this._setValue(this.#value);
    }
    
    setMinValue() {
      this._setValue(this._allCounters[this.#leadingCounterIdx].getLowerBound());
    }
    
    setMaxValue() {
      this._setValue(this._allCounters[this.#leadingCounterIdx].getUpperBound());
    }
    
    setValueNumEdit(val) {
      this._setValue(parseFloat(val), true, false);
    }
    
    setValueSlider(val) {
      this._setValue(parseFloat(val), false, true);
    }
    
    setAllowNegative(allowNegative) {
      for (let i in this._allCounters) {
        let val = this._allCounters[i].setAllowNegative(allowNegative);
        if (i == this.#leadingCounterIdx) {
            this.#value = val;
        }
      }
      
      this._setBounds();
      this._setValue(this.#value);
    }
    
    setDigits(digitCount) {
        for (let i in this._allCounters) {
            this._allCounters[i].setDigits(digitCount);
        }
        this._setBounds();
    }
    
    setLeadingCounterIdx(newIndex) {
        this.#leadingCounterIdx = newIndex;
        this._setBounds();
    }
    
    _getValue() {
        return this.#value;
    }
    
    _setValue(val, updateSlider = true, updateNumEdit = true) {
      this._setValueCounters(val);
      if (updateSlider) {
        this._setValueSlider(this.#value);
      }
      if (updateNumEdit) {
        this._setValueNumberInput(val);
      }
    }

    _setValueCounters(val) {
      this.#value = isNaN(val) ? 0 : val;
      for (let i in this._allCounters) {
        this._allCounters[i].set(this.#value);
      }
    }

    _setValueSlider(val) {
      this.#valueSlider.value = Math.min(val, parseInt(this.#valueSlider.max));
    }

    _setValueNumberInput(val) {
      this.#valueNumberInput.value = Math.floor(val);
    }
    
    _setBounds() {
      this.#valueSlider.min = this._allCounters[this.#leadingCounterIdx].getLowerBound();
      this.#valueSlider.max = this._allCounters[this.#leadingCounterIdx].getUpperBound();
      
      this.#minValueLabel.innerHTML = this.#valueSlider.min.toString(10);
      this.#maxValueLabel.innerHTML = this.#valueSlider.max.toString(10);
    }
}
