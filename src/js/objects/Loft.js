const THREE = require('three');
const tools = require('./../helpers/tools');
const DraggableObject = require('./../objects/DraggableObject');
const Plan = require('./../helpers/Plan');
const _ = require('lodash');
const assets = require('./../helpers/assets');

let font_;

class Loft extends DraggableObject {
    constructor(type, environmentCamera, shedHeight, parameters) {
        super();
        let placementIsForbidden_ = false;

        const ft1 = 30.48;

        let self = this;
        let center_ = 0;

        let depth_ = ft1
        let value_ = 1;
        let angle_ = 0;
        let grip_, bg_, line_, text_, cross_;
        let textWidth_;


        const maxValue = parameters.shedDepth / ft1;

        this.resize = (x, y, z)=> {
            if (angle_ == 0) {
                value_ = parameters.shedDepth * 0.5 / ft1 - Math.round(z / ft1);
            }
            else {
                value_ = parameters.shedDepth * 0.5 / ft1 + Math.round(z / ft1);
            }
            if (value_ < 1) {
                value_ = 1;
            }

            if (value_ > maxValue) {
                value_ = maxValue;
            }

            depth_ = tools.ft2cm(value_);

            let realZ = -depth_;
            cross_.position.z = grip_.position.z = line_.position.z = realZ;

            if (text_) {
                generateText();
            }

            let vertices = bg_.geometry.attributes.position.array;
            vertices[8] = realZ;
            vertices[11] = realZ;
            bg_.geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            bg_.geometry.needsUpdate = true;
        };

        Object.defineProperties(this, {
            placementForbidden: {
                get: ()=> {
                    return placementIsForbidden_;
                },
                set: (value)=> {
                    bg_.material.color = new THREE.Color(value ? 0x770000 : 0x007700);
                    bg_.material.needsUpdate = true;
                    placementIsForbidden_ = value;
                }
            },
            boundingBox: {
                get: ()=> {
                    return new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
                }
            }
            ,
            x: {
                get: ()=> {
                    return 0;
                },
                set: (value)=> {
                    //Useless, as this object can't be moved along X axiss
                }
            }
            ,
            z: {
                get: ()=> {
                    return center_;
                },
                set: (value)=> {
                    if (value < 0) {
                        value = -parameters.shedDepth * 0.5;
                        angle_ = Math.PI;
                        grip_.position.x = parameters.shedWidth * 0.3;
                        cross_.position.x = grip_.position.x - 30;

                    }
                    else {
                        value = parameters.shedDepth * 0.5;
                        angle_ = 0;
                        grip_.position.x = -parameters.shedWidth * 0.3;
                        cross_.position.x = grip_.position.x + 30;

                    }

                    center_ = value;
                    self.position.z = center_;
                    self.rotation.fromArray([0, angle_, 0])
                }
            },
            rotate: {
                set: (angle)=> {
                    //do nothing
                },
                get: ()=> {
                    return angle_;
                }
            }
            ,
            size: {
                get: ()=> {
                    return value_;
                },
                set: (value)=> {

                    setValue();
                    function setValue() {
                        if (!text_) {
                            setTimeout(setValue, 200);
                            return;
                        }

                        value_ = value;
                        depth_ = tools.ft2cm(value_);

                        let realZ = -depth_;
                        cross_.position.z = grip_.position.z = line_.position.z = realZ;

                        generateText();

                        let vertices = bg_.geometry.attributes.position.array;
                        vertices[8] = realZ;
                        vertices[11] = realZ;
                        bg_.geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
                        bg_.geometry.needsUpdate = true;
                    }
                }
            }
            ,
            walls: {
                get: ()=> {
                    return [];
                }
            }
            ,
            wallClones: {
                get: ()=> {
                    return [];
                }
            }
            ,
            hasLeftWall: {
                get: ()=> {
                    return false;
                }
            }
            ,
            hasRightWall: {
                get: ()=> {
                    return false
                }
            }
            ,
            grip: {
                get: ()=> {
                    return grip_;
                }
            },
            cross: {
                get: ()=> {
                    return cross_;
                }
            },
            type: {
                get: ()=> {
                    return "Loft";
                }
            }
        });

        draw();

        function draw() {
            let container = new THREE.Object3D();
            let vertices = [
                parameters.shedWidth * 0.5, 0, 0,      //0
                -parameters.shedWidth * 0.5, 0, 0,     //1
                -parameters.shedWidth * 0.5, 0, -depth_,//2
                parameters.shedWidth * 0.5, 0, -depth_, //3
            ];

            let indices = [0, 2, 1, 0, 3, 2];

            let geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            //columnGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            geometry.computeVertexNormals();

            bg_ = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                color: 0x007700,
                opacity: 0.5,
                transparent: true
            }));
            container.add(bg_);

            line_ = tools.getLine(parameters.shedWidth, 0x007700);
            line_.position.z = -depth_;
            container.add(line_);

            grip_ = new THREE.Object3D();
            let gripBG = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), new THREE.MeshPhongMaterial({color: 0x007700}));
            gripBG.rotateX(-Math.PI * 0.5);
            grip_.add(gripBG);

            let i = -8;
            _.times(3, ()=> {
                let circle = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), new THREE.MeshPhongMaterial({color: 0x007700}));
                circle.position.x = i;
                circle.position.y = 1;
                grip_.add(circle);
                i += 8;
            });

            grip_.position.z = line_.position.z;
            grip_.position.y = 1;
            grip_.position.x = -parameters.shedWidth * 0.3;
            container.add(grip_);

            cross_ = new THREE.Object3D();

            let cross1 = new THREE.Mesh(new THREE.PlaneGeometry(20, 7), new THREE.MeshPhongMaterial({color: 0xcc0000}));
            let cross2 = cross1.clone();
            cross1.rotation.fromArray([-Math.PI * 0.5, 0, Math.PI * 0.25]);
            cross2.rotation.fromArray([-Math.PI * 0.5, 0, -Math.PI * 0.25]);

            cross_.add(cross1);
            cross_.add(cross2);

            cross_.position.z = line_.position.z;
            cross_.position.y = 1;
            cross_.position.x = grip_.position.x + 30;
            container.add(cross_);

            if (!parameters.noText || !font_) {
                let fontLoader = new THREE.FontLoader();
                fontLoader.load(assets.fonts.arial, function (font) {
                    font_ = font;
                    generateText();
                    container.add(text_);
                });
            }

            container.position.y = tools.planY;
            self.add(container);
        }

        function generateText() {
            let parent;
            if (text_) {
                parent = text_.parent;
                parent.remove(text_);
            }

            text_ = new THREE.Mesh(new THREE.TextGeometry(value_ + "' loft", {
                font: font_,
                size: 15,
                height: 0.5
            }), new THREE.MeshPhongMaterial({color: 0x555555, shininess: 0}));
            text_.rotateX(-Math.PI * 0.5);
            text_.position.y = 25;
            text_.position.x = grip_.position.x;

            text_.geometry.computeBoundingBox();
            let bbox = text_.geometry.boundingBox;
            textWidth_ = bbox.max.x - bbox.min.x;

            if (angle_ == 0) {
                text_.rotation.fromArray([-Math.PI * 0.5, 0, Math.PI * 0.5]);
                if (value_ <= Math.ceil(maxValue * 0.3)) {
                    text_.position.z = -depth_ - 15;
                } else {
                    text_.position.z = -depth_ + textWidth_ + 15;
                }
            } else {
                text_.rotation.fromArray([-Math.PI * 0.5, 0, -Math.PI * 0.5]);
                if (value_ <= Math.ceil(maxValue * 0.3)) {
                    text_.position.z = -depth_ - textWidth_ - 15;
                } else {
                    text_.position.z = -depth_ + 15;
                }
            }

            if (parent) {
                parent.add(text_);
            }
        }
    }
}

module.exports = Loft;
