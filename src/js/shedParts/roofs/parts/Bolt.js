const THREE = require('three');
const colors = require('./../../../helpers/colors');
const _ = require('lodash');

/**
 * The Bolt 3D object for the roof
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Bolt extends THREE.Object3D {
    constructor() {
        super();

        let R = 1;
        let boltHeight = R * 0.3;

        let cylinder1 = new THREE.Mesh(new THREE.CylinderGeometry(R, R, R * 0.1, 24), new THREE.MeshPhongMaterial(colors.metalMaterialOptions));
        cylinder1.position.setY(R * 0.05);
        this.add(cylinder1);

        let cylinder2 = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.7, R * 0.7, boltHeight, 8), new THREE.MeshPhongMaterial(
            _.extend(colors.metalMaterialOptions), {shading: THREE.FlatShading}));
        this.add(cylinder2);
        cylinder2.position.setY(boltHeight * 0.5 + R * 0.05);

        cylinder1.receiveShadow = cylinder1.castShadow =
            cylinder2.receiveShadow = cylinder2.castShadow = true;

        Object.defineProperties(this, {
            //the color name of the metalic material
            color: {
                set: (color)=> {
                    cylinder1.material.color = new THREE.Color(color);
                    cylinder2.material.color = new THREE.Color(color);
                    cylinder2.material.needsUpdate = cylinder1.material.needsUpdate = true;
                }
            }
        })
    }
}

module.exports = Bolt;
