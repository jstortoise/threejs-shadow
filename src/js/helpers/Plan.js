const THREE = require('three');
const tools = require('./tools');
const _ = require('lodash');
const ClipGeometry = require('./ClipGeometry');
const DraggableObject = require('./../objects/DraggableObject');
const Door = require('./../objects/Door');
const DeepDoor = require('./../objects/DeepDoor');
const Deck = require('./../objects/Deck');
const Grid = require('./../helpers/Grid');
const TextureGenerator = require('./../helpers/TextureGenerator');
const assets = require('./assets');
const WrapAround = require('./../objects/WrapAround');

let font_;

/**
 * Draws the 2D floor plan of the shed
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Plan extends THREE.Object3D {
    constructor(shedWidth, shedDepth, features) {
        super();

        let currentDrag_;
        let objects2D_ = [];
        let inObject2DMoveMode_ = false;

        const DRAG_STEP = tools.ft2cm(0.5);
        const WALL_MAP_WIDTH = tools.ft2cm(4);
        const DIRECTION_BOTTOM = 1;
        const DIRECTION_RIGHT = 2;
        const DIRECTION_TOP = 4;
        const DIRECTION_LEFT = 8;

        let self = this;
        let textureGenerator_ = new TextureGenerator();
        let textureLoader_ = new THREE.TextureLoader();

        let thickness_ = tools.in2cm(3.5);

        let itemArray = ["atv", "bed", "bike", "computer_table", "croquet", "kf-04", "lawn_mower", "lazyboy", "office_desk", "ping_pong", "sofa1", "sofa2", "toolbox", "tv", "wagon", "wheel_barrow", "work_bench"];

        let textureMap = {};
        let alphaMap = {};

        let fontLoader = new THREE.FontLoader();
        if (!font_) {
            fontLoader.load(assets.fonts.arial, function (font) {
                font_ = font;
            });
        }

        itemArray = _.filter(itemArray, (item)=> {
            return features['2d'][item] ? true : false;
        });

        _.each(itemArray, (item)=> {
            textureMap["2d-" + item] = textureLoader_.load(assets.img[item + "_t"]);
            alphaMap["2d-" + item] = textureLoader_.load(assets.img[item + "_o"]);
        });

        const itemMap = {
            "2d-atv": {width: tools.ft2cm(4), height: tools.ft2cm(4) * 1.5477},
            "2d-bed": {width: tools.ft2cm(5), height: tools.ft2cm(5) * 1.4353},
            "2d-bike": {width: tools.ft2cm(1.5), height: tools.ft2cm(1.5) * 2.47},
            "2d-computer_table": {width: tools.ft2cm(7), height: tools.ft2cm(7) * 0.791},
            "2d-croquet": {width: tools.ft2cm(2), height: tools.ft2cm(2) * 0.502},
            "2d-kf-04": {width: tools.ft2cm(2.5), height: tools.ft2cm(2.5) * 1.5759},
            "2d-lawn_mower": {width: tools.ft2cm(2), height: tools.ft2cm(2) * 3.037},
            "2d-lazyboy": {width: tools.ft2cm(3), height: tools.ft2cm(3) * 0.9551},
            "2d-office_desk": {width: tools.ft2cm(4), height: tools.ft2cm(4) * 1.0749},
            "2d-ping_pong": {width: tools.ft2cm(9), height: tools.ft2cm(9) * 0.6775},
            "2d-sofa1": {width: tools.ft2cm(8), height: tools.ft2cm(8) * 0.3415},
            "2d-sofa2": {width: tools.ft2cm(9) * 0.8802, height: tools.ft2cm(9)},
            "2d-toolbox": {width: tools.ft2cm(6.5) * 0.4158, height: tools.ft2cm(6.5)},
            "2d-tv": {width: tools.ft2cm(4.5), height: tools.ft2cm(4.5) * 0.3333},
            "2d-wagon": {width: tools.in2cm(18), height: tools.in2cm(18) * 2.1875},
            "2d-wheel_barrow": {width: tools.ft2cm(2.5), height: tools.ft2cm(2.5) * 2.2342},
            "2d-work_bench": {width: tools.ft2cm(6), height: tools.ft2cm(6) * 1.976},
        };

        const structures_ = ["loft"];

        let planBG = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshPhongMaterial({color: 0xffffff}));
        planBG.position.y = -10;
        planBG.rotateX(-Math.PI * 0.5);
        self.add(planBG);

        let grid_;

        let container_ = new THREE.Object3D();
        self.add(container_);

        let walls_ = new THREE.Object3D();
        container_.add(walls_);

        let measurements_ = new THREE.Object3D();
        container_.add(measurements_);

        Object.defineProperties(this, {
            drag: {
                get: ()=> {
                    let drag = {};
                    drag.drop = ()=> {
                        objects2D_.push(currentDrag_);
                        currentDrag_ = null;
                    };

                    Object.defineProperties(drag, {
                        x: {
                            get: ()=> {
                                return currentDrag_.position.x;
                            },
                            set: (value)=> {
                                value = value - value % DRAG_STEP;
                                currentDrag_.position.setX(value);
                            }
                        },
                        z: {
                            get: ()=> {
                                return currentDrag_.position.z;
                            },
                            set: (value)=> {
                                value = value - value % DRAG_STEP;
                                currentDrag_.position.setZ(value);
                            }
                        },
                        rotate: {
                            set: (value)=> {
                                currentDrag_.rotation.fromArray([0, value, 0]);
                            }
                        }
                    });

                    return drag;
                },
                set: (value)=> {
                    if (currentDrag_) {
                        container_.remove(currentDrag_);
                        currentDrag_ = null;
                    }

                    if (value) {
                        if (!itemMap[value] && !_.includes(structures_, value)) {
                            return;
                        }

                        if (itemMap[value]) {
                            currentDrag_ = new THREE.Mesh(new THREE.PlaneGeometry(itemMap[value].width, itemMap[value].height), new THREE.MeshBasicMaterial({
                                color: 0xffffff,
                                map: textureMap[value],
                                alphaMap: alphaMap[value],
                                transparent: true
                            }));

                            currentDrag_.rotateX(-Math.PI * 0.5);
                            currentDrag_.rotateZ(Math.PI * 0.5);

                            container_.add(currentDrag_);
                        } else {
                            if (value == "loft") {

                            }
                        }
                    }
                }
            },
            move: {
                get: ()=> {
                    let move = {};

                    move.cancel = ()=> {
                        currentDrag_ = null;
                        inObject2DMoveMode_ = false;
                    };

                    move.drop = ()=> {
                        currentDrag_ = null;
                        inObject2DMoveMode_ = false;
                    };

                    move.delete = ()=> {
                        container_.remove(currentDrag_);
                        currentDrag_ = null;
                        inObject2DMoveMode_ = false;
                    };

                    return move;
                },
                set: (value)=> {
                    currentDrag_ = value;
                    inObject2DMoveMode_ = true;
                }
            },
            objects2D: {
                get: ()=> {
                    return objects2D_;
                }
            },
            inMove: {
                get: ()=> {
                    return inObject2DMoveMode_;
                }
            },
            walls: {
                get: ()=> {
                    return walls_.children.slice();
                }
            }
        });

        /**
         * Draw the lines that correspondent to the the mesh in 3D space
         * @param mesh Mesh object for which plan should be build
         */
        this.drawWall = (mesh)=> {
            if (mesh.geometry instanceof ClipGeometry) {
                if (!mesh.geometry.boundingBox) {
                    mesh.geometry.computeBoundingBox();
                }
                let bbox = mesh.geometry.boundingBox;
                let width = Math.max(bbox.max.z - bbox.min.z, bbox.max.x - bbox.min.x);

                const WHITE_WIDTH = 150;
                let wall = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(width, thickness_)), new THREE.MeshPhongMaterial({color: 0}));
                let white = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(width, WHITE_WIDTH)), new THREE.MeshPhongMaterial({
                    color: 0xffff00,
                    transparent: true,
                    opacity: 0
                }));
                //let rectangles = mesh.geometry.clip.rectangles;

                /*_.each(rectangles, (rectangle)=> {
                 wall.geometry.clip.push(rectangle.min, rectangle.max);
                 white.geometry.clip.push(rectangle.min, rectangle.max);
                 });*/

                wall.rotateX(-Math.PI * 0.5);
                white.rotateX(-Math.PI * 0.5);
                white.position.z = WHITE_WIDTH * 0.5;

                let shift = {x: 0, z: 0};
                let angleMap = {};
                angleMap[0] = ()=> {
                    shift.z -= thickness_ * 0.5;
                };
                angleMap[Math.PI * 0.5] = ()=> {
                    shift.x -= thickness_ * 0.5;
                };
                angleMap[Math.PI] = ()=> {
                    shift.z += thickness_ * 0.5;
                };
                angleMap[-Math.PI * 0.5] = ()=> {
                    shift.x += thickness_ * 0.5;
                };

                let angle = tools.getAngleByRotation(mesh.rotation);
                if (angleMap[angle]) {
                    angleMap[angle]();
                } else {
                    shift.x -= thickness_ * 0.5;
                    shift.z -= thickness_ * 0.5;
                }

                let wallContainer = new THREE.Object3D();
                wallContainer.add(white);
                wallContainer.add(wall);
                wallContainer.rotation.fromArray(mesh.rotation.toArray());
                wallContainer.position.x = mesh.position.x + shift.x;
                wallContainer.position.z = mesh.position.z + shift.z;

                walls_.add(wallContainer);
                walls_.position.setY(20);
            }
        };

        /**
         * Draw plan elements for Each object in array
         * @param array Array of meshes, doors and windows
         */
        this.drawElements = (array)=> {
            _.each(array, (mesh)=> {
                if (mesh instanceof Door || mesh instanceof DeepDoor) {
                    //self.drawDoor(mesh);
                } else if (mesh instanceof WrapAround) {
                    //self.drawWrapAround(mesh);
                } else if (mesh instanceof Deck) {
                    //self.drawDeck(mesh);
                } else {
                    self.drawWall(mesh);
                }
            });
        };

        /**
         * Draws the door object on the plan
         * @param door
         */
        this.drawDoor = (door)=> {
            let bbox = door.planBox || door.boundingBox;
            let width = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z);

            let isRollUp = door.type.indexOf("roll") >= 0;
            let isDouble = !isRollUp && width >= tools.ft2cm(6);

            let doorDrawing = new THREE.Object3D();

            let whiteLine = new THREE.Mesh(new THREE.PlaneGeometry(width, thickness_), new THREE.MeshPhongMaterial({color: 0xffffff}));
            whiteLine.rotateX(-Math.PI * 0.5);
            whiteLine.position.y = 25;
            whiteLine.position.z = -thickness_ * 0.5;
            doorDrawing.add(whiteLine);

            if (isRollUp) {
                let rectangle = tools.getRectangle(new THREE.Box3(new THREE.Vector3(-width * 0.5, 0, thickness_ * 0.5), new THREE.Vector3(width * 0.5, 10, 0)), 0x555555);
                rectangle.position.z = -thickness_ * 0.9;
                rectangle.position.y = 25;
                doorDrawing.add(rectangle);
            } else {
                let line1 = new THREE.Mesh(new THREE.PlaneGeometry(width * (isDouble ? 0.5 : 1), 5), new THREE.MeshPhongMaterial({color: 0x333333}));
                line1.rotateZ(Math.PI * 0.5);
                line1.rotateY(Math.PI * 0.5);
                line1.position.z = (door.orientation & Door.SWING_OUT) ?
                    (width * (isDouble ? 0.25 : 0.5)) :
                    (-thickness_ - width * (isDouble ? 0.25 : 0.5));

                line1.position.x = (door.orientation & Door.ORIENTATION_LEFT ? 1 : -1) * width * 0.5;

                if (door.orientation & Door.SWING_IN) {
                    line1.position.x *= -1;
                }

                line1.position.y = 0;
                doorDrawing.add(line1);

                if (isDouble) {
                    let line2 = line1.clone();
                    let k = 1;
                    if (door.orientation & Door.ORIENTATION_LEFT) {
                        k *= -1
                    }
                    if (door.orientation & Door.SWING_IN) {
                        k *= -1;
                    }
                    line2.position.x = k * width * 0.5;
                    doorDrawing.add(line2);
                }

                let gridEdge = tools.getLine(width, 0x98e3f8);
                gridEdge.position.z = -thickness_;
                gridEdge.position.y = 21;
                doorDrawing.add(gridEdge);

                let curve1 = tools.getCurve(width * (isDouble ? 0.5 : 1), 0x555555);
                curve1.position.x = -width * 0.5;
                doorDrawing.add(curve1);

                if (door.orientation & Door.ORIENTATION_LEFT) {
                    curve1.scale.x = -1;
                    curve1.position.x *= -1;
                }

                if (door.orientation & Door.SWING_IN) {
                    curve1.position.z = -thickness_;
                    curve1.scale.y = -1;
                    curve1.scale.x *= -1;
                    curve1.position.x *= -1;
                }

                if (isDouble) {
                    let curve2 = curve1.clone();
                    curve2.scale.x = -curve1.scale.x;
                    let k = 1;
                    if (door.orientation & Door.ORIENTATION_LEFT) {
                        k *= -1
                    }
                    if (door.orientation & Door.SWING_IN) {
                        k *= -1;
                    }
                    curve2.position.x = k * width * 0.5;
                    doorDrawing.add(curve2);
                }
            }

            doorDrawing.position.x = door.x;
            doorDrawing.position.z = door.z;
            doorDrawing.rotation.fromArray(door.rotation.toArray());

            container_.add(doorDrawing);
        };

        this.drawWrapAround = (wrapAround)=> {
            let deckObject = new THREE.Object3D();

            let bgVertices = [
                0, 0, 0,                                      //0
                0, 0, -wrapAround.size,                    //1
                -tools.ft2cm(4), 0, -wrapAround.size,   //2
                -tools.ft2cm(4), 0, -tools.ft2cm(7),    //3
                -tools.ft2cm(7), 0, -tools.ft2cm(4),    //4
                -wrapAround.size, 0, -tools.ft2cm(4),   //5
                -wrapAround.size, 0, 0                     //6
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
            bg.position.y = -5;
            deckObject.add(bg);

            const TGN = Math.tan(Math.PI / 8);

            let wallVertices = [
                -wrapAround.size, 0, -tools.ft2cm(4),    //0
                -tools.ft2cm(7), 0, -tools.ft2cm(4),     //1
                -tools.ft2cm(4), 0, -tools.ft2cm(7),     //2
                -tools.ft2cm(4), 0, -wrapAround.size,    //3
                -wrapAround.size, 0, -tools.ft2cm(4) - thickness_,    //4
                -tools.ft2cm(7) - thickness_ * TGN, 0, -tools.ft2cm(4) - thickness_,     //5
                -tools.ft2cm(4) - thickness_, 0, -tools.ft2cm(7) - thickness_ * TGN,     //6
                -tools.ft2cm(4) - thickness_, 0, -wrapAround.size,    //7
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

            if (wrapAround.hasLeftWall) {
                let wall = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4) + thickness_, thickness_), new THREE.MeshBasicMaterial({color: 0x000000}));
                wall.position.z = -wrapAround.size - thickness_ * 0.5;
                wall.position.x = -tools.ft2cm(2) - thickness_ * 0.5;
                wall.rotateX(-Math.PI * 0.5);
                deckObject.add(wall);
            }

            if (wrapAround.hasRightWall) {
                let wall = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4) + thickness_, thickness_), new THREE.MeshBasicMaterial({color: 0x000000}));
                wall.position.x = -wrapAround.size - thickness_ * 0.5;
                wall.position.z = -tools.ft2cm(2) - thickness_ * 0.5;
                wall.rotateX(-Math.PI * 0.5);
                wall.rotateZ(-Math.PI * 0.5);
                deckObject.add(wall);
            }

            deckObject.rotateY(wrapAround.rotate);
            deckObject.position.setX(wrapAround.x);
            deckObject.position.setZ(wrapAround.z);

            /* let rect = Plan.getRectangle(wrapAround.boundingBox, 0x555555);
             rect.position.x = -(wrapAround.boundingBox.min.x + wrapAround.boundingBox.max.x) * 0.5;
             rect.position.z = -(wrapAround.boundingBox.min.z + wrapAround.boundingBox.max.z) * 0.5;
             rect.position.y = -1;
             deckObject.add(rect);*/

            let line1 = tools.getLine(wrapAround.size, 0x555555);
            let line2 = line1.clone();

            line1.position.x = -wrapAround.size * 0.5;

            line2.position.z = -wrapAround.size * 0.5;
            line2.rotateY(-Math.PI * 0.5);

            deckObject.add(line1);
            deckObject.add(line2);

            let line3 = tools.getLine(tools.ft2cm(4), 0x555555);
            let line4 = line3.clone();

            line3.position.x = -wrapAround.size;
            line3.position.z = -tools.ft2cm(2);
            line3.rotateY(-Math.PI * 0.5);

            line4.position.x = -tools.ft2cm(2);
            line4.position.z = -wrapAround.size;

            deckObject.add(line3);
            deckObject.add(line4);

            //drawing rails
            let railWalls = wrapAround.railWalls;
            _.each(wrapAround.rails, (rail)=> {
                let railWall = railWalls[rail.index];
                let halfWidth = railWall.geometry.parameters.width * 0.5;
                let railRect = tools.getRectangle({
                    min: {x: -halfWidth, y: 0, z: -thickness_ * 0.25},
                    max: {x: halfWidth, y: 10, z: thickness_ * 0.25}
                });
                railRect.position.x = railWall.position.x;
                railRect.position.z = railWall.position.z;
                railRect.position.y = 1;
                railRect.rotation.fromArray(railWall.rotation.toArray());
                container_.add(railRect)
            });

            textureGenerator_.getFloorPlan(wrapAround.rotate + Math.PI * 0.5).then((texture)=> {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                if (wrapAround.rotate % Math.PI == 0) {
                    texture.repeat.x = wrapAround.size / WALL_MAP_WIDTH;
                } else {
                    texture.repeat.y = wrapAround.size / WALL_MAP_WIDTH;
                }
                bg.material.map = texture;
                bg.material.needsUpdate = true;
            });

            container_.add(deckObject);
        };

        this.drawDeck = (deck)=> {

            let angle = deck.rotate;

            let bbox = new THREE.Box3(new THREE.Vector3(-deck.size * 0.5, 0, 0), new THREE.Vector3(deck.size * 0.5, 10, tools.ft2cm(4)));
            let width = bbox.max.x - bbox.min.x;
            let depth = bbox.max.z - bbox.min.z;

            let deckObject = new THREE.Object3D();
            let bg = new THREE.Mesh(new THREE.PlaneGeometry(angle % Math.PI == 0 ? width : depth, angle % Math.PI == 0 ? depth : width),
                new THREE.MeshBasicMaterial({color: 0xffffff}));
            bg.position.y = -5;
            bg.position.z = -tools.ft2cm(2);
            bg.rotateX(-Math.PI * 0.5);
            if (Math.abs(angle) == Math.PI * 0.5) {
                bg.rotateZ(-Math.PI * 0.5);
            }
            deckObject.add(bg);

            textureGenerator_.getFloorPlan().then((texture)=> {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                if (angle % Math.PI == 0) {
                    texture.repeat.x = width / WALL_MAP_WIDTH;
                } else {
                    texture.repeat.z = width / WALL_MAP_WIDTH;
                }
                bg.material.map = texture;
                bg.material.needsUpdate = true;
            });

            let rect = tools.getRectangle(bbox, 0x555555);
            rect.position.x = 0;
            rect.position.z = -depth;
            rect.position.y = -1;
            deckObject.add(rect);

            let walls = new THREE.Object3D();

            let wall1 = new THREE.Mesh(new THREE.PlaneGeometry(deck.size, thickness_), new THREE.LineBasicMaterial({color: 0x0}));
            wall1.position.z = -tools.ft2cm(4) - thickness_ * 0.5;
            wall1.rotateX(-Math.PI * 0.5);
            walls.add(wall1);

            if (deck.hasLeftWall) {
                let wall2 = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4), thickness_), new THREE.LineBasicMaterial({color: 0x0}));
                wall2.position.x = -deck.size * 0.5 - thickness_ * 0.5;
                wall2.position.z = -depth * 0.5 - thickness_;
                wall2.rotateX(-Math.PI * 0.5);
                wall2.rotateZ(Math.PI * 0.5);
                walls.add(wall2);
            }

            if (deck.hasRightWall) {
                let wall3 = new THREE.Mesh(new THREE.PlaneGeometry(tools.ft2cm(4), thickness_), new THREE.LineBasicMaterial({color: 0x0}));
                wall3.position.x = deck.size * 0.5 + thickness_ * 0.5;
                wall3.position.z = -depth * 0.5 - thickness_;
                wall3.rotateX(-Math.PI * 0.5);
                wall3.rotateZ(Math.PI * 0.5);
                walls.add(wall3);
            }

            //drawing rails
            let railWalls = deck.railWalls;
            _.each(deck.rails, (rail)=> {
                let railWall = railWalls[rail.index];
                let halfWidth = railWall.geometry.parameters.width * 0.5;
                let railRect = tools.getRectangle({
                    min: {x: -halfWidth, y: 0, z: -thickness_ * 0.25},
                    max: {x: halfWidth, y: 10, z: thickness_ * 0.25}
                });
                railRect.position.x = railWall.position.x;
                railRect.position.z = railWall.position.z;
                railRect.position.y = 1;
                railRect.rotation.fromArray(railWall.rotation.toArray());
                container_.add(railRect)
            });

            //walls.rotateY(angle);
            deckObject.add(walls);
            deckObject.rotateY(angle);
            deckObject.position.x = deck.x;
            deckObject.position.z = deck.z;

            container_.add(deckObject);
        };

        this.drawMeasurements = (objects)=> {
            let frontObjects = [], leftObjects = [], backObjects = [], rightObjects = [];
            let walls = [];

            let shedBox = {
                min: {x: -shedWidth * 0.5, z: -shedDepth * 0.5},
                max: {x: shedWidth * 0.5, z: shedDepth * 0.5}
            };

            objects = _.filter(objects, (object)=> {
                return !object.type || object.type.indexOf("gable") < 0;
            });

            //object measurements
            _.each(objects, (object)=> {
                let width;

                if (object instanceof DraggableObject) {
                    let bbox = object.planBox || object.boundingBox;
                    width = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z);
                } else if (object instanceof Deck) {
                    width = object.width;
                } else {
                    walls.push(object);
                    return;
                }

                let angleMap = {};
                let direction;
                angleMap[0] = angleMap[Math.PI * 0.25] = ()=> {
                    direction = DIRECTION_BOTTOM;
                    frontObjects.push(object);

                };
                angleMap[Math.PI * 0.5] = angleMap[Math.PI * 0.75] = ()=> {
                    direction = DIRECTION_RIGHT;
                    leftObjects.push(object);

                };
                angleMap[Math.PI] = angleMap[-Math.PI * 0.75] = ()=> {
                    direction = DIRECTION_TOP;
                    backObjects.push(object);

                };
                angleMap[-Math.PI * 0.5] = angleMap[-Math.PI * 0.25] = ()=> {
                    direction = DIRECTION_LEFT;
                    rightObjects.push(object);

                };

                let angle = object.rotate;
                angleMap[angle]();

                if (object instanceof Deck) {
                    angleMap[0] = ()=> {
                        //if (object.x + object.size * 0.5 == shedBox.max.x) {
                        leftObjects.push(object);
                        //}
                        //if (object.x - object.size * 0.5 == shedBox.min.x) {
                        rightObjects.push(object);
                        //}
                    };

                    angleMap[Math.PI] = ()=> {
                        //if (object.x + object.size * 0.5 == shedBox.max.x) {
                        rightObjects.push(object);
                        //}
                        //if (object.x - object.size * 0.5 == shedBox.min.x) {
                        leftObjects.push(object);
                        //}
                    };

                    angleMap[Math.PI * 0.5] = ()=> {
                        //if (object.z + object.size * 0.5 == shedBox.max.z) {
                        frontObjects.push(object);
                        //}
                        //if (object.z - object.size * 0.5 == shedBox.min.z) {
                        backObjects.push(object);
                        //}
                    };

                    angleMap[-Math.PI * 0.5] = ()=> {
                        //if (object.z + object.size * 0.5 == shedBox.max.z) {
                        backObjects.push(object);
                        //}
                        //if (object.z - object.size * 0.5 == shedBox.min.z) {
                        frontObjects.push(object);
                        //}
                    };

                    angleMap[angle]();
                }
            });

            drawGrid();

            // wall measurements
            _.each(walls, (wall)=> {
                wall.geometry.computeBoundingBox();
                let bbox = wall.geometry.boundingBox;
                let wallWidth = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z);
                wallWidth = Math.round(wallWidth * 100) / 100;

                if (wallWidth == tools.ft2cm(4)) {
                    return;
                }

                let angle = tools.getAngleByRotation(wall.rotation);
                let angleMap = {};
                let direction;
                let wallObjects;
                angleMap[0] = angleMap[Math.PI * 0.25] = ()=> {
                    wallObjects = frontObjects;
                    direction = DIRECTION_BOTTOM;
                };
                angleMap[Math.PI * 0.5] = angleMap[Math.PI * 0.75] = ()=> {
                    wallObjects = leftObjects;
                    direction = DIRECTION_RIGHT;
                };
                angleMap[Math.PI] = angleMap[-Math.PI * 0.75] = ()=> {
                    wallObjects = backObjects;
                    direction = DIRECTION_TOP;
                };
                angleMap[-Math.PI * 0.5] = angleMap[-Math.PI * 0.25] = ()=> {
                    wallObjects = rightObjects;
                    direction = DIRECTION_LEFT;
                };

                angleMap[angle]();

                let geometry = (wall.geometry instanceof ClipGeometry) ? (wall.geometry.clone()) : (new ClipGeometry(wall.geometry));
                _.each(wallObjects, (wallObject)=> {
                    let objectWidth = 0;
                    if (wallObject instanceof Deck) {
                        if (angle == wallObject.rotate) {
                            objectWidth = wallObject.size;
                        } else {
                            objectWidth = tools.ft2cm(4);
                        }
                    } else {
                        let wbbox = wallObject.planBox || wallObject.boundingBox;
                        objectWidth = Math.max(wbbox.max.x - wbbox.min.x, wbbox.max.z - wbbox.min.z);
                    }

                    if (wallObject instanceof Deck) {
                        if (angle != wallObject.rotate) {
                            let angleMap = {};
                            angleMap[0] = {};
                            angleMap[Math.PI * 0.5] = {};
                            angleMap[Math.PI] = {};
                            angleMap[-Math.PI * 0.5] = {};

                            angleMap[0][Math.PI * 0.5] = angleMap[Math.PI][-Math.PI * 0.5] = ()=> {
                                geometry.clip.push(shedWidth * 0.5 - objectWidth, shedWidth * 0.5);
                            };
                            angleMap[0][-Math.PI * 0.5] = angleMap[Math.PI][Math.PI * 0.5] = ()=> {
                                geometry.clip.push(-shedWidth * 0.5, -shedWidth * 0.5 + objectWidth);
                            };
                            angleMap[Math.PI * 0.5][0] = angleMap[-Math.PI * 0.5][Math.PI] = ()=> {
                                geometry.clip.push(-shedDepth * 0.5, -shedDepth * 0.5 + objectWidth);
                            };
                            angleMap[Math.PI * 0.5][Math.PI] = angleMap[-Math.PI * 0.5][0] = ()=> {
                                geometry.clip.push(shedDepth * 0.5 - objectWidth, shedDepth * 0.5);
                            };

                            angleMap[angle][wallObject.rotate]();
                        }
                        return;
                    }

                    if (wallObject instanceof DeepDoor) {
                        return;
                    }

                    if (Math.abs(angle) == Math.PI * 0.5) {
                        if (angle > 0) {
                            geometry.clip.push(-wallObject.z - objectWidth * 0.5 + wall.position.z, -wallObject.z + objectWidth * 0.5 + wall.position.z);
                        } else {
                            geometry.clip.push(wallObject.z - objectWidth * 0.5 + wall.position.z, wallObject.z + objectWidth * 0.5 + wall.position.z);
                        }
                    } else {
                        if (angle == 0) {
                            geometry.clip.push(wallObject.x - objectWidth * 0.5 + wall.position.x, wallObject.x + objectWidth * 0.5 + wall.position.x);
                        } else {
                            geometry.clip.push(-wallObject.x - objectWidth * 0.5 + wall.position.x, -wallObject.x + objectWidth * 0.5 + wall.position.x);
                        }
                    }
                });

                let areas = _.filter(geometry.clip.areas, (area)=> {
                    return area.width != 0;
                });

                _.each(areas, (area, i)=> {

                    if (i > 0) {
                        let previous = areas[i - 1];
                        let emptyArea = {
                            center: (previous.center + previous.width * 0.5 + area.center - area.width * 0.5) * 0.5,
                            width: area.center - area.width * 0.5 - (previous.center + previous.width * 0.5)
                        };
                        if (Math.abs(emptyArea.width) > 0.01) {
                            placeAreaMeasurement(emptyArea);
                        }
                    } else {
                        let emptyArea = {
                            center: (-wallWidth * 0.5 + area.center - area.width * 0.5) * 0.5,
                            width: area.center - area.width * 0.5 + wallWidth * 0.5
                        };
                        if (Math.abs(emptyArea.width) > 0.01) {
                            placeAreaMeasurement(emptyArea);
                        }
                    }

                    function placeAreaMeasurement(area) {
                        let measurement = getMeasurement(area.width, 0x555555, 20, direction);
                        angleMap[0] = ()=> {
                            measurement.position.x += area.center + wall.position.x;
                            measurement.position.z += shedBox.max.z;
                        };
                        angleMap[Math.PI * 0.5] = ()=> {
                            measurement.position.x += shedBox.max.x;
                            measurement.position.z += -area.center + wall.position.z;
                        };
                        angleMap[Math.PI] = ()=> {
                            measurement.position.x += -area.center + wall.position.x;
                            measurement.position.z += shedBox.min.z;
                        };
                        angleMap[-Math.PI * 0.5] = ()=> {
                            measurement.position.x += shedBox.min.x;
                            measurement.position.z += area.center + wall.position.z;
                        };

                        angleMap[angle]();

                        measurement.position.y = 20;
                        measurement.rotation.fromArray(wall.rotation.toArray());
                        measurements_.add(measurement);
                    }

                    placeAreaMeasurement(area);

                    if (i == areas.length - 1 && area.center + area.width * 0.5 < wallWidth * 0.5) {
                        let emptyArea = {
                            center: (area.center + area.width * 0.5 + wallWidth * 0.5) * 0.5,
                            width: wallWidth * 0.5 - (area.center + area.width * 0.5)
                        };
                        if (Math.abs(emptyArea.width) > 0.01) {
                            placeAreaMeasurement(emptyArea);
                        }
                    }
                });
            });
        };

        /**
         * Removes all drawn elements from the plan
         */
        this.clear = ()=> {
            for (let i = container_.children.length - 1; i >= 0; i--) {
                container_.remove(container_.children[i]);
            }

            walls_ = new THREE.Object3D();
            container_.add(walls_);

            measurements_ = new THREE.Object3D();
            container_.add(measurements_);
        };

        /**
         * Draws a grid inside the shed
         */
        function drawGrid() {
            try {
                self.remove(grid_);
            } catch (e) {
            }

            let foot = tools.ft2cm(1);
            grid_ = new Grid(shedWidth + foot, shedDepth + foot, foot * 0.5);
            grid_.color = new THREE.Color(0x98e3f8);
            grid_.rotateX(Math.PI * 0.5);
            grid_.position.y = -10;
            self.add(grid_);
        }

        function getMeasurement(size, color = 0x555555, distance, direction) {
            let measurement = new THREE.Object3D();
            let mainLine = tools.getLine(size, color);

            let line1 = tools.getLine(distance + 5, color);
            line1.rotateY(Math.PI * 0.5);
            line1.position.z = -distance * 0.5 + 5;
            line1.position.x = -size * 0.5;

            let line2 = line1.clone();
            line2.position.x *= -1;

            measurement.add(mainLine);
            measurement.add(line1);
            measurement.add(line2);

            let vertices = [
                0, 0, 0,    //0
                9, 0, 3,    //1
                9, 0, -3    //2
            ];

            let indices = [0, 1, 2];

            let arrowGeometry = new THREE.BufferGeometry();
            arrowGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            arrowGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            arrowGeometry.computeVertexNormals();

            let material = new THREE.MeshPhongMaterial({color: color, shininess: 0});

            let arrow1 = new THREE.Mesh(arrowGeometry, material);
            arrow1.position.x = -size * 0.5;
            arrow1.position.y = 1;
            measurement.add(arrow1);

            let arrow2 = arrow1.clone();
            arrow2.scale.x = -1;
            arrow2.scale.z = -1;
            arrow2.position.x = size * 0.5;
            measurement.add(arrow2);

            function addText() {
                let text = new THREE.Mesh(new THREE.TextGeometry(tools.cm2ft(size), {
                    font: font_,
                    size: 15,
                    height: 0.5
                }), material);
                text.rotateX(-Math.PI * 0.5);
                measurement.add(text);

                text.geometry.computeBoundingBox();
                let bbox = text.geometry.boundingBox;
                let width = bbox.max.x - bbox.min.x;
                let height = bbox.max.y - bbox.min.y;

                let directionMap = {};
                directionMap[DIRECTION_BOTTOM] = ()=> {
                    text.rotateZ(Math.PI * 0.5);
                    text.position.x = height * 0.5;
                    text.position.z = width + 15;
                };
                directionMap[DIRECTION_LEFT] = ()=> {
                    text.rotateZ(Math.PI);
                    text.position.x = width * 0.5;
                    text.position.z = 15;
                };
                directionMap[DIRECTION_TOP] = ()=> {
                    text.rotateZ(-Math.PI * 0.5);
                    text.position.x = -height * 0.5;
                    text.position.z = 15;
                };
                directionMap[DIRECTION_RIGHT] = ()=> {
                    text.position.x = -width * 0.5;
                    text.position.z = height + 15;
                };
                directionMap[direction]();
            }

            if (font_) {
                addText();
            } else {
                fontLoader.load(assets.fonts.arial, function (font) {
                    font_ = font;
                    addText();
                });
            }


            let directionMap = {};
            directionMap[DIRECTION_BOTTOM] = ()=> {
                measurement.position.z += distance + 10;
            };
            directionMap[DIRECTION_LEFT] = ()=> {
                measurement.position.x -= distance + 10;
            };
            directionMap[DIRECTION_TOP] = ()=> {
                measurement.position.z -= distance + 10;
            };
            directionMap[DIRECTION_RIGHT] = ()=> {
                measurement.position.x += distance + 10;
            };
            directionMap[direction]();

            return measurement;
        }
    }
}

module.exports = Plan;
