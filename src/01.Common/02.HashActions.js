
Colibri.Common.HashActions = class {
    
    
    /** @constructor */
    constructor() {
        this.handlers = {};
        this.init();
    }
    
    init() {
        window.addEventListener('hashchange', () => {
            this._handleAction(location.hash.substring(1));
        });
    }
    
    HandleDomReady() {
        this.InitDOMHandlers();
        this._handleAction(location.hash.substring(1));
    }
    
    InitDOMHandlers() {
        document.querySelectorAll('[data-action]').forEach((element) => {
            element.addEventListener('click', (е) => {
                let el = e.currentTarget;
                location.hash = '#' + el.dataset.action;
                return false;
            });
        }); 
    }
    
    AddHandler(action, handler) {
        if(this.handlers[action] === undefined)
            this.handlers[action] = [];
        this.handlers[action].push(handler);
    }

    RemoveHandler(action, handler) {
        if(this.handlers[action] === undefined)
            this.handlers[action] = [];
        let index = this.handlers[action].indexOf(handler);
        if(index !== -1) {
            delete this.handlers[action][index];
        }
    }
    
    Raise(action, args) {
        try {
            if(this.handlers[action] === undefined)
                return false;
            
            var handlers = this.handlers[action];
            handlers.forEach((handler) => {
                if(!handler.apply(this, [action, args])) {
                    return false;
                }
                return true;
            });
        }
        catch(e) { console.log('no action handler ' + action + ', exception: ' + e); }
        
    }
    
    _handleAction(actionString) {
        
        var queryString = actionString.toObject('&=');
        if(queryString.action == undefined)
            return  false;
        
        history.replaceState ? 
            history.replaceState("", document.title, window.location.pathname + window.location.search) 
                :
            history.pushState("", document.title, window.location.pathname + window.location.search);
        
        this.Raise(queryString.action, queryString);
        
    }
    
}

