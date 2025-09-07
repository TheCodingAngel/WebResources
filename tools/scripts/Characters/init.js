window.onload = function() {
    wizard = new Wizard();
    
    counterTernary = new CounterWidgetTernary();
    counterOctHex = new CounterWidgetOctHex();
    
    document.onkeyup = function (e) {
        switch(e.key.toUpperCase()) {
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
};
