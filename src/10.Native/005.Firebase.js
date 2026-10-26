/**
 * Firebase Cloud Messaging facade for a connected native host.
 * @class
 * @memberof Colibri.Native
 * @extends Colibri.Events.Dispatcher
 */
Colibri.Native.Firebase = class extends Colibri.Events.Dispatcher {

    /**
     * Owning native device facade.
     * @var {Colibri.Native.Device}
     * @private
     * @ignore
     */
    _device = null;

    /**
     * Whether native events are being forwarded.
     * @var {Boolean}
     * @private
     * @ignore
     */
    _started = false;

    /**
     * Creates an FCM facade without requesting notification permission.
     * @param {Colibri.Native.Device} device Connected native device.
     * @public
     */
    constructor(device) {
        super();
        this._device = device;
        this._registerEvents();
        this._device.AddHandler('NativeEvent', this.__nativeEvent, false, this);
    }

    /**
     * Registers messaging events.
     * @returns {void}
     * @protected
     */
    _registerEvents() {
        this.RegisterEvent('MessageReceived', false, 'FCM message received in the foreground');
        this.RegisterEvent('NotificationOpened', false, 'User tapped a notification');
        this.RegisterEvent('TokenChanged', false, 'FCM registration token changed');
    }

    /**
     * Starts delivery after application event handlers have been attached.
     * @returns {Promise<void>} Resolves after queued events have been delivered.
     * @public
     * @async
     */
    async Start() {
        this._started = true;
        try {
            const result = await this._device.Request('firebase', 'start');
            for (const envelope of result?.events || []) {
                this.__nativeEvent(null, envelope);
            }
        } catch (error) {
            this._started = false;
            throw error;
        }
    }

    /**
     * Pauses event delivery; the host retains pending events.
     * @returns {Promise<Object>} Host response.
     * @public
     * @async
     */
    async Stop() {
        const result = await this._device.Request('firebase', 'stop');
        this._started = false;
        return result;
    }

    /**
     * Requests notification permission through the platform UI.
     * @returns {Promise<Object>} Object containing the permission status.
     * @public
     * @async
     */
    RequestPermission() {
        return this._device.Request('firebase', 'requestPermission');
    }

    /**
     * Reads notification permission without displaying a prompt.
     * @returns {Promise<Object>} Object containing the permission status.
     * @public
     * @async
     */
    GetPermission() {
        return this._device.Request('firebase', 'getPermission');
    }

    /**
     * Gets the FCM token to register with the application's backend.
     * @returns {Promise<Object>} Object containing the token.
     * @public
     * @async
     */
    GetToken() {
        return this._device.Request('firebase', 'getToken');
    }

    /**
     * Deletes the FCM token; backend registration cleanup remains application-owned.
     * @returns {Promise<Object>} Host response.
     * @public
     * @async
     */
    DeleteToken() {
        return this._device.Request('firebase', 'deleteToken');
    }

    /**
     * Consumes the notification that opened a terminated app, or null.
     * Call before Start to avoid receiving the same opening through both APIs.
     * @returns {Promise<Object|null>} Normalized message.
     * @public
     * @async
     */
    GetInitialMessage() {
        return this._device.Request('firebase', 'getInitialMessage');
    }

    /**
     * Removes the local event subscription before the owning device closes.
     * @returns {void}
     * @public
     */
    Close() {
        this._started = false;
        this._device.RemoveHandler('NativeEvent', this.__nativeEvent, this);
    }

    /**
     * Converts protocol messaging events to public facade events.
     * @param {Colibri.Events.Event|null} event Source event.
     * @param {Object} args Protocol event name and payload.
     * @returns {void}
     * @private
     * @ignore
     */
    __nativeEvent(event, args) {
        if (!this._started) {
            return;
        }
        const events = {
            'firebase.messageReceived': 'MessageReceived',
            'firebase.notificationOpened': 'NotificationOpened',
            'firebase.tokenChanged': 'TokenChanged'
        };
        const name = events[args?.name];
        if (name) {
            this.Dispatch(name, args.payload);
        }
    }
};