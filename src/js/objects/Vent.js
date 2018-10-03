const THREE = require('three');
const DraggableObject = require('./DraggableObject');
const assets = require('../helpers/assets');
const tools = require('../helpers/tools');

/**
 * Vent object, placed on the roof. It is different for metallic and shingle roofs
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Vent extends DraggableObject {
    /**
     * Creates the vent object
     * @param type Type of the vent, could be Vent.SIMPLE, Vent.METAL, Vent.GABLE_STANDARD.
     *              @default - Vent.SIMPLE
     */
    constructor(type = Vent.SIMPLE) {
        let textureLoader = new THREE.TextureLoader();

        let materialMap = {
            'VentBase.obj': new THREE.MeshPhongMaterial({
                color: 0x000000,
                specular: 0x777777
            }),
            'VentBorder.stl': new THREE.MeshPhongMaterial(),
            'VentHandle.stl': new THREE.MeshPhongMaterial(),
            'VentMetal.stl': new THREE.MeshPhongMaterial({color: 0xcccccc}),
            'standard_vent': new THREE.MeshPhongMaterial({
                color: 0x777777,
                normalMap: textureLoader.load(assets.img.standard_vent_b)
            })
        };

        let models = {};
        models[Vent.SIMPLE] = ["VentBorder.stl", "VentBase.obj", "VentHandle.stl"];
        models[Vent.METAL] = ["VentBorder.stl", "VentMetal.stl"];
        models[Vent.GABLE_STANDARD] = ["standard_vent"];

        super({
            models: models[type],
            materialMap: materialMap
        });

        if (type != Vent.GABLE_STANDARD) {
            let plane = new THREE.Mesh(new THREE.PlaneGeometry(29.778, 29.778), new THREE.MeshPhongMaterial({
                map: textureLoader.load(assets.img.SolarCell)
            }));

            plane.position.setY(15.73);
            plane.rotateX(-Math.PI * 0.5);
            plane.rotateZ(Math.PI * 0.5);
            this.add(plane);
        }

        Object.defineProperties(this, {
            boundingBox: {
                get: ()=> {
                    if (type != Vent.GABLE_STANDARD) {
                        return new THREE.Box3(new THREE.Vector3(-tools.in2cm(10), 0, -tools.in2cm(10)), new THREE.Vector3(tools.in2cm(10), 10, tools.in2cm(10)))
                    } else {
                        return new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0))
                    }
                }
            }
        })
    }
}

Vent.SIMPLE = 1;
Vent.METAL = 2;
Vent.GABLE_STANDARD = 3;

module.exports = Vent;
