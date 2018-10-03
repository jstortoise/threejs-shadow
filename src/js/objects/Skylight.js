const THREE = require('three');
const DraggableObject = require('./DraggableObject');
const tools = require('./../helpers/tools');
const _ = require('lodash');
const TextureGenerator = require('./../helpers/TextureGenerator');

/**
 * The Door 3D object
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Skylight extends DraggableObject {
    /**
     * Creates door object
     * @param type Door type
     * @param environmentCamera CubeCamera, to make reflections
     */
    constructor(type, environmentCamera) {
        const ROOF_MAP_HEIGHT = tools.ft2cm(3);

        let placementIsForbidden_ = false;
        let baseMaterial = new THREE.MeshStandardMaterial({color: 0xa1927b});
        let bottomMaterial = new THREE.MeshStandardMaterial({color: 0xaa9f96});
        let bubbleMaterial = new THREE.MeshPhongMaterial({
            envMap: environmentCamera.renderTarget.texture,
            color: 0xa1927b,
            reflectivity: 0.2
        });

        let glassMaterial = new THREE.MeshPhongMaterial({
            envMap: environmentCamera.renderTarget.texture,
            color: 0xa1927b,
            reflectivity: 0.2,
            displacementScale: 2
        });

        let materialMap = {
            "Skylight_Base": baseMaterial,
            "Skylight_Bottom": bottomMaterial,
            "Skylight_Bubble": bubbleMaterial,
        };

        super({
            models: ["Skylight_Base", "Skylight_Bottom", "Skylight_Bubble"],
            materialMap: materialMap
        });
        let self = this;
        let isMetal_ = type == 'metal';

        //add metal skylight
        let simpleObjects = [];
        let metalObjects = [];

        const planeWidth = tools.ft2cm(2);
        self.loadPromise.then(()=> {
            _.each(self.children, (child)=> {
                simpleObjects.push(child);
            });


            let mesh = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, tools.ft2cm(3), Math.ceil(planeWidth), 1), new THREE.MeshPhongMaterial());
            mesh.rotateX(-Math.PI * 0.5);
            mesh.rotateZ(Math.PI * 0.5);
            self.add(mesh);
            mesh.position.y = 1;
            metalObjects.push(mesh);

            let uvX = planeWidth / ROOF_MAP_HEIGHT;
            _.each(mesh.geometry.faceVertexUvs, (faceVertexUVs)=> {
                _.each(faceVertexUVs, (faceUVs)=> {
                    for (let i = 0; i < faceUVs.length; i++) {
                        faceUVs[i].x *= uvX;
                    }
                })
            });


            let textureGenerator = new TextureGenerator();
            Promise.all([
                textureGenerator.getMetallicRoofBump(),
                textureGenerator.getMetallicRoofDisplacement(),
            ]).then(([bump, displacement])=> {
                glassMaterial.bumpMap = bump;
                glassMaterial.displacementMap = displacement;

                displacement.wrapS = displacement.wrapT =
                    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

                mesh.material = glassMaterial;
                mesh.material.needsUpdate = true;
            });

            self.switchToMetal(isMetal_);
        });

        this.switchToMetal = (toMetal = true)=> {
            _.each(simpleObjects, (simple)=> {
                simple.visible = !toMetal;
            });

            _.each(metalObjects, (metal)=> {
                metal.visible = toMetal;
            });

            isMetal_ = toMetal;
        };


        Object.defineProperties(this, {
            planBox: {
                get: ()=> {
                    if (isMetal_) {
                        return new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1), 0, -tools.ft2cm(1.5)), new THREE.Vector3(tools.ft2cm(1), 10, tools.ft2cm(1.5)))
                    } else {
                        return new THREE.Box3(new THREE.Vector3(-tools.in2cm(12), 0, -tools.in2cm(12)), new THREE.Vector3(tools.in2cm(12), 10, tools.in2cm(12)))
                    }
                }
            },
            type: {
                get: ()=> {
                    return "Skylight";
                }
            },
            boundingBox: {
                get: ()=> {
                    return new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1), 0, -tools.ft2cm(1.5)), new THREE.Vector3(tools.ft2cm(1), 10, tools.ft2cm(1.5)))
                }
            },
            placementForbidden: {
                get: ()=> {
                    return placementIsForbidden_;
                },
                set: (value)=> {
                    placementIsForbidden_ = (value) ? true : false;
                    bubbleMaterial.color = value ? new THREE.Color(0xff0000) : new THREE.Color(0xa1927b);
                    bubbleMaterial.needsUpdate = true;
                },
                configurable: true
            }
        });
    }
}


module.exports = Skylight;
