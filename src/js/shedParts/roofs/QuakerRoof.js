const THREE = require('three');
const _ = require('lodash');
const tools = require('./../../helpers/tools');
const TextureGenerator = require('./../../helpers/TextureGenerator');
const SimpleTrim = require('./parts/SimpleTrim');
const MetalTrim = require('./parts/MetalTrim');
const MetalBorder = require('./parts/MetalBorder');
const colors = require('./../../helpers/colors');
const assets = require('../../helpers/assets');

/**
 * Roof 3D object for the Quaker style.
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class QuakerRoof extends THREE.Object3D {
    /**
     * Creates quaker roof object
     * @param shedWidth Shed's width
     * @param shedDepth Shed's depth
     * @param roofHeight Height of the roof
     */
    constructor(shedWidth, shedDepth, roofHeight) {
        super();
        let self = this;
        let planes_ = [];

        const ROOF_MAP_WIDTH = tools.ft2cm(5);
        const ROOF_MAP_HEIGHT = tools.ft2cm(3);

        let textureLoader = new THREE.TextureLoader();
        let texture = textureLoader.load(assets.img["RusticBlack"]);
        let bump = textureLoader.load(assets.img["RusticBlack_b"]);
        let color_ = "Heritage Rustic Black";

        let roofGeometry = new THREE.BufferGeometry();
        const tanQ = Math.tan(0.3228859);
        const in4_5 = tools.in2cm(4.5);
        let widthPadding = 0, depthPadding = 5;
        let aWidth = in4_5, aHeight = tools.in2cm(3.1875);
        let diagonal = Math.sqrt(2 * Math.pow(widthPadding, 2));

        let shingleObjects_ = [];
        let metalObjects_ = [];
        let textureGenerator = new TextureGenerator();

        let quakerTopX = shedWidth * 0.5 - ((roofHeight - aHeight) / tanQ - in4_5);
        let vertices_ = [
            -shedWidth * 0.5 - tools.ft2cm(1.5), tools.in2cm(15.1875), shedDepth * 0.5 + depthPadding,     //0
            quakerTopX, roofHeight, shedDepth * 0.5 + depthPadding,                                        //1
            shedWidth * 0.5 + in4_5, aHeight, shedDepth * 0.5 + depthPadding                               //2
        ];

        vertices_ = vertices_.concat(_.map(vertices_, (vertex, i)=> {
            if (i % 3 == 2) {
                return -vertex;
            }
            return vertex;
        }));

        let vertex = _.map(_.times(6), (idx)=> {
            let i = idx * 3;
            return new THREE.Vector3(vertices_[i], vertices_[i + 1], vertices_[i + 2]);
        });

        let vector0 = vertex[0].clone().sub(vertex[1]);
        let vector1 = vertex[2].clone().sub(vertex[1]);
        vector0.normalize();
        vector1.normalize();

        [0, 3].forEach((idx)=> {
            let i = idx * 3;
            let vector = vertex[idx].clone().add(vector0.clone().multiplyScalar(diagonal));
            vertices_[i] = vector.x;
            vertices_[i + 1] = vector.y;
            vertices_[i + 2] = vector.z;
        });

        [2, 5].forEach((idx)=> {
            let i = idx * 3;
            let vector = vertex[idx].clone().add(vector1.clone().multiplyScalar(diagonal));
            vertices_[i] = vector.x;
            vertices_[i + 1] = vector.y;
            vertices_[i + 2] = vector.z;
        });

        let indices = [
            0, 4, 3,
            0, 1, 4,
            1, 5, 4,
            1, 2, 5,
            //adding backside
            /*0, 3, 4,
             0, 4, 1,
             1, 4, 5,
             1, 2, 5*/
        ];

        let uvs = [
            1, 0.7085,
            1, 0,
            1, 1.2915,
            0, 0.7085,
            0, 0,
            0, 1.2915
        ];

        roofGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices_), 3));
        roofGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        roofGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        roofGeometry.computeVertexNormals();

        texture.wrapS = texture.wrapT =
            bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

        texture.repeat.y = bump.repeat.y = shedWidth / ROOF_MAP_WIDTH;
        texture.repeat.x = bump.repeat.x = shedDepth / ROOF_MAP_HEIGHT;

        let roof = new THREE.Mesh(roofGeometry, new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: bump,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        }));
        roof.receiveShadow = true;
        roof.castShadow = true;
        roof.position.y = 0;
        this.add(roof);

        //adding the trims
        let trimAngleVector = vertex[1].clone().sub(vertex[0]);
        let trim = new SimpleTrim(tools.in2cm(4), shedDepth + depthPadding * 2, trimAngleVector.angleTo(new THREE.Vector3(-1, 0, 0)));
        trim.position.setX(quakerTopX);
        trim.position.setY(roofHeight + 0.3);
        this.add(trim);
        trim.color = color_;
        shingleObjects_.push(trim);
        shingleObjects_.push(roof);

        let trim2 = new MetalTrim(tools.in2cm(4), shedDepth + depthPadding * 2 + 6, trimAngleVector.angleTo(new THREE.Vector3(-1, 0, 0)));
        trim2.position.setX(quakerTopX);
        trim2.position.setY(roofHeight + 5);
        this.add(trim2);
        trim2.visible = false;
        metalObjects_.push(trim2);

        let metalRoof = new THREE.Object3D();

        const uvY = shedWidth / ROOF_MAP_WIDTH;
        const uvX = (shedDepth + depthPadding * 2) / ROOF_MAP_HEIGHT;
        let metalOptions = _.extend(colors.metalMaterialOptions, {displacementScale: 2, side: THREE.DoubleSide});

        let planeWidth = vertex[0].clone().sub(vertex[3]).length();
        let plane1Height = vertex[0].clone().sub(vertex[1]).length() + 2 * widthPadding;
        let plane2Height = vertex[2].clone().sub(vertex[1]).length() + 2 * widthPadding;
        let planeAngle = vertex[0].clone().sub(vertex[1]).angleTo(new THREE.Vector3(-1, 0, 0));
        let plane1Position = vertex[0].clone().add(vertex[1].clone().sub(vertex[0]).normalize()
            .multiplyScalar(plane1Height * 0.5 - 2 * widthPadding));
        let plane2Position = vertex[1].clone().add(vertex[2].clone().sub(vertex[1]).normalize()
            .multiplyScalar(plane2Height * 0.5 - 2 * widthPadding));
        plane1Position.y += 1;
        plane2Position.y += 1;

        let plane1 = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, plane1Height, Math.ceil(planeWidth), 1),
            new THREE.MeshPhongMaterial(metalOptions));
        plane1.position.set(plane1Position.x, plane1Position.y, 0);
        plane1.rotation.fromArray([-Math.PI * 0.5, -planeAngle, Math.PI * 0.5]);
        plane1.receiveShadow = plane1.castShadow = true;

        let plane2 = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, plane2Height, Math.ceil(planeWidth), 1),
            new THREE.MeshPhongMaterial(metalOptions));
        plane2.position.set(plane2Position.x, plane2Position.y, 0);
        plane2.rotation.fromArray([-Math.PI * 0.5, planeAngle, Math.PI * 0.5]);

        _.each(plane1.geometry.faceVertexUvs[0].concat(plane2.geometry.faceVertexUvs[0]), (uvs)=> {
            _.each(uvs, (uv)=> {
                uv.x *= uvX;
                uv.y *= uvY;
            });
        });

        let border1 = new MetalBorder(plane1Height);
        border1.position.set(plane1Position.x, plane1Position.y, plane1Position.z + 1);
        border1.rotation.fromArray([0, 0, planeAngle]);

        let border2 = new MetalBorder(plane2Height);
        border2.position.set(plane2Position.x, plane2Position.y, plane2Position.z + 1);
        border2.rotation.fromArray([0, 0, -planeAngle]);

        let border3 = border1.clone();
        let border4 = border2.clone();
        border3.rotateY(Math.PI);
        border4.rotateY(Math.PI);

        border3.position.set(plane1Position.x, plane1Position.y, -plane1Position.z - 1);
        border4.position.set(plane2Position.x, plane2Position.y, -plane2Position.z - 1);

        planes_.push(plane1);
        planes_.push(plane2);
        metalRoof.add(plane1);
        metalRoof.add(plane2);
        metalRoof.add(border1);
        metalRoof.add(border2);
        metalRoof.add(border3);
        metalRoof.add(border4);
        metalRoof.visible = false;
        metalObjects_.push(metalRoof);
        this.add(metalRoof);

        /**
         * Sets the color (and material as the result) of the roof by color name
         * @param color Color name, should be one of defined in helpers/colors.js
         */
        function setColor(color) {
            if (colors.shingleMap[color]) {
                let texture = textureLoader.load(assets.img[colors.shingleMap[color]]);
                let bump = textureLoader.load(assets.img[colors.shingleMap[color] + "_b"]);

                texture.wrapS = texture.wrapT =
                    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

                texture.repeat.y = bump.repeat.y = shedWidth / ROOF_MAP_WIDTH;
                texture.repeat.x = bump.repeat.x = shedDepth / ROOF_MAP_HEIGHT;

                roof.material.map = texture;
                roof.material.bumpMap = bump;
                roof.material.displacementMap = null;
                roof.material.metalness = 0.3;
                roof.material.roughness = 0.5;
                roof.material.needsUpdate = true;

                trim.color = color;

                _.each(shingleObjects_, (object)=> {
                    object.visible = true;
                });
                _.each(metalObjects_, (object)=> {
                    object.visible = false;
                });

            } else if (colors.metalMap[color]) {
                let galvalumeMap;
                let isGalvalume = false;
                if (colors.metalMap[color].indexOf('#') != 0) {
                    isGalvalume = true;
                    galvalumeMap = textureLoader.load(assets.img[colors.metalMap[color]]);
                    galvalumeMap.wrapS = galvalumeMap.wrapT = THREE.RepeatWrapping;
                }

                Promise.all([
                    textureGenerator.getMetallicRoofBump(),
                    textureGenerator.getMetallicRoofDisplacement(),
                ]).then((results)=> {
                    let bump = results[0];
                    let displacement = results[1];

                    displacement.wrapS = displacement.wrapT =
                        bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

                    _.each(metalRoof.children, (object)=> {
                        if (object instanceof MetalBorder) {
                            object.color = color;
                            return;
                        }
                        if (!isGalvalume) {
                            object.material.color = new THREE.Color(colors.metalMap[color]);
                            object.material.specularMap = null;
                        } else {
                            object.material.color = new THREE.Color(colors.galvalume);
                            object.material.specularMap = galvalumeMap;
                        }
                        object.material.map = isGalvalume ? galvalumeMap : null;
                        object.material.bumpMap = bump;
                        object.material.displacementMap = displacement;
                        object.material.needsUpdate = true;
                    });

                    if (isGalvalume) {
                        trim2.color = galvalumeMap;
                        border1.color = galvalumeMap;
                        border2.color = galvalumeMap;
                        border3.color = galvalumeMap;
                        border4.color = galvalumeMap;
                    } else {
                        trim2.color = color;
                        border1.color = color;
                        border2.color = color;
                        border3.color = color;
                        border4.color = color;
                    }

                    _.each(shingleObjects_, (object)=> {
                        object.visible = false;
                    });
                    _.each(metalObjects_, (object)=> {
                        object.visible = true;
                    });
                });

            } else {
                throw(new Error("Wrong color name"));
            }

            color_ = color;
        }

        function getPointOnRoof(position) {
            let y = position.y;

            if (position.x > 0) {
                y += (position.x - vertices_[3]) / (vertices_[6] - vertices_[3]) * (vertices_[7] - vertices_[4]) + vertices_[4];
            } else {
                y += (position.x - vertices_[3]) / (vertices_[0] - vertices_[3]) * (vertices_[1] - vertices_[4]) + vertices_[4];
            }

            return new THREE.Vector3(position.x, y, position.z);
        }

        function getRoofAngle(position) {
            let angle = 0;
            if (position.x > 0) {
                angle = vertex[2].clone().sub(vertex[1]).angleTo(new THREE.Vector3(1, 0, 0));
                return -angle;
            } else {
                angle = vertex[0].clone().sub(vertex[1]).angleTo(new THREE.Vector3(-1, 0, 0));
                return angle;
            }
        }

        Object.defineProperties(this, {
            /**
             * Roof geometry's vertices
             */
            vertices: {
                get: ()=> {
                    const shift = aWidth * 0.5;
                    return vertices_.slice();
                }
            },
            /**
             * Roof color/material
             */
            color: {
                get: ()=> {
                    return color_;
                }, set: (value)=> {
                    setColor(value);
                }
            },
            planes: {
                get: ()=> {
                    return planes_.slice();
                }
            }
        });

        this.getPointOnRoof = getPointOnRoof;
        this.getRoofAngle = getRoofAngle;
    }
}

module.exports = QuakerRoof;
