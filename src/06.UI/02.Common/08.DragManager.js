/**
 * Drag manager
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.UI
 */
Colibri.UI.DragManager = class extends Colibri.Events.Dispatcher {

    /**
     * @constructor
     * @param {Colibri.UI.Component[]} sources array of source items
     * @param {Colibri.UI.Component[]} destinations destination items 
     */
    constructor(sources, destinations) {
        super();

        this._current = null;
        this._sources = [];
        this._destinations = [];

        this.RegisterEvent('DragDropComplete', false, 'Когда перетаскивание завершилось');
        this.RegisterEvent('DragDropOver', false, 'Когда произошло наведение');
        this.RegisterEvent('DragDropLeave', false, 'Когда произошел уход из области');

        this.Reinit(sources, destinations);
    }

    ClearTargets() {
        this._current = null;

        this._sources.forEach((source) => {
            source.draggable = false;
            source.RemoveHandler('DragStart', this.__dragStartFromSources, this);
            source.RemoveHandler('DragEnd', this.__dragEndFromSources, this);
        });

        this._destinations.forEach((dest) => {
            dest.dropable = false;
            dest.RemoveHandler('DragOver', this.__dragOverTheDestination, this);
            dest.RemoveHandler('DragLeave', this.__dragLeaveTheDestination, this);
            dest.RemoveHandler('Drop', this.__dragDropOnTheDestination, this);
        });

        this._sources = [];
        this._destinations = [];
    }
    
    /**
     * Dispose the component
     */
    Dispose() {
        this.ClearTargets();
        super.Dispose();
    }

    /**
     * @private
     */
    Reinit(sources, destinations) {
        
        this.ClearTargets();

        this._sources = sources;
        this._destinations = destinations;

        this._sources.forEach((source) => {
            source.draggable = true;
            source.AddHandler('DragStart', this.__dragStartFromSources, false, this);
            source.AddHandler('DragEnd', this.__dragEndFromSources, false, this);
        });

        this._destinations.forEach((dest) => {
            dest.dropable = true;
            dest.AddHandler('DragOver', this.__dragOverTheDestination, false, this);
            dest.AddHandler('DragLeave', this.__dragLeaveTheDestination, false, this);
            dest.AddHandler('Drop', this.__dragDropOnTheDestination, false, this);
        });

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dragStartFromSources(event, args) {
        //this._current = args.domEvent.target.closest('[data-object-name][draggable="true"]').getUIComponent();
        this._current = args.domEvent.target.closest('[data-object-name][draggable="true"]').getUIComponent();
        this._current.styles = {overflow: 'hidden'};
        console.log('__dragStartFromSources', this._current);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dragEndFromSources(event, args) {
        this._current = null;
        const dropComponent = document.querySelector('.app-drop-component');
        const dropTargetComponent = document.querySelector('.app-drop-target-component');
        dropComponent && dropComponent.classList.remove('app-drop-component');
        dropTargetComponent && dropTargetComponent.classList.remove('app-drop-target-component');

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dragOverTheDestination(event, args) {
        if(!this._current) {
            return false;
        }

        const target = args.domEvent.target;
        target.classList.add('drag-element');

        const dropElement = target.closest('[data-object-name][dropable="true"]');
        if(!dropElement) {
            return false;
        }

        //const dropTarget = dropElement.getUIComponent();
        const dropTarget = dropElement.getUIComponent();
        if(this._current == dropTarget) {
            return false;
        }

        dropTarget.AddClass('app-drop-target-component');
        event.sender.AddClass('app-drop-component');

        let overArgs = {
            effectAllowed: 'all',
            dropEffect: 'move'
        };
        this.Dispatch('DragDropOver', {dragged: this._current, droppedTo: dropTarget, droppedToElement: target, effects: overArgs, domEvent: args.domEvent});

        args.domEvent.dataTransfer.effectAllowed = overArgs.effectAllowed;
        args.domEvent.dataTransfer.dropEffect = overArgs.dropEffect;
        args.domEvent.preventDefault();
        return true;
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dragLeaveTheDestination(event, args) {
        if(!this._current) {
            return false;
        }

        const target = args.domEvent.target;
        target.classList.remove('drag-element');

        const dropElement = target.closest('[data-object-name][dropable="true"]');
        if(!dropElement) {
            return false;
        }

        // const dropTarget = dropElement.getUIComponent();
        const dropTarget = dropElement.getUIComponent();
        dropTarget.RemoveClass('app-drop-target-component');
        event.sender.RemoveClass('app-drop-component');

        this.Dispatch('DragDropLeave', {dragged: this._current, droppedTo: dropTarget, droppedToElement: target, domEvent: args.domEvent});

        args.domEvent.preventDefault();
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dragDropOnTheDestination(event, args) {

        if(!this._current) {
            return false;
        }

        const target = args.domEvent.target;
        target.classList.remove('drag-element');
        
        const dropElement = target.closest('[data-object-name][dropable="true"]');
        if(!dropElement) {
            return false;
        }

        // const dropTarget = dropElement.getUIComponent();
        const dropTarget = dropElement.getUIComponent();
        args.domEvent.preventDefault();

        this.Dispatch('DragDropComplete', {dragged: this._current, droppedTo: dropTarget, droppedToElement: target, domEvent: args.domEvent});

    }
   
}