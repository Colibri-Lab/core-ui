/**
 * Leaflet js map
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI.Maps
 */
Colibri.UI.Maps.LeafletJs = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.LeafletJs']);
        this.AddClass('colibri-ui-maps-leafletjs');

        this._loaded = false;
        this._map = null;
        this._objects = {};
        this._icons = {};

        this._zoomZoomIn = this.Children('zoom/zoom-in');
        this._zoomZoomOut = this.Children('zoom/zoom-out');
        this._zoomRotate = this.Children('zoom/rotate');
        

        this._mapContainer = this.Children('map-container');
        

        this._loadMap();        

        this._zoomZoomIn.AddHandler('Clicked', this.__zoomZoomInClicked, false, this);
        this._zoomZoomOut.AddHandler('Clicked', this.__zoomZoomOutClicked, false, this);
        this._zoomRotate.AddHandler('Rotated', this.__zoomRotateRotated, false, this);  
    }

    __zoomRotateRotated(event, args) {
        this._map.setBearing(args.angle);
    }

    __zoomZoomInClicked(event, args) {
        this._map.zoomIn();
    }

    __zoomZoomOutClicked(event, args) {
        this._map.zoomOut();
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Loaded', false, 'When map is fully loaded');
    }


    _getAngleBetweenLastSegment(coords) {
        const a = coords[coords.length - 2];
        const b = coords[coords.length - 1];

        const dx = b[0] - a[0];
        const dy = b[1] - a[1];

        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return (angle + 360) % 360;
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

    _degToRad(deg) {
        return deg * Math.PI / 180;
    }

    _loadMap() {
        Promise.all([
            Colibri.Common.LoadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'),
            Colibri.Common.LoadStyles('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'),
            Colibri.Common.LoadScript('https://unpkg.com/leaflet-rotate@0.2.8/dist/leaflet-rotate-src.js'),
            Colibri.Common.LoadScript('https://cdn.jsdelivr.net/npm/@turf/turf@7.2.0/turf.min.js'),
        ]).then(() => {
            this._loaded = true;
            this._map = L.map(this._mapContainer.container, {
                rotate: true, 
                zoomControl: false,
                preferCanvas: true,
                doubleClickZoom: true,
                touchRotate: true,
                touchZoom: true
            });
            
            // new L.Control.Zoom({ position: 'topright' })
            //     .addTo(this._map);
            // new L.Control.Rotate({ position: 'topright', closeOnZeroBearing: false })
            //     .addTo(this._map);

            this.Dispatch('Loaded', {});
        });
    }

    /**
     * Initial view and zoom
     * @type {Object|String}
     */
    get center() {
        return this._viewAndZoom;
    }
    /**
     * Initial view and zoom
     * @type {Array|String}
     */
    set center(value) {
        value = this._convertProperty('Array', value);
        this._center = value;
        this._showCenter();
    }
    _showCenter() {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            this.SetCenter(this._center);
        })
    }

    SetCenter(latLngLike) {
        this._map.setView(Array.isArray(latLngLike) ? latLngLike : [latLngLike.lat, latLngLike.lng]);
    }

    /**
     * Zoom
     * @type {Number}
     */
    get zoom() {
        return this._zoom;
    }
    /**
     * Zoom
     * @type {Number}
     */
    set zoom(value) {
        this._zoom = value;
        this._showZoom();
    }
    _showZoom() {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            this.SetZoom(this._zoom);
        })
    }

    SetZoom(zoom) {
        this._map.setZoom(zoom);
    }

    /**
     * Tiles string in format https://tile.openstreetmap.org/{z}/{x}/{y}.png
     * @type {String}
     */
    get tiles() {
        return this._tiles;
    }
    /**
     * Tiles string in format https://tile.openstreetmap.org/{z}/{x}/{y}.png
     * @type {String}
     */
    set tiles(value) {
        this._tiles = value;
        this._showTiles();
    }
    _showTiles() {
        Colibri.Common.Wait(() => this._loaded).then(() => {
            this.AddTiles(this._tiles);
        });
    }

    AddTiles(tileUrl) {
        L.tileLayer(tileUrl).addTo(this._map);
    }

    MarkerPosition(name) {
        if(this._objects[name]) {
            const ll = this._objects[name].getLatLng();
            return {
                lat: ll.lat,
                lng: ll.lng,
                alt: ll.alt
            };
        } 
        return null;
    }

    AddMarker(name, latLngLike, icon = null, opacity = 1, azimuth = 0) {
        if(this._objects[name]) {
            this.UpdateMarker(name, latLngLike, icon, opacity);
        } else {
            const options = {};
            if(icon) {
                options.icon = this._icons[icon];
            }
            if(opacity) {
                options.opacity = opacity;
            }
            this._objects[name] = L.marker([latLngLike.lat, latLngLike.lng], options).addTo(this._map);
            if(azimuth) {
                this._objects[name].setRotation(this._degToRad(azimuth));
            }
        }
    }

    UpdateMarker(name, latLngLike, icon = null, opacity = 1, azimuth = 0) {
        if(this._objects[name]) {
            this._objects[name].setLatLng(latLngLike);
            if(icon) {
                this._objects[name].setIcon(this._icons[icon]);
            }
            if(opacity) {
                this._objects[name].setOpacity(opacity);
            }
            if(azimuth) {
                console.log(azimuth);
                this._objects[name].setRotation(this._degToRad(azimuth));
            }
        }
    }

    AddPopup(name, popupHtml) {
        const object = this._objects[name];
        if(!object) {
            return;
        }
        if(object.getPopup()) {
            object.getPopup().setTooltipContent(toolTipHtml);
        } else {
            object.bindPopup(popupHtml);
        }
    }

    
    AddTooltip(name, toolTipHtml) {
        const object = this._objects[name];
        if(!object) {
            return;
        }
        if(object.getTooltip()) {
            object.getTooltip().setTooltipContent(toolTipHtml);
        } else {
            object.bindTooltip(toolTipHtml);
        }
    }

    OpenPopup(name) {
        const object = this._objects[name];
        if(!object) {
            return;
        }
        object.openPopup();
    }

    OpenTooltip(name) {
        const object = this._objects[name];
        if(!object) {
            return;
        }
        object.openTooltip();
    }


    AddPolyline(name, latLngArray, color = 'red', weight = 1) {
        if(this._objects[name]) {
            this.UpdatePolyline(name, latLngArray, color, weight);
        } else {
            this._objects[name] = L.polyline(latLngArray, {color: color, weight: weight}).addTo(this._map);
        }
    }

    UpdatePolyline(name, latLngArray, color = 'red', weight = 1) {
        if(this._objects[name]) {
            this._objects[name].setLatLngs(latLngArray);
            this._objects[name].setStyle({color: color, weight: weight});
        }
    }

    AddGeoLine(name, latLngLike, azimuth, color = 'red', weight = 1) {
        const distance = 10_000_000; // "infinity" 10,000 km
        const end = this._destinationPoint(latLngLike.lng, latLngLike.lat, distance, azimuth);
        const line = turf.greatCircle([latLngLike.lng, latLngLike.lat], [end.lng, end.lat], { npoints: 100 });

        this.AddPolyline(name, line.geometry.coordinates.map(v => ([v[1],v[0]])), color, weight);

        return {
            start: latLngLike,
            end: end,
            line: line,
            angle: azimuth,
            lastAngle: this._getAngleBetweenLastSegment(line.geometry.coordinates.map(v => ([v[1],v[0]]))),
        };
    }

    AddIcon(iconName, iconContent, width, height) {
        this._icons[iconName] = L.icon({
            iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconContent),
            iconSize: [width, height],
            iconAnchor: [width / 2, height / 2],
            popupAnchor: [-3, -3]
        });
    }

    DeleteByName(name) {
        if(!this._objects[name]) {
            return;
        }
        this._objects[name].remove();
        delete this._objects[name];
    }

    Exists(name) {
        return !!this._objects[name];
    }

    Detach(name) {
        if(!this._objects[name]) {
            return;
        }
        this._objects[name].remove();
    }

    Attach(name) {
        if(!this._objects[name]) {
            return;
        }
        this._objects[name].addTo(this._map);        
    }

    


}