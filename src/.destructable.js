/**
 * Destructable class provides a base class for objects that need cleanup upon destruction.
 * @class
 */
const Destructable = class {

    /**
     * Constructs a new Destructable object.
     * Registers a listener for the 'beforeunload' event to trigger the destructor method.
     * @constructor
     * @public
     */
    constructor() {
        DestructableRegistry.Register(this);
    }

    /**
     * The destructor method that needs to be implemented by subclasses.
     * This method should perform cleanup tasks before the object is destroyed.
     * @public
     * @destructor
     */
    destructor() {}

}