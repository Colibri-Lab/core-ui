Colibri.UI.Utilities.Intersections = class {

    static d = 40000;

    static plotPolar(latA, lonA, latA2, lonA2) {
        const p1Lat1Rad = Colibri.UI.Utilities.Vincenty.radians(latA);
        const p1Lon1Rad = Colibri.UI.Utilities.Vincenty.radians(lonA);
        const p1Lat2Rad = Colibri.UI.Utilities.Vincenty.radians(latA2);
        const p1Lon2Rad = Colibri.UI.Utilities.Vincenty.radians(lonA2);

        const x1 = Math.cos(p1Lat1Rad) * Math.cos(p1Lon1Rad);
        const y1 = Math.cos(p1Lat1Rad) * Math.sin(p1Lon1Rad);
        const z1 = Math.sin(p1Lat1Rad);
        const x2 = Math.cos(p1Lat2Rad) * Math.cos(p1Lon2Rad);
        const y2 = Math.cos(p1Lat2Rad) * Math.sin(p1Lon2Rad);
        const z2 = Math.sin(p1Lat2Rad);

        return [[x1, y1, z1], [x2, y2, z2]];
    }

    static cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }

    static dot(a, b) {
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    }

    static magnitude(v) {
        return Math.sqrt(Colibri.UI.Utilities.Intersections.dot(v, v));
    }

    static normalize(v) {
        const mag = Colibri.UI.Utilities.Intersections.magnitude(v);
        return [v[0]/mag, v[1]/mag, v[2]/mag];
    }

    static plotIntersects(latA, lonA, doaA, latB, lonB, doaB, maxDistance = 40000000) {
        const d = Colibri.UI.Utilities.Intersections.d;

        const coordA2 = Colibri.UI.Utilities.Vincenty.direct(latA, lonA, doaA, d);
        const coordB2 = Colibri.UI.Utilities.Vincenty.direct(latB, lonB, doaB, d);
        const planeA = Colibri.UI.Utilities.Intersections.plotPolar(latA, lonA, coordA2[0], coordA2[1]);
        const planeB = Colibri.UI.Utilities.Intersections.plotPolar(latB, lonB, coordB2[0], coordB2[1]);

        const N1 = Colibri.UI.Utilities.Intersections.cross(planeA[0], planeA[1]);
        const N2 = Colibri.UI.Utilities.Intersections.cross(planeB[0], planeB[1]);
        const L = Colibri.UI.Utilities.Intersections.cross(N1, N2);

        const X1 = Colibri.UI.Utilities.Intersections.normalize(L);
        const X2 = [-X1[0], -X1[1], -X1[2]];

        const mag = (q) => Colibri.UI.Utilities.Intersections.magnitude(q);

        const dist1 = mag([X1[0] - planeA[0][0], X1[1] - planeA[0][1], X1[2] - planeA[0][2]]);
        const dist2 = mag([X2[0] - planeA[0][0], X2[1] - planeA[0][1], X2[2] - planeA[0][2]]);

        let iLat, iLon;
        if (dist1 < dist2) {
            iLat = Math.asin(X1[2]) * 180 / Math.PI;
            iLon = Math.atan2(X1[1], X1[0]) * 180 / Math.PI;
        } else {
            iLat = Math.asin(X2[2]) * 180 / Math.PI;
            iLon = Math.atan2(X2[1], X2[0]) * 180 / Math.PI;
        }

        const antipode = (lat, lon) => {
            const latA = lat * -1;
            const lonA = (lon <= 0) ? (180 + lon) : (lon - 180);
            return [latA, lonA];
        };

        const checkBearingA = Colibri.UI.Utilities.Vincenty.heading([latA, lonA], [iLat, iLon]);
        const checkBearingB = Colibri.UI.Utilities.Vincenty.heading([latB, lonB], [iLat, iLon]);

        const inverse = Colibri.UI.Utilities.Vincenty.inverse;

        if (Math.abs(checkBearingA - doaA) < 5 && Math.abs(checkBearingB - doaB) < 5) {
            const km1 = inverse([latA, lonA], [iLat, iLon]);
            const km2 = inverse([latB, lonB], [iLat, iLon]);
            if (km1[0] < maxDistance && km2[0] < maxDistance) {
                return [iLat, iLon];
            } else {
                return null;
            }
        } else {
            const [aLat, aLon] = antipode(iLat, iLon);
            const km1 = inverse([latA, lonA], [aLat, aLon]);
            const km2 = inverse([latB, lonB], [aLat, aLon]);
            if (km1[0] < maxDistance && km2[0] < maxDistance) {
                return [aLat, aLon];
            } else {
                return null;
            }
        }
    }

    static findIntersections(startingPoints, maxD = 40000000) { // lat, lon, doa, 40000000

        const intersections = [];
        for(const v1 of startingPoints) {
            for(const v2 of startingPoints) {
                if(v1.id != v2.id) {
                    const intersection = Colibri.UI.Utilities.Intersections.plotIntersects(
                        v1.lat, v1.lng, v1.azimuth,
                        v2.lat, v2.lng, v2.azimuth,
                        maxD
                    );
                    if(intersection) {
                        intersections.push({id1: v1.id, id2: v2.id, lat: intersection[0], lng: intersection[1]});
                    };
                }
            }
        }
        return intersections;
        // const receivers = {
        //     latitude: lat,
        //     longitude: lon,
        //     doa: doa
        // };

        // for (let x = 0; x < receivers.latitude.length; x++) {
        //     for (let y = 0; y < x; y++) {
        //         if (x !== y && receivers.latitude[x] !== receivers.latitude[y] && receivers.longitude[x] !== receivers.longitude[y]) {
        //             const intersection = Colibri.UI.Utilities.Intersections.plotIntersects(
        //                 receivers.latitude[x], receivers.longitude[x], receivers.doa[x],
        //                 receivers.latitude[y], receivers.longitude[y], receivers.doa[y],
        //                 maxD
        //             );
        //             if (intersection) intersections.push(intersection);
        //         }
        //     }
        // }

        // return intersections;
    }


};
