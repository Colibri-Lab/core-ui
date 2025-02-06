/**
 * JsSip
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Sip
 */
Colibri.Sip.JsSip = class extends Colibri.Events.Dispatcher {

    constructor(jsSipUrl) {
        super();
        this._url = jsSipUrl;
    }

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