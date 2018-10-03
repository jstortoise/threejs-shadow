const THREE = require('three');
const OrbitControl = require('./helpers/OrbitControl');
const Environment = require('./environment/Environment');
const Shed = require('./shedParts/Shed');
const TWEEN = require('@tweenjs/tween.js');
const _ = require('lodash');
const tools = require('./helpers/tools');
const ClipGeometry = require('./helpers/ClipGeometry');
const Loader = require('./helpers/loader');
const Control2D = require('./helpers/Control2D');
const menu = require('./helpers/Menu');
const Window = require('./objects/Window');
const Deck = require('./objects/Deck');
const Door = require('./objects/Door');
const Loft = require('./objects/Loft');
const DeepDoor = require('./objects/DeepDoor');
const EventDispatcher = require('./helpers/EventDispatcher');
const colors = require('./helpers/colors');
const Stats = require('three-stats').Stats;
const imageManager = require('./helpers/imageManager');
const DraggableObject = require('./objects/DraggableObject');

let TouchEvent = function () {
};

if (window.hasOwnProperty("TouchEvent")) {
    TouchEvent = window.TouchEvent;
}

THREE.ImageUtils.crossOrigin = 'anonymous';
THREE.TextureLoader.prototype.crossOrigin = 'anonymous';

/**
 * Main 3D viewer class, contains renderer and all other objects, like shed, etc.
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Viewer3D extends EventDispatcher {
    /**
     * Initialies 3D viewer
     * @param _width Width of the viewer in pixels
     * @param _height Height of the viewer in pixels
     * @param features filter of available features. Shed styles and doors/windows objects are here
     */
    constructor(_width = window.innerWidth, _height = window.innerHeight, features) {
        super();

        //orthogonal camera width
        const oWidth = 1500;

        let scene_, camera_, renderer_, shed_, control3D_, control2D_, environment_, cubeCamera_, ghost_, pCamera_,
            oCamera_, stats_;
        let element_;
        let self = this;
        let touchDragOver_;
        let isLoaded = false;
        let viewCams_ = [];

        /**
         * Shows if render function should render a frame
         * @type {boolean}
         * @private
         */
        let shouldRender_ = false;
        let renderStarted_ = false;

        /**
         * The amount of frames to be rendered. It will render these frames, even if shouldRender_ is set to false
         * @type {number}
         * @private
         */
        let renderFrameCount_ = 100;
        let raycaster_ = new THREE.Raycaster();
        let mouseVector_ = new THREE.Vector3();
        let inObjectMoveMode_ = false, nextTouchIsObjectMove_ = false;
        let mousePosition_ = new THREE.Vector3();

        let rBoxWalls_, raycastWalls_;

        let shuttersAreEnabled_ = true, flowerBoxesAreEnabled_ = true;

        /**
         * Initializes environment, cameras, renderer, controls
         */
        function init() {
            scene_ = new THREE.Scene();
            stats_ = new Stats();

            let aspect = _width / _height;

            camera_ = new THREE.PerspectiveCamera(60, aspect, 1, 11000);
            camera_.position.z = 1000;
            pCamera_ = camera_;

            let oHeight = oWidth / aspect;
            oCamera_ = new THREE.OrthographicCamera(-oWidth * 0.5, oWidth * 0.5, oHeight * 0.5, -oHeight * 0.5, 1, 10000);
            //scene_.fog = new THREE.Fog(0xffffff, 1500, 5000)
            scene_.add(oCamera_);

            renderer_ = new THREE.WebGLRenderer({
                antialias: true,
                clearColor: 0xffffff,
                alpha: true,
                sortObjects: false
            });

            renderer_.setPixelRatio(2);

            element_ = document.createElement('div');
            element_.setAttribute("style", "position:relative;display: inline-block;");
            element_.appendChild(renderer_.domElement);

            //element_.appendChild(stats_.dom);

            menu.parent = element_;

            let progress = document.createElement('div');
            progress.setAttribute('class', 'shed-3d-progress');
            progress.setAttribute('style', 'position:absolute;top:50%;left:50%;width:100px;height:100px;transform:translate(-50%,-50%);transition:1s;');
            element_.appendChild(progress);

            let poweredBy = document.createElement('div');
            poweredBy.setAttribute("class", "powered-by");
            poweredBy.setAttribute("draggable", "false");

            poweredBy.innerHTML = '<div>Powered by the Shed App</div>\
                <div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAACXCAYAAAD6ZoUpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjA0ODNDRDFBMzhGMTFFNzg1RTc5MDRBRTEzOUFFRUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjA0ODNDRDJBMzhGMTFFNzg1RTc5MDRBRTEzOUFFRUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCMDQ4M0NDRkEzOEYxMUU3ODVFNzkwNEFFMTM5QUVFQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCMDQ4M0NEMEEzOEYxMUU3ODVFNzkwNEFFMTM5QUVFQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PminH4gAAEddSURBVHja7H0HoGVF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"></div>';

            element_.appendChild(poweredBy);

            renderer_.setSize(_width, _height);

            renderer_.shadowMap.enabled = true;
            renderer_.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer_.shadowMapSoft = true;

            control2D_ = new Control2D(oCamera_, renderer_.domElement);
            control2D_.enabled = false;

            control3D_ = new OrbitControl(camera_, document, renderer_.domElement);
            control3D_.target.set(0, 0, 0);

            control3D_.rotateSpeed = 1;
            control3D_.zoomSpeed = 5;
            control3D_.panSpeed = 0.8;
            //control3D_.minPolarAngle = 5 * Math.PI / 180;

            control3D_.noZoom = false;
            control3D_.noPan = false;

            control3D_.staticMoving = false;
            control3D_.dynamicDampingFactor = 0.15;

            control3D_.keys = [65, 83, 68];

            control3D_.maxPolarAngle = Math.PI * 0.4;

            cubeCamera_ = new THREE.CubeCamera(0.1, 10000, 512);
            cubeCamera_.position.setY(200);
            scene_.add(cubeCamera_);

            shed_ = new Shed(cubeCamera_, ()=> {
                if (isLoaded) {
                    self.emit(new Event("ready"));
                }
            }, features);
            features = shed_.features;

            scene_.add(shed_);

            let loader = new Loader(progress, features);
            loader.progress = (progress)=> {
                let event = new Event('progress');
                event.loaded = progress.loaded;
                event.total = progress.total;
                self.emit(event);
            };
            loader.loaded = ()=> {
                self.startRender();
                renderFrameCount_ += 100;
                isLoaded = true;
                self.emit(new Event('ready'));
            };

            ghost_ = new THREE.Object3D();
            scene_.add(ghost_);

            environment_ = new Environment(shed_.width, shed_.depth);
            scene_.add(environment_);

            _.times(5, (i)=> {
                let viewCam = new THREE.PerspectiveCamera(60, aspect, 1, 12000);
                let camMap = [
                    ()=> {
                        viewCam.rotation.fromArray([0, 0, 0]);
                    },
                    ()=> {
                        viewCam.rotation.fromArray([0, Math.PI * 0.5, 0]);
                    },
                    ()=> {
                        viewCam.rotation.fromArray([0, -Math.PI, 0]);
                    },
                    ()=> {
                        viewCam.rotation.fromArray([0, -Math.PI * 0.5, 0]);
                    },
                    ()=> {
                        viewCam = oCamera_;
                    }
                ];

                camMap[i]();

                viewCams_.push(viewCam);
                scene_.add(viewCam);
            });

            updateViewCams();

            generateRaycastWalls();

            renderer_.domElement.addEventListener('mouseover', ()=> {
                shouldRender_ = true;
            }, false);
            renderer_.domElement.addEventListener('mouseout', ()=> {
                shouldRender_ = false;
            }, false);

            document.addEventListener('touchmove', (e)=> {
                e.offsetX = e.touches[0].clientX;
                e.offsetY = e.touches[0].clientY;
                e.realTarget = document.elementFromPoint(e.offsetX, e.offsetY);

                if (e.realTarget == renderer_.domElement && window.mainDragEvent && !touchDragOver_) {
                    let event = new DragEvent("dragenter", {dataTransfer: window.mainDragEvent.dataTransfer});
                    renderer_.domElement.dispatchEvent(event);
                    touchDragOver_ = true;
                } else if (e.realTarget != renderer_.domElement && touchDragOver_) {
                    let event = new DragEvent("dragleave", {dataTransfer: window.mainDragEvent.dataTransfer});
                    renderer_.domElement.dispatchEvent(event);
                    touchDragOver_ = false;
                }

                if (touchDragOver_) {
                    let event = new DragEvent("dragover", {dataTransfer: window.mainDragEvent.dataTransfer});
                    let rendererOffset = findOffset(renderer_.domElement);
                    event.touchX = e.offsetX - rendererOffset.left;
                    event.touchY = e.offsetY - rendererOffset.top;
                    renderer_.domElement.dispatchEvent(event);
                }
                if (window.mainDragEvent) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, {passive: false});

            document.addEventListener('touchend', (e)=> {
                if (touchDragOver_) {
                    let event = new DragEvent("drop", {dataTransfer: window.mainDragEvent.dataTransfer});
                    renderer_.domElement.dispatchEvent(event);
                }

                touchDragOver_ = false;
                window.mainDragEvent = null;
            }, {passive: false});


            renderer_.domElement.addEventListener('dragenter', (e)=> {
                e.preventDefault();
                let data = JSON.parse(e.dataTransfer.types[e.dataTransfer.types.length - 1])
                let id = data.id;
                if (camera_ != oCamera_ && id.indexOf("2d") == 0) {
                    e.dataTransfer.dropEffect = "none";
                    return false;
                }

                e.dataTransfer.dropEffect = "copy";

                shed_.drag = id;
                shouldRender_ = true;
            });

            renderer_.domElement.addEventListener('dragleave', (e)=> {
                let data = JSON.parse(e.dataTransfer.types[e.dataTransfer.types.length - 1])
                let id = data.id;
                if (id.indexOf('rail') >= 0) {
                    shed_.enableRailGrid(false);
                    shed_.cancelRail();
                }

                if (id.indexOf('flower') >= 0 || id.indexOf('shutters') >= 0) {
                    shed_.enableWindowGrid(false);
                    if (id.indexOf('flower') >= 0) {
                        shed_.cancelFlowerBox();
                    } else {
                        shed_.cancelShutters();
                    }
                }

                shed_.drag = false;
                renderFrameCount_++;
                shouldRender_ = false;
            });

            renderer_.domElement.addEventListener('drop', (e)=> {
                let data = JSON.parse(e.dataTransfer.types[e.dataTransfer.types.length - 1]);
                let id = data.id;
                let info = data.info;
                try {
                    info = JSON.parse(data.info);
                } catch (e) {
                }
                if (camera_ != oCamera_ && id.indexOf("2d") >= 0) {
                    e.dataTransfer.dropEffect = "none";
                    return false;
                }

                if (id.indexOf('rail') >= 0) {
                    shed_.dropRail();
                    shed_.enableRailGrid(false);
                    self.emit(new Event("change"));
                    return;
                }

                if (id.indexOf('flower') >= 0 || id.indexOf('shutters') >= 0) {
                    shed_.enableWindowGrid(false);
                    if (id.indexOf('flower') >= 0) {
                        shed_.dropFlowerBox();
                    } else {
                        shed_.dropShutters();
                    }
                    return;
                }

                shed_.drag.drop(id, info);
                renderFrameCount_ += 100;
                generateRaycastWalls();
                e.preventDefault();

                shed_.drag = false;
                shouldRender_ = false;

                self.emit(new Event("change"));
            });

            renderer_.domElement.addEventListener('dragover', dragOverHandler);
            renderer_.domElement.addEventListener('mousedown', mouseDownHandler);
            renderer_.domElement.addEventListener('touchstart', mouseDownHandler);
            renderer_.domElement.addEventListener('contextmenu', contextHandler);
            renderer_.domElement.addEventListener('mouseup', clickHandler);
            renderer_.domElement.addEventListener('touchend', clickHandler);
            renderer_.domElement.addEventListener('mousemove', mouseMoveHandler);
            renderer_.domElement.addEventListener('touchmove', mouseMoveHandler);
            renderer_.domElement.addEventListener('touchmove', touchMoveHandler);
            document.addEventListener('mousedown', clickOutsideHandler);
            document.addEventListener('touchstart', clickOutsideHandler);
        }

        /**
         * Checks the intersection of the mouse cursor with some objects
         * @param objects Array of objects to check intersection with
         * @param e MouseEvent
         * @returns {*} Array of intersected objects
         */
        function raycast(objects, e) {
            if (e instanceof TouchEvent) {
                let rendererOffset = findOffset(renderer_.domElement);
                e.touchX = e.changedTouches[0].pageX - rendererOffset.left;
                e.touchY = e.changedTouches[0].pageY - rendererOffset.top;
            }

            mouseVector_.x = 2 * ((e.touchX || e.offsetX) / _width) - 1;
            mouseVector_.y = 1 - 2 * ((e.touchY || e.offsetY) / _height);

            raycaster_.setFromCamera(mouseVector_, camera_);
            return raycaster_.intersectObjects(objects, true);
        }

        function placeRail(intersection, info) {
            shed_.placeRail(intersection, info);
        }

        function placeShutters(intersection, info) {
            shed_.placeShutters(intersection, info);
        }

        function placeFlowerBox(intersection, info) {
            shed_.placeFlowerBox(intersection, info);
        }

        function place3DObject(intersection, padding) {
            let planeWidth = 0;
            let planeCenter = 0;

            let angle = tools.getAngleByRotation(intersection.object.rotation);
            let angleMap = {};
            angleMap[0] = intersection.object.position.x;
            angleMap[Math.PI * 0.5] = intersection.object.position.z;
            angleMap[Math.PI] = intersection.object.position.x;
            angleMap[-Math.PI * 0.5] = intersection.object.position.z;
            planeCenter = angleMap[angle];

            if (intersection.object.geometry instanceof ClipGeometry) {
                let areas = _.filter(intersection.object.geometry.clip.areas, (area)=> {
                    return area.width != 0;
                });

                if (areas.length == 1) {
                    planeWidth = areas[0].width;
                    planeCenter += (angle >= Math.PI * 0.5) ? -areas[0].center : areas[0].center;
                } else {
                    let rotationMap = {};
                    rotationMap[0] = intersection.point.x;
                    rotationMap[Math.PI * 0.5] = -intersection.point.z;
                    rotationMap[Math.PI] = -intersection.point.x;
                    rotationMap[-Math.PI * 0.5] = intersection.point.z;

                    let pointX = rotationMap[angle];
                    try {
                        _.each(areas, (area)=> {
                            if (pointX >= area.center - area.width * 0.5 && pointX <= area.center + area.width * 0.5) {
                                planeWidth = area.width;
                                planeCenter = (angle >= Math.PI * 0.5) ? -area.center : area.center;
                                throw(new Error());
                            }
                        });
                    } catch (e) {
                    }
                }
            } else {
                intersection.object.geometry.computeBoundingBox();
                let bbox = intersection.object.geometry.boundingBox;
                planeWidth = Math.round((bbox.max.x - bbox.min.x) * 100) / 100;
            }

            if (planeWidth == 0) {
                return false;
            }

            let x = Math.round(intersection.point.x * 100) / 100;
            let z = Math.round(intersection.point.z * 100) / 100;
            let dragHalf = shed_.drag.width * 0.5;

            if (angle % Math.PI == 0) {
                let minX = planeCenter - planeWidth * 0.5 + padding;
                let maxX = planeCenter + planeWidth * 0.5 - padding;
                if (x - dragHalf < minX) {
                    x = minX + dragHalf;
                    if (x > maxX - dragHalf) {
                        return;
                    }
                }
                else if (x + dragHalf > maxX) {
                    x = maxX - dragHalf;
                    if (x < minX + dragHalf) {
                        return;
                    }
                }
            } else if (Math.abs(angle) == Math.PI * 0.5) {
                let minZ = planeCenter - planeWidth * 0.5 + padding;
                let maxZ = planeCenter + planeWidth * 0.5 - padding;
                if (z - dragHalf < minZ) {
                    z = minZ + dragHalf;
                    if (z > maxZ - dragHalf) {
                        return;
                    }
                }
                else if (z + dragHalf > maxZ) {
                    z = maxZ - dragHalf;
                    if (z < minZ + dragHalf) {
                        return;
                    }
                }
            } else {
                const SQRT2 = Math.sqrt(2);
                let minX = -planeWidth * 0.5 / SQRT2;
                let maxX = planeWidth * 0.5 / SQRT2;
                let minZ = minX + intersection.object.position.z;
                let maxZ = maxX + intersection.object.position.z;
                minX += intersection.object.position.x;
                maxX += intersection.object.position.x;

                let xTooSmall = x - (dragHalf + padding) / SQRT2 < minX;
                let xTooBig = x + (dragHalf + padding) / SQRT2 > maxX;
                let zTooSmall = z - (dragHalf + padding) / SQRT2 < minZ;
                let zTooBig = z + (dragHalf + padding) / SQRT2 > maxZ;

                function outOfRange() {
                    xTooSmall = x - (dragHalf + padding) / SQRT2 < minX;
                    xTooBig = x + (dragHalf + padding) / SQRT2 > maxX;
                    zTooSmall = z - (dragHalf + padding) / SQRT2 < minZ;
                    zTooBig = z + (dragHalf + padding) / SQRT2 > maxZ;

                    return xTooSmall || xTooBig || zTooBig || zTooSmall;
                }

                if (xTooSmall) {
                    x = minX + (dragHalf + padding) / SQRT2;
                    if (angle == Math.PI * 0.25 || angle == -Math.PI * 0.75) {
                        z = minX - x + maxZ;
                    } else {
                        z = x - minX + minZ;
                    }
                    if (outOfRange()) {
                        return;
                    }
                }
                else if (xTooBig) {
                    x = maxX - (dragHalf + padding) / SQRT2;
                    if (angle == Math.PI * 0.25 || angle == -Math.PI * 0.75) {
                        z = minX - x + maxZ;
                    } else {
                        z = x - minX + minZ;
                    }
                    if (outOfRange()) {
                        return;
                    }
                }

                if (zTooSmall) {
                    z = minZ + (dragHalf + padding) / SQRT2;
                    if (angle == Math.PI * 0.25 || angle == -Math.PI * 0.75) {
                        z = minZ - z + maxX;
                    } else {
                        x = z - minZ + minX;
                    }
                    if (outOfRange()) {
                        return;
                    }
                }
                else if (zTooBig) {
                    z = maxZ - (dragHalf + padding) / SQRT2;
                    if (angle == Math.PI * 0.25 || angle == -Math.PI * 0.75) {
                        z = minZ - z + maxX;
                    } else {
                        x = z - minZ + minX;
                    }
                    if (outOfRange()) {
                        return;
                    }
                }

            }

            if (camera_ == pCamera_) {
                shed_.drag.currentWall = intersection.object;
            } else {
                shed_.drag.currentWall = tools.findWall(shed_.walls, intersection.point.x, intersection.point.z,
                    tools.getAngleByRotation(intersection.object.rotation))
            }

            shed_.drag.rotate = angle;
            shed_.drag.x = x;
            shed_.drag.z = z;

            return true;
        }

        function drag3DObject(isDeck, mouseEvent) {
            var intersections = raycast(isDeck ? rBoxWalls_ : raycastWalls_, mouseEvent);
            let padding = isDeck ? 0 : tools.ft2cm(0.5);
            if (intersections[0]) {
                return place3DObject(intersections[0], padding);
            }
        }

        function drag3DObjectOnPlan(isDeck, mouseEvent) {
            let intersections = raycast(shed_.plan.walls, mouseEvent);
            if (intersections[0]) {
                let padding = isDeck ? 0 : tools.ft2cm(0.5);
                let intersection = intersections[0];
                let parent = intersection.object.parent;
                parent.geometry = intersection.object.geometry;
                intersection.object = parent;
                if (Math.abs(Math.abs(intersection.point.x) - Math.abs(shed_.width * 0.5)) <
                    Math.abs(Math.abs(intersection.point.z) - Math.abs(shed_.depth * 0.5))) {
                    intersection.point.x = (intersection.point.x > 0 ? 1 : -1) * shed_.width * 0.5;
                } else {
                    intersection.point.z = (intersection.point.z > 0 ? 1 : -1) * shed_.depth * 0.5;
                }

                place3DObject(intersection, padding);
            }
        }

        function dragRoofObject(mouseEvent) {
            var intersections = raycast(shed_.roof.planes, mouseEvent);
            if (intersections[0]) {
                let object = intersections[0].object;
                if (!object.geometry.boundingBox) {
                    object.geometry.computeBoundingBox();
                }
                let box = object.geometry.boundingBox;
                if (intersections[0].point.x + tools.in2cm(12) + 20 < object.position.x + box.max.y &&
                    intersections[0].point.x - tools.in2cm(12) - 20 > object.position.x + box.min.y) {
                    shed_.drag.x = intersections[0].point.x;
                }
                if ((intersections[0].point.z + tools.in2cm(12) + 20 < object.position.z + box.max.x &&
                    intersections[0].point.z - tools.in2cm(12) - 20 > object.position.z + box.min.x)) {
                    shed_.drag.z = intersections[0].point.z;
                }
            }
        }

        function dragOverHandler(e) {
            e.preventDefault();

            let data = JSON.parse(e.dataTransfer.types[e.dataTransfer.types.length - 1]);
            let id = data.id;
            let info = data.info;
            if (id.indexOf('rail') >= 0) {
                shed_.enableRailGrid();
                var intersections = raycast(shed_.railWalls, e);
                if (intersections[0]) {
                    placeRail(intersections[0], info);
                }
                return;
            }

            if (id.indexOf('flower') >= 0 || id.indexOf('shutters') >= 0) {
                shed_.enableWindowGrid();
                var intersections = raycast(shed_.windowWalls, e);
                if (intersections[0]) {
                    if (id.indexOf('flower') >= 0) {
                        placeFlowerBox(intersections[0], info);
                    } else {
                        placeShutters(intersections[0], info);
                    }
                } else {
                    shed_.cancelShutters();
                    shed_.cancelFlowerBox();
                }
                return;
            }

            if (id.indexOf('skylight') >= 0) {
                dragRoofObject(e);
            } else if (camera_ == pCamera_ && id.indexOf("2d") < 0) {
                drag3DObject(tools.isDeckID(id), e);
            }
            else if (camera_ == oCamera_ && id.indexOf("2d") == 0) {
                let intersections = raycast([environment_.surface], e);
                if (intersections[0]) {
                    shed_.drag.x = intersections[0].point.x;
                    shed_.drag.z = intersections[0].point.z;
                }
            } else if (camera_ == oCamera_ && id.indexOf("2d") < 0) {
                drag3DObjectOnPlan(tools.isDeckID(id), e);
            }

            return false;
        }

        function mouseDownHandler(e) {
            if (e instanceof TouchEvent) {
                let rendererOffset = findOffset(renderer_.domElement);
                mousePosition_.x = e.touches[0].pageX - rendererOffset.left;
                mousePosition_.y = e.touches[0].pageY - rendererOffset.top;
            } else {
                mousePosition_.x = e.offsetX;
                mousePosition_.y = e.offsetY;
            }

            let intersections = raycast(shed_.plan.grips, e);
            if (intersections[0]) {
                shed_.plan.inResize = true;
                shed_.move = intersections[0].object.parent.parent.parent;
            }

            intersections = raycast(shed_.plan.crosses, e);
            if (intersections[0]) {
                shed_.move = intersections[0].object.parent.parent.parent;
                shed_.move.delete();
                shed_.move = null;
                self.emit(new Event("change"));
            }
        }

        function clickOutsideHandler(e) {
            if (inObjectMoveMode_ && !isViewerInPath(e.path)) {
                shed_.move.cancel();
                enableMoveMode(false)
            }
        }

        function isViewerInPath(path) {
            for (let i = 0, n = path.length; i < n; i++) {
                if (path[i] == element_) {
                    return true;
                }
            }
            return false;
        }

        function clickHandler(e) {
            if (e instanceof TouchEvent) {
                let rendererOffset = findOffset(renderer_.domElement);
                e.touchX = e.changedTouches[0].pageX - rendererOffset.left;
                e.touchY = e.changedTouches[0].pageY - rendererOffset.top;
            }

            if (shed_.plan.inResize) {
                self.emit(new Event("change"));
                shed_.plan.inResize = null;
                shed_.move = null;
            }

            if (nextTouchIsObjectMove_) {
                nextTouchIsObjectMove_ = false;
                enableMoveMode(true);
                return;
            }

            let currentMouseVector = new THREE.Vector3(e.touchX || e.offsetX, e.touchY || e.offsetY);
            if (!(inObjectMoveMode_ || shed_.plan.inMove) && currentMouseVector.clone().sub(mousePosition_).length() >= 5) {
                return;
            }

            $(element_).css({cursor: 'default'});

            if (camera_ == oCamera_) {
                if (!shed_.plan.inMove) {
                    let intersects = raycast(shed_.plan.objects2D, e);
                    if (intersects[0]) {
                        menu(e, [{
                            icon: {fa: "arrows", color: "#00af00"},
                            text: "move",
                            click: ()=> {
                                shed_.move = intersects[0].object;
                                renderFrameCount_ += 10;
                            }
                        }, {
                            icon: {fa: "refresh", color: "#0000af"},
                            text: "rotate",
                            click: ()=> {
                                intersects[0].object.rotateZ(-Math.PI * 0.5);
                                renderFrameCount_ += 10;
                            }
                        }, {
                            icon: {fa: "trash", color: "#af0000"},
                            text: "remove",
                            click: ()=> {
                                shed_.move = intersects[0].object;
                                shed_.move.delete();
                                renderFrameCount_ += 10;
                            }
                        }]);
                    }
                } else {
                    if (e instanceof TouchEvent || e.button === 0) {
                        shed_.move.drop();
                        renderFrameCount_ += 30;
                        //self.emit(new Event("change"));
                    } else if (e.button === 2) {
                        shed_.move.cancel();
                    }
                }
            }

            if (inObjectMoveMode_) {
                if (e instanceof TouchEvent || e.button === 0) {
                    shed_.move.drop();
                    generateRaycastWalls();
                    renderFrameCount_ += 30;
                    enableMoveMode(false)
                    self.emit(new Event("change"));
                } else if (e.button === 2) {
                    shed_.move.cancel();
                    enableMoveMode(false);
                }
            } else {
                let intersects = raycast(shed_.allObjects, e);

                if (intersects[0]) {
                    let object = intersects[0].object;
                    while (object && !(object instanceof DraggableObject || object instanceof Deck)) {
                        object = object.parent;
                    }
                    if (!object) {
                        return;
                    }

                    let menuOptions = [
                        {
                            icon: {fa: "arrows", color: "#00af00"},
                            text: "move",
                            click: ()=> {
                                if (e instanceof TouchEvent) {
                                    nextTouchIsObjectMove_ = true;
                                } else {
                                    enableMoveMode(true);
                                }
                                shed_.move = object;
                                renderFrameCount_ += 10;
                            }
                        }];
                    if (object instanceof Window) {
                        if (shuttersAreEnabled_) {
                            if (!object.hasShutters) {
                                if (windowCanHaveShutters(object)) {
                                    menuOptions.push({
                                        icon: {fa: "square-o", color: "#555"},
                                        text: "show shutters",
                                        click: ()=> {
                                            object.hasShutters = !object.hasShutters;
                                            self.emit(new Event("change"));
                                            renderFrameCount_ += 10;
                                        }
                                    });
                                }
                            } else {
                                menuOptions.push({
                                    icon: {fa: "check-square-o", color: "#555"},
                                    text: "show shutters",
                                    click: ()=> {
                                        object.hasShutters = !object.hasShutters;
                                        self.emit(new Event("change"));
                                        renderFrameCount_ += 10;
                                    }
                                });
                            }
                        }

                        if (flowerBoxesAreEnabled_) {
                            if (object.canHaveFlowerBox) {
                                menuOptions.push({
                                    icon: {fa: object.hasFlowerBox ? "check-square-o" : "square-o", color: "#555"},
                                    text: "show flower box",
                                    click: ()=> {
                                        object.hasFlowerBox = !object.hasFlowerBox;
                                        self.emit(new Event("change"));
                                        renderFrameCount_ += 10;
                                    }
                                });
                            }
                        }
                    } else if (object instanceof Deck) {
                        let deck = object;
                        while (deck && !(deck instanceof Deck)) {
                            deck = deck.parent
                        }

                        menuOptions.push({
                            icon: {fa: "times", color: "#af0000"},
                            text: "remove rails",
                            click: ()=> {
                                deck.clearRails();
                                shed_.plan.redraw();
                                self.emit(new Event("change"));
                                renderFrameCount_ += 10;
                            }
                        });
                    } else if (object instanceof Door || object instanceof DeepDoor) {
                        menuOptions.push({
                            icon: {fa: "exchange", color: "#555"},
                            text: "reverse",
                            click: ()=> {
                                object.reverse();
                                shed_.plan.redraw();
                                renderFrameCount_ += 10;
                            }
                        });
                    }

                    menuOptions.push({
                        icon: {fa: "trash", color: "#af0000"},
                        text: "remove",
                        click: ()=> {
                            shed_.move = object;
                            shed_.move.delete();
                            self.emit(new Event("change"));
                            enableMoveMode(false);
                            renderFrameCount_ += 10;
                            generateRaycastWalls();
                        }
                    });

                    menu(e, menuOptions);
                }
            }
        }

        function windowCanHaveShutters(window) {
            if (!window.canHaveShutters) {
                return false;
            }

            window.hasShutters = true;
            shed_.move = window;
            shed_.drag.z = window.z;
            window.hasShutters = false;
            shed_.move.cancel();
            let returnValue = !window.placementForbidden;
            window.placementForbidden = false;
            return returnValue;
        }

        function contextHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        function mouseMoveHandler(e) {
            if (e instanceof TouchEvent) {
                e.touchX = e.changedTouches[0].clientX;
                e.touchX = e.changedTouches[0].clientX;
                e.touchY = e.changedTouches[0].clientY;
            }

            let currentMouseVector = new THREE.Vector3(e.offsetX, e.offsetY);
            if (currentMouseVector.clone().sub(mousePosition_).length() < 5) {
                return;
            }

            if (camera_ == oCamera_) {
                if (shed_.plan.inMove) {
                    let intersections = raycast([environment_.surface], e);
                    if (intersections[0]) {
                        shed_.drag.x = intersections[0].point.x;
                        shed_.drag.z = intersections[0].point.z;
                    }
                } else if (shed_.plan.inResize) {
                    let intersections = raycast([environment_.surface], e);
                    shed_.move.resize(intersections[0].point.x, 0, intersections[0].point.z);
                }
                else {
                    let intersections = raycast(shed_.plan.objects2D.concat(shed_.plan.crosses), e);
                    if (intersections[0]) {
                        $(element_).css({cursor: 'pointer'});
                    } else {
                        intersections = raycast(shed_.plan.grips, e);
                        if (intersections[0]) {
                            $(element_).css({cursor: 'ew-resize'});
                        } else {
                            $(element_).css({cursor: 'default'});
                        }

                    }
                }
            }

            if (inObjectMoveMode_) {
                if (shed_.move.type.toLowerCase().indexOf("skylight") >= 0) {
                    dragRoofObject(e);
                } else if (camera_ == pCamera_) {
                    drag3DObject(shed_.move.isDeck, e);
                } else {
                    drag3DObjectOnPlan(shed_.move.isDeck, e);
                }
            }
            /*else if (e.buttons == 1 || e.button == 1) {
             toPerspective(true);
             }*/
        }

        function touchMoveHandler() {
            renderFrameCount_ += 5;
        }

        /**
         * Starts the render process. Used when loader loads the resources
         */
        this.startRender = ()=> {
            renderStarted_ = true;
        };

        /**
         * Saves all data about the shed into object
         */
        this.save = ()=> {
            let roofType = colors.shingleMap[shed_.roof.color] ? 'shingle' : 'metallic';

            let windows = _.map(shed_.windows, (window)=> {
                return {
                    type: window.type,
                    info: window.info,
                    hasShutters: window.hasShutters,
                    hasFlowerBox: window.hasFlowerBox,
                    position_cm: {
                        x: window.x,
                        z: window.z
                    },
                    position: {
                        x: tools.cm2ft(window.x),
                        z: tools.cm2ft(window.z)
                    },
                    rotation: window.rotate
                }
            });

            let doors = _.map(shed_.doors, (door)=> {
                return {
                    type: door.type,
                    info: door.info,
                    position_cm: {
                        x: door.x,
                        z: door.z
                    },
                    position: {
                        x: tools.cm2ft(door.x),
                        z: tools.cm2ft(door.z)
                    },
                    rotation: door.rotate,
                    orientation: door.orientation,
                    orientation_text: (door.orientation & Door.ORIENTATION_LEFT ? 'Left Hang' : 'Right Hang') +
                    (door.orientation & Door.SWING_IN ? ' Inswing' : ' Outswing')
                }
            });

            let decks = _.map(shed_.decks, (deck)=> {
                return {
                    type: deck.type,
                    info: deck.info,
                    position_cm: {
                        x: deck.x,
                        z: deck.z
                    },
                    position: {
                        x: tools.cm2ft(deck.x),
                        z: tools.cm2ft(deck.z)
                    },
                    size: deck.size,
                    rotation: deck.rotate,
                    rails: deck.rails
                }
            });

            let wrapArounds = _.filter(decks, (deck)=> {
                return deck.type.toLowerCase().indexOf('wrap-around') >= 0;
            });

            let horseStalls = _.filter(decks, (deck)=> {
                return deck.type.toLowerCase().indexOf('horse') >= 0;
            });

            decks = _.filter(decks, (deck)=> {
                return deck.type.toLowerCase().indexOf('deck') >= 0;
            });

            let lofts = _.map(shed_.lofts, (loft)=> {
                return {
                    type: loft.type,
                    info: loft.info,
                    position_cm: {
                        x: loft.x,
                        z: loft.z
                    },
                    position: {
                        x: tools.cm2ft(loft.x),
                        z: tools.cm2ft(loft.z)
                    },
                    rotation: loft.rotate,
                    size: loft.size
                }
            });

            return {
                shed: {
                    width: tools.cm2ft(shed_.width),
                    width_cm: shed_.width,
                    depth: tools.cm2ft(shed_.depth),
                    depth_cm: shed_.depth,
                    height: tools.cm2ft(shed_.height),
                    height_cm: shed_.height,
                    mainColor: shed_.colors.mainColor,
                    secondaryColor: shed_.colors.secondaryColor,
                    style: shed_.style
                },
                roof: {
                    type: roofType,
                    color: shed_.roof.color
                },
                windows: windows,
                doors: doors,
                decks: decks,
                horseStalls: horseStalls,
                wrapArounds: wrapArounds,
                lofts: lofts
            }
        };

        /**
         * Loads the data and applies it to the shed configuration
         * @param data Data object returned previously by save() function
         */
        this.load = (data)=> {
            shed_.setColor(data.shed.mainColor, data.shed.secondaryColor).then(()=> {
                shed_.setSize(parseInt(data.shed.width), parseInt(data.shed.depth), parseInt(data.shed.height), true, data.shed.style || tools.URBAN_BARN);
                updateViewCams();
                shed_.roof.color = data.roof.color;
                shed_.setColor(data.shed.mainColor, data.shed.secondaryColor);

                let placedObjects = {};

                _.each(data.decks.concat(data.wrapArounds).concat(data.horseStalls).concat(data.lofts).concat(data.doors).concat(data.windows), (object)=> {
                    shed_.drag = object.type.toLowerCase();

                    shed_.drag.currentWall = tools.findWall(shed_.walls, object.position_cm.x, object.position_cm.z, object.rotation);
                    shed_.drag.x = object.position_cm.x;
                    shed_.drag.z = object.position_cm.z;
                    shed_.drag.rotate = object.rotation;

                    let placedObject = shed_.drag.drop(object.type.toLowerCase());

                    if (placedObject instanceof Loft) {
                        placedObject.size = object.size;
                    }

                    if (object.rails) {
                        _.each(object.rails, (rail)=> {
                            placedObject.showRail(rail.index, true, rail.info);
                        });
                    }

                    shed_.drag = false;
                    placedObjects[object.type.toLowerCase() + "_" + object.position_cm.x + "_" + object.position_cm.z] = placedObject;
                });

                _.each(data.windows, (window)=> {
                    let placedObject = placedObjects[window.type.toLowerCase() + "_" + window.position_cm.x + "_" + window.position_cm.z];
                    if (placedObject) {
                        placedObject.hasShutters = window.hasShutters;
                        placedObject.hasFlowerBox = window.hasFlowerBox;
                    }
                });

                setTimeout(()=> {
                    _.each(data.doors, (door)=> {
                        let placedObject = placedObjects[door.type.toLowerCase() + "_" + door.position_cm.x + "_" + door.position_cm.z];
                        if (placedObject) {
                            if (door.orientation & Door.ORIENTATION_RIGHT) {
                                placedObject.reverse();
                            }
                        }
                    });

                    self.emit(new Event("ready"));
                }, 500);
            });
        };

        this.getImages = () => {
            environment_.shadowsEnabled = false;
            let views = _.map(viewCams_, (camera)=> {
                renderer_.render(scene_, camera);
                return imageManager.crop(renderer_.domElement.toDataURL("image/jpeg"));
            });
            renderFrameCount_++;
            environment_.shadowsEnabled = true;

            return Promise.all(views).then((views) => {
                return {
                    front: views[0],
                    left: views[1],
                    back: views[2],
                    right: views[3],
                    plan: views[4],
                }
            })
        };

        /**
         * Renders the frame
         */
        function render() {

            stats_.begin();
            if (!inObjectMoveMode_) {
                control3D_.update();
            }

            if (camera_ == pCamera_) {
                environment_.update(camera_);
            }

            renderer_.render(scene_, camera_);
            shed_.visible = false;
            environment_.showReflection(true);
            cubeCamera_.updateCubeMap(renderer_, scene_);
            environment_.showReflection(false);
            shed_.visible = true;

            stats_.end();
        }

        /**
         * Per-frame function that might render the frame, if shouldRender_ or renderFrameCount_ are set
         */
        function animate() {
            requestAnimationFrame(animate);
            if (!renderStarted_) {
                return;
            }

            if (shouldRender_ || renderFrameCount_) {
                render();
                if (renderFrameCount_) {
                    renderFrameCount_--;
                }
            }

            TWEEN.update();
        }

        /**
         * Generates fake invisible walls of the shed.
         * These ghost walls are used to place objects on the shed and check intersection with them
         */
        function generateRaycastWalls() {
            while (ghost_.children.length) {
                ghost_.remove(ghost_.children.pop());
            }

            if (!rBoxWalls_) {
                rBoxWalls_ = _.map(shed_.boxWalls, (wall)=> {
                    let newWall = wall.clone();
                    newWall.castShadow = newWall.receiveShadow = false;

                    wall.geometry.computeBoundingBox();
                    let width = wall.geometry.boundingBox.max.x - wall.geometry.boundingBox.min.x;
                    newWall.geometry = new THREE.PlaneGeometry(width, shed_.height);

                    newWall.material = new THREE.MeshStandardMaterial({opacity: 0});
                    newWall.material.transparent = true;
                    newWall.material.needsUpdate = true;

                    newWall.position.setY(shed_.height * 0.5 + tools.in2cm(7));
                    newWall.rotate = wall.rotate;

                    return newWall;
                });
            }

            raycastWalls_ = shed_.wallClones;
            _.each(raycastWalls_, (wall)=> {
                wall.position.setY(shed_.height * 0.5 + tools.in2cm(7));
                wall.castShadow = wall.receiveShadow = false;
                wall.material = new THREE.MeshStandardMaterial({opacity: 0});
                wall.material.transparent = true;
                wall.material.needsUpdate = true;
            });

            //adding walls for gamble windows
            let gableWall1 = new THREE.Mesh(new THREE.PlaneGeometry(shed_.width, tools.ft2cm(3.875)));
            gableWall1.material = new THREE.MeshStandardMaterial({opacity: 0});
            gableWall1.material.transparent = true;
            gableWall1.material.needsUpdate = true;
            gableWall1.position.setY(shed_.height + tools.in2cm(7) + tools.ft2cm(3.875) * 0.5);
            gableWall1.position.setZ(shed_.depth * 0.5);

            let gambleWall2 = gableWall1.clone();
            gambleWall2.rotation.fromArray([0, Math.PI, 0]);
            gambleWall2.position.setZ(-shed_.depth * 0.5);

            raycastWalls_.push(gableWall1);
            raycastWalls_.push(gambleWall2);

            _.each(rBoxWalls_.concat(raycastWalls_), (wall)=> {
                ghost_.add(wall);
            });
        }

        /**
         * Switches to perspective view or orthogonal, which is used for the floor plan
         * @param toPerspective Set to true, if you want to switch to the perspective camera, false to switch to orphographic camera
         */
        function toPerspective(toPerspective) {
            if (toPerspective) {
                if (camera_ == pCamera_) {
                    return;
                }

                camera_ = pCamera_;
                control2D_.enabled = false;
                control3D_.enabled = true;
                let event = new Event("changeView");
                event.view = "3d";
                self.emit(event);
            } else {
                camera_ = oCamera_;
                control2D_.enabled = true;
                control2D_.setDefaults();
                control3D_.enabled = false;
                let event = new Event("changeView");
                event.view = "2d";
                self.emit(event);
            }
            renderFrameCount_++;
        }

        function setRendererSize() {
            renderer_.setSize(_width, _height);
            let aspect = _width / _height;
            pCamera_.aspect = aspect;
            pCamera_.updateProjectionMatrix();

            let oHeight = oWidth / aspect;

            oCamera_.left = -oWidth * 0.5;
            oCamera_.right = oWidth * 0.5;
            oCamera_.top = oHeight * 0.5;
            oCamera_.bottom = -oHeight * 0.5;

            oCamera_.updateProjectionMatrix();
        }

        function updateViewCams() {
            const ctan60 = 1 / Math.sqrt(3);
            //145 and 80 are magical constants, don't think on them too much)
            let minDistance = (shed_.height + shed_.roofHeight + 145) * ctan60 * camera_.aspect;

            let xDistance = shed_.width * 0.5 + Math.max((shed_.depth + 80) * ctan60, minDistance);
            let zDistance = shed_.depth * 0.5 + Math.max((shed_.width + 80) * ctan60, minDistance);

            let camHeight = 200;
            viewCams_[0].position.setZ(zDistance);
            viewCams_[0].position.setY(camHeight);

            viewCams_[1].position.setX(xDistance);
            viewCams_[1].position.setY(camHeight);

            viewCams_[2].position.setZ(-zDistance);
            viewCams_[2].position.setY(camHeight);

            viewCams_[3].position.setX(-xDistance);
            viewCams_[3].position.setY(camHeight);
        }

        function findOffset(obj) {
            let left = 0, top = 0;

            if (obj.offsetParent) {
                do {
                    left += obj.offsetLeft;
                    top += obj.offsetTop;

                } while (obj = obj.offsetParent);
            }

            return {left, top};
        }

        function enableMoveMode(enable = true) {
            inObjectMoveMode_ = enable;
            control3D_.enabled = !enable;
        }

        init();

        animate();

        Object.defineProperties(this, {
            /**
             * DOM element to build it into html page
             */
            element: {
                get: ()=> {
                    return element_;
                }
            },
            /**
             * Width of the 3D viewer
             */
            width: {
                get: ()=> {
                    return _width;
                },
                set: (value)=> {
                    _width = value;
                    setRendererSize();
                    renderFrameCount_++;
                }
            },
            /**
             * Height of the 3D viewer
             */
            height: {
                get: ()=> {
                    return _height;
                },
                set: (value)=> {
                    _height = value;
                    setRendererSize();
                    renderFrameCount_++;
                }
            },
            perspective: {
                set: (value)=> {
                    const angles = {
                        front: {
                            theta: 0,
                            phi: Math.PI * 0.5,
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        left: {
                            theta: Math.PI * 0.5,
                            phi: Math.PI * 0.5,
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        right: {
                            theta: -Math.PI * 0.5,
                            phi: Math.PI * 0.5,
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        top: {
                            theta: Math.PI * 0.5,
                            phi: 0,
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        back: {
                            theta: Math.PI,
                            phi: Math.PI * 0.5,
                            x: 0,
                            y: 0,
                            z: 0
                        }
                    };

                    if (angles[value]) {

                        if (value != "top") {
                            toPerspective(true);
                        }

                        let current = {
                            theta: control3D_.theta,
                            phi: control3D_.phi,
                            x: control3D_.target.x,
                            y: control3D_.target.y,
                            z: control3D_.target.z
                        };
                        new TWEEN.Tween(current).to(angles[value], 300).onUpdate(()=> {
                            control3D_.theta = current.theta;
                            control3D_.phi = current.phi;
                            control3D_.target.set(current.x, current.y, current.z);
                        }).start();

                        setTimeout(()=> {
                            if (value == "top") {
                                toPerspective(false);
                            }
                        }, 300);

                        renderFrameCount_ += 100;
                    }
                }
            },
            /**
             * Shed control object
             */
            shed: {
                get: ()=> {
                    let shed = {
                        /**
                         * Sets size of the shed
                         * @param width Shed's width
                         * @param depth Shed's depth
                         * @param height Shed's wall height
                         * @param style Shed's style
                         */
                        setSize: (width, depth, height, style)=> {
                            width = parseInt(width);
                            depth = parseInt(depth);
                            height = parseInt(height);

                            shed_.setSize(width, depth, height, true, style);
                            updateViewCams();
                            renderFrameCount_ += 100;

                            rBoxWalls_ = null;
                            generateRaycastWalls();

                            environment_.setShedSize(shed_.width, shed_.depth);

                            control3D_.minBox = new THREE.Box3(
                                new THREE.Vector3(tools.ft2cm(-width * 0.5) - 10, 10, tools.ft2cm(-depth * 0.5) - 10),
                                new THREE.Vector3(tools.ft2cm(width * 0.5) + 10, tools.ft2cm(height + 4), tools.ft2cm(depth * 0.5) + 10));

                            self.emit(new Event("change"));
                        },
                        /**
                         * Sets the colors of the shed
                         * @param mainColor Main color of the shed
                         * @param secondaryColor Secondary olor of the shed
                         */
                        setColor: (mainColor, secondaryColor)=> {
                            shed_.setColor(mainColor, secondaryColor);
                            renderFrameCount_ += 100;
                            self.emit(new Event("change"));
                        }
                    };

                    Object.defineProperties(shed, {
                        doors: {
                            get: ()=> {
                                let doors = {};
                                Object.defineProperties(doors, {
                                    show: {
                                        set: (value)=> {
                                            shed_.showDoors = value;
                                            renderFrameCount_ += 100;
                                        },
                                        get: ()=> {
                                            return shed_.showDoors;
                                        }
                                    }
                                });

                                return doors;
                            }
                        },
                        windows: {
                            get: ()=> {
                                let windows = {};
                                Object.defineProperties(windows, {
                                    flowerBoxes: {
                                        get: ()=> {
                                            let flowerBoxes = {};
                                            Object.defineProperties(flowerBoxes, {
                                                show: {
                                                    get: ()=> {
                                                        return shed_.showFlowerBoxes;
                                                    },
                                                    set: (value)=> {
                                                        _.each(shed_.windows, (window)=> {
                                                            window.hasFlowerBox = value;
                                                        });

                                                        shed_.showFlowerBoxes = value;
                                                        self.emit(new Event("change"));
                                                        renderFrameCount_ += 30;
                                                    }
                                                },
                                                enable: {
                                                    get: ()=>flowerBoxesAreEnabled_,
                                                    set: (enable)=>flowerBoxesAreEnabled_ = enable
                                                }
                                            });
                                            return flowerBoxes;
                                        }
                                    },
                                    shutters: {
                                        get: ()=> {
                                            let shutters = {};
                                            Object.defineProperties(shutters, {
                                                show: {
                                                    get: ()=> {
                                                        return shed_.showShutters;
                                                    },
                                                    set: (value)=> {
                                                        _.each(shed_.windows, (window)=> {
                                                            if (value && windowCanHaveShutters(window)) {
                                                                window.hasShutters = true;
                                                            } else {
                                                                window.hasShutters = false;
                                                            }
                                                        });

                                                        shed_.showShutters = value;
                                                        self.emit(new Event("change"));
                                                        renderFrameCount_ += 30;
                                                    }
                                                },
                                                enable: {
                                                    get: ()=>shuttersAreEnabled_,
                                                    set: (enable)=>shuttersAreEnabled_ = enable
                                                }
                                            });
                                            return shutters;
                                        }
                                    },
                                    show: {
                                        set: (value)=> {
                                            shed_.showWindows = value;
                                            renderFrameCount_ += 100;
                                        },
                                        get: ()=> {
                                            return shed_.showWindows;
                                        }
                                    }
                                });

                                return windows;
                            }
                        },
                        /**
                         * Shows/hides the doors
                         */
                        showDoors: {
                            set: (value)=> {
                                console.warn("DEPRECATED. Use Viewer3D.shed.doors.show");
                                shed_.showDoors = value;
                                renderFrameCount_ += 100;
                            },
                            get: ()=> {
                                console.warn("DEPRECATED. Use Viewer3D.shed.doors.show");
                                return shed_.showDoors;
                            }
                        },
                        /**
                         * Shows/hides the windows
                         */
                        showWindows: {
                            set: (value)=> {
                                console.warn("DEPRECATED. Use Viewer3D.shed.windows.show");
                                shed_.showWindows = value;
                                renderFrameCount_ += 100;
                            },
                            get: ()=> {
                                console.warn("DEPRECATED. Use Viewer3D.shed.windows.show");
                                return shed_.showWindows;
                            }
                        },
                        showShutters: {
                            get: ()=> {
                                console.warn("DEPRECATED. Use Viewer3D.shed.windows.shutters.show");
                                return shed_.showShutters;
                            },
                            set: (value)=> {
                                console.warn("DEPRECATED. Use Viewer3D.shed.windows.shutters.show");
                                _.each(shed_.windows, (window)=> {
                                    if (value && windowCanHaveShutters(window)) {
                                        window.hasShutters = true;
                                    } else {
                                        window.hasShutters = false;
                                    }
                                });
                                shed_.showShutters = value;
                                renderFrameCount_ += 30;
                            },
                        },
                        showFlowerBoxes: {
                            get: ()=> {
                                console.warn("DEPRECATED. Use Viewer3D.shed.windows.flowerBoxes.show");
                                return shed_.showFlowerBoxes;
                            },
                            set: (value)=> {
                                console.warn("DEPRECATED. Use Viewer3D.shed.windows.flowerBoxes.show");
                                _.each(shed_.windows, (window)=> {
                                    window.hasFlowerBox = value;
                                });

                                shed_.showFlowerBoxes = value;
                                renderFrameCount_ += 30;
                            },
                        },
                        roof: {
                            get: ()=> {
                                let roof = {};
                                Object.defineProperties(roof, {
                                    color: {
                                        get: ()=> {
                                            return shed_.roof.color;
                                        },
                                        set: (value)=> {
                                            shed_.roof.color = value;
                                            renderFrameCount_ += 100;
                                            self.emit(new Event("change"));
                                        }
                                    }
                                });

                                return roof;
                            }
                        },
                        style: {
                            get: ()=> {
                                return shed_.style;
                            }/*,
                             set: (value)=> {
                             if (!_.includes(["Urban Barn", "Urban Shack", "Urban Lean-to", "Urban Econ"], value)) {
                             throw(new Error('Style must be one of the following: "Urban Barn", "Urban Shack", "Urban Lean-to", "Urban Econ"'));
                             }
                             shed_.style = value;
                             }*/
                        },
                        width: {
                            get: ()=> {
                                return shed_.width / tools.ft2cm(1);
                            }
                        },
                        depth: {
                            get: ()=> {
                                return shed_.depth / tools.ft2cm(1);
                            }
                        },
                        height: {
                            get: ()=> {
                                return shed_.height / tools.ft2cm(1);
                            }
                        }
                    });

                    return shed;
                }
            },
            /**
             * Environemtn control object. Allows to enable/disable grass environemnt
             */
            environment: {
                get: ()=> {
                    let environment = {};
                    Object.defineProperties(environment, {
                        enabled: {
                            set: (value)=> {
                                environment_.enabled = value;
                                renderFrameCount_ += 30;
                            },
                            get: ()=> {
                                return environment_.enabled;
                            }
                        },
                        grassScale: {
                            set: (value)=> {
                                environment_.grassScale = value;
                                renderFrameCount_ += 30;
                            }
                        },
                        grassCount: {
                            set: (value)=> {
                                environment_.grassCount = value;
                                renderFrameCount_ += 30;
                            }
                        }
                    });
                    return environment;
                }
            }
        });
    }
}

module.exports = Viewer3D;
