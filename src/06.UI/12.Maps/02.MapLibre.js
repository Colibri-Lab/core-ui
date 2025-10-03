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

        this._zoomZoomIn = this.Children('zoom/zoom-in');
        this._zoomZoomOut = this.Children('zoom/zoom-out');
        this._zoomRotate = this.Children('zoom/rotate');
        this._zoomSetCenter = this.Children('zoom/set-center');
        this._layersSwitch = this.Children('layers/switch');
        this._mapContainer = this.Children('map-container');

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
                // center: {lng: 45.29590878451711, lat: 40.06732341520765}, // lng, lat
                // zoom: 24,
                bearing: 0,
                pitch: 0
            });

            this._createLineSource();
            this._createPointSource();
            this._createObjectSource();

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
                this.Dispatch('Changed', {});
            });

            this._map.on('zoomend', (e) => {
                if (this._zoomRotate.rotating) {
                    return;
                }
                this._getProperties();
                this.Dispatch('Changed', {});
            });

            this._map.on('rotatestart', (e) => {
                this._rotating = true;
            });

            this._map.on('rotateend', (e) => {
                if (this._zoomRotate.rotating) {
                    return;
                }
                this._getProperties();

                this.Dispatch('Changed', {});
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

    get filtersButtonGroup() {
        return this.Children('filters').container;
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
        this._center = this._map.getCenter();
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
            this._map.flyTo({ center: center, zoom: zoom });
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
        if (this._layers[name]) {

            if (this._currentLayer) {
                this._map.removeLayer(this._currentLayer);
            }
            this._map.addLayer({
                id: name,
                type: 'raster',
                source: name
            });
            try {
                if (this._map.getLayer('lines')) {
                    this._map.moveLayer(name, 'lines');
                }
                // if(this._map.getLayer('points')) {
                //     this._map.moveLayer(name, 'points');
                // }
                // if(this._map.getLayer('objects')) {
                //     this._map.moveLayer(name, 'objects');
                // }
            } catch (e) { }
            this._currentLayer = name;

        }
    }

    _createLineSource() {
        if (!this._lineSource) {
            this._map.addSource('line-source', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });
            this._map.addLayer({
                id: 'lines',
                type: 'line',
                source: 'line-source',
                layout: {
                    // 'line-cap': 'round',
                    // 'line-join': 'round'
                },
                paint: {
                    'line-color': ['get', 'color'],
                    'line-width': ['get', 'weight'],
                    'line-opacity': ['get', 'opacity'],
                }
            });
            this._lineSource = this._map.getSource('line-source');
        }
        return this._lineSource;
    }

    _createPointSource() {
        if (!this._pointsSource) {
            this._map.addSource('points-source', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            this._map.addLayer({
                id: 'points',
                type: 'circle',
                source: 'points-source',
                layout: {
                    // 'line-cap': 'round',
                    // 'line-join': 'round'
                },
                paint: {
                    'circle-radius': ['get', 'radius'],
                    'circle-color': ['get', 'color'],
                    'circle-opacity': ['get', 'opacity']
                }
            });

            this._pointsSource = this._map.getSource('points-source');
        }

        return this._pointsSource;
    }

    _createObjectSource() {
        if (!this._objectSource) {
            this._map.addSource('object-source', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            this._map.addLayer({
                id: 'objects',
                type: 'symbol',
                source: 'object-source',
                layout: {
                    'icon-image': ['get', 'type'],
                    'icon-rotate': ['get', 'angle'],
                    'icon-allow-overlap': true,
                    'icon-rotation-alignment': 'map',
                    'icon-anchor': 'center',
                }
            });

            this._objectSource = this._map.getSource('object-source');
        }
        return this._objectSource;
    }

    _sourceAddObject(objectJson) {
        const source = this._createObjectSource();
        const data = source._data;
        data.features.push(objectJson);
        source.setData(data);
    }

    _sourceAddOrUpdateObjects(objectsJson) {
        const source = this._createObjectSource();
        const data = source._data;
        for (const objectJson of objectsJson) {
            const idx = data.features.findIndex(f => f.id === objectJson.id);
            if (idx === -1) {
                data.features.push(objectJson)
            } else {
                data.features.splice(idx, 1, objectJson);
            }
        }
        source.setData(data);
    }

    _sourceRemoveObject(objectId) {
        const source = this._createObjectSource();
        const data = source._data;
        data.features = data.features.filter(f => f.id !== objectId);
        source.setData(data);
    }

    _sourceRemoveObjects(objectIds) {
        const source = this._createObjectSource();
        const data = source._data;
        data.features = data.features.filter(f => objectIds.indexOf(f.id) !== -1);
        source.setData(data);
    }

    _sourceUpdateObject(objectId, objectJson) {
        const source = this._createObjectSource();
        const data = source._data;
        const idx = data.features.findIndex(f => f.id === objectId);
        if (idx === -1) return;
        data.features.splice(idx, 1, objectJson);
        source.setData(data);
    }

    _sourceAddLine(objectJson) {
        const source = this._createLineSource();
        const data = source._data;
        data.features.push(objectJson);
        source.setData(data);
    }

    _sourceAddOrUpdateLines(objectsJson) {
        const source = this._createLineSource();
        const data = source._data;
        for (const objectJson of objectsJson) {
            const idx = data.features.findIndex(f => f.id === objectJson.id);
            if (idx === -1) {
                data.features.push(objectJson)
            } else {
                data.features.splice(idx, 1, objectJson);
            }
        }
        source.setData(data);
    }

    _sourceRemoveLine(objectId) {
        const source = this._createLineSource();
        const data = source._data;
        data.features = data.features.filter(f => f.id !== objectId);
        source.setData(data);
    }

    _sourceRemoveLines(objectIds) {
        const source = this._createLineSource();
        const data = source._data;
        data.features = data.features.filter(f => objectIds.indexOf(f.id) !== -1);
        source.setData(data);
    }

    _sourceUpdateLine(objectId, objectJson) {
        const source = this._createLineSource();
        const data = source._data;
        const idx = data.features.findIndex(f => f.id === objectId);
        if (idx === -1) return;
        data.features.splice(idx, 1, objectJson);
        source.setData(data);
    }

    _sourceAddPoint(objectJson) {
        const source = this._createPointSource();
        const data = source._data;
        data.features.push(objectJson);
        source.setData(data);
    }
    _sourceAddOrUpdatePoints(objectsJson) {
        const source = this._createPointSource();
        const data = source._data;
        for (const objectJson of objectsJson) {
            const idx = data.features.findIndex(f => f.id === objectJson.id);
            if (idx === -1) {
                data.features.push(objectJson)
            } else {
                data.features.splice(idx, 1, objectJson);
            }
        }
        source.setData(data);
    }

    _sourceRemovePoint(objectId) {
        const source = this._createPointSource();
        const data = source._data;
        data.features = data.features.filter(f => f.id !== objectId);
        source.setData(data);
    }

    _sourceRemovePoints(objectIds) {
        const source = this._createPointSource();
        const data = source._data;
        data.features = data.features.filter(f => objectIds.indexOf(f.id) !== -1);
        source.setData(data);
    }

    _sourceUpdatePoint(objectId, objectJson) {
        const source = this._createPointSource();
        const data = source._data;
        const idx = data.features.findIndex(f => f.id === objectId);
        if (idx === -1) return;
        data.features.splice(idx, 1, objectJson);
        source.setData(data);
    }


    MarkerPosition(id) {
        const source = this._createObjectSource();
        if (!source) return null;

        const data = source._data; // GeoJSON FeatureCollection
        if (!data || !data.features) return null;

        const feature = data.features.find(f => f.id === id);
        if (!feature) return null;

        const [lng, lat] = feature.geometry.coordinates;
        return { lat, lng };
    }

    AddMarker(name, latLngLike, icon = null, opacity = 1, azimuth = 0) {
        const geoData = {
            type: 'Feature',
            id: name,
            geometry: { type: 'Point', coordinates: [latLngLike.lng, latLngLike.lat] },
            properties: { id: name, angle: azimuth, type: icon }
        };
        if (this.Exists(name)) {
            this._sourceUpdateObject(name, geoData);
        } else {
            this._sourceAddObject(geoData);
        }
    }

    AddMarkers(latLngsLike, icon = null) {
        this._sourceAddOrUpdateObjects(latLngsLike.map(latLngLike => {
            if (latLngLike.type === 'Feature') {
                return latLngLike;
            } else {
                return {
                    type: 'Feature',
                    id: latLngLike.id,
                    geometry: { type: 'Point', coordinates: [latLngLike.lng, latLngLike.lat] },
                    properties: { id: latLngLike.id, angle: latLngLike.azimuth, type: icon }
                };
            }
        }));
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

    AddPolyline(name, latLngArray, color = 'red', weight = 1) {
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

        if (this.Exists(name)) {
            this._sourceUpdateLine(name, geoData);
        } else {
            this._sourceAddLine(geoData);
        }
    }

    AddCircle(name, latLngLike, radius, color = 'red') {

        const geoData = {
            type: 'Feature',
            id: name,
            geometry: {
                type: 'Point',
                coordinates: [latLngLike.lng, latLngLike.lat]
            },
            properties: {
                id: name,
                'radius': radius,
                'color': color,
                'opacity': 1
            }
        };

        if (this.Exists(name)) {
            this._sourceUpdatePoint(name, geoData);
        } else {
            this._sourceAddPoint(geoData);
        }
    }

    AddCircles(latLngsLike, radius, color = 'red') {

        this._sourceAddOrUpdatePoints(latLngsLike.map(latLngLike => {
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
                    'radius': radius,
                    'color': color,
                    'opacity': 1
                }
            };
        }));
    }

    AddLinesFromGeo(geolineObjects, color = 'red', weight = 1) {
        this._sourceAddOrUpdateLines(geolineObjects.map(v => {
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
        }));
    }

    AddLineFromGeo(name, geolineObject, color = 'red', weight = 1) {
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

        if (this.Exists(name)) {
            this._sourceUpdateLine(name, geoData);
        } else {
            this._sourceAddLine(geoData);
        }
    }

    AddGeoLine(name, latLngLike, azimuth, color = 'red', weight = 1) {
        const end = this._destinationPoint2(latLngLike.lng, latLngLike.lat, azimuth);
        if (!end) return {};
        const line = turf.greatCircle([latLngLike.lng, latLngLike.lat], [end.lng, end.lat], { npoints: 100 });
        line.id = name;
        line.properties = {
            'color': color,
            'width': weight
        };
        if (this.Exists(name)) {
            this._sourceUpdateLine(name, line);
        } else {
            this._sourceAddLine(line);
        }

        return {
            start: latLngLike,
            end: end,
            line: line,
            angle: azimuth,
            lastAngle: this._getAngleBetweenLastSegment(line.geometry.coordinates.map(v => ([v[1], v[0]]))),
        };
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

    DeleteByNameLike(nameLike, except = []) {

        let source = this._createObjectSource();
        let data = source._data;
        data.features = data.features.filter(feature => feature.id.indexOf(nameLike) === -1 || except.indexOf(feature.id) !== -1)
        source.setData(data);

        source = this._createLineSource();
        data = source._data;
        data.features = data.features.filter(feature => feature.id.indexOf(nameLike) === -1 || except.indexOf(feature.id) !== -1)
        source.setData(data);

        source = this._createPointSource();
        data = source._data;
        data.features = data.features.filter(feature => feature.id.indexOf(nameLike) === -1 || except.indexOf(feature.id) !== -1)
        source.setData(data);

    }

    _objectExists(name) {
        const source = this._createObjectSource();
        const data = source._data;
        const idx = data.features.findIndex(f => f.id === name);
        return idx !== -1;
    }
    _lineExists(name) {
        const source = this._createLineSource();
        const data = source._data;
        const idx = data.features.findIndex(f => f.id === name);
        return idx !== -1;
    }
    _pointExists(name) {
        const source = this._createPointSource();
        const data = source._data;
        const idx = data.features.findIndex(f => f.id === name);
        return idx !== -1;
    }

    Exists(name) {
        return this._objectExists(name) || this._lineExists(name) || this._pointExists(name);
    }

    Object(name) {
        const source = this._createObjectSource();
        const data = source._data;
        const found = data.features.filter(v => v.id === name);
        if (found.length === 0) {
            return null;
        }
        return found[0];
    }
    UpdateObject(name, geoData) {
        this._sourceUpdateObject(name, geoData);
    }
    Line(name) {
        const source = this._createLineSource();
        const data = source._data;
        const found = data.features.filter(v => v.id === name);
        if (found.length === 0) {
            return null;
        }
        return found[0];
    }
    UpdateLine(name, geoData) {
        this._sourceUpdateLine(name, geoData);
    }
    Point(name) {
        const source = this._createPointSource();
        const data = source._data;
        const found = data.features.filter(v => v.id === name);
        if (found.length === 0) {
            return null;
        }
        return found[0];
    }
    UpdatePoint(name, geoData) {
        this._sourceUpdatePoint(name, geoData);
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

    EnableBoxSelection() {

        let start, current, box;

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
            const features = this._map.queryRenderedFeatures(rect, { layers: ['lines', 'points', 'objects'] });
            const ids = features.map(f => f.properties.id);
            this._selectedIds = ids;
            this.Dispatch('SelectionChanged', { ids: this._selectedIds });
        }

        this._mousedownHandler = this._mousedownHandler || ((e) => {
            if (!e.shiftKey) return true;

            this._selectedIds = [];
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
            this._map.getCanvas().removeEventListener('mousedown', this._mousedownHandler);
            this._map.getCanvas().removeEventListener('touchstart', this._touchHandler);
        } catch(e) {

        }
    }

    EnableSingleSelection(tolerance = 10) {
        this._map.getCanvas().style.cursor = 'default';
        this._mapClicked = this._mapClicked || ((e) => {
            const rect = [
                [e.point.x - tolerance, e.point.y - tolerance],
                [e.point.x + tolerance, e.point.y + tolerance]
            ];
            const features = this._map.queryRenderedFeatures(rect, { layers: ['lines', 'points', 'objects'] });
            const ids = features.map(f => f.properties.id);
            this._selectedIds = !e.originalEvent.shiftKey ? ids : this._selectedIds.concat(ids);
            this.Dispatch('SelectionChanged', { ids: this._selectedIds });
        });
        this._mapMouseEnter = this._mapMouseEnter || ((e) => {
            if (e.features.length) {
            }
        });
        this._mapMouseLeave = this._mapMouseLeave || ((e) => {
        });
        this._map.on("mouseenter", "lines", this._mapMouseEnter);
        this._map.on("mouseleave", "lines", this._mapMouseLeave);
        this._map.on("mouseenter", "points", this._mapMouseEnter);
        this._map.on("mouseleave", "points", this._mapMouseLeave);
        this._map.on("mouseenter", "objects", this._mapMouseEnter);
        this._map.on("mouseleave", "objects", this._mapMouseLeave);
        this._map.on('click', this._mapClicked);
    }

    DisableSingleSelection() {
        try {
            this._map.off("mouseenter", "lines", this._mapMouseEnter);
            this._map.off("mouseleave", "lines", this._mapMouseLeave);
            this._map.off("mouseenter", "points", this._mapMouseEnter);
            this._map.off("mouseleave", "points", this._mapMouseLeave);
            this._map.off("mouseenter", "objects", this._mapMouseEnter);
            this._map.off("mouseleave", "objects", this._mapMouseLeave);
            this._map.off('click', this._mapClicked);
            this._map.getCanvas().style.cursor = "";
        } catch(e) {

        }
    }

    EnableClickToMark(icon) {
        this._mapClickToMarkClicked = this._mapClickToMarkClicked || ((e) => {
            let name = 'marker';
            if (e.originalEvent.shiftKey) {
                name = 'marker-' + Date.Mc();
            } else {
                this.DeleteByNameLike('marker-');
            }
            this.AddMarker(name, e.lngLat, icon)
        });
        this._map.on('click', this._mapClickToMarkClicked);
    }

    DisableClickToMark() {
        try {
            this.DeleteByNameLike('marker-');
            this._map.off('click', this._mapClickToMarkClicked);
        } catch(e) {

        }
    }

    EnableMeasure() {
        let drawing = false;
        let lineCoordinates = [];
        let tempLineSourceId = 'measure-line';
        this._measurePopup = null;


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
            beginDrawing(e.clientX, e.clientY);

            const move = (ev) => updateDrawing(ev.clientX, ev.clientY);
            const up = (ev) => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                finishDrawing(ev.clientX, ev.clientY);
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
    
            if(this._measurePopup) {
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
        } catch(e) {
            
        }
    }

    CalcIntersactionPoints(lines) {
        const points = [];
        for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines.length; j++) {
                if (i === j) {
                    continue;
                }
                const ps = turf.lineIntersect({
                    type: 'Feature',
                    geometry: lines[i]
                }, {
                    type: 'Feature',
                    geometry: lines[j]
                });

                for (const p of ps.features) {
                    points.push({
                        id: 'point-' + Date.Mc() + '-' + lines[i].id.split('-')[1] + ':' + lines[j].id.split('-')[1],
                        lng: p.geometry.coordinates[0],
                        lat: p.geometry.coordinates[1],
                    });

                }
            }
        }
        return points;
    }

}
