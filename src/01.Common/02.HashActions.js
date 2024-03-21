
Colibri.Common.HashActions = class {
    
    
    /** @constructor */
    constructor() {
        this.handlers = {};
        this.init();
    }
    
    init() {
        this.__clickEvent = (e) => {
            this._handleAction(e.target.data('action').substring(1));
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
    }
    
    HandleDomReady() {
        this.InitDOMHandlers();
        this._handleAction(location.hash.substring(1));
    }
    
    
    InitDOMHandlers() {

        Colibri.Common.StartTimer('actions-timer', 500, () => {

            document.querySelectorAll('a[href*="#action"]').forEach((a) => {
                a.data('action', a.attr('href'))
                a.attr('href', 'javascript:void(0)');
            });

            document.querySelectorAll('[data-action]').forEach((element) => { 
                element.removeEventListener('mousedown', this.__clickEvent);
                element.addEventListener('mousedown', this.__clickEvent);
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
    
    Raise(action, args = {}) {
        try {
            if(this.handlers[action] === undefined)
                return false;
            var handlers = this.handlers[action];
            for(const handler of handlers) {
                if(!handler.apply(this, [action, args])) {
                    return false;
                }
                return true;
            }
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

