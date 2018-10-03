const Deck = require('./Deck');
const _ = require('lodash');
const THREE = require('three');
const tools = require('./../helpers/tools');
const assets = require('./../helpers/assets');
const TextureGenerator = require('./../helpers/TextureGenerator');

/**
 * Horse stall object
 */
class HorseStall extends Deck {
    /**
     * Creates the wrap-around.
     * @param parameters parameter object as following (same as deck parameters, except width is always the same 12'):
     * {
     *       walls: Array,
     *       columns: Array,
     *       floor: Floor,
     *       shedWidth: Number,
     *       shedDepth: Number,
     *       shedHeight: Number
     *  }, where:
     *          walls - array of shed's walls
     *          floor - Floor object
     *          columns - array of shed columns
     *          shedWidth - width of the shed
     *          shedDepth - depth of the shed
     *          shedHeight - height of the shed
     */
    constructor(parameters) {
        let width_ = tools.ft2cm(12);
        let angle_ = 0;
        let center_ = 0;
        let placementIsForbidden_ = false;
        let walls_ = parameters.walls;
        let wallIsRemoved = false;
        let lastRemovedWall_;
        let container_;
        let topMaterial;
        let borderMaterial;

        const WALL_MAP_WIDTH = tools.ft2cm(4);
        const THICKNESS = tools.in2cm(3.5);

        let stallHeight = tools.ft2cm(6.5);
        let topHeight = parameters.shedHeight - stallHeight + tools.ft2cm(1);
        let topWidth = (width_ - tools.ft2cm(2));

        let textureLoader_ = new THREE.TextureLoader();
        let textureGenerator_ = new TextureGenerator();

        super(_.extend(parameters, {width: width_, dontInit: true}));
        let self = this;

        this.restoreWalls = restoreWall;
        this.removeWall = ()=> {
            if (!wallIsRemoved) {
                removeWall();
                container_ = addStall();
            }
        };
        this.setColor = setColor;

        Object.defineProperties(this, {
            boundingBox: {
                get: ()=> {
                    if (angle_ == Math.PI * 0.5) {
                        return new THREE.Box3(new THREE.Vector3(-parameters.shedWidth, 0, -width_ * 0.5), new THREE.Vector3(0, 100, width_ * 0.5));
                    } else {
                        return new THREE.Box3(new THREE.Vector3(0, 0, -width_ * 0.5), new THREE.Vector3(parameters.shedWidth, 100, width_ * 0.5));
                    }
                }
            },
            /**
             * Qualifies if object can be placed or not. Makes object red if set to true
             */
            placementForbidden: {
                get: ()=> {
                    return placementIsForbidden_;
                },
                set: (value)=> {
                    placementIsForbidden_ = (value) ? true : false;

                    container_.children.forEach((model)=> {
                        if (model instanceof THREE.Mesh) {
                            model.material.color = new THREE.Color((value) ? 0xff0000 : 0xffffff);
                            model.material.needsUpdate = true;
                        }
                    });
                }
            },
            x: {
                get: ()=> {
                    if (angle_ == Math.PI * 0.5) {
                        return parameters.shedWidth * 0.5;
                    } else {
                        return -parameters.shedWidth * 0.5;
                    }
                },
                set: (value)=> {
                    if (value >= 0) {
                        angle_ = Math.PI * 0.5;
                    } else {
                        angle_ = -Math.PI * 0.5;
                    }
                }
            },
            z: {
                get: ()=> {
                    return center_;
                },
                set: (value)=> {
                    if (value < -parameters.shedDepth * 0.5 + width_ * 0.5 + 2) {
                        value = -parameters.shedDepth * 0.5 + width_ * 0.5 + 2;
                    } else if (value > parameters.shedDepth * 0.5 - width_ * 0.5 - 2) {
                        value = parameters.shedDepth * 0.5 - width_ * 0.5 - 2;
                    }

                    restoreWall();
                    center_ = value;
                    removeWall();
                    container_ = addStall();

                    regeneratePlanModel(self.x, value);
                }
            },
            rotate: {
                set: (angle)=> {
                    //we should just keep an angle
                    if (angle == 0) {
                        angle = Math.PI * 0.5;
                    }
                    if (angle == Math.PI) {
                        angle = -Math.PI * 0.5;
                    }
                    angle_ = angle;
                },
                get: ()=> {
                    return angle_;
                }
            },
            size: {
                get: ()=> {
                    return width_;
                }
            },
            walls: {
                get: ()=> {
                    return [];
                }
            },
            wallClones: {
                get: ()=> {
                    return [];
                }
            },
            hasLeftWall: {
                get: ()=> {
                    return false;
                }
            },
            hasRightWall: {
                get: ()=> {
                    return false
                }
            },
            type: {
                get: ()=> {
                    return "Horse-Stall";
                }
            }
        });

        let planModel_ = generatePlanModel();
        planModel_.position.y = tools.planY;
        self.add(planModel_);

        function removeWall() {
            if (wallIsRemoved) {
                return;
            }

            if (angle_ == Math.PI * 0.5) {
                lastRemovedWall_ = walls_[1];
                lastRemovedWall_.geometry.clip.push(-center_ - width_ * 0.5 + tools.ft2cm(1), -center_ + width_ * 0.5 - tools.ft2cm(1));
            } else {
                lastRemovedWall_ = walls_[3];
                lastRemovedWall_.geometry.clip.push(center_ - width_ * 0.5 + tools.ft2cm(1), center_ + width_ * 0.5 - tools.ft2cm(1));
            }

            parameters.floor.clip.angle = angle_;
            parameters.floor.clip.push(-center_ - width_ * 0.5, -center_ + width_ * 0.5);

            wallIsRemoved = true;
        }

        function restoreWall() {
            if (!wallIsRemoved) {
                return;
            }

            if (container_) {
                self.remove(container_);
            }

            lastRemovedWall_.geometry.clip.pop();
            parameters.floor.clip.pop();
            wallIsRemoved = false;
        }

        function addStall() {
            let textureLoader = new THREE.TextureLoader();

            let plywoodTexture = textureLoader.load(assets.img.just_wood);
            let wallTexture = textureLoader.load(assets.img.osb);

            wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
            wallTexture.repeat.x = wallTexture.repeat.y = 3;

            let plywoodMaterial = new THREE.MeshPhongMaterial({
                shininess: 0,
                map: plywoodTexture
            });

            let wallMaterial = new THREE.MeshPhongMaterial({
                shininess: 0,
                map: wallTexture
            });

            let container = container_ || new THREE.Object3D();

            if (!container_) {
                let leftWall = new THREE.Mesh(new THREE.PlaneGeometry(parameters.shedWidth - tools.in2cm(3.5) - 1, parameters.shedHeight), wallMaterial);
                let rightWall = leftWall.clone();
                let backWall = new THREE.Mesh(new THREE.PlaneGeometry(width_, parameters.shedHeight), wallMaterial);

                let leftPlywood = new THREE.Mesh(new THREE.PlaneGeometry(parameters.shedWidth - tools.in2cm(3.5) - 7, tools.ft2cm(4)), plywoodMaterial);
                let rightPlywood = leftPlywood.clone();
                let backPlywood = new THREE.Mesh(new THREE.PlaneGeometry(width_ - 14, tools.ft2cm(4)), plywoodMaterial);

                leftPlywood.castShadow = leftPlywood.receiveShadow =
                    rightPlywood.castShadow = rightPlywood.receiveShadow =
                        backPlywood.castShadow = backPlywood.receiveShadow =
                            leftWall.castShadow = leftWall.receiveShadow =
                                rightWall.castShadow = rightWall.receiveShadow =
                                    backWall.castShadow = backWall.receiveShadow = true;

                container.add(leftPlywood);
                container.add(rightPlywood);
                container.add(backPlywood);

                container.add(leftWall);
                container.add(rightWall);
                container.add(backWall);

                let wallThickness = tools.in2cm(3.5);

                leftWall.position.z = -width_ * 0.5;
                leftPlywood.position.z = leftWall.position.z + wallThickness + 1;
                leftWall.position.x = -(wallThickness + 1) * 0.5;

                rightWall.position.z = width_ * 0.5;
                rightWall.position.x = -(wallThickness + 1) * 0.5;
                rightWall.rotation.fromArray([0, Math.PI, 0]);
                rightPlywood.position.z = rightWall.position.z - wallThickness - 1;
                rightPlywood.rotation.fromArray([0, Math.PI, 0]);

                backPlywood.rotation.fromArray([0, Math.PI * 0.5, 0]);
                backPlywood.position.z = 0;
                backWall.position.z = 0;
                backWall.rotation.fromArray([0, Math.PI * 0.5, 0]);

                leftPlywood.position.y = rightPlywood.position.y = backPlywood.position.y = tools.ft2cm(2);
                leftWall.position.y = rightWall.position.y = backWall.position.y = parameters.shedHeight * 0.5;

                backWall.position.x = -parameters.shedWidth * 0.5 + 1;
                backPlywood.position.x = backWall.position.x + wallThickness + 1;

                let i = backWall.position.x + wallThickness;
                while (i <= parameters.shedWidth * 0.5) {
                    let column1 = new THREE.Mesh(new THREE.BoxGeometry(7, parameters.shedHeight - 7, wallThickness), plywoodMaterial);
                    column1.position.x = i;
                    column1.position.y = parameters.shedHeight * 0.5;
                    let column2 = column1.clone();

                    column1.position.z = -width_ * 0.5 + wallThickness * 0.5;
                    column2.position.z = width_ * 0.5 - wallThickness * 0.5;

                    column1.castShadow = column1.receiveShadow =
                        column2.castShadow = column2.receiveShadow = true;

                    container.add(column1);
                    container.add(column2);

                    i += tools.in2cm(16);
                }

                i = -width_ * 0.5 + 3.5 + wallThickness;
                while (i <= width_ * 0.5) {
                    let column = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, parameters.shedHeight - 7, 7), plywoodMaterial);
                    column.position.z = i;
                    column.position.x = backWall.position.x + wallThickness * 0.5;
                    column.position.y = parameters.shedHeight * 0.5;
                    column.castShadow = column.receiveShadow = true;

                    container.add(column);

                    i += 37.89; //(12'-(3.5cm+3.5")*2)/9 in cm
                }

                let leftTrim1 = new THREE.Mesh(new THREE.BoxGeometry(parameters.shedWidth - 2, 7, wallThickness), plywoodMaterial);
                leftTrim1.position.z = -width_ * 0.5 + wallThickness * 0.5;
                leftTrim1.position.y = parameters.shedHeight - 7;
                leftTrim1.receiveShadow = leftTrim1.castShadow = true;

                let leftTrim2 = leftTrim1.clone();
                leftTrim2.position.y = leftTrim1.position.y + 0.5 + 5;

                let rightTrim1 = leftTrim1.clone();
                let rightTrim2 = leftTrim2.clone();

                rightTrim1.position.z = rightTrim2.position.z = width_ * 0.5 - wallThickness * 0.5;

                let backTrim1 = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, 7, width_), plywoodMaterial);
                backTrim1.position.x = backWall.position.x + wallThickness * 0.5;
                let backTrim2 = backTrim1.clone();

                backTrim1.position.y = leftTrim1.position.y;
                backTrim2.position.y = leftTrim2.position.y;

                container.add(leftTrim1);
                container.add(leftTrim2);
                container.add(rightTrim1);
                container.add(rightTrim2);
                container.add(backTrim1);
                container.add(backTrim2);

                let trussGeometry = parameters.truss.geometry;

                let truss1 = new THREE.Mesh(trussGeometry, wallMaterial);
                truss1.position.y = parameters.shedHeight;
                truss1.castShadow = truss1.receiveShadow = true;
                let truss2 = truss1.clone();

                truss1.position.z = -width_ * 0.5;
                truss2.position.z = width_ * 0.5;
                truss2.rotation.fromArray([0, Math.PI, 0]);

                container.add(truss1);
                container.add(truss2);

                let trussVertices = parameters.truss.vertices;
                const rSQRT2 = 1 / Math.sqrt(2);

                if (parameters.style == tools.URBAN_BARN) {
                    let columnVertices;
                    columnVertices = [
                        trussVertices[6], trussVertices[7], -3.5,//0
                        trussVertices[9], trussVertices[10], -3.5,//1
                        trussVertices[12], trussVertices[13], -3.5,//2
                        trussVertices[6] + wallThickness, trussVertices[7], -3.5,//3
                        trussVertices[9] + wallThickness * rSQRT2, trussVertices[10] - wallThickness * rSQRT2, -3.5,//4
                        trussVertices[12], trussVertices[13] - wallThickness, -3.5,//5
                    ];

                    _.times(18, (i)=> {
                        if ((i + 1) % 3 == 0) {
                            columnVertices.push(3.5);
                        } else {
                            columnVertices.push(columnVertices[i]);
                        }
                    });

                    columnVertices = columnVertices.concat([
                        trussVertices[6] + wallThickness, trussVertices[7], -3.5,//12
                        trussVertices[9] + wallThickness * rSQRT2, trussVertices[10] - wallThickness * rSQRT2, -3.5,//13
                        trussVertices[12], trussVertices[13] - wallThickness, -3.5,//14
                        trussVertices[6] + wallThickness, trussVertices[7], 3.5,//15
                        trussVertices[9] + wallThickness * rSQRT2, trussVertices[10] - wallThickness * rSQRT2, 3.5,//16
                        trussVertices[12], trussVertices[13] - wallThickness, 3.5,//17
                    ]);

                    let columnIndices = [
                        0, 1, 4,
                        0, 4, 3,
                        1, 2, 5,
                        1, 5, 4,

                        6, 10, 7,
                        6, 9, 10,
                        7, 10, 8,
                        10, 11, 8,

                        12, 13, 16,
                        12, 16, 15,
                        13, 14, 17,
                        13, 17, 16
                    ];

                    let columnGeometry = new THREE.BufferGeometry();
                    columnGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(columnVertices), 3));
                    columnGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(columnIndices), 1));
                    columnGeometry.computeVertexNormals();

                    i = -width_ * 0.5 + 3.5;
                    while (i <= width_ * 0.5) {
                        let column = new THREE.Mesh(columnGeometry, plywoodMaterial);

                        column.position.z = i;
                        column.position.x = 0;
                        column.position.y = parameters.shedHeight;
                        column.castShadow = column.receiveShadow = true;

                        container.add(column);

                        i += 56.83; //12'/6 in cm
                    }
                }

                i = 56.83;

                while (i <= width_ * 0.4) {
                    let x = i;
                    let y = 0;
                    if (parameters.style == tools.URBAN_BARN) {
                        y = x < trussVertices[3] ? 150 : 80;
                    } else {
                        y = x < -parameters.shedWidth * 0.25 ? 120 : 30;
                    }

                    let column1 = new THREE.Mesh(new THREE.BoxGeometry(7, y, wallThickness), plywoodMaterial);
                    column1.position.x = x;
                    column1.position.y = parameters.shedHeight + y * 0.5;
                    column1.position.z = -width_ * 0.5 + wallThickness * 0.5;
                    container.add(column1);

                    let column2 = column1.clone();
                    column2.position.x *= -1;
                    container.add(column2);

                    let column3 = column1.clone();
                    column3.position.z *= -1;
                    container.add(column3);

                    let column4 = column2.clone();
                    column4.position.z *= -1;
                    container.add(column4);

                    i += 56.83;
                }

                //adding the border
                topMaterial = tools.PAINT_MATERIAL;
                borderMaterial = tools.PAINT_MATERIAL;

                let topMax = parameters.shedHeight - stallHeight;
                let halfTopWidth = topWidth * 0.5;

                let topVertices = [
                    -halfTopWidth, 0, 0,//0
                    -halfTopWidth, -topHeight, 0,//1
                    -halfTopWidth + tools.ft2cm(1), -topMax, 0,//2
                    halfTopWidth - tools.ft2cm(1), -topMax, 0,//3
                    halfTopWidth, -topHeight, 0,//4
                    halfTopWidth, 0, 0//5
                ];

                let topIndices = [
                    1, 2, 0,
                    2, 5, 0,
                    2, 3, 5,
                    3, 4, 5
                ];

                let topUVs = [
                    0, 1,//0
                    0, 0,//1
                    tools.ft2cm(1) / topWidth, topHeight / topMax,//2
                    (topWidth - tools.ft2cm(1)) / topWidth, topHeight / topMax,//3
                    1, 0,//4
                    1, 1,//5
                ];

                let topGeometry = new THREE.BufferGeometry();
                topGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(topVertices), 3));
                topGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(topUVs), 2));
                topGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(topIndices), 1));
                topGeometry.computeVertexNormals();

                let top = new THREE.Mesh(topGeometry, topMaterial);
                top.position.y = parameters.shedHeight;
                top.position.x = parameters.shedWidth * 0.5;
                top.rotation.fromArray([0, Math.PI * 0.5, 0]);

                top.castShadow = top.receiveShadow = true;

                container.add(top);

                let topShadow = top.clone();
                topShadow.rotation.fromArray([0, -Math.PI * 0.5, 0]);
                topShadow.position.x -= 1;
                container.add(top);

                let rightBox = new THREE.Mesh(new THREE.PlaneGeometry(parameters.shedWidth - tools.in2cm(3.5) - 1, tools.in2cm(2.75)), plywoodMaterial);
                rightBox.position.set(rightPlywood.position.x, rightPlywood.position.y, rightPlywood.position.z);
                rightBox.position.y = -tools.in2cm(1.4);
                rightBox.rotation.fromArray([0, Math.PI, 0]);

                let leftBox = rightBox.clone();
                leftBox.position.set(leftPlywood.position.x, leftPlywood.position.y, leftPlywood.position.z);
                leftBox.rotation.fromArray([0, 0, 0]);
                leftBox.position.y = rightBox.position.y;

                let backBox = rightBox.clone();
                backBox.position.set(backPlywood.position.x, backPlywood.position.y, backPlywood.position.z);
                backBox.rotation.fromArray([0, Math.PI * 0.5, 0]);
                backBox.position.y = rightBox.position.y;

                let leftBorderBottom = new THREE.Mesh(new THREE.PlaneGeometry(3.5, tools.in2cm(2.75)), plywoodMaterial);
                leftBorderBottom.position.x = parameters.shedWidth * 0.5 - 1.75;
                leftBorderBottom.position.y = backBox.position.y;
                leftBorderBottom.position.z = -width_ * 0.5 + tools.ft2cm(1);

                let rightBorderBottom = leftBorderBottom.clone();
                rightBorderBottom.position.x = -parameters.shedWidth * 0.5 + 1.75;
                rightBorderBottom.rotation.fromArray([0, 0, 0]);

                container.add(leftBox);
                container.add(rightBox);
                container.add(leftBorderBottom);
                container.add(rightBorderBottom);

                let borderVertices = [
                    -halfTopWidth, 0, 3.5,//0
                    -halfTopWidth, stallHeight - tools.ft2cm(1), 3.5,//1
                    -halfTopWidth + tools.ft2cm(1), stallHeight, 3.5,//2
                    halfTopWidth - tools.ft2cm(1), stallHeight, 3.5,//3
                    halfTopWidth, stallHeight - tools.ft2cm(1), 3.5,//4
                    halfTopWidth, 0, 3.5,//5
                    -halfTopWidth - 7, 0, 3.5,//6
                    -halfTopWidth - 7, stallHeight - tools.ft2cm(1) + 7, 3.5,//7
                    -halfTopWidth + tools.ft2cm(1) - 7, stallHeight + 7, 3.5,//8
                    halfTopWidth - tools.ft2cm(1) + 7, stallHeight + 7, 3.5,//9
                    halfTopWidth + 7, stallHeight - tools.ft2cm(1) + 7, 3.5,//10
                    halfTopWidth + 7, 0, 3.5//11
                ];

                _.times(6, (i)=> {
                    borderVertices.push(borderVertices[i * 3]);
                    borderVertices.push(borderVertices[i * 3 + 1]);
                    borderVertices.push(borderVertices[i * 3 + 2]);
                });

                _.times(6, (i)=> {
                    borderVertices.push(borderVertices[i * 3]);
                    borderVertices.push(borderVertices[i * 3 + 1]);
                    borderVertices.push(borderVertices[i * 3 + 2] - 7);
                });

                _.times(6, (i)=> {
                    borderVertices.push(borderVertices[(i + 6) * 3]);
                    borderVertices.push(borderVertices[(i + 6) * 3 + 1]);
                    borderVertices.push(borderVertices[(i + 6) * 3 + 2]);
                });

                _.times(6, (i)=> {
                    borderVertices.push(borderVertices[(i + 6) * 3]);
                    borderVertices.push(borderVertices[(i + 6) * 3 + 1]);
                    borderVertices.push(borderVertices[(i + 6) * 3 + 2] - 7);
                });

                let borderIndices = [
                    0, 1, 6,
                    6, 1, 7,
                    1, 2, 7,
                    7, 2, 8,
                    2, 9, 8,
                    2, 3, 9,
                    3, 4, 9,
                    9, 4, 10,
                    5, 10, 4,
                    5, 11, 10,

                    12, 18, 13,
                    18, 19, 13,
                    13, 20, 14,
                    13, 19, 20,
                    14, 20, 15,
                    20, 21, 15,
                    21, 16, 15,
                    21, 22, 16,
                    23, 16, 22,
                    23, 17, 16,

                    24, 25, 30,
                    30, 25, 31,
                    25, 26, 31,
                    31, 26, 32,
                    26, 27, 32,
                    32, 27, 33,
                    28, 33, 27,
                    28, 34, 33,
                    29, 34, 28,
                    29, 35, 34
                ];

                let borderUVs = [
                    0, 0,//0
                    0, 1,//1
                    0, 0,//2
                    0, 1,//3
                    0, 0,//4
                    0, 1,//5
                    1, 0,//6
                    1, 1,//7
                    1, 0,//8
                    1, 1,//9
                    1, 0,//10
                    1, 1,//11
                    0, 0,//12
                    0, 1,//13
                    0, 0,//14
                    0, 1,//15
                    0, 0,//16
                    0, 1,//17
                    1, 0,//18
                    1, 1,//19
                    1, 0,//20
                    1, 1,//21
                    1, 0,//22
                    1, 1,//23
                    0, 0,//24
                    0, 1,//25
                    0, 0,//26
                    0, 1,//27
                    0, 0,//28
                    0, 1,//29
                    1, 0,//30
                    1, 1,//31
                    1, 0,//32
                    1, 1,//33
                    1, 0,//34
                    1, 1,//35
                ];

                let borderGeometry = new THREE.BufferGeometry();
                borderGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(borderVertices), 3));
                borderGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(borderUVs), 2));
                borderGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(borderIndices), 1));
                borderGeometry.computeVertexNormals();

                let border = new THREE.Mesh(borderGeometry, borderMaterial);
                border.position.x = parameters.shedWidth * 0.5;
                border.rotation.fromArray([0, Math.PI * 0.5, 0]);

                border.receiveShadow = true;

                container.add(border);
            }


            self.add(container);

            let isLeft = angle_ == Math.PI * 0.5;

            container.rotation.fromArray([0, isLeft ? 0 : Math.PI, 0]);
            container.position.x = 0;
            container.position.z = center_;

            return container;
        }

        function setColor(mainColor, secondaryColor) {
            textureGenerator_.getWall(mainColor).then((texture)=> {
                let bump = textureLoader_.load(assets.img["tiles_b"]);

                texture.wrapS = texture.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

                texture.repeat.x = bump.repeat.x = width_ / WALL_MAP_WIDTH;
                texture.repeat.y = bump.repeat.y = topHeight / parameters.shedHeight;

                let angle = tools.getAngleByRotation(self.rotation);
                texture.offset.x = bump.offset.x = ((Math.abs(angle) == Math.PI * 0.5) ? self.z : self.x) - topWidth * 0.5;
                topMaterial.map = texture;
                topMaterial.bumpMap = bump;
                topMaterial.needsUpdate = true;
            });

            textureGenerator_.getWood(secondaryColor).then((texture)=> {
                let bump = textureLoader_.load(assets.img["wood_b"]);

                texture.wrapS = texture.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

                borderMaterial.map = texture;
                borderMaterial.bumpMap = bump;
                borderMaterial.needsUpdate = true;
            });
        }

        function generatePlanModel() {
            let planModel = new THREE.Object3D();
            let bg = new THREE.Mesh(new THREE.PlaneGeometry(parameters.shedWidth - THICKNESS * 0.5, width_ - THICKNESS),
                new THREE.MeshBasicMaterial({color: 0xffffff}));
            bg.rotateX(-Math.PI * 0.5);
            bg.position.y = 5;
            planModel.add(bg);

            textureGenerator_.getFloorPlan(Math.PI * 0.5).then((texture)=> {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = 0.5;

                bg.material.map = texture;
                bg.material.needsUpdate = true;
            });

            let rightWall = new THREE.Mesh(new THREE.PlaneGeometry(width_, THICKNESS * 0.5),
                new THREE.MeshBasicMaterial({color: 0x0}));
            rightWall.rotateX(-Math.PI * 0.5);
            rightWall.position.z = width_ * 0.5 - THICKNESS * 0.25;
            rightWall.position.x = THICKNESS * 0.25;
            planModel.add(rightWall);

            let leftWall = new THREE.Mesh(new THREE.PlaneGeometry(width_, THICKNESS * 0.5),
                new THREE.MeshBasicMaterial({color: 0x0}));
            leftWall.rotateX(-Math.PI * 0.5);
            leftWall.position.z = -width_ * 0.5 + THICKNESS * 0.25;
            leftWall.position.x = THICKNESS * 0.25;
            planModel.add(leftWall);

            let frontLeftWall = new THREE.Mesh(new THREE.PlaneGeometry(THICKNESS, tools.ft2cm(1)),
                new THREE.MeshBasicMaterial({color: 0x0}));
            frontLeftWall.rotateX(-Math.PI * 0.5);
            frontLeftWall.position.z = -width_ * 0.5 + tools.ft2cm(0.5);
            frontLeftWall.position.x = -parameters.shedWidth * 0.5 + THICKNESS * 0.75;
            frontLeftWall.position.y = 8;
            planModel.add(frontLeftWall);

            let frontRightWall = frontLeftWall.clone();
            frontRightWall.position.z *= -1;
            planModel.add(frontRightWall);

            return planModel;
        }

        function regeneratePlanModel(x, z) {
            self.remove(planModel_);
            planModel_ = generatePlanModel();
            planModel_.position.y = tools.planY;
            planModel_.position.x = (self.x > 0) ? (self.x - tools.ft2cm(6) + THICKNESS * 0.25) : (self.x + tools.ft2cm(6) - THICKNESS * 0.25);
            planModel_.position.z = self.z;

            planModel_.rotation.fromArray([0, angle_ + Math.PI * 0.5, 0]);
            self.add(planModel_);
        }
    }
}

module.exports = HorseStall;
