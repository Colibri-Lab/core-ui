/**
 * JsSip
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Sip
 */
Colibri.Sip.JsSip = class extends Colibri.Events.Dispatcher {

    /**
     * @constructor
     * @param {string} jsSipUrl - The URL to the JsSip library.
     */
    constructor(jsSipUrl) {
        super();
        this._url = jsSipUrl;
    }

    /**
     * Initializes the JsSip library with the given SIP address.
     * @param {string} sipAddr - The SIP address to initialize with.
     * @returns {void} - Resolves when initialization is complete.
     * @example
     * ```
     * const jsSip = new Colibri.Sip.JsSip('https://example.com/jssip.js');
     * jsSip.Init('sip:username@example.com');
     * ```
     */
    Init(sipAddr) {
        Colibri.Common.LoadScript(this._url, 'jssip').then(() => {
            this._ua = new JsSIP.UA({
                uri: 'sip:' + sipAddr,
                wsServers: ['wss://sip.colibrilab.pro'],
                authorizationUser: sipAddr,
                password: 'password',
                displayName: 'John Doe',
                register: true
            });
        });

    }

}