
/**
 * Represents Colibri.Modules.Vincenty class, which provides geodesic calculations using the Vincenty formula and WebAssembly (WASM).
 * @class 
 * @memberof Colibri.Modules
 */
Colibri.Modules.Vincenty = class {

    /**
     * Constructs an instance of the Colibri.Modules.Vincenty class.
     * @constructor
     */
    constructor() {
        this._wasmLoaded = false;
        this._wasm = new Colibri.Common.Wasm('/res/vincenty.wasm');
        this._wasm.Load().then(() => {
            this._wasmLoaded = true;
        });
    }

    /**
     * Gets the loaded state of the WASM module.
     * @type {boolean}
     */
    get loaded() {
        return this._wasmLoaded;
    }

    /**
     * Reads a Float64Array from the WASM memory at the specified pointer.
     * @param {number} ptr - The pointer to the Float64Array in WASM memory.
     * @returns {Float64Array} - A copy of the Float64Array read from WASM memory.
     * @public
     */
    readF64(ptr) {
        this._wasm.__pin(ptr);
        const view = this._wasm.__getFloat64Array(ptr);
        const copy = new Float64Array(view.length);
        copy.set(view);
        this._wasm.__unpin(ptr);
        return copy;
    }

    /**
     * Copies a flat JS Float64Array into WASM memory and returns the pointer.
     * The pointer is pinned — the caller is responsible for unpinning after use.
     * @param {Float64Array} flatArray - The flat Float64Array to copy into WASM memory.
     * @returns {number} - The pointer to the Float64Array in WASM memory.
     * @public
     */
    writeF64(flatArray) {
        const id = this._wasm.Float64Array_ID();
        const ptr = this._wasm.__pin(this._wasm.__newArray(id, flatArray));
        return ptr;
    }

    /**
     * Converts a flat array of coordinates into an array of coordinate pairs.
     * @param {Float64Array} flat - The flat array of coordinates [lon, lat, lon, lat, ...].
     * @returns {Array<Array<number>>} - An array of coordinate pairs [[lon, lat], [lon, lat], ...].
     * @public
     */
    toPairs(flat) {
        const pairs = new Array(flat.length / 2);
        for (let i = 0; i < pairs.length; i++) {
            pairs[i] = [flat[i * 2], flat[i * 2 + 1]];
        }
        return pairs;
    }

    /**
     * Flattens an array of coordinate pairs into a flat Float64Array.
     * @param {Array<Array<number>>} coords - An array of coordinate pairs [[lon, lat], [lon, lat], ...].
     * @returns {Float64Array} - A flat Float64Array [lon, lat, lon, lat, ...].
     * @public
     */
    flattenCoords(coords) {
        const flat = new Float64Array(coords.length * 2);
        for (let i = 0; i < coords.length; i++) {
            flat[i * 2] = coords[i][0];
            flat[i * 2 + 1] = coords[i][1];
        }
        return flat;
    }

    /**
     * WGS-84 ellipsoid parameters.
     * @type {number}
     * @public
     */
    static a = 6378137.0;
    /**
     * WGS-84 ellipsoid flattening factor.
     * @type {number}
     * @public
     */
    static f = 1 / 298.257223563;
    /**
     * WGS-84 ellipsoid semi-minor axis.
     * @type {number}
     * @public
     */
    static b = (1 - (1 / 298.257223563)) * 6378137.0;

    /**
     * Converts degrees to radians.
     * @param {number} deg - The angle in degrees.
     * @returns {number} - The angle in radians.
     * @public
     */
    radians(deg) {
        return (deg * Math.PI) / 180;
    }

    /**
     * Converts radians to degrees.
     * @param {number} rad - The angle in radians.
     * @returns {number} - The angle in degrees.
     * @public
     */
    degrees(rad) {
        return (rad * 180) / Math.PI;
    }

    /**
     * Calculates the haversine distance between two geographic coordinates.
     * @param {number} lat1 - Latitude of the first point in degrees.
     * @param {number} lon1 - Longitude of the first point in degrees.
     * @param {number} lat2 - Latitude of the second point in degrees.
     * @param {number} lon2 - Longitude of the second point in degrees.
     * @returns {number} - The haversine distance in meters.
     * @public
     */
    haversine(lat1, lon1, lat2, lon2) {
        return this._wasm.haversine(lat1, lon1, lat2, lon2);
    }

    /**
     * Calculates the initial heading (bearing) from the first coordinate to the second coordinate.
     * @param {Array<number>} coord1 - The first coordinate [lon, lat].
     * @param {Array<number>} coord2 - The second coordinate [lon, lat].
     * @returns {number} - The initial heading in degrees from north.
     * @public
     */
    heading(coord1, coord2) {
        return this._wasm.heading(coord1[0], coord1[1], coord2[0], coord2[1]);
    }

    /**
     * Calculates the bearing from the first coordinate to the second coordinate.
     * @param {number} lat1 - Latitude of the first point in degrees.
     * @param {number} lon1 - Longitude of the first point in degrees.
     * @param {number} lat2 - Latitude of the second point in degrees.
     * @param {number} lon2 - Longitude of the second point in degrees.
     * @returns {number} - The bearing in degrees from north.
     * @public
     */
    bearing(lat1, lon1, lat2, lon2) {
        return this._wasm.bearing(lat1, lon1, lat2, lon2);
    }

    /**
     * Calculates the inverse geodesic problem using the Vincenty formula.
     * @param {Array<number>} coord1 - The first coordinate [lon, lat].
     * @param {Array<number>} coord2 - The second coordinate [lon, lat].
     * @param {number} [maxIter=200] - Maximum number of iterations for convergence.
     * @param {number} [tol=1e-12] - Tolerance for convergence.
     * @returns {Array<number>} - An array containing the distance and azimuth [distance, azimuth].
     * @public
     */
    inverse(coord1, coord2, maxIter = 200, tol = 1e-12) {
        const ptr = this._wasm.inverse(coord1[0], coord1[1], coord2[0], coord2[1], maxIter, tol);
        const res = this.readF64(ptr);
        return [res[0], res[1]]; // [distance, azimuth]
    }

    /**
     * Calculates the direct geodesic problem using the Vincenty formula.
     * @param {number} phi1 - Latitude of the starting point in degrees.
     * @param {number} lambda1 - Longitude of the starting point in degrees.
     * @param {number} alpha12 - Initial azimuth in degrees.
     * @param {number} s - Distance to travel along the geodesic in meters.
     * @returns {Array<number>} - An array containing the latitude and longitude of the destination point [lat2, lon2].
     * @public
     */
    direct(phi1, lambda1, alpha12, s) {
        const ptr = this._wasm.direct(phi1, lambda1, alpha12, s);
        const res = this.readF64(ptr);
        return [res[0], res[1]]; // [lat2, lon2]
    }

    /**
     * Checks if a point is inside a bounding box.
     * @param {number} lat - Latitude of the point in degrees.
     * @param {number} lon - Longitude of the point in degrees.
     * @param {Array<{lat:number,lng:number}>} bbox - An array containing two points defining the bounding box [{lat, lng}, {lat, lng}].
     * @returns {boolean} - True if the point is inside the bounding box, false otherwise.
     * @public
     */
    InsideBBox(lat, lon, bbox) {
        if (!bbox) return true;
        return this._wasm.insideBBox(lat, lon, bbox[0].lat, bbox[0].lng, bbox[1].lat, bbox[1].lng);
    }

    /**
     * Generates a geodesic line from a starting point, azimuth, and distance.
     * @param {number} lat - Latitude of the starting point in degrees.
     * @param {number} lon - Longitude of the starting point in degrees.
     * @param {number} azimuth - Initial azimuth in degrees.
     * @param {number} totalDistance - Total distance to travel along the geodesic in meters.
     * @param {number} [steps=1000] - Number of steps to divide the line into.
     * @param {Array<{lat:number,lng:number}>} [bbox=null] - Optional bounding box to constrain the line.
     * @returns {{type: string, coordinates: Array<Array<number>>}} - A GeoJSON LineString object representing the geodesic line.
     * @public
     */
    Line(lat, lon, azimuth, totalDistance, steps = 1000, bbox = null) {
        const ptr = this._wasm.generateLine(lat, lon, azimuth, totalDistance, steps);
        const flat = this.readF64(ptr);
        return { type: "LineString", coordinates: this.toPairs(flat) };
    }

    /**
     * Generates a geodesic line between two coordinates.
     * @param {Array<number>} coord1 - The first coordinate [lon, lat].
     * @param {Array<number>} coord2 - The second coordinate [lon, lat].
     * @param {number} [steps=1000] - Number of steps to divide the line into.
     * @returns {{type: string, coordinates: Array<Array<number>>}} - A GeoJSON LineString object representing the geodesic line.
     * @public
     */
    LineBetween(coord1, coord2, steps = 1000) {
        const ptr = this._wasm.generateLineBetween(coord1[0], coord1[1], coord2[0], coord2[1], steps);
        const flat = this.readF64(ptr);
        return { type: "LineString", coordinates: this.toPairs(flat) };
    }

    /**
     * Generates a wrapped geodesic line from a starting point, azimuth, and distance, optionally constrained by a bounding box.
     * @param {{lat:number,lng:number,azimuth:number}} point - The starting point with latitude, longitude, and azimuth.
     * @param {number} totalDistance - Total distance to travel along the geodesic in meters.
     * @param {number} [steps=1000] - Number of steps to divide the line into.
     * @param {Array<{lat:number,lng:number}>} [bbox=null] - Optional bounding box to constrain the line.
     * @returns {{type: string, coordinates: Array<Array<Array<number>>>}} - A GeoJSON MultiLineString object representing the wrapped geodesic line.
     * @public
     */
    Wrapped(point, totalDistance, steps = 1000, bbox = null) {
        const hasBbox = !!bbox;
        const ptr = this._wasm.generateWrapped(
            point.lat, point.lng, point.azimuth, totalDistance, steps,
            hasBbox,
            hasBbox ? bbox[0].lat : 0, hasBbox ? bbox[0].lng : 0,
            hasBbox ? bbox[1].lat : 0, hasBbox ? bbox[1].lng : 0
        );
        const flat = this.readF64(ptr);

        // сегменты разделены парой (NaN, NaN)
        const segments = [];
        let current = [];
        for (let i = 0; i < flat.length; i += 2) {
            const lon = flat[i], lat = flat[i + 1];
            if (Number.isNaN(lon) && Number.isNaN(lat)) {
                if (current.length > 0) segments.push(current);
                current = [];
                continue;
            }
            current.push([lon, lat]);
        }
        if (current.length > 0) segments.push(current);

        return { type: "MultiLineString", coordinates: segments };
    }

    /**
     * Calculates the closest point on a line segment to a given point.
     * @param {number} lat1 - Latitude of the first endpoint of the segment in degrees.
     * @param {number} lon1 - Longitude of the first endpoint of the segment in degrees.
     * @param {number} lat2 - Latitude of the second endpoint of the segment in degrees.
     * @param {number} lon2 - Longitude of the second endpoint of the segment in degrees.
     * @param {number} latP - Latitude of the point in degrees.
     * @param {number} lonP - Longitude of the point in degrees.
     * @returns {{lat: number, lon: number}} - The closest point on the segment to the given point.
     * @public
     */
    closestPointOnSegment(lat1, lon1, lat2, lon2, latP, lonP) {
        const ptr = this._wasm.closestPointOnSegment(lat1, lon1, lat2, lon2, latP, lonP);
        const res = this.readF64(ptr);
        return { lat: res[0], lon: res[1] };
    }

    /**
     * Calculates the length of a polyline defined by an array of coordinates.
     * @param {Array<Array<number>>} coords - An array of coordinate pairs [[lon, lat], [lon, lat], ...].
     * @returns {number} - The total length of the polyline in meters.
     * @public
     */
    lineLength(coords) {
        const flat = this.flattenCoords(coords);
        const ptr = this.writeF64(flat);
        const result = this._wasm.lineLength(ptr);
        this._wasm.__unpin(ptr);
        return result;
    }

    /**
     * Calculates the distance from a point to a polyline defined by an array of coordinates.
     * @param {Array<Array<number>>} coords - An array of coordinate pairs [[lon, lat], [lon, lat], ...].
     * @param {{lat: number, lng: number}} point - The point with latitude and longitude.
     * @returns {number} - The distance from the point to the polyline in meters.
     * @public
     */
    polylineLengthToPoint(coords, point) {
        if (!coords || coords.length < 2) return 0;
        const flat = this.flattenCoords(coords);
        const ptr = this.writeF64(flat);
        const result = this._wasm.polylineLengthToPoint(ptr, point.lat, point.lng);
        this._wasm.__unpin(ptr);
        return result;
    }

    /**
     * Пересечение двух геодезических векторов.
     * @param {{lat:number,lng:number,azimuth:number}} p1
     * @param {{lat:number,lng:number,azimuth:number}} p2
     * @param {Array<{lat:number,lng:number}>} [bbox]
     * @returns {{lat:number,lng:number}|null}
     */
    intersection(p1, p2, bbox = null, maxDistance = 20000000) {
        const hasBbox = !!bbox;
        const ptr = this._wasm.intersection(
            p1.lat, p1.lng, p1.azimuth,
            p2.lat, p2.lng, p2.azimuth,
            maxDistance,
            hasBbox,
            hasBbox ? bbox[0].lat : 0, hasBbox ? bbox[0].lng : 0,
            hasBbox ? bbox[1].lat : 0, hasBbox ? bbox[1].lng : 0
        );
        const res = this.readF64(ptr);
        if (res[0] !== 1) return null;
        return { lat: res[1], lng: res[2] };
    }

    /**
     * Calculates the intersection of multiple geodesic vectors.
     * @param {Array<{lat:number,lng:number,azimuth:number}>} points - An array of points with latitude, longitude, and azimuth.
     * @param {Array<{lat:number,lng:number}>} [tolerances] - An array of tolerance objects for filtering results.
     * @returns {Array<{lat:number,lng:number}>} - An array of intersection points.
     * @public
     */
    Intersections(points, tolerances) {
        // Здесь предполагается, что AssemblyScript экспортирует функцию:
        // export function Intersections(pointsPtr: usize, pointsLen: i32, tolPtr: usize, tolLen: i32): usize;
        // которая возвращает указатель на массив результатов

        // Сериализация входных данных в JSON и передача строкой
        const pointsStr = JSON.stringify(points);
        const tolStr = JSON.stringify(tolerances);

        const pointsPtr = this._wasm.__newString(pointsStr);
        const tolPtr = this._wasm.__newString(tolStr);

        const resPtr = this._wasm.Intersections(pointsPtr, tolPtr);
        const resStr = this._wasm.__getString(resPtr);

        return JSON.parse(resStr);
    }

    /**
     * Calculates the intersection of multiple geodesic vectors with optional bounding box and maximum distance.
     * @param {Array<{lat:number,lng:number,azimuth:number}>} points - An array of points with latitude, longitude, and azimuth.
     * @param {Array<{lat:number,lng:number}>} [bbox=null] - Optional bounding box to constrain the intersections.
     * @param {number} [maxDistance=20000000] - Maximum distance to consider for intersections.
     * @param {Array<{parameter:string,tolerance:number,unit:number}>} [tolerances=[]] - An array of tolerance objects for filtering results.
     * @returns {Array<{lat:number,lng:number}>} - An array of intersection points.
     * @public
     */
    Intersections(points, bbox = null, maxDistance = 20000000, tolerances = []) {
        const results = [];
        const len = points.length;

        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                const p1 = points[i];
                const p2 = points[j];

                if (Math.abs(p1.lat - p2.lat) < 1e-9 && Math.abs(p1.lng - p2.lng) < 1e-9) continue;

                let withinTolerance = true;
                for (const t of tolerances) {
                    let value1 = p1[t.parameter];
                    let value2 = p2[t.parameter];

                    if (value1 == null || value2 == null) {
                        withinTolerance = false;
                        break;
                    }

                    if (t.parameter === 'datecreated') {
                        value1 = new Date(value1).getTime();
                        value2 = new Date(value2).getTime();
                    } else {
                        value1 = parseFloat(value1);
                        value2 = parseFloat(value2);
                    }

                    let unit = t.unit;
                    if (unit === -1) {
                        unit = (value1 / 100) * parseFloat(t.tolerance);
                    }

                    const diff = Math.abs(value1 - value2) * unit;
                    if (diff > parseFloat(t.tolerance)) {
                        withinTolerance = false;
                        break;
                    }
                }

                if (!withinTolerance) continue;

                const inter = this.intersection(p1, p2, bbox, maxDistance);
                if (inter) {
                    inter.id1 = p1.id;
                    inter.id2 = p2.id;
                    results.push(inter);
                }
            }
        }

        const unique = [];
        const seen = new Set();
        for (const p of results) {
            const key = `${p.lat.toFixed(9)},${p.lng.toFixed(9)}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(p);
            }
        }

        return unique;
    }

}
