/**
 * Map using MapLibre
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.Maps
 */
Colibri.UI.Maps.MapLibre = class extends Colibri.UI.Pane {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.MapLibre']);
        this.AddClass('colibri-ui-maps-maplibre');

        this._loaded = false;
        this._map = null;
        this._objects = {};
        this._icons = {};
        this._layers = {};

        this._zoomZoomIn = this.Children('zoom/zoom-in');
        this._zoomZoomOut = this.Children('zoom/zoom-out');
        this._zoomRotate = this.Children('zoom/rotate');
        this._zoomSetCenter = this.Children('zoom/set-center');
        this._layersSwitch = this.Children('layers/switch');
        this._mapContainer = this.Children('map-container');

        this._loadMap();

        this._zoomZoomIn.AddHandler('Clicked', this.__zoomZoomInClicked, false, this);
        this._zoomZoomOut.AddHandler('Clicked', this.__zoomZoomOutClicked, false, this);
        this._zoomRotate.AddHandler('Rotated', this.__zoomRotateRotated, false, this);
        this._zoomSetCenter.AddHandler('Clicked', this.__zoomSetCenterClicked, false, this);
        this._layersSwitch.AddHandler('Changed', this.__layersSwitchChanged, false, this);
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Loaded', false, 'When map is fully loaded');
        this.RegisterEvent('Changed', false, 'When zoom or move event is faired');
    }

    _loadMap() {
        Promise.all([
            Colibri.Common.LoadScript('https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.js'),
            Colibri.Common.LoadStyles('https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.css'),
            Colibri.Common.LoadScript('https://cdn.jsdelivr.net/npm/@turf/turf@7.2.0/turf.min.js')
        ]).then(() => {
            this._loaded = true;
            this._map = new maplibregl.Map({
                container: this._mapContainer.container,
                center: this._center || [37.6173, 55.7558], // lng, lat
                zoom: this._zoom || 10,
                bearing: 0,
                pitch: 0
            });

            this._map.on('load', () => {
                this.Dispatch('Loaded', {});
            });

            this._map.on('moveend', () => {
                const bounds = this._map.getBounds();
                this._bbox = [
                    [bounds.getWest(), bounds.getSouth()],
                    [bounds.getEast(), bounds.getNorth()]
                ];
                this.Dispatch('Changed', {});
            });

            this._map.on('zoomend', () => {
                this._zoom = this._map.getZoom();
                this.Dispatch('Changed', {});
            });

            this._map.on('styleimagemissing', async (e) => {
                const iconData = this._icons[e.id];
                if(!iconData) {
                    return;
                }

                const svg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconData.content);
                const image = new Image();
                image.width = iconData.width;
                image.height = iconData.height;
                const promise = new Promise((resolve) => {
                    image.onload = resolve;
                });
                image.src = svg;
                await promise; // Wait for the image to load
                this._map.addImage(e.id, image);
            });

        });
    }

    __layersSwitchChanged(event, args) {
        this.SwitchToLayer(args.current);
        this.Dispatch('Changed', {});
    }
    __zoomSetCenterClicked() {
        this._map.flyTo({center: this._center, zoom: this._zoom});
    }
    __zoomRotateRotated(event, args) {
        this._map.rotateTo(args.angle);
    }
    __zoomZoomInClicked() {
        if(this.zoom >= 18) {
            return;
        }
        this._map.zoomIn();
    }
    __zoomZoomOutClicked() {
        if(this.zoom <= 1) {
            return;
        }
        this._map.zoomOut();
    }

    get center() { return this._center; }
    set center(value) {
        value = this._convertProperty('Array', value);
        this._center = value;
        this._showCenter();
    }
    _showCenter() {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            this.SetCenter(this._center);
        });
    }
    SetCenter(latLngLike) {
        this._map.setCenter(Array.isArray(latLngLike) ? latLngLike : [latLngLike.lng, latLngLike.lat]);
    }

    get zoom() { return this._zoom; }
    set zoom(value) {
        this._zoom = value;
        this._showZoom();
    }
    _showZoom() {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            this.SetZoom(this._zoom);
        });
    }
    SetZoom(zoom) {
        this._map.setZoom(zoom);
    }

    get bbox() { return this._bbox; }
    set bbox(value) {
        this._bbox = value;
        this._showBbox();
    }
    _showBbox() {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            this.SetBBox(this._bbox);
        });
    }
    SetBBox(bbox) {
        this._map.fitBounds([[bbox[0][1], bbox[0][0]], [bbox[1][1], bbox[1][0]]]);
    }

    /**
     * Tiles string in format https://tile.openstreetmap.org/{z}/{x}/{y}.png
     * @type {Object}
     */
    get tiles() {
        return this._tiles;
    }
    /**
     * Tiles string in format https://tile.openstreetmap.org/{z}/{x}/{y}.png
     * @type {Object}
     */
    set tiles(value) {
        value = this._convertProperty('Object', value);
        this._tiles = value;
        this._showTiles();
    }
    _showTiles() {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            Object.forEach(this._tiles, (name, tileUrl) => {
                this.AddTiles(tileUrl, name);
            });
            this.SwitchToLayer(Object.keys(this._layers)[0]);
        });
    }

    AddTiles(tileUrl, name = 'default') {
        this._layers[name] = name;
        this._map.addSource(name, {
            type: 'raster',
            tiles: [tileUrl], 
            tileSize: 256, 
            minzoom: 0,    
            maxzoom: 22    
        });
        this._layersSwitch.AddLayer(name);
    }

    SwitchToLayer(name) {
        if(this._layers[name]) {
            
            if(this._currentLayer) {
                this._map.removeLayer(this._currentLayer);
            }
            this._map.addLayer({
                id: name,
                type: 'raster',
                source: name
            });
            this._currentLayer = name;

        }
    }

    MarkerPosition(name) {
        const source = this._map.getSource(name);
        if(!source) {
            return null;
        }
        const ll = source.getLngLat();
        return {lat: ll.lat, lng: ll.lng};
    }

    AddMarker(name, latLngLike, icon = null, opacity = 1, azimuth = 0) {
        if(this.Exists(name)) {
            // this._map.getSource(name).setData()
        } else {

            this._map.addSource(name, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [latLngLike.lng, latLngLike.lat] },
                        properties: { angle: azimuth }
                    }]
                }
            });

            this._map.addLayer({
                id: name,
                type: 'symbol',
                source: name,
                layout: {
                    'icon-image': icon,
                    'icon-rotate': ['get', 'angle'],
                    'icon-allow-overlap': true,
                    'icon-rotation-alignment': 'map',
                    'icon-anchor': 'center'
                }
            });

        }
    }

    AddPopup(name, popupHtml) {
        // const object = this._objects[name];
        // if(!object) return;
        // const data = this._map.getSource(name).getData();
        // data.properties.description = popupHtml;
        // this._map.getSource(name).setData(data);
    }

    AddTooltip(name, toolTipHtml) {
        // const object = this._objects[name];
        // if(!object) return;
        // const data = this._map.getSource(name).getData();
        // data.properties.description = toolTipHtml;
        // this._map.getSource(name).setData(data);
    }

    OpenPopup(name) {
        const object = this._objects[name];
        if(!object) return;
        this._map.getLayer(name).togglePopup();
    }

    AddPolyline(name, latLngArray, color = 'red', weight = 1) {

        const geoData = {
            type: 'LineString',
            coordinates: latLngArray.map(ll => [ll?.lng || ll[1], ll?.lat || ll[0]])
        };

        if(this.Exists(name)) {
            const source = this._map.getSource(name);
            if(!Object.shallowEqual(source._data, geoData)) {
                source.setData(geoData);
            }
        } else {

            this._map.addSource(name, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: geoData
                }
            });
            this._map.addLayer({
                id: name,
                type: 'line',
                source: name,
                paint: {
                    'line-color': color,
                    'line-width': weight
                }
            });
        }
    }

    AddCircle(name, latLngLike, radius, color = 'red') {
        
        const geoData = {
            type: 'Point',
            coordinates: [latLngLike.lng, latLngLike.lat]
        };

        if(this.Exists(name)) {
            const source = this._map.getSource(name);
            if(!Object.shallowEqual(source._data, geoData)) {
                source.setData(geoData);
            }
        } else {
            this._map.addSource(name, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: geoData
                    }]
                }
            });

            this._map.addLayer({
                id: name,
                type: 'circle',
                source: name,
                paint: {
                    'circle-radius': radius, // радиус в пикселях
                    'circle-color': color,
                    'circle-opacity': 1
                }
            });

        }
    }

    AddLineFromGeo(name, geolineObject, color = 'red', weight = 1) {
        if(this.Exists(name)) {
            const source = this._map.getSource(name);
            if(!Object.shallowEqual(source._data, geolineObject)) {
                source.setData(geolineObject);
            }
        } else {
            this._map.addSource(name, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: geolineObject
                }
            });
            this._map.addLayer({
                id: name,
                type: 'line',
                source: name,
                paint: {
                    'line-color': color,
                    'line-width': weight
                }
            });
        }
    }

    AddGeoLine(name, latLngLike, azimuth, color = 'red', weight = 1) {
        const end = this._destinationPoint2(latLngLike.lng, latLngLike.lat, azimuth);
        if(!end) return {};
        const line = turf.greatCircle([latLngLike.lng, latLngLike.lat], [end.lng, end.lat], { npoints: 100 });
        this.AddPolyline(name, line.geometry.coordinates.map(v => ({lat: v[1], lng: v[0]})), color, weight);
        return {
            start: latLngLike,
            end: end,
            line: line,
            angle: azimuth,
            lastAngle: this._getAngleBetweenLastSegment(line.geometry.coordinates.map(v => ([v[1],v[0]]))),
        };
    }

    AddIcon(iconName, iconContent, width, height) {
        // Для MapLibre используем SVG как innerHTML маркера
        this._icons[iconName] = {content: iconContent, width, height};
    }

    AddDivIcon(iconName, className, width, height) {
        // Для MapLibre используем CSS класс для div-маркера
        this._icons[iconName] = `<div class="${className}" style="width:${width}px;height:${height}px"></div>`;
    }

    DeleteByName(name) {
        this._map.removeLayer(name);
        this._map.removeSource(name);
    }

    DeleteByNameLike(nameLike, except = []) {
        const names = Object.keys(this._map.getStyle().sources);
        for(const name of names) {
            if(name.indexOf(nameLike) !== -1 && except.indexOf(name) === -1) {
                this.DeleteByName(name);
            };
        }
    }

    Exists(name) {
        return !!this._map.getSource(name);
    }

    // --- Вспомогательные методы ---
    _degToRad(deg) { return deg * Math.PI / 180; }
    _destinationPoint2(lng, lat, bearing) {
        const distance = 10_000_000;
        const R = 6378137;
        const brng = bearing * Math.PI / 180;
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
    _getAngleBetweenLastSegment(coords) {
        const a = coords[coords.length - 2];
        const b = coords[coords.length - 1];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return (angle + 360) % 360;
    }
}
