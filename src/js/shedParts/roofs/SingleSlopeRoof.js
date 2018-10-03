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
 * Single Slope Roof 3D object.
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2018
 */
class SingleSlopeRoof extends THREE.Object3D {
    /**
     * Creates roof object
     * @param shedWidth Shed's width
     * @param shedDepth Shed's depth
     */
    constructor(shedWidth, shedDepth) {
        super();
        let self = this;
        let planes_ = [];

        const ROOF_MAP_WIDTH = tools.ft2cm(5);
        const ROOF_MAP_HEIGHT = tools.ft2cm(5);

        let textureLoader = new THREE.TextureLoader();
        let texture = textureLoader.load(assets.img["RusticBlack"]);
        let bump = textureLoader.load(assets.img["RusticBlack_b"]);
        let color_ = "Heritage Rustic Black";

        let dPadding = 5;
        let wPadding = 0;

        let vector = new THREE.Vector3(-shedWidth * 0.5, 0, 0).sub(new THREE.Vector3(shedWidth * 0.5, -shedWidth * 2.5 / 12, 0));
        let borderSize = vector.length() + 2 * wPadding;
        vector.normalize();

        const in2 = tools.in2cm(2);
        const in4_5 = tools.in2cm(4.5);
        let slopeVector = new THREE.Vector3(-shedWidth * 0.5, shedWidth * 0.25, 0)
            .sub(new THREE.Vector3(shedWidth * 0.5, 0, 0))
            .normalize();
        let slopeDistance = in4_5 / Math.cos(0.244979);
        let slopeVertex2 = new THREE.Vector3(-shedWidth * 0.5, shedWidth * 0.25, 0)
            .add(slopeVector.clone().multiplyScalar(slopeDistance));

        let vertices_ = [
            slopeVertex2.x, slopeVertex2.y + in4_5, shedDepth * 0.5 + dPadding,       //0
            shedWidth * 0.5 + in4_5, in4_5, shedDepth * 0.5 + dPadding,               //1
            slopeVertex2.x, slopeVertex2.y + in4_5, -shedDepth * 0.5 - dPadding,      //2
            shedWidth * 0.5 + in4_5, in4_5, -shedDepth * 0.5 - dPadding,              //3
        ];

        let newVertex0 = new THREE.Vector3(vertices_[0], vertices_[1], vertices_[3]).add(vector.clone().multiplyScalar(wPadding));
        vertices_[9] = vertices_[0] = newVertex0.x;
        vertices_[10] = vertices_[1] = newVertex0.y;

        let newVertex1 = new THREE.Vector3(vertices_[3], vertices_[4], vertices_[5]).sub(vector.clone().multiplyScalar(wPadding));
        vertices_[6] = vertices_[3] = newVertex1.x;
        vertices_[7] = vertices_[4] = newVertex1.y;

        let indices = [
            0, 2, 1,
            0, 3, 2
        ];

        let uvs = [
            0, 0,
            0, 1,
            1, 1,
            1, 0
        ];

        let roofGeometry = new THREE.BufferGeometry();
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
        this.add(roof);

        let metalObjects_ = [];
        let shingleObjects_ = [];
        let textureGenerator = new TextureGenerator();

        let planePosition = new THREE.Vector3(vertices_[0], vertices_[1], vertices_[2]).sub(vector.multiplyScalar(borderSize * 0.5));

        let planeWidth = shedDepth + 2 * dPadding;
        let planeHeight = borderSize + wPadding;

        const uvY = shedWidth / ROOF_MAP_WIDTH;
        const uvX = (shedDepth + dPadding * 2) / ROOF_MAP_HEIGHT;
        let metalOptions = _.extend(colors.metalMaterialOptions, {displacementScale: 2});

        let borderAngle = vector.angleTo(new THREE.Vector3(-1, 0, 0));

        let metalRoof = new THREE.Object3D();
        let metalRoofPlane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight, Math.ceil(planeWidth), 1),
            new THREE.MeshPhongMaterial(_.extend(metalOptions, {side: THREE.DoubleSide})));
        metalRoofPlane.position.set(planePosition.x, planePosition.y, 0);
        metalRoofPlane.rotation.fromArray([-Math.PI * 0.5, borderAngle, Math.PI * 0.5]);
        metalRoofPlane.receiveShadow = metalRoofPlane.castShadow = true;

        _.each(metalRoofPlane.geometry.faceVertexUvs[0], (uvs)=> {
            _.each(uvs, (uv)=> {
                uv.x *= uvX;
                uv.y *= uvY;
            });
        });
        planes_.push(metalRoofPlane);
        metalRoof.add(metalRoofPlane);
        metalObjects_.push(metalRoof);
        this.add(metalRoof);
        metalRoof.visible = false;

        shingleObjects_.push(roof);
        metalObjects_.push(metalRoof);

        let metalBorder1 = new MetalBorder(borderSize + wPadding);

        metalBorder1.position.set(planePosition.x, planePosition.y, shedDepth * 0.5 + dPadding + 1);
        metalBorder1.rotation.fromArray([0, 0, -borderAngle]);
        metalRoof.add(metalBorder1);

        let metalBorder2 = metalBorder1.clone();
        metalBorder2.rotation.fromArray([0, Math.PI, borderAngle]);
        metalBorder2.position.set(planePosition.x, planePosition.y, -shedDepth * 0.5 - dPadding - 1);
        metalRoof.add(metalBorder2);

        metalObjects_.push(metalBorder1);
        metalObjects_.push(metalBorder2);

        /**
         * Sets the color (and material as the result) of the roof by color name
         * @param color Color name, should be one of defined in helpers/colors.js
         */
        function setColor(color, secondaryColor) {
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
                    } else {
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
            let y = position.y + (position.x - vertices_[0]) / (vertices_[3] - vertices_[0]) * (vertices_[4] - vertices_[1]) + vertices_[1];
            return new THREE.Vector3(position.x, y, position.z);
        }

        function getRoofAngle() {
            return -(new THREE.Vector3(vertices_[3], vertices_[4], vertices_[5])
                .sub(new THREE.Vector3(vertices_[0], vertices_[1], vertices_[2]))
                .angleTo(new THREE.Vector3(1, 0, 0)));
        }

        Object.defineProperties(this, {
            /**
             * Roof geometry's vertices
             */
            vertices: {
                get: ()=> {
                    return _.map(vertices_, _.clone);
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

module.exports = SingleSlopeRoof;
