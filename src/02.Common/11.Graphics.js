/**
 * Graphics methods and helpers
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.Graphics = class {

    static LoadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Failed to load image'));
            image.src = url;
        });
    }

}