const THREE = require('three');
const _ = require('lodash');
const TextureGenerator = require('./../../../helpers/TextureGenerator');
const tools = require('./../../../helpers/tools');
const assets = require('./../../../helpers/assets');

/**
 * Roof Border 3D object for A-Frame and Double Wide style. The object that places under the roof
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2018
 */
class ARoofBorder extends THREE.Object3D {
    /**
     * Creates roof border
     * @param roofVertices Roof's geometry vertices
     * @param aWidth Width of the A-roof specific element
     * @param shedWidth Width of the shed
     * @param shedDepth Depth of the shed
     * @param roofHeight Height of the shed's roof
     * @param aHeight Height A-roof specific element
     */
    constructor(roofVertices, shedWidth, shedDepth, roofHeight, aWidth = tools.in2cm(4.5), aHeight = tools.in2cm(3.1875)) {
        super();

        let rbVertices = roofVertices.slice(9);
        let rbVertices2 = buildRoofShift(rbVertices, aHeight, false);
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
        this.add(rb);

        let quadVertices = [
            rbVertices[0], rbVertices[1], rbVertices[2],//0
            rbVertices[6], rbVertices[7], rbVertices[8],//1
            rbVertices[9], rbVertices[10], rbVertices[11],//2
            rbVertices[15], rbVertices[16], rbVertices[17],//3
        ];

        quadVertices = quadVertices.concat(_.map(quadVertices, (vertex, i)=> {
            if (i % 3 == 2) {
                return 0;
            }
            return vertex;
        }));
        let quadIndices = [
            0, 2, 6,
            0, 6, 4,
            1, 5, 3,
            5, 7, 3
        ];
        let quadUVs = [
            0, 1,//0
            0, 0,//1
            1, 1,//2
            1, 0,//3
            0, 0,//4
            0, 1,//5
            1, 0,//6
            1, 1,//7
        ];
        let quadNormals = _.times(24/*8*3*/, (i) => {
            if (i % 3 == 0) {
                if (i / 3 % 2 == 0) {
                    return -1;
                }

                return 1;
            }
            return 0;
        });

        quadUVs = _.map(quadUVs, (uv, i)=> {
            if (i % 2 == 1) {
                return uv * 25;
            }
            return uv;
        });

        let quadsGeometry = new THREE.BufferGeometry();
        quadsGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(quadVertices), 3));
        quadsGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(quadNormals), 3));
        quadsGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(quadUVs), 2));
        quadsGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(quadIndices), 1));

        let quads = new THREE.Mesh(quadsGeometry, tools.PAINT_MATERIAL);
        this.add(quads);

        let dashVertices = [
            roofVertices[0] + aWidth, roofVertices[1] - aHeight, roofVertices[2] - 5,    //0
            roofVertices[6] - aWidth, roofVertices[7] - aHeight, roofVertices[8] - 5,    //1
            roofVertices[9] + aWidth, roofVertices[10] - aHeight, 0,    //2
            roofVertices[15] - aWidth, roofVertices[16] - aHeight, 0,    //3
            roofVertices[0], roofVertices[1] - aHeight, roofVertices[2] - 5,    //4
            roofVertices[6], roofVertices[7] - aHeight, roofVertices[8] - 5,    //5
            roofVertices[9], roofVertices[10] - aHeight, 0,    //6
            roofVertices[15], roofVertices[16] - aHeight, 0    //7
        ];
        let dashIndices = [
            4, 6, 0,
            0, 6, 2,
            1, 3, 7,
            1, 7, 5
        ];
        let dashUVs = _.map([
            1, 1,   //0
            1, 0,   //1
            0, 1,   //2
            0, 0,   //3
            1, 0,   //4
            1, 1,   //5
            0, 0,   //6
            0, 1    //7
        ]);
        let dashNormals = _.times(dashVertices.length, (i) => {
            if (i % 3 == 1) {
                return -1;
            }

            return 0;
        });

        let dashGeometry = new THREE.BufferGeometry();
        dashGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(dashVertices), 3));
        dashGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(dashNormals), 3));
        dashGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(dashUVs), 2));
        dashGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(dashIndices), 1));

        let dash = new THREE.Mesh(dashGeometry, tools.PAINT_MATERIAL);
        this.add(dash);

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
            let textureLoader = new THREE.TextureLoader();
            let wallBumpPromise = new Promise((done)=> {
                let result = textureLoader.load(assets.img.tiles_b, ()=> {
                    done(result);
                })
            });

            return Promise.all([
                textureGenerator.getWall(mainColor),
                wallBumpPromise,
                textureGenerator.getWood(secondaryColor),
                textureGenerator.getWoodBump()
            ]).then(([wallTexture, wallBump, borderTexture, borderBump])=> {
                dash.material.map = wallTexture;
                dash.material.bumpMap = wallBump;

                quads.material.map = borderTexture;
                quads.material.bumpMap = borderBump;
                rb.material.map = borderTexture;
                rb.material.bumpMap = borderBump;

                wallTexture.wrapS = wallTexture.wrapT =
                    wallBump.wrapS = wallBump.wrapT =
                        borderTexture.wrapS = borderTexture.wrapT =
                            borderBump.wrapS = borderBump.wrapT = THREE.RepeatWrapping;

                wallTexture.repeat.x =
                    wallBump.repeat.x = 0.2;
                rb.material.needsUpdate = true;
                quads.material.needsUpdate = true;
                dash.material.needsUpdate = true;
            });
        }
    }
}

module.exports = ARoofBorder;
