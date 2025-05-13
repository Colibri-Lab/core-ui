/**
 * Graphics methods and helpers
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.Graphics = class {

    /**
     * Loads an image from a URL.
     * @param {string} url - The URL of the image to load.
     * @returns {Promise<HTMLImageElement>} - A promise that resolves to the loaded image.
     * @memberof Colibri.Common.Graphics
     * @static
     * @example
     * Colibri.Common.Graphics.LoadImage('path/to/image.png')
     *   .then(image => {
     *     Use the loaded image
     *   })
     *   .catch(error => {  
     *      Handle error   
     *   })
     * @description
     * Loads an image from a URL. This method creates a new Image object and sets its 
     */
    static LoadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Failed to load image'));
            image.src = url;
        });
    }

    /**
     * Resizes an image to the specified dimensions.
     * @param {HTMLImageElement} image - The image to resize.
     * @param {number} width - The desired width of the resized image.
     * @param {number} height - The desired height of the resized image.
     * @returns {string} - The resized image as a data URL.
     * @memberof Colibri.Common.Graphics
     * @static
     * @example
     * const resizedImage = Colibri.Common.Graphics.ResizeImage(image, 200, 100);
     * resizedImage is a data URL of the resized image
     * @description
     * Resizes an image to the specified dimensions. This method creates a new canvas element,
     * draws the image onto the canvas at the specified size, and then returns the canvas
     * content as a data URL. The original image is not modified.
     */
    static ResizeImage(image, width, height, aspectRatio = true) {
        return new Promise((resolve, reject) => {
            if (aspectRatio) {
                const ratio = Math.max(width / image.width, height / image.height);
                width = image.width * ratio;
                height = image.height * ratio;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);
            canvas.toBlob(blob => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = err => reject(err);
                img.src = URL.createObjectURL(blob);
            }, 'image/png');
        });
    }

    /**
     * Crops an image to the specified dimensions.
     * @param {HTMLImageElement} image - The image to crop.
     * @param {number} x - The x-coordinate of the top-left corner of the crop area.
     * @param {number} y - The y-coordinate of the top-left corner of the crop area.
     * @param {number} width - The width of the crop area.
     * @param {number} height - The height of the crop area.
     * @returns {string} - The cropped image as a data URL.
     * @memberof Colibri.Common.Graphics
     * @static
     * @example
     * const croppedImage = Colibri.Common.Graphics.CropImage(image, 10, 10, 100, 100);
     * croppedImage is a data URL of the cropped image
     * @description
     * Crops an image to the specified dimensions. This method creates a new canvas element,
     * draws the specified portion of the image onto the canvas, and then returns the canvas
     * content as a data URL. The original image is not modified.    
     */
    static CropImage(image, x, y, width, height) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
            canvas.toBlob(blob => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = err => reject(err);
                img.src = URL.createObjectURL(blob);
            }, 'image/png');
        });
    }

    /**
     * Converts a data URL to a Blob.
     * @param {string} dataURL - The data URL to convert.
     * @returns {Blob} - The converted Blob.
     * @memberof Colibri.Common.Graphics
     * @static
     * @example
     * const blob = Colibri.Common.Graphics.DataURLToBlob(dataURL);
     * blob is a Blob object representing the data URL
     */
    static FileFromImage(image) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            canvas.toBlob(blob => {
                if(App.Device.isWeb) {
                    const file = new File([blob], 'image.png', { type: 'image/png' });
                    resolve(file);
                } else {
                    resolve(blob);
                }
            }, 'image/png');
        });
    }

    /**
     * Converts a Blob to a data URL.
     * @param {Blob} blob - The Blob to convert.
     * @returns {Promise<string>} - A promise that resolves to the data URL.
     * @memberof Colibri.Common.Graphics
     * @static
     * @example
     * Colibri.Common.Graphics.ImageFromFile(file)
     *   .then(image => {
     *     Use the data URL
     *   })
     */
    static ImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = err => reject(err);
                img.src = event.target.result;
            };
            reader.onerror = err => reject(err);
            reader.readAsDataURL(file);
        });
    }

    static CreatePreview(file, previewWidth, previewHeight) {
        return new Promise((resolve, reject) => {
            Colibri.Common.Graphics.ImageFromFile(file).then((image) => {
                return Colibri.Common.Graphics.ResizeImage(image, previewWidth, previewHeight);
            }).then((image) => {
                return Colibri.Common.Graphics.CropImage(image, (image.width - previewWidth) / 2, (image.height - previewHeight) / 2, previewWidth, previewHeight);
            }).then((image) => {
                return Colibri.Common.Graphics.FileFromImage(image);
            }).then((file) => {
                resolve(file);
            }).catch((error) => {
                reject(error);
            });
        });
    }

}