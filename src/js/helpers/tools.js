const _ = require('lodash');
const THREE = require('three');
const ClipGeometry = require('./ClipGeometry');

/**
 * Set of useful tools
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
let tools = {
    /**
     * Converts feet to cm
     * @param value Value in feet
     * @returns {number} Value in cm
     */
    ft2cm: (value) => {
        return value * 30.48;
    },
    /**
     * Converts inches to cm
     * @param value Value in inches
     * @returns {number} Value in cm
     */
    in2cm: (value)=> {
        return value * 2.54;
    },
    /**
     * Returns array with coefficients, used to build shed's roof.
     * @param width Width of the shed
     * @returns {Array} Array of proportion coefficients
     */
    relatives: (width)=> {
        let relatives;

        if (width >= tools.ft2cm(12)) {
            relatives = {w: 0.3051, h: 0.7312}
        } else if (width <= tools.ft2cm(8)) {
            relatives = {w: 0.3678, h: 0.7325}
        } else {
            relatives = {w: 0.3335, h: 0.7554}
        }

        return relatives;
    },
    /**
     * Specular value for painted materials
     */
    PAINT_MATERIAL: 1,
    URBAN_BARN: "Urban Barn",
    URBAN_SHACK: "Urban Shack",
    LEAN_TO: "Urban Lean-to",
    A_FRAME: "A Frame",
    DOUBLE_WIDE: "Double Wide",
    ECO: "Eco",
    CASTLE_MOUNTAIN: "Castle Mountain",
    QUAKER: "Quaker",
    MINI_BARN: "Mini Barn",
    HI_BARN: "Hi Barn",
    SINGLE_SLOPE:"Single Slope",
    bumpScale: 0.4,
    getAngleByRotation: (rotation)=> {
        if (!rotation) {
            return 0;
        }

        let array = rotation.toArray();
        while (array[1] > Math.PI) {
            array[1] -= Math.PI * 2;
        }

        if (array[0] != 0 || array[2] != 0) {
            if (array[1].toFixed(2) == '0.00') {
                return Math.PI;
            } else {
                if (array[1] > 0) {
                    return Math.PI * 0.75
                } else {
                    return -Math.PI * 0.75;
                }
            }
        }

        let angleMap = {};
        _.each([0, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.75, Math.PI, -Math.PI * 0.25, -Math.PI * 0.5, -Math.PI * 0.75], (value)=> {
            angleMap[value.toFixed(2)] = value;
        });

        let fixed = array[1].toFixed(2);
        if (typeof angleMap[fixed] !== 'undefined') {
            return angleMap[fixed];
        }
        return Math.PI;
    },
    cm2ft: (value)=> {
        value = Math.round(value * 100) / 100;
        let ret = "";
        let feet = Math.floor(value / 30.48);
        let inches = Math.floor(Math.round((value - feet * 30.48) * 100) / 100 / 2.54);
        let inches16 = Math.floor(Math.round((value - feet * 30.48 - inches * 2.54) * 100) / 100 / 16);
        if (inches16 == 16) {
            inches16 = 0;
            inches++;
        }
        if (inches == 12) {
            inches = 0;
            feet++;
        }

        if (feet) {
            ret = feet + "'";
        }
        if (inches) {
            ret += ' ' + inches + '"';
        }

        if (inches16) {
            ret += ' ' + inches16 + '/16"';
        }

        if (!feet && !inches && !inches16) {
            return '0"';
        }

        return ret;
    },
    isDeckID: (id) => {
        return ["8' x 4' deck", "10' x 4' deck", "12' x 4' deck", "wrap-around", "horse-stall"].indexOf(id) != -1;
    },
    planY: 6000,
    /**
     * Generates quarter-circle, defined by radius
     * @param radius Radius of the quarter-circle
     * @param color Color of the line
     * @returns {Line} Quarter-circle line
     */
    getCurve: (radius, color) => {
        let curve = new THREE.EllipseCurve(
            0, 0,             // x, Y
            radius, radius,            // xRadius, yRadius
            0, Math.PI * 0.5, // StartAngle, EndAngle
            false             // Clockwise
        );

        let points = curve.getSpacedPoints(16);
        let path = new THREE.Path();
        let geometry = path.createGeometry(points);
        geometry.computeLineDistances();

        let material = new THREE.LineDashedMaterial({
            dashSize: 5,
            gapSize: 3,
            color: color
        });

        let line = new THREE.Line(geometry, material);
        line.rotateX(Math.PI * 0.5);
        return line;
    },

    /**
     * Generates simple straight line, defined by length
     * @param length Length of the line
     * @param color Color of the line
     * @returns {Line} Generated line
     */
    getLine: (length, color = 0) => {
        let geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(-length * 0.5, 0, 0),
            new THREE.Vector3(length * 0.5, 0, 0)
        );

        let material = new THREE.LineBasicMaterial({
            color: color
        });

        return new THREE.Line(geometry, material);
    },

    /**
     * Generates the rectangle object, that consists of line meshes
     * @param boundingBox Bounding box (THREE.Box) of the mesh, for which the rectangle should be drawn
     * @param color Color of the lines
     * @returns {Object3D} Object that contains 4 line meshes, formed as rectangle
     */
    getRectangle: (boundingBox, color = 0) => {
        let box = new THREE.Object3D();
        let width = boundingBox.max.x - boundingBox.min.x;
        let depth = boundingBox.max.z - boundingBox.min.z;

        let left = tools.getLine(depth, color);
        left.position.x = boundingBox.min.x;
        left.position.z = (boundingBox.max.z + boundingBox.min.z) * 0.5;
        left.rotateY(Math.PI * 0.5);
        let right = left.clone();
        right.position.x = boundingBox.max.x;
        let top = tools.getLine(width, color);
        top.position.z = boundingBox.min.z;
        top.position.x = (boundingBox.max.x + boundingBox.min.x) * 0.5;
        let bottom = top.clone();
        bottom.position.z = boundingBox.max.z;

        box.add(bottom);
        box.add(left);
        box.add(top);
        box.add(right);

        return box;
    },
    findWall: (walls, x, z, angle) => {
        let closestWall = walls[0];
        let minDistance = 99999;

        let sameAngleWalls = _.filter(walls, (wall)=> {
            if (angle % Math.PI == 0 && wall.position.z != z) {
                return false
            } else if (Math.abs(angle) == Math.PI * 0.5 && wall.position.x != x) {
                return false;
            }
            return tools.getAngleByRotation(wall.rotation) == angle && wall.geometry instanceof ClipGeometry;
        });

        _.each(sameAngleWalls, (wall)=> {
            _.each(wall.geometry.clip.areas, (area)=> {
                let distance;
                if (angle % Math.PI == 0) {
                    distance = Math.abs(area.center - x);

                } else {
                    distance = Math.abs(area.center - z);
                }
                if (distance < minDistance) {
                    minDistance = distance;
                    closestWall = wall;
                }
            });
        });

        return closestWall;
    }
};

Object.defineProperties(tools, {
    PAINT_MATERIAL: {
        get: ()=> {
            return new THREE.MeshPhongMaterial({
                specular: 0x1c1c1c,
                shininess: 100,
                bumpScale: 0.4
            })
        }
    }
});

module.exports = tools;
