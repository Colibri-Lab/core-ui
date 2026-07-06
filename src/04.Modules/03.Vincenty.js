

Colibri.Modules.Vincenty = class {

    _wasm = null;

    constructor() {
        this._wasmLoaded = false;
        this._wasm = new Colibri.Common.Wasm('/res/vincenty.wasm');
        this._wasm.Load().then(() => {
            this._wasmLoaded = true;
        });
    }

    get loaded() {
        return this._wasmLoaded;
    }

    readF64(ptr) {
        this._wasm.__pin(ptr);
        const view = this._wasm.__getFloat64Array(ptr);
        const copy = new Float64Array(view.length);
        copy.set(view);
        this._wasm.__unpin(ptr);
        return copy;
    }

    // Копирует плоский JS Float64Array в память WASM и возвращает указатель
    // (запиненный — снимать пин вызывающая сторона должна сама после use).
    writeF64(flatArray) {
        const id = this._wasm.Float64Array_ID();
        const ptr = this._wasm.__pin(this._wasm.__newArray(id, flatArray));
        return ptr;
    }

    // [lon,lat, lon,lat, ...] (плоский) -> [[lon,lat], [lon,lat], ...]
    toPairs(flat) {
        const pairs = new Array(flat.length / 2);
        for (let i = 0; i < pairs.length; i++) {
            pairs[i] = [flat[i * 2], flat[i * 2 + 1]];
        }
        return pairs;
    }

    // coords: [[lon,lat], ...] -> плоский Float64Array [lon,lat, ...]
    flattenCoords(coords) {
        const flat = new Float64Array(coords.length * 2);
        for (let i = 0; i < coords.length; i++) {
            flat[i * 2] = coords[i][0];
            flat[i * 2 + 1] = coords[i][1];
        }
        return flat;
    }


    static a = 6378137.0;
    static f = 1 / 298.257223563;
    static b = (1 - (1 / 298.257223563)) * 6378137.0;

    radians(deg) {
        return (deg * Math.PI) / 180;
    }

    degrees(rad) {
        return (rad * 180) / Math.PI;
    }

    haversine(lat1, lon1, lat2, lon2) {
        return this._wasm.haversine(lat1, lon1, lat2, lon2);
    }

    heading(coord1, coord2) {
        return this._wasm.heading(coord1[0], coord1[1], coord2[0], coord2[1]);
    }

    bearing(lat1, lon1, lat2, lon2) {
        return this._wasm.bearing(lat1, lon1, lat2, lon2);
    }

    inverse(coord1, coord2, maxIter = 200, tol = 1e-12) {
        const ptr = this._wasm.inverse(coord1[0], coord1[1], coord2[0], coord2[1], maxIter, tol);
        const res = this.readF64(ptr);
        return [res[0], res[1]]; // [distance, azimuth]
    }

    direct(phi1, lambda1, alpha12, s) {
        const ptr = this._wasm.direct(phi1, lambda1, alpha12, s);
        const res = this.readF64(ptr);
        return [res[0], res[1]]; // [lat2, lon2]
    }

    InsideBBox(lat, lon, bbox) {
        if (!bbox) return true;
        return this._wasm.insideBBox(lat, lon, bbox[0].lat, bbox[0].lng, bbox[1].lat, bbox[1].lng);
    }

    Line(lat, lon, azimuth, totalDistance, steps = 1000, bbox = null) {
        const ptr = this._wasm.generateLine(lat, lon, azimuth, totalDistance, steps);
        const flat = this.readF64(ptr);
        return { type: "LineString", coordinates: this.toPairs(flat) };
    }

    LineBetween(coord1, coord2, steps = 1000) {
        const ptr = this._wasm.generateLineBetween(coord1[0], coord1[1], coord2[0], coord2[1], steps);
        const flat = this.readF64(ptr);
        return { type: "LineString", coordinates: this.toPairs(flat) };
    }

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

    closestPointOnSegment(lat1, lon1, lat2, lon2, latP, lonP) {
        const ptr = this._wasm.closestPointOnSegment(lat1, lon1, lat2, lon2, latP, lonP);
        const res = this.readF64(ptr);
        return { lat: res[0], lon: res[1] };
    }

    lineLength(coords) {
        const flat = this.flattenCoords(coords);
        const ptr = this.writeF64(flat);
        const result = this._wasm.lineLength(ptr);
        this._wasm.__unpin(ptr);
        return result;
    }

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
     * Найти пересечения всех пар точек с азимутами.
     * Тяжёлая геометрия (сам intersection) считается в WASM;
     * фильтрация по tolerances (даты, произвольные параметры) и
     * дедупликация результатов остаются в JS, т.к. работают с
     * динамическими полями и Date, которые в WASM переносить не нужно.
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
