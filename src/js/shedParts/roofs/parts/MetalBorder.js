const THREE = require('three');
const _ = require('lodash');
const tools = require('./../../../helpers/tools');
const colors = require('./../../../helpers/colors');
const Bolt = require('./Bolt');
const assets = require('./../../../helpers/assets');

/**
 * Metal trim for metallic roof object
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class MetalBorder extends THREE.Object3D {
    /**
     * Constructs the trim by given width
     * @param _width The width of the trim. Usually it's the width of 1 roof surface.
     */
    constructor(_width) {
        super();

        let self = this;
        let color_;
        let material = new THREE.MeshPhongMaterial(colors.metalMaterialOptions);

        let plane1 = new THREE.Mesh(new THREE.PlaneGeometry(_width, tools.in2cm(5)), material);
        plane1.rotateX(-Math.PI * 0.5);
        plane1.position.setZ(-tools.in2cm(2.5));
        plane1.position.setY(2.245);
        plane1.receiveShadow = true;
        this.add(plane1);

        let plane2 = new THREE.Mesh(new THREE.PlaneGeometry(_width, tools.in2cm(1.25)), material);
        plane2.rotateX(-Math.PI * 0.75);
        plane2.position.setZ(-tools.in2cm(5) - 1.1225);
        plane2.position.setY(1.1225);
        plane2.receiveShadow = true;
        this.add(plane2);

        let plane3 = new THREE.Mesh(new THREE.PlaneGeometry(_width, tools.in2cm(0.5)), material);
        plane3.rotateX(-Math.PI * 0.5);
        plane3.position.setZ(-tools.in2cm(5) - 2.245 - tools.in2cm(0.25));
        plane3.position.setY(0);
        plane3.receiveShadow = true;
        this.add(plane3);

        let plane4 = new THREE.Mesh(new THREE.PlaneGeometry(_width, tools.in2cm(3.5)), material);
        plane4.position.setZ(0);
        plane4.position.setY(2.245 - tools.in2cm(3.5) * 0.5);
        plane4.receiveShadow = true;
        this.add(plane4);

        let bolt1 = new Bolt();
        bolt1.position.z = plane4.position.z;
        bolt1.position.y = plane4.position.y;
        bolt1.position.x = _width * 0.5 - 10;
        bolt1.rotateX(Math.PI * 0.5);
        this.add(bolt1);

        let bolt2 = bolt1.clone();
        bolt2.position.x *= -1;
        this.add(bolt2);

        let plane5 = new THREE.Mesh(new THREE.PlaneGeometry(_width, tools.in2cm(0.5)), material);
        plane5.rotateX(-Math.PI * 0.25);
        plane5.position.setZ(0.419);
        plane5.position.setY(2.245 - tools.in2cm(3.5) - 0.419);
        plane5.receiveShadow = true;
        this.add(plane5);

        this.clone = ()=> {
            let border = new MetalBorder(_width);
            border.position.setY(self.position.y);
            border.position.setX(self.position.x);
            border.position.setZ(self.position.z);
            border.rotation.fromArray(self.rotation.toArray());
            border.color = color_;
            return border;
        };

        Object.defineProperties(this, {
            color: {
                set: (color)=> {
                    color_ = color;
                    if (typeof color === "string" && color != "Galvalume") {
                        material.color = new THREE.Color(colors.metalMap[color]);
                        material.map = null;
                        material.specularMap = null;
                    }
                    else {
                        material.color = new THREE.Color(colors.galvalume);
                        if (color) {
                            let textureLoader = new THREE.TextureLoader();
                            let map = textureLoader.load(assets.img["roofs/galvalume"]);
                            map.wrapT = map.wrapS = THREE.RepeatWrapping;
                            map.repeat.x = 1;
                            map.repeat.y = 0.1;
                            material.map = map;
                            material.specularMap = map;
                        }
                    }
                    material.needsUpdate = true;

                    _.each([bolt1, bolt2], (bolt)=> {
                        if (typeof color === "string") {
                            bolt.color = colors.metalMap[color];
                        } else {
                            bolt.color = colors.galvalume;
                        }
                    });
                }
            },
            width: {
                get: ()=> {
                    return _width;
                }
            }
        })
    }
}

module.exports = MetalBorder;
