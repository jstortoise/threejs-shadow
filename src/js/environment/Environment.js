const THREE = require('three');
const _ = require('lodash');
const assets = require('./../helpers/assets');
const TextureGenerator = require('./../helpers/TextureGenerator');
//const Grass = require('./grass');

/**
 * Environment models and lights. Earth, sky and lights are the parts of it.
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Environment extends THREE.Object3D {
    /**
     * Adds sky, terrain, lights and grass.
     * @param _shedWidth Shed's width - required for the grass
     * @param _shedDepth Shed's depth - required for the grass
     */
    constructor(_shedWidth, _shedDepth) {
        super();

        let self = this;

        let isEnabled_ = false;

        let ambientLight = new THREE.AmbientLight(0x777777);
        this.add(ambientLight);

        let sun = new THREE.DirectionalLight(0xdfebff, 1.2);
        sun.position.set(300, 400, 500);

        sun.castShadow = true;
        sun.shadow.bias = 0.0005;

        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;

        var dimension = 650;

        sun.shadow.camera.left = -dimension;
        sun.shadow.camera.right = dimension;
        sun.shadow.camera.top = dimension;
        sun.shadow.camera.bottom = -dimension;

        sun.shadow.camera.far = 1500;
        this.add(sun);

        let light2 = new THREE.DirectionalLight(0xdfebff, 0.8);
        light2.position.set(-300, 400, -500);
        this.add(light2);

        let textureGenerator = new TextureGenerator();
        let textureLoader = new THREE.TextureLoader();

        let skyMap = textureLoader.load(assets.img.skybox);

        let sky = new THREE.Mesh(new THREE.SphereGeometry(7500, 32, 32), new THREE.MeshBasicMaterial({
            map: null
        }));
        sky.scale.x = -1;
        sky.rotateY(-Math.PI * 0.25);
        sky.position.setY(200);
        this.add(sky);

        let reflection = new THREE.Mesh(new THREE.SphereGeometry(7600, 32, 32), new THREE.MeshBasicMaterial({
            map: textureLoader.load(assets.img["panoram"])
        }));
        reflection.scale.x = -1;
        reflection.rotateY(-Math.PI * 0.25);
        reflection.position.setY(200);
        this.add(reflection);

        let terra_ = new THREE.Mesh(new THREE.CircleGeometry(7500, 64), new THREE.MeshPhongMaterial({
            color: 0xffffff/*0x646a12,*/,
        }));

        let grassMap_;
        textureGenerator.getGrass("#5f6909"/*"#646a12"/*"#727b1a"*/).then((grassMap)=> {
            grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
            grassMap.repeat.x = grassMap.repeat.y = 30;
            terra_.material.map = null;
            terra_.material.needsUpdate = true;
            grassMap_ = grassMap;
        });


        terra_.rotateX(Math.PI * 0.5);
        terra_.rotateY(Math.PI);

        this.add(terra_);

        terra_.receiveShadow = true;

        //let grass_ = new Grass(_shedWidth, _shedDepth);
        //this.add(grass_);

        /**
         * Updates grass render
         * @param camera Scene camera
         */
        this.update = (camera)=> {
            if (isEnabled_) {
                //grass_.update(camera);
                sky.position.copy(camera.position);
                reflection.position.copy(camera.position);
                sky.position.setY(camera.position.y * 0.2);
                reflection.position.setY(camera.position.y * 0.2);
            }
        };

        this.showReflection = (show)=> {
            terra_.visible = !show;
            if (isEnabled_) {
                //grass_.visible = !show;
            } else {
                sky.visible = !show;
            }
        };

        this.setShedSize = (shedWidth, shedDepth)=> {
            //grass_.setShedSize(shedWidth, shedDepth);
            _shedWidth = shedWidth;
            _shedDepth = shedDepth;
        };

        Object.defineProperties(this, {
            surface: {
                get: ()=> {
                    return terra_;
                }
            },
            enabled: {
                get: ()=> {
                    return isEnabled_;
                },
                set: (value)=> {
                    if (value == isEnabled_) {
                        return;
                    }

                    if (value) {
                        //grass_.visible = true;
                        terra_.material.map = grassMap_;
                        sky.material.map = skyMap;
                    } else {
                        //grass_.visible = false;
                        terra_.material.map = null;
                        sky.material.map = null;
                    }

                    terra_.material.needsUpdate = sky.material.needsUpdate = true;

                    isEnabled_ = value;
                }
            },
            grassScale: {
                set: (value)=> {
                    //grass_.grassScale = value;
                }
            },
            grassCount: {
                set: (value)=> {
                    //grass_.grassCount = value;
                }
            },
            shadowsEnabled: {
                get: ()=> {
                    return sun.castShadow;
                },
                set: (value)=> {
                    sun.castShadow = value;
                }
            }
        });
    }
}


module.exports = Environment;
