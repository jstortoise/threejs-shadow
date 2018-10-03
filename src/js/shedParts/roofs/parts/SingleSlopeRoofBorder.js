const THREE = require('three');
const _ = require('lodash');
const TextureGenerator = require('./../../../helpers/TextureGenerator');
const tools = require('./../../../helpers/tools');
const assets = require('./../../../helpers/assets');

/**
 * Roof Border 3D object for Single SLope style. The object that places under the roof
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2018
 */
class SingleSlopeRoofBorder extends THREE.Object3D {
    /**
     * Creates roof border
     * @param roofVertices Roof's geometry vertices
     * @param shedWidth Width of the shed
     * @param shedDepth Depth of the shed
     * @param isReversed Shows if the border is reversed
     */
    constructor(roofVertices, shedWidth, shedDepth, isReversed = false) {
        super();

        let aWidth = tools.in2cm(4.5), aHeight = aWidth;
        let rbVertices = isReversed ? roofVertices.slice(0, 6) : roofVertices.slice(6);
        let rbVertices2 = _.map(rbVertices, (vertex, i)=> {
            if (i % 3 == 1) {
                return vertex - aHeight;
            }

            return vertex;
        });
        let rbVertices3 = _.map(rbVertices2, (vertex, i)=> {
            if (i % 3 == 2) {
                return vertex + (isReversed ? -1 : 1) * 5;
            }

            return vertex;
        });

        rbVertices = rbVertices.concat(rbVertices2).concat(rbVertices2).concat(rbVertices3);

        let rbIndices = [
            0, 2, 3,
            0, 3, 1,
            4, 6, 5,
            6, 7, 5
        ];

        let uvs = [
            0, 0,    //0
            0, 1,    //1
            1, 0,    //2
            1, 1,    //3
            1, 0,    //4
            1, 1,    //5
            0, 0,    //6
            0, 1,    //7
        ];


        uvs = _.map(uvs, (uv, idx)=> {
            if (idx % 2 == 1) {
                return uv * 25;
            }
            return uv * 0.5;
        });

        let normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
        ];

        let rbGeometry = new THREE.BufferGeometry();
        rbGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(rbVertices), 3));
        rbGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
        rbGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        rbGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(rbIndices), 1));

        let rb = new THREE.Mesh(rbGeometry, tools.PAINT_MATERIAL);
        this.add(rb);

        let quadVertices = [
            rbVertices[0], rbVertices[1], rbVertices[2],//0
            rbVertices[3], rbVertices[4], rbVertices[5],//1
            rbVertices[6], rbVertices[7], rbVertices[8],//2
            rbVertices[9], rbVertices[10], rbVertices[11],//3
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

        const in4_5 = tools.in2cm(4.5);
        let slopeVector = new THREE.Vector3(-shedWidth * 0.5, shedWidth * 0.25, 0)
            .sub(new THREE.Vector3(shedWidth * 0.5, 0, 0))
            .normalize();
        let slopeDistance = in4_5 / Math.cos(0.244979);
        let slopeVertex2 = new THREE.Vector3(-shedWidth * 0.5, shedWidth * 0.25, 0)
            .add(slopeVector.clone().multiplyScalar(slopeDistance));

        let dashVertices = [
            -shedWidth * 0.5, shedWidth * 0.25, (isReversed ? 1 : -1) * shedDepth * 0.5,      //0
            slopeVertex2.x, slopeVertex2.y, (isReversed ? 1 : -1) * shedDepth * 0.5,          //1
            slopeVertex2.x, slopeVertex2.y, (isReversed ? 1 : -1) * shedDepth * 0.5,          //2
            slopeVertex2.x, slopeVertex2.y + in4_5, (isReversed ? 1 : -1) * shedDepth * 0.5,    //3
            shedWidth * 0.5 + in4_5, in4_5, (isReversed ? 1 : -1) * shedDepth * 0.5,            //4
            shedWidth * 0.5 + in4_5, 0, (isReversed ? 1 : -1) * shedDepth * 0.5,              //5
            shedWidth * 0.5 + in4_5, 0, (isReversed ? 1 : -1) * shedDepth * 0.5,              //6
            shedWidth * 0.5, 0, (isReversed ? 1 : -1) * shedDepth * 0.5,                      //7
        ];

        dashVertices = dashVertices.concat(_.map(dashVertices, (vertex, i)=> {
            if (i % 3 == 2) {
                return 0;
            }
            return vertex;
        }));

        let dashIndices = [
            0, 8, 9,
            0, 9, 1,
            7, 6, 15,
            6, 14, 15
        ];

        if (isReversed) {
            for (let i = 0, n = dashIndices.length; i < n; i += 3) {
                let tmp = dashIndices[i + 1];
                dashIndices[i + 1] = dashIndices[i + 2];
                dashIndices[i + 2] = tmp;
            }
        }

        let dashUVs = _.map([
            1, 0,//0
            0, 0,//1
            0, 0,//2
            1, 0,//3
            0, 0,//4
            1, 0,//5
            1, 0,//6
            0, 0,//7
        ]);

        dashUVs = dashUVs.concat(_.map(dashUVs, (uv, i)=> {
            if (i % 2 == 1) {
                return 1;
            }
            return uv;
        }));

        let dashNormals = [
            0, -1, 0,//0
            0, -1, 0,//1
            -1, 0, 0,//2
            -1, 0, 0,//3
            1, 0, 0,//4
            1, 0, 0,//5
            0, -1, 0,//6
            0, -1, 0,//7
        ];
        dashNormals = dashNormals.concat(dashNormals);

        let dashGeometry = new THREE.BufferGeometry();
        dashGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(dashVertices), 3));
        dashGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(dashNormals), 3));
        dashGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(dashUVs), 2));
        dashGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(dashIndices), 1));

        let dash = new THREE.Mesh(dashGeometry, tools.PAINT_MATERIAL);
        dash.receiveShadow = dash.castShadow = true;
        this.add(dash);

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

module.exports = SingleSlopeRoofBorder;
