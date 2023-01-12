Colibri.UI.LoadingContainer = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.LoadingContainer']);
        this.AddClass('app-loading-container-component');
        
    }

    set icon(value) {
        this.Children('loadingicon').icon = value;
    }
    get icon() {
        return this.Children('loadingicon').icon;
    }
    set shownIcon(value) {
        this.Children('loadingicon').shown = value === 'true' || value === true;
    }
    get shownIcon() {
        return this.Children('loadingicon').shown;
    }

    set progress(value) {
        this.Children('progress').progress = value;
    }
    get progress() {
        return this.Children('progress').progress;
    }

    set opacity(value) {
        this._element.css('opacity', value)
    }

    get opacity() {
        return this._element.css('opacity');
    }

    StartProgress(timer, speed) {
        this.BringToFront();
        this.Children('progress').Start(timer, speed);
    }

    PauseProgress() {
        this.BringToFront();
        this.Children('progress').Pause();
    }

    StopProgress(timer) {
        this.BringToFront();
        this.Children('progress').Stop();
    }

    Show() {
        super.Show();
        this.BringToFront();        
    }

}