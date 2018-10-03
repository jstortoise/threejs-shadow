const THREE = require('three');
const STLLoader = require('./../helpers/STLLoader');
const OBJLoader = require('./../helpers/OBJLoader');
const _ = require('lodash');
const TextureGenerator = require('./../helpers/TextureGenerator');
const tools = require('./../helpers/tools');
const assets = require('../helpers/assets');

/**
 * The Draggable 3D object. Base class for doors and windows
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class DraggableObject extends THREE.Object3D {
    /**
     * Creates Draggable object
     * @param options Options object like:
     *  {
     *      models: Array,
     *      mainColorModels: Array,
     *      secondaryColorModels: Array,
     *      materialMap: Object,
     *      callback: Function
     *  }, where:
     *      models - array of model names (file names, eg. Door6x6.obj), should be defined and not empty
     *      mainColorModels - array of model names from models array to set to main shed's color
     *      secondaryColorModels - array of model names from models array to set to secondary shed's color
     *      materialMap - the map, keys of which are model names and values - materials for those models,
     *      callback - function that called when models are loaded
     */
    constructor(options) {
        super();

        if (!options) {
            options = {};
        }

        let models = options.models || [];
        let mainColorModels = options.mainColorModels || [];
        let secondaryColorModels = options.secondaryColorModels || [];
        let materialMap = options.materialMap || {};
        let callback = options.callback;
        let planModel = options.planModel;
        let reversedPlanModel = options.reversedPlanModel;

        let self = this;
        let placementIsForbidden_ = false;
        let models_ = {};

        let bbox = {min: {}, max: {}};

        ["x", "y", "z"].forEach((dimension)=> {
            bbox.min[dimension] = 999;
            bbox.max[dimension] = -999;
        });

        let stlLoader = new STLLoader();
        let objLoader = new OBJLoader();

        //  Loading child 3D models
        let promises = _.map(models, (file)=> {
            return new Promise((done, fail)=> {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', assets.models[file]);

                xhr.onload = ()=> {
                    done({data: xhr.response, model: file});

                };

                xhr.send();
                if (/\.stl$/i.test(assets.models[file])) {
                    xhr.responseType = "arraybuffer";
                }
            });
        });

        //  Creating 3D meshes
        let loadPromise = new Promise((resolve, reject)=> {
            Promise.all(promises).then((results)=> {
                results.forEach((result)=> {
                    let geometry;
                    if (/\.stl$/i.test(assets.models[result.model])) {
                        geometry = stlLoader.parse(result.data);
                    } else {
                        geometry = objLoader.parse(result.data);
                    }

                    geometry.computeBoundingBox();
                    ["x", "y", "z"].forEach((dimension)=> {
                        if (bbox.min[dimension] > geometry.boundingBox.min[dimension]) {
                            bbox.min[dimension] = geometry.boundingBox.min[dimension];
                        }
                        if (bbox.max[dimension] < geometry.boundingBox.max[dimension]) {
                            bbox.max[dimension] = geometry.boundingBox.max[dimension];
                        }
                    });

                    let mesh = new THREE.Mesh(geometry, materialMap[result.model]);
                    models_[result.model] = mesh;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    if (/\.stl$/i.test(assets.models[result.model])) {
                        mesh.rotateX(-Math.PI * 0.5);
                        mesh.rotateZ(-Math.PI * 0.5);
                    } else {
                        mesh.rotateY(-Math.PI * 0.5);
                    }
                    self.add(mesh);
                });

                if (callback) {
                    callback();
                }

                resolve();
            }).catch(reject);
        });

        if (planModel) {
            planModel.position.y = tools.planY;
            self.add(planModel);
        }

        if (reversedPlanModel) {
            reversedPlanModel.position.y = tools.planY;
            reversedPlanModel.visible = false;
            self.add(reversedPlanModel);
        }


        /**
         * Sets the color of the object. Generates wooden texture with the right color, assigns bump to material
         * @param mainColor Main shed's color
         * @param secondaryColor Secondary Shed's color
         */
        this.setColor = (mainColor, secondaryColor)=> {
            let textureGenerator = new TextureGenerator();
            let textureLoader = new THREE.TextureLoader();

            /**
             * Changes color of the specified model, using specified generation function, applying bump
             * @param model Model name
             * @param _bump Path to the bump map
             * @param generatorFunction The function which generates the texture
             * @param color The color to change to
             */
            function changeColor(model, _bump, generatorFunction, color) {
                if (models_[model]) {
                    return new Promise((done)=> {
                        generatorFunction(color).then((texture)=> {
                            let bump = textureLoader.load(_bump, ()=> {
                                texture.wrapS = texture.wrapT =
                                    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

                                models_[model].material.map = texture;
                                models_[model].material.bumpMap = bump;
                                models_[model].material.needsUpdate = true;
                                done();
                            });
                        });
                    });
                } else {
                    return new Promise((done, fail)=> {
                        done();
                    })
                }
            }

            return Promise.all([
                _.map(mainColorModels, (model)=> {
                    changeColor(model, assets.img.tiles_b, textureGenerator.getWall, mainColor);
                }),
                _.map(secondaryColorModels, (model)=> {
                    changeColor(model, assets.img.wood_b, textureGenerator.getWood, secondaryColor);
                })
            ]);
        };

        this.reverse = (compareMaterial)=> {
            _.forOwn(models_, (model)=> {
                if (model.material == compareMaterial) {
                    model.scale.y *= -1;
                }
            });

            compareMaterial.side = compareMaterial.side == THREE.FrontSide ? THREE.BackSide : THREE.FrontSide;
            compareMaterial.needsUpdate = true;

            if (reversedPlanModel) {
                reversedPlanModel.visible = !reversedPlanModel.visible;
                planModel.visible = !planModel.visible;
            }
        };

        Object.defineProperties(this, {
            /**
             * The bounding box of the 3D model as object
             * {
             *  min:
             *      {
             *          x:x,:
             *          y:y
             *      }
             *  max:
             *      {
             *          x:x,
             *          y:y
             *      }
             * }
             */
            boundingBox: {
                get: ()=> {
                    let boxClone = _.cloneDeep(bbox);
                    let angle = tools.getAngleByRotation(self.rotation);
                    if (angle % Math.PI == 0) {
                        boxClone.max = {x: bbox.max.z, y: bbox.max.y, z: bbox.max.x};
                        boxClone.min = {x: bbox.min.z, y: bbox.min.y, z: bbox.min.x};
                    }

                    return new THREE.Box3().set(new THREE.Vector3(boxClone.min.x, boxClone.min.y, boxClone.min.z),
                        new THREE.Vector3(boxClone.max.x, boxClone.max.y, boxClone.max.z))
                },
                configurable: true
            },
            /**
             * Qualifies if object can be placed or not. Makes object red if set to true
             */
            placementForbidden: {
                get: ()=> {
                    return placementIsForbidden_;
                },
                set: (value)=> {
                    placementIsForbidden_ = (value) ? true : false;
                    mainColorModels.concat(secondaryColorModels).forEach((model)=> {
                        if (models_[model]) {
                            models_[model].material.color = new THREE.Color((value) ? 0xff0000 : 0xffffff);
                            models_[model].material.needsUpdate = true;
                        }
                    });
                },
                configurable: true
            },
            x: {
                get: ()=> {
                    return self.position.x
                },
                set: (value)=> {
                    self.position.x = value;
                },
                configurable: true
            },
            z: {
                get: ()=> {
                    return self.position.z
                },
                set: (value)=> {
                    self.position.z = value;
                },
                configurable: true
            },
            rotate: {
                set: (angle)=> {
                    self.rotation.fromArray([0, angle, 0]);
                },
                get: ()=> {
                    return tools.getAngleByRotation(self.rotation);
                },
                configurable: true
            },
            loadPromise: {
                get: ()=> {
                    return loadPromise;
                }
            }
        })
    }
}


module.exports = DraggableObject;
