/**
 * Map using MapLibre
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.Maps
 */
Colibri.UI.Maps.MapLibre = class extends Colibri.UI.Pane {

    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.MapLibre']);
        this.AddClass('colibri-ui-maps-maplibre');

        this._loaded = false;
        this._map = null;
        this._objects = {};
        this._icons = {};
        this._layers = {};
        this._selectedIds = [];
        this._disableChangeEvent = false;

        this._zoomZoomIn = this.Children('zoom/zoom-in');
        this._zoomZoomOut = this.Children('zoom/zoom-out');
        this._zoomRotate = this.Children('zoom/rotate');
        this._zoomSetCenter = this.Children('zoom/set-center');
        this._layersSwitch = this.Children('layers/switch');
        this._mapContainer = this.Children('map-container');

        this._layersZIndex = [];
        this._objectsSources = {};
        this._linesSources = {};
        this._pointsSources = {};

        this.GenerateChildren(element, this);

        this._loadMap();

        this._zoomZoomIn.AddHandler('Clicked', this.__zoomZoomInClicked, false, this);
        this._zoomZoomOut.AddHandler('Clicked', this.__zoomZoomOutClicked, false, this);
        this._zoomRotate.AddHandler('Rotating', this.__zoomRotateRotating, false, this);
        this._zoomRotate.AddHandler('Rotated', this.__zoomRotateRotated, false, this);
        this._zoomSetCenter.AddHandler('Clicked', this.__zoomSetCenterClicked, false, this);
        this._layersSwitch.AddHandler('Changed', this.__layersSwitchChanged, false, this);

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Loaded', false, 'When map is fully loaded');
        this.RegisterEvent('Changed', false, 'When zoom or move event is faired');
        this.RegisterEvent('SelectionChanged', false, 'When selection is changed');
        this.RegisterEvent('MbTilesProtocol', false, 'When mbtiles protocol is requested');
        this.RegisterEvent('LayerSwitched', false, 'When mbtiles protocol is requested');
        this.RegisterEvent('MapContextMenuItemClicked', false, 'When contextmenu item is clicked on map');
        this.RegisterEvent('MarkAdded', false, 'When user adds a mark to the map');
    }

    _loadScriptsAndStyles() {
        return new Promise((resolve, reject) => {
            if (this._resourcesLoaded) {
                resolve();
                return;
            }

            this._resourcesLoaded = false;
            Promise.all([
                Colibri.Common.LoadScript((!App.Device.isElectron ? '/' : '') + 'res/maplibre/maplibre-gl.js'),
                Colibri.Common.LoadStyles((!App.Device.isElectron ? '/' : '') + 'res/maplibre/maplibre-gl.css')
            ]).then(() => {
                this._resourcesLoaded = true;
                resolve();
            }).catch(() => {
                Promise.all([
                    Colibri.Common.LoadScript('https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js'),
                    Colibri.Common.LoadStyles('https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css'),
                ]).then(() => {
                    this._resourcesLoaded = true;
                    resolve();
                }).catch(() => {
                    reject();
                });
            });
        })
    }

    _loadMap() {

        this._loadScriptsAndStyles().then(() => {

            this._loaded = true;
            this._map = new maplibregl.Map({
                container: this._mapContainer.container,
                // center: {lng: 45.29590878451711, lat: 40.06732341520765}, // lng, lat
                // zoom: 24,
                bearing: 0,
                pitch: 0,
                renderWorldCopies: false,
                maxBounds: [
                    [-178, -85], // юго-западная граница (minLng, minLat)
                    [178, 85] // северо-восточная граница (maxLng, maxLat)
                ],
            });

            this._map.boxZoom.disable();
            this._map.dragRotate.disable();
            this._map.touchZoomRotate.disableRotation();

            this._map.on('load', () => {
                this.Dispatch('Loaded', {});
            });

            this._map.on('moveend', (e) => {
                if (this._zoomRotate.rotating) {
                    return;
                }

                this._getProperties();
                !this._disableChangeEvent && this.Dispatch('Changed', {});
            });

            this._map.on('zoomend', (e) => {
                if (this._zoomRotate.rotating) {
                    return;
                }
                this._getProperties();
                !this._disableChangeEvent && this.Dispatch('Changed', {});
            });

            this._map.on('rotatestart', (e) => {
                this._rotating = true;
            });

            this._map.on('rotateend', (e) => {
                if (this._zoomRotate.rotating) {
                    return;
                }
                this._getProperties();

                !this._disableChangeEvent && this.Dispatch('Changed', {});
                this._rotating = false;
            });

            this._map.on('styleimagemissing', async (e) => {
                const iconData = this._icons[e.id];
                if (!iconData) {
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

                if (this._map.hasImage(e.id)) {
                    return;
                }
                this._map.addImage(e.id, image);
            });


        });
    }

    get layersButtonGroup() {
        return this.Children('layers').container;
    }

    get additionalButtonGroup() {
        return this.Children('additional').container;
    }

    get commandsButtonGroup() {
        return this.Children('commands').container;
    }

    get filtersButtonGroup() {
        return this.Children('filters').container;
    }

    get extensionsButtonGroup() {
        return this.Children('extensions').container;
    }

    get zoomButtonGroup() {
        return this.Children('zoom').container;
    }

    _getProperties() {
        const bounds = this._map.getBounds();
        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();

        this._bbox = [
            { lng: southWest.lng, lat: southWest.lat },
            { lng: northEast.lng, lat: northEast.lat }
        ];
        this._zoom = this._map.getZoom();
        this._center = { lat: this._map.getCenter().lat, lng: this._map.getCenter().lng };
        this._rotation = this._map.getBearing();
    }

    __layersSwitchChanged(event, args) {
        this.SwitchToLayer(args.current);
        this.Dispatch('Changed', {});
    }
    __zoomSetCenterClicked() {
        this._map.flyTo({ center: this._center, zoom: this._zoom });
    }
    __zoomRotateRotating(event, args) {
        this._map.rotateTo(args.angle);
    }
    __zoomRotateRotated(event, args) {
        this._map.rotateTo(args.angle);
        this.Dispatch('Changed', {});
    }
    __zoomZoomInClicked() {
        if (this.zoom >= 18) {
            return;
        }
        this._map.zoomIn();
    }
    __zoomZoomOutClicked() {
        if (this.zoom <= 1) {
            return;
        }
        this._map.zoomOut();
    }

    Fly(center, zoom) {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            this._map.jumpTo({ center: center, zoom: zoom });
        });
    }

    get loaded() {
        return this._loaded;
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
        this._map.fitBounds([
            [bbox[0][1], bbox[0][0]], // [lat, lng]
            [bbox[1][1], bbox[1][0]]  // [lat, lng]
        ]);
    }

    /**
     * Set or get administrative data geojson url
     * @type {String}
     */
    get administrativeDataJson() {
        return this._administrativeDataJson;
    }
    /**
     * Set or get administrative data geojson url
     * @type {String}
     */
    set administrativeDataJson(value) {
        this._administrativeDataJson = value;
        this._showAdministrativeDataJson();
    }
    _showAdministrativeDataJson() {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            Object.forEach(this._administrativeDataJson, (name, arr) => {
                let index = 1;
                for (const geodata of arr) {
                    this._map.addSource(name + index, {
                        type: 'geojson',
                        data: Array.isArray(geodata) ? geodata[0] : geodata
                    });
                    index++;
                }
            });
        });
    }

    _moveBack(name) {
        try {
            if (!this._map.getLayer(name)) {
                return;
            }

            const linesSourceName = this._layersZIndex[0];
            if (linesSourceName && this._map.getLayer(linesSourceName)) {
                this._map.moveLayer(name, linesSourceName);
            }
        } catch (e) { }
    }

    _createLayers(sourceName, styles) {
        // Пример: полигоны
        if (styles?.polygons) {
            this._map.addLayer({
                id: sourceName + '-polygons',
                type: 'fill',
                source: sourceName,
                paint: styles?.polygons?.paint,
                minzoom: styles?.polygons?.minzoom ?? 0,
                maxzoom: styles?.polygons?.maxzoom ?? 24
            });
        }

        if (styles?.lines) {
            this._map.addLayer({
                id: sourceName + '-lines',
                type: 'line',
                source: sourceName,
                paint: styles?.lines?.paint,
                minzoom: styles?.lines?.minzoom ?? 0,
                maxzoom: styles?.lines?.maxzoom ?? 24
            });
        }

        if (styles?.points) {
            this._map.addLayer({
                id: sourceName + '-points',
                type: 'circle',
                source: sourceName,
                paint: styles?.points?.paint,
                minzoom: styles?.points?.minzoom ?? 0,
                maxzoom: styles?.points?.maxzoom ?? 24
            });

        }

        if (styles?.texts) {
            this._map.addLayer({
                id: sourceName + '-symbols',
                type: 'symbol',
                source: sourceName,
                layout: styles?.texts.layout,
                paint: styles?.texts.paint,
                filter: ['!', ['==', ['get', 'name'], '']],
                minzoom: styles?.texts?.minzoom ?? 0,
                maxzoom: styles?.texts?.maxzoom ?? 24
            });
        }

        this._moveBack(sourceName + '-points');
        this._moveBack(sourceName + '-lines');
        this._moveBack(sourceName + '-polygons');
        this._moveBack(sourceName + '-symbols');

    }
    _removeLayers(sourceName) {

        if (this._map.getLayer(sourceName + '-polygons')) {
            this._map.removeLayer(sourceName + '-polygons');
        }
        if (this._map.getLayer(sourceName + '-lines')) {
            this._map.removeLayer(sourceName + '-lines');
        }
        if (this._map.getLayer(sourceName + '-points')) {
            this._map.removeLayer(sourceName + '-points');
        }
        if (this._map.getLayer(sourceName + '-symbols')) {
            this._map.removeLayer(sourceName + '-symbols');
        }
    }

    /**
     * Glyphs url
     * @type {String}
     */
    get glyphs() {
        return this._glyphs;
    }
    /**
     * Glyphs url
     * @type {String}
     */
    set glyphs(value) {
        this._glyphs = value;
        this._showGlyphs();
    }
    _showGlyphs() {
        Colibri.Common.Wait(() => this._loaded && !!this._map.getStyle()).then(() => {
            const oldstyle = this._map.getStyle();
            this._map.setStyle({ ...oldstyle, glyphs: this._glyphs });
        });
    }

    ShowAdministrativeLayers() {
        this.HideAdministrativeLayers();
        Object.forEach(this._administrativeDataJson, (name, arr) => {
            let index = 1;
            for (let geodata of arr) {
                let layers = { polygons: null, lines: null, points: null, texts: null };
                if (Array.isArray(geodata)) {
                    layers = geodata[1];
                    geodata = geodata[0];
                }
                Colibri.Common.Wait((params) => {
                    return !!this._map.getSource(name + params.index);
                }, null, 100, false, { index }).then((params) => {
                    this._createLayers(name + params.index, layers);
                });
                index++;
            }
        });

        this._administrativeDataShown = true;

    }

    HideAdministrativeLayers() {
        Object.forEach(this._administrativeDataJson, (name, arr) => {
            let index = 1;
            for (const geodata of arr ?? []) {
                this._removeLayers(name + index);
                index++;
            }
        });

        this._administrativeDataShown = false;
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
     * @type {Array<{name, title, url}>}
     */
    set tiles(value) {
        value = this._convertProperty('Array', value);
        this._tiles = value;
        this._showTiles();
    }
    _showTiles() {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            this._tiles.forEach(tile => {
                this.AddTiles(tile);
            });
            this.SwitchToLayer(Object.keys(this._layers)[0]);
        });
    }

    AddTiles(tile) {

        if (typeof tile.url === 'string' && tile.url.indexOf('style.json') !== -1) {
            Colibri.IO.Request.Get(tile.url, {}, {}, false).then(response => {
                const style = JSON.parse(response.result);
                if (style.glyphs) {
                    const oldstyle = this._map.getStyle();
                    this._map.setStyle({ ...oldstyle, glyphs: style.glyphs });
                }
                tile.style = style;
                this._layers[tile.name] = tile;
                for (const [sourceId, sourceDef] of Object.entries(style.sources)) {
                    this._disableChangeEvent = true;
                    this._map.addSource(sourceId, sourceDef);
                    this._disableChangeEvent = false;
                }
                this._layersSwitch.AddLayer(tile);
            });

        } else {
            this._layers[tile.name] = tile;
            this._disableChangeEvent = true;
            this._map.addSource(tile.name, {
                type: tile?.type ?? 'raster',
                tiles: [tile.url],
                tileSize: tile?.size ?? 256,
                minzoom: tile?.minzoom ?? 0,
                maxzoom: tile?.maxzoom ?? 22
            });
            this._disableChangeEvent = false;
            this._layersSwitch.AddLayer(tile);
        }

    }

    SwitchToLayer(name) {
        if (this._layers[name]) {

            if (this._currentLayer) {
                (!Array.isArray(this._currentLayer) ? [this._currentLayer] : this._currentLayer).forEach(v => {
                    this._map.removeLayer(v);
                });
            }

            if (this._layers[name]?.style) {
                const layers = [];
                const style = this._layers[name]?.style;
                for (const layer of style.layers) {
                    this._map.addLayer({ ...layer, id: `${name}-${layer.id}` });
                    this._moveBack(`${name}-${layer.id}`);
                    layers.push(`${name}-${layer.id}`);
                }
                this._currentLayer = layers;
                this.Dispatch('LayerSwitched', { name: name, layer: this._layers[name] });

            } else {
                this._map.addLayer({
                    id: name,
                    type: 'raster',
                    source: name
                });
                this._currentLayer = name;
                this._moveBack(name);
                this.Dispatch('LayerSwitched', { name: name, layer: this._layers[name] });
            }

            if (this._administrativeDataShown) {
                this.ShowAdministrativeLayers();
            }


        }
    }

    CreateSources(sources) {
        Object.map(sources, (name, type) => {
            if (type === 'line') {
                this._createLineSource(name);
            } else if (type === 'circle') {
                this._createPointSource(name);
            } else if (type === 'symbol') {
                this._createObjectSource(name);
            }
        });
    }

    _createLineSource(name) {
        if (!this.loaded) {
            return;
        }
        if (!this._linesSources[name]) {
            this._map.addSource(name + '-source', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [],
                    lineMetrics: true,
                    wrap: false
                }
            });
            this._map.addLayer({
                id: name,
                type: 'line',
                source: name + '-source',
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                paint: {
                    'line-color': ['get', 'color'],
                    'line-width': ['get', 'weight'],
                    'line-opacity': ['get', 'opacity'],
                }
            });
            this._layersZIndex.push(name);
            this._linesSources[name] = this._map.getSource(name + '-source');
        }
        return this._linesSources[name];
    }

    _createPointSource(name) {
        if (!this.loaded) {
            return;
        }
        if (!this._pointsSources[name]) {
            this._map.addSource(name + '-source', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            this._map.addLayer({
                id: name,
                type: 'circle',
                source: name + '-source',
                layout: {},
                paint: {
                    'circle-radius': ['get', 'radius'],
                    'circle-color': ['get', 'color'],
                    'circle-opacity': ['get', 'opacity']
                }
            });

            this._layersZIndex.push(name);
            this._pointsSources[name] = this._map.getSource(name + '-source');
        }

        return this._pointsSources[name];
    }

    _createObjectSource(name) {
        if (!this.loaded) {
            return;
        }
        if (!this._objectsSources[name]) {
            this._map.addSource(name + '-source', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            this._map.addLayer({
                id: name,
                type: 'symbol',
                source: name + '-source',
                layout: {
                    'icon-image': ['get', 'type'],
                    'icon-rotate': ['get', 'angle'],
                    'icon-allow-overlap': true,
                    'icon-rotation-alignment': 'map',
                    'icon-anchor': 'center',
                }
            });

            this._layersZIndex.push(name);
            this._objectsSources[name] = this._map.getSource(name + '-source');
        }
        return this._objectsSources[name];
    }

    _sourceAddObject(name, objectJson) {
        const source = this._createObjectSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        data.features.push(objectJson);
        source.setData(data);
    }

    _sourceAddOrUpdateObjects(name, objectsJson, updateIfExists = true) {
        const source = this._createObjectSource(name);
        if (!source) {
            return;
        }

        const data = source._data.geojson;
        for (const objectJson of objectsJson) {
            if (updateIfExists) {
                const idx = data.features.findIndex(f => f.id === objectJson.id);
                if (idx === -1) {
                    data.features.push(objectJson)
                } else {
                    data.features.splice(idx, 1, objectJson);
                }
            } else {
                data.features.push(objectJson)
            }
        }
        source.setData(data);
    }

    _sourceRemoveObject(name, objectId) {
        const source = this._createObjectSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        data.features = data.features.filter(f => f.id !== objectId);
        source.setData(data);
    }

    _sourceRemoveObjects(name, objectIds) {
        const source = this._createObjectSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        data.features = data.features.filter(f => objectIds.indexOf(f.id) !== -1);
        source.setData(data);
    }

    _sourceUpdateObject(name, objectId, objectJson) {
        const source = this._createObjectSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        const idx = data.features.findIndex(f => f.id === objectId);
        if (idx === -1) return;
        data.features.splice(idx, 1, objectJson);
        source.setData(data);
    }

    _sourceAddLine(name, objectJson) {
        const source = this._createLineSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        data.features.push(objectJson);
        source.setData(data);
    }

    _sourceAddOrUpdateLines(name, objectsJson, updateIfExists = true) {
        const source = this._createLineSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        for (const objectJson of objectsJson) {
            if (updateIfExists) {
                const idx = data.features.findIndex(f => f.id === objectJson.id);
                if (idx === -1) {
                    data.features.push(objectJson)
                } else {
                    data.features.splice(idx, 1, objectJson);
                }
            } else {
                data.features.push(objectJson)
            }
        }
        source.setData(data);
    }

    _sourceRemoveLine(name, objectId) {
        const source = this._createLineSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        data.features = data.features.filter(f => f.id !== objectId);
        source.setData(data);
    }

    _sourceRemoveLines(name, objectIds) {
        const source = this._createLineSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        data.features = data.features.filter(f => objectIds.indexOf(f.id) !== -1);
        source.setData(data);
    }

    _sourceUpdateLine(name, objectId, objectJson) {
        const source = this._createLineSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        const idx = data.features.findIndex(f => f.id === objectId);
        if (idx === -1) return;
        data.features.splice(idx, 1, objectJson);
        source.setData(data);
    }

    _sourceAddPoint(name, objectJson) {
        const source = this._createPointSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        data.features.push(objectJson);
        source.setData(data);
    }

    _sourceAddOrUpdatePoints(name, objectsJson, updateIfExists = true) {
        const source = this._createPointSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        for (const objectJson of objectsJson) {
            if (updateIfExists) {
                let idx = data.features.findIndex(f => f.id === objectJson.id);
                if (idx === -1) {
                    data.features.push(objectJson);
                } else {
                    data.features.splice(idx, 1, objectJson);
                }
            } else {
                data.features.push(objectJson);
            }
        }
        source.setData(data);
    }

    _sourceRemovePoint(name, objectId) {
        const source = this._createPointSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        data.features = data.features.filter(f => f.id !== objectId);
        source.setData(data);
    }

    _sourceRemovePoints(name, objectIds) {
        const source = this._createPointSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        data.features = data.features.filter(f => objectIds.indexOf(f.id) !== -1);
        source.setData(data);
    }

    _sourceUpdatePoint(name, objectId, objectJson) {
        const source = this._createPointSource(name);
        if (!source) {
            return;
        }
        const data = source._data.geojson;
        const idx = data.features.findIndex(f => f.id === objectId);
        if (idx === -1) return;
        data.features.splice(idx, 1, objectJson);
        source.setData(data);
    }

    ClearLineSource(sourceName) {
        if (this._linesSources[sourceName]) {
            const source = this._linesSources[sourceName];
            const data = source._data.geojson;
            data.features = [];
            source.setData(data);
        }
    }

    ClearPointsSource(sourceName) {
        if (this._pointsSources[sourceName]) {
            const source = this._pointsSources[sourceName];
            const data = source._data.geojson;
            data.features = [];
            source.setData(data);

        }
    }

    ClearObjectsSource(sourceName) {
        if (this._objectsSources[sourceName]) {
            const source = this._objectsSources[sourceName];
            const data = source._data.geojson;
            data.features = [];
            source.setData(data);
        }
    }


    MarkerPosition(id, name) {
        const source = this._createObjectSource(name);
        if (!source) return null;

        const data = source._data.geojson; // GeoJSON FeatureCollection
        if (!data || !data.features) return null;

        const feature = data.features.find(f => f.id === id);
        if (!feature) return null;

        const [lng, lat] = feature.geometry.coordinates;
        return { lat, lng };
    }

    AddMarker(source, name, latLngLike, icon = null, opacity = 1, azimuth = 0) {
        const geoData = {
            type: 'Feature',
            id: name,
            geometry: { type: 'Point', coordinates: [latLngLike.lng, latLngLike.lat] },
            properties: { id: name, angle: azimuth, type: icon }
        };
        if (this._objectExists(source, name)) {
            this._sourceUpdateObject(source, name, geoData);
        } else {
            this._sourceAddObject(source, geoData);
        }
    }

    AddMarkers(source, latLngsLike, icon = null, updateIfExists = true) {
        this._sourceAddOrUpdateObjects(source, latLngsLike.map(latLngLike => {
            if (latLngLike.type === 'Feature') {
                return latLngLike;
            } else {
                return {
                    type: 'Feature',
                    id: latLngLike.id,
                    geometry: { type: 'Point', coordinates: [latLngLike.lng, latLngLike.lat] },
                    properties: { id: latLngLike.id, angle: latLngLike.azimuth, type: latLngLike.type ?? icon }
                };
            }
        }), updateIfExists);
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
        if (!object) return;
        this._map.getLayer(name).togglePopup();
    }

    AddPolyline(source, name, latLngArray, color = 'red', weight = 1) {
        const geoData = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: latLngArray.map(ll => [ll?.lng || ll[1], ll?.lat || ll[0]])
            },
            properties: {
                id: name,
                'line-color': color,
                'line-width': weight
            }
        };

        if (this._lineExists(source, name)) {
            this._sourceUpdateLine(source, name, geoData);
        } else {
            this._sourceAddLine(source, geoData);
        }
    }

    AddCircle(source, name, latLngLike, radius, color = 'red') {

        const geoData = {
            type: 'Feature',
            id: name,
            geometry: {
                type: 'Point',
                coordinates: [latLngLike.lng, latLngLike.lat]
            },
            properties: {
                id: name,
                'radius': latLngLike.radius ?? radius,
                'color': latLngLike.color ?? color,
                'opacity': 1
            }
        };

        if (this._pointExists(source, name)) {
            this._sourceUpdatePoint(source, name, geoData);
        } else {
            this._sourceAddPoint(source, geoData);
        }
    }

    UpdateCirclesColor(source, color, condition = null) {
        const sourceObj = this._createPointSource(source);
        if (!sourceObj) {
            return;
        }
        const data = sourceObj._data.geojson;
        data.features = data.features.map(feature => {
            if (!condition || condition(feature)) {
                feature.properties.color = color;
            }
            return feature;
        });
        sourceObj.setData(data);
    }

    AddCircles(source, latLngsLike, radius, color = 'red', updateIfExists = true) {

        this._sourceAddOrUpdatePoints(source, latLngsLike.map(latLngLike => {
            if (latLngLike.type === 'Feature') {
                return latLngLike;
            }
            return {
                type: 'Feature',
                id: latLngLike.id,
                geometry: {
                    type: 'Point',
                    coordinates: [latLngLike.lng, latLngLike.lat]
                },
                properties: {
                    id: latLngLike.id,
                    'radius': latLngLike.radius ?? radius,
                    'color': latLngLike.color ?? color,
                    'opacity': 1
                }
            };
        }), updateIfExists);
    }

    UpdateLinesColor(source, color, condition = null) {
        const sourceObj = this._createLineSource(source);
        if (!sourceObj) {
            return;
        }
        const data = sourceObj._data.geojson;
        data.features = data.features.map(feature => {
            if (!condition || condition(feature)) {
                feature.properties.color = color;
            }
            return feature;
        });
        sourceObj.setData(data);
    }

    AddLinesFromGeo(source, geolineObjects, color = 'red', weight = 1, updateIfExists = true) {
        this._sourceAddOrUpdateLines(source, geolineObjects.map(v => {
            if (v.type === 'Feature') {
                return v;
            } else {
                return {
                    type: 'Feature',
                    id: v.id,
                    geometry: v,
                    properties: {
                        id: v.id,
                        'color': v?.color ?? color,
                        'weight': v?.weight ?? weight
                    }
                };
            }
        }), updateIfExists);
    }

    AddLineFromGeo(source, name, geolineObject, color = 'red', weight = 1) {
        const geoData = {
            type: 'Feature',
            id: name,
            geometry: geolineObject,
            properties: {
                id: name,
                'color': color,
                'weight': weight
            }
        };

        if (this._lineExists(source, name)) {
            this._sourceUpdateLine(source, name, geoData);
        } else {
            this._sourceAddLine(source, geoData);
        }
    }


    _getIcons() {
        const ret = [];
        const icons = Object.keys(this._icons);
        for (const i of icons) {
            ret.push(i);
            ret.push(i);
        }
        return ret;
    }

    AddIcon(iconName, iconContent, width, height) {
        this._icons[iconName] = { content: iconContent, width, height };
    }

    AddDivIcon(iconName, className, width, height) {
        this._icons[iconName] = `<div class="${className}" style="width:${width}px;height:${height}px"></div>`;
    }

    DeleteByName(name) {
        this._sourceRemoveObject(name);
        this._sourceRemoveLine(name);
        this._sourceRemovePoint(name);
    }

    DeleteLinesLike(sourceName, like) {
        let source = this._createLineSource(sourceName);
        let data = source._data.geojson;
        data.features = data.features.filter(feature => feature.id.indexOf(like) === -1);
        source.setData(data);
    }
    DeleteLinesAllExcept(sourceName, except) {
        let source = this._createLineSource(sourceName);
        let data = source._data.geojson;
        data.features = data.features.filter(feature => except.indexOf(feature.id) !== -1);
        source.setData(data);
    }
    DeletePointsLike(sourceName, like) {
        let source = this._createPointSource(sourceName);
        let data = source._data.geojson;
        data.features = data.features.filter(feature => feature.id.indexOf(like) === -1);
        source.setData(data);
    }
    DeletePointsAllExcept(sourceName, except) {
        let source = this._createPointSource(sourceName);
        let data = source._data.geojson;
        data.features = data.features.filter(feature => except.indexOf(feature.id) !== -1);
        source.setData(data);
    }
    DeleteObjectsLike(sourceName, like) {
        let source = this._createObjectSource(sourceName);
        let data = source._data.geojson;
        data.features = data.features.filter(feature => feature.id.indexOf(like) === -1);
        source.setData(data);
    }
    DeleteObjectsAllExcept(sourceName, except) {
        let source = this._createObjectSource(sourceName);
        let data = source._data.geojson;
        data.features = data.features.filter(feature => except.indexOf(feature.id) !== -1);
        source.setData(data);
    }

    _objectExists(sourceName, name) {
        const source = this._createObjectSource(sourceName);
        const data = source._data.geojson;
        const idx = data.features.findIndex(f => f.id === name);
        return idx !== -1;
    }
    _lineExists(sourceName, name) {
        const source = this._createLineSource(sourceName);
        const data = source._data.geojson;
        const idx = data.features.findIndex(f => f.id === name);
        return idx !== -1;
    }
    _pointExists(sourceName, name) {
        const source = this._createPointSource(sourceName);
        const data = source._data.geojson;
        const idx = data.features.findIndex(f => f.id === name);
        return idx !== -1;
    }

    Feature(sourceName, name) {
        if (this._objectsSources[sourceName]) {
            return this.Object(sourceName, name);
        } else if (this._linesSources[sourceName]) {
            return this.Line(sourceName, name);
        } else if (this._pointsSources[sourceName]) {
            return this.Point(sourceName, name);
        }
    }

    Object(sourceName, name) {
        const source = this._createObjectSource(sourceName);
        const data = source._data.geojson;
        const found = data.features.filter(v => v.id === name);
        if (found.length === 0) {
            return null;
        }
        return found[0];
    }
    UpdateObject(sourceName, name, geoData) {
        this._sourceUpdateObject(sourceName, name, geoData);
    }
    Line(sourceName, name) {
        const source = this._createLineSource(sourceName);
        const data = source._data.geojson;
        const found = data.features.filter(v => v.id === name);
        if (found.length === 0) {
            return null;
        }
        return found[0];
    }
    UpdateLine(sourceName, name, geoData) {
        this._sourceUpdateLine(sourceName, name, geoData);
    }
    Point(sourceName, name) {
        const source = this._createPointSource(sourceName);
        const data = source._data.geojson;
        const found = data.features.filter(v => v.id === name);
        if (found.length === 0) {
            return null;
        }
        return found[0];
    }
    UpdatePoint(sourceName, name, geoData) {
        this._sourceUpdatePoint(sourceName, name, geoData);
    }

    EnableContextMenu(contextmenuFn, tolerance = 10) {
        this._contextMenuHandler = this._contextMenuHandler || ((e) => {

            this._map.addSource('contextmenupoints', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });
            this._map.addLayer({
                id: 'contextmenu-layer',
                type: 'circle',
                source: 'contextmenupoints',
                paint: {
                    'circle-radius': ['get', 'radius'],
                    'circle-color': ['get', 'color'],
                    'circle-opacity': ['get', 'opacity']
                }
            });

            const rect = this._map.getContainer().getBoundingClientRect();
            const point = [e.clientX - rect.left, e.clientY - rect.top];
            const rectTol = [
                [point[0] - tolerance, point[0] - tolerance],
                [point[1] + tolerance, point[1] + tolerance]
            ];
            const latLng = this._map.unproject(point);
            const features = this._map.queryRenderedFeatures(rectTol);

            this.AddCircle('contextmenupoints', 'contextmenu-point', latLng, 4, '#c0c0c0');

            this.contextmenu = contextmenuFn(features, latLng) || [];
            this.ShowContextMenu([Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT], '', { left: e.clientX, top: e.clientY }, true);
        });
        this.AddHandler('ContextMenuItemClicked', (event, args) => {
            this._sourceRemovePoint('contextmenupoints', 'contextmenu-point');
            this._map.removeLayer('contextmenu-layer');
            this._map.removeSource('contextmenupoints');
            this.Dispatch('MapContextMenuItemClicked', { name: args?.menuData?.name, point: args?.menuData?.point, data: args?.menuData?.data });

        });
        this._map.getContainer().addEventListener('contextmenu', this._contextMenuHandler);
    }

    DisableContextMenu() {
        this._map.getContainer().removeEventListener('contextmenu', this._contextMenuHandler);

        this._map.removeLayer('contextmenu-layer');
        this._map.removeSource('contextmenupoints');
    }

    EnableHover(callback, tolerance = 10) {
        this._infoDiv = document.createElement('div');
        this._infoDiv.style.position = 'absolute';
        this._infoDiv.style.bottom = '10px';
        this._infoDiv.style.right = '10px';
        this._infoDiv.style.padding = '6px 10px';
        this._infoDiv.style.background = 'rgba(0,0,0,0.6)';
        this._infoDiv.style.color = '#fff';
        this._infoDiv.style.fontFamily = 'monospace';
        this._infoDiv.style.borderRadius = '4px';
        this._infoDiv.style.pointerEvents = 'none';
        this._infoDiv.style.maxHeight = '80%';
        this._infoDiv.style.overflowY = 'hidden';
        this._infoDiv.textContent = '';
        this._map.getContainer().appendChild(this._infoDiv);

        this._mousemoveHoverHandler = e => {
            const lat = e.lngLat.lat.toFixed(6);
            const lng = e.lngLat.lng.toFixed(6);
            const zoom = this._map.getZoom().toFixed(2);
            const rect = [
                [e.point.x - tolerance, e.point.y - tolerance],
                [e.point.x + tolerance, e.point.y + tolerance]
            ];
            // Получаем все объекты под курсором
            const features = this._map.queryRenderedFeatures(rect);
            let info = `Lat: ${lat}, Lng: ${lng}, Zoom: ${zoom}`;
            if (features.length) {
                // Если есть, выводим ID первого объекта
                const id = features[0]?.properties?.id ?? null;
                info = info + (id ? `, ID: ${id}` : '');
            }
            if (callback) {
                info = callback(features, info, e);
            }

            this._infoDiv.html(info);
        };

        this._map.on('mousemove', this._mousemoveHoverHandler);
    }

    DisableHover() {
        if (this._mousemoveHoverHandler) {
            this._map.off('mousemove', this._mousemoveHoverHandler);
            this._mousemoveHoverHandler = null;
        }
        if (this._infoDiv) {
            this._infoDiv.remove();
            this._infoDiv = null;
        }
    }


    EnableDebugger() {
        this._coordsDiv = document.createElement('div');
        this._coordsDiv.style.position = 'absolute';
        this._coordsDiv.style.bottom = '10px';
        this._coordsDiv.style.right = '10px';
        this._coordsDiv.style.padding = '6px 10px';
        this._coordsDiv.style.background = 'rgba(0,0,0,0.6)';
        this._coordsDiv.style.color = '#fff';
        this._coordsDiv.style.fontFamily = 'monospace';
        this._coordsDiv.style.borderRadius = '4px';
        this._coordsDiv.textContent = 'Move mouse...';
        this._map.getContainer().appendChild(this._coordsDiv);
        this._map.getContainer().style.cursor = 'crosshair';

        this._mousemoveHandler = e => {
            const lat = e.lngLat.lat.toFixed(6);
            const lng = e.lngLat.lng.toFixed(6);

            // Получаем все объекты под курсором
            const features = this._map.queryRenderedFeatures(e.point);
            let info = `Lat: ${lat}, Lng: ${lng}`;
            if (features.length) {
                // Если есть, выводим ID первого объекта
                const id = features[0]?.properties?.id ?? 'no-id';
                info += `, ID: ${id}`;
            }

            this._coordsDiv.textContent = info;
        };

        this._clickHandler = e => {
            const features = this._map.queryRenderedFeatures(e.point);
            if (features.length) {
                const id = features[0].properties?.id;
                if (id != null) {
                    navigator.clipboard.writeText(id.toString())
                        .then(() => console.log(`Copied ID: ${id}`))
                        .catch(err => console.error('Copy failed', err));
                }
            }
        };

        this._map.on('mousemove', this._mousemoveHandler);
        this._map.on('click', this._clickHandler);
    }

    DisableDebugger() {
        if (this._mousemoveHandler) {
            this._map.off('mousemove', this._mousemoveHandler);
            this._mousemoveHandler = null;
        }
        if (this._clickHandler) {
            this._map.off('click', this._clickHandler);
            this._clickHandler = null;
        }
        if (this._coordsDiv) {
            this._coordsDiv.remove();
            this._coordsDiv = null;
        }
        this._map.getContainer().style.cursor = '';
    }

    EnableBoxSelection() {

        let start, current, box;

        this._map.getCanvas().style.cursor = 'crosshair';

        function beginSelection(x, y) {
            start = [x, y];
            box = document.createElement('div');
            box.className = 'selection-box';
            box.style.position = 'absolute';
            box.style.border = '2px dashed #1976d2';
            box.style.background = 'rgba(25,118,210,0.1)';
            box.style.pointerEvents = 'none';
            document.body.appendChild(box);
        }

        function updateSelection(x, y) {
            current = [x, y];
            const minX = Math.min(start[0], current[0]);
            const maxX = Math.max(start[0], current[0]);
            const minY = Math.min(start[1], current[1]);
            const maxY = Math.max(start[1], current[1]);
            box.style.left = minX + 'px';
            box.style.top = minY + 'px';
            box.style.width = (maxX - minX) + 'px';
            box.style.height = (maxY - minY) + 'px';
        }

        const finishSelection = (x, y) => {
            if (!box) {
                this._selectedIds = [];
                this.Dispatch('SelectionChanged', { ids: [] });
                return;
            }
            box.remove();
            box = null;
            const rect = [
                [Math.min(start[0], x), Math.min(start[1], y)],
                [Math.max(start[0], x), Math.max(start[1], y)]
            ];
            const features = this._map.queryRenderedFeatures(rect, { layers: [...Object.keys(this._linesSources), ...Object.keys(this._pointsSources), ...Object.keys(this._objectsSources)] });
            features.forEach(f => {
                if (!this._selectedIds[f.source.replaceAll('-source', '')]) {
                    this._selectedIds[f.source.replaceAll('-source', '')] = [];
                }
                this._selectedIds[f.source.replaceAll('-source', '')].push(f.properties.id);
            });
            this.Dispatch('SelectionChanged', { ids: this._selectedIds });
        }

        this._mousedownHandler = this._mousedownHandler || ((e) => {
            // if (!e.shiftKey) return true;

            this._selectedIds = {};
            this.Dispatch('SelectionChanged', { ids: [] });

            e.preventDefault();
            e.stopPropagation();

            beginSelection(e.clientX, e.clientY);

            function move(ev) { updateSelection(ev.clientX, ev.clientY); }
            function up(ev) {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                finishSelection(ev.clientX, ev.clientY);
            }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            return false;
        });

        this._touchHandler = this._touchHandler || ((e) => {
            if (e.touches.length !== 1) return true;
            const t = e.touches[0];
            beginSelection(t.clientX, t.clientY);

            function move(ev) {
                if (ev.touches.length !== 1) return;
                const t2 = ev.touches[0];
                updateSelection(t2.clientX, t2.clientY);
            }
            function end(ev) {
                document.removeEventListener('touchmove', move);
                document.removeEventListener('touchend', end);
                const t2 = (ev.changedTouches && ev.changedTouches[0]) || t;
                finishSelection(t2.clientX, t2.clientY);
            }
            document.addEventListener('touchmove', move);
            document.addEventListener('touchend', end);
            return false;
        });

        this._map.getCanvas().addEventListener('mousedown', this._mousedownHandler);
        this._map.getCanvas().addEventListener('touchstart', this._touchHandler);
    }

    DisableBoxSelection() {
        try {
            this._map.getCanvas().style.cursor = null;
            this._map.getCanvas().removeEventListener('mousedown', this._mousedownHandler);
            this._map.getCanvas().removeEventListener('touchstart', this._touchHandler);
        } catch (e) {

        }
    }

    EnableSingleSelection(tolerance = 10) {
        this._map.getCanvas().style.cursor = 'default';
        this._mapClicked = this._mapClicked || ((e) => {
            const rect = [
                [e.point.x - tolerance, e.point.y - tolerance],
                [e.point.x + tolerance, e.point.y + tolerance]
            ];
            const features = this._map.queryRenderedFeatures(rect, { layers: [...Object.keys(this._linesSources), ...Object.keys(this._pointsSources), ...Object.keys(this._objectsSources)] });
            const ids = features.map(f => f.properties.id);
            if (!e.originalEvent.shiftKey) {
                this._selectedIds = {};
            }
            features.forEach(f => {
                if (!this._selectedIds[f.source.replaceAll('-source', '')]) {
                    this._selectedIds[f.source.replaceAll('-source', '')] = [];
                }
                this._selectedIds[f.source.replaceAll('-source', '')].push(f.properties.id);
            });
            this.Dispatch('SelectionChanged', { ids: this._selectedIds });
        });
        this._map.on('click', this._mapClicked);
    }

    DisableSingleSelection() {
        try {
            this._map.off('click', this._mapClicked);
            this._map.getCanvas().style.cursor = "";
        } catch (e) {

        }
    }

    EnableClickToMark(icon) {
        this._mapClickToMarkClicked = this._mapClickToMarkClicked || (async (e) => {
            const args = { point: { lat: e.lngLat.lat, lng: e.lngLat.lng } };
            await this.Dispatch('MarkAdded', args);
            // if(await this.Dispatch('MarkAdded', args)) {
            //     this.AddMarker('markers', 'marker-' + Date.Mc(), e.lngLat, icon);
            // }  
        });
        this._map.getCanvas().style.cursor = 'crosshair';
        this._map.on('click', this._mapClickToMarkClicked);
    }

    DisableClickToMark() {
        try {
            // this.DeleteObjectsLike('markers', 'marker-');
            this._map.getCanvas().style.cursor = null;
            this._map.off('click', this._mapClickToMarkClicked);
        } catch (e) {

        }
    }

    EnableMeasure() {
        let drawing = false;
        let lineCoordinates = [];
        let tempLineSourceId = 'measure-line';
        this._measurePopup = null;
        const turf = new Colibri.UI.Maps.Turf();
        this._map.getCanvas().style.cursor = 'crosshair';
        const beginDrawing = (x, y) => {
            drawing = true;
            lineCoordinates = [this._map.unproject([x, y]).toArray()]; // координаты lng/lat
            this._map.dragPan.disable();
            if (!this._measurePopup) {
                this._measurePopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })
                    .setLngLat(this._map.unproject([x, y]))
                    .setHTML('0 км')
                    .addTo(this._map);
            }
        };

        const updateDrawing = (x, y) => {
            if (!drawing) return;

            const lngLat = this._map.unproject([x, y]).toArray();
            const coords = [...lineCoordinates, lngLat];
            const lineCoords = turf.greatCircle([coords[0][0], coords[0][1]], [coords[1][0], coords[1][1]], { npoints: 100 });

            // обновляем линию на карте
            if (!this._map.getSource(tempLineSourceId)) {
                this._map.addSource(tempLineSourceId, {
                    type: 'geojson',
                    data: lineCoords
                });
                this._map.addLayer({
                    id: tempLineSourceId + '-layer',
                    type: 'line',
                    source: tempLineSourceId,
                    paint: { 'line-color': '#1976d2', 'line-width': 3 }
                });
            } else {
                this._map.getSource(tempLineSourceId).setData(lineCoords);
            }

            // считаем длину только если больше одной точки
            let length = 0;
            if (coords.length > 1) {
                const line = turf.lineString(coords);
                length = turf.length(line, { units: 'kilometers' });
            }

            // обновляем popup
            this._measurePopup.setLngLat(this._map.unproject([x, y]))
                .setHTML(length.toFixed(3) + ' км');
        };

        const finishDrawing = (x, y) => {
            if (!drawing) return;
            drawing = false;
            const lngLat = this._map.unproject([x, y]).toArray();
            lineCoordinates.push(lngLat);

            // считаем длину через Turf.js
            const line = turf.lineString(lineCoordinates);
            const length = turf.length(line, { units: 'kilometers' });

            console.log('Длина линии:', length, 'км');

            this._map.dragPan.enable();

            // оставляем линию на карте, больше ничего не рисуем
        };

        this._mousedownHandler2 = this._mousedownHandler2 || ((e) => {
            e.preventDefault();
            beginDrawing(e.clientX - this._element.bounds().left, e.clientY - this._element.bounds().top);

            const move = (ev) => updateDrawing(ev.clientX - this._element.bounds().left, ev.clientY - this._element.bounds().top);
            const up = (ev) => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                finishDrawing(ev.clientX - this._element.bounds().left, ev.clientY - this._element.bounds().top);
            };

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            return false;
        });

        this._touchHandler2 = this._touchHandler2 || ((e) => {
            if (e.touches.length !== 1) return true;
            const t = e.touches[0];
            beginDrawing(t.clientX, t.clientY);

            const move = (ev) => {
                if (ev.touches.length !== 1) return;
                const t2 = ev.touches[0];
                updateDrawing(t2.clientX, t2.clientY);
            };
            const end = (ev) => {
                document.removeEventListener('touchmove', move);
                document.removeEventListener('touchend', end);
                const t2 = (ev.changedTouches && ev.changedTouches[0]) || t;
                finishDrawing(t2.clientX, t2.clientY);
            };

            document.addEventListener('touchmove', move);
            document.addEventListener('touchend', end);
            return false;
        });

        this._map.getCanvas().addEventListener('mousedown', this._mousedownHandler2);
        this._map.getCanvas().addEventListener('touchstart', this._touchHandler2);
    }

    DisableMeasure() {
        try {
            this._map.getCanvas().removeEventListener('mousedown', this._mousedownHandler2);
            this._map.getCanvas().removeEventListener('touchstart', this._touchHandler2);

            if (this._measurePopup) {
                this._measurePopup.remove();
                this._measurePopup = null;
            }
            const tempLineSourceId = 'measure-line';
            if (this._map.getLayer(tempLineSourceId + '-layer')) {
                this._map.removeLayer(tempLineSourceId + '-layer');
            }
            if (this._map.getSource(tempLineSourceId)) {
                this._map.removeSource(tempLineSourceId);
            }
            this._map.getCanvas().style.cursor = null;
        } catch (e) {

        }
    }

    EnableAngleMeasure() {
        let drawing = false;
        let points = []; // max 3
        const srcId = 'angle-measure';
        this._anglePopup = null;
        const turf = new Colibri.UI.Maps.Turf();

        this._map.getCanvas().style.cursor = 'crosshair';

        const ensureLayer = (data) => {
            if (!this._map.getSource(srcId)) {
                this._map.addSource(srcId, { type: 'geojson', data });
                this._map.addLayer({
                    id: srcId + '-line',
                    type: 'line',
                    source: srcId,
                    paint: { 'line-color': '#1976d2', 'line-width': 2 }
                });
                this._map.addLayer({
                    id: srcId + '-points',
                    type: 'circle',
                    source: srcId,
                    paint: { 'circle-radius': 2, 'circle-color': '#1976d2' }
                });
            } else {
                this._map.getSource(srcId).setData(data);
            }
        };

        const redraw = (cursorLngLat = null) => {
            const features = [];

            // points
            points.forEach(p => {
                features.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: p }
                });
            });

            // first segment
            if (points.length >= 2) {
                features.push({
                    type: 'Feature',
                    geometry: turf.greatCircle(points[0], points[1], { npoints: 100 }).geometry
                });
            }

            // second segment (dynamic)
            if (points.length === 2 && cursorLngLat) {
                features.push({
                    type: 'Feature',
                    geometry: turf.greatCircle(points[1], cursorLngLat, { npoints: 100 }).geometry
                });
            }

            if (points.length === 3) {
                features.push({
                    type: 'Feature',
                    geometry: turf.greatCircle(points[1], points[2], { npoints: 100 }).geometry
                });
            }

            ensureLayer({
                type: 'FeatureCollection',
                features
            });
        };

        const calcAngle = (p1, p2, p3) => {
            const toRad = d => d * Math.PI / 180;

            const a = [
                toRad(p1[0] - p2[0]),
                toRad(p1[1] - p2[1])
            ];
            const b = [
                toRad(p3[0] - p2[0]),
                toRad(p3[1] - p2[1])
            ];

            const dot = a[0] * b[0] + a[1] * b[1];
            const ma = Math.hypot(a[0], a[1]);
            const mb = Math.hypot(b[0], b[1]);

            const angle = Math.acos(dot / (ma * mb)) * 180 / Math.PI;

            return isNaN(angle) ? 0 : angle;
        };

        const begin = (x, y) => {
            const ll = this._map.unproject([x, y]).toArray();

            if (!drawing) {
                drawing = true;
                points = [];
            }

            points.push(ll);

            if (!this._anglePopup) {
                this._anglePopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })
                    .setLngLat(ll)
                    .setHTML('0°')
                    .addTo(this._map);
            }

            redraw();
            this._map.dragPan.disable();

            if (points.length === 3) {
                const angle = calcAngle(points[0], points[1], points[2]);
                this._anglePopup
                    .setLngLat(points[1])
                    .setHTML(angle.toFixed(2) + '°');

                drawing = false;
                this._map.dragPan.enable();
            }
        };

        const move = (x, y) => {
            if (!drawing || points.length !== 2) return;
            const ll = this._map.unproject([x, y]).toArray();
            redraw(ll);

            const angle = calcAngle(points[0], points[1], ll);
            this._anglePopup
                .setLngLat(points[1])
                .setHTML('<span style="vertical-align: middle;">' + Colibri.UI.AzimuthIcon + '</span> ' + angle.toFixed(2) + '°');
        };

        this._mousedownHandlerAngle = (e) => {
            e.preventDefault();
            begin(e.clientX - this._element.bounds().left, e.clientY - this._element.bounds().top);

            const mm = ev => move(e.clientX - this._element.bounds().left, e.clientY - this._element.bounds().top);
            const up = () => {
                document.removeEventListener('mousemove', mm);
                document.removeEventListener('mouseup', up);
            };

            document.addEventListener('mousemove', mm);
            document.addEventListener('mouseup', up);
            return false;
        };

        this._touchHandlerAngle = (e) => {
            if (e.touches.length !== 1) return true;
            const t = e.touches[0];
            begin(t.clientX - this._element.bounds().left, t.clientY - this._element.bounds().top);

            const mm = ev => {
                if (ev.touches.length !== 1) return;
                const t2 = ev.touches[0];
                move(t2.clientX - this._element.bounds().left, t2.clientY - this._element.bounds().top);
            };
            const end = () => {
                document.removeEventListener('touchmove', mm);
                document.removeEventListener('touchend', end);
            };

            document.addEventListener('touchmove', mm);
            document.addEventListener('touchend', end);
            return false;
        };

        this._map.getCanvas().addEventListener('mousedown', this._mousedownHandlerAngle);
        this._map.getCanvas().addEventListener('touchstart', this._touchHandlerAngle);
    }

    DisableAngleMeasure() {
        try {
            this._map.getCanvas().removeEventListener('mousedown', this._mousedownHandlerAngle);
            this._map.getCanvas().removeEventListener('touchstart', this._touchHandlerAngle);

            if (this._anglePopup) {
                this._anglePopup.remove();
                this._anglePopup = null;
            }

            const srcId = 'angle-measure';
            if (this._map.getLayer(srcId + '-line')) this._map.removeLayer(srcId + '-line');
            if (this._map.getLayer(srcId + '-points')) this._map.removeLayer(srcId + '-points');
            if (this._map.getSource(srcId)) this._map.removeSource(srcId);

            this._map.getCanvas().style.cursor = null;
        } catch (e) { }
    }


    /**
     * Can rotate (Show rotate button)
     * @type {Boolean}
     */
    get rotatable() {
        return this._zoomRotate.shown;
    }
    /**
     * Can rotate (Show rotate button)
     * @type {Boolean}
     */
    set rotatable(value) {
        value = this._convertProperty('Boolean', value);
        this._zoomRotate.shown = value;
    }

}

Colibri.UI.Maps.Intersections = class {

    // Helper: Check orientation of ordered triplet (p, q, r)
    orientation(p, q, r) {
        const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
        if (val === 0) return 0; // colinear
        return val > 0 ? 1 : 2; // clock or counterclock wise
    }

    // Helper: Check if point q lies on segment pr
    onSegment(p, q, r) {
        return (
            q[0] <= Math.max(p[0], r[0]) &&
            q[0] >= Math.min(p[0], r[0]) &&
            q[1] <= Math.max(p[1], r[1]) &&
            q[1] >= Math.min(p[1], r[1])
        );
    }

    // Check if two segments (p1,q1) and (p2,q2) intersect
    doIntersect(p1, q1, p2, q2) {
        const o1 = this.orientation(p1, q1, p2);
        const o2 = this.orientation(p1, q1, q2);
        const o3 = this.orientation(p2, q2, p1);
        const o4 = this.orientation(p2, q2, q1);

        if (o1 !== o2 && o3 !== o4) return true;

        // Special cases
        if (o1 === 0 && this.onSegment(p1, p2, q1)) return true;
        if (o2 === 0 && this.onSegment(p1, q2, q1)) return true;
        if (o3 === 0 && this.onSegment(p2, p1, q2)) return true;
        if (o4 === 0 && this.onSegment(p2, q1, q2)) return true;

        return false;
    }

    // Compute intersection point (if any) using line equations
    getIntersection(p1, q1, p2, q2) {
        const [x1, y1] = p1;
        const [x2, y2] = q1;
        const [x3, y3] = p2;
        const [x4, y4] = q2;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return null; // parallel or colinear

        const px =
            ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const py =
            ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

        return [px, py];
    }

    // Main function: find all intersections between two polylines
    findIntersections(line1, line2) {
        const intersections = [];

        for (let i = 0; i < line1.length - 1; i++) {
            const p1 = line1[i];
            const q1 = line1[i + 1];

            for (let j = 0; j < line2.length - 1; j++) {
                const p2 = line2[j];
                const q2 = line2[j + 1];

                if (this.doIntersect(p1, q1, p2, q2)) {
                    const pt = this.getIntersection(p1, q1, p2, q2);
                    if (pt) intersections.push(pt);
                }
            }
        }

        return intersections;
    }

    static intersections(lines) {
        const inn = new Colibri.UI.Maps.Intersections();
        const intersections = [];
        for (const v1 of lines) {
            for (const v2 of lines) {
                if (v1.id != v2.id) {
                    const ints = inn.findIntersections(v1.coordinates[0], v2.coordinates[0])
                    if (ints.length > 0) {
                        intersections.push(...ints.map(pt => ({ id1: v1.id, id2: v2.id, lat: pt[0], lng: pt[1] })));
                    }
                }
            }
        }
        return intersections;
    }

}

Colibri.UI.Maps.Turf = class {

    lineString(coordinates, properties = {}) {
        return {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates
            },
            properties
        };
    }

    greatCircle(start, end, options = {}) {
        const { npoints = 100, includeEndpoints = true } = options;

        const [lon1, lat1] = start.map(Colibri.UI.Utilities.Vincenty.radians);
        const [lon2, lat2] = end.map(Colibri.UI.Utilities.Vincenty.radians);

        const d = 2 * Math.asin(Math.sqrt(
            Math.sin((lat2 - lat1) / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
        ));

        const coords = [];

        for (let i = 0; i <= npoints; i++) {
            const f = i / npoints;

            const A = Math.sin((1 - f) * d) / Math.sin(d);
            const B = Math.sin(f * d) / Math.sin(d);

            const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
            const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
            const z = A * Math.sin(lat1) + B * Math.sin(lat2);

            const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
            const lon = Math.atan2(y, x);

            if (includeEndpoints || (i > 0 && i < npoints))
                coords.push([Colibri.UI.Utilities.Vincenty.degrees(lon), Colibri.UI.Utilities.Vincenty.degrees(lat)]);
        }

        return this.lineString(coords);
    }

    haversineDistance(a, b) {
        const [lon1, lat1] = a.map(Colibri.UI.Utilities.Vincenty.radians);
        const [lon2, lat2] = b.map(Colibri.UI.Utilities.Vincenty.radians);
        const R = 6371; // km

        const dlat = lat2 - lat1;
        const dlon = lon2 - lon1;

        const h = Math.sin(dlat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;

        return 2 * R * Math.asin(Math.sqrt(h));
    }

    length(feature, options = {}) {
        const unit = options.units || "kilometers";
        const coords = feature.geometry.coordinates;
        let total = 0;

        for (let i = 0; i < coords.length - 1; i++) {
            total += this.haversineDistance(coords[i], coords[i + 1]);
        }

        switch (unit) {
            case "meters": return total * 1000;
            case "miles": return total * 0.621371;
            case "nauticalmiles": return total * 0.539957;
            default: return total; // kilometers
        }
    }

}