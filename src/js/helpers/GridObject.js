const THREE = require('three');
const Grid = require('./Grid');
const _ = require('lodash');
const ClipGeometry = require('./ClipGeometry');
const tools = require('./tools');

/**
 * Builds the grid against the walls
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class GridObject extends THREE.Object3D {
    /**
     * Creates the grid
     * @param step Grid step, @see Grid constructor definition.
     * @param walls Array of wall meshes to build grid plane near each.
     * @param usePositionY If set to true - uses the position of the object. @default - true
     */
    constructor(step, walls, usePositionY = true) {
        super();

        let container = new THREE.Object3D();

        let areas = [];
        _.each(walls, (wall)=> {
            if (!wall) {
                return;
            }
            if (wall.geometry instanceof ClipGeometry) {
                let clipAreas = _.map(wall.geometry.clip.areas, (area)=> {
                    let position = wall.position.clone();
                    let angle = tools.getAngleByRotation(wall.rotation);
                    if (angle >= Math.PI * 0.5) {
                        area.center *= -1;
                    }
                    return _.extend(area, {rotation: wall.rotation, position: position});
                });
                areas = areas.concat(clipAreas);
            } else {
                wall.geometry.computeBoundingBox();
                let bbox = wall.geometry.boundingBox;
                let width = bbox.max.x - bbox.min.x;
                let height = bbox.max.y - bbox.min.y;

                areas.push({
                    width: width,
                    height: height,
                    center: (bbox.max.x + bbox.min.x) * 0.5,
                    rotation: wall.rotation,
                    position: wall.position
                });
            }
        });

        _.each(areas, (area)=> {
            let width = area.width;
            let height = area.height;

            if (width == 0) {
                return;
            }

            let grid = new Grid(width, height, step);

            let angle = tools.getAngleByRotation(area.rotation);
            let shift = {
                x: area.position.x + (area.position.x > 0 ? 1 : -1),
                z: area.position.z + (area.position.z > 0 ? 1 : -1)
            };
            if (Math.abs(angle) == Math.PI * 0.5) {
                shift.z += area.center;
            }
            if (angle % Math.PI == 0) {
                shift.x += area.center;
            }

            grid.position.setX(shift.x);
            if (usePositionY) {
                grid.position.setY(area.position.y);
            }
            grid.position.setZ(shift.z);
            grid.rotation.fromArray(area.rotation.toArray());

            container.add(grid);
        });

        this.add(container);
    }
}

module.exports = GridObject;
