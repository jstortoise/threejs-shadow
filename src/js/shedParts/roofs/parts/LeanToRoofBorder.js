const THREE = require('three');
const _ = require('lodash');
const TextureGenerator = require('./../../../helpers/TextureGenerator');
const tools = require('./../../../helpers/tools');

/**
 * Roof Border 3D object for Urban Shack style. The object that places under the roof
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class LeanToRoofBorder extends THREE.Object3D {
    /**
     * Creates roof border
     * @param roofVertices Roof's geometry vertices
     */
    constructor(roofVertices) {
        super();

        let borderVertices = roofVertices.slice();
        let bVertices2 = _.map(roofVertices, (vertex, i)=> {
            if ((i + 1) % 3 == 2) {
                return vertex - 14.1421;
            }

            return vertex;
        });

        const iSQRT2 = 1 / Math.sqrt(2)
        let bVertices3 = _.map(bVertices2, (vertex, i)=> {
            if ((i + 1) % 3 == 0 || (i + 1) % 3 == 1) {

                if (vertex > 0) {
                    return vertex - 7 * iSQRT2;
                } else {
                    return vertex + 7 * iSQRT2;
                }
            }

            return vertex;
        });

        borderVertices = borderVertices.concat(bVertices2).concat(bVertices3);

        let borderIndices = [
            0, 4, 1,
            4, 5, 1,
            1, 5, 2,
            5, 6, 2,
            3, 2, 7,
            7, 2, 6,
            0, 3, 4,
            4, 3, 7,
            4, 8, 5,
            8, 9, 5,
            9, 10, 5,
            5, 10, 6,
            7, 6, 10,
            7, 10, 11,
            4, 7, 11,
            4, 11, 8
        ];

        let borderGeometry = new THREE.BufferGeometry();
        borderGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(borderVertices), 3));
        //borderGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        borderGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(borderIndices), 1));
        borderGeometry.computeVertexNormals();

        let border = new THREE.Mesh(borderGeometry, tools.PAINT_MATERIAL);
        border.material.side=THREE.DoubleSide;
        border.material.shading=THREE.FlatShading;
        this.add(border);

        /**
         * Sets the color of the roof border. Generates wooden texture with the right color
         * @param mainColor Main color of the shed
         * @param secondaryColor Secondary color of the shed
         */
        this.setColor = (mainColor, secondaryColor)=> {
            let textureGenerator = new TextureGenerator();
            return Promise.all([
                textureGenerator.getWood(secondaryColor),
                textureGenerator.getWoodBump()
            ]).then((results)=> {
                let texture = results[0];
                let bump = results[1];
                border.material.map = texture;
                border.material.bumpMap = bump;
                texture.wrapS = texture.wrapT =
                    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = 25;
                bump.repeat.x = 25;
                border.material.needsUpdate = true;
            });
        }
    }
}

module.exports = LeanToRoofBorder;
