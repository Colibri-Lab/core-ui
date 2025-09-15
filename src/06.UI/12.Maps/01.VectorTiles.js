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
            Colibri.Common.LoadScript('https://unpkg.com/maplibre-gl/dist/maplibre-gl.js')
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
            // style: '//' + this._settings.address + '/styles/' + (this._settings.style ?? 'basic') + '/style.json',
            style: 'https://demotiles.maplibre.org/style.json', // stylesheet location
            center: [this._settings.lat ?? 44.5035, this._settings.lng ?? 40.1772],
            zoom: this._settings.zoom ?? 13
        };

        if (this._settings.sources) {
            options.sources = this._settings.sources;
        }

        if (this._settings.layers) {
            options.layers = this._settings.layers;
        }
        
        this._map = new maplibregl.Map(options);
        this._map.on('error', (e) => console.log(e.error.message));

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
            } else {
                return;
            }
        });

    }

    Fly(lat, lng, zoom, speed = 0.2, curve = 1) {
        this._map.flyTo({ center: [lat, lng], zoom: zoom, speed: speed, curve: curve });
    }

    ChangeVector(name, start, end, angle, toolTip = '', color = '#ff0000', width = 3) {

        this._map.getSource(name).setData({
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [start.lng, start.lat],
                            [end.lng, end.lat]
                        ]
                    },
                    "properties": {
                        "info": toolTip
                    }
                }
            ]
        });

        this._map.getSource(name + '-arrow-point').setData({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [end.lng, end.lat] },
                properties: { angle: -1 * angle }
            }]
        });

        this._map.setPaintProperty(name + '-layer', 'line-color', color);
        this._map.setPaintProperty(name + '-layer', 'line-width', width);

    }

    AddVector(name, start, end, angle, toolTip = '', color = '#ff0000', width = 3) {

        if(this._map.getSource(name)) {
            this.ChangeVector(name, start, end, angle, toolTip, color, width);
            return;
        }


        this._map.addSource(name, { type: 'geojson', data: {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [start.lng, start.lat],
                            [end.lng, end.lat]
                        ]
                    },
                    "properties": {
                        "info": toolTip
                    }
                }
            ]
        } });

        this._map.addLayer({
            id: name + '-layer',
            type: 'line',
            source: name,
            paint: {
                'line-color': color,
                'line-width': width
            }
        });

        this._map.addSource(name + '-arrow-point', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [end.lng, end.lat] },
                    properties: { angle: -1 * angle }
                }]
            }
        });

        this._map.addLayer({
            id: name + '-arrow-layer',
            type: 'symbol',
            source: name + '-arrow-point',
            layout: {
                'icon-image': 'arrow',
                'icon-size': 1 / this._map.getZoom(),
                'icon-rotate': ['get', 'angle'],
                'icon-allow-overlap': true
            }
        });
        
        // обработчик клика по линии
        this._map.on('click', name + '-layer', (e) => {
            const feature = e.features[0];
            new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(feature.properties.info)
                .addTo(this._map);
            this.Dispatch('ObjectClicked', {feature: e.features[0], lngLat: e.lngLat});
        });

        // меняем курсор при наведении
        this._map.on('mouseenter', name + '-layer', (e) => {
            this._map.getCanvas().style.cursor = 'pointer';
            this.Dispatch('ObjectMouseEnter', {feature: e.features[0], lngLat: e.lngLat});
        });
        this._map.on('mouseleave', name + '-layer', (e) => {
            this._map.getCanvas().style.cursor = '';
            this.Dispatch('ObjectMouseLeave', {});
        });
    }

    RemoveVector(name) {
        if (this._map.getLayer(name + '-layer')) {
            this._map.removeLayer(name + '-layer');
        }

        if (this._map.getLayer(name + '-arrow-layer')) {
            this._map.removeLayer(name + '-arrow-layer');
        }

        // Проверяем, существует ли источник, и удаляем
        if (this._map.getSource(name)) {
            this._map.removeSource(name);
        }

        if (this._map.getSource(name + '-arrow-point')) {
            this._map.removeSource(name + '-arrow-point');
        }
    }

}

Colibri.UI.Maps.VectorTiles.Icons = {
    Arrow: '<svg width="68" height="79" viewBox="0 0 68 79" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M68 39.5289L0.499997 78.5L0.5 0.557713L68 39.5289Z" fill="#ff0000"/></svg>'
}