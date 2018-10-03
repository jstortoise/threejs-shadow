const THREE = require('three');
const DraggableObject = require('./DraggableObject');
const tools = require('./../helpers/tools');
const colors = require('./../helpers/colors');
const _ = require('lodash');

/**
 * The Door 3D object
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Door extends DraggableObject {
    /**
     * Creates door object
     * @param type Door type
     * @param environmentCamera CubeCamera, to make reflections
     */
    constructor(type, environmentCamera) {
        let secondaryMaterial = new THREE.MeshPhongMaterial({bumpScale: tools.bumpScale});
        let glassMaterial = new THREE.MeshPhongMaterial({
            envMap: environmentCamera.renderTarget.texture,
            color: 0x777777
        });

        const THICKNESS = tools.in2cm(3.5);

        let partsMaterial = new THREE.MeshPhongMaterial({color: 0x333333});

        //here are options for all doors and windows
        let doorTypes = {
            "3' shed door": {
                models: ["3_Door_Frame", "3_Door_Parts"],
                secondaryColorModels: ["3_Door_Frame"]
            },
            "3' shed door (w-transom)": {
                models: ["3_Shed_Door(w-transom)", "3_Shed_Door(w-transom)_Glass", "3_Shed_Door(w-transom)_Grid", "3_Shed_Door(w-transom)_Parts"],
                secondaryColorModels: ["3_Shed_Door(w-transom)"]
            },
            "4' dutch shed door": {
                models: ["4_Dutch_Shed_Door", "4_Dutch_Shed_Door_Parts"],
                secondaryColorModels: ["4_Dutch_Shed_Door"]
            },
            "4' shed door": {
                models: ["4_Door_Frame", "4_Door_Parts"],
                secondaryColorModels: ["4_Door_Frame"]
            },
            "4' shed door (w-transom)": {
                models: ["4_Shed_Door(w-transom)", "4_Shed_Door(w-transom)_Glass", "4_Shed_Door(w-transom)_Grid", "4_Shed_Door(w-transom)_Parts"],
                secondaryColorModels: ["4_Shed_Door(w-transom)"]
            },
            "double dutch shed door": {
                models: ["Double_Dutch_Shed_Door", "Double_Dutch_Shed_Door_Parts"],
                secondaryColorModels: ["Double_Dutch_Shed_Door"]
            },
            "double shed door": {
                models: ["Double_Shed_Door", "Double_Shed_Door_Parts"],
                secondaryColorModels: ["Double_Shed_Door"]
            },
            "double shed door (w-transom)": {
                models: ["Double_Shed_Doors(w-transom)", "Double_Shed_Doors(w-transom)_Glass", "Double_Shed_Doors(w-transom)_Grid", "Double_Shed_Doors(w-transom)_Parts"],
                secondaryColorModels: ["Double_Shed_Doors(w-transom)"]
            },
            "econ door": {
                models: ["Econ_Door", "Econ_Door_Parts"],
                secondaryColorModels: ["Econ_Door"]
            },
            "5'x6' double wood door": {
                models: ["5x6_Double_Wood_Door_Frame", "5x6_Double_Wood_Door_Parts"],
                secondaryColorModels: ["5x6_Double_Wood_Door_Frame"]
            },
            "5'x7' double wood door": {
                models: ["5x7_Double_Wood_Door_Frame", "5x7_Double_Wood_Door_Parts"],
                secondaryColorModels: ["5x7_Double_Wood_Door_Frame"]
            },
            "6'x6' double wood door": {
                models: ["6x6_Double_Wood_Door_Frame", "6x6_Double_Wood_Door_Parts"],
                secondaryColorModels: ["6x6_Double_Wood_Door_Frame"]
            },
            "6'x7' double wood door": {
                models: ["6x7_Double_Wood_Door_Frame", "6x7_Double_Wood_Door_Parts"],
                secondaryColorModels: ["6x7_Double_Wood_Door_Frame"]
            },
            "7'x6' double wood door": {
                models: ["7x6_Double_Wood_Door_Frame", "7x6_Double_Wood_Door_Parts"],
                secondaryColorModels: ["7x6_Double_Wood_Door_Frame"]
            },
            "7'x7' double wood door": {
                models: ["7x7_Double_Wood_Door_Frame", "7x7_Double_Wood_Door_Parts"],
                secondaryColorModels: ["7x7_Double_Wood_Door_Frame"]
            },
            "8'x6' double wood door": {
                models: ['8x6_Double_Wood_Door_Frame', '8x6_Double_Wood_Door_Parts'],
                secondaryColorModels: ["8x6_Double_Wood_Door_Frame"]
            },
            "8'x7' double wood door": {
                models: ["8x7_Double_Wood_Door_Frame", "8x7_Double_Wood_Door_Parts"],
                secondaryColorModels: ["8x7_Double_Wood_Door_Frame"]
            },
            "9'x6' double wood door": {
                models: ["9x6_Double_Wood_Door_Frame", "9x6_Double_Wood_Door_Parts"],
                secondaryColorModels: ["9x6_Double_Wood_Door_Frame"]
            },
            'single wood door 36"x72"': {
                models: ["Single_Wood_Door_36x72", "Single_Wood_Door_36x72_Parts"],
                secondaryColorModels: ["Single_Wood_Door_36x72"]
            },
            'single wood door 42"x72"': {
                models: ["Single_Wood_Door_42x72", "Single_Wood_Door_42x72_Parts"],
                secondaryColorModels: ["Single_Wood_Door_42x72"]
            },
            '42 single wood door (arch-top-trim)': {
                models: ["42_Single_Wood_Door(arch-top-trim)", "42_Single_Wood_Door(arch-top-trim)_Handle_and_Loops"],
                secondaryColorModels: ["42_Single_Wood_Door(arch-top-trim)"]
            },
        };

        addDoorVariations(doorTypes);

        const doorOrientations = {
            "3' shed door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "3' shed door (w-transom)": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "4' dutch shed door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "4' shed door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "4' shed door (w-transom)": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "double dutch shed door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "double shed door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "double shed door (w-transom)": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "econ door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "3' shed door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "3' shed door (w-transom) lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "4' dutch shed door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "4' shed door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "4' shed door (w-transom) lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "double dutch shed door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "double shed door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "double shed door (w-transom) lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "econ door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "3' shed door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "3' shed door (w-transom) rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "4' dutch shed door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "4' shed door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "4' shed door (w-transom) rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "double dutch shed door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "double shed door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "double shed door (w-transom) rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "econ door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "5'x6' double wood door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "5'x7' double wood door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "6'x6' double wood door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "6'x7' double wood door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "7'x6' double wood door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "7'x7' double wood door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "8'x6' double wood door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "8'x7' double wood door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "9'x6' double wood door": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            'single wood door 36"x72"': Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            'single wood door 42"x72"': Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            '42 single wood door (arch-top-trim)': Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "5'x6' double wood door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "5'x7' double wood door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "6'x6' double wood door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "6'x7' double wood door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "7'x6' double wood door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "7'x7' double wood door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "8'x6' double wood door lh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "8'x7' double wood door lh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "9'x6' double wood door lh": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            'single wood door 36"x72" lh': Door.ORIENTATION_LEFT | Door.SWING_OUT,
            'single wood door 42"x72" lh': Door.ORIENTATION_LEFT | Door.SWING_OUT,
            '42 single wood door (arch-top-trim) lh': Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "5'x6' double wood door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "5'x7' double wood door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "6'x6' double wood door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "6'x7' double wood door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "7'x6' double wood door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "7'x7' double wood door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "8'x6' double wood door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "8'x7' double wood door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            "9'x6' double wood door rh": Door.ORIENTATION_RIGHT | Door.SWING_OUT,
            'single wood door 36"x72" rh': Door.ORIENTATION_LEFT | Door.SWING_OUT,
            'single wood door 42"x72" rh': Door.ORIENTATION_LEFT | Door.SWING_OUT,
            '42 single wood door (arch-top-trim) rh': Door.ORIENTATION_RIGHT | Door.SWING_OUT,
        };

        let planBoxes = {
            "3' shed door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, 0), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(6), 10)),
            "3' shed door (w-transom)": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, 0), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(6), 10)),
            "4' dutch shed door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2), 0, 0), new THREE.Vector3(tools.ft2cm(2), tools.ft2cm(6), 10)),
            "4' shed door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2), 0, 0), new THREE.Vector3(tools.ft2cm(2), tools.ft2cm(6), 10)),
            "4' shed door (w-transom)": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2), 0, 0), new THREE.Vector3(tools.ft2cm(2), tools.ft2cm(6), 10)),
            "double dutch shed door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, 0), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(6), 10)),
            "double shed door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, 0), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(6), 10)),
            "double shed door (w-transom)": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, 0), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(6), 10)),
            "econ door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, 0), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(6), 10)),
            "5'x6' double wood door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2.5), 0, 0), new THREE.Vector3(tools.ft2cm(2.5), tools.ft2cm(6), 10)),
            "5'x7' double wood door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2.5), 0, 0), new THREE.Vector3(tools.ft2cm(2.5), tools.ft2cm(7), 10)),
            "6'x6' double wood door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, 0), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(6), 10)),
            "6'x7' double wood door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, 0), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(7), 10)),
            "7'x6' double wood door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3.5), 0, 0), new THREE.Vector3(tools.ft2cm(3.5), tools.ft2cm(6), 10)),
            "7'x7' double wood door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3.5), 0, 0), new THREE.Vector3(tools.ft2cm(3.5), tools.ft2cm(7), 10)),
            "8'x6' double wood door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, 0), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(6), 10)),
            "8'x7' double wood door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, 0), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(7), 10)),
            "9'x6' double wood door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, 0), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(6), 10)),
            'single wood door 36"x72"': new THREE.Box3(new THREE.Vector3(-tools.in2cm(18), 0, 0), new THREE.Vector3(tools.in2cm(18), tools.in2cm(72), 10)),
            'single wood door 42"x72"': new THREE.Box3(new THREE.Vector3(-tools.in2cm(21), 0, 0), new THREE.Vector3(tools.in2cm(21), tools.in2cm(72), 10)),
            '42 single wood door (arch-top-trim)': new THREE.Box3(new THREE.Vector3(-tools.in2cm(21), 0, 0), new THREE.Vector3(tools.in2cm(21), tools.in2cm(72), 10))
        };

        addDoorVariations(planBoxes);

        let bboxes = {};
        _.forOwn(planBoxes, (value, key)=> {
            bboxes[key] = value.clone();
            bboxes[key].min.x -= tools.ft2cm(0.35);
            bboxes[key].max.x += tools.ft2cm(0.35);
        });

        let whiteMaterial = new THREE.MeshPhongMaterial();

        let materialMap = {
            "3_Door_Frame": secondaryMaterial,
            "3_Door_Parts": partsMaterial,
            "3_Shed_Door(w-transom)": secondaryMaterial,
            "3_Shed_Door(w-transom)_Glass": glassMaterial,
            "3_Shed_Door(w-transom)_Grid": whiteMaterial,
            "3_Shed_Door(w-transom)_Parts": partsMaterial,
            "4_Dutch_Shed_Door": secondaryMaterial,
            "4_Dutch_Shed_Door_Parts": partsMaterial,
            "4_Door_Frame": secondaryMaterial,
            "4_Door_Parts": partsMaterial,
            "4_Shed_Door(w-transom)": secondaryMaterial,
            "4_Shed_Door(w-transom)_Glass": glassMaterial,
            "4_Shed_Door(w-transom)_Grid": whiteMaterial,
            "4_Shed_Door(w-transom)_Parts": partsMaterial,
            "Double_Dutch_Shed_Door": secondaryMaterial,
            "Double_Dutch_Shed_Door_Parts": partsMaterial,
            "Double_Shed_Door": secondaryMaterial,
            "Double_Shed_Door_Parts": partsMaterial,
            "Double_Shed_Doors(w-transom)": secondaryMaterial,
            "Double_Shed_Doors(w-transom)_Glass": glassMaterial,
            "Double_Shed_Doors(w-transom)_Grid": whiteMaterial,
            "Double_Shed_Doors(w-transom)_Parts": partsMaterial,
            "Econ_Door": secondaryMaterial,
            "Econ_Door_Parts": partsMaterial,
            "5x6_Double_Wood_Door_Frame": secondaryMaterial,
            "5x6_Double_Wood_Door_Parts": partsMaterial,
            "5x7_Double_Wood_Door_Frame": secondaryMaterial,
            "5x7_Double_Wood_Door_Parts": partsMaterial,
            "6x6_Double_Wood_Door_Frame": secondaryMaterial,
            "6x6_Double_Wood_Door_Parts": partsMaterial,
            "6x7_Double_Wood_Door_Frame": secondaryMaterial,
            "6x7_Double_Wood_Door_Parts": partsMaterial,
            "7x6_Double_Wood_Door_Frame": secondaryMaterial,
            "7x6_Double_Wood_Door_Parts": partsMaterial,
            "7x7_Double_Wood_Door_Frame": secondaryMaterial,
            "7x7_Double_Wood_Door_Parts": partsMaterial,
            "8x6_Double_Wood_Door_Frame": secondaryMaterial,
            "8x6_Double_Wood_Door_Parts": partsMaterial,
            "8x7_Double_Wood_Door_Frame": secondaryMaterial,
            "8x7_Double_Wood_Door_Parts": partsMaterial,
            "9x6_Double_Wood_Door_Frame": secondaryMaterial,
            "9x6_Double_Wood_Door_Parts": partsMaterial,
            "Single_Wood_Door_36x72": secondaryMaterial,
            "Single_Wood_Door_36x72_Parts": partsMaterial,
            "Single_Wood_Door_42x72": secondaryMaterial,
            "Single_Wood_Door_42x72_Parts": partsMaterial,
            "42_Single_Wood_Door(arch-top-trim)": secondaryMaterial,
            "42_Single_Wood_Door(arch-top-trim)_Handle_and_Loops": partsMaterial
        };

        addDoorVariations(materialMap);

        if (!doorTypes[type]) {
            throw(new Error("There is no model find - " + type));
        }

        let orientation_ = doorOrientations[type];

        let planModel = generatePlanModel();
        let reversedPlanModel = generatePlanModel(true);
        super({
            models: doorTypes[type].models,
            secondaryColorModels: doorTypes[type].secondaryColorModels,
            materialMap: materialMap,
            planModel,
            reversedPlanModel
        });
        let self = this;

        let parentReverse = this.reverse;
        this.reverse = ()=> {
            parentReverse(partsMaterial);
            orientation_ = orientation_ ^ (Door.ORIENTATION_LEFT | Door.ORIENTATION_RIGHT);
        };

        self.loadPromise.then(()=> {
            if (orientation_ & Door.ORIENTATION_RIGHT) {
                parentReverse(partsMaterial);
            }
        });

        Object.defineProperties(this, {
            planBox: {
                get: ()=> {
                    return planBoxes[type]
                }
            },
            type: {
                get: ()=> {
                    return type;
                }
            },
            orientation: {
                get: ()=> {
                    return orientation_;
                }
            },
            boundingBox: {
                get: ()=> {
                    let boxClone;
                    boxClone = bboxes[type].clone();


                    let angle = tools.getAngleByRotation(self.rotation);
                    if (Math.abs(angle).toFixed(2) == (Math.PI * 0.5).toFixed(2)) {
                        boxClone.max = {x: boxClone.max.z, y: boxClone.max.y, z: boxClone.max.x};
                        boxClone.min = {x: boxClone.min.z, y: boxClone.min.y, z: boxClone.min.x};
                    }

                    return boxClone;
                }
            }
        });

        /**
         * Adds LH and RH keys to the map
         * @param map Map with Door IDs
         */
        function addDoorVariations(map) {
            _.forOwn(map, (value, key)=> {
                map[key + " lh"] = value;
                map[key + " rh"] = value;
            });
        }

        /**
         * Generates plan model of the current door
         */
        function generatePlanModel(reversed = false) {
            let orientation = orientation_;
            if (reversed) {
                orientation = orientation ^ (Door.ORIENTATION_LEFT | Door.ORIENTATION_RIGHT)
            }

            let bbox = planBoxes[type];
            let width = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z);

            let isRollUp = type.indexOf("roll") >= 0;
            let isDouble = !isRollUp && width >= tools.ft2cm(6);

            let doorDrawing = new THREE.Object3D();

            let whiteBG = new THREE.Mesh(new THREE.PlaneGeometry(width, width * (isDouble ? 0.5 : 1) + THICKNESS), new THREE.MeshPhongMaterial({color: 0xffffff}));
            whiteBG.rotateX(-Math.PI * 0.5);
            whiteBG.position.y = 0;
            whiteBG.position.z = (width * (isDouble ? 0.5 : 1) + THICKNESS) * 0.5;
            doorDrawing.add(whiteBG);

            let whiteLine = new THREE.Mesh(new THREE.PlaneGeometry(width, THICKNESS), new THREE.MeshPhongMaterial({color: 0xffffff}));
            whiteLine.rotateX(-Math.PI * 0.5);
            whiteLine.position.y = 25;
            whiteLine.position.z = -THICKNESS * 0.5;
            doorDrawing.add(whiteLine);

            if (isRollUp) {
                let rectangle = tools.getRectangle(new THREE.Box3(new THREE.Vector3(-width * 0.5, 0, THICKNESS * 0.5), new THREE.Vector3(width * 0.5, 10, 0)), 0x555555);
                rectangle.position.z = -THICKNESS * 0.9;
                rectangle.position.y = 25;
                doorDrawing.add(rectangle);
            } else {
                let line1 = new THREE.Mesh(new THREE.PlaneGeometry(width * (isDouble ? 0.5 : 1), 5), new THREE.MeshPhongMaterial({color: 0x333333}));
                line1.rotateZ(Math.PI * 0.5);
                line1.rotateY(Math.PI * 0.5);
                line1.position.z = (orientation & Door.SWING_OUT) ?
                    (width * (isDouble ? 0.25 : 0.5)) :
                    (-THICKNESS - width * (isDouble ? 0.25 : 0.5));

                line1.position.x = (orientation & Door.ORIENTATION_LEFT ? 1 : -1) * width * 0.5;

                if (orientation & Door.SWING_IN) {
                    line1.position.x *= -1;
                }

                line1.position.y = 0;
                doorDrawing.add(line1);

                if (isDouble) {
                    let line2 = line1.clone();
                    let k = 1;
                    if (orientation & Door.ORIENTATION_LEFT) {
                        k *= -1
                    }
                    if (orientation & Door.SWING_IN) {
                        k *= -1;
                    }
                    line2.position.x = k * width * 0.5;
                    doorDrawing.add(line2);
                }

                let gridEdge = tools.getLine(width, 0x98e3f8);
                gridEdge.position.z = -THICKNESS;
                gridEdge.position.y = 21;
                doorDrawing.add(gridEdge);

                let curve1 = tools.getCurve(width * (isDouble ? 0.5 : 1), 0x555555);
                curve1.position.x = -width * 0.5;
                doorDrawing.add(curve1);

                if (orientation & Door.ORIENTATION_LEFT) {
                    curve1.scale.x = -1;
                    curve1.position.x *= -1;
                }

                if (orientation & Door.SWING_IN) {
                    curve1.position.z = -THICKNESS;
                    curve1.scale.y = -1;
                    curve1.scale.x *= -1;
                    curve1.position.x *= -1;
                }

                if (isDouble) {
                    let curve2 = curve1.clone();
                    curve2.scale.x = -curve1.scale.x;
                    let k = 1;
                    if (orientation & Door.ORIENTATION_LEFT) {
                        k *= -1
                    }
                    if (orientation & Door.SWING_IN) {
                        k *= -1;
                    }
                    curve2.position.x = k * width * 0.5;
                    doorDrawing.add(curve2);
                }
            }

            return doorDrawing;
        }
    }
}

Door.ORIENTATION_LEFT = 1;
Door.ORIENTATION_RIGHT = 2;
Door.SWING_OUT = 4;
Door.SWING_IN = 8;


module.exports = Door;
