const THREE = require('three');
const tools = require('./../helpers/tools');
const assets = require('../helpers/assets');
const _ = require('lodash');
const TextureGenerator = require('./../helpers/TextureGenerator');
const ClipGeometry = require('./../helpers/ClipGeometry');

/**
 * THe deck 3D object. It actually removes the sehd walls and creates the deck
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Deck extends THREE.Object3D {
    /**
     * Creates the deck
     * @param parameters parameter object as following:
     * {
     *       width: Number
     *       walls: Array,
     *       columns: Array,
     *       shedWidth: Number,
     *       shedDepth: Number,
     *       shedHeight: Number
     *  }, where:
     *          width - width of the deck
     *          walls - array of shed's walls
     *          columns - array of shed columns
     *          shedWidth - width of the shed
     *          shedDepth - depth of the shed
     *          shedHeight - height of the shed
     */
    constructor(parameters) {
        super();
        const WALL_MAP_WIDTH = tools.ft2cm(4);
        let self = this;
        let isWallRemoved_ = false;
        let leftWallRemoved_ = false, rightWallRemoved_ = false;
        let columnMaterial_;
        let currentDeckContainer_;
        let railWalls_, rails_, visibleRails_ = [], railInfos_ = [];
        const THICKNESS = tools.in2cm(3.5);

        let hadLeftWall_ = false;
        let hadRightWall_ = false;

        const railMaterial_ = new THREE.MeshPhongMaterial({color: 0x333333});

        this.restoreWalls = restoreWalls;
        this.removeWall = ()=> {
            removeWall(lastRemovedWallIndex_);
            currentDeckContainer_ = addDeck();
            currentDeckContainer_.rotation.fromArray([0, angle_, 0]);
        };

        let placementIsForbidden_ = false;
        let angle_ = 0;
        let lastRemovedWallIndex_ = 0;

        const FRONT = 1, LEFT = 2, BACK = 4, RIGHT = 8;
        let position_ = FRONT;

        //width, walls, columns, shedWidth, shedDepth, shedHeight
        _.each(['width', 'walls', 'columns', 'shedWidth', 'shedDepth', 'shedHeight'], (param)=> {
            if (!parameters[param]) {
                throw(new Error("All parameters must be set: width, walls, columns, shedWidth, shedDepth, shedHeight"));
            }
        });
        let width_ = parameters.width, walls = parameters.walls, shedColumns = parameters.columns,
            shedWidth = parameters.shedWidth, shedDepth = parameters.shedDepth, shedHeight = parameters.shedHeight;

        let wallSize_ = shedWidth;
        let neighborSize_ = shedDepth;

        let textureGenerator_ = new TextureGenerator();
        let textureLoader = new THREE.TextureLoader();
        let centerX_ = 0;

        const wallNeighbors = {
            0: {left: 3, right: 1},
            1: {left: 0, right: 2},
            2: {left: 1, right: 3},
            3: {left: 2, right: 0}
        };

        const wallColumns = {
            0: {left: 0, right: 1},
            1: {left: 1, right: 2},
            2: {left: 2, right: 3},
            3: {left: 3, right: 0}
        };

        let geometries_ = _.map(walls, (wall)=> {
            return wall.geometry;
        });

        let deckWall_, rightDeckWall_, leftDeckWall_, deckCeil_, columns_;

        if (!parameters.dontInit) {
            removeWall(0);
            currentDeckContainer_ = addDeck();
        }
        //currentDeckContainer_.rotateY(Math.PI * 0.5);

        /**
         * Set of functions to determine the bounding box according to orientation
         */
        let getBoundingBox = {};
        getBoundingBox[LEFT] = ()=> {
            return {
                min: {
                    x: -tools.ft2cm(4) - 3.5,
                    y: -shedHeight * 0.5,
                    z: -width_ * 0.5 - 3.5
                },
                max: {
                    x: 3.5,
                    y: shedHeight * 0.5,
                    z: width_ * 0.5 + 3.5
                }
            };
        };
        getBoundingBox[RIGHT] = ()=> {
            return {
                min: {
                    x: -3.5,
                    y: -shedHeight * 0.5,
                    z: -width_ * 0.5 - 3.5
                },
                max: {
                    x: tools.ft2cm(4) + 3.5,
                    y: shedHeight * 0.5,
                    z: width_ * 0.5 + 3.5
                }
            };
        };
        getBoundingBox[FRONT] = ()=> {
            return {
                min: {
                    x: -width_ * 0.5 - 3.5,
                    y: -shedHeight * 0.5,
                    z: -tools.ft2cm(4) - 3.5
                },
                max: {
                    x: width_ * 0.5 + 3.5,
                    y: shedHeight * 0.5,
                    z: 3.5
                }
            };
        };
        getBoundingBox[BACK] = ()=> {
            return {
                min: {
                    x: -width_ * 0.5 - 3.5,
                    y: -shedHeight * 0.5,
                    z: -3.5
                },
                max: {
                    x: width_ * 0.5 + 3.5,
                    y: shedHeight * 0.5,
                    z: tools.ft2cm(4) + 3.5
                }
            };
        };

        Object.defineProperties(this, {
            /**
             * The bounding box of the 3D model as object
             * {
             *  min:
             *      {
             *          x:x,
             *          y:y
             *      }
             *  max:
             *      {
             *          x:x,
             *          y:y
             *      }
             * }
             */
            boundingBox: {
                get: ()=> {
                    let bbox = getBoundingBox[position_]();

                    return new THREE.Box3().set(new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
                        new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z));
                },
                configurable: true
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
                    let children = [deckWall_, deckCeil_];
                    if (leftDeckWall_.visible) {
                        children.push(leftDeckWall_);
                    }
                    if (rightDeckWall_.visible) {
                        children.push(rightDeckWall_);
                    }

                    children.concat(columns_).forEach((mesh)=> {
                        mesh.material.color = new THREE.Color((value) ? 0xff0000 : 0xffffff);
                        mesh.material.needsUpdate = true;
                    });
                },
                configurable: true
            },
            x: {
                get: ()=> {
                    if (wallSize_ == shedWidth) {
                        return ((position_ == FRONT) ? 1 : -1) * centerX_;
                    } else {
                        return ((position_ == RIGHT) ? -1 : 1) * shedWidth * 0.5
                    }
                },
                set: (value)=> {
                    if (wallSize_ == shedWidth) {
                        restoreWalls();
                        centerX_ = (position_ == FRONT ? value : -value);
                        removeWall(position_ == FRONT ? 0 : 2);
                        currentDeckContainer_ = addDeck();
                        currentDeckContainer_.rotation.fromArray([0, angle_, 0]);
                    }

                    planModel_.position.x = value;
                },
                configurable: true
            },
            z: {
                get: ()=> {
                    if (wallSize_ == shedDepth) {
                        return ((position_ == LEFT) ? -1 : 1) * centerX_;
                    } else {
                        return ((position_ == BACK) ? -1 : 1) * shedDepth * 0.5
                    }
                },
                set: (value)=> {
                    if (wallSize_ == shedDepth) {
                        restoreWalls();
                        centerX_ = (position_ == RIGHT ? value : -value);
                        removeWall(position_ == LEFT ? 1 : 3);
                        currentDeckContainer_ = addDeck();
                        currentDeckContainer_.rotation.fromArray([0, angle_, 0]);
                    }

                    let hasLeftWall = self.hasLeftWall;
                    let hasRightWall = self.hasRightWall;

                    if (hadLeftWall_ != hasLeftWall || hadRightWall_ != hasRightWall) {
                        regeneratePlanModel(self.x, value);
                    } else {
                        planModel_.position.z = value;
                        planModel_.rotation.fromArray([0, angle_, 0]);
                    }

                    hadLeftWall_ = hasLeftWall;
                    hadRightWall_ = hasRightWall;
                },
                configurable: true
            },
            rotate: {
                set: (angle)=> {
                    restoreWalls();
                    let wallIndex = 0;
                    let angleMap = {};
                    angleMap[0] = ()=> {
                        position_ = FRONT;
                        wallIndex = 0;
                        wallSize_ = shedWidth;
                        neighborSize_ = shedDepth;
                    };

                    angleMap[Math.PI * 0.5] = ()=> {
                        position_ = LEFT;
                        wallIndex = 1;
                        wallSize_ = shedDepth;
                        neighborSize_ = shedWidth;
                    };

                    angleMap[Math.PI] = ()=> {
                        position_ = BACK;
                        wallIndex = 2;
                        wallSize_ = shedWidth;
                        neighborSize_ = shedDepth;
                    };

                    angleMap[-Math.PI * 0.5] = ()=> {
                        position_ = RIGHT;
                        wallIndex = 3;
                        wallSize_ = shedDepth;
                        neighborSize_ = shedWidth;
                    };

                    angleMap[angle]();

                    removeWall(wallIndex);
                    currentDeckContainer_ = addDeck();
                    currentDeckContainer_.rotation.fromArray([0, angle, 0]);
                    angle_ = angle;
                },
                get: ()=> {
                    return angle_;
                },
                configurable: true
            },
            size: {
                get: ()=> {
                    return width_;
                },
                configurable: true
            },
            width: {
                get: ()=> {
                    return width_;
                },
                configurable: true
            },
            walls: {
                get: ()=> {
                    let returnArray = [deckWall_];
                    if (leftDeckWall_.visible) {
                        returnArray.push(leftDeckWall_);
                    }

                    if (rightDeckWall_.visible) {
                        returnArray.push(rightDeckWall_);
                    }
                    return returnArray;
                },
                configurable: true
            },
            wallClones: {
                get: ()=> {
                    let returnArray = [_.extend(deckWall_.clone(), {original: deckWall_})];
                    if (leftDeckWall_.visible) {
                        returnArray.push(_.extend(leftDeckWall_.clone(), {original: leftDeckWall_}));
                    }

                    if (rightDeckWall_.visible) {
                        returnArray.push(_.extend(rightDeckWall_.clone(), {original: rightDeckWall_}));
                    }

                    let angleMap = {};
                    angleMap[FRONT] = 0;
                    angleMap[LEFT] = Math.PI * 0.5;
                    angleMap[BACK] = Math.PI;
                    angleMap[RIGHT] = -Math.PI * 0.5;
                    let angle = angleMap[position_];
                    let positionMap = {};
                    positionMap[FRONT] = {x: 0, z: 0};
                    positionMap[BACK] = {x: 0, z: -shedDepth};
                    positionMap[RIGHT] = {x: -shedWidth, z: 0};
                    positionMap[LEFT] = {x: shedWidth, z: 0};

                    _.each(returnArray, (wall)=> {
                        let rotation = wall.rotation.toArray();
                        wall.rotation.fromArray([0, angle + rotation[1], 0]);
                        wall.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
                    });

                    return returnArray;
                },
                configurable: true
            },
            hasLeftWall: {
                get: ()=> {
                    return centerX_ - width_ * 0.5 > -wallSize_ * 0.5
                },
                configurable: true
            },
            hasRightWall: {
                get: ()=> {
                    return centerX_ + width_ * 0.5 < wallSize_ * 0.5
                },
                configurable: true
            },
            type: {
                get: ()=> {
                    return (width_ == tools.ft2cm(8) ? "8" : (width_ == tools.ft2cm(10) ? "10" : "12")) + "' x 4' Deck";
                }
            },
            railWalls: {
                get: ()=> {
                    return railWalls_;
                },
                configurable: true
            },
            rails: {
                get: ()=> {
                    return railInfos_;
                },
                configurable: true
            }
        });

        let planModel_;
        if (!parameters.dontInit) {
            planModel_ = generatePlanModel();
            planModel_.position.y = tools.planY;
            self.add(planModel_);
        }

        /**
         * Sets the colors of the deck
         * @param mainColor Main color for deck's walls
         * @param secondaryColor Secondary color for deck's columns and rails
         */
        this.setColor = (mainColor, secondaryColor)=> {
            Promise.all([
                textureGenerator_.getWall(mainColor),
                textureGenerator_.getWall(mainColor),
                textureGenerator_.getWall(mainColor),
                textureGenerator_.getWood(secondaryColor),
                textureGenerator_.getWoodBump()
            ]).then((results)=> {
                let widthMap = results[0];
                let widthBumpMap = textureLoader.load(assets.img.tiles_b);
                let depthMap = results[1];
                let depthBumpMap = textureLoader.load(assets.img.tiles_b);
                let ceilMap = results[2];
                let ceilBumpMap = textureLoader.load(assets.img.tiles_b);

                widthMap.wrapS = widthMap.wrapT =
                    widthBumpMap.wrapS = widthBumpMap.wrapT =
                        depthMap.wrapS = depthMap.wrapT =
                            depthBumpMap.wrapS = depthBumpMap.wrapT =
                                ceilMap.wrapS = ceilMap.wrapT =
                                    ceilBumpMap.wrapS = ceilBumpMap.wrapT = THREE.RepeatWrapping;

                widthMap.repeat.x = widthBumpMap.repeat.x = ceilMap.repeat.x = ceilBumpMap.repeat.x = width_ / WALL_MAP_WIDTH;
                depthMap.repeat.x = depthBumpMap.repeat.x = ceilMap.repeat.y = ceilBumpMap.repeat.y = tools.ft2cm(4) / WALL_MAP_WIDTH;

                deckWall_.material.map = widthMap;
                deckWall_.material.bumpMap = widthBumpMap;
                deckWall_.material.needsUpdate = true;

                _.each([leftDeckWall_, rightDeckWall_], (wall)=> {
                    if (!wall) {
                        return;
                    }

                    wall.material.map = depthMap;
                    wall.material.bumpMap = depthBumpMap;
                    wall.material.needsUpdate = true;
                });

                deckCeil_.material.map = ceilMap;
                deckCeil_.material.bumpMap = ceilBumpMap;
                deckCeil_.material.needsUpdate = true;

                let texture = results[3];
                let bump = results[4];
                columnMaterial_.map = texture;
                columnMaterial_.bumpMap = bump;
                texture.wrapS = texture.wrapT =
                    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
                texture.repeat.y = 25;
                bump.repeat.y = 25;
                columnMaterial_.needsUpdate = true;
            });
        };

        this.showRail = (index, show = true, info)=> {
            if (rails_ && rails_[index]) {
                rails_[index].visible = show;
                visibleRails_[index] = show;
                if (show) {
                    railInfos_.push({info, index});
                } else {
                    railInfos_.pop();
                }

                regeneratePlanModel(self.x, self.z);
            }
        };

        this.isRailShown = (index)=> {
            if (rails_ && rails_[index]) {
                return rails_[index].visible;
            }
            return false;
        };

        this.clearRails = ()=> {
            if (rails_) {
                _.each(rails_, (rail)=> {
                    rail.visible = false;
                });
            }

            visibleRails_ = [];
            railInfos_ = [];
        };

        /**
         * Removes one of the walls, specified by index and 4' from neighbor walls (left and right wall)
         * @param wallIndex Index of the wall to remove
         */
        function removeWall(wallIndex) {
            if (isWallRemoved_) {
                return;
            }
            isWallRemoved_ = true;

            lastRemovedWallIndex_ = wallIndex;
            let leftIndex = wallNeighbors[wallIndex].left;
            let rightIndex = wallNeighbors[wallIndex].right;

            geometries_[wallIndex].clip.push(centerX_ - width_ * 0.5, centerX_ + width_ * 0.5);

            let halfNeighbor = neighborSize_ / 2;
            let feet4 = tools.ft2cm(4);

            if (centerX_ + width_ * 0.5 >= wallSize_ * 0.5) {
                geometries_[rightIndex].clip.push(-halfNeighbor, feet4 - halfNeighbor);
                shedColumns[wallColumns[wallIndex].right].visible = false;
                rightWallRemoved_ = true;
            }

            if (centerX_ - width_ * 0.5 <= -wallSize_ * 0.5) {
                geometries_[leftIndex].clip.push(halfNeighbor - feet4, halfNeighbor);
                shedColumns[wallColumns[wallIndex].left].visible = false;
                leftWallRemoved_ = true;
            }

            _.each(geometries_, (geometry)=> {
                geometry.needsUpdate = true;
            });
        }

        /**
         * Removes the deck and restores all walls
         */
        function restoreWalls() {
            if (!isWallRemoved_) {
                return;
            }
            isWallRemoved_ = false;

            if (currentDeckContainer_) {
                self.remove(currentDeckContainer_);
            }

            let halfNeighbor = neighborSize_ / 2;
            let feet4 = tools.ft2cm(4);

            let leftIndex = wallNeighbors[lastRemovedWallIndex_].left;
            let rightIndex = wallNeighbors[lastRemovedWallIndex_].right;
            geometries_[lastRemovedWallIndex_].clip.pop();


            if (rightWallRemoved_) {
                geometries_[rightIndex].clip.pop();
                shedColumns[wallColumns[lastRemovedWallIndex_].right].visible = true;
                rightWallRemoved_ = false;
            }

            if (leftWallRemoved_) {
                geometries_[leftIndex].clip.pop();
                shedColumns[wallColumns[lastRemovedWallIndex_].left].visible = true;
                leftWallRemoved_ = false;
            }

            return lastRemovedWallIndex_;
        }

        /**
         * Generates deck 3D model on place of the wall hole, created by removeWall
         * @returns {Object3D} Container with the 3D models of Deck parts
         */
        function addDeck(rotation = 0) {

            let deckContainer = currentDeckContainer_ || new THREE.Object3D();

            if (!currentDeckContainer_) {
                deckWall_ = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(width_, shedHeight)), new THREE.MeshPhongMaterial({bumpScale: tools.bumpScale}));
                deckContainer.add(deckWall_);

                rightDeckWall_ = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(tools.ft2cm(4), shedHeight)), new THREE.MeshPhongMaterial({bumpScale: tools.bumpScale}));
                deckContainer.add(rightDeckWall_);
                rightDeckWall_.castShadow = rightDeckWall_.receiveShadow = true;


                leftDeckWall_ = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(tools.ft2cm(4), shedHeight)), new THREE.MeshPhongMaterial({bumpScale: tools.bumpScale}));
                deckContainer.add(leftDeckWall_);
                leftDeckWall_.castShadow = leftDeckWall_.receiveShadow = true;


                deckCeil_ = new THREE.Mesh(new THREE.PlaneGeometry(width_, tools.ft2cm(4)), new THREE.MeshPhongMaterial({bumpScale: tools.bumpScale}));
                deckContainer.add(deckCeil_);

                deckWall_.castShadow = deckWall_.receiveShadow = true;
                deckCeil_.castShadow = deckCeil_.receiveShadow = true;
            } else {
                while (deckContainer.children.length) {
                    deckContainer.remove(deckContainer.children[0]);
                }

                deckContainer.add(deckWall_);
                deckContainer.add(rightDeckWall_);
                deckContainer.add(leftDeckWall_);
                deckContainer.add(deckCeil_);
            }

            //add columns
            columnMaterial_ = new THREE.MeshPhongMaterial({bumpScale: tools.bumpScale});
            function getStandardColumn() {
                return new THREE.Mesh(new THREE.BoxGeometry(7, 7, shedHeight - 3.5), columnMaterial_);
            }

            function getMiddleColumn() {
                return new THREE.Mesh(new THREE.BoxGeometry(7, 7, shedHeight), columnMaterial_);
            }

            let column = getMiddleColumn();
            column.rotateX(-Math.PI * 0.5);
            column.position.setZ(neighborSize_ * 0.5 - 7);
            column.position.setX(centerX_);
            column.position.setY(shedHeight * 0.5);

            let railWallMaterial = new THREE.MeshStandardMaterial({opacity: 0, transparent: true});
            if (width_ >= tools.ft2cm(10)) {
                column.position.setX(centerX_ - tools.ft2cm(2));

                let column2 = getMiddleColumn();
                column2.rotateX(-Math.PI * 0.5);
                column2.position.setZ(neighborSize_ * 0.5 - 7);
                column2.position.setX(centerX_ + tools.ft2cm(2));
                column2.position.setY(shedHeight * 0.5);

                let box1 = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), columnMaterial_);
                box1.position.x = column.position.x;
                box1.position.z = column.position.z;
                box1.position.y = 7;
                box1.castShadow = box1.receiveShadow = true;
                deckContainer.add(box1);

                let box2 = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), columnMaterial_);
                box2.position.x = column2.position.x;
                box2.position.z = column2.position.z;
                box2.position.y = 7;
                box2.castShadow = box2.receiveShadow = true;
                deckContainer.add(box2);

                let railWall1 = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4) - 7, shedHeight * 0.5 - 20), railWallMaterial);
                railWall1.position.x = centerX_;
                railWall1.position.y = shedHeight * 0.25 + 10;
                railWall1.position.z = neighborSize_ * 0.5 - 7;
                deckContainer.add(railWall1);

                let railWall2Width = (width_ - tools.ft2cm(4)) * 0.5 - 7;
                if (centerX_ + width_ * 0.5 >= wallSize_ * 0.5) {
                    railWall2Width -= 7;
                }
                let railWall2 = new THREE.Mesh(new THREE.PlaneGeometry(railWall2Width, shedHeight * 0.5 - 20), railWallMaterial);
                railWall2.position.x = centerX_ + tools.ft2cm(2) + 3.5 + railWall2Width * 0.5;
                railWall2.position.y = shedHeight * 0.25 + 10;
                railWall2.position.z = neighborSize_ * 0.5 - 7;
                deckContainer.add(railWall2);

                let railWall3Width = (width_ - tools.ft2cm(4)) * 0.5 - 7;
                if (centerX_ - width_ * 0.5 <= -wallSize_ * 0.5) {
                    railWall3Width -= 7;
                }
                let railWall3 = new THREE.Mesh(new THREE.PlaneGeometry(railWall3Width, shedHeight * 0.5 - 20), railWallMaterial);
                railWall3.position.x = centerX_ - tools.ft2cm(2) - 3.5 - railWall3Width * 0.5;
                railWall3.position.y = railWall2.position.y;
                railWall3.position.z = railWall2.position.z;
                deckContainer.add(railWall3);

                railWalls_ = [railWall1, railWall2, railWall3];

                let column3;
                if (centerX_ - width_ * 0.5 <= -wallSize_ * 0.5) {
                    column3 = getMiddleColumn();
                    column3.position.setZ(neighborSize_ * 0.5 - 7);
                    column3.position.setY(shedHeight * 0.5);
                    column3.position.setX(centerX_ - width_ * 0.5 + 7);

                    let box3 = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), columnMaterial_);
                    box3.position.x = column3.position.x;
                    box3.position.z = column3.position.z;
                    box3.position.y = 7;
                    box3.castShadow = box3.receiveShadow = true;
                    deckContainer.add(box3);
                } else {
                    column3 = getStandardColumn();
                    column3.position.setZ(neighborSize_ * 0.5);
                    column3.position.setY(shedHeight * 0.5 - 1.75);
                    column3.position.setX(centerX_ - width_ * 0.5);
                }
                column3.rotateX(-Math.PI * 0.5);

                let column4;
                if (centerX_ + width_ * 0.5 >= wallSize_ * 0.5) {
                    column4 = getMiddleColumn();
                    column4.position.setZ(neighborSize_ * 0.5 - 7);
                    column4.position.setY(shedHeight * 0.5);
                    column4.position.setX(centerX_ + width_ * 0.5 - 7);

                    let box4 = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), columnMaterial_);
                    box4.position.x = column4.position.x;
                    box4.position.z = column4.position.z;
                    box4.position.y = 7;
                    box4.castShadow = box4.receiveShadow = true;
                    deckContainer.add(box4);
                } else {
                    column4 = getStandardColumn();
                    column4.position.setZ(neighborSize_ * 0.5);
                    column4.position.setY(shedHeight * 0.5 - 1.75);
                    column4.position.setX(centerX_ + width_ * 0.5);
                }
                column4.rotateX(-Math.PI * 0.5);

                let column5 = new THREE.Mesh(new THREE.BoxGeometry(7, 7, shedHeight), columnMaterial_);
                column5.rotateX(-Math.PI * 0.5);
                column5.position.setX(centerX_ - width_ * 0.5);
                column5.position.setZ(neighborSize_ * 0.5 - tools.ft2cm(4));
                column5.position.setY(shedHeight * 0.5);
                let column6 = column5.clone();
                column6.position.setX(centerX_ + width_ * 0.5);
                column6.position.setZ(neighborSize_ * 0.5 - tools.ft2cm(4));

                deckContainer.add(column);
                deckContainer.add(column2);
                deckContainer.add(column3);
                deckContainer.add(column4);
                deckContainer.add(column5);
                deckContainer.add(column6);
                columns_ = [column, column2, column3, column4, column5, column6];

            } else {
                let box1 = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), columnMaterial_);
                box1.position.x = column.position.x;
                box1.position.z = column.position.z;
                box1.position.y = 7;
                box1.castShadow = box1.receiveShadow = true;
                deckContainer.add(box1);

                let column2;
                if (centerX_ - width_ * 0.5 <= -wallSize_ * 0.5) {
                    column2 = getMiddleColumn();
                    column2.position.setZ(neighborSize_ * 0.5 - 7);
                    column2.position.setY(shedHeight * 0.5);
                    column2.position.setX(centerX_ - width_ * 0.5 + 7);

                    let box2 = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), columnMaterial_);
                    box2.position.x = column2.position.x;
                    box2.position.z = column2.position.z;
                    box2.position.y = 7;
                    box2.castShadow = box2.receiveShadow = true;
                    deckContainer.add(box2);
                } else {
                    column2 = getStandardColumn();
                    column2.position.setZ(neighborSize_ * 0.5);
                    column2.position.setY(shedHeight * 0.5 - 1.75);
                    column2.position.setX(centerX_ - width_ * 0.5);
                }
                column2.rotateX(-Math.PI * 0.5);

                let railWall1 = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4) - 7, shedHeight * 0.5 - 20), railWallMaterial);
                railWall1.position.x = centerX_ - tools.ft2cm(2);
                railWall1.position.y = shedHeight * 0.25 + 10;
                railWall1.position.z = neighborSize_ * 0.5 - 7;
                deckContainer.add(railWall1);

                let railWall2 = railWall1.clone();
                railWall2.position.x = centerX_ + tools.ft2cm(2);
                deckContainer.add(railWall2);
                railWalls_ = [railWall1, railWall2];

                let column3;
                if (centerX_ + width_ * 0.5 >= wallSize_ * 0.5) {
                    column3 = getMiddleColumn();
                    column3.position.setZ(neighborSize_ * 0.5 - 7);
                    column3.position.setY(shedHeight * 0.5);
                    column3.position.setX(centerX_ + width_ * 0.5 - 7);

                    let box3 = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), columnMaterial_);
                    box3.position.x = column3.position.x;
                    box3.position.z = column3.position.z;
                    box3.position.y = 7;
                    box3.castShadow = box3.receiveShadow = true;
                    deckContainer.add(box3);
                } else {
                    column3 = getStandardColumn();
                    column3.position.setZ(neighborSize_ * 0.5);
                    column3.position.setY(shedHeight * 0.5 - 1.75);
                    column3.position.setX(centerX_ + width_ * 0.5);
                }
                column3.rotateX(-Math.PI * 0.5);


                let column4 = new THREE.Mesh(new THREE.BoxGeometry(7, 7, shedHeight), columnMaterial_);
                column4.rotateX(-Math.PI * 0.5);
                column4.position.setX(centerX_ - width_ * 0.5);
                column4.position.setZ(neighborSize_ * 0.5 - tools.ft2cm(4));
                column4.position.setY(shedHeight * 0.5);
                let column5 = column4.clone();
                column5.position.setX(centerX_ + width_ * 0.5);
                column5.position.setZ(neighborSize_ * 0.5 - tools.ft2cm(4));

                deckContainer.add(column);
                deckContainer.add(column2);
                deckContainer.add(column3);
                deckContainer.add(column4);
                deckContainer.add(column5);
                columns_ = [column, column2, column3, column4, column5];
            }

            let sideRailWallWidth = tools.ft2cm(4) - 14;
            if (centerX_ - width_ * 0.5 <= -wallSize_ * 0.5) {
                let railWall4 = new THREE.Mesh(new THREE.PlaneGeometry(sideRailWallWidth, shedHeight * 0.5 - 20), railWallMaterial);
                railWall4.rotateY(-Math.PI * 0.5);
                railWall4.position.x = centerX_ - width_ * 0.5 + 7;
                railWall4.position.y = shedHeight * 0.25 + 10;
                railWall4.position.z = neighborSize_ * 0.5 - 10.5 - sideRailWallWidth * 0.5;
                deckContainer.add(railWall4);
                railWalls_.push(railWall4);
            }
            if (centerX_ + width_ * 0.5 >= wallSize_ * 0.5) {
                let railWall5 = new THREE.Mesh(new THREE.PlaneGeometry(sideRailWallWidth, shedHeight * 0.5 - 20), railWallMaterial);
                railWall5.rotateY(Math.PI * 0.5);
                railWall5.position.x = centerX_ + width_ * 0.5 - 7;
                railWall5.position.y = shedHeight * 0.25 + 10;
                railWall5.position.z = neighborSize_ * 0.5 - 10.5 - sideRailWallWidth * 0.5;
                deckContainer.add(railWall5);
                railWalls_.push(railWall5);
            }

            rails_ = [];
            _.each(railWalls_, (railWall, i)=> {
                let rail = buildRail(railWall, i);
                deckContainer.add(rail);
                rails_.push(rail)
            });

            _.each(columns_, (column)=> {
                column.castShadow = column.receiveShadow = true;
            });

            if (centerX_ + width_ * 0.5 < wallSize_ * 0.5) {
                rightDeckWall_.visible = true;
            } else {
                rightDeckWall_.visible = false;
            }

            if (centerX_ - width_ * 0.5 > -wallSize_ * 0.5) {
                leftDeckWall_.visible = true;
            } else {
                leftDeckWall_.visible = false;
            }

            deckWall_.position.setZ(neighborSize_ / 2 - tools.ft2cm(4));
            deckWall_.position.setX(centerX_);
            deckWall_.position.setY(shedHeight * 0.5);
            deckWall_.rotation.fromArray([0, rotation, 0]);

            rightDeckWall_.position.setX(centerX_ + width_ / 2);
            rightDeckWall_.position.setY(shedHeight * 0.5);
            rightDeckWall_.position.setZ(neighborSize_ * 0.5 - tools.ft2cm(2));
            rightDeckWall_.rotation.fromArray([0, rotation - Math.PI * 0.5, 0]);

            leftDeckWall_.position.setX(centerX_ - width_ / 2);
            leftDeckWall_.position.setY(shedHeight * 0.5);
            leftDeckWall_.position.setZ(neighborSize_ * 0.5 - tools.ft2cm(2));
            leftDeckWall_.rotation.fromArray([0, rotation + Math.PI * 0.5, 0]);

            deckCeil_.position.setY(shedHeight);
            deckCeil_.position.setX(centerX_);
            deckCeil_.position.setZ(neighborSize_ * 0.5 - tools.ft2cm(2));
            deckCeil_.rotation.fromArray([Math.PI * 0.5, 0, 0]);

            self.add(deckContainer);

            return deckContainer;
        }

        function buildRail(railWall, index) {
            let width = railWall.geometry.parameters.width;
            let height = railWall.geometry.parameters.height;
            let rail = new THREE.Object3D();
            rail.rotation.fromArray(railWall.rotation.toArray());
            rail.position.set(railWall.position.x, railWall.position.y, railWall.position.z);

            let topRail = new THREE.Mesh(new THREE.BoxGeometry(width, tools.in2cm(1.5), tools.in2cm(1.5)), railMaterial_);
            topRail.position.y = height * 0.5;
            rail.add(topRail);

            let bottomRail = new THREE.Mesh(new THREE.BoxGeometry(width, tools.in2cm(1.25), tools.in2cm(1.5)), railMaterial_);
            bottomRail.position.y = -height * 0.5;
            rail.add(bottomRail);

            let x = tools.in2cm(2);
            const columnHeight = height - tools.in2cm(2.75) * 0.5;
            let maxX = width * 0.5 - tools.in2cm(2);
            while (x < maxX) {
                let column = new THREE.Mesh(new THREE.BoxGeometry(tools.in2cm(0.5), columnHeight, tools.in2cm(0.5)), railMaterial_);
                column.receiveShadow = column.castShadow = true;
                column.position.x = x;
                rail.add(column);

                let column2 = column.clone();
                column2.position.x = -x;
                rail.add(column2);

                x += tools.in2cm(4);
            }

            topRail.receiveShadow = topRail.castShadow = true;
            bottomRail.receiveShadow = bottomRail.castShadow = true;

            rail.visible = visibleRails_[index] ? true : false;

            return rail;
        }

        /**
         * Generates plan model of the current deck
         */
        function generatePlanModel() {
            let planModel = new THREE.Object3D();

            let bbox = new THREE.Box3(new THREE.Vector3(-width_ * 0.5, 0, 0), new THREE.Vector3(width_ * 0.5, 10, tools.ft2cm(4)));
            let width = bbox.max.x - bbox.min.x;
            let depth = bbox.max.z - bbox.min.z;

            let deckObject = new THREE.Object3D();
            let bg = new THREE.Mesh(new THREE.PlaneGeometry(width, depth),
                new THREE.MeshBasicMaterial({color: 0xffffff}));
            bg.position.y = 5;
            bg.position.z = -tools.ft2cm(2);
            bg.rotateX(-Math.PI * 0.5);
            deckObject.add(bg);

            textureGenerator_.getFloorPlan().then((texture)=> {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = width / WALL_MAP_WIDTH;
                bg.material.map = texture;
                bg.material.needsUpdate = true;
            });

            let rect = tools.getRectangle(bbox, 0x555555);
            rect.position.x = 0;
            rect.position.z = -depth;
            rect.position.y = 1;
            deckObject.add(rect);

            let walls = new THREE.Object3D();

            let wall1 = new THREE.Mesh(new THREE.PlaneGeometry(width_, THICKNESS),
                new THREE.LineBasicMaterial({color: 0x0}));
            wall1.position.z = -tools.ft2cm(4) - THICKNESS * 0.5;
            wall1.rotateX(-Math.PI * 0.5);
            walls.add(wall1);

            if (self.hasLeftWall) {
                let wall2 = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4), THICKNESS),
                    new THREE.LineBasicMaterial({color: 0x0}));
                wall2.position.x = -width * 0.5 - THICKNESS * 0.5;
                wall2.position.z = -depth * 0.5 - THICKNESS;
                wall2.rotateX(-Math.PI * 0.5);
                wall2.rotateZ(Math.PI * 0.5);
                walls.add(wall2);
            }

            if (self.hasRightWall) {
                let wall3 = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4), THICKNESS), new THREE.LineBasicMaterial({color: 0x0}));
                wall3.position.x = width * 0.5 + THICKNESS * 0.5;
                wall3.position.z = -depth * 0.5 - THICKNESS;
                wall3.rotateX(-Math.PI * 0.5);
                wall3.rotateZ(Math.PI * 0.5);
                walls.add(wall3);
            }

            //drawing rails
            let railWalls = self.railWalls;
            _.each(self.rails, (rail)=> {
                let railWall = railWalls[rail.index];
                let halfWidth = railWall.geometry.parameters.width * 0.5;
                let railRect = tools.getRectangle({
                    min: {x: -halfWidth, y: 0, z: -THICKNESS * 0.25},
                    max: {x: halfWidth, y: 10, z: THICKNESS * 0.25}
                });
                railRect.position.x = railWall.position.x;
                railRect.position.z = railWall.position.z;
                railRect.position.y = 6;
                railRect.rotation.fromArray(railWall.rotation.toArray());
                planModel.add(railRect)
            });

            walls.position.y = 6;
            deckObject.add(walls);

            planModel.add(deckObject);

            return planModel;
        }

        function regeneratePlanModel(x, z) {
            self.remove(planModel_);
            planModel_ = generatePlanModel();
            planModel_.position.y = tools.planY;
            planModel_.position.x = x;
            planModel_.position.z = z;
            self.add(planModel_);

            planModel_.rotation.fromArray([0, angle_, 0]);
        }
    }
}

module.exports = Deck;
