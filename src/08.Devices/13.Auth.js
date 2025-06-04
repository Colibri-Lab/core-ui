
/**
 * Represents a utility for accessing sim information.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
 */
Colibri.Devices.Auth = class extends Destructable {

    constructor(device) {
        super();
        this._device = device;
    }

    IsAvailable() {
        if(App.Device.isWeb) {
            return Promise.resolve(!!window.PublicKeyCredential);
        } else if(App.Device.isWindows) {
            return Promise.resolve(false);
        } else {
            return new Promise((resolve, reject) => {
                Fingerprint.isAvailable((result) => {
                    resolve(true);
                }, (error) => {
                    reject(error.message)
                }, {
                    allowBackup: true,
                    requireStrongBiometrics: true
                });
            });
        }
    }

    Create(userToken, userName, userEmail) {
        if(App.Device.isWeb) {

            return new Promise((resolve, reject) => {
                const options = {
                    challenge: String.Password(32).toArrayBuffer(),
                    rp: { 
                        name: App.name,
                        id: App.AuthDomain
                    },
                    user: {
                        id: userToken.toArrayBuffer(), // user ID as Uint8Array
                        name: userEmail,
                        displayName: userName
                    },
                    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform", // 🔑 Use platform authenticator like Windows Hello
                        userVerification: "required",        // 👁️ Require biometric/PIN
                        residentKey: "required"              // 🏠 Needed for usernameless login
                    },
                    timeout: 60000,
                    attestation: "none"
                };
                navigator.credentials.create({ publicKey: options }).then((credential) => {
                    // Handle the created credential
                    resolve({
                        deviceId: App.Device.id,
                        id: credential.id,
                        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
                        type: credential.type,
                        response: {
                            clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
                            attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject)))
                        }
                    });
                }).catch((error) => {
                    reject(error);
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                const secretKey = String.Password(128);
                Fingerprint.registerBiometricSecret({
                    description: "Authenticate with your fingerprint",
                    secret: secretKey,
                    invalidateOnEnrollment: true,
                    disableBackup: true, 
                }, () => {
                    resolve({
                        deviceId: App.Device.id,
                        rawId: btoa(secretKey),
                        type: 'device',
                    });
                }, (error) => {
                    reject(error);
                });
            });

        }
    }

    Authenticate(userToken) {
        if(App.Device.isWeb) {

            return new Promise((resolve, reject) => {
                const options = {
                    challenge: String.Password(32).toArrayBuffer(),
                    userVerification: "required",
                    rpId: App.AuthDomain
                };

                if(userToken) {
                    options['allowCredentials'] = [{
                        type: 'public-key',
                        id: String.MD5(userToken),
                        transport: ['internal']
                    }];
                }
                navigator.credentials.get({ publicKey: options }).then((assertion) => {
                    resolve({
                        deviceId: App.Device.id,
                        id: assertion.id,
                        rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
                        type: assertion.type,
                        response: {
                            clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON))),
                            authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData))),
                            signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature))),
                            userHandle: assertion.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(assertion.response.userHandle))) : null
                        }
                    });
                }).catch(error => reject(error));
            });
        } else {
            return new Promise((resolve, reject) => {
                Fingerprint.loadBiometricSecret({
                    description: "Authenticate with your fingerprint",
                    disableBackup: true, 
                }, (secretKey) => {
                    resolve({
                        deviceId: App.Device.id,
                        rawId: btoa(secretKey),
                        type: 'device',
                    });
                }, (error) => {
                    reject(error);
                });
            });

        }
    }

}