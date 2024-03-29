/**
 * Основной класс приложения
 * ! нужно исправить инициализацию модулей, они должны родиться после приложения!
 */
Colibri.App = class extends Colibri.Events.Dispatcher { 
    
    /** @constructor */ 
    constructor() {
        super('App'); 

        this._initialized = false;
 
        this._changeLastTime = Date.Now().getTime(); 
   
        this.RegisterEvents();  
 
        this.RegisterEventHandlers();
  
    } 

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

    RegisterEventHandlers() {
        this.AddHandler('DocumentShown', (event, args) => {
            Colibri.UI.UpdateMaxZIndex();
        });
    }

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

    SetTheme(theme) {
        document.body.classList.remove('prefer-dark');
        document.body.classList.remove('prefer-light');
        document.body.classList.add('prefer-' + theme);
    }

    InitializeModules() {
        Object.keys(App.Modules).forEach((module) => {
            try {
                eval(module + '.InitializeModule();');
            }
            catch(e) { }
        })
    }

    StartFlashTitle() {
        this.StopFlashTitle();

        this._title = document.title;
        this._flashInterval = setInterval(() => {
            document.title = document.title.indexOf('(*)') > -1 ? this._title : '(*) ' + this._title;
        }, 1000);
    }

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
     * Отправляет событие в CRM
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

    get name() {
        return this._name;
    }

    get Actions() {
        return this._actions;
    } 

    get Storage() {
        return this._storage;
    }
    
    get Store() {
        return this._store;
    }

    get Request() {
        return this._request;
    }

    get Router() {
        return this._router;
    }

    get Notices() {
        return this._notices;
    }

    get Loader() {
        if(!this._loader) {
            this._loader = new Colibri.UI.LoadingContainer('app-loader', document.body);
        }
        return this._loader;
    }

    get Confirm() {
        return this._confirmDialog;
    }

    get Prompt() {
        return this._promptDialog;
    }
    
    get Alert() {
        return this._alertDialog;
    }

    get Loading() {
        return this._loadingBox;
    }
    
    get LoadingBallun() {
        return this._loadingBallun;
    }

    get Comet() {
        return this._comet;
    }

    get Browser() {
        return this._browser;
    }

    get Db() {
        return this._db;
    }

    get ToolTip() {
        return this._customToolTip;
    }

    get Device() {
        return this._device;
    }

    get RemoteDomain() {
        return this._remoteDomain;
    }
    
    get Initialized() {
        return this._initialized;
    }

    get DateFormat() {
        return this._dateformat;
    }
    set DateFormat(value) {
        this._dateformat = value;
    }
    get NumberFormat() {
        return this._numberformat;
    }
    set NumberFormat(value) {
        this._numberformat = value;
    }
    get Currency() {
        return this._currency;
    }
    set Currency(value) {
        this._currency = value;
    }

    get CsrfToken()
    {
        return this._csrfToken;
    }
    set CsrfToken(value) {
        this._csrfToken = value;
    }

}

const App = new Colibri.App();