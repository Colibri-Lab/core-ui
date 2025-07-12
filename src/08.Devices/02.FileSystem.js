/**
 * Represents a file system utility for managing directories and files.
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Devices
 */
Colibri.Devices.FileSystem = class extends Colibri.Events.Dispatcher {
    
    /**
     * Error code for 'Not Found'.
     * @type {number}
     */
    static NotFound = 1;	
    /**
     * Error code for 'Security Error'.
     * @type {number}
     */
    static SecurityError = 2;
    /**
     * Error code for 'Abort'.
     * @type {number}
     */
    static Abort = 3;
    /**
     * Error code for 'Not Reachable'.
     * @type {number}
     */
    static NotReachable = 4;	
    /**
     * Error code for 'Encoding'.
     * @type {number}
     */
    static Encoding = 5;
    /**
     * Error code for 'No Modification Allowed'.
     * @type {number}
     */
    static NoModificationAllowed = 6;	
    /**
     * Error code for 'Invalid State'.
     * @type {number}
     */
    static InvalidState = 7;
    /**
     * Error code for 'Syntax Error'.
     * @type {number}
     */
    static SyntaxError = 8;
    /**
     * Error code for 'Invalid Modification'.
     * @type {number}
     */
    static InvalidModification = 9;	
    /**
     * Error code for 'Quota Exceeded'.
     * @type {number}
     */
    static QuotaExeeded = 10;
    /**
     * Error code for 'Type Mismatch'.
     * @type {number}
     */
    static TypeMismatch = 11;	
    /**
     * Error code for 'Path Exists'.
     * @type {number}
     */
    static PathExists = 12;

    /**
     * Instance variable representing the device.
     * @type {Colibri.UI.Device}
     * @private
     */
    _device = null;
    /**
     * Instance variable representing the plugin.
     * @type {object}
     * @private
     */
    _plugin = null;

    /**
     * Creates an instance of FileSystem.
     * @constructor
     * @param {*} device - The device object.
     */
    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('file');
    }

    /**
     * Represents the application directory.
     * @type {*}
     */
    get AppDirectory() {
        return this._plugin.applicationDirectory;
    }

    /**
     * Represents the application storage directory.
     * @type {*}
     */
    get AppStorageDirectory() {
        return this._plugin.applicationStorageDirectory    
    }

    /**
     * Represents the data directory.
     * @type {*}
     */
    get DataDirectory() {
        return this._plugin.dataDirectory;
    }

    /**
     * Represents the cache directory.
     * @type {*}
     */
    get CacheDirectory() {
        return this._plugin.cacheDirectory;
    }

    /**
     * Represents the external application storage directory (Android).
     * @type {*}
     */
    get ExternalAppStorageDirectory() {
        return this._plugin.externalApplicationStorageDirectory;
    }

    /**
     * Represents the external data directory (Android).
     * @type {*}
     */
    get ExternalDataDirectory() {
        return this._plugin.externalDataDirectory;
    } 
    
    /**
     * Represents the external root directory (SD-card) (Android, BlackBerry 10).
     * @type {*}
     */
    get ЕxternalRootDirectory() {
        return this._plugin.externalRootDirectory;
    }

    /**
     * Represents the temporary directory.
     * @type {*}
     */
    get TempDirectory() {
        return this._plugin.tempDirectory;
    }

    /**
     * Represents the synced data directory.
     * @type {*}
     */
    get SyncedDataDirectory() {
        return this._plugin.syncedDataDirectory;
    }

    /**
     * Represents the documents directory.
     * @type {*}
     */
    get DocumentsDirectory() {
        return this._plugin.documentsDirectory;
    }

    /**
     * Represents the shared directory (BlackBerry 10).
     * @type {*}
     */
    get SharedDirectory() {
       return this._plugin.sharedDirectory;
    }

    /**
     * Generates a Blob object.
     * @param {*} name - The name of the file.
     * @param {*} content - The content of the file.
     * @returns {*} - Blob object.
     */
    Blob(name, content) {
        if(content instanceof Blob) {
            return content;
        }
        const mimetype = Colibri.Common.MimeType.ext2type(name.pathinfo().ext);
        return new Blob([content], { type: mimetype });
    }

    /**
     * Converts a base64 string to a Blob object.
     * @param {string} b64Data - The base64 data.
     * @param {string} contentType - The content type.
     * @param {number} sliceSize - The slice size.
     * @returns {*} - Blob object.
     */
    B64ToBlob(b64Data, contentType, sliceSize = 512) {
        
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    
    }

    /**
     * Gets the file system.
     * @param {*} type - The type of the file system.
     * @param {number} quota - The quota for the file system.
     * @returns {Promise} - Promise resolving to the file system root.
     */
    Get(type = LocalFileSystem.PERSISTENT, quota = 0) {
        return new Promise((resolve, reject) => {
            window.requestFileSystem(type, quota, (fs) => {
                resolve(fs.root);
            }, (e) => reject(e));
        });
    }

    /**
     * Resolves a local file system URL.
     * @param {string} path - The file system path.
     * @returns {Promise} - Promise resolving to the file system entry.
     */
    Local(path) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (entry) => {
                resolve(entry);
            }, e => reject(e));
        });
    }

    /**
     * Resolves a local file system URL.
     * @param {string} path - The file system path.
     * @returns {Promise} - Promise resolving to the file system entry.
     */
    LocalAsBlob(path, type = null) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (entry) => {
                entry.file((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const blob = new Blob([new Uint8Array(reader.result)], { type: type ? type : file.type });
                        resolve(blob);
                    };
                    reader.readAsArrayBuffer(file);
                }, () => reject());
            }, e => reject(e));
        });
    }


    /**
     * Creates a file.
     * @param {*} fsOrDir - The file system or directory.
     * @param {string} fileName - The name of the file.
     * @param {*} options - Options for file creation.
     * @returns {Promise} - Promise resolving to the file entry.
     */
    File(fsOrDir, fileName, options) {
        options = Object.assign({ create: true, exclusive: false }, options);
        return new Promise((resolve, reject) => {
            fsOrDir.getFile(fileName, options, (fileEntry) => {
                resolve(fileEntry);
            }, e => reject(e));
        });
    }

    /**
     * Creates a directory.
     * @param {*} fsOrDir - The file system or directory.
     * @param {string} dirName - The name of the directory.
     * @param {*} options - Options for directory creation.
     * @returns {Promise} - Promise resolving to the directory entry.
     */
    Directory(fsOrDir, dirName, options) {
        return new Promise((resolve, reject) => {
            dirName = dirName.split('/');
            options = Object.assign({ create: true, exclusive: false }, options);
            fsOrDir.getDirectory(dirName.shift(), options, (dirEntry) => {
                if(dirName.length === 0) {
                    resolve(dirEntry);
                }
                else {
                    resolve(this.Directory(dirEntry, dirName.join('/'), options));
                }
            }, e => reject(e));
        });
    }

    /**
     * Writes content to a file.
     * @param {*} fileEntry - The file entry.
     * @param {*} content - The content to write.
     * @param {boolean} isAppend - Indicates whether to append to the file.
     * @returns {Promise} - Promise resolving to the file entry.
     */
    Write(fileEntry, content, isAppend) {
        return new Promise((resolve, reject) => {
            fileEntry.createWriter((fileWriter) => {
                fileWriter.onwriteend = () => {
                    resolve(fileEntry);
                };
                fileWriter.onerror = (e) => {
                    reject(e);
                };
                if (isAppend) {
                    try {
                        fileWriter.seek(fileWriter.length);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
                fileWriter.write(this.Blob(fileEntry.name, content));
            });
    
        });
    }

    /**
     * Reads content from a file.
     * @param {*} fileEntry - The file entry.
     * @returns {Promise} - Promise resolving to the file content.
     */
    Read(fileEntry) {
        return new Promise((resolve, reject) => {
            fileEntry.file((file) => {
                const reader = new FileReader();        
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.onerror = (e) => {
                    reject(e);
                }        
                reader.readAsText(file);
        
            }, e => reject(e));
        });
    }

    /**
     * Requests a file.
     * @param {*} type - The type of the file system.
     * @param {number} quota - The quota for the file system.
     * @param {string} path - The file path.
     * @param {string} fileName - The file name.
     * @param {*} content - The content of the file.
     * @param {boolean} isAppend - Indicates whether to append to the file.
     * @param {*} options - Options for file request.
     * @returns {Promise} - Promise resolving to the file entry.
     */
    RequestFile(type = LocalFileSystem.PERSISTENT, quota = 0, path, fileName, content, isAppend, options = {}) {
        return new Promise((resolve, reject) => {
            this.Get(type, quota)
                .then((fs) => this.Directory(fs, path, options))
                .then((dirEntry) => this.File(dirEntry, fileName, options))
                .then((fileEntry) => this.Write(fileEntry, content, isAppend))
                .then((fileEntry) => resolve(fileEntry))
                .catch(e => reject(e));
        });
    }

    /**
     * Requests a file writer.
     * @param {*} type - The type of the file system.
     * @param {number} quota - The quota for the file system.
     * @param {string} path - The file path.
     * @param {string} fileName - The file name.
     * @param {*} options - Options for file request.
     * @returns {Promise} - Promise resolving to the file entry.
     */
    RequestLocalWriter(rootDir, fileName, options = {}) {
        return new Promise((resolve, reject) => {
            this.Local(rootDir)
                .then((fs) => this.File(fs, fileName, options))
                .then((fileEntry) => fileEntry.createWriter((fileWriter) => resolve(fileWriter)))
                .catch(e => reject(e));
        });
    }

    /**
     * Creates a directory.
     * @param {string} rootPath - The root path.
     * @param {string} path - The directory path.
     * @param {*} options - Options for directory creation.
     * @returns {Promise} - Promise resolving to the directory entry.
     */
    CreateDirectory(rootPath, path, options = {}) {
        return new Promise((resolve, reject) => {
            this.Local(rootPath)
                .then((fs) => this.Directory(fs, path, options))
                .then((dirEntry) => resolve(dirEntry))
                .catch(e => reject(e));
        });
    }

    /**
     * Creates a file.
     * @param {string} rootPath - The root path.
     * @param {string} path - The file path.
     * @param {string} fileName - The file name.
     * @param {*} content - The content of the file.
     * @param {boolean} isAppend - Indicates whether to append to the file.
     * @param {*} options - Options for file creation.
     * @returns {Promise} - Promise resolving to the file entry.
     */
    CreateFile(rootPath, path, fileName, content, isAppend, options = {}) {
        return new Promise((resolve, reject) => {
            this.Local(rootPath)
                .then((fs) => this.Directory(fs, path, options))
                .then((dirEntry) => this.File(dirEntry, fileName, options))
                .then((fileEntry) => this.Write(fileEntry, content, isAppend))
                .then((fileEntry) => resolve(fileEntry))
                .catch(e => reject(e));
        });
    }

    /**
     * Reads content from a file.
     * @param {string} rootPath - The root path.
     * @param {string} path - The file path.
     * @param {string} fileName - The file name.
     * @returns {Promise} - Promise resolving to the file content.
     */
    ReadFile(rootPath, path, fileName) {
        return new Promise((resolve, reject) => {
            this.Local(rootPath)
                .then((fs) => this.Directory(fs, path))
                .then((dirEntry) => this.File(dirEntry, fileName))
                .then((fileEntry) => this.Read(fileEntry))
                .then((content) => resolve(content))
                .catch(e => reject(e));
        });
    }

    /**
     * Reads entries from a directory.
     * @param {string} rootPath - The root path.
     * @param {string} path - The directory path.
     * @returns {Promise} - Promise resolving to the directory entries.
     */
    ReadDirectory(rootPath, path) {
        return new Promise((resolve, reject) => {
            this.Local(rootPath)
                .then((fs) => this.Directory(fs, path))
                .then((dirEntry) => new Promise((resolve, reject) => resolve(dirEntry.createReader())))
                .then((reader) => new Promise((resolve, reject) => reader.readEntries((entries) => resolve(entries), e => reject(e))))
                .then((entries) => resolve(entries))
                .catch(e => reject(e));
        });
    }

}