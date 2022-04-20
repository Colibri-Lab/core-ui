Colibri.UI.DragManager = class extends Colibri.Events.Dispatcher {

    /**
     * Менеджер перетаскиваний
     * @param {Colibri.UI.Component[]} sources массив источников
     * @param {Colibri.UI.Component[]} destinations массив назначений 
     */
    constructor(sources, destinations) {
        super();

        this._current = null;

        this._sources = sources;
        this._destinations = destinations;

        this.RegisterEvent('DragDropComplete', false, 'Когда перетаскивание завершилось');
        this.RegisterEvent('DragDropOver', false, 'Когда произошло наведение');
        this.RegisterEvent('DragDropLeave', false, 'Когда произошел уход из области');

        this._initManager();
    }
    


    _initManager() {

        this._sources.forEach((source) => {
            source.draggable = true;
            source.AddHandler('DragStart', (event, args) => this.__dragStartFromSources(event, args));
            source.AddHandler('DragEnd', (event, args) => this.__dragEndFromSources(event, args));
        });

        this._destinations.forEach((dest) => {
            dest.dropable = true;
            dest.AddHandler('DragOver', (event, args) => this.__dragOverTheDestination(event, args));
            dest.AddHandler('DragLeave', (event, args) => this.__dragLeaveTheDestination(event, args));
            dest.AddHandler('Drop', (event, args) => this.__dragDropOnTheDestination(event, args));
        });

    }

    __dragStartFromSources(event, args) {
        this._current = args.domEvent.target.closest('[data-object-name]').tag('component');
    }

    __dragEndFromSources(event, args) {
        this._current = null;

        const dropComponent = document.querySelector('.app-drop-component');
        const dropTargetComponent = document.querySelector('.app-drop-target-component');
        dropComponent && dropComponent.classList.remove('app-drop-component');
        dropTargetComponent && dropTargetComponent.classList.remove('app-drop-target-component');

    }

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

        const dropTarget = dropElement.tag('component');
        if(this._current == dropTarget) {
            return false;
        }

        dropTarget.AddClass('app-drop-target-component');
        event.sender.AddClass('app-drop-component');

        let overArgs = {
            effectAllowed: 'all',
            dropEffect: 'move'
        };
        this.Dispatch('DragDropOver', {dragged: this._current, droppedTo: dropTarget, droppedToElement: target, effects: overArgs});

        args.domEvent.dataTransfer.effectAllowed = overArgs.effectAllowed;
        args.domEvent.dataTransfer.dropEffect = overArgs.dropEffect;
        args.domEvent.preventDefault();
        return true;
    }

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

        const dropTarget = dropElement.tag('component');
        dropTarget.RemoveClass('app-drop-target-component');
        event.sender.RemoveClass('app-drop-component');

        this.Dispatch('DragDropLeave', {dragged: this._current, droppedTo: dropTarget, droppedToElement: target});

        args.domEvent.preventDefault();
    }

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

        const dropTarget = dropElement.tag('component');
        args.domEvent.preventDefault();

        this.Dispatch('DragDropComplete', {dragged: this._current, droppedTo: dropTarget, droppedToElement: target});

    }
   
}