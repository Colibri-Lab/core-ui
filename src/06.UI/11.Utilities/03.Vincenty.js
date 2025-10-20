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

}
