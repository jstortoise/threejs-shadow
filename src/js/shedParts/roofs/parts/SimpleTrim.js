const THREE = require('three');
const tools = require('./../../../helpers/tools');
const colors = require('./../../../helpers/colors');
const assets = require('../../../helpers/assets');
const TextureGenerator = require('../../../helpers/TextureGenerator');

/**
 * Simple trim for shingle roofs. Trim is placed between roof parts - surfaces with different angles
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class SimpleTrim extends THREE.Object3D {
    /**
     * Creates a simple trim
     * @param width Half width of the trim
     * @param depth Depth of the roof
     * @param angle Angle between the roof part and X-axis
     */
    constructor(width, depth, angle) {
        super();

        const ROOF_MAP_HEIGHT = tools.ft2cm(2);

        let textureLoader = new THREE.TextureLoader();
        let textureGenerator = new TextureGenerator();

        let plane1 = new THREE.Mesh(new THREE.PlaneGeometry(depth, width), new THREE.MeshPhongMaterial());
        let plane2 = new THREE.Mesh(new THREE.PlaneGeometry(depth, width), new THREE.MeshPhongMaterial());
        let container = new THREE.Object3D();

        plane1.rotateX(Math.PI * 0.5 - angle);
        plane2.rotateX(Math.PI * 0.5 + angle);

        let halfWidth = width * 0.5;

        let x = -halfWidth * Math.sin(angle);
        plane1.position.setZ(-halfWidth * Math.cos(angle));
        plane1.position.setY(x);

        plane2.position.setZ(halfWidth * Math.cos(-angle));
        plane2.position.setY(x);

        plane1.castShadow = true;
        plane2.castShadow = true;

        container.add(plane1);
        container.add(plane2);

        container.rotateY(Math.PI * 0.5);
        //container.rotateZ(-Math.PI * 0.5);

        this.add(container);

        Object.defineProperties(this, {
            color: {
                set: (color)=> {
                    Promise.all([
                        textureGenerator.generateBump(colors.shingleMap[color], 1024, Math.PI),
                        textureGenerator.generateBump(colors.shingleMap[color] + "_b", 1024, Math.PI),
                    ]).then(([texture, bump])=> {

                        texture.wrapS = texture.wrapT =
                            bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

                        texture.repeat.y = bump.repeat.y = 0.1;
                        texture.repeat.x = bump.repeat.x = depth / ROOF_MAP_HEIGHT;

                        plane1.material.map = texture;
                        plane1.material.bumpMap = bump;
                        plane1.material.needsUpdate = true;

                        plane2.material.map = texture;
                        plane2.material.bumpMap = bump;
                        plane2.material.needsUpdate = true;
                    });
                }
            }
        });
    }
}

module.exports = SimpleTrim;
