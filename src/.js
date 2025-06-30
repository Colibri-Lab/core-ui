/**
 * Colibri class serves as a namespace for related functionality.
 * @namespace
 */
const Colibri = class {
 
}

class DestructableRegistry {
    static refs = new Set();

    constructor() {

        window.addEventListener('beforeunload', () => {
            for (const ref of DestructableRegistry.refs) {
                const obj = ref.deref();
                if (obj) obj.destructor();
            }
            DestructableRegistry.refs.clear();
        });

    }

    static Register(obj) {
        DestructableRegistry.refs.add(new WeakRef(obj));
    }
}

/**
 * Destructable class provides a base class for objects that need cleanup upon destruction.
 * @class
 */
const Destructable = class {

    /**
     * Constructs a new Destructable object.
     * Registers a listener for the 'beforeunload' event to trigger the destructor method.
     */
    constructor() {
        DestructableRegistry.Register(this);
        // window.addEventListener('bseforeunload', e => this.destructor());
    }

    /**
     * The destructor method that needs to be implemented by subclasses.
     * This method should perform cleanup tasks before the object is destroyed.
     */
    destructor() {}

}