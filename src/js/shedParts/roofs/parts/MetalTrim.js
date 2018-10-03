const THREE = require('three');
const tools = require('./../../../helpers/tools');
const _ = require('lodash');
const colors = require('./../../../helpers/colors');
const Bolt = require('./Bolt');
const assets = require('./../../../helpers/assets');

/**
 * Metal trim on top of the shed, connecting two roof parts
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class MetalTrim extends THREE.Object3D {
    /**
     * Constructs the trim
     * @param width Half width of the trim
     * @param depth Roof depth
     * @param angle Angle between roof part and X-axis
     */
    constructor(width, depth, angle) {
        super();

        const ROOF_MAP_WIDTH = tools.ft2cm(3);

        const materialOptions = _.extend(colors.metalMaterialOptions, {
            side: THREE.FrontSide
        });

        let plane1 = new THREE.Mesh(new THREE.PlaneGeometry(depth, width), new THREE.MeshPhongMaterial(materialOptions));
        let plane2 = new THREE.Mesh(new THREE.PlaneGeometry(depth, tools.in2cm(0.5)), new THREE.MeshPhongMaterial(materialOptions));
        let plane3 = new THREE.Mesh(new THREE.PlaneGeometry(depth, tools.in2cm(2.5)), new THREE.MeshPhongMaterial(materialOptions));
        let plane4 = new THREE.Mesh(new THREE.PlaneGeometry(depth, tools.in2cm(2.5)), new THREE.MeshPhongMaterial(materialOptions));
        let plane5 = new THREE.Mesh(new THREE.PlaneGeometry(depth, tools.in2cm(0.5)), new THREE.MeshPhongMaterial(materialOptions));
        let plane6 = new THREE.Mesh(new THREE.PlaneGeometry(depth, width), new THREE.MeshPhongMaterial(materialOptions));
        let container = new THREE.Object3D();


        let halfWidth = width * 0.5;
        let plane3Half = tools.in2cm(2.5) * 0.5;

        plane1.rotateX(Math.PI * 0.5 + angle);
        plane2.rotateX(Math.PI);
        plane3.rotateX(Math.PI * 0.5 + angle);
        plane4.rotateX(Math.PI - Math.PI * 0.5 - angle);
        plane6.rotateX(Math.PI - Math.PI * 0.5 - angle);

        plane3.position.setZ(plane3Half * Math.cos(angle));
        plane3.position.setY(-plane3Half * Math.sin(angle));

        let plane2Half = tools.in2cm(0.5) * 0.5;
        plane2.position.setZ(plane3Half * 2 * Math.cos(angle));
        plane2.position.setY(-plane3Half * 2 * Math.sin(angle) - plane2Half);

        plane1.position.setZ(plane2.position.z + halfWidth * Math.cos(angle));
        plane1.position.setY(plane2.position.y - halfWidth * Math.sin(angle) - plane2Half);

        plane6.position.setZ(-plane1.position.z);
        plane6.position.setY(plane1.position.y);

        plane5.position.setZ(-plane2.position.z);
        plane5.position.setY(plane2.position.y);

        plane4.position.setZ(-plane3.position.z);
        plane4.position.setY(plane3.position.y);

        _.each([plane1, plane2, plane3, plane4, plane5, plane6], (planeMesh)=> {
            planeMesh.castShadow = planeMesh.receiveShadow = true;
            container.add(planeMesh);

            let shadowPlane = planeMesh.clone();
            shadowPlane.rotateX(Math.PI);
            shadowPlane.position.setY(shadowPlane.position.y - 0.7);
            container.add(shadowPlane);
        });

        container.rotateY(Math.PI * 0.5);
        container.position.setY(tools.in2cm(0.5));

        this.add(container);

        let bolts = [];
        _.times(Math.ceil(depth / 11.7 / 2), (idx)=> {
            if (idx == 0) {

                _.times(2, (id)=> {
                    let bolt = new Bolt();

                    if (id == 0) {
                        bolt.position.setY(plane1.position.y);
                        bolt.position.setZ(plane1.position.z);
                        bolt.rotateX(Math.PI * 0.5 + plane1.rotation.x);
                    } else {
                        bolt.position.setY(plane6.position.y);
                        bolt.position.setZ(plane6.position.z);
                        bolt.rotateX(Math.PI * 0.5 + plane6.rotation.x);
                    }

                    container.add(bolt);
                    bolts.push(bolt);
                });
            }

            _.times(4, (id)=> {
                let bolt = new Bolt();

                if (id < 2) {
                    bolt.position.setY(plane1.position.y);
                    bolt.position.setZ(plane1.position.z);
                    bolt.rotateX(Math.PI * 0.5 + plane1.rotation.x);
                } else {
                    bolt.position.setY(plane6.position.y);
                    bolt.position.setZ(plane6.position.z);
                    bolt.rotateX(Math.PI * 0.5 + plane6.rotation.x);
                }

                if (id == 0 || id == 2) {
                    bolt.position.setX(idx * 11.7);
                } else {
                    bolt.position.setX(-idx * 11.7);
                }

                container.add(bolt);
                bolts.push(bolt);
            });
        });

        Object.defineProperties(this, {
            color: {
                set: (color)=> {
                    _.each([plane1, plane2, plane3, plane4, plane5, plane6], (planeMesh)=> {

                        if (typeof color === "string" && colors.metalMap[color]) {
                            planeMesh.material.color = new THREE.Color(colors.metalMap[color]);
                            planeMesh.material.specularMap = null;
                            planeMesh.material.map = null;
                        }
                        else {
                            planeMesh.material.color = new THREE.Color(colors.galvalume);
                            planeMesh.material.specularMap = color;
                            let textureLoader = new THREE.TextureLoader();
                            let map = textureLoader.load(assets.img["roofs/galvalume"]);
                            map.wrapT = map.wrapS = THREE.RepeatWrapping;
                            map.repeat.x = depth / ROOF_MAP_WIDTH;
                            map.repeat.y = 0.1;
                            planeMesh.material.map = map;
                        }
                        planeMesh.material.needsUpdate = true;

                        _.each(bolts, (bolt)=> {
                            if (typeof color === "string") {
                                bolt.color = colors.metalMap[color];
                            } else {
                                bolt.color = colors.galvalume;
                            }
                        });
                    });
                }
            }
        });
    }
}

module.exports = MetalTrim;
