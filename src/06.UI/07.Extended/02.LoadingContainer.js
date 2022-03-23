Colibri.UI.LoadingContainer = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.LoadingContainer']);
        this.AddClass('app-loading-container-component');
        
    }

    set progress(value) {
        this.Children('progress').progress = value;
    }
    get progress() {
        return this.Children('progress').progress;
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