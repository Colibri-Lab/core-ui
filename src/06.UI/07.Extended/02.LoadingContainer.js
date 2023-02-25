Colibri.UI.LoadingContainer = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.LoadingContainer']);
        this.AddClass('app-loading-container-component');
        
        this._loadingcontainer = this.Children('icon-container');
        this._progress = this.Children('progress');
    }

    set icon(value) {
        this._loadingcontainer.value = value;
    }
    get icon() {
        return this._loadingcontainer.value;
    }

    set shownIcon(value) {
        this._loadingcontainer.shown = value === 'true' || value === true;
    }
    get shownIcon() {
        return this._loadingcontainer.shown;
    }

    set progress(value) {
        this._progress.progress = value;
    }
    get progress() {
        return this._progress.progress;
    }

    set progressColor(value) {
        this._progress.color = value;
    }
    get progressColor() {
        return this._progress.color;
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