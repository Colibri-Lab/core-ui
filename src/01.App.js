/**
 * The main application class.
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri
 */
Colibri.App = class extends Colibri.Events.Dispatcher { 
    

    /**
     * Indicates wheter the App is initialized
     * @type {boolean}
     * @private
     */
    _initialized = false;

    /**
     * Indicates last change time
     * @type {string}
     * @private
     */
    _changeLastTime = null;

    /** 
     * Constructs a new instance of the Colibri.App class.
     */
    constructor() {
        super('App'); 

        this._initialized = false;
 
        this._changeLastTime = Date.Now().getTime(); 
   
        this.RegisterEvents();  
        this.RegisterEventHandlers();
  
    } 

    /**
     * Registers application events.
     * @public
     */
    RegisterEvents() { 
        this.RegisterEvent('Event', false, 'When any event dispatched');
        this.RegisterEvent('DocumentReady', false, 'Когда DOM готов');
        this.RegisterEvent('DocumentChanged', false, 'Когда DOM изменился'); 
        this.RegisterEvent('ApplicationReady', false, 'Приложение загружено');
        this.RegisterEvent('UserAuthorized', false, 'Пользователь вошел'); 
        this.RegisterEvent('UserUnauthorized', false, 'Пользователь вышел');
        this.RegisterEvent('DocumentShown', false, 'Документ отображен');
        this.RegisterEvent('DocumentHidden', false, 'Документ скрыт');
    }

    /**
     * Registers event handlers.
     */
    RegisterEventHandlers() {
        this.AddHandler('DocumentShown', (event, args) => {
            Colibri.UI.UpdateMaxZIndex();
        });
    }

    /**
     * Initializes the application with the specified configuration.
     * @param {string} [name='app'] - The name of the application.
     * @param {number} [version=1] - The version of the application.
     * @param {string} [routerType=Colibri.Web.Router.RouteOnHash] - The type of router to use.
     * @param {string} [requestType=Colibri.IO.Request.RequestEncodeTypeEncrypted] - The type of request encoding to use.
     * @param {boolean} [initComet=false] - Whether to initialize Comet.
     * @param {boolean} [showLoader=true] - Whether to show the loader.
     * @param {string} [remoteDomain=null] - The remote domain for requests.
     * @param {string} [dateformat=null] - The date format.
     * @param {string} [numberformat=null] - The number format.
     * @param {string} [currency=null] - The currency format.
     * @param {string} [loadingIcon=null] - The loading icon.
     * @param {string} [csrfToken=null] - The CSRF token.
     * @returns {Promise} A promise that resolves when the application is initialized.
     */
    InitializeApplication(
        name = 'app',
        version = 1,
        routerType = Colibri.Web.Router.RouteOnHash, 
        requestType = Colibri.IO.Request.RequestEncodeTypeEncrypted,
        initComet = false,
        showLoader = true,
        remoteDomain = null,
        dateformat = null,
        numberformat = null,
        currency = null,
        loadingIcon = null,
        csrfToken = null
    ) {

        return new Promise((resolve, reject) => {

            if(this._initialized) {
                resolve();
                return;
            }
    
            this._name = name;
            this._version = version;
    
            Colibri.IO.Request.type = requestType;
            if(remoteDomain) {
                this._remoteDomain = remoteDomain;
            }
            else {
                this._remoteDomain = '';
            }
    
            this._actions = new Colibri.Common.HashActions(); 
            this._store = new Colibri.Storages.Store('app', {});
            this._request = new Colibri.Web.Request();
            this._router = new Colibri.Web.Router(routerType);
            this._device = new Colibri.Devices.Device();
            this._browser = new Colibri.Common.BrowserStorage();
            this._db = new Colibri.Web.IndexDB(this._name, this._version);
            this._dateformat = dateformat;
            this._numberformat = numberformat;
            this._currency = currency;
            this._csrfToken = csrfToken;
    
            Colibri.Common.WaitForBody().then(() => {
                this.InitializeModules();
                if(showLoader) {
                    if(loadingIcon) {
                        this.Loader.icon = loadingIcon
                        this.Loader.showIcon = true;
                    }
                    this.Loader.Show();
                    this.Loader.StartProgress(200, 1.5);
                }
                this._loadingBox = new Colibri.UI.Loading('app-loading-box', document.body, Element.create('div'), true);
                this._confirmDialog = new Colibri.UI.ConfirmDialog('confirm', document.body, 600);
                this._promptDialog = new Colibri.UI.PromptDialog('prompt', document.body, 600);
                this._alertDialog = new Colibri.UI.AlertDialog('alert', document.body, 600);
                this._customToolTip = new Colibri.UI.ToolTip('tooltip', document.body);
                this._loadingBallun = new Colibri.UI.LoadingBallun('ballun', document.body);
            });
                
            
            // Делаем всякое после того, как DOM загрузился окончательно
            Colibri.Common.WaitForDocumentReady().then(() => { 
                this.Dispatch('DocumentReady');
    
                const headers = {};
                if(this._csrfToken) {
                    headers['X-CSRF-TOKEN'] = this._csrfToken;
                }
                Colibri.IO.Request.Post(this._remoteDomain + '/settings', {}, headers).then((response) => {
                    if(response.status != 200) {
                        App.Notices.Add(new Colibri.UI.Notice('#{ui-messages-cannotgetsettings}'));
                    }
                    else {
                        const settings = (typeof response.result === 'string' ? JSON.parse(response.result) : response.result);
                        this._store.Set('app.settings', settings);
    
                        if(initComet && settings.comet && settings.comet.host) {
                            this._comet = new Colibri.Web.Comet(settings.comet);
                            this._comet.AddHandler(['MessageReceived', 'MessagesMarkedAsRead', 'MessageRemoved'], (event, args) => {
                                if(!document.hasFocus()) {
                                    this.StartFlashTitle();
                                }
                                else {
                                    this.StopFlashTitle();
                                }
                            });
                        } 
                        document.addEventListener('visibilitychange', (e) => {
                            
                            if(initComet && settings.comet && settings.comet.host) {
                                this.StopFlashTitle();
                            }
    
                            if(document.hidden) {
                                this.Dispatch('DocumentHidden', {});
                            }
                            else {
                                this.Dispatch('DocumentShown', {});
                            }
                        });
    
                        if(settings?.screen?.theme === 'follow-device') {
                            this._device.AddHandler('ThemeChanged', (event, args) => {
                                this.SetTheme(args.current);
                            });
                            this.SetTheme(this._device.Theme);
                        }    
                        else {
                            this.SetTheme(settings?.screen?.theme ?? 'light');
                        }
    
                    }
    
                    // запускаем обработку экшенов в документе
                    this._router.HandleDomReady();
                    this._actions.HandleDomReady();
    
                    if(showLoader) {
                        Colibri.Common.Delay(1500).then(() => {
                            this.Loader.StopProgress();  
                            this.Loader.Hide();
                        });   
                    }
                     
                    Colibri.UI.UpdateMaxZIndex();
                    this.Dispatch('ApplicationReady');
                    resolve();
     
                }).catch(response => {
                    console.log(response);
                    App.Notices.Add(new Colibri.UI.Notice('Невозможно получить настройки!'));
                    reject();
                });
    
    
                this._notices = new Colibri.UI.Notices('notices', document.body);
    
                
                
            });
    
            this._initialized = true;
        });



    }

    /**
     * Sets the theme for the application.
     * @param {string} theme - The theme to set.
     */
    SetTheme(theme) {
        document.body.classList.remove('prefer-dark');
        document.body.classList.remove('prefer-light');
        document.body.classList.add('prefer-' + theme);
    }

    /**
     * Initializes the modules.
     */
    InitializeModules() {
        Object.keys(App.Modules).forEach((module) => {
            try {
                eval(module + '.InitializeModule();');
            }
            catch(e) { }
        })
    }

    /**
     * Starts flashing the title of the document by appending "(*)" every second.
     */
    StartFlashTitle() {
        this.StopFlashTitle();

        this._title = document.title;
        this._flashInterval = setInterval(() => {
            document.title = document.title.indexOf('(*)') > -1 ? this._title : '(*) ' + this._title;
        }, 1000);
    }

    /**
     * Stops flashing the title of the document and restores the original title.
     */
    StopFlashTitle() {
        if(this._flashInterval) {
            if(this._title) {
                document.title = this._title;
            }
            clearInterval(this._flashInterval);
            this._flashInterval = -1;
        }
    }

    /**
     * Sends an event to CRM.
     * @param {string} module - The module name.
     * @param {string} form - The form name.
     * @param {string} cat1 - The category 1.
     * @param {string} cat2 - The category 2.
     * @param {number} duration - The duration.
     * @param {string} iddoc - The document ID.
     * @param {number} amountdoc - The document amount.
     */
    SendEventToCRM(module, form, cat1, cat2, duration, iddoc, amountdoc) {
        try {
            console.log(module, form, cat1, cat2, duration, iddoc, amountdoc);
            crmEvent(module, form, cat1, cat2, duration, iddoc, amountdoc);
        }
        catch(e) {
            // do nothing
        }
    }

    /**
     * Gets the version of the application.
     * @returns {number} The version of the application.
     */
    get appVersion() {
        return this._appVersion;
    }

    /**
     * Sets the version of the application.
     * @param {number} value - The version of the application.
     */
    set appVersion(value) {
        this._appVersion = value;
    }

    /**
     * Gets the name of the application.
     * @returns {string} The name of the application.
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the actions associated with the application.
     * @returns {Colibri.Common.HashActions} The actions associated with the application.
     */
    get Actions() {
        return this._actions;
    } 

    /**
     * Gets the storage associated with the application.
     * @returns {Colibri.Storages.Store} The storage associated with the application.
     */
    get Storage() {
        return this._storage;
    }
    
    /**
     * Gets the store associated with the application.
     * @returns {Colibri.Storages.Store} The store associated with the application.
     */
    get Store() {
        return this._store;
    }

    /**
     * Gets the request associated with the application.
     * @returns {Colibri.Web.Request} The request associated with the application.
     */
    get Request() {
        return this._request;
    }

    /**
     * Gets the router associated with the application.
     * @returns {Colibri.Web.Router} The router associated with the application.
     */
    get Router() {
        return this._router;
    }

    /**
     * Gets the notices associated with the application.
     * @returns {Colibri.UI.Notices} The notices associated with the application.
     */
    get Notices() {
        return this._notices;
    }

    /**
     * Gets the loader associated with the application.
     * @returns {Colibri.UI.LoadingContainer} The loader associated with the application.
     */
    get Loader() {
        if(!this._loader) {
            this._loader = new Colibri.UI.LoadingContainer('app-loader', document.body);
        }
        return this._loader;
    }

    /**
     * Gets the confirm dialog associated with the application.
     * @returns {Colibri.UI.ConfirmDialog} The confirm dialog associated with the application.
     */
    get Confirm() {
        return this._confirmDialog;
    }

    /**
     * Gets the prompt dialog associated with the application.
     * @returns {Colibri.UI.PromptDialog} The prompt dialog associated with the application.
     */
    get Prompt() {
        return this._promptDialog;
    }
    
    /**
     * Gets the alert dialog associated with the application.
     * @returns {Colibri.UI.AlertDialog} The alert dialog associated with the application.
     */
    get Alert() {
        return this._alertDialog;
    }

    /**
     * Gets the loading box associated with the application.
     * @returns {Colibri.UI.Loading} The loading box associated with the application.
     */
    get Loading() {
        return this._loadingBox;
    }
    
    /**
     * Gets the loading ballun associated with the application.
     * @returns {Colibri.UI.LoadingBallun} The loading ballun associated with the application.
     */
    get LoadingBallun() {
        return this._loadingBallun;
    }

    /**
     * Gets the comet associated with the application.
     * @returns {Colibri.Web.Comet} The comet associated with the application.
     */
    get Comet() {
        return this._comet;
    }

    /**
     * Gets the browser storage associated with the application.
     * @returns {Colibri.Common.BrowserStorage} The browser storage associated with the application.
     */
    get Browser() {
        return this._browser;
    }

    /**
     * Gets the database associated with the application.
     * @returns {Colibri.Web.IndexDB} The database associated with the application.
     */
    get Db() {
        return this._db;
    }

    /**
     * Gets the tooltip associated with the application.
     * @returns {Colibri.UI.ToolTip} The tooltip associated with the application.
     */
    get ToolTip() {
        return this._customToolTip;
    }

    /**
     * Gets the device associated with the application.
     * @returns {Colibri.Devices.Device} The device associated with the application.
     */
    get Device() {
        return this._device;
    }

    /**
     * Gets the remote domain associated with the application.
     * @returns {string} The remote domain associated with the application.
     */
    get RemoteDomain() {
        return this._remoteDomain;
    }
    
    /**
     * Indicates whether the application is initialized.
     * @returns {boolean} `true` if the application is initialized; otherwise, `false`.
     */
    get Initialized() {
        return this._initialized;
    }

    /**
     * Gets the date format used by the application.
     * @returns {string|null} The date format used by the application, or `null` if not set.
     */
    get DateFormat() {
        return this._dateformat;
    }
    /**
     * Sets the date format used by the application.
     * @param {string} value - The date format to set.
     */
    set DateFormat(value) {
        this._dateformat = value;
    }
    /**
     * Gets the number format used by the application.
     * @returns {string|null} The number format used by the application, or `null` if not set.
     */
    get NumberFormat() {
        return this._numberformat;
    }
    /**
     * Sets the number format used by the application.
     * @param {string} value - The number format to set.
     */
    set NumberFormat(value) {
        this._numberformat = value;
    }
    /**
     * Gets the currency used by the application.
     * @returns {string|null} The currency used by the application, or `null` if not set.
     */
    get Currency() {
        return this._currency;
    }
    /**
     * Sets the currency used by the application.
     * @param {string} value - The currency to set.
     */
    set Currency(value) {
        this._currency = value;
    }

    /**
     * Gets the CSRF token used by the application.
     * @returns {string|null} The CSRF token used by the application, or `null` if not set.
     */
    get CsrfToken()
    {
        return this._csrfToken;
    }
    /**
     * Sets the CSRF token used by the application.
     * @param {string} value - The CSRF token to set.
     */
    set CsrfToken(value) {
        this._csrfToken = value;
    }

}

/**
 * Created App object
 */
const App = new Colibri.App();