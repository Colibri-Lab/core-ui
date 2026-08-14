
/**
 * DestructableRegistry class manages a registry of destructible objects.
 * It listens for the 'beforeunload' event and calls the destructor method on registered objects.
 * @class
 */
class DestructableRegistry {

    /**
     * A static Set to hold WeakRefs to destructible objects.
     * @type {Set<WeakRef<Destructable>>}
     * @static
     */
    static refs = new Set();

    /**
     * Constructs a new DestructableRegistry object.
     * Registers a listener for the 'beforeunload' event to trigger the destructor method on registered objects.
     * @constructor
     * @public
     */
    constructor() {

        window.addEventListener('beforeunload', () => {
            for (const ref of DestructableRegistry.refs) {
                const obj = ref.deref();
                if (obj) obj.destructor();
            }
            DestructableRegistry.refs.clear();
        });

    }

    /**
     * Registers a destructible object by adding a WeakRef to it in the registry.
     * @param {Destructable} obj - The destructible object to register.
     * @static
     * @public
     */
    static Register(obj) {
        DestructableRegistry.refs.add(new WeakRef(obj));
    }
}