const THREE = require('three');
const Deck = require('./Deck');
const tools = require('./../helpers/tools');
const _ = require('lodash');
const TextureGenerator = require('./../helpers/TextureGenerator');
const assets = require('./../helpers/assets');
const ClipGeometry = require('./../helpers/ClipGeometry');

const SQRT2 = Math.sqrt(2);

/**
 * Wrap-around object
 */
class WrapAround extends Deck {
    /**
     * Creates the wrap-around.
     * @param parameters parameter object as following (same as deck parameters, except width is always the same 12'):
     * {
     *       walls: Array,
     *       columns: Array,
     *       shedWidth: Number,
     *       shedDepth: Number,
     *       shedHeight: Number
     *  }, where:
     *          walls - array of shed's walls
     *          columns - array of shed columns
     *          shedWidth - width of the shed
     *          shedDepth - depth of the shed
     *          shedHeight - height of the shed
     */
    constructor(parameters) {
        const WALL_MAP_WIDTH = 4;
        const INNER_WALL_SIZE = tools.ft2cm(5);
        const width_ = tools.ft2cm(12);
        super(_.extend(parameters, {width: width_, dontInit: true}));
        let self = this;

        let wallsAreRemoved = false;

        let floorHorizontal_, floorVertical_;

        const THICKNESS = tools.in2cm(3.5);

        const FRONT_LEFT = 0, LEFT_BACK = 1, BACK_RIGHT = 2, RIGHT_FRONT = 3;
        let corner_ = FRONT_LEFT;
        let placementIsForbidden_ = false;
        let angle_ = 0;

        let shedWidth = parameters.shedWidth;
        let shedDepth = parameters.shedDepth;
        let shedHeight = parameters.shedHeight;
        let shedWalls = parameters.walls;
        let lastSetPosition_ = {x: shedWidth * 0.5, z: shedDepth * 0.5};
        let mainMaterial, main4Material, ceilMaterial, diagonalMaterial, columnMaterial;
        let railWalls_, rails_, visibleRails_ = [], railInfos_ = [];

        const railMaterial_ = new THREE.MeshPhongMaterial({color: 0x333333});

        //we got to shift it by 1, because of different column indexing
        let shedColumns_ = [];
        _.each(parameters.columns, (column)=> {
            shedColumns_.push(column);
        });
        shedColumns_.push(shedColumns_.shift());

        let textureGenerator_ = new TextureGenerator();
        let textureLoader = new THREE.TextureLoader();

        let container_;
        let innerWalls_ = [];

        const cornerNeighbors = {
            0: {left: 1, right: 0, afterLeft: 2, beforeRight: 3},
            1: {left: 2, right: 1, afterLeft: 3, beforeRight: 0},
            2: {left: 3, right: 2, afterLeft: 0, beforeRight: 1},
            3: {left: 0, right: 3, afterLeft: 1, beforeRight: 2}
        };

        const neighborSizes = {
            0: {left: shedDepth, right: shedWidth},
            1: {left: shedWidth, right: shedDepth},
            2: {left: shedDepth, right: shedWidth},
            3: {left: shedWidth, right: shedDepth}
        };


        const wallColumns = {
            0: {left: 0, right: 1},
            1: {left: 1, right: 2},
            2: {left: 2, right: 3},
            3: {left: 3, right: 0}
        };

        const positions_ = [
            {x: shedWidth * 0.5, z: shedDepth * 0.5},
            {x: shedWidth * 0.5, z: -shedDepth * 0.5},
            {x: -shedWidth * 0.5, z: -shedDepth * 0.5},
            {x: -shedWidth * 0.5, z: shedDepth * 0.5}];

        this.restoreWalls = restoreWalls;
        this.removeWall = ()=> {
            if (!wallsAreRemoved) {
                removeWalls();
                container_ = addWrapAround();
            }
        };
        this.setColor = setColor;

        Object.defineProperties(this, {
            boundingBox: {
                get: ()=> {
                    const cornerMap = {};
                    cornerMap[FRONT_LEFT] = cornerMap[RIGHT_FRONT] = ()=> {
                        return new THREE.Box3(new THREE.Vector3(-width_, 0, -width_), new THREE.Vector3(0, 100, 0))
                    };
                    cornerMap[LEFT_BACK] = cornerMap[BACK_RIGHT] = ()=> {
                        return new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(width_, 100, width_))
                    };

                    return cornerMap[corner_]();
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
                    if (container_) {
                        _.each(container_.children, (child)=> {
                            if (!child.material) {
                                return;
                            }
                            child.material.color = new THREE.Color(value ? 0xff0000 : 0xffffff);
                            child.material.needsUpdate = true;
                        })
                    }
                }
            },
            x: {
                get: ()=> {
                    return positions_[corner_].x;
                },
                set: (value)=> {
                    lastSetPosition_.x = value;
                }
            },
            z: {
                get: ()=> {
                    return positions_[corner_].z;
                },
                set: (value)=> {
                    if (!value) {
                        return;
                    }

                    restoreWalls();
                    setCorner(lastSetPosition_.x, value);
                    lastSetPosition_.z = value;
                    if (!wallsAreRemoved) {
                        removeWalls();
                        container_ = addWrapAround();
                    }

                    regeneratePlanModel(self.x, self.z);
                }
            },
            rotate: {
                set: (angle)=> {
                    //we should just keep an angle
                    angle_ = angle;
                },
                get: ()=> {
                    return [0, Math.PI * 0.5, Math.PI, -Math.PI * 0.5][corner_];
                }
            },
            size: {
                get: ()=> {
                    return width_;
                }
            },
            walls: {
                get: ()=> {
                    return innerWalls_;
                }
            },
            wallClones: {
                get: ()=> {
                    let angleMap = [0, Math.PI * 0.5, Math.PI, -Math.PI * 0.5];
                    let angle = angleMap[corner_];

                    return _.map(innerWalls_, (wall)=> {
                        let newWall = wall.clone();

                        let rotation = wall.rotation.toArray();
                        newWall.rotation.fromArray([0, angle + rotation[1], 0]);
                        newWall.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

                        newWall.original = wall;

                        return newWall;
                    });
                }
            },
            hasLeftWall: {
                get: ()=> {
                    return neighborSizes[corner_].left > width_;
                }
            },
            hasRightWall: {
                get: ()=> {
                    return neighborSizes[corner_].right > width_;
                }
            },
            type: {
                get: ()=> {
                    return "Wrap-around";
                }
            },
            railWalls: {
                get: ()=> {
                    return railWalls_;
                }
            },
            rails: {
                get: ()=> {
                    return railInfos_;
                }
            }
        });

        let planModel_ = generatePlanModel();
        planModel_.position.y = tools.planY;
        self.add(planModel_);

        /**
         * Adds wrap-around to the nearest corner by x and z coordinates
         */
        function setCorner(x, z) {
            let distances = [];
            _.each(positions_, (position)=> {
                distances.push(new THREE.Vector2(position.x, position.z).sub(new THREE.Vector2(x, z)).length());
            });

            let min = 999999;
            let minIndex = -1;
            _.each(distances, (distance, i)=> {
                if (distance < min) {
                    min = distance;
                    minIndex = i;
                }
            });

            corner_ = minIndex;
        }


        /**
         * Removes walls required for wrap-around
         */
        function removeWalls() {
            if (wallsAreRemoved) {
                return;
            }

            let leftSize = neighborSizes[corner_].left, rightSize = neighborSizes[corner_].right;

            shedWalls[cornerNeighbors[corner_].left].geometry.clip.push(-leftSize * 0.5, width_ - leftSize * 0.5);
            shedWalls[cornerNeighbors[corner_].right].geometry.clip.push(rightSize * 0.5 - width_, rightSize * 0.5);

            if (leftSize <= width_) {
                shedWalls[cornerNeighbors[corner_].afterLeft].geometry.clip.push(-rightSize * 0.5, tools.ft2cm(4) - rightSize * 0.5);
            }

            if (rightSize <= width_) {
                shedWalls[cornerNeighbors[corner_].beforeRight].geometry.clip.push(leftSize * 0.5 - tools.ft2cm(4), leftSize * 0.5);
            }

            shedColumns_[corner_].visible = false;

            if (leftSize <= width_) {
                let nextContainer = (corner_ < 3) ? corner_ + 1 : 0;
                shedColumns_[nextContainer].visible = false;
            }

            if (rightSize <= width_) {
                let previousCorner = (corner_ > 0) ? corner_ - 1 : 3;
                shedColumns_[previousCorner].visible = false;
            }

            wallsAreRemoved = true;
        }

        /**
         * Restores previously removed walls
         */
        function restoreWalls() {
            if (!wallsAreRemoved) {
                return;
            }

            if (container_) {
                self.remove(container_);
            }

            let leftSize = neighborSizes[corner_].left, rightSize = neighborSizes[corner_].right;

            shedWalls[cornerNeighbors[corner_].left].geometry.clip.pop();
            shedWalls[cornerNeighbors[corner_].right].geometry.clip.pop();

            if (neighborSizes[corner_].left <= width_) {
                shedWalls[cornerNeighbors[corner_].afterLeft].geometry.clip.pop();
            }

            if (neighborSizes[corner_].right <= width_) {
                shedWalls[cornerNeighbors[corner_].beforeRight].geometry.clip.pop();
            }

            innerWalls_ = [];

            shedColumns_[corner_].visible = true;

            if (leftSize <= width_) {
                let nextContainer = (corner_ < 3) ? corner_ + 1 : 0;
                shedColumns_[nextContainer].visible = true;
            }

            if (rightSize <= width_) {
                let previousCorner = (corner_ > 0) ? corner_ - 1 : 3;
                shedColumns_[previousCorner].visible = true;
            }

            wallsAreRemoved = false;
        }

        /**
         * Adds wrap-around elements, like walls and columns
         * @returns {Object3D}
         */
        function addWrapAround() {
            let leftSize = neighborSizes[corner_].left, rightSize = neighborSizes[corner_].right;

            let container = container_ || new THREE.Object3D();

            //don't mind it, it's correct, but variables have meaningless names because of pure math =)
            /**
             *         |
             *     e   | a
             *     ____|  _
             *     |  ╱    |
             *    e| ╱ d   | c
             * ____|╱     _|
             *   a
             *     |____|
             *        c
             */

            let a = INNER_WALL_SIZE;
            let c = width_ - tools.ft2cm(4) - a;
            let d = c * SQRT2;
            let e = d / (2 * SQRT2);

            let wall1, wall2, wall3, wall4, wall5, ceil;

            if (!container_) {
                mainMaterial = new THREE.MeshPhongMaterial();
                main4Material = new THREE.MeshPhongMaterial();
                diagonalMaterial = new THREE.MeshPhongMaterial();
                ceilMaterial = new THREE.MeshPhongMaterial();
                columnMaterial = new THREE.MeshPhongMaterial();

                wall1 = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(INNER_WALL_SIZE, shedHeight)), mainMaterial);
                container.add(wall1);

                wall2 = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(INNER_WALL_SIZE, shedHeight)), mainMaterial);
                container.add(wall2);

                wall3 = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(d, shedHeight)), diagonalMaterial);
                container.add(wall3);

                wall4 = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(tools.ft2cm(4), shedHeight)), main4Material);
                container.add(wall4);

                wall5 = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(tools.ft2cm(4), shedHeight)), main4Material);
                container.add(wall5);

                ceil = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(width_, width_)), ceilMaterial);
                container.add(ceil);
            } else {
                wall1 = container.children[0];
                wall2 = container.children[1];
                wall3 = container.children[2];
                wall4 = container.children[3];
                wall5 = container.children[4];
                ceil = container.children[5];

                while (container.children.length) {
                    container.remove(container.children[0]);
                }

                container.add(wall1);
                container.add(wall2);
                container.add(wall3);
                container.add(wall4);
                container.add(wall5);
                container.add(ceil);
            }

            wall1.position.setZ(leftSize * 0.5 - tools.ft2cm(4));
            wall1.position.setX(rightSize * 0.5 - width_ + INNER_WALL_SIZE * 0.5);
            wall1.position.setY(shedHeight * 0.5);

            wall2.position.setZ(leftSize * 0.5 - width_ + INNER_WALL_SIZE * 0.5);
            wall2.position.setX(rightSize * 0.5 - tools.ft2cm(4));
            wall2.position.setY(wall1.position.y);
            wall2.rotation.fromArray([0, Math.PI * 0.5, 0]);

            wall3.position.setZ(wall1.position.z - e);
            wall3.position.setX(wall2.position.x - e);
            wall3.position.setY(wall1.position.y);
            wall3.rotation.fromArray([0, Math.PI * 0.25, 0]);

            self.add(container);

            innerWalls_ = [wall1, wall2, wall3];

            wall4.position.setZ(leftSize * 0.5 - width_);
            wall4.position.setX(rightSize * 0.5 - tools.ft2cm(2));
            wall4.position.setY(wall1.position.y);


            if (leftSize > width_) {
                wall4.visible = true;
                innerWalls_.push(wall4);
            } else {
                wall4.visible = false;
            }

            wall5.position.setZ(leftSize * 0.5 - tools.ft2cm(2));
            wall5.position.setX(rightSize * 0.5 - width_);
            wall5.position.setY(wall1.position.y);
            wall5.rotation.fromArray([0, Math.PI * 0.5, 0]);

            if (rightSize > width_) {
                wall5.visible = true;
                innerWalls_.push(wall5);
            } else {
                wall5.visible = false;
            }

            ceil.position.setZ(leftSize * 0.5 - width_ * 0.5);
            ceil.position.setX(rightSize * 0.5 - width_ * 0.5);
            ceil.position.setY(shedHeight);
            ceil.rotation.fromArray([Math.PI * 0.5, 0, 0]);

            const angleMap = {
                0: ()=> {
                    container.rotation.fromArray([0, 0, 0]);
                }, 1: ()=> {
                    container.rotation.fromArray([0, Math.PI * 0.5, 0]);
                }, 2: ()=> {
                    container.rotation.fromArray([0, Math.PI, 0]);
                }, 3: ()=> {
                    container.rotation.fromArray([0, -Math.PI * 0.5, 0]);
                }
            };

            angleMap[corner_]();

            let cornerX = rightSize * 0.5 - 7;
            let cornerZ = leftSize * 0.5 - 7;
            let deckCenterX = (shedWidth - width_) * 0.5;
            let deckCenterZ = (shedDepth - width_) * 0.5;

            if (corner_ == 1 || corner_ == 3) {
                [deckCenterX, deckCenterZ] = [deckCenterZ, deckCenterX];
            }

            let column1 = new THREE.Mesh(new THREE.CubeGeometry(7, shedHeight, 7), columnMaterial);
            column1.position.setX(deckCenterX - width_ * 0.5);
            column1.position.setZ(leftSize * 0.5 - tools.ft2cm(4));
            column1.position.setY(shedHeight * 0.5);

            let column2 = column1.clone();
            column2.position.setX(rightSize * 0.5 - tools.ft2cm(4));
            column2.position.setZ(deckCenterZ - width_ * 0.5);

            container.add(column1);
            container.add(column2);

            let railWallMaterial = new THREE.MeshStandardMaterial({opacity: 0.01, transparent: true});
            let railWall1 = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4) - 7, shedHeight * 0.5 - 20), railWallMaterial);
            railWall1.position.x = rightSize * 0.5 - width_ * 0.5;
            railWall1.position.y = shedHeight * 0.25 + 10;
            railWall1.position.z = cornerZ;
            container.add(railWall1);

            let railWall2Width = (width_ - 7 - tools.ft2cm(4)) * 0.5;
            let railWall2 = new THREE.Mesh(new THREE.PlaneGeometry(railWall2Width, shedHeight * 0.5 - 20), railWallMaterial);
            railWall2.position.x = railWall1.position.x - tools.ft2cm(2) - 3.5 - railWall2Width * 0.5;
            railWall2.position.y = shedHeight * 0.25 + 10;
            railWall2.position.z = cornerZ;
            container.add(railWall2);

            let railWall3 = railWall2.clone();
            railWall3.position.x = cornerX - railWall2Width * 0.5;
            container.add(railWall3);

            let railWall4 = railWall1.clone();
            railWall4.rotateY(Math.PI * 0.5);
            railWall4.position.z = leftSize * 0.5 - width_ * 0.5;
            railWall4.position.x = cornerX;
            container.add(railWall4);

            let railWall5Width = (width_ - 7 - tools.ft2cm(4)) * 0.5;
            let railWall5 = new THREE.Mesh(new THREE.PlaneGeometry(railWall5Width, shedHeight * 0.5 - 20), railWallMaterial);
            railWall5.rotateY(Math.PI * 0.5);
            railWall5.position.x = cornerX;
            railWall5.position.y = shedHeight * 0.25 + 10;
            railWall5.position.z = cornerZ - railWall5Width * 0.5;
            container.add(railWall5);

            let railWall6 = railWall5.clone();
            railWall6.position.z = railWall4.position.z - tools.ft2cm(2) - 3.5 - railWall5Width * 0.5;
            container.add(railWall6);

            railWalls_ = [railWall1, railWall2, railWall3, railWall4, railWall5, railWall6];

            if (leftSize > width_) {
                let column3 = column1.clone();
                column3.position.setX(rightSize * 0.5);
                column3.position.setZ(deckCenterZ - width_ * 0.5);
                container.add(column3);
            } else {
                let railWall7 = railWall1.clone();
                railWall7.rotateY(Math.PI);
                railWall7.position.x = cornerX - tools.ft2cm(2);
                railWall7.position.z = -cornerZ;
                container.add(railWall7);
                railWalls_.push(railWall7);
            }

            if (rightSize > width_) {
                let column4 = column1.clone();
                column4.position.setX(deckCenterX - width_ * 0.5);
                column4.position.setZ(leftSize * 0.5);
                container.add(column4);
            } else {
                let railWall8 = railWall1.clone();
                railWall8.rotateY(-Math.PI * 0.5);
                railWall8.position.x = -cornerX;
                railWall8.position.z = cornerZ - tools.ft2cm(2);
                container.add(railWall8);
                railWalls_.push(railWall8);
            }

            rails_ = [];
            _.each(railWalls_, (railWall, i)=> {
                let rail = buildRail(railWall, i);
                container.add(rail);
                rails_.push(rail);
            });

            function getMiddleColumn() {
                return new THREE.Mesh(new THREE.BoxGeometry(7, shedHeight, 7), columnMaterial);
            }

            let columnX = [cornerX, cornerX, cornerX, deckCenterX - width_ / 6, deckCenterX + width_ / 6];
            let columnZ = [cornerZ, deckCenterZ - width_ / 6, deckCenterZ + width_ / 6, cornerZ, cornerZ];

            if (leftSize <= width_) {
                columnX.push(cornerX);
                columnZ.push(deckCenterZ - width_ * 0.5 + 7);
            }

            if (rightSize <= width_) {
                columnX.push(deckCenterX - width_ * 0.5 + 7);
                columnZ.push(cornerZ);
            }

            _.each(columnX, (x, i)=> {
                let column = getMiddleColumn();
                column.position.setX(columnX[i]);
                column.position.setZ(columnZ[i]);
                column.position.setY(column1.position.y);
                container.add(column);

                let box = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), columnMaterial);
                box.position.x = column.position.x;
                box.position.z = column.position.z;
                box.position.y = 7;
                container.add(box);
            });

            let trims = _.times(2, ()=> {
                let trim = new THREE.Object3D();
                let plane1 = new THREE.Mesh(new THREE.PlaneGeometry(7, shedHeight), columnMaterial);
                plane1.position.setX(-3.5);
                trim.add(plane1);
                let plane2 = new THREE.Mesh(new THREE.PlaneGeometry(7, shedHeight), columnMaterial);
                plane2.position.setX(7 / (2 * SQRT2));
                plane2.position.setZ(-plane2.position.x);
                plane2.rotateY(Math.PI * 0.25);
                trim.add(plane2);

                trim.position.setY(shedHeight * 0.5);

                container.add(trim);

                return trim;
            });

            trims[0].position.setX(wall1.position.x + INNER_WALL_SIZE * 0.5 + 0.1);
            trims[0].position.setZ(wall1.position.z + 0.1);

            trims[1].position.setX(wall2.position.x + 0.1);
            trims[1].position.setZ(wall2.position.z + INNER_WALL_SIZE * 0.5 + 0.1);
            trims[1].rotateY(Math.PI * 0.25);

            _.each(container.children, (child)=> {
                child.castShadow = child.receiveShadow = true;
            });

            return container;
        }

        function setColor(mainColor, secondaryColor) {
            Promise.all([
                textureGenerator_.getWall(mainColor),
                textureGenerator_.getWall(mainColor),
                textureGenerator_.getWall(mainColor),
                textureGenerator_.getWall(mainColor),
                textureGenerator_.getWood(secondaryColor, Math.PI * 0.5)
            ]).then((results)=> {
                let mainTexture = results[0];
                let main4Texture = results[1];
                let diagonalTexture = results[2];
                let ceilTexture = results[3];
                let columnTexture = results[4];
                let mainBump = textureLoader.load(assets.img["tiles_b"]);
                let main4Bump = textureLoader.load(assets.img["tiles_b"]);
                let diagonalBump = textureLoader.load(assets.img["tiles_b"]);
                let ceilBump = textureLoader.load(assets.img["tiles_b"]);
                let columnBump = textureLoader.load(assets.img["wood_b"]);

                _.each(results.concat([mainBump, main4Bump, diagonalBump, ceilBump, columnBump]), (texture)=> {
                    texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
                });

                let a = 5;
                let c = 12 - 4 - a;
                let d = c * SQRT2;

                mainTexture.repeat.x = mainBump.repeat.x = a / WALL_MAP_WIDTH;
                main4Texture.repeat.x = main4Bump.repeat.x = 4 / WALL_MAP_WIDTH;
                diagonalTexture.repeat.x = diagonalBump.repeat.x = d / WALL_MAP_WIDTH;
                ceilTexture.repeat.x = ceilBump.repeat.x = ceilTexture.repeat.y = width_ / WALL_MAP_WIDTH;
                columnTexture.repeat.y = columnBump.repeat.y = 25;

                _.each(_.zip(
                    [mainMaterial, main4Material, diagonalMaterial, ceilMaterial, columnMaterial],
                    [mainTexture, main4Texture, diagonalTexture, ceilTexture, columnTexture],
                    [mainBump, main4Bump, diagonalBump, ceilBump, columnBump]),
                    (zip)=> {
                        zip[0].map = zip[1];
                        zip[0].bumpMap = zip[2];
                        zip[0].needsUpdate = true;
                    });
            });
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

        function generatePlanModel() {
            let planModel = new THREE.Object3D();
            let deckObject = new THREE.Object3D();

            let bgVertices = [
                0, 0, 0,                                //0
                0, 0, -width_,                 //1
                -tools.ft2cm(4), 0, -width_,   //2
                -tools.ft2cm(4), 0, -tools.ft2cm(7),    //3
                -tools.ft2cm(7), 0, -tools.ft2cm(4),    //4
                -width_, 0, -tools.ft2cm(4),   //5
                -width_, 0, 0                  //6
            ];

            let bgIndices = [
                0, 1, 3,
                3, 1, 2,
                0, 3, 4,
                4, 5, 6,
                4, 6, 0
            ];

            let bgUVs = [
                1, 1,       //0
                1, 0,       //1
                0.66, 0,    //2
                0.66, 0.42, //3
                0.42, 0.66, //4
                0, 0.66,    //5
                0, 1,       //6
            ];

            let bgGeometry = new THREE.BufferGeometry();
            bgGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(bgVertices), 3));
            bgGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(bgUVs), 2));
            bgGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(bgIndices), 1));
            bgGeometry.computeVertexNormals();

            let bg = new THREE.Mesh(bgGeometry,
                new THREE.MeshBasicMaterial({color: 0xffffff}));
            bg.position.y = 5;
            deckObject.add(bg);

            const TGN = Math.tan(Math.PI / 8);

            let wallVertices = [
                -width_, 0, -tools.ft2cm(4),    //0
                -tools.ft2cm(7), 0, -tools.ft2cm(4),     //1
                -tools.ft2cm(4), 0, -tools.ft2cm(7),     //2
                -tools.ft2cm(4), 0, -width_,    //3
                -width_, 0, -tools.ft2cm(4) - THICKNESS,    //4
                -tools.ft2cm(7) - THICKNESS * TGN, 0, -tools.ft2cm(4) - THICKNESS,     //5
                -tools.ft2cm(4) - THICKNESS, 0, -tools.ft2cm(7) - THICKNESS * TGN,     //6
                -tools.ft2cm(4) - THICKNESS, 0, -width_,    //7
            ];

            let wallIndices = [
                0, 5, 4,
                0, 1, 5,
                1, 6, 5,
                1, 2, 6,
                2, 7, 6,
                2, 3, 7
            ];

            let wallGeometry = new THREE.BufferGeometry();
            wallGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(wallVertices), 3));
            wallGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(wallIndices), 1));
            wallGeometry.computeVertexNormals();

            let walls = new THREE.Mesh(wallGeometry,
                new THREE.MeshBasicMaterial({color: 0x000000}));
            deckObject.add(walls);

            if (self.hasLeftWall) {
                let wall = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4) + THICKNESS, THICKNESS), new THREE.MeshBasicMaterial({color: 0x000000}));
                wall.position.z = -width_ - THICKNESS * 0.5;
                wall.position.x = -tools.ft2cm(2) - THICKNESS * 0.5;
                wall.rotateX(-Math.PI * 0.5);
                deckObject.add(wall);
            }

            if (self.hasRightWall) {
                let wall = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4) + THICKNESS, THICKNESS), new THREE.MeshBasicMaterial({color: 0x000000}));
                wall.position.x = -width_ - THICKNESS * 0.5;
                wall.position.z = -tools.ft2cm(2) - THICKNESS * 0.5;
                wall.rotateX(-Math.PI * 0.5);
                wall.rotateZ(-Math.PI * 0.5);
                deckObject.add(wall);
            }

            let line1 = tools.getLine(width_, 0x555555);
            let line2 = line1.clone();

            line1.position.x = -width_ * 0.5;

            line2.position.z = -width_ * 0.5;
            line2.rotateY(-Math.PI * 0.5);

            deckObject.add(line1);
            deckObject.add(line2);

            let line3 = tools.getLine(tools.ft2cm(4), 0x555555);
            let line4 = line3.clone();

            line3.position.x = -width_;
            line3.position.z = -tools.ft2cm(2);
            line3.rotateY(-Math.PI * 0.5);

            line4.position.x = -tools.ft2cm(2);
            line4.position.z = -width_;

            deckObject.add(line3);
            deckObject.add(line4);

            //drawing rails
            _.each(self.rails, (rail)=> {
                let railWall = railWalls_[rail.index];
                let halfWidth = railWall.geometry.parameters.width * 0.5;
                let railRect = tools.getRectangle({
                    min: {x: -halfWidth, y: 0, z: -THICKNESS * 0.25},
                    max: {x: halfWidth, y: 10, z: THICKNESS * 0.25}
                });

                railRect.position.x = railWall.position.x - ((Math.abs(self.rotate) == Math.PI * 0.5) ? shedDepth : shedWidth) * 0.5;
                railRect.position.z = railWall.position.z - ((Math.abs(self.rotate) == Math.PI * 0.5) ? shedWidth : shedDepth) * 0.5;
                railRect.position.y = 7;
                railRect.rotation.fromArray(railWall.rotation.toArray());
                planModel.add(railRect)
            });

            if (!floorHorizontal_) {
                Promise.all([
                    textureGenerator_.getFloorPlan(Math.PI * 0.5),
                    textureGenerator_.getFloorPlan(0)
                ]).then((results)=> {
                    _.each(results, (texture, i)=> {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                        if (i == 0) {
                            texture.repeat.x = width_ / tools.ft2cm(WALL_MAP_WIDTH);
                        } else {
                            texture.repeat.y = width_ / tools.ft2cm(WALL_MAP_WIDTH);
                        }
                    });

                    floorHorizontal_ = results[0];
                    floorVertical_ = results[1];

                    if (self.rotate % Math.PI == 0) {
                        bg.material.map = floorHorizontal_;
                    } else {
                        bg.material.map = floorVertical_;
                    }
                    bg.material.needsUpdate = true;
                });
                floorHorizontal_ = 1;
            } else if (floorHorizontal_ != 1) {
                if (self.rotate % Math.PI == 0) {
                    bg.material.map = floorHorizontal_;
                } else {
                    bg.material.map = floorVertical_;
                }
                bg.material.needsUpdate = true;
            }

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

            planModel_.rotation.fromArray([0, [0, Math.PI * 0.5, Math.PI, -Math.PI * 0.5][corner_], 0]);
        }
    }
}

module.exports = WrapAround;
