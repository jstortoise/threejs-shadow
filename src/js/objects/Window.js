const THREE = require('three');
const Plan = require('./../helpers/Plan');
const DraggableObject = require('./DraggableObject');
const tools = require('./../helpers/tools');
const _ = require('lodash');

/**
 * Window 3D object. Similar to Door
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Window extends DraggableObject {
    /**
     * Creates window object
     * @param environmentCamera CubeCamera, to make reflections
     */
    constructor(type, environmentCamera, shedHeight) {

        let angle_ = 0;
        const THICKNESS = tools.in2cm(3.5);

        const neverHasShutters = {
            "1'x1' loft window": true,
            "29 transom window": true,
            "60 transom window": true,
            "1'x1' loft gable window": true,
            "29 transom gable window": true,
            "60 transom gable window": true,
            "23'x10' transom window with grids": true,
            "29'x10' transom window with grids": true,
            "60'x10' transom window with grids": true,
            "72'x10' transom window with grids": true
        };
        const neverHasFlowerBox = {
            "1'x1' loft window": true,
            "29 transom window": true,
            "60 transom window": true,
            "1'x1' loft gable window": true,
            "29 transom gable window": true,
            "60 transom gable window": true,
            "23'x10' transom window with grids": true,
            "29'x10' transom window with grids": true,
            "60'x10' transom window with grids": true,
            "72'x10' transom window with grids": true
        };

        let shutterMaterial = new THREE.MeshPhongMaterial({visible: false});
        let flowerBoxMaterial = new THREE.MeshPhongMaterial({visible: false});

        let secondaryMaterial = new THREE.MeshPhongMaterial({bumpScale: tools.bumpScale});
        let glassMaterial = new THREE.MeshPhongMaterial({
            envMap: environmentCamera.renderTarget.texture,
            color: 0x777777
        });

        //here are options for all doors and windows
        const windowTypes = {
            "1'x1' loft window": {
                models: ["1x1_Loft_Window_Frame", "1x1_Loft_Window_Glass", "1x1_Loft_Window_Grid"],
                secondaryColorModels: ["1x1_Loft_Window_Frame"]
            },
            "2'x3' single pane window": {
                models: ["2x3_Single_Pane_Window_Frame", "2x3_Single_Pane_Window_Glass", "2x3_Single_Pane_Window_Grid", "Shutter_For_2x3_Window", "Flower_Box_For_2x3_Window"],
                secondaryColorModels: ["2x3_Single_Pane_Window_Frame", "Shutter_For_2x3_Window", "Flower_Box_For_2x3_Window"]
            },
            "3'x3' single pane window": {
                models: ["3x3_Single_Pane_Window_Frame", "3x3_Single_Pane_Window_Glass", "3x3_Single_Pane_Window_Grid", "Shutter_For_3x3_Window", "Flower_Box_For_3x3_Window"],
                secondaryColorModels: ["3x3_Single_Pane_Window_Frame", "Shutter_For_3x3_Window", "Flower_Box_For_3x3_Window"]
            },
            "29 transom window": {
                models: ["29_Transom_Window_Frame", "29_Transom_Window_Glass", "29_Transom_Window_Grid"],
                secondaryColorModels: ["29_Transom_Window_Frame"]
            },
            "60 transom window": {
                models: ["60_Transom_Window_Frame", "60_Transom_Window_Glass", "60_Transom_Window_Grid"],
                secondaryColorModels: ["60_Transom_Window_Frame"]
            },
            "1'x1' loft gable window": {
                models: ["1x1_Loft_Gable_Window_Frame", "1x1_Loft_Gable_Window_Glass", "1x1_Loft_Gable_Window_Grid"],
                secondaryColorModels: ["1x1_Loft_Gable_Window_Frame"]
            },
            "29 transom gable window": {
                models: ["29_Transom_Gable_Window_Frame", "29_Transom_Gable_Window_Glass", "29_Transom_Gable_Window_Grid"],
                secondaryColorModels: ["29_Transom_Gable_Window_Frame"]
            },
            "60 transom gable window": {
                models: ["60_Transom_Gable_Window_Frame", "60_Transom_Gable_Window_Glass", "60_Transom_Gable_Window_Grid"],
                secondaryColorModels: ["60_Transom_Gable_Window_Frame"]
            },
            "14'x21' aluminum single pane window": {
                models: ["14x21_Aluminum_Single_Pane_Window_Frame", "14x21_Aluminum_Single_Pane_Window_Glass", "14x21_Aluminum_Single_Pane_Window_Grid", "Shutter_For_14x21_Window", "Flower_Box_For_14_Wide_Window"],
                secondaryColorModels: ["14x21_Aluminum_Single_Pane_Window_Frame", "Shutter_For_14x21_Window", "Flower_Box_For_14_Wide_Window"]
            },
            "18'x27' aluminum single pane window": {
                models: ["18x27_Aluminum_Single_Pane_Window_Frame", "18x27_Aluminum_Single_Pane_Window_Glass", "18x27_Aluminum_Single_Pane_Window_Grid", "Shutter_For_18x27_Window", "Flower_Box_For_18_Wide_Window"],
                secondaryColorModels: ["18x27_Aluminum_Single_Pane_Window_Frame", "Shutter_For_18x27_Window", "Flower_Box_For_18_Wide_Window"]
            },
            "18'x36' aluminum single pane window": {
                models: ["18x36_Aluminum_Single_Pane_Window_Frame", "18x36_Aluminum_Single_Pane_Window_Glass", "18x36_Aluminum_Single_Pane_Window_Grid", "Shutter_For_18x36_Window", "Flower_Box_For_18_Wide_Window"],
                secondaryColorModels: ["18x36_Aluminum_Single_Pane_Window_Frame", "Shutter_For_18x36_Window", "Flower_Box_For_18_Wide_Window"]
            },
            "23'x10' transom window with grids": {
                models: ["23x10_Transom_Window_with_Grids_Frame", "23x10_Transom_Window_with_Grids_Glass", "23x10_Transom_Window_with_Grids"],
                secondaryColorModels: ["23x10_Transom_Window_with_Grids_Frame"]
            },
            "24'x24' vinyl double pane window (without-grids)": {
                models: ["24x24_Vinyl_Double_Pane_Window(without-grids)", "24x24_Vinyl_Double_Pane_Window(without-grids)_Frame", "24x24_Vinyl_Double_Pane_Window(without-grids)_Glass", "Shutter_For_24x24_Window", "Flower_Box_For_24_Wide_Window"],
                secondaryColorModels: ["24x24_Vinyl_Double_Pane_Window(without-grids)_Frame", "Shutter_For_24x24_Window", "Flower_Box_For_24_Wide_Window"]
            },
            "24'x24' vinyl double pane window with grids": {
                models: ["24x24_Vinyl_Double_Pane_Window_with_Grids_Frame", "24x24_Vinyl_Double_Pane_Window_with_Grids_Glass", "24x24_Vinyl_Double_Pane_Window_with_Grids", "Shutter_For_24x24_Window", "Flower_Box_For_24_Wide_Window"],
                secondaryColorModels: ["24x24_Vinyl_Double_Pane_Window_with_Grids_Frame", "Shutter_For_24x24_Window", "Flower_Box_For_24_Wide_Window"]
            },
            "24'x27' aluminum single pane window": {
                models: ["24x27_Aluminum_Single_Pane_Window_Frame", "24x27_Aluminum_Single_Pane_Window_Glass", "24x27_Aluminum_Single_Pane_Window_Grid", "Shutter_For_24x27_Window", "Flower_Box_For_24_Wide_Window"],
                secondaryColorModels: ["24x27_Aluminum_Single_Pane_Window_Frame", "Shutter_For_24x27_Window", "Flower_Box_For_24_Wide_Window"]
            },
            "24'x36' aluminum single pane window": {
                models: ["24x36_Aluminum_Single_Pane_Window_Frame", "24x36_Aluminum_Single_Pane_Window_Glass", "24x36_Aluminum_Single_Pane_Window_Grid", "Shutter_For_24x36_Window", "Flower_Box_For_24_Wide_Window"],
                secondaryColorModels: ["24x36_Aluminum_Single_Pane_Window_Frame", "Shutter_For_24x36_Window", "Flower_Box_For_24_Wide_Window"]
            },
            "24'x36' vinyl double pane window (without-grids)": {
                models: ["24x36_Vinyl_Double_Pane_Window(without-grids)", "24x36_Vinyl_Double_Pane_Window(without-grids)_Frame", "24x36_Vinyl_Double_Pane_Window(without-grids)_Glass", "Shutter_For_24x36_Window", "Flower_Box_For_24_Wide_Window"],
                secondaryColorModels: ["24x36_Vinyl_Double_Pane_Window(without-grids)_Frame", "Shutter_For_24x36_Window", "Flower_Box_For_24_Wide_Window"]
            },
            "24'x36' vinyl double pane window with grids": {
                models: ["24x36_Vinyl_Double_Pane_Window_with_Grids_Frame", "24x36_Vinyl_Double_Pane_Window_with_Grids_Glass", "24x36_Vinyl_Double_Pane_Window_with_Grids", "Shutter_For_24x36_Window", "Flower_Box_For_24_Wide_Window"],
                secondaryColorModels: ["24x36_Vinyl_Double_Pane_Window_with_Grids_Frame", "Shutter_For_24x36_Window", "Flower_Box_For_24_Wide_Window"]
            },
            "29'x10' transom window with grids": {
                models: ["29x10_Transom_Window_with_Grids_Frame", "29x10_Transom_Window_with_Grids_Glass", "29x10_Transom_Window_with_Grids"],
                secondaryColorModels: ["29x10_Transom_Window_with_Grids_Frame"]
            },
            "30'x40' vinyl double pane window (without-grids)": {
                models: ["30x40_Vinyl_Double_Pane_Window(without-grids)", "30x40_Vinyl_Double_Pane_Window(without-grids)_Frame", "30x40_Vinyl_Double_Pane_Window(without-grids)_Glass", "Shutter_For_30x40_Window", "Flower_Box_For_30_Wide_Window"],
                secondaryColorModels: ["30x40_Vinyl_Double_Pane_Window(without-grids)_Frame", "Shutter_For_30x40_Window", "Flower_Box_For_30_Wide_Window"]
            },
            "30'x40' vinyl double pane window with grids": {
                models: ["30x40_Vinyl_Double_Pane_Window_with_Grids_Frame", "30x40_Vinyl_Double_Pane_Window_with_Grids_Glass", "30x40_Vinyl_Double_Pane_Window_with_Grids", "Shutter_For_30x40_Window", "Flower_Box_For_30_Wide_Window"],
                secondaryColorModels: ["30x40_Vinyl_Double_Pane_Window_with_Grids_Frame", "Shutter_For_30x40_Window", "Flower_Box_For_30_Wide_Window"]
            },
            "36'x48' vinyl double pane window (without-grids)": {
                models: ["36x48_Vinyl_Double_Pane_Window(without-grids)", "36x48_Vinyl_Double_Pane_Window(without-grids)_Frame", "36x48_Vinyl_Double_Pane_Window(without-grids)_Glass", "Shutter_For_36x48_Window", "Flower_Box_For_36_Wide_Window"],
                secondaryColorModels: ["36x48_Vinyl_Double_Pane_Window(without-grids)_Frame", "Shutter_For_36x48_Window", "Flower_Box_For_36_Wide_Window"]
            },
            "36'x48' vinyl double pane window with grids": {
                models: ["36x48_Vinyl_Double_Pane_Window_with_Grids_Frame", "36x48_Vinyl_Double_Pane_Window_with_Grids_Glass", "36x48_Vinyl_Double_Pane_Window_with_Grids", "Shutter_For_36x48_Window", "Flower_Box_For_36_Wide_Window"],
                secondaryColorModels: ["36x48_Vinyl_Double_Pane_Window_with_Grids_Frame", "Shutter_For_36x48_Window", "Flower_Box_For_36_Wide_Window"]
            },
            "60'x10' transom window with grids": {
                models: ["60x10_Transom_Window_with_Grids_Frame", "60x10_Transom_Window_with_Grids_Glass", "60x10_Transom_Window_with_Grids"],
                secondaryColorModels: ["60x10_Transom_Window_with_Grids_Frame"]
            },
            "72'x10' transom window with grids": {
                models: ["72x10_Transom_Window_with_Grids_Frame", "72x10_Transom_Window_with_Grids_Glass", "72x10_Transom_Window_with_Grids"],
                secondaryColorModels: ["72x10_Transom_Window_with_Grids_Frame"]
            },
        };

        let whiteMaterial = new THREE.MeshPhongMaterial();

        const materialMap = {
            "1x1_Loft_Window_Frame": secondaryMaterial,
            "1x1_Loft_Window_Glass": glassMaterial,
            "1x1_Loft_Window_Grid": whiteMaterial,
            "2x3_Single_Pane_Window_Frame": secondaryMaterial,
            "2x3_Single_Pane_Window_Glass": glassMaterial,
            "2x3_Single_Pane_Window_Grid": whiteMaterial,
            "3x3_Single_Pane_Window_Frame": secondaryMaterial,
            "3x3_Single_Pane_Window_Glass": glassMaterial,
            "3x3_Single_Pane_Window_Grid": whiteMaterial,
            "29_Transom_Window_Frame": secondaryMaterial,
            "29_Transom_Window_Glass": glassMaterial,
            "29_Transom_Window_Grid": whiteMaterial,
            "60_Transom_Window_Frame": secondaryMaterial,
            "60_Transom_Window_Glass": glassMaterial,
            "60_Transom_Window_Grid": whiteMaterial,
            "Shutter_For_2x3_Window": shutterMaterial,
            "Shutter_For_3x3_Window": shutterMaterial,
            "Shutter_For_14x21_Window": shutterMaterial,
            "Shutter_For_18x27_Window": shutterMaterial,
            "Shutter_For_18x36_Window": shutterMaterial,
            "Shutter_For_24x24_Window": shutterMaterial,
            "Shutter_For_24x27_Window": shutterMaterial,
            "Shutter_For_24x36_Window": shutterMaterial,
            "Shutter_For_30x40_Window": shutterMaterial,
            "Shutter_For_36x48_Window": shutterMaterial,
            "Flower_Box_For_2x3_Window": flowerBoxMaterial,
            "Flower_Box_For_3x3_Window": flowerBoxMaterial,
            "Flower_Box_For_14_Wide_Window": flowerBoxMaterial,
            "Flower_Box_For_18_Wide_Window": flowerBoxMaterial,
            "Flower_Box_For_24_Wide_Window": flowerBoxMaterial,
            "Flower_Box_For_30_Wide_Window": flowerBoxMaterial,
            "Flower_Box_For_36_Wide_Window": flowerBoxMaterial,
            "1x1_Loft_Gable_Window_Frame": secondaryMaterial,
            "1x1_Loft_Gable_Window_Glass": glassMaterial,
            "1x1_Loft_Gable_Window_Grid": whiteMaterial,
            "29_Transom_Gable_Window_Frame": secondaryMaterial,
            "29_Transom_Gable_Window_Glass": glassMaterial,
            "29_Transom_Gable_Window_Grid": whiteMaterial,
            "60_Transom_Gable_Window_Frame": secondaryMaterial,
            "60_Transom_Gable_Window_Glass": glassMaterial,
            "60_Transom_Gable_Window_Grid": whiteMaterial,
            "14x21_Aluminum_Single_Pane_Window_Frame": secondaryMaterial,
            "14x21_Aluminum_Single_Pane_Window_Glass": glassMaterial,
            "14x21_Aluminum_Single_Pane_Window_Grid": whiteMaterial,
            "18x27_Aluminum_Single_Pane_Window_Frame": secondaryMaterial,
            "18x27_Aluminum_Single_Pane_Window_Glass": glassMaterial,
            "18x27_Aluminum_Single_Pane_Window_Grid": whiteMaterial,
            "18x36_Aluminum_Single_Pane_Window_Frame": secondaryMaterial,
            "18x36_Aluminum_Single_Pane_Window_Glass": glassMaterial,
            "18x36_Aluminum_Single_Pane_Window_Grid": whiteMaterial,
            "23x10_Transom_Window_with_Grids_Frame": secondaryMaterial,
            "23x10_Transom_Window_with_Grids_Glass": glassMaterial,
            "23x10_Transom_Window_with_Grids": whiteMaterial,
            "24x24_Vinyl_Double_Pane_Window(without-grids)": whiteMaterial,
            "24x24_Vinyl_Double_Pane_Window(without-grids)_Frame": secondaryMaterial,
            "24x24_Vinyl_Double_Pane_Window(without-grids)_Glass": glassMaterial,
            "24x24_Vinyl_Double_Pane_Window_with_Grids_Frame": secondaryMaterial,
            "24x24_Vinyl_Double_Pane_Window_with_Grids_Glass": glassMaterial,
            "24x24_Vinyl_Double_Pane_Window_with_Grids": whiteMaterial,
            "24x27_Aluminum_Single_Pane_Window_Frame": secondaryMaterial,
            "24x27_Aluminum_Single_Pane_Window_Glass": glassMaterial,
            "24x27_Aluminum_Single_Pane_Window_Grid": whiteMaterial,
            "24x36_Aluminum_Single_Pane_Window_Frame": secondaryMaterial,
            "24x36_Aluminum_Single_Pane_Window_Glass": glassMaterial,
            "24x36_Aluminum_Single_Pane_Window_Grid": whiteMaterial,
            "24x36_Vinyl_Double_Pane_Window(without-grids)": whiteMaterial,
            "24x36_Vinyl_Double_Pane_Window(without-grids)_Frame": secondaryMaterial,
            "24x36_Vinyl_Double_Pane_Window(without-grids)_Glass": glassMaterial,
            "24x36_Vinyl_Double_Pane_Window_with_Grids_Frame": secondaryMaterial,
            "24x36_Vinyl_Double_Pane_Window_with_Grids_Glass": glassMaterial,
            "24x36_Vinyl_Double_Pane_Window_with_Grids": whiteMaterial,
            "29x10_Transom_Window_with_Grids_Frame": secondaryMaterial,
            "29x10_Transom_Window_with_Grids_Glass": glassMaterial,
            "29x10_Transom_Window_with_Grids": whiteMaterial,
            "30x40_Vinyl_Double_Pane_Window(without-grids)": whiteMaterial,
            "30x40_Vinyl_Double_Pane_Window(without-grids)_Frame": secondaryMaterial,
            "30x40_Vinyl_Double_Pane_Window(without-grids)_Glass": glassMaterial,
            "30x40_Vinyl_Double_Pane_Window_with_Grids_Frame": secondaryMaterial,
            "30x40_Vinyl_Double_Pane_Window_with_Grids_Glass": glassMaterial,
            "30x40_Vinyl_Double_Pane_Window_with_Grids": whiteMaterial,
            "36x48_Vinyl_Double_Pane_Window(without-grids)": whiteMaterial,
            "36x48_Vinyl_Double_Pane_Window(without-grids)_Frame": secondaryMaterial,
            "36x48_Vinyl_Double_Pane_Window(without-grids)_Glass": glassMaterial,
            "36x48_Vinyl_Double_Pane_Window_with_Grids_Frame": secondaryMaterial,
            "36x48_Vinyl_Double_Pane_Window_with_Grids_Glass": glassMaterial,
            "36x48_Vinyl_Double_Pane_Window_with_Grids": whiteMaterial,
            "60x10_Transom_Window_with_Grids_Frame": secondaryMaterial,
            "60x10_Transom_Window_with_Grids_Glass": glassMaterial,
            "60x10_Transom_Window_with_Grids": whiteMaterial,
            "72x10_Transom_Window_with_Grids_Frame": secondaryMaterial,
            "72x10_Transom_Window_with_Grids_Glass": glassMaterial,
            "72x10_Transom_Window_with_Grids": whiteMaterial,
        };

        const bboxes = {
            "1'x1' loft window": {simple: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(0.75), 0, 0), new THREE.Vector3(tools.ft2cm(0.75), 100, 10))},
            "2'x3' single pane window": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, 0), new THREE.Vector3(tools.ft2cm(1.5), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2), 0, 0), new THREE.Vector3(tools.ft2cm(2), 100, 10))
            },
            "3'x3' single pane window": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2), 0, 0), new THREE.Vector3(tools.ft2cm(2), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2.5), 0, 0), new THREE.Vector3(tools.ft2cm(2.5), 100, 10))
            },
            "29 transom window": {simple: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.75), 0, 0), new THREE.Vector3(tools.ft2cm(1.75), 100, 10))},
            "60 transom window": {simple: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, 0), new THREE.Vector3(tools.ft2cm(3), 100, 10))},
            "1'x1' loft gable window": {simple: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(0.75), 1200, 0), new THREE.Vector3(tools.ft2cm(0.75), 1300, 10))},
            "29 transom gable window": {simple: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.75), 1200, 0), new THREE.Vector3(tools.ft2cm(1.75), 1300, 10))},
            "60 transom gable window": {simple: new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 1200, 0), new THREE.Vector3(tools.ft2cm(3), 1300, 10))},
            "14'x21' aluminum single pane window": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(10), 0, 0), new THREE.Vector3(tools.in2cm(10), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(16), 0, 0), new THREE.Vector3(tools.in2cm(16), 100, 10))
            },
            "18'x27' aluminum single pane window": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(12), 0, 0), new THREE.Vector3(tools.in2cm(12), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(18), 0, 0), new THREE.Vector3(tools.in2cm(18), 100, 10))
            },
            "18'x36' aluminum single pane window": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(12), 0, 0), new THREE.Vector3(tools.in2cm(12), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(18), 0, 0), new THREE.Vector3(tools.in2cm(18), 100, 10))
            },
            "23'x10' transom window with grids": {simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(17.5), 0, 0), new THREE.Vector3(tools.in2cm(17.5), 100, 10))},
            "24'x24' vinyl double pane window (without-grids)": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(15.5), 0, 0), new THREE.Vector3(tools.in2cm(15.5), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(24), 0, 0), new THREE.Vector3(tools.in2cm(24), 100, 10))
            },
            "24'x24' vinyl double pane window with grids": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(15.5), 0, 0), new THREE.Vector3(tools.in2cm(15.5), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(25.5), 0, 0), new THREE.Vector3(tools.in2cm(25.5), 100, 10))
            },
            "24'x27' aluminum single pane window": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(15.5), 0, 0), new THREE.Vector3(tools.in2cm(15.5), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(25.5), 0, 0), new THREE.Vector3(tools.in2cm(25.5), 100, 10))
            },
            "24'x36' aluminum single pane window": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(15.5), 0, 0), new THREE.Vector3(tools.in2cm(15.5), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(25.5), 0, 0), new THREE.Vector3(tools.in2cm(25.5), 100, 10))
            },
            "24'x36' vinyl double pane window (without-grids)": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(15.5), 0, 0), new THREE.Vector3(tools.in2cm(15.5), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(25.5), 0, 0), new THREE.Vector3(tools.in2cm(25.5), 100, 10))
            },
            "24'x36' vinyl double pane window with grids": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(15.5), 0, 0), new THREE.Vector3(tools.in2cm(15.5), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(25.5), 0, 0), new THREE.Vector3(tools.in2cm(25.5), 100, 10))
            },
            "29'x10' transom window with grids": {simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(20.5), 0, 0), new THREE.Vector3(tools.in2cm(20.5), 100, 10))},
            "30'x40' vinyl double pane window (without-grids)": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(18), 0, 0), new THREE.Vector3(tools.in2cm(18), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(31.5), 0, 0), new THREE.Vector3(tools.in2cm(31.5), 100, 10))
            },
            "30'x40' vinyl double pane window with grids": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(18), 0, 0), new THREE.Vector3(tools.in2cm(18), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(31.5), 0, 0), new THREE.Vector3(tools.in2cm(31.5), 100, 10))
            },
            "36'x48' vinyl double pane window (without-grids)": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(21), 0, 0), new THREE.Vector3(tools.in2cm(21), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(39), 0, 0), new THREE.Vector3(tools.in2cm(39), 100, 10))
            },
            "36'x48' vinyl double pane window with grids": {
                simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(21), 0, 0), new THREE.Vector3(tools.in2cm(21), 100, 10)),
                withShutters: new THREE.Box3(new THREE.Vector3(-tools.in2cm(39), 0, 0), new THREE.Vector3(tools.in2cm(39), 100, 10))
            },
            "60'x10' transom window with grids": {simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(36), 0, 0), new THREE.Vector3(tools.in2cm(36), 100, 10))},
            "72'x10' transom window with grids": {simple: new THREE.Box3(new THREE.Vector3(-tools.in2cm(42), 0, 0), new THREE.Vector3(tools.in2cm(42), 100, 10))}
        };

        const planBoxes = {
            "1'x1' loft window": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(0.5), 0, 0), new THREE.Vector3(tools.ft2cm(0.5), 100, 10)),
            "2'x3' single pane window": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1), 0, 0), new THREE.Vector3(tools.ft2cm(1), 120, 10)),
            "3'x3' single pane window": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, 0), new THREE.Vector3(tools.ft2cm(1.5), 120, 10)),
            "29 transom window": new THREE.Box3(new THREE.Vector3(-tools.in2cm(14.5), 0, 0), new THREE.Vector3(tools.in2cm(14.5), 100, 10)),
            "60 transom window": new THREE.Box3(new THREE.Vector3(-tools.in2cm(30), 0, 0), new THREE.Vector3(tools.in2cm(30), 100, 10)),
            "1'x1' loft gable window": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(0.5), 200, 0), new THREE.Vector3(tools.ft2cm(0.5), 300, 10)),
            "29 transom gable window": new THREE.Box3(new THREE.Vector3(-tools.in2cm(14.5), 200, 0), new THREE.Vector3(tools.in2cm(14.5), 300, 10)),
            "60 transom gable window": new THREE.Box3(new THREE.Vector3(-tools.in2cm(30), 200, 0), new THREE.Vector3(tools.in2cm(30), 300, 10)),
            "14'x21' aluminum single pane window": new THREE.Box3(new THREE.Vector3(-tools.in2cm(7), 0, 0), new THREE.Vector3(tools.in2cm(7), 100, 10)),
            "18'x27' aluminum single pane window": new THREE.Box3(new THREE.Vector3(-tools.in2cm(9), 0, 0), new THREE.Vector3(tools.in2cm(9), 100, 10)),
            "18'x36' aluminum single pane window": new THREE.Box3(new THREE.Vector3(-tools.in2cm(9), 0, 0), new THREE.Vector3(tools.in2cm(9), 100, 10)),
            "23'x10' transom window with grids": new THREE.Box3(new THREE.Vector3(-tools.in2cm(11.5), 0, 0), new THREE.Vector3(tools.in2cm(11.5), 100, 10)),
            "24'x24' vinyl double pane window (without-grids)": new THREE.Box3(new THREE.Vector3(-tools.in2cm(12), 0, 0), new THREE.Vector3(tools.in2cm(12), 100, 10)),
            "24'x24' vinyl double pane window with grids": new THREE.Box3(new THREE.Vector3(-tools.in2cm(12), 0, 0), new THREE.Vector3(tools.in2cm(12), 100, 10)),
            "24'x27' aluminum single pane window": new THREE.Box3(new THREE.Vector3(-tools.in2cm(12), 0, 0), new THREE.Vector3(tools.in2cm(12), 100, 10)),
            "24'x36' aluminum single pane window": new THREE.Box3(new THREE.Vector3(-tools.in2cm(12), 0, 0), new THREE.Vector3(tools.in2cm(12), 100, 10)),
            "24'x36' vinyl double pane window (without-grids)": new THREE.Box3(new THREE.Vector3(-tools.in2cm(12), 0, 0), new THREE.Vector3(tools.in2cm(12), 100, 10)),
            "24'x36' vinyl double pane window with grids": new THREE.Box3(new THREE.Vector3(-tools.in2cm(12), 0, 0), new THREE.Vector3(tools.in2cm(12), 100, 10)),
            "29'x10' transom window with grids": new THREE.Box3(new THREE.Vector3(-tools.in2cm(14.5), 0, 0), new THREE.Vector3(tools.in2cm(14.5), 100, 10)),
            "30'x40' vinyl double pane window (without-grids)": new THREE.Box3(new THREE.Vector3(-tools.in2cm(15), 0, 0), new THREE.Vector3(tools.in2cm(15), 100, 10)),
            "30'x40' vinyl double pane window with grids": new THREE.Box3(new THREE.Vector3(-tools.in2cm(15), 0, 0), new THREE.Vector3(tools.in2cm(15), 100, 10)),
            "36'x48' vinyl double pane window (without-grids)": new THREE.Box3(new THREE.Vector3(-tools.in2cm(18), 0, 0), new THREE.Vector3(tools.in2cm(18), 100, 10)),
            "36'x48' vinyl double pane window with grids": new THREE.Box3(new THREE.Vector3(-tools.in2cm(18), 0, 0), new THREE.Vector3(tools.in2cm(18), 100, 10)),
            "60'x10' transom window with grids": new THREE.Box3(new THREE.Vector3(-tools.in2cm(30), 0, 0), new THREE.Vector3(tools.in2cm(30), 100, 10)),
            "72'x10' transom window with grids": new THREE.Box3(new THREE.Vector3(-tools.in2cm(36), 0, 0), new THREE.Vector3(tools.in2cm(36), 100, 10)),
        };

        const limits = {
            "1'x1' loft gable window": 1 / 4,
            "29 transom gable window": 1 / 2.4,
            "60 transom gable window": 1 / 6
        };

        if (!windowTypes[type]) {
            throw(new Error("There is no model found - " + type));
        }

        let planModel = generatePlanModel();
        super({
            models: windowTypes[type].models,
            secondaryColorModels: windowTypes[type].secondaryColorModels,
            materialMap: materialMap,
            planModel,
            callback: ()=> {
                if (type.toLowerCase().indexOf("gable") >= 0) {
                    _.each(this.children, (mesh)=> {
                        mesh.position.setY(shedHeight);
                    });
                }
            }
        });

        let self = this;

        Object.defineProperties(this, {
            planBox: {
                get: ()=> {
                    return planBoxes[type];
                }
            },
            hasShutters: {
                get: ()=> {
                    return shutterMaterial.visible;
                },
                set: (value)=> {
                    shutterMaterial.visible = value;
                    shutterMaterial.needsUpdate = true;
                }
            },
            hasFlowerBox: {
                get: ()=> {
                    return flowerBoxMaterial.visible;
                },
                set: (value)=> {
                    flowerBoxMaterial.visible = value;
                    flowerBoxMaterial.needsUpdate = true;
                }
            },
            boundingBox: {
                get: ()=> {
                    let boxClone;
                    if (shutterMaterial.visible) {
                        boxClone = bboxes[type].withShutters ? bboxes[type].withShutters.clone() : bboxes[type].simple.clone();
                    } else {
                        boxClone = bboxes[type].simple.clone();
                    }


                    let angle = tools.getAngleByRotation(self.rotation);
                    if (Math.abs(angle).toFixed(2) == (Math.PI * 0.5).toFixed(2)) {
                        boxClone.max = {x: boxClone.max.z, y: boxClone.max.y, z: boxClone.max.x};
                        boxClone.min = {x: boxClone.min.z, y: boxClone.min.y, z: boxClone.min.x};
                    }

                    return boxClone;
                }
            },
            type: {
                get: ()=> {
                    return type;
                }
            },
            canHaveShutters: {
                get: ()=> {
                    return !neverHasShutters[type];
                }
            },
            canHaveFlowerBox: {
                get: ()=> {
                    return !neverHasFlowerBox[type];
                }
            },
            limits: {
                get: ()=> {
                    return limits[type];
                }
            },
            rotate: {
                set: (angle)=> {
                    if (type.indexOf('gable') < 0 || angle == Math.PI || angle == 0) {
                        self.rotation.fromArray([0, angle, 0]);
                        angle_ = angle;
                    } else {
                        self.rotation.fromArray([0, 0, 0]);
                        angle_ = 0;
                    }
                },
                get: ()=> {
                    return angle_;
                },
                configurable: true
            }
        });

        /**
         * Generates plan model of the current door
         */
        function generatePlanModel() {
            let windowPlan = new THREE.Object3D();

            let width = planBoxes[type].max.x - planBoxes[type].min.x;
            let plane = new THREE.Mesh(new THREE.PlaneGeometry(width, THICKNESS), new THREE.MeshPhongMaterial());
            let line = tools.getLine(width);
            let rect = tools.getRectangle(new THREE.Box3(new THREE.Vector3(-width * 0.5, 0, -THICKNESS), new THREE.Vector3(width * 0.5, 0, 0)));

            plane.rotateX(-Math.PI * 0.5);
            plane.position.y = 25;
            line.position.y = 26;
            rect.position.y = 26;
            plane.position.z = -THICKNESS * 0.5;
            line.position.z = -THICKNESS * 0.5;

            windowPlan.add(plane);
            windowPlan.add(line);
            windowPlan.add(rect);

            return windowPlan;
        }
    }
}


module
    .exports = Window;
