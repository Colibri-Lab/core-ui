
const Colibri = class {
 
}

const Destructable = class {

    constructor() {
        window.addEventListener('beforeunload', e => this.destructor());
    }

    destructor() {}

}