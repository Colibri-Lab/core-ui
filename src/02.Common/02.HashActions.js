/**
 * Represents a utility for handling hash actions in the browser.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.HashActions = class extends Colibri.Events.Dispatcher {
    
    
    /**
     * Creates a new instance of Colibri.Common.HashActions. 
     * @constructor 
     */
    constructor() {
        super();
        this.handlers = {};
        this.init();
    }
    
    /**
     * Initializes the hash action handlers and sets up the click event listener.
     * @private
     */
    init() {

        window.addEventListener('hashchange', (e) => this._handleAction(location.hash.substring(1), e));
        
        this.RegisterEvent('ActionRaised', false, 'When action is raised');

        this.__clickEvent = this.__clickEvent ?? ((e) => {
            this._handleAction(e.target.data('action').substring(1), e);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }
    
    /**
     * Handles the DOM ready event.
     * @public
     */
    HandleDomReady() {
        this.InitDOMHandlers();
        this._handleAction(location.hash.substring(1));
    }
    
    /**
     * Initializes DOM event handlers.
     * @public
     */
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

    /**
     * Disposes of the hash action handlers and removes the click event listener from elements with data-action attributes.
     * @returns {void}
     * @public
     */
    Dispose() {
        document.querySelectorAll('[data-action]').forEach((element) => { 
            element.removeEventListener('mousedown', this.__clickEvent);
        }); 
        super.Dispose();
    }
    
    /**
     * Adds a handler for a hash action.
     * @param {string} action - The hash action.
     * @param {Function} handler - The handler function.
     * @public
     */
    AddHandler(action, handler) {
        if(this.handlers[action] === undefined)
            this.handlers[action] = [];
        this.handlers[action].push(handler);
    }

    /**
     * Removes a handler for a hash action.
     * @param {string} action - The hash action.
     * @param {Function} handler - The handler function.
     * @public
     */
    RemoveHandler(action, handler) {
        if(this.handlers[action] === undefined)
            this.handlers[action] = [];
        let index = this.handlers[action].indexOf(handler);
        if(index !== -1) {
            delete this.handlers[action][index];
        }
    }
    
    /**
     * Raises a hash action.
     * @param {string} action - The hash action.
     * @param {Object} [args={}] - Additional arguments.
     * @returns {boolean} - Indicates if the action was raised successfully.
     * @public
     */
    Raise(action, args = {}, domEvent = null) {
        try {
            if(this.handlers[action] === undefined)
                return false;
            var handlers = this.handlers[action];
            for(const handler of handlers) {
                this.Dispatch('ActionRaised', {action: action, args: args, domEvent: domEvent});
                if(!handler.apply(this, [action, args])) {
                    return false;
                }
                return true;
            }
        }
        catch(e) { console.log('no action handler ' + action + ', exception: ' + e); }
        
    }
    
    /**
     * Handles a hash action.
     * @param {string} actionString - The hash action string.
     * @private
     */
    _handleAction(actionString, domEvent) {
        
        var queryString = actionString.toObject('&=');
        if(queryString.action == undefined)
            return  false;
        
        history.replaceState ? 
            history.replaceState("", document.title, window.location.pathname + window.location.search) 
                :
            history.pushState("", document.title, window.location.pathname + window.location.search);
        
        this.Raise(queryString.action, queryString, domEvent);
        
    }
    
}

