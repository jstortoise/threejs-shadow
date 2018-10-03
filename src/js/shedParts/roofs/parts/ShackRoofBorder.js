const THREE = require('three');
const _ = require('lodash');
const TextureGenerator = require('./../../../helpers/TextureGenerator');
const tools = require('./../../../helpers/tools');

/**
 * Roof Border 3D object for Urban Shack style. The object that places under the roof
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class ShackRoofBorder extends THREE.Object3D {
    /**
     * Creates roof border
     * @param roofVertices Roof's geometry vertices
     */
    constructor(roofVertices) {
        super();

        let bRoofGeometry = new THREE.BufferGeometry();

        let bRoofVertices1 = _.times(9, (i)=> {
            if ((i + 1) % 3 == 0) {
                return roofVertices[i] - 2;
            }
            return roofVertices[i];
        });

        let bRoofVertices2 = buildRoofShift(roofVertices, 7);

        let bRoofVertices3 = _.map(bRoofVertices2, (value, idx)=> {
            if ((idx + 1) % 3 == 0) {
                return value - 7;
            }

            return value;
        });

        let bRoofVertices4 = _.map(bRoofVertices1, (value, idx)=> {
            if ((idx + 1) % 3 == 0) {
                return -value;
            }

            return value;
        });

        let bRoofVertices = bRoofVertices1.concat(bRoofVertices2).concat(bRoofVertices3).concat(bRoofVertices4);

        let bRoofIndexes = [
            0, 3, 1,
            3, 4, 1,
            4, 2, 1,
            4, 5, 2,
            3, 6, 7,
            3, 7, 4,
            4, 7, 8,
            4, 8, 5,
            9, 10, 6,
            10, 7, 6,
            7, 10, 11,
            7, 11, 8
        ];

        bRoofGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(bRoofVertices), 3));
        bRoofGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(bRoofIndexes), 1));
        bRoofGeometry.computeVertexNormals();

        let roofPlane = new THREE.Mesh(bRoofGeometry, new THREE.MeshPhongMaterial());
        roofPlane.castShadow = true;
        this.add(roofPlane);

        let rbVertices = roofVertices.slice(9);
        let rbVertices2 = buildRoofShift(rbVertices, 7, false);
        let rbVertices3 = _.map(rbVertices2, (vertex, i)=> {
            if ((i + 1) % 3 == 0) {
                return vertex + 3.5;
            }

            return vertex;
        });

        rbVertices = rbVertices.concat(rbVertices2).concat(rbVertices2).concat(rbVertices3);

        let rbIndices = [
            0, 1, 3,
            3, 1, 4,
            1, 2, 4,
            4, 2, 5,
            6, 7, 10,
            6, 10, 9,
            7, 8, 10,
            10, 8, 11
        ];

        let uvs = [
            0, 1,    //0
            0, 0,    //1
            0, 1,    //2
            1, 1,    //3
            1, 0,    //4
            1, 1,    //5
            0, 1,    //6
            0, 0,    //7
            0, 1,    //8
            1, 1,    //9
            1, 0,    //10
            1, 1,    //11
        ];

        uvs = _.map(uvs, (uv, idx)=> {
            if (idx % 2 == 1) {
                return uv * 25;
            }
            return uv * 0.5;
        });

        let rbGeometry = new THREE.BufferGeometry();
        rbGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(rbVertices), 3));
        rbGeometry.computeVertexNormals();
        rbGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        rbGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(rbIndices), 1));

        let rb = new THREE.Mesh(rbGeometry, tools.PAINT_MATERIAL);
        //rb1.castShadow = true;
        this.add(rb);

        //building side border
        let sideBorderHeight = 7;
        let sbVertices = [
            roofVertices[0], roofVertices[1], roofVertices[2],      //0
            roofVertices[6], roofVertices[7], roofVertices[8],      //1
            roofVertices[9], roofVertices[10], roofVertices[11],    //2
            roofVertices[15], roofVertices[16], roofVertices[17],   //3
        ];

        sbVertices = sbVertices.concat(_.map(sbVertices, (vertex, i)=> {
            if ((i + 1) % 2 == 0) {
                return vertex - sideBorderHeight;
            }

            return vertex;
        }));

        let sbNormals = [
            -1, 0, 0,   //0
            1, 0, 0,   //1
            -1, 0, 0,   //2
            1, 0, 0,   //3
            -1, 0, 0,   //4
            1, 0, 0,   //5
            -1, 0, 0,   //6
            1, 0, 0,   //7
        ];

        let sbIndices = [
            0, 6, 4,
            0, 2, 6,
            1, 5, 7,
            1, 7, 3
        ];

        let sbuvs = [
            0, 0,   //0
            0, 0,   //1
            0, 1,   //2
            0, 1,   //3
            1, 0,   //4
            1, 0,   //5
            1, 1,   //6
            1, 1,   //7
        ];

        sbuvs = _.map(sbuvs, (uv, idx)=> {
            if (idx % 2 == 1) {
                return uv * 25;
            }
            return uv * 0.5;
        });

        let sbGeometry = new THREE.BufferGeometry();
        sbGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(sbVertices), 3));
        sbGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(sbNormals), 3));
        sbGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(sbuvs), 2));
        sbGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(sbIndices), 1));

        console.log(sbGeometry)

        let sb = new THREE.Mesh(sbGeometry, tools.PAINT_MATERIAL);
        this.add(sb);

        /**
         * Shift the roof along the shed's height
         * @param srcVertices original vertices positions
         * @param difference The distance on which it will be shifted
         * @param horizontalEnding shows if the endings should be vertical or horizontal
         * @returns {Array} New vertex positions
         */
        function buildRoofShift(srcVertices, difference, horizontalEnding = true) {
            let dstVertices = [];
            dstVertices[0] = srcVertices[0] + (horizontalEnding ? (difference * Math.sqrt(2)) : 0);
            dstVertices[1] = srcVertices[1] - (!horizontalEnding ? (difference) : 0);
            dstVertices[2] = srcVertices[2];

            let vertex0 = new THREE.Vector3(srcVertices[0], srcVertices[1], srcVertices[2]);
            let vertex1 = new THREE.Vector3(srcVertices[3], srcVertices[4], srcVertices[5]);
            let vertex2 = new THREE.Vector3(srcVertices[6], srcVertices[7], srcVertices[8]);

            let vector1 = vertex1.clone().sub(vertex0).applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI * 0.5);
            let vector2 = vertex2.clone().sub(vertex1).applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI * 0.5);

            let vector = vector1.clone().add(vector2);
            vector.normalize().multiplyScalar(difference);

            let newPoint = vertex1.clone().add(vector);

            dstVertices[3] = newPoint.x;
            dstVertices[4] = newPoint.y;
            dstVertices[5] = newPoint.z;

            dstVertices[6] = srcVertices[6] - (horizontalEnding ? (difference * Math.sqrt(2)) : 0);
            dstVertices[7] = srcVertices[7] - (!horizontalEnding ? (difference) : 0);
            dstVertices[8] = srcVertices[8];

            return dstVertices;
        }

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
                roofPlane.material.color = new THREE.Color(mainColor);
                roofPlane.material.needsUpdate = true;

                let texture = results[0];
                let bump = results[1];
                sb.material.map = rb.material.map = texture;
                sb.material.bumpMap = rb.material.bumpMap = bump;
                texture.wrapS = texture.wrapT =
                    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
                rb.material.needsUpdate = true;
                sb.material.needsUpdate = true;
            });
        }
    }
}

module.exports = ShackRoofBorder;
