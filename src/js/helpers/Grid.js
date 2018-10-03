const THREE = require('three');
const _ = require('lodash');

/**
 * 3D grid, used for drag-n-drop options (doors and windows)
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Grid extends THREE.Object3D {
    /**
     * Generated grid rectangle
     * @param width Width of the grid rectange
     * @param height Height of the grid rectangle
     * @param step The size of the cell
     */
    constructor(width, height, step) {
        super();

        let self = this;

        let material = new THREE.LineBasicMaterial({
            color: 0x04c4f9//2f73fd,
        });

        width = width - width % step;
        height = height - height % step;

        Object.defineProperties(this, {
            color: {
                get: ()=> {
                    return material.color;
                },
                set: (color)=> {
                    material.color = color;
                    material.needsUpdate = true;
                }
            }
        })

        /**
         * Generates array of lines. Called two times, rotated 90 degrees for the second will give you the grid
         * @param width Width of the half grid
         * @param height Height of the half grid
         * @returns {Array.<*>} Array of lines
         */
        function generateHalfGrid(width, height) {
            let count = Math.ceil(width / step / 2) - 1;
            let hCount = Math.ceil(height / step / 2) * 2 - 2;
            let min = -hCount * step / 2;
            let max = -min;

            let left = _.times(count + 1, (idx)=> {
                let geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(step * idx, min, 0),
                    new THREE.Vector3(step * idx, max, 0)
                );

                return new THREE.Line(geometry, material);
            });

            let right = _.times(count + 1, (idx)=> {
                let geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(-step * idx, min, 0),
                    new THREE.Vector3(-step * idx, max, 0)
                );

                return new THREE.Line(geometry, material);
            });

            return left.concat(right);
        }

        let verticalLines = generateHalfGrid(width, height);
        let horizontalLines = generateHalfGrid(height, width);

        horizontalLines.forEach((line)=> {
            line.rotateZ(Math.PI / 2);
        });

        verticalLines.concat(horizontalLines).forEach((line)=> {
            self.add(line);
        });
    }
}

module.exports = Grid;
