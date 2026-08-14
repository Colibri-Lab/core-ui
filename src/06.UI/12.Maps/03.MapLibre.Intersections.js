/**
 * A utility class for finding intersections between polylines.
 * @class
 * @memberof Colibri.UI.Maps
 */
Colibri.UI.Maps.Intersections = class {

    /**
     * Helper: checks orientation of ordered triplet (p, q, r).
     * 
     * @param {Array<Number>} p
     * 
     * @param {Array<Number>} q
     * 
     * @param {Array<Number>} r
     * 
     * @returns {Number}
     */
    orientation(p, q, r) {
        const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
        if (val === 0) return 0; // colinear
        return val > 0 ? 1 : 2; // clock or counterclock wise
    }

    /**
     * Checks whether q lies on segment pr.
     * 
     * @param {Array<Number>} p
     * 
     * @param {Array<Number>} q
     * 
     * @param {Array<Number>} r
     * 
     * @returns {Boolean}
     */
    onSegment(p, q, r) {
        return (
            q[0] <= Math.max(p[0], r[0]) &&
            q[0] >= Math.min(p[0], r[0]) &&
            q[1] <= Math.max(p[1], r[1]) &&
            q[1] >= Math.min(p[1], r[1])
        );
    }

    /**
     * Checks if two segments intersect.
     * 
     * @param {Array<Number>} p1
     * 
     * @param {Array<Number>} q1
     * 
     * @param {Array<Number>} p2
     * 
     * @param {Array<Number>} q2
     * 
     * @returns {Boolean}
     */
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

    /**
     * Computes segment intersection point.
     * 
     * @param {Array<Number>} p1
     * 
     * @param {Array<Number>} q1
     * 
     * @param {Array<Number>} p2
     * 
     * @param {Array<Number>} q2
     * 
     * @returns {Array<Number>|null}
     */
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

    /**
     * Finds all intersections between two polylines.
     * 
     * @param {Array<Array<Number>>} line1
     * 
     * @param {Array<Array<Number>>} line2
     * 
     * @returns {Array<Array<Number>>}
     */
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

    /**
     * Finds intersections for all line pairs.
     * 
     * @param {Array<{id:String|Number,coordinates:Array}>} lines
     * 
     * @returns {Array<{id1:*,id2:*,lat:Number,lng:Number}>}
     */
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