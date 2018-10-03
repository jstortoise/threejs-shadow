const THREE = require('three');
const _ = require('lodash');
const TextureGenerator = require('./../../../helpers/TextureGenerator');
const tools = require('./../../../helpers/tools');
const assets = require('./../../../helpers/assets');

/**
 * Roof Border 3D object for A-Frame and Double Wide style. The object that places under the roof
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2018
 */
class QuakerBorder extends THREE.Object3D {
    /**
     * Creates roof border
     * @param roofVertices Roof's geometry vertices
     * @param aWidth Width of the A-roof specific element
     * @param shedWidth Width of the shed
     * @param shedDepth Depth of the shed
     * @param roofHeight Height of the shed's roof
     * @param aHeight Height A-roof specific element
     * @param isReversed SHows if the border should be reversed along z axis. Used to mirror the border
     */
    constructor(roofVertices, shedWidth, shedDepth, roofHeight, isReversed = false) {
        super();

        const WALL_MAP_WIDTH = tools.ft2cm(4);
        let aWidth = tools.in2cm(4.5), aHeight = tools.in2cm(3.1875);

        let rbVertices = isReversed ? roofVertices.slice(9) : roofVertices.slice(0, 9);
        let rbVertices2 = buildRoofShift(rbVertices, aHeight, false);
        let rbVertices3 = _.map(rbVertices2, (vertex, i)=> {
            if ((i + 1) % 3 == 0) {
                return vertex - (isReversed ? -1 : 1) * 3.5;
            }

            return vertex;
        });

        rbVertices = rbVertices.concat(rbVertices2).concat(rbVertices2).concat(rbVertices3);

        let rbIndices = [
            0, 3, 1,
            3, 4, 1,
            1, 4, 2,
            4, 5, 2,
            6, 10, 7,
            6, 9, 10,
            7, 10, 8,
            10, 11, 8
        ];

        if (isReversed) {
            reverseIndices(rbIndices);
        }

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
            0, 6, 2,
            0, 4, 6,
            1, 3, 5,
            5, 3, 7
        ];
        if (isReversed) {
            reverseIndices(quadIndices);
        }
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
        quadUVs = _.map(quadUVs, (uv, i)=> {
            if (i % 2 == 1) {
                return uv * 25;
            }
            return uv*0.5;
        });
        let quadNormals = _.times(24/*8*3*/, (i) => {
            if (i % 3 == 0) {

                return 1;
            }
            return 0;
        });

        let quadsGeometry = new THREE.BufferGeometry();
        quadsGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(quadVertices), 3));
        quadsGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(quadNormals), 3));
        quadsGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(quadUVs), 2));
        quadsGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(quadIndices), 1));

        let quads = new THREE.Mesh(quadsGeometry, tools.PAINT_MATERIAL);
        this.add(quads);

        const in4_5 = tools.in2cm(4.5);
        const diagonal = new THREE.Vector3(-shedWidth * 0.5 - tools.ft2cm(1.5), tools.ft2cm(1), shedDepth * 0.5)
            .sub(new THREE.Vector3(-shedWidth * 0.5, 0, shedDepth * 0.5)).length();
        let dashParameters = {
            vertices: [
                -shedWidth * 0.5 - tools.ft2cm(1.5), tools.in2cm(15.1875), shedDepth * 0.5,   //0
                -shedWidth * 0.5 - tools.ft2cm(1.5), tools.ft2cm(1), shedDepth * 0.5,         //1
                -shedWidth * 0.5 - tools.ft2cm(1.5), tools.ft2cm(1), shedDepth * 0.5,         //2
                -shedWidth * 0.5, 0, shedDepth * 0.5,                                         //3
                shedWidth * 0.5, 0, shedDepth * 0.5,                                          //4
                shedWidth * 0.5 + in4_5, 0, shedDepth * 0.5,                                  //5
                shedWidth * 0.5 + in4_5, 0, shedDepth * 0.5,                                  //6
                shedWidth * 0.5 + in4_5, aHeight, shedDepth * 0.5                             //7
            ],
            indices: [
                //0, 8, 1,
                //8, 9, 1,
                2, 10, 3,
                3, 10, 11,
                4, 12, 5,
                5, 12, 13,
                //6, 15, 7,
                //6, 14, 15
            ],
            uvs: [
                0, tools.in2cm(3.1875) / WALL_MAP_WIDTH,    //0
                0, 0,                                       //1
                0, diagonal / WALL_MAP_WIDTH,               //2
                0, 0,                                       //3
                0, 0,                                       //4
                0, in4_5 / WALL_MAP_WIDTH,                  //5
                0, 0,                                       //6
                0, tools.in2cm(3.1875) / WALL_MAP_WIDTH     //7
            ]
        };

        if (isReversed) {
            for (let i = 2; i < 8 * 3; i += 3) {
                dashParameters.vertices[i] *= -1;
            }

            reverseIndices(dashParameters.indices);
        }

        dashParameters.vertices = dashParameters.vertices.concat(_.map(dashParameters.vertices, (vertex, i)=> {
            if (i % 3 == 2) {
                return 0;
            }
            return vertex;
        }));
        dashParameters.uvs = dashParameters.uvs.concat(_.map(dashParameters.uvs, (uv, i)=> {
            if (i % 2 == 0) {
                return 1;
            }
            return uv;
        }));

        let dashGeometry = new THREE.BufferGeometry();
        dashGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(dashParameters.vertices), 3));
        dashGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(dashParameters.uvs), 2));
        dashGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(dashParameters.indices), 1));
        dashGeometry.computeVertexNormals();
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

        function reverseIndices(indices) {
            let tmp;
            for (let i = 0, n = indices.length; i < n; i += 3) {
                tmp = indices[i + 1];
                indices[i + 1] = indices[i + 2];
                indices[i + 2] = tmp;
            }
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
                quads.material.map = borderTexture;
                quads.material.bumpMap = borderBump;
                rb.material.map = borderTexture;
                rb.material.bumpMap = borderBump;

                wallTexture.wrapS = wallTexture.wrapT =
                    wallBump.wrapS = wallBump.wrapT =
                        borderTexture.wrapS = borderTexture.wrapT =
                            borderBump.wrapS = borderBump.wrapT = THREE.RepeatWrapping;

                wallTexture.repeat.x =
                    wallBump.repeat.x = shedDepth / WALL_MAP_WIDTH * 0.5;
                dash.material.map = wallTexture;
                dash.material.bumpMap = wallBump;

                rb.material.needsUpdate = true;
                quads.material.needsUpdate = true;
                dash.material.needsUpdate = true;
            });
        }
    }
}

module.exports = QuakerBorder;
