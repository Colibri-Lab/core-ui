Colibri.Devices.FileSystem = class extends Colibri.Events.Dispatcher {
    
    static NotFound = 1;	
    static SecurityError = 2;
    static Abort = 3;
    static NotReachable = 4;	
    static Encoding = 5;
    static NoModificationAllowed = 6;	
    static InvalidState = 7;
    static SyntaxError = 8;
    static InvalidModification = 9;	
    static QuotaExeeded = 10;
    static TypeMismatch = 11;	
    static PathExists = 12;

    _device = null;
    _plugin = null;

    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('file');
    }

    /**
     * Каталог только для чтения, в котором установлено 
     * приложение. (iOS, Android, BlackBerry 10, OSX, windows)
     */
    get AppDirectory() {
        return this._plugin.applicationDirectory;
    }

    /**
     *  Корневой каталог песочницы приложения; в iOS и 
     * Windows это расположение доступно только для чтения 
     * (но определенные подкаталоги [например, на iOS или в Windows] 
     * читаются и записываются). Все данные, содержащиеся внутри, 
     * являются частными для (iOS, Android, BlackBerry 10, OSX/Documents/localState)
     */
    get AppStorageDirectory() {
        return this._plugin.applicationStorageDirectory    
    }

    /**
     * Постоянное и приватное хранение данных в песочнице приложения с 
     * использованием встроенной памяти (на Android, если вам нужно использовать 
     * внешнюю память, используйте). В iOS этот каталог не синхронизируется с iCloud 
     * (используйте). (iOS, Android, BlackBerry 10, окна.externalDataDirectory.syncedDataDirectory)
     */
    get DataDirectory() {
        return this._plugin.dataDirectory;
    }

    /**
     * Каталог для кэшированных файлов данных или любых файлов, 
     * которые ваше приложение может легко воссоздать. ОС может удалить 
     * эти файлы, когда на устройстве заканчивается хранилище, тем не менее, 
     * приложения не должны полагаться на ОС для удаления файлов здесь. 
     * (iOS, Android, BlackBerry 10, OSX, windows)
     */
    get CacheDirectory() {
        return this._plugin.cacheDirectory;
    }

    /**
     * Прикладное пространство на внешнем накопителе. (Андроид)
     */
    get ExternalAppStorageDirectory() {
        return this._device.externalApplicationStorageDirectory;
    }

    /**
     * Куда поместить файлы данных приложения на внешнее хранилище. (Андроид)
     */
    get ExternalDataDirectory() {
        return this._device.externalDataDirectory;
    } 
    
    /**
     * Внешний накопитель (SD-карта) root. (Андроид, BlackBerry 10)
     */
    get ЕxternalRootDirectory() {
        return this._plugin.externalRootDirectory;
    }

    /**
     * Временный каталог, который ОС может очистить по желанию. 
     * Не полагайтесь на ОС для очистки этого каталога; ваше 
     * приложение всегда должно удалять файлы, если это 
     * применимо. (iOS, OSX, windows)
     */
    get TempDirectory() {
        return this._plugin.tempDirectory;
    }

    /**
     * Содержит файлы, специфичные для приложения, которые 
     * должны быть синхронизированы (например, с iCloud). (iOS, окна)
     */
    get SyncedDataDirectory() {
        return this._plugin.syncedDataDirectory;
    }

    /**
     * Файлы, закрытые для приложения, но значимые для другого 
     * приложения (например, файлы Office). Обратите внимание, 
     * что для OSX это каталог пользователя. (iOS, OSX~/Documents)
     */
    get DocumentsDirectory() {
        return this._plugin.documentsDirectory;
    }

    /**
     * Файлы глобально доступны для всех приложений (BlackBerry 10)
     */
    get SharedDirectory() {
       return this._plugin.sharedDirectory;
    }

    Blob(name, content) {
        if(content instanceof Blob) {
            return content;
        }
        const mimetype = Colibri.Common.MimeType.ext2type(name.pathinfo().ext);
        return new Blob([content], { type: mimetype });
    }

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

    Get(type = LocalFileSystem.PERSISTENT, quota = 0) {
        return new Promise((resolve, reject) => {
            window.requestFileSystem(type, quota, (fs) => {
                resolve(fs.root);
            }, (e) => reject(e));
        });
    }

    Local(path) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (entry) => {
                resolve(entry);
            }, e => reject(e));
        });
    }


    File(fsOrDir, fileName, options) {
        options = Object.assign({ create: true, exclusive: false }, options);
        return new Promise((resolve, reject) => {
            fsOrDir.getFile(fileName, options, (fileEntry) => {
                resolve(fileEntry);
            }, e => reject(e));
        });
    }

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

    CreateDirectory(rootPath, path, options = {}) {
        return new Promise((resolve, reject) => {
            this.Local(rootPath)
                .then((fs) => this.Directory(fs, path, options))
                .then((dirEntry) => resolve(dirEntry))
                .catch(e => reject(e));
        });
    }

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