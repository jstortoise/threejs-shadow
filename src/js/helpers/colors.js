const THREE = require('three');
/**
 * Color parameters and material parameters constant. Any material parameters could be stored here
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
let colors = {
    shingleMap: {
        "Heritage Rustic Black": "RusticBlack",
        "Heritage Black Walnut": "BlackWalnut",
        "Heritage Rustic Cedar": "RusticCedar",
        "Heritage Mountain Slate": "MountainSlate"
    },
    metalMap: {
        "Vintage White": "#c3c2c2",
        "Rustic Red": "#954333",
        "Gray": "#929496",
        "Evergreen": "#0b5e4e",
        "Desert Sand": "#b1a998",
        "Coal Black": "#08080b",
        "Galvalume": "roofs/galvalume"
    },
    metalMaterialOptions: {
        /*shininess: 20,*/
        specular: 0x222222,
        side: THREE.DoubleSide
    },
    galvalume: 0xb8b8b8//0xb7c8d0//0x8d9794
};

module.exports = colors;
