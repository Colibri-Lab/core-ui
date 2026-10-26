/**
 * JavaScript facade for native and Electron device capabilities.
 * @class
 * @memberof Colibri.Native
 * @extends Colibri.Events.Dispatcher
 */
Colibri.Native.Device = class extends Colibri.Events.Dispatcher {

    /**
     * Transport bridge used for native requests.
     * @var {Colibri.Native.Bridge}
     * @private
     * @ignore
     */
    _bridge = null;

    /**
     * Host platform reported during initialization.
     * @var {String}
     * @private
     * @ignore
     */
    _platform = 'unknown';

    /**
     * System theme reported during initialization.
     * @var {String}
     * @private
     * @ignore
     */
    _theme = 'unknown';

    /**
     * Capabilities reported by the host.
     * @var {Array<String>}
     * @private
     * @ignore
     */
    _capabilities = [];

    /**
     * Locales included in the host bundle.
     * @var {Array<String>}
     * @private
     * @ignore
     */
    _locales = [];

    /**
     * Lazily created Firebase messaging facade.
     * @var {Colibri.Native.Firebase|null}
     * @private
     * @ignore
     */
    _firebase = null;

    /**
     * Creates a device facade backed by a platform bridge.
     * @constructor
     * @param {Colibri.Native.Bridge} bridge Native or Electron bridge.
     * @public
     */
    constructor(bridge) {
        super();
        if (!(bridge instanceof Colibri.Native.Bridge)) {
            throw new TypeError('Colibri.Native.Device requires a Colibri.Native.Bridge');
        }

        this._bridge = bridge;
        this._registerEvents();
        this._bridge.AddHandler('NativeEvent', this.__nativeEvent, false, this);
        this._loadHostInfo();
    }

    /**
     * Registers events forwarded from the platform runtime.
     * @returns {void}
     * @protected
     */
    _registerEvents() {
        this.RegisterEvent('NativeEvent', false, 'Event emitted by the native or Electron runtime');
        this.RegisterEvent('Ready', false, 'Native host information is available');
        this.RegisterEvent('InitializationFailed', false, 'Native host initialization failed');
        this.RegisterEvent('ThemeChanged', false, 'System color theme changed');
    }

    /**
     * Loads platform, theme, capabilities and bundled locales from the host.
    * @returns {Promise<void>} Resolves after the handshake is dispatched.
     * @private
     * @ignore
     * @async
     */
    async _loadHostInfo() {
        try {
            const info = await this.GetCapabilities();
            this._platform = info?.platform || Colibri.Native.Device.Platform.Unknown;
            this._theme = info?.theme || Colibri.Native.Device.Theme.Unknown;
            this._capabilities = Array.isArray(info?.capabilities) ? info.capabilities.slice() : [];
            this._locales = Array.isArray(info?.locales) ? info.locales.slice() : [];
            this.Dispatch('Ready', { platform: this._platform, theme: this._theme });
        } catch (error) {
            this.Dispatch('InitializationFailed', { error: error });
        }
    }

    /**
     * Current native host platform.
     * @type {String}
     * @public
     */
    get platform() {
        return this._platform;
    }

    /**
     * Whether the host runs on Android.
     * @type {Boolean}
     * @public
     */
    get isAndroid() {
        return this._platform === Colibri.Native.Device.Platform.Android;
    }

    /**
     * Whether the host runs on iOS.
     * @type {Boolean}
     * @public
     */
    get isIOs() {
        return this._platform === Colibri.Native.Device.Platform.IOs;
    }

    /**
     * Whether the host runs on Electron.
     * @type {Boolean}
     * @public
     */
    get isElectron() {
        return this._platform === Colibri.Native.Device.Platform.Electron;
    }

    /**
     * Whether the app runs without a native host.
     * @type {Boolean}
     * @public
     */
    get isWeb() {
        return this._platform === Colibri.Native.Device.Platform.Web;
    }

    /**
     * Current system color theme.
     * @type {String}
     * @public
     */
    get theme() {
        return this._theme;
    }

    /**
     * Whether the current system theme is dark.
     * @type {Boolean}
     * @public
     */
    get isDarkMode() {
        return this._theme === Colibri.Native.Device.Theme.Dark;
    }

    /**
     * Whether the current system theme is light.
     * @type {Boolean}
     * @public
     */
    get isLightMode() {
        return this._theme === Colibri.Native.Device.Theme.Light;
    }

    /**
     * Capabilities implemented by the host.
     * @type {Array<String>}
     * @public
     */
    get capabilities() {
        return this._capabilities.slice();
    }

    /**
     * Locales included in the app bundle.
     * @type {Array<String>}
     * @public
     */
    get locales() {
        return this._locales.slice();
    }

    /**
     * Firebase Cloud Messaging API for the connected host.
     * @type {Colibri.Native.Firebase}
     * @public
     */
    get firebase() {
        if (!this._firebase) {
            this._firebase = new Colibri.Native.Firebase(this);
        }
        return this._firebase;
    }

    /**
     * Returns capabilities implemented by the current host.
     * @returns {Promise<Object>} Host capability map.
     * @public
     * @async
     */
    GetCapabilities() {
        return this.Request('device', 'getCapabilities');
    }

    /**
     * Persists a bundled locale and asks the host to reload its WebView.
     * @param {String} locale Locale code from the app bundle manifest.
     * @returns {Promise<Object>} Locale change response.
     * @public
     * @async
     */
    SetLocale(locale) {
        if (typeof locale !== 'string' || locale === '') {
            return Promise.reject(new TypeError('Locale is required'));
        }
        return this.Request('app', 'setLocale', { locale: locale });
    }

    /**
     * Sends a request to a named host capability.
     * @param {String} capability Capability name.
     * @param {String} method Capability method.
     * @param {Object} params Request parameters.
     * @returns {Promise<*>} Host response.
     * @public
     * @async
     */
    Request(capability, method, params = {}) {
        return this._bridge.Request(capability, method, params);
    }

    /**
     * Closes the platform bridge and removes its event handler.
     * @param {Error} reason Closure reason.
     * @returns {void}
     * @public
     */
    Close(reason = new Error('Native device closed')) {
        this._firebase?.Close();
        this._bridge.RemoveHandler('NativeEvent', this.__nativeEvent, this);
        this._bridge.Close(reason);
        this._bridge = null;
    }

    /**
     * Forwards a host event through the device facade.
     * @param {Colibri.Events.Event} event Source event.
     * @param {Object} args Event payload.
     * @returns {void}
     * @private
     * @ignore
     */
    __nativeEvent(event, args) {
        if (args?.name === 'theme.changed') {
            const theme = args.payload?.theme;
            if ([Colibri.Native.Device.Theme.Light, Colibri.Native.Device.Theme.Dark].includes(theme)) {
                this._theme = theme;
                this.Dispatch('ThemeChanged', { theme: theme });
            }
        }
        this.Dispatch('NativeEvent', args);
    }
};
