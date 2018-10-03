const THREE = require('three');
const tools = require('./../helpers/tools');
const assets = require('../helpers/assets');
const _ = require('lodash');
const TextureGenerator = require('./../helpers/TextureGenerator');

/**
 * Truss 3D object
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Truss extends THREE.Object3D {
    /**
     * Creates truss
     * @param shedWidth Shed's width
     * @param roofHeight Roof height
     * @param style Shed style name
     */
    constructor(shedWidth, roofHeight, style = tools.URBAN_BARN, isReversed = false, shedHeight) {
        super();
        const WALL_MAP_WIDTH = tools.ft2cm(4);

        let trussGeometry = new THREE.BufferGeometry();

        let relatives = tools.relatives(shedWidth);

        let styleMap = {};
        styleMap[tools.URBAN_BARN] = {
            vertices: [
                0, 0, 0,                                                //0
                -shedWidth * relatives.w, 0, 0,                         //1
                -shedWidth * 0.5 - 5, 0, 0,                             //2
                -shedWidth * relatives.w, roofHeight * relatives.h, 0,  //3
                0, roofHeight, 0,                                       //4
                shedWidth * relatives.w, roofHeight * relatives.h, 0,   //5
                shedWidth * 0.5 + 5, 0, 0,                              //6
                shedWidth * relatives.w, 0, 0                           //7
            ],
            indices: [
                0, 4, 3,
                0, 3, 1,
                1, 3, 2,
                7, 4, 0,
                7, 5, 4,
                6, 5, 7
            ],
            uvs: [
                0.5, 1,             //0
                0.1949, 1,          //1
                0, 1,               //2
                0.1949, 1 - 0.7312, //3
                0.5, 0,             //4
                0.8051, 1 - 0.7312, //5
                1, 1,               //6
                0.8051, 1           //7
            ]
        };

        styleMap[tools.URBAN_SHACK] = {
            vertices: [
                0, 0, 0,                    //0
                -shedWidth * 0.5 - 5, 0, 0, //1
                0, roofHeight, 0,           //2
                shedWidth * 0.5 + 5, 0, 0,  //3
            ],
            indices: [
                0, 2, 1,
                0, 3, 2
            ],
            uvs: [
                0.5, 1,//0
                0, 1,//1
                0.5, 0.5,//2
                1, 1,//3
            ]
        };

        const in4_5 = tools.in2cm(4.5);
        const in5_5 = tools.in2cm(5.5);
        const in2 = tools.in2cm(2);
        const aHeight = tools.in2cm(3.1875);

        styleMap[tools.A_FRAME] = {
            vertices: [
                0, 0, 0,                                            //0
                -shedWidth * 0.5, 0, 0,                             //1
                -(shedWidth + in4_5) * 0.5, 0, 0,                   //2
                -(shedWidth + in4_5) * 0.5, aHeight, 0,             //3
                0, roofHeight + aHeight, 0,                         //4
                (shedWidth + in4_5) * 0.5, aHeight, 0,              //5
                (shedWidth + in4_5) * 0.5, 0, 0,                    //6
                shedWidth * 0.5, 0, 0                               //7
            ],
            indices: [
                0, 4, 1,
                3, 1, 4,
                2, 1, 3,
                0, 7, 4,
                7, 5, 4,
                7, 6, 5
            ],
            uvs: [
                0.5, 1,                                         //0
                0, 1,                                           //1
                -in4_5 / shedWidth, 1,                          //2
                -in4_5 / shedWidth, 1 - aHeight / (roofHeight + aHeight) * 0.5,   //3
                0.5, 0,                                       //4
                1 + in4_5 / shedWidth, 1 - aHeight / (roofHeight + aHeight) * 0.5,//5
                1 + in4_5 / shedWidth, 1,                       //6
                1, 1                                            //7
            ]
        };

        styleMap[tools.DOUBLE_WIDE] = {
            vertices: [
                0, 0, 0,                                            //0
                -shedWidth * 0.5, 0, 0,                             //1
                -(shedWidth + in5_5) * 0.5, 0, 0,                   //2
                -(shedWidth + in5_5) * 0.5, aHeight, 0,             //3
                0, roofHeight + aHeight, 0,                         //4
                (shedWidth + in5_5) * 0.5, aHeight, 0,              //5
                (shedWidth + in5_5) * 0.5, 0, 0,                    //6
                shedWidth * 0.5, 0, 0                               //7
            ],
            indices: styleMap[tools.A_FRAME].indices,
            uvs: [
                0.5, 0,                                         //0
                0, 0,                                           //1
                -in5_5 / shedWidth, 0,                          //2
                -in5_5 / shedWidth, aHeight / (roofHeight + aHeight) * 0.5,   //3
                0.5, 0.5,                                       //4
                1 + in5_5 / shedWidth, aHeight / (roofHeight + aHeight) * 0.5,//5
                1 + in5_5 / shedWidth, 0,                       //6
                1, 0                                            //7
            ]
        };

        styleMap[tools.ECO] = {
            vertices: [
                0, 0, 0,                    //0
                -shedWidth * 0.5, 0, 0, //1
                0, roofHeight, 0,           //2
                shedWidth * 0.5, 0, 0,  //3
            ],
            indices: [
                0, 2, 1,
                0, 3, 2
            ],
            uvs: [
                0.5, 1,//0
                0, 1,//1
                0.5, 0.5,//2
                1, 1,//3
            ]
        };

        styleMap[tools.ECO] = {
            vertices: [
                0, 0, 0,                //0
                -shedWidth * 0.5, 0, 0, //1
                0, roofHeight, 0,       //2
                shedWidth * 0.5, 0, 0,  //3
            ],
            indices: [
                0, 2, 1,
                0, 3, 2
            ],
            uvs: [
                0.5, 1,     //0
                0, 1,       //1
                0.5, 0.5,   //2
                1, 1,       //3
            ]
        };

        const miniBarnParametersMap = {
            6: {x: 54.054, y: 9.043, h: 37.5, xm: 8.973, ym: 9.043},
            8: {x: 78, y: 13.049, h: 41.5, xm: 9, ym: 13.049},
            10: {x: 102.182, y: 17.095, h: 45.5, xm: 8.909, ym: 17.095},
            12: {x: 125.416, y: 20.982, h: 49.5, xm: 9.292, ym: 20.982}
        };

        let miniBarnParametrs = miniBarnParametersMap[12];
        if (style == tools.MINI_BARN) {
            try {
                _.forOwn(miniBarnParametersMap, (value, w)=> {
                    if (tools.ft2cm(w) >= shedWidth) {
                        miniBarnParametrs = value;
                        throw new Error();
                    }
                });
            } catch (e) {
            }
        }

        styleMap[tools.MINI_BARN] = {
            vertices: [
                -shedWidth * 0.5, -shedHeight, 0,                                                                   //0
                -shedWidth * 0.5 + tools.in2cm(miniBarnParametrs.xm), -shedHeight, 0,                               //1
                -shedWidth * 0.5, -tools.in2cm(miniBarnParametrs.h), 0,                                             //2
                -shedWidth * 0.5 + tools.in2cm(miniBarnParametrs.xm), -tools.in2cm(miniBarnParametrs.ym), 0,        //3
                shedWidth * 0.5, -shedHeight, 0,                                                                    //4
                shedWidth * 0.5 - tools.in2cm(miniBarnParametrs.xm), -shedHeight, 0,                                //5
                shedWidth * 0.5, -tools.in2cm(miniBarnParametrs.h), 0,                                              //6
                shedWidth * 0.5 - tools.in2cm(miniBarnParametrs.xm), -tools.in2cm(miniBarnParametrs.ym), 0,         //7
                -shedWidth * 0.5 + tools.in2cm(miniBarnParametrs.xm), -tools.in2cm(miniBarnParametrs.ym) - 0.2, 0,  //8
                0, 0, 0,                                                                                            //9
                shedWidth * 0.5 - tools.in2cm(miniBarnParametrs.xm), -tools.in2cm(miniBarnParametrs.ym) - 0.2, 0,   //10
            ],
            indices: [
                0, 3, 2,
                0, 1, 3,
                5, 6, 7,
                5, 4, 6,
                8, 10, 9
            ],
            uvs: [
                tools.in2cm(miniBarnParametrs.xm) / shedWidth, 0,   //0
                0, 0,                                               //1
                tools.in2cm(miniBarnParametrs.xm) / shedWidth, 1,   //2
                0, 1,                                               //3
                tools.in2cm(miniBarnParametrs.xm) / shedWidth, 0,   //4
                0, 0,                                               //5
                tools.in2cm(miniBarnParametrs.xm) / shedWidth, 1,   //6
                0, 1,                                               //7
                0, 0,                                               //8
                0.5, tools.in2cm(miniBarnParametrs.ym) / shedHeight,//9
                1, 0                                                //10
            ]
        };

        styleMap[tools.HI_BARN] = {
            vertices: [
                -shedWidth * 0.5, 0, 0,                                                                 //0
                -tools.in2cm(miniBarnParametrs.x) * 0.5, roofHeight - tools.in2cm(miniBarnParametrs.ym), 0,   //1
                0, roofHeight, 0,                                                                       //2
                tools.in2cm(miniBarnParametrs.x) * 0.5, roofHeight - tools.in2cm(miniBarnParametrs.ym), 0,    //3
                shedWidth * 0.5, 0, 0,                                                                  //4
            ], indices: [
                0, 3, 1,
                0, 4, 3,
                1, 3, 2
            ], uvs: [
                0, 1,//0
                (shedWidth * 0.5 - tools.in2cm(miniBarnParametrs.x) * .5) / shedWidth, 1 - (roofHeight - tools.in2cm(miniBarnParametrs.ym)) / shedHeight,//1
                0.5, 1 - roofHeight / shedHeight,//2
                1 - (shedWidth * 0.5 - tools.in2cm(miniBarnParametrs.x) * 0.5) / shedWidth, 1 - (roofHeight - tools.in2cm(miniBarnParametrs.ym)) / shedHeight,//3
                1, 1,//3
            ]
        };

        styleMap[tools.CASTLE_MOUNTAIN] = styleMap[tools.A_FRAME];

        styleMap[tools.LEAN_TO] = {vertices: [], indices: [], uvs: []};

        const tanQ = Math.tan(0.3228859);
        let quakerTopX = 0;
        if (style == tools.QUAKER) {
            quakerTopX = shedWidth * 0.5 - ((roofHeight - aHeight) / tanQ - in4_5);
        }

        styleMap[tools.QUAKER] = {
            vertices: [
                0, 0, 0,                                                        //0
                -shedWidth * 0.5, 0, 0,                                         //1
                -shedWidth * 0.5 - tools.ft2cm(1.5), tools.ft2cm(1), 0,         //2
                -shedWidth * 0.5 - tools.ft2cm(1.5), tools.in2cm(15.1875), 0,   //3
                quakerTopX, roofHeight, 0,                                      //4
                shedWidth * 0.5 + in4_5, aHeight, 0,                            //5
                shedWidth * 0.5 + in4_5, 0, 0,                                  //6
                shedWidth * 0.5, 0, 0                                           //7
            ],
            indices: [
                0, 4, 1,
                1, 4, 3,
                1, 3, 2,
                5, 7, 6,
                0, 7, 4,
                7, 5, 4
            ],
            uvs: [
                0.5, 1,                                                                 //0
                0, 1,                                                                   //1
                -tools.ft2cm(1.5) / shedWidth, 1 - tools.ft2cm(1) / roofHeight,         //2
                -tools.ft2cm(1.5) / shedWidth, 1 - tools.in2cm(15.1875) / roofHeight,   //3
                quakerTopX / shedWidth + 0.5, 0,                                        //4
                1 + in4_5 / shedWidth, 1 - aHeight / shedWidth,                         //5
                1 + in4_5 / shedWidth, 1,                                               //6
                1, 1,                                                                   //7
            ]
        };

        let slopeVector, slopeDistance, slopeVertex2 = new THREE.Vector3();
        if (style == tools.SINGLE_SLOPE) {
            slopeVector = new THREE.Vector3(-shedWidth * 0.5, shedWidth * 0.25, 0)
                .sub(new THREE.Vector3(shedWidth * 0.5, 0, 0))
                .normalize();
            slopeDistance = in4_5 / Math.cos(0.244979);
            slopeVertex2 = new THREE.Vector3(-shedWidth * 0.5, shedWidth * 0.25, 0)
                .add(slopeVector.clone().multiplyScalar(slopeDistance));
        }
        styleMap[tools.SINGLE_SLOPE] = {
            vertices: [
                -shedWidth * 0.5, 0, 0,                     //0
                -shedWidth * 0.5, shedWidth * 0.25, 0,      //1
                slopeVertex2.x, slopeVertex2.y, 0,          //2
                slopeVertex2.x, slopeVertex2.y + in4_5, 0,    //3
                shedWidth * 0.5 + in4_5, in4_5, 0,            //4
                shedWidth * 0.5 + in4_5, 0, 0,              //5
                shedWidth * 0.5, 0, 0,                      //6
            ], indices: [
                0, 6, 1,
                1, 3, 2,
                1, 4, 3,
                1, 6, 4,
                6, 5, 4
            ], uvs: [
                0, 1,                                                               //0
                0, 1 - shedWidth * 0.25 / shedHeight,                                   //1
                -slopeVertex2.x / shedWidth, 1 - slopeVertex2.y / shedHeight,           //2
                -slopeVertex2.x / shedWidth, 1 - (slopeVertex2.y + in4_5) / shedHeight,   //3
                1 + in4_5 / shedWidth, 1 - in4_5 / shedHeight,                            //4
                1 + in4_5 / shedWidth, 1,                                           //5
                1, 1                                                                //6
            ]
        };

        let vertices = styleMap[style].vertices;
        let indices = styleMap[style].indices;
        let uvs = styleMap[style].uvs;

        if (isReversed) {
            //swap indices
            for (let i = 0, n = indices.length; i < n; i++) {
                let tmp = indices[i * 3 + 1];
                indices[i * 3 + 1] = indices[i * 3 + 2];
                indices[i * 3 + 2] = tmp;
            }
        }

        let normals = _.times(vertices.length, (i)=> {
            if ((i + 1) % 3 == 0) {
                return isReversed ? -1 : 1;
            }

            return 0;
        });

        trussGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        trussGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
        trussGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        trussGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

        let truss = new THREE.Mesh(trussGeometry, tools.PAINT_MATERIAL);

        truss.castShadow = true;
        truss.receiveShadow = true;

        this.add(truss);

        Object.defineProperties(this, {
            vertices: {
                get: ()=> {
                    return vertices.slice();
                }
            },
            geometry: {
                get: ()=> {
                    return trussGeometry.clone();
                }
            }
        });

        /**
         * Sets the color of the truss
         * @param width Shed's width
         * @param color Color of the truss
         */
        this.setColor = (width, color)=> {
            let textureGenerator = new TextureGenerator();
            return new Promise((done)=> {
                textureGenerator.getWall(color).then((texture)=> {
                    let textureLoader = new THREE.TextureLoader();
                    let bump = textureLoader.load(assets.img.tiles_b, ()=> {
                        texture.wrapS = texture.wrapT =
                            bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

                        texture.repeat.x = texture.repeat.x = width / WALL_MAP_WIDTH;

                        truss.material.map = texture;
                        truss.material.bumpMap = bump;
                        truss.material.needsUpdate = true;
                        done();
                    });
                });
            });
        };
    }
}

module.exports = Truss;
