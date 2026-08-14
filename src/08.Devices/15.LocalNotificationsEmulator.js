/**
 * Represents an emulator for local notifications.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
 */
Colibri.Devices.LocalNotificationsEmulator = class extends Destructable {
    /**
     * Checks if the emulator has permission.
     * @param {function} success - Success callback.
     * @param {function} fail - Fail callback.
     * @public
     */
    hasPermission(success, fail) {
        success(true);
    }
    /**
     * Requests permission for the emulator.
     * @param {function} success - Success callback.
     * @param {function} fail - Fail callback.
     * @public
     */
    requestPermission(success, fail) {
        success(true);
    }
    /**
     * Schedules a notification with given parameters.
     * @param {*} params - Parameters for scheduling the notification.
     * @public
     */
    schedule(params) {
        //
    }
    /**
     * Cancels a scheduled notification with given id.
     * @param {number} id - The id of the notification to cancel.
     * @public
     */
    cancel(id) {
        // 
    }
    /**
     * Registers an event listener.
     * @param {string} event - The event to listen for.
     * @param {function} callback - The callback function.
     * @param {*} scope - The scope of the callback.
     * @public
     */
    on(event, callback, scope) {
        // 
    }
     /**
     * Unregisters an event listener.
     * @param {string} event - The event to stop listening for.
     * @param {function} callback - The callback function.
     * @param {*} scope - The scope of the callback.
     * @public
     */
    un(event, callback, scope) {
        // 
    }
}
