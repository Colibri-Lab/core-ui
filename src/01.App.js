/**
 * Основной класс приложения
 * ! нужно исправить инициализацию модулей, они должны родиться после приложения!
 */
Colibri.App = class extends Colibri.Events.Dispatcher {
    
    /** @constructor */
    constructor() {
        super('App');

        this._changeLastTime = Date.Now().getTime();

        this.RegisterEvents();

        this.RegisterEventHandlers();
        
    }

    RegisterEvents() {
        this.RegisterEvent('DocumentReady', false, 'Когда DOM готов');
        this.RegisterEvent('DocumentChanged', false, 'Когда DOM изменился');
        this.RegisterEvent('ApplicationReady', false, 'Приложение загружено');
        this.RegisterEvent('UserAuthorized', false, 'Пользователь вошел');
        this.RegisterEvent('UserUnauthorized', false, 'Пользователь вышел');
        this.RegisterEvent('DocumentShown', false, 'Документ отображен');
        this.RegisterEvent('DocumentHidden', false, 'Документ скрыт');
    }

    RegisterEventHandlers() {
    }

    InitializeMutationObserver() {
        new MutationObserver(list => {
            this._changeLastTime = Date.Now().getTime();
            this.Dispatch('DocumentChanged', {changes: list});
        }).observe(document.body, {childList: true, subtree: true});
        Colibri.Common.Wait(() => { 
            this._loader && this._loader.BringToFront(); 
            return Date.Now().getTime() - this._changeLastTime > 500; 
        }).then(() => {
            this.Dispatch('ApplicationReady', {});
        });
    }

    InitializeApplication(
        routerType = Colibri.Web.Router.RouteOnHash, 
        requestType = Colibri.IO.Request.RequestEncodeTypeEncrypted,
        initComet = false,
        showLoader = true,
        remoteDomain = null
    ) {

        Colibri.IO.Request.type = requestType;
        if(remoteDomain) {
            Colibri.IO.RpcRequest.remoteDomain = remoteDomain;
        }

        this._actions = new Colibri.Common.HashActions(); 
        this._store = new Colibri.Storages.Store('app', {});
        this._request = new Colibri.Web.Request();
        this._router = new Colibri.Web.Router(routerType);
        if(initComet) {
            this._comet = new Colibri.Web.Comet();
        }
        this._browser = new Colibri.Common.BrowserStorage();

        Colibri.Common.WaitForBody().then(() => {
            this.InitializeModules();
            this.InitializeMutationObserver();
            if(showLoader) {
                this._loader = new Colibri.UI.LoadingContainer('app-loader', document.body);
                this._loader.Show();
                this._loader.StartProgress(200, 1.5);
                this._loader.BringToFront();
            }
            this._loadingBox = new Colibri.UI.Loading('app-loading-box', document.body);
            this._confirmDialog = new Colibri.UI.ConfirmDialog('confirm', document.body, 600);
            this._promptDialog = new Colibri.UI.PromptDialog('prompt', document.body, 600);
            this._alertDialog = new Colibri.UI.AlertDialog('alert', document.body, 600);
            this._customToolTip = new Colibri.UI.ToolTip('tooltip', document.body);

        });
            
        this.AddHandler('ApplicationReady', (event, args) => {

            Colibri.IO.Request.Post('/settings.json').then((response) => {
                if(response.status != 200) {
                    App.Notices.Add(new Colibri.UI.Notice('#{app-messages-cannotgetsettings;Невозможно получить настройки!}'));
                }
                else {
                    const settings = JSON.parse(response.result);
                    this._store.Set('app.settings', settings);
                }

                // запускаем обработку экшенов в документе
                this._actions.HandleDomReady();
                this._router.HandleDomReady();

            });

            if(showLoader) {
                Colibri.Common.Delay(1500).then(() => {
                    this._loader.StopProgress();  
                    this._loader.Hide();
                });   
            } 

            
        });

        // Делаем всякое после того, как DOM загрузился окончательно

        Colibri.Common.WaitForDocumentReady().then(() => {
            this.Dispatch('DocumentReady');

            this._notices = new Colibri.UI.Notices('notices', document.body);

            if(initComet) {
                this._comet.AddHandler('MessageReceived', (event, args) => {
                    if(!document.hasFocus()) {
                        this.StartFlashTitle();
                    }
                });
                document.addEventListener('visibilitychange', (e) => {
                    this.StopFlashTitle();
                    if(document.hidden) {
                        this.Dispatch('DocumentHidden', {});
                    }
                    else {
                        this.Dispatch('DocumentShown', {});
                    }
                });
            }
            
        });

    }

    InitializeModules() {
        Object.keys(App.Modules).forEach((module) => {
            eval(module + '.InitializeModule();');
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

    get Comet() {
        return this._comet;
    }

    get Browser() {
        return this._browser;
    }

    get ToolTip() {
        return this._customToolTip;
    }

}

const App = new Colibri.App();