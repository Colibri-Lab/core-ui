/**
 * Colibri class serves as a namespace for related functionality.
 */
const Colibri = class {
 
}

/**
 * Destructable class provides a base class for objects that need cleanup upon destruction.
 */
const Destructable = class {

    /**
     * Constructs a new Destructable object.
     * Registers a listener for the 'beforeunload' event to trigger the destructor method.
     */
    constructor() {
        window.addEventListener('beforeunload', e => this.destructor());
    }

    /**
     * The destructor method that needs to be implemented by subclasses.
     * This method should perform cleanup tasks before the object is destroyed.
     */
    destructor() {}

}