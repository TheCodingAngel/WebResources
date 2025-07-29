class Updater {
    static #TICK_PERIOD_MS = 20;
    
    static #ALL_TICK_PARAMS = [
        {start: 20, period:  1000 * 1000 / Updater.#TICK_PERIOD_MS},
        {start: 120, period: 1000 * 1000 / Updater.#TICK_PERIOD_MS},
        {start: 220, period: 200 * 1000 / Updater.#TICK_PERIOD_MS},
        {start: 320, period:  40 * 1000 / Updater.#TICK_PERIOD_MS},
        {start: 420, period:  10 * 1000 / Updater.#TICK_PERIOD_MS},
    ];
    
    #ticks;
    #tickIndex;
    #tickIncrement;
    #tickParams;
    
    #minValue;
    #maxValue;
    #value;
    
    #updateCallback;
    #timer;
    
    
    constructor(min, max, speedUpLevel, updateCallback) {
        this.#ticks = 0;
        this.#tickIndex = 0;
        this.#tickIncrement = 1;
        
        this.#tickParams = [];
        if (speedUpLevel < 0) {
            speedUpLevel = Updater.#ALL_TICK_PARAMS.length;
        }
        for (let i = 0; i < speedUpLevel; i++) {
            if (i >= Updater.#ALL_TICK_PARAMS.length) {
                break;
            }
            this.#tickParams.push(Updater.#ALL_TICK_PARAMS[i]);
        }
        
        this.#minValue = min;
        this.#maxValue = max;
        this.#value = min;
        
        this.#updateCallback = updateCallback;
    }
    
    start(value, initialIncrement) {
        if (this.#timer != null) {
            return;
        }
        
        this.#ticks = 0;
        this.#tickIndex = 0;
        this.#tickIncrement = initialIncrement;
        
        this.#value = value;
        
        let _this = this;
        this.#timer = setInterval(function() {_this._onTimer();}, Updater.#TICK_PERIOD_MS);
    }

    stop() {
        if (this.#timer) {
            clearInterval(this.#timer);
            this.#timer = null;
        }
    }
    
    _onTimer() {
        this.#ticks++;
        
        if (this.#ticks < this.#tickParams[0].start) {
            return;
        }
        
        let isDecrementing = this.#tickIncrement < 0;
        
        if (this.#tickIndex < this.#tickParams.length - 1 && this.#ticks >= this.#tickParams[this.#tickIndex + 1].start) {
            this.#tickIndex++;
            this.#tickIncrement = (this.#maxValue - this.#minValue) / this.#tickParams[this.#tickIndex].period;
            if (isDecrementing) {
                this.#tickIncrement = -this.#tickIncrement;
            }
        }
        
        this.#value = this.#value + this.#tickIncrement;
        
        let isReachedTheEnd = isDecrementing ? this.#value <= this.#minValue : this.#value >= this.#maxValue;
        if (isReachedTheEnd) {
            this.stop();
            this.#updateCallback(isDecrementing ? this.#minValue : this.#maxValue, this.#tickIncrement);
        } else {
            this.#updateCallback(Math.round(this.#value), this.#tickIncrement);
        }
    }
}

