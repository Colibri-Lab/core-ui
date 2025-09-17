/**
 * Vector tiles map
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.Maps
 */
Colibri.UI.Maps.VectorTiles = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.VectorTimes']);
        this.AddClass('colibri-ui-maps-vectortimes');

        this._map = null;
        this._mapLoaded = false;

        Promise.all([
            Colibri.Common.LoadStyles('https://unpkg.com/maplibre-gl/dist/maplibre-gl.css'),
            Colibri.Common.LoadScript('https://unpkg.com/maplibre-gl/dist/maplibre-gl.js'),
            Colibri.Common.LoadScript('https://cdn.jsdelivr.net/npm/@turf/turf@7.2.0/turf.min.js')
        ]).then(() => {
            this._mapLoaded = true;
            this._loadMap();
        });

    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Loaded', false, 'When map is loaded completely');
        this.RegisterEvent('ObjectClicked', false, 'Clicked on object on map');
        this.RegisterEvent('ObjectMouseEnter', false, 'Mouse entered over object on map');
        this.RegisterEvent('ObjectMouseLeave', false, 'Mouse leaved from object on map');
    }

    /**
     * Settings
     * @type {Object}
     */
    get settings() {
        return this._settings;
    }
    /**
     * Settings
     * @type {Object}
     */
    set settings(value) {
        this._settings = value;
        this._loadMap();
    }

    _loadMap() {

        if (!this._mapLoaded) {
            return;
        }

        if (this._map) {
            this._map.remove();
            this._map = null;
        }

        const options = {
            container: this._element,
            style: this._settings.style ?? 'https://demotiles.maplibre.org/style.json',
            center: [this._settings.lat ?? 44.5035, this._settings.lng ?? 40.1772],
            zoom: this._settings.zoom ?? 13,
            bounds: this._settings.bounds ?? []
        };

        if (this._settings.sources) {
            options.sources = this._settings.sources;
        }

        if (this._settings.layers) {
            options.layers = this._settings.layers;
        }
        
        this._map = new maplibregl.Map(options);
        this._map.on('error', (e) => console.log(e.error.message));
        this._map.on('load', (e) => this.Dispatch('Loaded', {domEvent: e}));

        this._navigation = new maplibregl.NavigationControl();
        this._map.addControl(this._navigation);

        this._map.on('styleimagemissing', async (e) => {
            if(e.id === 'arrow' && !this._map.hasImage(e.id)) {
                const svg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(Colibri.UI.Maps.VectorTiles.Icons.Arrow);
                const image = new Image();
                const promise = new Promise((resolve) => {
                    image.onload = resolve;
                });
                image.src = svg;
                await promise; // Wait for the image to load
                this._map.addImage(e.id, image);
            } else if(e.id === 'kamaz' && !this._map.hasImage(e.id)) {
                const svg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(Colibri.UI.Maps.VectorTiles.Icons.Kamaz);
                console.log(svg);
                const image = new Image();
                const promise = new Promise((resolve) => {
                    image.onload = resolve;
                });
                image.src = svg;
                await promise; // Wait for the image to load
                this._map.addImage(e.id, image);
            } else {
                return;
            }
        });

    }

    Fly(lat, lng, zoom, speed = 0.2, curve = 1) {
        this._map.flyTo({ center: [lat, lng], zoom: zoom, speed: speed, curve: curve });
    }

    ChangeObject(name, point, angle) {

        this._map.getSource(name).setData({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
                properties: { angle: angle }
            }]
        });

    }

    ChangeLine(name, start, angle, toolTip = '', color = '#ff0000', width = 3) {
        const distance = 10_000_000; // "infinity" 10,000 km
        const end = this._destinationPoint(start.lng, start.lat, distance, angle);
        const line = turf.greatCircle([start.lng, start.lat], [end.lng, end.lat], { npoints: 100, properties: {
            "info": toolTip
        } });

        this._map.getSource(name).setData({
            "type": "FeatureCollection",
            "features": [
                line
            ]
        });

        this._map.setPaintProperty(name + '-layer', 'line-color', color);
        this._map.setPaintProperty(name + '-layer', 'line-width', width);
        return {
            start: start,
            end: end,
            line: line,
            angle: angle,
            lastAngle: this._getAngleBetweenLastSegment(line.geometry.coordinates)
        }
    }

    _getAngleBetweenLastSegment(coords) {
        const a = coords[coords.length - 2];
        const b = coords[coords.length - 1];

        const p1 = this._map.project([a[0], a[1]]);
        const p2 = this._map.project([b[0], b[1]]);

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return -1 * angle + 180;
    }

    _destinationPoint(lng, lat, distance, bearing) {
        const R = 6378137; // Earth radius in meters
        const brng = bearing * Math.PI / 180; // to radians
        const phi1 = lat * Math.PI / 180;
        const lambda1 = lng * Math.PI / 180;
        
        const phi2 = Math.asin(Math.sin(phi1) * Math.cos(distance / R) +
                            Math.cos(phi1) * Math.sin(distance / R) * Math.cos(brng));

                            const lambda2 = lambda1 + Math.atan2(
            Math.sin(brng) * Math.sin(distance / R) * Math.cos(phi1),
            Math.cos(distance / R) - Math.sin(phi1) * Math.sin(phi2)
        );

        return { lng: lambda2 * 180 / Math.PI, lat: phi2 * 180 / Math.PI };
    }

    AddObject(name, objectSrc, point, angle, width = 1, height = 1) {
        
        if(this._map.getSource(name)) {
            this.ChangeObject(name, point, angle);
            return;
        }

        this._map.addSource(name, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
                    properties: { angle: angle }
                }]
            }
        });

        this._map.addLayer({
            id: name + '-layer',
            type: 'symbol',
            source: name,
            layout: {
                'icon-image': objectSrc,
                'icon-size': 1 / this._map.getZoom(),
                'icon-rotate': ['get', 'angle'],
                'icon-allow-overlap': true,
                'icon-rotation-alignment': 'map',
                'icon-anchor': 'center'
            }
        });

    }

    AddLine(name, start, angle, toolTip, color = '#ff0000', width = 3) {

        if(this._map.getSource(name)) {
            return this.ChangeLine(name, start, angle, toolTip, color, width);
        }

        const distance = 10_000_000; // "infinity" 10,000 km
        const end = this._destinationPoint(start.lng, start.lat, distance, angle);
        const line = turf.greatCircle([start.lng, start.lat], [end.lng, end.lat], { npoints: 100, properties: {
            "info": toolTip
        }});

        this._map.addSource(name, {
            type: 'geojson',
            data: line
        });

        this._map.addLayer({
            id: name + '-layer',
            type: 'line',
            source: name,
            paint: {
                'line-color': color,
                'line-width': width
            }
        });

        return {
            start: start,
            end: end,
            line: line,
            angle: angle,
            lastAngle: this._getAngleBetweenLastSegment(line.geometry.coordinates),
        };

    }

    Remove(name) {
        if (this._map.getLayer(name)) {
            this._map.removeLayer(name);
        }

        if (this._map.getLayer(name + '-layer')) {
            this._map.removeLayer(name + '-layer');
        }
    }

}

Colibri.UI.Maps.VectorTiles.Icons = {
    Arrow: '<svg width="78" height="68" viewBox="0 0 78 68" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M39.0289 0.5L78 68L39.0289 48.5L0.0577393 68L39.0289 0.5Z" fill="#FF0000"/></svg>',
    Kamaz: '<svg width="150" height="339" viewBox="0 0 150 339" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.58056 336.941V18.287C1.54446 10.4009 11.5481 5.97896 15.5967 4.84983C24.0166 2.04772 126.593 1.33833 135.015 4.28823C140.436 5.55332 149.438 9.38405 149.591 17.7313V338.065L1.57642 336.942H1.57938L1.58056 336.941Z" fill="#1EAD00" stroke="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11.9232 19.4733C10.0631 20.1414 10.0459 20.567 10.0672 21.9858C10.1205 24.581 12.1777 34.5835 13.2323 34.5835C33.9526 34.2524 64.8748 33.5962 75.3915 33.5903C85.7899 33.5962 116.843 34.2524 137.569 34.5835C138.628 34.5835 140.682 24.581 140.735 21.9858C140.758 20.567 140.741 20.1414 138.882 19.4733C129.176 17.3274 88.0388 16.0209 75.3738 16.1333C61.1108 16.1333 20.8289 17.1855 11.9244 19.4733H11.9232Z" fill="white" stroke="black" stroke-width="2.5" stroke-linejoin="bevel"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2.53572 13.8632C6.56663 9.75464 8.81615 8.67869 15.3534 6.14852C35.8092 3.25182 112.466 2.80847 133.446 5.35638C140.992 7.45501 144.176 9.35264 147.697 12.7045C148.62 12.4503 148.946 12.3912 149.212 10.5586C145.389 7.01754 141.696 4.13858 134.701 2.83802C118.994 -0.478402 33.6349 0.556143 14.7616 3.03311C8.53385 5.10218 4.01883 7.95751 0.954956 12.1311L2.53808 13.8632H2.53572Z" fill="#7E7E7E" stroke="black" stroke-width="2.5"/><path fill-rule="evenodd" clip-rule="evenodd" d="M36.61 14.277C62.3774 12.604 88.1454 12.5213 113.914 14.011V8.47767C88.146 7.15938 62.1117 7.15938 36.61 8.47767V14.277Z" fill="#595959" stroke="black" stroke-width="1.3705"/><path d="M16.5743 39.1827L16.5743 113.569L134.241 113.569V39.1827L16.5743 39.1827Z" fill="#1EAD00" stroke="black" stroke-width="1.05005" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.28979 113.838L149.417 113.838" stroke="black" stroke-width="2.5"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11.4469 67.2652C10.1099 67.8871 6.09144 68.2312 5.30965 67.6092L4.80245 29.9269C4.75451 27.3597 6.83418 27.3377 7.4337 28.4581C8.45104 30.54 11.3729 38.7619 11.6315 40.985C11.6315 44.9504 12.5565 66.6433 11.4469 67.2652Z" fill="white" stroke="black" stroke-width="2.41551" stroke-linejoin="bevel"/><path fill-rule="evenodd" clip-rule="evenodd" d="M139.616 66.9167C140.954 67.5431 144.972 67.8871 145.754 67.2652L146.262 29.5828C146.31 27.0157 144.233 26.9936 143.629 28.114C142.611 30.196 139.693 38.4179 139.433 40.641C139.433 44.6064 138.51 66.2992 139.616 66.9167Z" fill="white" stroke="black" stroke-width="2.41543" stroke-linejoin="bevel"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11.4468 71.3183C10.1099 70.6917 6.09137 70.3488 5.30957 70.9695L5.36165 106.788C5.3143 109.354 11.3728 108.774 11.6314 106.558C11.6314 102.591 12.5565 71.9331 11.4468 71.3183Z" fill="white" stroke="black" stroke-width="2.4155" stroke-linejoin="bevel"/><path fill-rule="evenodd" clip-rule="evenodd" d="M139.616 71.2888C140.953 70.6624 144.972 70.3184 145.753 70.9403L145.7 105.081C145.747 107.652 139.693 108.221 139.432 105.998C139.243 102.033 138.509 71.9065 139.616 71.2888Z" fill="white" stroke="black" stroke-width="2.4154" stroke-linejoin="bevel"/><path d="M6.54047 331.656H145.043L145.043 118.578L6.54047 118.578L6.54047 331.656Z" fill="#F2F2E1" stroke="black" stroke-width="1.92825" stroke-linejoin="round"/><path d="M57.6144 52.1955V75.5045H94.4602V52.1955H57.6144Z" fill="#28B900" stroke="black" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5405 118.579L1.28979 113.838" stroke="black" stroke-width="2"/><path d="M145.043 118.579L149.417 113.838" stroke="black" stroke-width="2"/><path d="M61.191 47.8144C62.6923 47.8144 63.9094 46.5988 63.9094 45.0991C63.9094 43.5995 62.6923 42.3838 61.191 42.3838C59.6897 42.3838 58.4727 43.5995 58.4727 45.0991C58.4727 46.5988 59.6897 47.8144 61.191 47.8144Z" fill="#F4A70D" stroke="black" stroke-width="0.685512" stroke-linecap="round" stroke-linejoin="round"/><path d="M75.9901 47.8167C77.4914 47.8167 78.7084 46.601 78.7084 45.1014C78.7084 43.6017 77.4914 42.386 75.9901 42.386C74.4888 42.386 73.2717 43.6017 73.2717 45.1014C73.2717 46.601 74.4888 47.8167 75.9901 47.8167Z" fill="#F4A70D" stroke="black" stroke-width="0.685512" stroke-linecap="round" stroke-linejoin="round"/><path d="M90.7614 47.8111C92.2627 47.8111 93.4798 46.5954 93.4798 45.0958C93.4798 43.5962 92.2627 42.3805 90.7614 42.3805C89.2601 42.3805 88.0431 43.5962 88.0431 45.0958C88.0431 46.5954 89.2601 47.8111 90.7614 47.8111Z" fill="#F4A70D" stroke="black" stroke-width="0.685512" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.6085 13.4302C26.0568 13.4302 28.8521 12.2239 28.8521 10.7358C28.8521 9.24773 26.0568 8.04141 22.6085 8.04141C19.1602 8.04141 16.3649 9.24773 16.3649 10.7358C16.3649 12.2239 19.1602 13.4302 22.6085 13.4302Z" fill="#DEFFFF" stroke="black" stroke-width="1.03491" stroke-linecap="round" stroke-linejoin="round"/><path d="M128.845 13.4178C132.293 13.4178 135.088 12.2115 135.088 10.7234C135.088 9.23534 132.293 8.02902 128.845 8.02902C125.396 8.02902 122.601 9.23534 122.601 10.7234C122.601 12.2115 125.396 13.4178 128.845 13.4178Z" fill="#DEFFFF" stroke="black" stroke-width="1.03491" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.3628 14.1465C13.5847 14.1465 14.5753 13.5743 14.5753 12.8684C14.5753 12.1626 13.5847 11.5904 12.3628 11.5904C11.1408 11.5904 10.1503 12.1626 10.1503 12.8684C10.1503 13.5743 11.1408 14.1465 12.3628 14.1465Z" fill="#F4A70D" stroke="black" stroke-width="0.424291" stroke-linecap="round" stroke-linejoin="round"/><path d="M139.013 14.1756C140.235 14.1756 141.226 13.6034 141.226 12.8976C141.226 12.1917 140.235 11.6196 139.013 11.6196C137.791 11.6196 136.801 12.1917 136.801 12.8976C136.801 13.6034 137.791 14.1756 139.013 14.1756Z" fill="#F4A70D" stroke="black" stroke-width="0.424291" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.9468 113.462C16.9468 105.72 23.1028 98.2946 34.0612 92.8191C45.0196 87.3437 59.8831 84.2662 75.3834 84.2635C90.8836 84.2608 105.751 87.3331 116.717 92.8047C127.684 98.2764 133.85 105.699 133.861 113.442" fill="#1EAD00"/><path d="M16.9468 113.462C16.9468 105.72 23.1028 98.2946 34.0612 92.8191C45.0196 87.3437 59.8831 84.2662 75.3834 84.2635C90.8836 84.2608 105.751 87.3331 116.717 92.8047C127.684 98.2764 133.85 105.699 133.861 113.442" stroke="black" stroke-width="1.88022" stroke-linecap="round" stroke-linejoin="round"/></svg>'
}