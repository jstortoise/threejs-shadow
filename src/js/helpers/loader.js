const _ = require('lodash');
const assets = require('./assets');

/**
 * Loads resources and calls loaded() function when all resources are loaded
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Loader {
    /**
     * Creates a loader element
     * @param element DOM element to render the loader to
     * @param features filter of available features. Shed styles and doors/windows objects are here
     */
    constructor(element, features) {
        let total_ = 0;
        let loaded_ = 0;
        let self = this;
        this.loaded = null;
        this.progress = null;

        let html = '\
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 100 100">\
                <path fill-opacity="0" stroke-width="6" stroke="#bbb" d="M50,10L90,40L90,90L10,90L10,40L50,10L90,40"/>\
                <path id="shed-progress-path" fill-opacity="0" stroke-width="6" stroke="#000" d="M50,10L90,40L90,90L10,90L10,40L50,10L90,40"/>\
                <div class="load-progress">0%</div>\
            </svg>';

        element.innerHTML = html;

        let interval = setInterval(()=> {
            if (document.querySelector('#shed-progress-path')) {
                clearInterval(interval);
                init();
            }
        }, 200);

        /**
         * Inits the loader. Keep list of loaded elements up to date
         */
        function init() {

            let loadProgress = document.getElementsByClassName('load-progress')[0];
            let loadableObjects = {
                "3' shed door": {models: ['3_Door_Frame', '3_Door_Parts'], img: []},
                "3' shed door (w-transom)": {
                    models: ['3_Shed_Door(w-transom)', '3_Shed_Door(w-transom)_Glass', '3_Shed_Door(w-transom)_Grid', '3_Shed_Door(w-transom)_Parts'],
                    img: []
                },
                "4' dutch shed door": {models: ['4_Dutch_Shed_Door', '4_Dutch_Shed_Door_Parts'], img: []},
                "4' shed door": {models: ['4_Door_Frame', '4_Door_Parts'], img: []},
                "4' shed door (w-transom)": {
                    models: ['4_Shed_Door(w-transom)', '4_Shed_Door(w-transom)_Glass', '4_Shed_Door(w-transom)_Grid', '4_Shed_Door(w-transom)_Parts'],
                    img: []
                },
                "double dutch shed door": {models: ['Double_Dutch_Shed_Door', 'Double_Dutch_Shed_Door_Parts'], img: []},
                "double shed door": {models: ['Double_Shed_Door', 'Double_Shed_Door_Parts'], img: []},
                "double shed door (w-transom)": {
                    models: ['Double_Shed_Doors(w-transom)', 'Double_Shed_Doors(w-transom)_Glass', 'Double_Shed_Doors(w-transom)_Grid', 'Double_Shed_Doors(w-transom)_Parts'],
                    img: []
                },
                "econ door": {models: ['Econ_Door', 'Econ_Door_Parts'], img: []},
                "15 light french doors": {
                    models: ['15Light_French_Doors', '15Light_French_Doors_Frame', '15Light_French_Doors_Glass', '15Light_French_Doors_Handle', '15Light_French_Doors_Threshold', '15Light_French_Doors_Wall_Part'],
                    img: []
                },
                "steel 9' light walk-in door": {
                    models: ['Steel_9-light_Walk-in_Door', 'Steel_9-light_Walk-in_Door_Frame', 'Steel_9-light_Walk-in_Door_Glass', 'Steel_9-light_Walk-in_Door_Handle', 'Steel_9-light_Walk-in_Door_Threshold', 'Steel_9-light_Walk-in_Door_Wall_Part'],
                    img: []
                },
                "short steel 9' light walk-in door": {
                    models: ['Short_Steel_9-light_Walk-in_Door', 'Short_Steel_9-light_Walk-in_Door_Frame', 'Short_Steel_9-light_Walk-in_Door_Glass', 'Short_Steel_9-light_Walk-in_Door_Handle', 'Short_Steel_9-light_Walk-in_Door_Threshold', 'Short_Steel_9-light_Walk-in_Door_Wall_Part'],
                    img: []
                },
                "steel french doors": {
                    models: ['Steel_French_Doors', 'Steel_French_Doors_Frame', 'Steel_French_Doors_Handle', 'Steel_French_Doors_Threshold', 'Steel_French_Doors_Wall_Part'],
                    img: []
                },
                "steel walk-in door": {
                    models: ['Steel_Walk-in_Door', 'Steel_Walk-in_Door_Frame', 'Steel_Walk-in_Door_Handle', 'Steel_Walk-in_Door_Threshold', 'Steel_Walk-in_Door_Wall_Part'],
                    img: []
                },
                "short steel walk-in door": {
                    models: ['Short_Steel_Walk-in_Door', 'Short_Steel_Walk-in_Door_Frame', 'Short_Steel_Walk-in_Door_Handle', 'Short_Steel_Walk-in_Door_Threshold', 'Short_Steel_Walk-in_Door_Wall_Part'],
                    img: []
                },
                "6'x7' roll up door": {
                    models: ['6x7_Roll_Up_Door', '6x7_Roll_Up_Door_Black_Part', '6x7_Roll_Up_Door_Frame', '6x7_Roll_Up_Door_Handle', '6x7_Roll_Up_Door_Metal_Part', '6x7_Roll_Up_Door_Threshold'],
                    img: []
                },
                "8'x8' roll up door": {
                    models: ['8x8_Roll_Up_Door', '8x8_Roll_Up_Door_Black', '8x8_Roll_Up_Door_Frame', '8x8_Roll_Up_Door_Handle', '8x8_Roll_Up_Door_Metal_Part', '8x8_Roll_Up_Door_Threshold'],
                    img: []
                },
                "9'x7' roll up door": {
                    models: ['9x7_Roll_Up_Door', '9x7_Roll_Up_Door_Black_Part', '9x7_Roll_Up_Door_Frame', '9x7_Roll_Up_Door_Handle', '9x7_Roll_Up_Door_Metal_Part', '9x7_Roll_Up_Door_Threshold'],
                    img: []
                },
                "3' steel entry door with half glass": {
                    models: ['3_Steel_Entry_Door_with_Half_Glass', '3_Steel_Entry_Door_with_Half_Glass_Frame', '3_Steel_Entry_Door_with_Half_Glass_Glass', '3_Steel_Entry_Door_with_Half_Glass_Handle', '3_Steel_Entry_Door_with_Half_Glass_Threshold', '3_Steel_Entry_Door_with_Half_Glass_Wall_Part'],
                    img: []
                },
                "3' steel entry door (lh-out)": {
                    models: ["3_Steel_Entry_Door(lh-out)", "3_Steel_Entry_Door(lh-out)_Frame", "3_Steel_Entry_Door(lh-out)_Handle_and_Loops", "3_Steel_Entry_Door(lh-out)_Threshold", "3_Steel_Entry_Door(lh-out)_Wall_Part"],
                    img: []
                },
                "3' steel entry door half glass with grids (lh-out)": {
                    models: ['3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Frame', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Glass', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Handle_and_Loops', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Threshold', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Wall_Part'],
                    img: []
                },
                "3' steel entry door with half glass (lh-out)": {
                    models: ['3_Steel_Entry_Door_with_Half_Glass(lh-out)', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Frame', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Glass', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Handle_and_Loops', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Threshold', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Wall_Part'],
                    img: []
                },
                "3' steel entry door": {
                    models: ["Steel_Walk-in_Door", "3_Steel_Entry_Door(lh-out)_Frame", "3_Steel_Entry_Door(lh-out)_Handle_and_Loops", "3_Steel_Entry_Door(lh-out)_Threshold", "3_Steel_Entry_Door(lh-out)_Wall_Part"],
                    img: []
                },
                "3' steel entry door with grid half glass": {
                    models: ["Steel_9-light_Walk-in_Door", "3_Steel_Entry_Door(lh-out)_Frame", 'Steel_9-light_Walk-in_Door_Glass', "3_Steel_Entry_Door(lh-out)_Handle_and_Loops", "3_Steel_Entry_Door(lh-out)_Threshold", "3_Steel_Entry_Door(lh-out)_Wall_Part"],
                    img: []
                },
                "5'x6' double wood door": {
                    models: ['5x6_Double_Wood_Door_Frame', '5x6_Double_Wood_Door_Parts'],
                    img: []
                },
                "5'x7' double wood door": {
                    models: ['5x7_Double_Wood_Door_Frame', '5x7_Double_Wood_Door_Parts'],
                    img: []
                },
                "5'x7' roll up door": {
                    models: ['5x7_Roll_Up_Door', '5x7_Roll_Up_Door_Black_Part', '5x7_Roll_Up_Door_Frame', '5x7_Roll_Up_Door_Handle', '5x7_Roll_Up_Door_Metal_Part', '5x7_Roll_Up_Door_Threshold'],
                    img: []
                },
                "6'x6' double wood door": {
                    models: ['6x6_Double_Wood_Door_Frame', '6x6_Double_Wood_Door_Parts'],
                    img: []
                },
                "6'x6' roll up door": {
                    models: ['6x6_Roll_Up_Door', '6x6_Roll_Up_Door_Black_Part', '6x6_Roll_Up_Door_Frame', '6x6_Roll_Up_Door_Handle', '6x6_Roll_Up_Door_Metal_Part', '6x6_Roll_Up_Door_Threshold'],
                    img: []
                },
                "6'x7' double wood door": {
                    models: ['6x7_Double_Wood_Door_Frame', '6x7_Double_Wood_Door_Parts'],
                    img: []
                },
                "7'x6' double wood door": {
                    models: ['7x6_Double_Wood_Door_Frame', '7x6_Double_Wood_Door_Parts'],
                    img: []
                },
                "7'x7' double wood door": {
                    models: ['7x7_Double_Wood_Door_Frame', '7x7_Double_Wood_Door_Parts'],
                    img: []
                },
                "7'x7' roll up door": {
                    models: ['7x7_Roll_Up_Door', '7x7_Roll_Up_Door_Black_Part', '7x7_Roll_Up_Door_Frame', '7x7_Roll_Up_Door_Handle', '7x7_Roll_Up_Door_Metal_Part', '7x7_Roll_Up_Door_Threshold'],
                    img: []
                },
                "8'x6' double wood door": {
                    models: ['8x6_Double_Wood_Door_Frame', '8x6_Double_Wood_Door_Parts'],
                    img: []
                },
                "8'x7' double wood door": {
                    models: ['8x7_Double_Wood_Door_Frame', '8x7_Double_Wood_Door_Parts'],
                    img: []
                },
                "8'x7' overhead garage door": {
                    models: ['8x7_Overhead_Garage_Door', '8x7_Overhead_Garage_Door_Frame', '8x7_Overhead_Garage_Door_Handle', '8x7_Overhead_Garage_Door_Threshold', '8x7_Overhead_Garage_Door_Wall_Part', '8x7_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "8'x7' roll up door": {
                    models: ['8x7_Roll_Up_Door', '8x7_Roll_Up_Door_Black_Part', '8x7_Roll_Up_Door_Frame', '8x7_Roll_Up_Door_Handle', '8x7_Roll_Up_Door_Metal_Part', '8x7_Roll_Up_Door_Threshold'],
                    img: []
                },
                "8'x8' overhead garage door": {
                    models: ['8x8_Overhead_Garage_Door', '8x8_Overhead_Garage_Door_Frame', '8x8_Overhead_Garage_Door_Handle', '8x8_Overhead_Garage_Door_Threshold', '8x8_Overhead_Garage_Door_Wall_Part', '8x8_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "9'x6' double wood door": {
                    models: ['9x6_Double_Wood_Door_Frame', '9x6_Double_Wood_Door_Parts'],
                    img: []
                },
                "9'x7' overhead garage door": {
                    models: ['9x7_Overhead_Garage_Door', '9x7_Overhead_Garage_Door_Frame', '9x7_Overhead_Garage_Door_Handle', '9x7_Overhead_Garage_Door_Threshold', '9x7_Overhead_Garage_Door_Wall_Part', '9x7_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "9'x8' overhead garage door": {
                    models: ['9x8_Overhead_Garage_Door', '9x8_Overhead_Garage_Door_Frame', '9x8_Overhead_Garage_Door_Handle', '9x8_Overhead_Garage_Door_Threshold', '9x8_Overhead_Garage_Door_Wall_Part', '9x8_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "9'x8' roll up door": {
                    models: ['9x8_Roll_Up_Door', '9x8_Roll_Up_Door_Black_Part', '9x8_Roll_Up_Door_Frame', '9x8_Roll_Up_Door_Handle', '9x8_Roll_Up_Door_Metal_Part', '9x8_Roll_Up_Door_Threshold'],
                    img: []
                },
                "10'x7' overhead garage door": {
                    models: ['10x7_Overhead_Garage_Door', '10x7_Overhead_Garage_Door_Frame', '10x7_Overhead_Garage_Door_Handle', '10x7_Overhead_Garage_Door_Threshold', '10x7_Overhead_Garage_Door_Wall_Part', '10x7_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "10'x8' overhead garage door": {
                    models: ['10x8_Overhead_Garage_Door', '10x8_Overhead_Garage_Door_Frame', '10x8_Overhead_Garage_Door_Handle', '10x8_Overhead_Garage_Door_Threshold', '10x8_Overhead_Garage_Door_Wall_Part', '10x8_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "10'x8' roll up door": {
                    models: ['10x8_Roll_Up_Door', '10x8_Roll_Up_Door_Black_Part', '10x8_Roll_Up_Door_Frame', '10x8_Roll_Up_Door_Handle', '10x8_Roll_Up_Door_Metal_Part', '10x8_Roll_Up_Door_Threshold'],
                    img: []
                },
                'single wood door 36"x72"': {
                    models: ['Single_Wood_Door_36x72', 'Single_Wood_Door_36x72_Parts'],
                    img: []
                },
                'single wood door 42"x72"': {
                    models: ['Single_Wood_Door_42x72', 'Single_Wood_Door_42x72_Parts'],
                    img: []
                },
                "8'x7' overhead garage door with windows": {
                    models: ['8x7_Overhead_Garage_Door_With_Windows', '8x7_Overhead_Garage_Door_Windows', '8x7_Overhead_Garage_Door_Frame', '8x7_Overhead_Garage_Door_Handle', '8x7_Overhead_Garage_Door_Threshold', '8x7_Overhead_Garage_Door_Wall_Part', '8x7_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "8'x8' overhead garage door with windows": {
                    models: ['8x8_Overhead_Garage_Door_With_Windows', '8x8_Overhead_Garage_Door_Windows', '8x8_Overhead_Garage_Door_Frame', '8x8_Overhead_Garage_Door_Handle', '8x8_Overhead_Garage_Door_Threshold', '8x8_Overhead_Garage_Door_Wall_Part', '8x8_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "9'x7' overhead garage door with windows": {
                    models: ['9x7_Overhead_Garage_Door_With_Windows', '9x7_Overhead_Garage_Door_Windows', '9x7_Overhead_Garage_Door_Frame', '9x7_Overhead_Garage_Door_Handle', '9x7_Overhead_Garage_Door_Threshold', '9x7_Overhead_Garage_Door_Wall_Part', '9x7_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "9'x8' overhead garage door with windows": {
                    models: ['9x8_Overhead_Garage_Door_With_Windows', '9x8_Overhead_Garage_Door_Windows', '9x8_Overhead_Garage_Door_Frame', '9x8_Overhead_Garage_Door_Handle', '9x8_Overhead_Garage_Door_Threshold', '9x8_Overhead_Garage_Door_Wall_Part', '9x8_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "10'x7' overhead garage door with windows": {
                    models: ['10x7_Overhead_Garage_Door_With_Windows', '10x7_Overhead_Garage_Door_Windows', '10x7_Overhead_Garage_Door_Frame', '10x7_Overhead_Garage_Door_Handle', '10x7_Overhead_Garage_Door_Threshold', '10x7_Overhead_Garage_Door_Wall_Part', '10x7_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                "10'x8' overhead garage door with windows": {
                    models: ['10x8_Overhead_Garage_Door_With_Windows', '10x8_Overhead_Garage_Door_Windows', '10x8_Overhead_Garage_Door_Frame', '10x8_Overhead_Garage_Door_Handle', '10x8_Overhead_Garage_Door_Threshold', '10x8_Overhead_Garage_Door_Wall_Part', '10x8_Overhead_Garage_Door_Wall_Part_Corner'],
                    img: []
                },
                '42 single wood door (arch-top-trim)': {
                    models: ['42_Single_Wood_Door(arch-top-trim)', '42_Single_Wood_Door(arch-top-trim)_Handle_and_Loops'],
                    img: []
                },
            };

            _.forOwn(loadableObjects, (object, objectName)=> {
                loadableObjects[objectName + ' rh'] = object;
                loadableObjects[objectName + ' lh'] = object;
            });

            loadableObjects = _.extend(loadableObjects, {
                "1'x1' loft window": {
                    models: ['1x1_Loft_Window_Frame', '1x1_Loft_Window_Glass', '1x1_Loft_Window_Grid'],
                    img: []
                },
                "2'x3' single pane window": {
                    models: ['2x3_Single_Pane_Window_Frame', '2x3_Single_Pane_Window_Glass', '2x3_Single_Pane_Window_Grid'],
                    img: []
                },
                "3'x3' single pane window": {
                    models: ['3x3_Single_Pane_Window_Frame', '3x3_Single_Pane_Window_Glass', '3x3_Single_Pane_Window_Grid'],
                    img: []
                },
                "29 transom window": {
                    models: ['29_Transom_Window_Frame', '29_Transom_Window_Glass', '29_Transom_Window_Grid'],
                    img: []
                },
                "60 transom window": {
                    models: ['60_Transom_Window_Frame', '60_Transom_Window_Glass', '60_Transom_Window_Grid'],
                    img: []
                },
                "1'x1' loft gable window": {
                    models: ['1x1_Loft_Gable_Window_Frame', '1x1_Loft_Gable_Window_Glass', '1x1_Loft_Gable_Window_Grid'],
                    img: []
                },
                "29 transom gable window": {
                    models: ['29_Transom_Gable_Window_Frame', '29_Transom_Gable_Window_Glass', '29_Transom_Gable_Window_Grid'],
                    img: []
                },
                "60 transom gable window": {
                    models: ['60_Transom_Gable_Window_Frame', '60_Transom_Gable_Window_Glass', '60_Transom_Gable_Window_Grid'],
                    img: []
                },
                "14'x21' aluminum single pane window": {
                    models: ['14x21_Aluminum_Single_Pane_Window_Frame', '14x21_Aluminum_Single_Pane_Window_Glass', '14x21_Aluminum_Single_Pane_Window_Grid'],
                    img: []
                },
                "18'x27' aluminum single pane window": {
                    models: ['18x27_Aluminum_Single_Pane_Window_Frame', '18x27_Aluminum_Single_Pane_Window_Glass', '18x27_Aluminum_Single_Pane_Window_Grid'],
                    img: []
                },
                "18'x36' aluminum single pane window": {
                    models: ['18x36_Aluminum_Single_Pane_Window_Frame', '18x36_Aluminum_Single_Pane_Window_Glass', '18x36_Aluminum_Single_Pane_Window_Grid'],
                    img: []
                },
                "23'x10' transom window with grids": {
                    models: ['23x10_Transom_Window_with_Grids', '23x10_Transom_Window_with_Grids_Frame', '23x10_Transom_Window_with_Grids_Glass'],
                    img: []
                },
                "24'x24' vinyl double pane window (without-grids)": {
                    models: ['24x24_Vinyl_Double_Pane_Window(without-grids)', '24x24_Vinyl_Double_Pane_Window(without-grids)_Frame', '24x24_Vinyl_Double_Pane_Window(without-grids)_Glass'],
                    img: []
                },
                "24'x24' vinyl double pane window with grids": {
                    models: ['24x24_Vinyl_Double_Pane_Window_with_Grids', '24x24_Vinyl_Double_Pane_Window_with_Grids_Frame', '24x24_Vinyl_Double_Pane_Window_with_Grids_Glass'],
                    img: []
                },
                "24'x27' aluminum single pane window": {
                    models: ['24x27_Aluminum_Single_Pane_Window_Frame', '24x27_Aluminum_Single_Pane_Window_Glass', '24x27_Aluminum_Single_Pane_Window_Grid'],
                    img: []
                },
                "24'x36' aluminum single pane window": {
                    models: ['24x36_Aluminum_Single_Pane_Window_Frame', '24x36_Aluminum_Single_Pane_Window_Glass', '24x36_Aluminum_Single_Pane_Window_Grid'],
                    img: []
                },
                "24'x36' vinyl double pane window (without-grids)": {
                    models: ['24x36_Vinyl_Double_Pane_Window(without-grids)', '24x36_Vinyl_Double_Pane_Window(without-grids)_Frame', '24x36_Vinyl_Double_Pane_Window(without-grids)_Glass'],
                    img: []
                },
                "24'x36' vinyl double pane window with grids": {
                    models: ['24x36_Vinyl_Double_Pane_Window_with_Grids', '24x36_Vinyl_Double_Pane_Window_with_Grids_Frame', '24x36_Vinyl_Double_Pane_Window_with_Grids_Glass'],
                    img: []
                },
                "29'x10' transom window with grids": {
                    models: ['29x10_Transom_Window_with_Grids', '29x10_Transom_Window_with_Grids_Frame', '29x10_Transom_Window_with_Grids_Glass'],
                    img: []
                },
                "30'x40' vinyl double pane window (without-grids)": {
                    models: ['30x40_Vinyl_Double_Pane_Window(without-grids)', '30x40_Vinyl_Double_Pane_Window(without-grids)_Frame', '30x40_Vinyl_Double_Pane_Window(without-grids)_Glass'],
                    img: []
                },
                "30'x40' vinyl double pane window with grids": {
                    models: ['30x40_Vinyl_Double_Pane_Window_with_Grids', '30x40_Vinyl_Double_Pane_Window_with_Grids_Frame', '30x40_Vinyl_Double_Pane_Window_with_Grids_Glass'],
                    img: []
                },
                "36'x48' vinyl double pane window (without-grids)": {
                    models: ['36x48_Vinyl_Double_Pane_Window(without-grids)', '36x48_Vinyl_Double_Pane_Window(without-grids)_Frame', '36x48_Vinyl_Double_Pane_Window(without-grids)_Glass'],
                    img: []
                },
                "36'x48' vinyl double pane window with grids": {
                    models: ['36x48_Vinyl_Double_Pane_Window_with_Grids', '36x48_Vinyl_Double_Pane_Window_with_Grids_Frame', '36x48_Vinyl_Double_Pane_Window_with_Grids_Glass'],
                    img: []
                },
                "60'x10' transom window with grids": {
                    models: ['60x10_Transom_Window_with_Grids', '60x10_Transom_Window_with_Grids_Frame', '60x10_Transom_Window_with_Grids_Glass'],
                    img: []
                },
                "72'x10' transom window with grids": {
                    models: ['72x10_Transom_Window_with_Grids', '72x10_Transom_Window_with_Grids_Frame', '72x10_Transom_Window_with_Grids_Glass'],
                    img: []
                },
                "Heritage Rustic Black": {models: [], img: ['BlackWalnut', 'BlackWalnut_b', 'roof', 'roof_b']},
                "Heritage Black Walnut": {models: [], img: ['MountainSlate', 'MountainSlate_b', 'roof', 'roof_b']},
                "Heritage Rustic Cedar": {models: [], img: ['RusticBlack', 'RusticBlack_b', 'roof', 'roof_b']},
                "Heritage Mountain Slate": {models: [], img: ['RusticCedar', 'RusticCedar_b', 'roof', 'roof_b']},
                "Vintage White": {models: [], img: ['roofs/metal_roof', 'roofs/metal_roof_b', 'roofs/metal_roof_d']},
                "Rustic Red": {models: [], img: ['roofs/metal_roof', 'roofs/metal_roof_b', 'roofs/metal_roof_d']},
                "Gray": {models: [], img: ['roofs/metal_roof', 'roofs/metal_roof_b', 'roofs/metal_roof_d']},
                "Evergreen": {models: [], img: ['roofs/metal_roof', 'roofs/metal_roof_b', 'roofs/metal_roof_d']},
                "Desert Sand": {models: [], img: ['roofs/metal_roof', 'roofs/metal_roof_b', 'roofs/metal_roof_d']},
                "Coal Black": {models: [], img: ['roofs/metal_roof', 'roofs/metal_roof_b', 'roofs/metal_roof_d']},
                "Galvalume": {
                    models: [],
                    img: ['roofs/metal_roof', 'roofs/metal_roof_b', 'roofs/metal_roof_d', 'roofs/galvalume']
                },
            });

            let items2D = ["atv", "bed", "bike", "computer_table", "croquet", "kf-04", "lawn_mower", "lazyboy",
                "office_desk", "ping_pong", "sofa1", "sofa2", "toolbox", "tv", "wagon", "wheel_barrow",
                "work_bench"];

            loadableObjects["2d"] = {};
            _.each(items2D, (item2D)=> {
                loadableObjects["2d"][item2D] = {models: [], img: [`${item2D}`, `${item2D}_t`, `${item2D}_o`]};
            });

            let models = [], img = [];
            _.forOwn(loadableObjects, (object, objectName)=> {
                if (features.doors[objectName] || features.windows[objectName] || features.roofs[objectName]
                    || features["2d"][objectName]) {

                    models = models.concat(object.models);
                    img = img.concat(object.img);
                }
            });

            img.push('floor', 'floor_b', 'skybox', 'SolarCell', 'tiles', 'tiles_b', 'wood_b', 'wood_white', 'logo', 'floor_plan',
                'panoram');
            img = _.uniq(img);

            let loadables = _.map(models, (loadable)=> {
                return assets.models[loadable]
            });

            loadables = loadables.concat(_.map(img, (loadable)=> {
                return assets.img[loadable]
            }));

            loadables.push(assets.fonts.arial);

            _.each(loadables, (path)=> {
                total_++;

                let xhr = new XMLHttpRequest();

                xhr.onload = ()=> {
                    loaded_++;
                    loadProgress.innerHTML = (loaded_ / total_ * 100).toFixed(0) + "%";

                    if (self.progress) {
                        self.progress({total: total_, loaded: loaded_});
                    }

                    if (loaded_ == total_) {
                        setTimeout(()=> {
                            if (self.loaded) {
                                self.loaded();
                            }

                            element.innerHTML = '<img draggable="false" src="' + assets.img.logo + '" style="width:100px;">';
                            setTimeout(()=> {
                                element.class += ' fade-away';
                            }, 500);

                            setTimeout(()=> {
                                element.parentNode.removeChild(element);
                            }, 1500);
                        }, 600);
                    }
                };

                xhr.onerror = (err)=> {
                    console.error(err);
                };

                xhr.open("GET", path);
                xhr.send();
            });
        }
    }
}

module.exports = Loader;
