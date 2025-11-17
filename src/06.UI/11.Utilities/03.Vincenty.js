Colibri.UI.Utilities.Vincenty = class {

    static a = 6378137.0;              // semi-major axis (WGS-84)
    static f = 1 / 298.257223563;      // flattening (WGS-84)
    static b = (1 - (1 / 298.257223563)) * 6378137.0;

    static radians(deg) {
        return (deg * Math.PI) / 180;
    }

    static degrees(rad) {
        return (rad * 180) / Math.PI;
    }

    /**
     * Calculate approximate great-circle distance using the haversine formula.
     * @param {number} lat1
     * @param {number} lon1
     * @param {number} lat2
     * @param {number} lon2
     * @returns {number} Distance in meters.
     */
    static haversine(lat1, lon1, lat2, lon2) {
        const [rLat1, rLon1, rLat2, rLon2] = [lat1, lon1, lat2, lon2].map(Colibri.UI.Utilities.Vincenty.radians);
        const dLon = rLon2 - rLon1;
        const dLat = rLat2 - rLat1;
        const c =
            2 *
            Math.asin(
                Math.sqrt(
                    Math.pow(Math.sin(dLat / 2), 2) +
                    Math.cos(rLat1) * Math.cos(rLat2) * Math.pow(Math.sin(dLon / 2), 2)
                )
            );
        return c * Colibri.UI.Utilities.Vincenty.a;
    }

    /**
     * Calculate the initial bearing (forward azimuth) from point 1 to point 2.
     * @param {[number, number]} coord1
     * @param {[number, number]} coord2
     * @returns {number} Bearing in degrees (0–360).
     */
    static heading(coord1, coord2) {
        const [lat1, lon1] = coord1.map(Colibri.UI.Utilities.Vincenty.radians);
        const [lat2, lon2] = coord2.map(Colibri.UI.Utilities.Vincenty.radians);

        const x = Math.cos(lat2) * Math.sin(lon2 - lon1);
        const y =
            Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2);
        let heading = Colibri.UI.Utilities.Vincenty.degrees(Math.atan2(x, y));
        if (heading < 0) heading += 360;
        return heading;
    }

    /**
     * Solve the inverse Vincenty formula.
     * @param {[number, number]} coord1
     * @param {[number, number]} coord2
     * @param {number} [maxIter=200]
     * @param {number} [tol=1e-12]
     * @returns {[number, number]} [distance, initial bearing].
     */
    static inverse(coord1, coord2, maxIter = 200, tol = 1e-12) {
        const [phi1, L1] = coord1;
        const [phi2, L2] = coord2;

        const f = Colibri.UI.Utilities.Vincenty.f;
        const a = Colibri.UI.Utilities.Vincenty.a;
        const b = Colibri.UI.Utilities.Vincenty.b;

        const u1 = Math.atan((1 - f) * Math.tan(Colibri.UI.Utilities.Vincenty.radians(phi1)));
        const u2 = Math.atan((1 - f) * Math.tan(Colibri.UI.Utilities.Vincenty.radians(phi2)));

        const L = Colibri.UI.Utilities.Vincenty.radians(L2 - L1);
        let Lambda = L;

        const sinU1 = Math.sin(u1),
            cosU1 = Math.cos(u1),
            sinU2 = Math.sin(u2),
            cosU2 = Math.cos(u2);

        let sigma, sinSigma, cosSigma, sinAlpha, cosSqAlpha, cos2SigmaM, C;

        for (let i = 0; i < maxIter; i++) {
            const cosLambda = Math.cos(Lambda);
            const sinLambda = Math.sin(Lambda);
            sinSigma = Math.sqrt(
                Math.pow(cosU2 * sinLambda, 2) +
                Math.pow(cosU1 * sinU2 - sinU1 * cosU2 * cosLambda, 2)
            );
            if (sinSigma === 0) return [0, 0];
            cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
            sigma = Math.atan2(sinSigma, cosSigma);
            sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma;
            cosSqAlpha = 1 - sinAlpha * sinAlpha;
            cos2SigmaM = cosSigma - (2 * sinU1 * sinU2) / cosSqAlpha;
            C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
            const LambdaPrev = Lambda;
            Lambda =
                L +
                (1 - C) *
                f *
                sinAlpha *
                (sigma +
                    C *
                    sinSigma *
                    (cos2SigmaM +
                        C *
                        cosSigma *
                        (-1 + 2 * Math.pow(cos2SigmaM, 2))));
            if (Math.abs(Lambda - LambdaPrev) <= tol) break;
        }

        const uSq = (cosSqAlpha * (a * a - b * b)) / (b * b);
        const A =
            1 +
            (uSq / 16384) *
            (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        const B =
            (uSq / 1024) *
            (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
        const deltaSig =
            B *
            sinSigma *
            (cos2SigmaM +
                0.25 *
                B *
                (cosSigma *
                    (-1 + 2 * Math.pow(cos2SigmaM, 2)) -
                    (1 / 6) *
                    B *
                    cos2SigmaM *
                    (-3 + 4 * sinSigma * sinSigma) *
                    (-3 + 4 * Math.pow(cos2SigmaM, 2))));

        const alpha12 = Colibri.UI.Utilities.Vincenty.heading(coord1, coord2);
        const distance = b * A * (sigma - deltaSig);
        return [distance, alpha12];
    }

    /**
     * Solve the direct Vincenty formula.
     * @param {number} phi1
     * @param {number} lambda1
     * @param {number} alpha12
     * @param {number} s
     * @returns {[number, number]} [latitude2, longitude2]
     */
    static direct(phi1, lambda1, alpha12, s) {
        const f = Colibri.UI.Utilities.Vincenty.f;
        const a = Colibri.UI.Utilities.Vincenty.a;
        const b = Colibri.UI.Utilities.Vincenty.b;

        const piD4 = Math.atan(1.0);
        const twoPi = piD4 * 8.0;
        let phi = (phi1 * piD4) / 45.0;
        let lambda = (lambda1 * piD4) / 45.0;
        let alpha = (alpha12 * piD4) / 45.0;

        if (alpha < 0) alpha += twoPi;
        if (alpha > twoPi) alpha -= twoPi;

        const tanU1 = (1 - f) * Math.tan(phi);
        const U1 = Math.atan(tanU1);
        const sigma1 = Math.atan2(tanU1, Math.cos(alpha));
        const sinAlpha = Math.cos(U1) * Math.sin(alpha);
        const cosAlphaSq = 1 - sinAlpha * sinAlpha;
        const u2 = (cosAlphaSq * (a * a - b * b)) / (b * b);
        const A =
            1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
        const B =
            (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
        let sigma = s / (b * A);
        let lastSigma = 2 * sigma + 2;

        while (Math.abs((lastSigma - sigma) / sigma) > 1e-9) {
            const twoSigmaM = 2 * sigma1 + sigma;
            const deltaSigma =
                B *
                Math.sin(sigma) *
                (Math.cos(twoSigmaM) +
                    (B / 4) *
                    (Math.cos(sigma) *
                        (-1 + 2 * Math.pow(Math.cos(twoSigmaM), 2)) -
                        (B / 6) *
                        Math.cos(twoSigmaM) *
                        (-3 + 4 * Math.pow(Math.sin(sigma), 2)) *
                        (-3 + 4 * Math.pow(Math.cos(twoSigmaM), 2))));
            lastSigma = sigma;
            sigma = s / (b * A) + deltaSigma;
        }

        const phi2 = Math.atan2(
            Math.sin(U1) * Math.cos(sigma) +
            Math.cos(U1) * Math.sin(sigma) * Math.cos(alpha),
            (1 - f) *
            Math.sqrt(
                Math.pow(sinAlpha, 2) +
                Math.pow(
                    Math.sin(U1) * Math.sin(sigma) -
                    Math.cos(U1) * Math.cos(sigma) * Math.cos(alpha),
                    2
                )
            )
        );
        const lambda2 =
            lambda +
            Math.atan2(
                Math.sin(sigma) * Math.sin(alpha),
                Math.cos(U1) * Math.cos(sigma) -
                Math.sin(U1) * Math.sin(sigma) * Math.cos(alpha)
            );

        return [Colibri.UI.Utilities.Vincenty.degrees(phi2), Colibri.UI.Utilities.Vincenty.degrees(lambda2)];
    }

    static InsideBBox(lat, lon, bbox) {
        if (!bbox) return true;
        return (
            lat >= bbox[0].lat &&
            lat <= bbox[1].lat &&
            lon >= bbox[0].lng &&
            lon <= bbox[1].lng
        );
    }

    /**
    * Построение линии из точки [lat, lon] по азимуту и длине.
    * @param {number} lat - стартовая широта
    * @param {number} lon - стартовая долгота
    * @param {number} azimuth - азимут в градусах (0–360)
    * @param {number} totalDistance - длина линии в метрах
    * @param {number} steps - количество точек вдоль линии
    * @returns {[number, number][]} массив точек [lat, lon]
    */
    static Line(lat, lon, azimuth, totalDistance, steps = 1000, bbox = null) {
        const points = [];
        const stepDistance = totalDistance / steps;

        for (let i = 0; i <= steps; i++) {
            const dist = i * stepDistance;
            const [lat2, lon2] = Colibri.UI.Utilities.Vincenty.direct(lat, lon, azimuth, dist);
            points.push([lon2, lat2]);
        }

        return {
            type: "LineString",
            coordinates: points
        };
    }

    /**
     * Построение линии с разрывами при переходе ±180 долготы
     * @param {<lat, lng, azimuth>} point - стартовая широта
     * @param {number} totalDistance - длина линии в метрах
     * @param {number} steps - количество точек вдоль линии
     * @returns {Array<Array<[number, number]>>} массив сегментов, каждый сегмент массив [lat, lon]
     */
    static Wrapped(point, totalDistance, steps = 1000, bbox = null) {
        const segments = [];
        let segment = [];

        const lat = point.lat;
        const lon = point.lng;
        const azimuth = point.azimuth;

        const stepDistance = totalDistance / steps;
        let prevLon = lon;

        for (let i = 0; i <= steps; i++) {
            const dist = i * stepDistance;
            let [lat2, lon2] = Colibri.UI.Utilities.Vincenty.direct(lat, lon, azimuth, dist);

            // нормализация долготы
            if (lon2 > 180) lon2 -= 360;
            if (lon2 < -180) lon2 += 360;

            // переход через ±180
            if (segment.length > 0 && Math.abs(lon2 - prevLon) > 180) {
                if (segment.length > 1) segments.push(segment);
                segment = [];
            }

            // фильтрация по bbox
            if (!bbox || Colibri.UI.Utilities.Vincenty.InsideBBox(lat2, lon2, bbox)) {
                segment.push([lon2, lat2]);
            } else {
                // если текущая точка вне bbox, а предыдущая была внутри — закрываем сегмент
                if (segment.length > 0) {
                    segments.push(segment);
                    segment = [];
                }
            }

            prevLon = lon2;
        }

        if (segment.length > 0) {
            segments.push(segment);
        }

        return {
            type: "MultiLineString",
            coordinates: segments
        };
    }


    /**
     * Пересечение двух векторов Винсенти.
     * @param {{lat:number,lng:number,azimuth:number}} p1
     * @param {{lat:number,lng:number,azimuth:number}} p2
     * @param {Array<{lat:number,lng:number}>} [bbox]
     * @returns {{lat:number,lng:number}|null}
     */
    static intersection(p1, p2, bbox = null, maxDistance = 20000000) {
        const { lat: lat1, lng: lon1, azimuth: az1 } = p1;
        const { lat: lat2, lng: lon2, azimuth: az2 } = p2;

        // исключаем совпадающие точки
        if (Math.abs(lat1 - lat2) < 1e-9 && Math.abs(lon1 - lon2) < 1e-9) return null;

        const toRad = deg => deg * Math.PI / 180;
        const toDeg = rad => rad * 180 / Math.PI;

        const cross3 = (a, b) => [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];

        const toCartesian = (lat, lon) => [
            Math.cos(lat) * Math.cos(lon),
            Math.cos(lat) * Math.sin(lon),
            Math.sin(lat)
        ];

        const greatCircleNormal = (lat, lon, az) => {
            const p = toCartesian(lat, lon);
            const east = [-Math.sin(lon), Math.cos(lon), 0];
            const north = cross3(p, east);
            const dir = north.map((v, i) => v * Math.cos(az) + east[i] * Math.sin(az));
            return cross3(p, dir);
        };

        const toLatLon = v => {
            const lat = Math.asin(v[2]);
            let lon = Math.atan2(v[1], v[0]);
            return { lat: toDeg(lat), lng: (toDeg(lon) + 540) % 360 - 180 };
        };

        // нормали больших кругов
        const n1 = greatCircleNormal(toRad(lat1), toRad(lon1), toRad(az1));
        const n2 = greatCircleNormal(toRad(lat2), toRad(lon2), toRad(az2));

        const cross = cross3(n1, n2);
        const norm = Math.hypot(...cross);
        if (norm === 0) return null;

        const i1 = cross.map(v => v / norm);
        const i2 = cross.map(v => -v / norm);

        const latLng1 = toLatLon(i1);
        const latLng2 = toLatLon(i2);

        // вычисляем азимуты от точки начала
        const heading1 = Colibri.UI.Utilities.Vincenty.heading([lat1, lon1], [latLng1.lat, latLng1.lng]);
        const heading2 = Colibri.UI.Utilities.Vincenty.heading([lat1, lon1], [latLng2.lat, latLng2.lng]);

        // проверка направления (±90° относительно азимута линии)
        const isForward = (azStart, azToPoint) => {
            const diff = (azToPoint - azStart + 360) % 360;
            return diff <= 90 || diff >= 270;
        };

        const valid1 = isForward(az1, heading1);
        const valid2 = isForward(az1, heading2);

        let intersection = null;
        if (valid1 && valid2) {
            const d1 = Colibri.UI.Utilities.Vincenty.haversine(lat1, lon1, latLng1.lat, latLng1.lng);
            const d2 = Colibri.UI.Utilities.Vincenty.haversine(lat1, lon1, latLng2.lat, latLng2.lng);
            intersection = d1 < d2 ? latLng1 : latLng2;
        } else if (valid1) {
            intersection = latLng1;
        } else if (valid2) {
            intersection = latLng2;
        } else {
            return null; // обе точки “назад”
        }

        // проверка максимальной дистанции
        // const dist = Colibri.UI.Utilities.Vincenty.haversine(lat1, lon1, intersection.lat, intersection.lng);
        // if (dist > maxDistance) return null;

        const geoline = p1?.geoline?.coordinates?.[0] ?? Colibri.UI.Utilities.Vincenty.Line(p1.lat, p1.lng, p1.azimuth, maxDistance, 100).coordinates;
        if (geoline && geoline.length > 1) {
            // debugger;
            const distance = Colibri.UI.Utilities.Vincenty.polylineLengthToPoint(geoline, intersection);
            if (distance > maxDistance - 500000) {
                return null;
            }
        } else {
            const dist = Colibri.UI.Utilities.Vincenty.haversine(lat1, lon1, intersection.lat, intersection.lng);
            if (dist > maxDistance) return null;
        }

        // проверка bbox
        if (bbox && !Colibri.UI.Utilities.Vincenty.InsideBBox(intersection.lat, intersection.lng, bbox)) return null;

        return intersection;
    }

    /**
     * Найти пересечения всех пар точек с азимутами
     * @param {Array<{lat:number,lng:number,azimuth:number, ...params}>} points
     * @param {Array<{lat:number,lng:number}>} [bbox]
     * @param {Array<{parameter:string,tolerance:number,unit:number}>} tolerances
     * @returns {Array<{lat:number,lng:number}>}
     */
    static Intersections(points, bbox = null, maxDistance = 20000000, tolerances = []) {
        const results = [];
        const len = points.length;

        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                const p1 = points[i];
                const p2 = points[j];

                // исключаем совпадающие точки
                if (Math.abs(p1.lat - p2.lat) < 1e-9 && Math.abs(p1.lng - p2.lng) < 1e-9) continue;

                // проверяем толерансы
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

                    // переводим в «реальные единицы»
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

        // удаляем дубли
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

    static closestPointOnSegment(lat1, lon1, lat2, lon2, latP, lonP) {
        // проекция на сегмент в плоских координатах (приближение)
        const x1 = lon1, y1 = lat1;
        const x2 = lon2, y2 = lat2;
        const xP = lonP, yP = latP;

        const dx = x2 - x1;
        const dy = y2 - y1;
        if (dx === 0 && dy === 0) return { lat: lat1, lon: lon1 };

        let t = ((xP - x1) * dx + (yP - y1) * dy) / (dx * dx + dy * dy);
        t = Math.max(0, Math.min(1, t)); // ограничиваем сегментом
        return {
            lon: x1 + t * dx,
            lat: y1 + t * dy
        };
    }

    static polylineLengthToPoint(coords, point) {
        if (!coords || coords.length < 4) return 0;

        let length = 0;

        for (let i = 2; i < coords.length; i += 2) {
            const [lon1, lat1] = coords[i - 1];
            const [lon2, lat2] = coords[i];

            const distToPoint = Colibri.UI.Utilities.Vincenty.haversine(lat1, lon1, point.lat, point.lng);
            const distToNext = Colibri.UI.Utilities.Vincenty.haversine(lat1, lon1, lat2, lon2);
            if (distToPoint <= distToNext) {
                length += distToPoint;
                return length;
            } else {
                length += distToNext;
            }

        }

        // если точка не найдена на линии, возвращаем длину всей линии
        const [lon1, lat1] = coords[coords.length - 1];
        const distToPoint = Colibri.UI.Utilities.Vincenty.haversine(lat1, lon1, point.lat, point.lng);
        return length + distToPoint;
    }


}
