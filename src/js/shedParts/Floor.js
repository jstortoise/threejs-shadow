const THREE = require('three');
const tools = require('./../helpers/tools');
const assets = require('../helpers/assets');
const _ = require('lodash');
const ClipGeometry = require('./../helpers/ClipGeometry');

/**
 * SHed's floor 3D object
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Floor extends THREE.Object3D {
    /**
     * Generates the floor for the shed
     * @param shedWidth Width of the shed
     * @param shedDepth Depth of the shed
     * @param style Shed style name
     */
    constructor(shedWidth, shedDepth, style = tools.URBAN_BARN) {
        super();

        const WALL_MAP_WIDTH = tools.ft2cm(5);
        const WALL_MAP_DEPTH = WALL_MAP_WIDTH;

        let textureLoader = new THREE.TextureLoader();

        let boxTexture = textureLoader.load(assets.img.just_wood);
        boxTexture.wrapS = boxTexture.wrapT = THREE.RepeatWrapping;
        boxTexture.repeat.x = shedWidth / WALL_MAP_WIDTH;

        let box = new THREE.Object3D();
        let boxMaterial = new THREE.MeshPhongMaterial({
            map: boxTexture
        });

        let front = new THREE.Mesh(new THREE.PlaneGeometry(shedWidth - 2, tools.in2cm(5.5)), boxMaterial);
        let back = new THREE.Mesh(new THREE.PlaneGeometry(shedWidth - 2, tools.in2cm(5.5)), boxMaterial);
        let left = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(shedDepth - 2, tools.in2cm(5.5))), boxMaterial);
        let right = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(shedDepth - 2, tools.in2cm(5.5))), boxMaterial);

        front.position.setZ(shedDepth * 0.5 - 1);
        back.position.setZ(-shedDepth * 0.5 + 1);
        left.position.setX(shedWidth * 0.5 - 1);
        right.position.setX(-shedWidth * 0.5 + 1);

        back.rotation.fromArray([0, Math.PI, 0]);
        left.rotation.fromArray([0, Math.PI * 0.5, 0]);
        right.rotation.fromArray([0, -Math.PI * 0.5, 0]);

        box.add(front);
        box.add(back);
        box.add(left);
        box.add(right);

        box.position.y = tools.in2cm(7.25) + 1;

        box.receiveShadow = box.castShadow = true;

        let skidGeometry = new THREE.BufferGeometry();
        let skidDepth = shedDepth - 1;
        let skidWidth = tools.in2cm(3.5);
        let skidHeight = tools.in2cm(5);
        let skidVertices = [
            skidWidth * 0.5, skidHeight, -skidDepth * 0.5,                          //0
            skidWidth * 0.5, skidHeight - tools.in2cm(1.5), -skidDepth * 0.5,       //1
            skidWidth * 0.5, 0, -skidDepth * 0.5 + tools.in2cm(4),                  //2
            skidWidth * 0.5, 0, skidDepth * 0.5 - tools.in2cm(4),                   //3
            skidWidth * 0.5, skidHeight - tools.in2cm(1.5), skidDepth * 0.5,        //4
            skidWidth * 0.5, skidHeight, skidDepth * 0.5,                           //5
        ];

        _.times(18, (i)=> {
            if (i % 3 == 0) {
                skidVertices.push(-skidVertices[i]);
            } else {
                skidVertices.push(skidVertices[i]);
            }
        });

        let skidIndices = [
            0, 7, 6,
            0, 1, 7,
            1, 8, 7,
            1, 2, 8,
            2, 9, 8,
            2, 3, 9,
            4, 10, 3,
            10, 9, 3,
            5, 11, 4,
            11, 10, 4,

            0, 5, 1,
            1, 5, 4,
            1, 4, 2,
            2, 4, 3,
            6, 7, 11,
            7, 10, 11,
            7, 8, 10,
            8, 9, 10,

            0, 6, 5,
            5, 6, 11
        ];

        skidGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(skidVertices), 3));
        skidGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(skidIndices), 1));
        skidGeometry.computeVertexNormals();

        let skidMap = {};
        let skidHalf = skidWidth * 0.5;
        skidMap[tools.URBAN_BARN] = {
            8: [
                -tools.in2cm(64) * 0.5 + skidHalf,
                tools.in2cm(64) * 0.5 - skidHalf
            ],
            10: [
                -tools.in2cm(64) * 0.5 + skidHalf,
                tools.in2cm(64) * 0.5 - skidHalf,
                -tools.in2cm(117) * 0.5 + skidHalf,
                tools.in2cm(117) * 0.5 - skidHalf
            ],
            12: [
                -tools.in2cm(64) * 0.5 + skidHalf,
                tools.in2cm(64) * 0.5 - skidHalf,
                -tools.in2cm(124) * 0.5 + skidHalf,
                tools.in2cm(124) * 0.5 - skidHalf
            ],
        };

        skidMap[tools.LEAN_TO] = skidMap[tools.URBAN_SHACK] = skidMap[tools.URBAN_BARN];

        skidMap[tools.A_FRAME] = {
            6: [
                -tools.ft2cm(5) * 0.5 - skidHalf,
                tools.ft2cm(5) * 0.5 + skidHalf
            ],
            8: [
                -tools.ft2cm(5.4166) * 0.5 - skidHalf,
                tools.ft2cm(5.4166) * 0.5 + skidHalf
            ],
            10: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth
            ],
            12: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(27.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(27.5 + 30.75 + 3.5) + skidWidth
            ],
            14: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth,
                -tools.in2cm(20.5 + 18.5 + 30.75 + 7) - skidWidth,
                tools.in2cm(20.5 + 18.5 + 30.75 + 7) + skidWidth
            ],
            16: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(30.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(30.5 + 30.75 + 3.5) + skidWidth,
                -tools.in2cm(17.5 + 30.5 + 30.75 + 7) - skidWidth,
                tools.in2cm(17.5 + 30.5 + 30.75 + 7) + skidWidth
            ]
        };

        skidMap[tools.DOUBLE_WIDE] = {
            20: [
                -tools.in2cm(2) - skidHalf,
                tools.in2cm(2) + skidHalf,
                -tools.in2cm(18.5 + 2 + 3.5) - skidHalf,
                tools.in2cm(18.5 + 2 + 3.5) + skidHalf,
                -tools.in2cm(30.75 + 18.5 + 2 + 7) - skidHalf,
                tools.in2cm(30.75 + 18.5 + 2 + 7) + skidHalf,
                -tools.in2cm(30.75 + 30.75 + 18.5 + 2 + 10.5) - skidHalf,
                tools.in2cm(30.75 + 30.75 + 18.5 + 2 + 10.5) + skidHalf,
                -tools.in2cm(18.5 + 30.75 + 30.75 + 18.5 + 2 + 14) - skidHalf,
                tools.in2cm(18.5 + 30.75 + 30.75 + 18.5 + 2 + 14) + skidHalf
            ],
            24: [
                -tools.in2cm(2) - skidHalf,
                tools.in2cm(2) + skidHalf,
                -tools.in2cm(30.5 + 2 + 3.5) - skidHalf,
                tools.in2cm(30.5 + 2 + 3.5) + skidHalf,
                -tools.in2cm(30.75 + 30.5 + 2 + 7) - skidHalf,
                tools.in2cm(30.75 + 30.5 + 2 + 7) + skidHalf,
                -tools.in2cm(30.75 + 30.75 + 30.5 + 2 + 10.5) - skidHalf,
                tools.in2cm(30.75 + 30.75 + 30.5 + 2 + 10.5) + skidHalf,
                -tools.in2cm(30.5 + 30.75 + 30.75 + 30.5 + 2 + 14) - skidHalf,
                tools.in2cm(30.5 + 30.75 + 30.75 + 30.5 + 2 + 14) + skidHalf
            ],
            28: [
                -tools.in2cm(2) - skidHalf,
                tools.in2cm(2) + skidHalf,
                -tools.in2cm(20.5 + 2 + 3.5) - skidHalf,
                tools.in2cm(20.5 + 2 + 3.5) + skidHalf,
                -tools.in2cm(18.5 + 20.5 + 2 + 7) - skidHalf,
                tools.in2cm(18.5 + 20.5 + 2 + 7) + skidHalf,
                -tools.in2cm(30.75 + 18.5 + 20.5 + 2 + 10.5) - skidHalf,
                tools.in2cm(30.75 + 18.5 + 20.5 + 2 + 10.5) + skidHalf,
                -tools.in2cm(30.75 + 30.75 + 18.5 + 20.5 + 2 + 14) - skidHalf,
                tools.in2cm(30.75 + 30.75 + 18.5 + 20.5 + 2 + 14) + skidHalf,
                -tools.in2cm(18.5 + 30.75 + 30.75 + 18.5 + 20.5 + 2 + 17.5) - skidHalf,
                tools.in2cm(18.5 + 30.75 + 30.75 + 18.5 + 20.5 + 2 + 17.5) + skidHalf,
                -tools.in2cm(20.5 + 18.5 + 30.75 + 30.75 + 18.5 + 20.5 + 2 + 21) - skidHalf,
                tools.in2cm(20.5 + 18.5 + 30.75 + 30.75 + 18.5 + 20.5 + 2 + 21) + skidHalf
            ],
            32: [
                -tools.in2cm(2) - skidHalf,
                tools.in2cm(2) + skidHalf,
                -tools.in2cm(20.5 + 2 + 3.5) - skidHalf,
                tools.in2cm(20.5 + 2 + 3.5) + skidHalf,
                -tools.in2cm(30.5 + 20.5 + 2 + 7) - skidHalf,
                tools.in2cm(30.5 + 20.5 + 2 + 7) + skidHalf,
                -tools.in2cm(30.75 + 30.5 + 20.5 + 2 + 10.5) - skidHalf,
                tools.in2cm(30.75 + 30.5 + 20.5 + 2 + 10.5) + skidHalf,
                -tools.in2cm(30.75 + 30.75 + 30.5 + 20.5 + 2 + 14) - skidHalf,
                tools.in2cm(30.75 + 30.75 + 30.5 + 20.5 + 2 + 14) + skidHalf,
                -tools.in2cm(30.5 + 30.75 + 30.75 + 30.5 + 20.5 + 2 + 17.5) - skidHalf,
                tools.in2cm(30.5 + 30.75 + 30.75 + 30.5 + 20.5 + 2 + 17.5) + skidHalf,
                -tools.in2cm(20.5 + 30.5 + 30.75 + 30.75 + 30.5 + 20.5 + 2 + 21) - skidHalf,
                tools.in2cm(20.5 + 30.5 + 30.75 + 30.75 + 30.5 + 20.5 + 2 + 21) + skidHalf
            ],
        };

        skidMap[tools.ECO] = {
            6: [
                -tools.in2cm(61) * 0.5 - skidHalf,
                tools.in2cm(61) * 0.5 + skidHalf
            ],
            8: [
                -tools.in2cm(65) * 0.5 - skidHalf,
                tools.in2cm(65) * 0.5 + skidHalf
            ],
            10: [
                -tools.in2cm(65) * 0.5 - skidHalf,
                tools.in2cm(65) * 0.5 + skidHalf
            ],
            12: [
                -tools.in2cm(65) * 0.5 - skidHalf,
                tools.in2cm(65) * 0.5 + skidHalf
            ]
        };

        skidMap[tools.CASTLE_MOUNTAIN] = {
            8: [
                -tools.in2cm(61) * 0.5 - skidHalf,
                tools.in2cm(61) * 0.5 + skidHalf
            ],
            10: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth
            ],
            12: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(28 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(28 + 30.75 + 3.5) + skidWidth
            ],
            14: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth,
                -tools.in2cm(20.5 + 18.5 + 30.75 + 7) - skidWidth,
                tools.in2cm(20.5 + 18.5 + 30.75 + 7) + skidWidth
            ],
            16: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(30.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(30.5 + 30.75 + 3.5) + skidWidth,
                -tools.in2cm(18 + 30.5 + 30.75 + 7) - skidWidth,
                tools.in2cm(18 + 30.5 + 30.75 + 7) + skidWidth
            ]
        };

        skidMap[tools.QUAKER] = {
            6: [
                -tools.in2cm(61) * 0.5 - skidHalf,
                tools.in2cm(61) * 0.5 + skidHalf
            ],
            8: [
                -tools.in2cm(65) * 0.5 - skidHalf,
                tools.in2cm(65) * 0.5 + skidHalf
            ],
            10: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth
            ],
            12: [
                0,
                -tools.in2cm(28.75) - skidWidth,
                tools.in2cm(28.75) + skidWidth,
                -tools.in2cm(32.5 + 28.75 + 3.5) - skidWidth,
                tools.in2cm(32.5 + 28.75 + 3.5) + skidWidth
            ],
            14: [
                0,
                -tools.in2cm(28.75) - skidWidth,
                tools.in2cm(28.75) + skidWidth,
                -tools.in2cm(20.5 + 28.75 + 3.5) - skidWidth,
                tools.in2cm(20.5 + 28.75 + 3.5) + skidWidth,
                -tools.in2cm(20.5 + 20.5 + 28.75 + 7) - skidWidth,
                tools.in2cm(20.5 + 20.5 + 28.75 + 7) + skidWidth
            ],
        };

        skidMap[tools.MINI_BARN] = {
            6: [
                -tools.in2cm(60) * 0.5 - skidHalf,
                tools.in2cm(60) * 0.5 + skidHalf
            ],
            8: [
                -tools.in2cm(65) * 0.5 - skidHalf,
                tools.in2cm(65) * 0.5 + skidHalf
            ],
            10: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth
            ],
            12: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(30.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(30.5 + 30.75 + 3.5) + skidWidth
            ],
        };

        skidMap[tools.HI_BARN] = {
            6: [
                -tools.in2cm(60) * 0.5 - skidHalf,
                tools.in2cm(60) * 0.5 + skidHalf
            ],
            8: [
                -tools.in2cm(65) * 0.5 - skidHalf,
                tools.in2cm(65) * 0.5 + skidHalf
            ],
            10: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth
            ],
            12: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(30.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(30.5 + 30.75 + 3.5) + skidWidth
            ],
            14: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth,
                -tools.in2cm(20.5 + 18.5 + 30.75 + 7) - skidWidth,
                tools.in2cm(20.5 + 18.5 + 30.75 + 7) + skidWidth
            ],
            16: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(30.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(30.5 + 30.75 + 3.5) + skidWidth,
                -tools.in2cm(20.5 + 30.5 + 30.75 + 7) - skidWidth,
                tools.in2cm(20.5 + 30.5 + 30.75 + 7) + skidWidth
            ]
        };

        skidMap[tools.SINGLE_SLOPE] = {
            8: [
                -tools.in2cm(65) * 0.5 - skidHalf,
                tools.in2cm(65) * 0.5 + skidHalf
            ],
            10: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth
            ],
            12: [
                0,
                -tools.in2cm(31.5) - skidWidth,
                tools.in2cm(31.5) + skidWidth,
                -tools.in2cm(28 + 31.5 + 3.5) - skidWidth,
                tools.in2cm(28 + 31.5 + 3.5) + skidWidth
            ],
            14: [
                0,
                -tools.in2cm(30.75) - skidWidth,
                tools.in2cm(30.75) + skidWidth,
                -tools.in2cm(18.5 + 30.75 + 3.5) - skidWidth,
                tools.in2cm(18.5 + 30.75 + 3.5) + skidWidth,
                -tools.in2cm(20.5 + 18.5 + 30.75 + 7) - skidWidth,
                tools.in2cm(20.5 + 18.5 + 30.75 + 7) + skidWidth
            ],
        }

        let ftWidth = shedWidth / tools.ft2cm(1);
        let xPositions;
        if (skidMap[style] && skidMap[style][ftWidth]) {
            xPositions = skidMap[style][ftWidth];
        } else {
            if (!skidMap[style]) {
                style = tools.URBAN_BARN;
            }

            //find the closest size
            let values = _.keys(skidMap[style]);
            let min, max = 0;
            let i, n;
            for (i = 0, n = values.length - 1; i < n; i++) {
                if (values[i + 1] > ftWidth) {
                    min = values[i];
                    max = values[i + 1];
                    break;
                }
            }

            if (i == values.length - 1) {
                min = max = values[values.length - 1];
            }

            let closest = min;
            if (Math.abs(max - ftWidth) < Math.abs(min - ftWidth)) {
                closest = max;
            }

            xPositions = skidMap[style][closest];
        }

        let skidMaterial = new THREE.MeshPhongMaterial({
            map: boxTexture,
            shading: THREE.FlatShading
        });
        _.each(xPositions, (xPosition)=> {
            let skid = new THREE.Mesh(skidGeometry, skidMaterial);
            skid.castShadow = skid.receiveShadow = true;
            skid.position.setX(xPosition);
            this.add(skid);
        });

        let texture = textureLoader.load(assets.img.floor);
        let bump = textureLoader.load(assets.img.floor_b);

        texture.wrapS = texture.wrapT =
            bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
        texture.repeat.y = bump.repeat.y = shedWidth / WALL_MAP_WIDTH;
        texture.repeat.x = bump.repeat.x = shedDepth / WALL_MAP_DEPTH;

        let floorMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: bump,
            specular: 0
        });

        let floorSurface = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(shedDepth - 1, shedWidth - 1)), floorMaterial);

        floorSurface.receiveShadow = floorSurface.castShadow = true;

        floorSurface.rotateX(-Math.PI * 0.5);
        floorSurface.rotateZ(Math.PI * 0.5);
        floorSurface.position.setY(tools.in2cm(10.5));

        let floorShadow = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(shedDepth - 4, shedWidth - 4)), floorMaterial);
        floorShadow.rotation.fromArray(floorSurface.rotation.toArray());
        floorShadow.rotateY(Math.PI);
        floorShadow.castShadow = true;

        floorShadow.position.y = tools.in2cm(5);

        this.add(floorSurface);
        this.add(floorShadow);
        this.add(box);

        let removedLeft = false;

        Object.defineProperties(this, {
            clip: {
                get: ()=> {
                    let clip = {};


                    clip.push = (minZ, maxZ)=> {
                        floorSurface.geometry.clip.push(minZ, maxZ);
                        if (removedLeft > 0) {
                            left.geometry.clip.push(minZ + tools.ft2cm(1), maxZ - tools.ft2cm(1));
                        } else {
                            right.geometry.clip.push(-maxZ + tools.ft2cm(1), -minZ - tools.ft2cm(1));
                        }
                    };

                    clip.pop = ()=> {
                        if (removedLeft) {
                            left.geometry.clip.pop();
                        } else {
                            right.geometry.clip.pop();
                        }
                        return floorSurface.geometry.clip.pop();
                    };

                    Object.defineProperties(clip, {
                        areas: {
                            get: ()=> {
                                return floorSurface.geometry.clip.areas;
                            }
                        },
                        angle: {
                            set: (value)=> {
                                removedLeft = value > 0;
                            }
                        }
                    });

                    return clip;
                }
            }
        });
    }
}

module.exports = Floor;
