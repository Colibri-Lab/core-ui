/**
 * Transport-neutral request bridge to a native or Electron host.
 * @class
 * @memberof Colibri.Native
 * @extends Colibri.Events.Dispatcher
 */
Colibri.Native.Bridge = class extends Colibri.Events.Dispatcher {

    /**
     * Host transport implementing send(envelope) and onMessage(handler).
     * @var {Object}
     * @private
     * @ignore
     */
    _transport = null;

    /**
     * Pending requests indexed by request ID.
     * @var {Map<String, Object>}
     * @private
     * @ignore
     */
    _pending = new Map();

    /**
     * Unsubscribe callback returned by the transport.
     * @var {Function|null}
     * @private
     * @ignore
     */
    _unsubscribe = null;

    /**
     * Request timeout in milliseconds.
     * @var {Number}
     * @private
     * @ignore
     */
    _requestTimeout = 30000;

    /**
     * Monotonic request ID counter.
     * @var {Number}
     * @private
     * @ignore
     */
    _requestId = 0;

    /**
     * Whether the bridge has been closed.
     * @var {Boolean}
     * @private
     * @ignore
     */
    _closed = false;

    /**
     * Creates a bridge around a platform-provided transport.
     * The transport contract is send(envelope) and onMessage(handler).
     * send may return a response Promise or deliver responses through onMessage.
     * @constructor
     * @param {Object} transport Platform or Electron preload transport.
     * @public
     */
    constructor(transport) {
        super();
        if (!transport || typeof transport.send !== 'function' || typeof transport.onMessage !== 'function') {
            throw new TypeError('Native transport must implement send(envelope) and onMessage(handler)');
        }

        this._transport = transport;
        this._registerEvents();
        const unsubscribe = this._transport.onMessage(message => this.Receive(message));
        this._unsubscribe = typeof unsubscribe === 'function' ? unsubscribe : null;
    }

    /**
     * Registers events emitted by the native host.
     * @returns {void}
     * @protected
     */
    _registerEvents() {
        this.RegisterEvent('NativeEvent', false, 'Event emitted by the native host');
    }

    /**
     * Sends a capability request to the host.
     * @param {String} capability Capability name.
     * @param {String} method Capability method.
     * @param {Object} params Request parameters.
     * @returns {Promise<*>} Native result.
     * @public
     * @async
     */
    Request(capability, method, params = {}) {
        if (this._closed) {
            return Promise.reject(new Error('Native bridge is closed'));
        }
        if (typeof capability !== 'string' || capability === '' || typeof method !== 'string' || method === '') {
            return Promise.reject(new TypeError('Capability and method are required'));
        }
        if (!params || typeof params !== 'object' || Array.isArray(params)) {
            return Promise.reject(new TypeError('Native request params must be an object'));
        }

        const id = String(++this._requestId);
        const envelope = {
            version: 1,
            type: 'request',
            id: id,
            capability: capability,
            method: method,
            params: params
        };

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this._rejectPending(id, new Error('Native request timed out'));
            }, this._requestTimeout);
            this._pending.set(id, { resolve: resolve, reject: reject, timeout: timeout });

            try {
                const response = this._transport.send(envelope);
                if (response && typeof response.then === 'function') {
                    response.then(message => {
                        if (message !== undefined && message !== null) {
                            this.Receive(message);
                        }
                    }).catch(error => this._rejectPending(id, error));
                }
            } catch (error) {
                this._rejectPending(id, error);
            }
        });
    }

    /**
     * Resolves a response or dispatches an event received from the host.
     * @param {Object|String} message Native protocol envelope.
     * @returns {Boolean} True when the message was handled.
     * @public
     */
    Receive(message) {
        let envelope = message;
        if (typeof envelope === 'string') {
            try {
                envelope = JSON.parse(envelope);
            } catch (error) {
                return false;
            }
        }
        if (!envelope || typeof envelope !== 'object') {
            return false;
        }

        if (envelope.type === 'event') {
            this.Dispatch('NativeEvent', {
                name: String(envelope.name || ''),
                payload: envelope.payload ?? null
            });
            return true;
        }
        if (envelope.type !== 'response') {
            return false;
        }

        const id = String(envelope.id ?? '');
        const pending = this._pending.get(id);
        if (!pending) {
            return false;
        }
        clearTimeout(pending.timeout);
        this._pending.delete(id);

        if (envelope.error) {
            const error = new Error(String(envelope.error.message || 'Native request failed'));
            error.code = envelope.error.code ?? null;
            pending.reject(error);
        } else {
            pending.resolve(envelope.result ?? null);
        }
        return true;
    }

    /**
     * Rejects and removes one pending request.
     * @param {String} id Request ID.
     * @param {Error} error Failure reason.
     * @returns {void}
     * @private
     * @ignore
     */
    _rejectPending(id, error) {
        const pending = this._pending.get(id);
        if (!pending) {
            return;
        }
        clearTimeout(pending.timeout);
        this._pending.delete(id);
        pending.reject(error instanceof Error ? error : new Error(String(error)));
    }

    /**
     * Closes the bridge and rejects pending requests.
     * @param {Error} reason Closure reason.
     * @returns {void}
     * @public
     */
    Close(reason = new Error('Native bridge closed')) {
        if (this._closed) {
            return;
        }
        this._closed = true;
        const error = reason instanceof Error ? reason : new Error(String(reason));
        for (const id of this._pending.keys()) {
            this._rejectPending(id, error);
        }
        this._unsubscribe?.();
        this._unsubscribe = null;
        this._transport = null;
    }
};
