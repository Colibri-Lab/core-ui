/**
 * A utility class for geometric operations, including creating GeoJSON features, calculating distances, and finding intersections.
 * @class
 * @memberof Colibri.UI.Maps
 */
Colibri.UI.Maps.Turf = class {

    /** 
     * @param {Array<Array<Number>>} coordinates 
     * @param {Object} properties 
     * @returns {Object} 
     */
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

    /** 
     * @param {Array<Number>} start 
     * @param {Array<Number>} end 
     * @param {Object} options 
     * @returns {Object} 
     */
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

    /** 
     * @param {Array<Number>} a 
     * @param {Array<Number>} b 
     * @returns {Number} 
     */
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

    /** 
     * @param {Object} feature 
     * @param {{units?:String}} options 
     * @returns {Number} 
     */
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

    /** 
     * @param {Object} pointA 
     * @param {Object} pointB 
     * @param {{units?:String}} options 
     * @returns {Number} 
     */
    distance(pointA, pointB, options = {}) {
        const unit = options.units || "kilometers";
        const d = this.haversineDistance(pointA.geometry.coordinates, pointB.geometry.coordinates);
        switch (unit) {
            case "meters": return d * 1000;
            case "miles": return d * 0.621371;
            case "nauticalmiles": return d * 0.539957;
            default: return d; // kilometers
        }
    }

    /** 
     * @param {Array<Number>} coordinates 
     * @param {Object} properties 
     * @returns {Object} 
     */
    point(coordinates, properties = {}) {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates
            },
            properties
        };
    }

    /** 
     * @param {Array<Number>} center 
     * @param {Number} radiusKm 
     * @param {Object} options 
     * @returns {Object} 
     */
    circle(center, radiusKm, options = {}, project, unproject) {
        const { steps = 64 } = options;
        const R = 6371000; // радиус Земли в метрах

        const centerProj = center;
        const coords = [];

        for (let i = 0; i < steps; i++) {
            const theta = (i / steps) * 2 * Math.PI;
            const x = centerProj[0] + radiusKm * 1000 * Math.cos(theta);
            const y = centerProj[1] + radiusKm * 1000 * Math.sin(theta);
            coords.push([x, y]);
        }
        coords.push(coords[0]); // замыкаем

        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [coords]
            },
            properties: {
                center: center,
                radius: radiusKm
            }
        };
    }

    /**
     * Returns circle intersection polygon as GeoJSON.
     * 
     * @param {Object} circleA
     * 
     * @param {Object} circleB
     * 
     * @returns {Object|nul
     * l}
     */
    intersect(circleA, circleB) {
        // Центры окружностей
        const c1 = circleA.properties.center;
        const c2 = circleB.properties.center;

        // Радиусы (в км)
        const r1 = circleA.properties.radius;
        const r2 = circleB.properties.radius;

        // Переводим координаты в метры (простая проекция)
        const R = 6371000; // радиус Земли в м
        function project([lon, lat]) {
            const x = (lon * Math.PI / 180) * R * Math.cos(lat * Math.PI / 180);
            const y = (lat * Math.PI / 180) * R;
            return [x, y];
        }
        function unproject([x, y]) {
            const lat = (y / R) * 180 / Math.PI;
            const lon = (x / (R * Math.cos(lat * Math.PI / 180))) * 180 / Math.PI;
            return [lon, lat];
        }

        const p1 = project(c1);
        const p2 = project(c2);

        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d > (r1 * 1000 + r2 * 1000) || d < Math.abs(r1 * 1000 - r2 * 1000)) {
            return null; // нет пересечения
        }

        const a = (r1 * r1 * 1e6 - r2 * r2 * 1e6 + d * d) / (2 * d);
        const h = Math.sqrt(r1 * r1 * 1e6 - a * a);

        const xm = p1[0] + (a * dx) / d;
        const ym = p1[1] + (a * dy) / d;

        const rx = -(dy * (h / d));
        const ry = dx * (h / d);

        const pi1 = [xm + rx, ym + ry];
        const pi2 = [xm - rx, ym - ry];

        // Дуги окружностей
        function arcPoints(center, radius, from, to, steps = 64) {
            const angle1 = Math.atan2(from[1] - center[1], from[0] - center[0]);
            const angle2 = Math.atan2(to[1] - center[1], to[0] - center[0]);
            let sweep = angle2 - angle1;
            if (sweep < 0) sweep += 2 * Math.PI;

            const pts = [];
            for (let i = 0; i <= steps; i++) {
                const theta = angle1 + sweep * i / steps;
                pts.push([
                    center[0] + radius * 1000 * Math.cos(theta),
                    center[1] + radius * 1000 * Math.sin(theta)
                ]);
            }
            return pts;
        }

        const arc1 = arcPoints(p1, r1, pi1, pi2);
        const arc2 = arcPoints(p2, r2, pi2, pi1);

        const polygonCoords = [...arc1, ...arc2].map(unproject);

        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [polygonCoords]
            },
            properties: {}
        };
    }

    /**
     * Builds circle intersection polygon in planar coordinates.
     * 
     * @param {Array<Number>} c1
     * 
     * @param {Number} r1
     * 
     * @param {Array<Number>} c2
     * 
     * @param {Number} r2
     * 
     * @param {Number} steps
     * 
     * @returns {Object|null}
     */
    circleIntersectionPolygon(c1, r1, c2, r2, steps = 64) {
        const dx = c2[0] - c1[0];
        const dy = c2[1] - c1[1];
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d > r1 + r2 || d < Math.abs(r1 - r2) || (d === 0 && r1 === r2)) {
            return null; // нет пересечения
        }

        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        const h = Math.sqrt(r1 * r1 - a * a);

        const xm = c1[0] + (a * dx) / d;
        const ym = c1[1] + (a * dy) / d;

        const rx = -(dy * (h / d));
        const ry = dx * (h / d);

        const p1 = [xm + rx, ym + ry];
        const p2 = [xm - rx, ym - ry];

        function arcPoints(center, radius, from, to, steps) {
            const angle1 = Math.atan2(from[1] - center[1], from[0] - center[0]);
            const angle2 = Math.atan2(to[1] - center[1], to[0] - center[0]);
            let sweep = angle2 - angle1;
            if (sweep < 0) sweep += 2 * Math.PI;

            const pts = [];
            for (let i = 0; i <= steps; i++) {
                const theta = angle1 + (sweep * i / steps);
                pts.push([
                    center[0] + radius * Math.cos(theta),
                    center[1] + radius * Math.sin(theta)
                ]);
            }
            return pts;
        }

        const arc1 = arcPoints(c1, r1, p1, p2, steps);
        const arc2 = arcPoints(c2, r2, p2, p1, steps);

        const polygonCoords = [...arc1, ...arc2];

        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [polygonCoords]
            },
            properties: {}
        };

    }

    /** 
     * @param {Array<Number>} c1 
     * @param {Number} r1Km 
     * @param {Array<Number>} c2 
     * @param {Number} r2Km 
     * @returns {Array<Array<Number>>} 
     */
    circleIntersections(c1, r1Km, c2, r2Km) {
        const R = 6371000; // радиус Земли в метрах

        // переводим координаты в метры (простая equirectangular проекция)
        function project([lon, lat]) {
            const x = (lon * Math.PI / 180) * R * Math.cos(lat * Math.PI / 180);
            const y = (lat * Math.PI / 180) * R;
            return [x, y];
        }
        function unproject([x, y]) {
            const lat = (y / R) * 180 / Math.PI;
            const lon = (x / (R * Math.cos(lat * Math.PI / 180))) * 180 / Math.PI;
            return [lon, lat];
        }

        const p1 = project(c1);
        const p2 = project(c2);

        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const d = Math.sqrt(dx * dx + dy * dy);

        const r1 = r1Km * 1000;
        const r2 = r2Km * 1000;

        if (d > r1 + r2 || d < Math.abs(r1 - r2) || (d === 0 && r1 === r2)) {
            return [];
        }

        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        const h = Math.sqrt(r1 * r1 - a * a);

        const xm = p1[0] + (a * dx) / d;
        const ym = p1[1] + (a * dy) / d;

        const rx = -(dy * (h / d));
        const ry = dx * (h / d);

        const pi1 = [xm + rx, ym + ry];
        const pi2 = [xm - rx, ym - ry];

        return [unproject(pi1), unproject(pi2)];
    }

    /** 
     * @param {Array<Number>} center 
     * @param {Number} radiusDeg 
     * @param {Number} steps 
     * @returns {Object} 
     */
    circlePolygonDeg(center, radiusDeg, steps = 128) {
        const [lon, lat] = center;
        const coords = [];

        for (let i = 0; i < steps; i++) {
            const theta = (i / steps) * 2 * Math.PI;
            const dx = radiusDeg * Math.cos(theta);
            const dy = radiusDeg * Math.sin(theta);

            coords.push([lon + dx, lat + dy]);
        }

        coords.push(coords[0]); // замыкаем полигон

        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [coords]
            },
            properties: {}
        };
    }

    /** 
     * @param {Array<Number>} coord1 
     * @param {Array<Number>} coord2 
     * @returns {Number} 
     */
    degreeDistance(coord1, coord2) {
        const [lon1, lat1] = coord1;
        const [lon2, lat2] = coord2;

        const dLon = lon2 - lon1;
        const dLat = lat2 - lat1;

        // Евклидово расстояние в градусах
        return Math.sqrt(dLon * dLon + dLat * dLat);
    }

    /** 
     * @param {Array<Number>} p1 
     * @param {Array<Number>} p2 
     * @param {Array<Number>} p3 
     * @param {Array<Number>} p4 
     * @returns {Array<Number>|null} 
     */
    lineIntersection(p1, p2, p3, p4) {
        const x1 = p1[0], y1 = p1[1];
        const x2 = p2[0], y2 = p2[1];
        const x3 = p3[0], y3 = p3[1];
        const x4 = p4[0], y4 = p4[1];

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return null; // параллельные

        const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

        // Проверка, что точка лежит на обоих отрезках
        if (
            px < Math.min(x1, x2) - 1e-9 || px > Math.max(x1, x2) + 1e-9 ||
            px < Math.min(x3, x4) - 1e-9 || px > Math.max(x3, x4) + 1e-9 ||
            py < Math.min(y1, y2) - 1e-9 || py > Math.max(y1, y2) + 1e-9 ||
            py < Math.min(y3, y4) - 1e-9 || py > Math.max(y3, y4) + 1e-9
        ) {
            return null;
        }

        return [px, py];
    }

    /**
     * Finds all edge intersections for two polygons.
     * 
     * @param {Object} poly1
     * 
     * @param {Object} poly2
     * 
     * @returns {Array<Array<Number>>}
     */
    polygonIntersectionsPoints(poly1, poly2) {
        const coords1 = poly1.geometry.coordinates[0];
        const coords2 = poly2.geometry.coordinates[0];
        const intersections = [];

        for (let i = 0; i < coords1.length - 1; i++) {
            for (let j = 0; j < coords2.length - 1; j++) {
                const inter = this.lineIntersection(coords1[i], coords1[i + 1], coords2[j], coords2[j + 1]);
                if (inter) intersections.push(inter);
            }
        }

        return intersections;
    }

    /** 
     * @param {Object} circle1 
     * @param {Object} circle2 
     * @returns {Object|null} 
     */
    difference(circle1, circle2) {
        const coords1 = circle1.geometry.coordinates[0];
        const coords2 = circle2.geometry.coordinates[0];

        // Находим точки пересечения рёбер
        const intersections = this.polygonIntersectionsPoints(circle1, circle2);
        if (intersections.length < 2) return null;

        const [p1, p2] = intersections;

        // Функция для обхода полигона от точки до точки
        function findClosestIndex(coords, point) {
            let minDist = Infinity;
            let idx = -1;
            for (let i = 0; i < coords.length; i++) {
                const dx = coords[i][0] - point[0];
                const dy = coords[i][1] - point[1];
                const dist = dx * dx + dy * dy;
                if (dist < minDist) {
                    minDist = dist;
                    idx = i;
                }
            }
            return idx;
        }

        function arcBetween(coords, from, to) {
            const idxFrom = findClosestIndex(coords, from);
            const idxTo = findClosestIndex(coords, to);

            const arc = [];
            let i = idxFrom;
            while (true) {
                arc.push(coords[i]);
                if (i === idxTo) break;
                i = (i + 1) % coords.length;
            }
            return arc;
        }


        // дуга первого круга от p1 до p2
        const arc1 = arcBetween(coords1, p1, p2);
        // дуга второго круга от p2 до p1
        const arc2 = arcBetween(coords2, p2, p1);

        const diff1 = {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [[...arc1, ...arc2]] },
            properties: { name: "circle1 - circle2" }
        };

        // // обратный вариант
        // const arc3 = arcBetween(coords2, p1, p2);
        // const arc4 = arcBetween(coords1, p2, p1);

        // const diff2 = {
        //     type: "Feature",
        //     geometry: { type: "Polygon", coordinates: [[...arc3, ...arc4]] },
        //     properties: { name: "circle2 - circle1" }
        // };

        return diff1;
    }

    /** 
     * @param {Number} azimuthDeg 
     * @returns {Array<Number>} 
     */
    directionVector(azimuthDeg) {
        const az = azimuthDeg * Math.PI / 180;
        return [Math.sin(az), Math.cos(az)];
    }

    /** 
     * @param {Array<Number>} v1 
     * @param {Array<Number>} v2 
     * @returns {Number} 
     */
    angleBetween(v1, v2) {
        const dot = v1[0] * v2[0] + v1[1] * v2[1];
        const mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
        const mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);
        return Math.acos(dot / (mag1 * mag2)) * 180 / Math.PI;
    }

    /** 
     * @param {Number} az1 
     * @param {Number} az2 
     * @param {Number} toleranceDeg 
     * @returns {Boolean} 
     */
    sameDirection(az1, az2, toleranceDeg = 20) {
        let diff = Math.abs(az1 - az2);
        if (diff > 180) diff = 360 - diff;
        return diff <= toleranceDeg;
    }

    /** 
     * @param {Array<Number>} pt 
     * @param {Object} polygon 
     * @returns {Boolean} 
     */
    pointInPolygon(pt, polygon) {
        let inside = false;
        const coords = polygon.geometry.coordinates[0];
        for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
            const xi = coords[i][0], yi = coords[i][1];
            const xj = coords[j][0], yj = coords[j][1];
            const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
                (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

}
