/**
 * Drop manager
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.UI
 */
Colibri.UI.FileDropManager = class extends Colibri.Events.Dispatcher {

    /**
     * @constructor
     * @param {Colibri.UI.Component} container container to drop in
     * @param {string} message message to show when dragging 
     */
    constructor(container, message = '#{ui-filedropmanager-message}') {
        super();

        this._allowSize = 900000000;
        this._allowTypes = '*';
        this._enabled = true;
        
        this._dropContainer = container;this._dropHover = Element.create('div', {class: 'app-drop-over'});
        this._dropHover.append(Element.create('div'));
        container.append(this._dropHover);

        this.RegisterEvent('FileDropped', false, 'Когда перетащили файл в контейнер');

        this._initManager();
        this.message = message;
    }

    /**
     * Enable/Disable manager
     * @type {boolean}
     */
    get enabled() {
        return this._enabled;
    }
    /**
     * Enable/Disable manager
     * @type {boolean}
     */
    set enabled(value) {
        this._enabled = value;
    }

    /**
     * Message value
     * @type {string}
     */
    set message(value) {
        this._message = value;
        this._setMessage();
    }

    /**
     * Message value
     * @type {string}
     */
    get message() {
        return this._message;
    }

    /**
     * Allow types
     * @type {string|Array}
     */
    set allowTypes(value) {
        if(typeof value === 'string') {
            value = value.split(',');
        }
        this._allowTypes = value;
    }

    /**
     * Allow types
     * @type {string|Array}
     */
    get allowTypes() {
        return this._allowTypes;
    }

    /**
     * Allow size
     * @type {number}
     */
    set allowSize(value) {
        this._allowSize = value;
    }

    /**
     * Allow size
     * @type {number}
     */
    get allowSize() {
        return this._allowSize;
    }

    /**
     * @private
     */
    _setMessage() {
        this._dropHover.querySelector('div').html(this._message);
    }

    /**
     * @private
     */
    _initManager() {
        
        this._dropContainer.addEventListener('dragover', (e) => {
            if(!this._enabled) {
                e.stopPropagation();
                e.preventDefault();
                return false;                    
            }
            if(!this._dropContainer.classList.contains('-dragging')) {
                this._dropContainer.classList.add('-dragging');
                this._dropHover.css({zIndex: Colibri.UI.maxZIndex + 1});
            }
            e.stopPropagation();
            e.preventDefault();
            return false;

        });
        this._dropHover.addEventListener('dragleave', (e) => {
            if(!this._enabled) {
                e.stopPropagation();
                e.preventDefault();
                return false;                    
            }
            this._dropContainer.classList.remove('-dragging');
            this._dropHover.css({zIndex: null});
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
        this._dropHover.addEventListener('drop', (e) => {
            if(!this._enabled) {
                e.stopPropagation();
                e.preventDefault();
                return false;                    
            }
            this._dropContainer.classList.remove('-dragging');
            this._dropHover.css({zIndex: null});

            let eventFiles;
            if (e.dataTransfer.files) {
                eventFiles = e.dataTransfer.files;
            }
            else if (e.dataTransfer.items) {
                eventFiles = e.dataTransfer.items;
            }

            this._checkFiles(eventFiles);

            e.stopPropagation();
            e.preventDefault();
            return false;

        });

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dragStartFromSources(event, args) {
        this._current = args.domEvent.target.closest('[data-object-name]').tag('component');
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

        const dropElement = args.domEvent.target.closest('[data-object-name][dropable="true"]');
        if(!dropElement) {
            return false;
        }

        const dropTarget = dropElement.tag('component');
        if(this._current == dropTarget) {
            return false;
        }

        dropTarget.AddClass('app-drop-target-component');
        event.sender.AddClass('app-drop-component');

        args.domEvent.dataTransfer.effectAllowed = 'all';
        args.domEvent.dataTransfer.dropEffect = 'move';
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

        const dropElement = args.domEvent.target.closest('[data-object-name][dropable="true"]');
        if(!dropElement) {
            return false;
        }

        const dropTarget = dropElement.tag('component');
        dropTarget.RemoveClass('app-drop-target-component');
        event.sender.RemoveClass('app-drop-component');

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

        const dropElement = args.domEvent.target.closest('[data-object-name][dropable="true"]');
        if(!dropElement) {
            return false;
        }

        const dropTarget = dropElement.tag('component');
        args.domEvent.preventDefault();

        this.Dispatch('DragDropComplete', {dragged: this._current, droppedTo: dropTarget});

    }

    /**
     * @private
     */
    _checkFiles(files) {
        let errors = [];
        let success = [];
        for(const file of files) {
            const ext = file.name.extractExt();
            if(file.size > this._allowSize || (this._allowTypes !== '*' && this._allowTypes.indexOf(ext) === -1)) {
                errors.push({file: file, error: '#{ui-filedropmanager-error1} ' + (this._allowTypes !== '*' ? '#{ui-renderer-allowed}'.replaceAll('%s', this._allowTypes.join(',')) + ', ' : '') + '#{ui-renderer-max}'.replaceAll('%s', this._allowSize.toSizeString(['bytes', 'Kb', 'Mb', 'Gb'], 1024, true))});
            }
            else {
                success.push(file);
            }
        }
        this.Dispatch('FileDropped', {errors: errors, success: success});
    }
   
}