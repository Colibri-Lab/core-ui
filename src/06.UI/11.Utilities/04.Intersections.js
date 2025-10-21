Colibri.UI.Utilities.Intersections = class {

    static MAX_DISTANCE = 20_000_000; // 20 000 км

    /**
     * Пересечение двух векторов Винсенти.
     * @param {{lat:number,lng:number,azimuth:number}} p1
     * @param {{lat:number,lng:number,azimuth:number}} p2
     * @param {Array<{lat:number,lng:number}>} [bbox]
     * @returns {{lat:number,lng:number}|null}
     */
    static vincentyIntersection(p1, p2, bbox = null) {
        const { lat: lat1, lng: lon1, azimuth: az1 } = p1;
        const { lat: lat2, lng: lon2, azimuth: az2 } = p2;

        // совпадающие точки
        if (Math.abs(lat1 - lat2) < 1e-9 && Math.abs(lon1 - lon2) < 1e-9) return null;

        const toRad = deg => deg * Math.PI / 180;
        const toDeg = rad => rad * 180 / Math.PI;

        const cross3 = (a,b) => [
            a[1]*b[2]-a[2]*b[1],
            a[2]*b[0]-a[0]*b[2],
            a[0]*b[1]-a[1]*b[0]
        ];

        const toCartesian = (lat, lon) => [
            Math.cos(lat)*Math.cos(lon),
            Math.cos(lat)*Math.sin(lon),
            Math.sin(lat)
        ];

        const greatCircleNormal = (lat, lon, az) => {
            const p = toCartesian(lat, lon);
            const east = [-Math.sin(lon), Math.cos(lon), 0];
            const north = cross3(p, east);
            const dir = north.map((v,i)=>v*Math.cos(az)+east[i]*Math.sin(az));
            return cross3(p, dir);
        };

        const toLatLon = v => {
            const lat = Math.asin(v[2]);
            let lon = Math.atan2(v[1], v[0]);
            return { lat: toDeg(lat), lng: (toDeg(lon)+540)%360-180 };
        };

        const vincentyDistance = (latA, lonA, latB, lonB) => {
            return Colibri.UI.Utilities.Vincenty.haversine(latA, lonA, latB, lonB);
        };

        // нормали великих кругов
        const n1 = greatCircleNormal(toRad(lat1), toRad(lon1), toRad(az1));
        const n2 = greatCircleNormal(toRad(lat2), toRad(lon2), toRad(az2));

        // возможные пересечения
        const cross = cross3(n1, n2);
        const norm = Math.hypot(...cross);
        if (norm === 0) return null;

        const i1 = cross.map(v => v/norm);
        const i2 = cross.map(v => -v/norm);

        const latLng1 = toLatLon(i1);
        const latLng2 = toLatLon(i2);

        // выбираем ближайшую точку к первой
        const d1 = vincentyDistance(lat1, lon1, latLng1.lat, latLng1.lng);
        const d2 = vincentyDistance(lat1, lon1, latLng2.lat, latLng2.lng);

        const intersection = d1 < d2 ? latLng1 : latLng2;

        if (d1 > this.MAX_DISTANCE && d2 > this.MAX_DISTANCE) return null;
        if (bbox && !Colibri.UI.Utilities.Vincenty.InsideBBox(intersection.lat, intersection.lng, bbox)) return null;

        return intersection;
    }

    /**
     * Найти пересечения всех пар точек с азимутами
     * @param {Array<{lat:number,lng:number,azimuth:number}>} points
     * @param {Array<{lat:number,lng:number}>} [bbox]
     * @returns {Array<{lat:number,lng:number}>}
     */
    static vincentyIntersections(points, bbox = null) {
        const results = [];
        const len = points.length;

        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                const p1 = points[i];
                const p2 = points[j];

                // исключаем совпадающие точки
                if (Math.abs(p1.lat - p2.lat) < 1e-9 && Math.abs(p1.lng - p2.lng) < 1e-9) continue;

                const inter = this.vincentyIntersection(p1, p2, bbox);
                if (inter) {
                    inter.id1 = pt1.id;
                    inter.id2 = pt2.id;
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

};
