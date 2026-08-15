/**
 * Represents a source of events (websocket event dispatcher source).
 * @class
 * @extends Destructable
 * @memberof Colibri.Events
 */
Colibri.Events.Source = class extends Destructable {

    /**
     * Creates a new instance of Colibri.Events.Source.
     * @param {string} ipOrHost Ip addres or host of source
     * @param {string|number} port Port of source
     * @constructor
     * @public
     */
    constructor(ipOrHost, port) {
        super();

        this._handlers = {};

        this.Connect(ipOrHost, port);
    }

    /**
     * Gets the IP address and port of the source.
     * @type {string}
     * @public
     */
    get ipAndPort() {
        return `${this._ipOrHost}:${this._port}`;
    }

    /**
     * Registers a respondent for a specific event name.
     * @param {Object} repsondent The respondent object that will handle the event.
     * @param {string} eventName The name of the event to register for.
     * @public
     * @example
     * ```
     * const source = new Colibri.Events.Source('example.com', 8080);
     * component.RegisterEvent('myEvent', myHandler, source); /// actualy registered event on event source
     * ```
     */
    register(repsondent, eventName) {
        if(!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(repsondent);
    }

    /**
     * Unregisters a respondent for a specific event name.
     * @param {Object} repsondent The respondent object to unregister.
     * @param {string} eventName The name of the event to unregister from.
     * @public
     */
    unregister(repsondent, eventName) {
        if(!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        if(this._handlers[eventName]) {
            const index = this._handlers[eventName].indexOf(repsondent);
            this._handlers[eventName].splice(index, 1);
        }
    }

    /**
     * Disconnects the source from the WebSocket server and releases any associated resources.
     * @public
     */
    Disconnect() {
        if(this._socket) {
            this._socket.close();
            this._socket = null;
        }
        this._ipOrHost = null;
        this._port = null;
    }

    /**
     * Connects to the WebSocket server at the specified IP address or host and port.
     * @param {string} ipOrHost The IP address or host of the WebSocket server.
     * @param {string|number} port The port of the WebSocket server.
     * @returns {void}
     * @public
     */
    Connect(ipOrHost, port) {

        if(!ipOrHost || !port) {
            return;
        }

        this.Disconnect();

        this._ipOrHost = ipOrHost;
        this._port = port;

        this._socket = new WebSocket(`wss://${this._ipOrHost}:${this._port}/dispatcher/${App.Device.id}`);
        this._socket.onopen = (event) => console.log('WebSocket connection opened:', event);
        this._socket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            if(this._handlers[messageData.event]) {
                for(const handler of this._handlers[messageData.event]) {
                    handler.Dispatch(messageData.event, messageData.args);
                }
            }
        };
        this._socket.onclose = (event) => {
            console.log('WebSocket connection closed:', event, 'reconnecting ');
            setTimeout(() => this.Connect(this._ipOrHost, this._port), 3000);
        };
        this._socket.onerror = (error) => console.error('WebSocket error:', error);
    }

    /**
     * Indicates whether the WebSocket connection is ready (open).
     * @type {boolean}
     * @public
     */
    get isReady() {
        return this._socket.readyState === 1;
    }

    /**
     * Dispatch an event
     * @param {String} name Event name
     * @param {*} args Event arguments
     * @public
     */
    Dispatch(name, args) {
        if(!this.isReady) {
            console.log('Dispatcher socket is not connected yet');
            console.log(name, args);
            return;
        }
        this._socket.send(JSON.stringify({event: name, args: args}));
    }

    /**
     * @deprecated
     */
    Event(name, args) {
        this.Dispatch(name, args);
    }


}