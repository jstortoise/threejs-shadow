const THREE = require('three');
const DraggableObject = require('./DraggableObject');
const tools = require('./../helpers/tools');
const colors = require('./../helpers/colors');
const assets = require('./../helpers/assets');
const _ = require('lodash');
const TextureGenerator = require('./../helpers/TextureGenerator');
const Deck = require('./Deck');
const Door = require('./Door');

/**
 * The class for the doors that go deep in the wall
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class DeepDoor extends DraggableObject {
    /**
     * Creates door object
     * @param type Deep door type
     * @param environmentCamera CubeCamera, to make reflections
     * @param shedHeight  Shed's wall height
     */
    constructor(type, environmentCamera, shedHeight) {
        let textureLoader = new THREE.TextureLoader();
        const WALL_MAP_WIDTH = tools.ft2cm(4);
        const THICKNESS = tools.in2cm(3.5);

        let secondaryMaterial = new THREE.MeshPhongMaterial({bumpScale: tools.bumpScale});
        let mainMaterial = new THREE.MeshPhongMaterial();
        let glassMaterial = new THREE.MeshPhongMaterial({
            envMap: environmentCamera.renderTarget.texture,
            color: 0x777777
        });

        let isWallRemoved_ = false;

        let partsMaterial = new THREE.MeshPhongMaterial({color: 0x333333});

        let whiteMaterial = new THREE.MeshPhongMaterial();

        let metalMaterial = new THREE.MeshPhongMaterial(_.extend({}, colors.metalMaterialOptions, {color: 0x777777}));

        let tMap = textureLoader.load(assets.img['metal']);
        let tBump = textureLoader.load(assets.img['metal_b']);

        tMap.wrapS = tMap.wrapT = tBump.wrapT = tBump.wrapS = THREE.RepeatWrapping;

        let thresholdMaterial = new THREE.MeshPhongMaterial(_.extend({}, colors.metalMaterialOptions, {
            //map: tMap,
            color: 0x555555,
            normalMap: tBump
        }));

        //here are options for all doors and windows
        let doorTypes = {
            "6'x7' roll up door": {
                models: ["6x7_Roll_Up_Door", "6x7_Roll_Up_Door_Black_Part", "6x7_Roll_Up_Door_Frame",
                    "6x7_Roll_Up_Door_Handle", "6x7_Roll_Up_Door_Metal_Part", "6x7_Roll_Up_Door_Threshold"],
                secondaryColorModels: ["6x7_Roll_Up_Door_Frame"]
            },
            "8'x8' roll up door": {
                models: ["8x8_Roll_Up_Door", "8x8_Roll_Up_Door_Black", "8x8_Roll_Up_Door_Frame",
                    "8x8_Roll_Up_Door_Handle", "8x8_Roll_Up_Door_Metal_Part", "8x8_Roll_Up_Door_Threshold"],
                secondaryColorModels: ["8x8_Roll_Up_Door_Frame"]
            },
            "9'x7' roll up door": {
                models: ["9x7_Roll_Up_Door", "9x7_Roll_Up_Door_Black_Part", "9x7_Roll_Up_Door_Frame",
                    "9x7_Roll_Up_Door_Handle", "9x7_Roll_Up_Door_Metal_Part", "9x7_Roll_Up_Door_Threshold"],
                secondaryColorModels: ["9x7_Roll_Up_Door_Frame"]
            },
            "15 light french doors": {
                models: ["15Light_French_Doors", "15Light_French_Doors_Frame", "15Light_French_Doors_Glass", "15Light_French_Doors_Handle", "15Light_French_Doors_Threshold", "15Light_French_Doors_Wall_Part"],
                secondaryColorModels: ["15Light_French_Doors_Frame"],
                mainColorModels: ["15Light_French_Doors_Wall_Part"]
            },
            "steel 9' light walk-in door": {
                models: ["Steel_9-light_Walk-in_Door", "Steel_9-light_Walk-in_Door_Frame", "Steel_9-light_Walk-in_Door_Glass", "Steel_9-light_Walk-in_Door_Handle", "Steel_9-light_Walk-in_Door_Threshold", "Steel_9-light_Walk-in_Door_Wall_Part"],
                secondaryColorModels: ["Steel_9-light_Walk-in_Door_Frame"],
                mainColorModels: ["Steel_9-light_Walk-in_Door_Wall_Part"]
            },
            "short steel 9' light walk-in door": {
                models: ["Short_Steel_9-light_Walk-in_Door", "Short_Steel_9-light_Walk-in_Door_Frame", "Short_Steel_9-light_Walk-in_Door_Glass", "Short_Steel_9-light_Walk-in_Door_Handle", "Short_Steel_9-light_Walk-in_Door_Threshold", "Short_Steel_9-light_Walk-in_Door_Wall_Part"],
                secondaryColorModels: ["Short_Steel_9-light_Walk-in_Door_Frame"],
                mainColorModels: ["Short_Steel_9-light_Walk-in_Door_Wall_Part"]
            },
            "steel french doors": {
                models: ["Steel_French_Doors", "Steel_French_Doors_Frame", "Steel_French_Doors_Handle", "Steel_French_Doors_Threshold", "Steel_French_Doors_Wall_Part"],
                secondaryColorModels: ["Steel_French_Doors_Frame"],
                mainColorModels: ["Steel_French_Doors_Wall_Part"]
            },
            "steel walk-in door": {
                models: ["Steel_Walk-in_Door", "Steel_Walk-in_Door_Frame", "Steel_Walk-in_Door_Handle", "Steel_Walk-in_Door_Threshold", "Steel_Walk-in_Door_Wall_Part"],
                secondaryColorModels: ["Steel_Walk-in_Door_Frame"],
                mainColorModels: ["Steel_Walk-in_Door_Wall_Part"]
            },
            "short steel walk-in door": {
                models: ["Short_Steel_Walk-in_Door", "Short_Steel_Walk-in_Door_Frame", "Short_Steel_Walk-in_Door_Handle", "Short_Steel_Walk-in_Door_Threshold", "Short_Steel_Walk-in_Door_Wall_Part"],
                secondaryColorModels: ["Short_Steel_Walk-in_Door_Frame"],
                mainColorModels: ["Short_Steel_Walk-in_Door_Wall_Part"]
            },
            "3' steel entry door with half glass": {
                models: ["3_Steel_Entry_Door_with_Half_Glass", "3_Steel_Entry_Door_with_Half_Glass_Frame", "3_Steel_Entry_Door_with_Half_Glass_Glass", "3_Steel_Entry_Door_with_Half_Glass_Handle", "3_Steel_Entry_Door_with_Half_Glass_Threshold", "3_Steel_Entry_Door_with_Half_Glass_Wall_Part"],
                secondaryColorModels: ["3_Steel_Entry_Door_with_Half_Glass_Frame"],
                mainColorModels: ["3_Steel_Entry_Door_with_Half_Glass_Wall_Part"],
            },
            "3' steel entry door (lh-out)": {
                models: ["3_Steel_Entry_Door(lh-out)", "3_Steel_Entry_Door(lh-out)_Frame", "3_Steel_Entry_Door(lh-out)_Handle_and_Loops", "3_Steel_Entry_Door(lh-out)_Threshold", "3_Steel_Entry_Door(lh-out)_Wall_Part"],
                secondaryColorModels: ["3_Steel_Entry_Door(lh-out)_Frame"],
                mainColorModels: ["3_Steel_Entry_Door(lh-out)_Wall_Part"],
            },
            "3' steel entry door half glass with grids (lh-out)": {
                models: ['3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Frame', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Glass', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Handle_and_Loops', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Threshold', '3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Wall_Part'],
                secondaryColorModels: ["3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Frame"],
                mainColorModels: ["3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Wall_Part"],
            },
            "3' steel entry door with half glass (lh-out)": {
                models: ['3_Steel_Entry_Door_with_Half_Glass(lh-out)', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Frame', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Glass', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Handle_and_Loops', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Threshold', '3_Steel_Entry_Door_with_Half_Glass(lh-out)_Wall_Part'],
                secondaryColorModels: ["3_Steel_Entry_Door_with_Half_Glass(lh-out)_Frame"],
                mainColorModels: ["3_Steel_Entry_Door_with_Half_Glass(lh-out)_Wall_Part"],
            },
            "3' steel entry door": {
                models: ["Steel_Walk-in_Door", "3_Steel_Entry_Door(lh-out)_Frame", "3_Steel_Entry_Door(lh-out)_Handle_and_Loops", "3_Steel_Entry_Door(lh-out)_Threshold", "3_Steel_Entry_Door(lh-out)_Wall_Part"],
                secondaryColorModels: ["3_Steel_Entry_Door(lh-out)_Frame"],
                mainColorModels: ["3_Steel_Entry_Door(lh-out)_Wall_Part"],
            },
            "3' steel entry door with grid half glass": {
                models: ["Steel_9-light_Walk-in_Door", "3_Steel_Entry_Door(lh-out)_Frame", 'Steel_9-light_Walk-in_Door_Glass', "3_Steel_Entry_Door(lh-out)_Handle_and_Loops", "3_Steel_Entry_Door(lh-out)_Threshold", "3_Steel_Entry_Door(lh-out)_Wall_Part"],
                secondaryColorModels: ["3_Steel_Entry_Door(lh-out)_Frame"],
                mainColorModels: ["3_Steel_Entry_Door(lh-out)_Wall_Part"],
            },
            "5'x7' roll up door": {
                models: ["5x7_Roll_Up_Door", "5x7_Roll_Up_Door_Black_Part", "5x7_Roll_Up_Door_Frame", "5x7_Roll_Up_Door_Handle", "5x7_Roll_Up_Door_Metal_Part", "5x7_Roll_Up_Door_Threshold"],
                secondaryColorModels: ["5x7_Roll_Up_Door_Frame"],
            },
            "6'x6' roll up door": {
                models: ["6x6_Roll_Up_Door", "6x6_Roll_Up_Door_Black_Part", "6x6_Roll_Up_Door_Frame", "6x6_Roll_Up_Door_Handle", "6x6_Roll_Up_Door_Metal_Part", "6x6_Roll_Up_Door_Threshold"],
                secondaryColorModels: ["6x6_Roll_Up_Door_Frame"],
            },
            "7'x7' roll up door": {
                models: ["7x7_Roll_Up_Door", "7x7_Roll_Up_Door_Black_Part", "7x7_Roll_Up_Door_Frame", "7x7_Roll_Up_Door_Handle", "7x7_Roll_Up_Door_Metal_Part", "7x7_Roll_Up_Door_Threshold"],
                secondaryColorModels: ["7x7_Roll_Up_Door_Frame"],
            },
            "8'x7' overhead garage door": {
                models: ["8x7_Overhead_Garage_Door", "8x7_Overhead_Garage_Door_Frame", "8x7_Overhead_Garage_Door_Handle", "8x7_Overhead_Garage_Door_Threshold", "8x7_Overhead_Garage_Door_Wall_Part", "8x7_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["8x7_Overhead_Garage_Door_Frame"],
                mainColorModels: ["8x7_Overhead_Garage_Door_Wall_Part"],
            },
            "8'x7' roll up door": {
                models: ["8x7_Roll_Up_Door", "8x7_Roll_Up_Door_Black_Part", "8x7_Roll_Up_Door_Frame", "8x7_Roll_Up_Door_Handle", "8x7_Roll_Up_Door_Metal_Part", "8x7_Roll_Up_Door_Threshold"],
                secondaryColorModels: ["8x7_Roll_Up_Door_Frame"],
            },
            "8'x8' overhead garage door": {
                models: ["8x8_Overhead_Garage_Door", "8x8_Overhead_Garage_Door_Frame", "8x8_Overhead_Garage_Door_Handle", "8x8_Overhead_Garage_Door_Threshold", "8x8_Overhead_Garage_Door_Wall_Part", "8x8_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["8x8_Overhead_Garage_Door_Frame"],
                mainColorModels: ["8x8_Overhead_Garage_Door_Wall_Part"],
            },
            "9'x7' overhead garage door": {
                models: ["9x7_Overhead_Garage_Door", "9x7_Overhead_Garage_Door_Frame", "9x7_Overhead_Garage_Door_Handle", "9x7_Overhead_Garage_Door_Threshold", "9x7_Overhead_Garage_Door_Wall_Part", "9x7_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["9x7_Overhead_Garage_Door_Frame"],
                mainColorModels: ["9x7_Overhead_Garage_Door_Wall_Part"],
            },
            "9'x8' overhead garage door": {
                models: ["9x8_Overhead_Garage_Door", "9x8_Overhead_Garage_Door_Frame", "9x8_Overhead_Garage_Door_Handle", "9x8_Overhead_Garage_Door_Threshold", "9x8_Overhead_Garage_Door_Wall_Part", "9x8_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["9x8_Overhead_Garage_Door_Frame"],
                mainColorModels: ["9x8_Overhead_Garage_Door_Wall_Part"],
            },
            "9'x8' roll up door": {
                models: ["9x8_Roll_Up_Door", "9x8_Roll_Up_Door_Black_Part", "9x8_Roll_Up_Door_Frame", "9x8_Roll_Up_Door_Handle", "9x8_Roll_Up_Door_Metal_Part", "9x8_Roll_Up_Door_Threshold"],
                secondaryColorModels: ["9x8_Roll_Up_Door_Frame"],
            },
            "10'x7' overhead garage door": {
                models: ["10x7_Overhead_Garage_Door", "10x7_Overhead_Garage_Door_Frame", "10x7_Overhead_Garage_Door_Handle", "10x7_Overhead_Garage_Door_Threshold", "10x7_Overhead_Garage_Door_Wall_Part", "10x7_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["10x7_Overhead_Garage_Door_Frame"],
                mainColorModels: ["10x7_Overhead_Garage_Door_Wall_Part"],
            },
            "10'x8' overhead garage door": {
                models: ["10x8_Overhead_Garage_Door", "10x8_Overhead_Garage_Door_Frame", "10x8_Overhead_Garage_Door_Handle", "10x8_Overhead_Garage_Door_Threshold", "10x8_Overhead_Garage_Door_Wall_Part", "10x8_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["10x8_Overhead_Garage_Door_Frame"],
                mainColorModels: ["10x8_Overhead_Garage_Door_Wall_Part"],
            },
            "10'x8' roll up door": {
                models: ["10x8_Roll_Up_Door", "10x8_Roll_Up_Door_Black_Part", "10x8_Roll_Up_Door_Frame", "10x8_Roll_Up_Door_Handle", "10x8_Roll_Up_Door_Metal_Part", "10x8_Roll_Up_Door_Threshold"],
                secondaryColorModels: ["10x8_Roll_Up_Door_Frame"],
            },
            "8'x7' overhead garage door with windows": {
                models: ["8x7_Overhead_Garage_Door_With_Windows", "8x7_Overhead_Garage_Door_Windows", "8x7_Overhead_Garage_Door_Frame", "8x7_Overhead_Garage_Door_Handle", "8x7_Overhead_Garage_Door_Threshold", "8x7_Overhead_Garage_Door_Wall_Part", "8x7_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["8x7_Overhead_Garage_Door_Frame"],
                mainColorModels: ["8x7_Overhead_Garage_Door_Wall_Part"],
            },
            "8'x8' overhead garage door with windows": {
                models: ["8x8_Overhead_Garage_Door_With_Windows", "8x8_Overhead_Garage_Door_Windows", "8x8_Overhead_Garage_Door_Frame", "8x8_Overhead_Garage_Door_Handle", "8x8_Overhead_Garage_Door_Threshold", "8x8_Overhead_Garage_Door_Wall_Part", "8x8_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["8x8_Overhead_Garage_Door_Frame"],
                mainColorModels: ["8x8_Overhead_Garage_Door_Wall_Part"],
            },
            "9'x7' overhead garage door with windows": {
                models: ["9x7_Overhead_Garage_Door_With_Windows", "9x7_Overhead_Garage_Door_Windows", "9x7_Overhead_Garage_Door_Frame", "9x7_Overhead_Garage_Door_Handle", "9x7_Overhead_Garage_Door_Threshold", "9x7_Overhead_Garage_Door_Wall_Part", "9x7_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["9x7_Overhead_Garage_Door_Frame"],
                mainColorModels: ["9x7_Overhead_Garage_Door_Wall_Part"],
            },
            "9'x8' overhead garage door with windows": {
                models: ["9x8_Overhead_Garage_Door_With_Windows", "9x8_Overhead_Garage_Door_Windows", "9x8_Overhead_Garage_Door_Frame", "9x8_Overhead_Garage_Door_Handle", "9x8_Overhead_Garage_Door_Threshold", "9x8_Overhead_Garage_Door_Wall_Part", "9x8_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["9x8_Overhead_Garage_Door_Frame"],
                mainColorModels: ["9x8_Overhead_Garage_Door_Wall_Part"],
            },
            "10'x7' overhead garage door with windows": {
                models: ["10x7_Overhead_Garage_Door_With_Windows", "10x7_Overhead_Garage_Door_Windows", "10x7_Overhead_Garage_Door_Frame", "10x7_Overhead_Garage_Door_Handle", "10x7_Overhead_Garage_Door_Threshold", "10x7_Overhead_Garage_Door_Wall_Part", "10x7_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["10x7_Overhead_Garage_Door_Frame"],
                mainColorModels: ["10x7_Overhead_Garage_Door_Wall_Part"],
            },
            "10'x8' overhead garage door with windows": {
                models: ["10x8_Overhead_Garage_Door_With_Windows", "10x8_Overhead_Garage_Door_Windows", "10x8_Overhead_Garage_Door_Frame", "10x8_Overhead_Garage_Door_Handle", "10x8_Overhead_Garage_Door_Threshold", "10x8_Overhead_Garage_Door_Wall_Part", "10x8_Overhead_Garage_Door_Wall_Part_Corner"],
                secondaryColorModels: ["10x8_Overhead_Garage_Door_Frame"],
                mainColorModels: ["10x8_Overhead_Garage_Door_Wall_Part"],
            }
        };

        addDoorVariations(doorTypes);

        let doorOrientations = {
            "15 light french doors": Door.ORIENTATION_RIGHT | Door.SWING_IN,
            "steel 9' light walk-in door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "short steel 9' light walk-in door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "steel french doors": Door.ORIENTATION_RIGHT | Door.SWING_IN,
            "steel walk-in door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "short steel walk-in door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "3' steel entry door with half glass": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "3' steel entry door (lh-out)": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "3' steel entry door half glass with grids (lh-out)": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "3' steel entry door with half glass (lh-out)": Door.ORIENTATION_LEFT | Door.SWING_OUT,
            "3' steel entry door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "3' steel entry door with grid half glass": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "5'x7' roll up door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "6'x6' roll up door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "7'x7' roll up door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "8'x7' overhead garage door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "8'x7' roll up door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "8'x8' overhead garage door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "9'x7' overhead garage door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "9'x8' overhead garage door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "9'x8' roll up door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "10'x7' overhead garage door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "10'x8' overhead garage door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "10'x8' roll up door": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "8'x7' roll up door with windows": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "8'x8' overhead garage door with windows": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "9'x7' overhead garage door with windows": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "9'x8' overhead garage door with windows": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "10'x7' overhead garage door with windows": Door.ORIENTATION_LEFT | Door.SWING_IN,
            "10'x8' overhead garage door with windows": Door.ORIENTATION_LEFT | Door.SWING_IN,
        };

        _.forOwn(doorOrientations, (orientation, id)=> {
            doorOrientations[id + ' lh'] = orientation;
            doorOrientations[id + ' rh'] = orientation ^ (Door.ORIENTATION_LEFT | Door.ORIENTATION_RIGHT);
        });

        let cutBoxes = {
            "6'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, -10), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(7.5), 10)),
            "8'x8' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(8.5), 10)),
            "9'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(7.5), 10)),
            "15 light french doors": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, -10), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(7), 10)),
            "steel 9' light walk-in door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(7), 10)),
            "short steel 9' light walk-in door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(6.5), 10)),
            "steel french doors": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, -10), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(7), 10)),
            "steel walk-in door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(7), 10)),
            "short steel walk-in door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(6.5), 10)),
            "3' steel entry door with half glass": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(7), 10)),
            "3' steel entry door (lh-out)": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(7), 10)),
            "3' steel entry door half glass with grids (lh-out)": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(7), 10)),
            "3' steel entry door with half glass (lh-out)": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(7), 10)),
            "3' steel entry door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(7), 10)),
            "3' steel entry door with grid half glass": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(7), 10)),
            "5'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2.5), 0, -10), new THREE.Vector3(tools.ft2cm(2.5), tools.ft2cm(7.5), 10)),
            "6'x6' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, -10), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(6.5), 10)),
            "7'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3.5), 0, -10), new THREE.Vector3(tools.ft2cm(3.5), tools.ft2cm(7.5), 10)),
            "8'x7' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(7.5), 10)),
            "8'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(7.5), 10)),
            "8'x8' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(8.5), 10)),
            "9'x7' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(7.5), 10)),
            "9'x8' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(8.5), 10)),
            "9'x8' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(8.5), 10)),
            "10'x7' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(7.5), 10)),
            "10'x8' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(8.5), 10)),
            "10'x8' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(8.5), 10)),
            "8'x7' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(7.5), 10)),
            "8'x8' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(8.5), 10)),
            "9'x7' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(7.5), 10)),
            "9'x8' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(8.5), 10)),
            "10'x7' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(7.5), 10)),
            "10'x8' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(8.5), 10)),
        };

        addDoorVariations(cutBoxes);

        let planBoxes = {
            "6'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, -10), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(7), 10)),
            "8'x8' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(8), 10)),
            "9'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(7), 10)),
            "15 light french doors": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, -10), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(6.75), 10)),
            "steel 9' light walk-in door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(6.75), 10)),
            "short steel 9' light walk-in door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(6.75), 10)),
            "steel french doors": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, -10), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(6.75), 10)),
            "steel walk-in door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(6.75), 10)),
            "short steel walk-in door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(6.75), 10)),
            "3' steel entry door with half glass": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(3), 10)),
            "3' steel entry door (lh-out)": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(3), 10)),
            "3' steel entry door half glass with grids (lh-out)": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(3), 10)),
            "3' steel entry door with half glass (lh-out)": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(3), 10)),
            "3' steel entry door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(3), 10)),
            "3' steel entry door with grid half glass": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(1.5), 0, -10), new THREE.Vector3(tools.ft2cm(1.5), tools.ft2cm(3), 10)),
            "5'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(2.5), 0, -10), new THREE.Vector3(tools.ft2cm(2.5), tools.ft2cm(5), 10)),
            "6'x6' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3), 0, -10), new THREE.Vector3(tools.ft2cm(3), tools.ft2cm(6), 10)),
            "7'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(3.5), 0, -10), new THREE.Vector3(tools.ft2cm(3.5), tools.ft2cm(7), 10)),
            "8'x7' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(7), 10)),
            "8'x7' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(8), 10)),
            "8'x8' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(8), 10)),
            "9'x7' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(7), 10)),
            "9'x8' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(8), 10)),
            "9'x8' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(9), 10)),
            "10'x7' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(7), 10)),
            "10'x8' overhead garage door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(8), 10)),
            "10'x8' roll up door": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(10), 10)),
            "8'x7' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(7), 10)),
            "8'x8' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4), 0, -10), new THREE.Vector3(tools.ft2cm(4), tools.ft2cm(8), 10)),
            "9'x7' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(7), 10)),
            "9'x8' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(4.5), 0, -10), new THREE.Vector3(tools.ft2cm(4.5), tools.ft2cm(8), 10)),
            "10'x7' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(7), 10)),
            "10'x8' overhead garage door with windows": new THREE.Box3(new THREE.Vector3(-tools.ft2cm(5), 0, -10), new THREE.Vector3(tools.ft2cm(5), tools.ft2cm(8), 10)),
        };

        addDoorVariations(planBoxes);

        let bboxes = {};
        _.forOwn(planBoxes, (value, key)=> {
            bboxes[key] = value.clone();
            bboxes[key].min.x -= tools.ft2cm(0.35);
            bboxes[key].max.x += tools.ft2cm(0.35);
        });

        let materialMap = {
            "6x7_Roll_Up_Door": metalMaterial,
            "6x7_Roll_Up_Door_Black_Part": partsMaterial,
            "6x7_Roll_Up_Door_Frame": secondaryMaterial,
            "6x7_Roll_Up_Door_Handle": partsMaterial,
            "6x7_Roll_Up_Door_Metal_Part": metalMaterial,
            "6x7_Roll_Up_Door_Threshold": thresholdMaterial,
            "8x8_Roll_Up_Door": metalMaterial,
            "8x8_Roll_Up_Door_Black": partsMaterial,
            "8x8_Roll_Up_Door_Frame": secondaryMaterial,
            "8x8_Roll_Up_Door_Handle": partsMaterial,
            "8x8_Roll_Up_Door_Metal_Part": metalMaterial,
            "8x8_Roll_Up_Door_Threshold": thresholdMaterial,
            "9x7_Roll_Up_Door": metalMaterial,
            "9x7_Roll_Up_Door_Black_Part": partsMaterial,
            "9x7_Roll_Up_Door_Frame": secondaryMaterial,
            "9x7_Roll_Up_Door_Handle": partsMaterial,
            "9x7_Roll_Up_Door_Metal_Part": metalMaterial,
            "9x7_Roll_Up_Door_Threshold": thresholdMaterial,
            "15Light_French_Doors": whiteMaterial,
            "15Light_French_Doors_Frame": secondaryMaterial,
            "15Light_French_Doors_Glass": glassMaterial,
            "15Light_French_Doors_Handle": partsMaterial,
            "15Light_French_Doors_Threshold": thresholdMaterial,
            "15Light_French_Doors_Wall_Part": mainMaterial,
            "Steel_9-light_Walk-in_Door": whiteMaterial,
            "Steel_9-light_Walk-in_Door_Frame": secondaryMaterial,
            "Steel_9-light_Walk-in_Door_Glass": glassMaterial,
            "Steel_9-light_Walk-in_Door_Handle": partsMaterial,
            "Steel_9-light_Walk-in_Door_Threshold": thresholdMaterial,
            "Steel_9-light_Walk-in_Door_Wall_Part": mainMaterial,
            "Short_Steel_9-light_Walk-in_Door": whiteMaterial,
            "jFrame": secondaryMaterial,
            "Short_Steel_9-light_Walk-in_Door_Glass": glassMaterial,
            "Short_Steel_9-light_Walk-in_Door_Handle": partsMaterial,
            "Short_Steel_9-light_Walk-in_Door_Threshold": thresholdMaterial,
            "Short_Steel_9-light_Walk-in_Door_Wall_Part": mainMaterial,
            "Steel_French_Doors": whiteMaterial,
            "Steel_French_Doors_Frame": secondaryMaterial,
            "Steel_French_Doors_Handle": partsMaterial,
            "Steel_French_Doors_Threshold": thresholdMaterial,
            "Steel_French_Doors_Wall_Part": mainMaterial,
            "Steel_Walk-in_Door": whiteMaterial,
            "Steel_Walk-in_Door_Frame": secondaryMaterial,
            "Steel_Walk-in_Door_Handle": partsMaterial,
            "Steel_Walk-in_Door_Threshold": thresholdMaterial,
            "Steel_Walk-in_Door_Wall_Part": mainMaterial,
            "Short_Steel_Walk-in_Door": whiteMaterial,
            "Short_Steel_Walk-in_Door_Frame": secondaryMaterial,
            "Short_Steel_Walk-in_Door_Handle": partsMaterial,
            "Short_Steel_Walk-in_Door_Threshold": thresholdMaterial,
            "Short_Steel_Walk-in_Door_Wall_Part": mainMaterial,
            "3_Steel_Entry_Door_with_Half_Glass": whiteMaterial,
            "3_Steel_Entry_Door_with_Half_Glass_Frame": secondaryMaterial,
            "3_Steel_Entry_Door_with_Half_Glass_Glass": glassMaterial,
            "3_Steel_Entry_Door_with_Half_Glass_Handle": partsMaterial,
            "3_Steel_Entry_Door_with_Half_Glass_Threshold": metalMaterial,
            "3_Steel_Entry_Door_with_Half_Glass_Wall_Part": mainMaterial,
            "3_Steel_Entry_Door(lh-out)": whiteMaterial,
            "3_Steel_Entry_Door(lh-out)_Frame": secondaryMaterial,
            "3_Steel_Entry_Door(lh-out)_Handle_and_Loops": partsMaterial,
            "3_Steel_Entry_Door(lh-out)_Threshold": thresholdMaterial,
            "3_Steel_Entry_Door(lh-out)_Wall_Part": mainMaterial,
            "3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)": whiteMaterial,
            "3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Frame": secondaryMaterial,
            "3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Glass": glassMaterial,
            "3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Handle_and_Loops": partsMaterial,
            "3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Threshold": thresholdMaterial,
            "3_Steel_Entry_Door_Half_Glass_with_Grids(lh-out)_Wall_Part": mainMaterial,
            "3_Steel_Entry_Door_with_Half_Glass(lh-out)": whiteMaterial,
            "3_Steel_Entry_Door_with_Half_Glass(lh-out)_Frame": secondaryMaterial,
            "3_Steel_Entry_Door_with_Half_Glass(lh-out)_Glass": glassMaterial,
            "3_Steel_Entry_Door_with_Half_Glass(lh-out)_Handle_and_Loops": partsMaterial,
            "3_Steel_Entry_Door_with_Half_Glass(lh-out)_Threshold": thresholdMaterial,
            "3_Steel_Entry_Door_with_Half_Glass(lh-out)_Wall_Part": mainMaterial,
            "5x7_Roll_Up_Door": metalMaterial,
            "5x7_Roll_Up_Door_Black_Part": partsMaterial,
            "5x7_Roll_Up_Door_Frame": secondaryMaterial,
            "5x7_Roll_Up_Door_Handle": partsMaterial,
            "5x7_Roll_Up_Door_Metal_Part": metalMaterial,
            "5x7_Roll_Up_Door_Threshold": thresholdMaterial,
            "6x6_Roll_Up_Door": metalMaterial,
            "6x6_Roll_Up_Door_Black_Part": partsMaterial,
            "6x6_Roll_Up_Door_Frame": secondaryMaterial,
            "6x6_Roll_Up_Door_Handle": partsMaterial,
            "6x6_Roll_Up_Door_Metal_Part": metalMaterial,
            "6x6_Roll_Up_Door_Threshold": thresholdMaterial,
            "7x7_Roll_Up_Door": metalMaterial,
            "7x7_Roll_Up_Door_Black_Part": partsMaterial,
            "7x7_Roll_Up_Door_Frame": secondaryMaterial,
            "7x7_Roll_Up_Door_Handle": partsMaterial,
            "7x7_Roll_Up_Door_Metal_Part": metalMaterial,
            "7x7_Roll_Up_Door_Threshold": thresholdMaterial,
            "8x7_Overhead_Garage_Door": whiteMaterial,
            "8x7_Overhead_Garage_Door_Frame": secondaryMaterial,
            "8x7_Overhead_Garage_Door_Handle": partsMaterial,
            "8x7_Overhead_Garage_Door_Threshold": thresholdMaterial,
            "8x7_Overhead_Garage_Door_Wall_Part": mainMaterial,
            "8x7_Overhead_Garage_Door_Wall_Part_Corner": mainMaterial,
            "8x7_Roll_Up_Door": metalMaterial,
            "8x7_Roll_Up_Door_Black_Part": partsMaterial,
            "8x7_Roll_Up_Door_Frame": secondaryMaterial,
            "8x7_Roll_Up_Door_Handle": partsMaterial,
            "8x7_Roll_Up_Door_Metal_Part": metalMaterial,
            "8x7_Roll_Up_Door_Threshold": thresholdMaterial,
            "8x8_Overhead_Garage_Door": whiteMaterial,
            "8x8_Overhead_Garage_Door_Frame": secondaryMaterial,
            "8x8_Overhead_Garage_Door_Handle": partsMaterial,
            "8x8_Overhead_Garage_Door_Threshold": thresholdMaterial,
            "8x8_Overhead_Garage_Door_Wall_Part": mainMaterial,
            "8x8_Overhead_Garage_Door_Wall_Part_Corner": mainMaterial,
            "9x7_Overhead_Garage_Door": whiteMaterial,
            "9x7_Overhead_Garage_Door_Frame": secondaryMaterial,
            "9x7_Overhead_Garage_Door_Handle": partsMaterial,
            "9x7_Overhead_Garage_Door_Threshold": thresholdMaterial,
            "9x7_Overhead_Garage_Door_Wall_Part": mainMaterial,
            "9x7_Overhead_Garage_Door_Wall_Part_Corner": mainMaterial,
            "9x8_Overhead_Garage_Door": whiteMaterial,
            "9x8_Overhead_Garage_Door_Frame": secondaryMaterial,
            "9x8_Overhead_Garage_Door_Handle": partsMaterial,
            "9x8_Overhead_Garage_Door_Threshold": thresholdMaterial,
            "9x8_Overhead_Garage_Door_Wall_Part": mainMaterial,
            "9x8_Overhead_Garage_Door_Wall_Part_Corner": mainMaterial,
            "9x8_Roll_Up_Door": metalMaterial,
            "9x8_Roll_Up_Door_Black_Part": partsMaterial,
            "9x8_Roll_Up_Door_Frame": secondaryMaterial,
            "9x8_Roll_Up_Door_Handle": partsMaterial,
            "9x8_Roll_Up_Door_Metal_Part": metalMaterial,
            "9x8_Roll_Up_Door_Threshold": thresholdMaterial,
            "10x7_Overhead_Garage_Door": whiteMaterial,
            "10x7_Overhead_Garage_Door_Frame": secondaryMaterial,
            "10x7_Overhead_Garage_Door_Handle": partsMaterial,
            "10x7_Overhead_Garage_Door_Threshold": thresholdMaterial,
            "10x7_Overhead_Garage_Door_Wall_Part": mainMaterial,
            "10x7_Overhead_Garage_Door_Wall_Part_Corner": mainMaterial,
            "10x8_Overhead_Garage_Door": whiteMaterial,
            "10x8_Overhead_Garage_Door_Frame": secondaryMaterial,
            "10x8_Overhead_Garage_Door_Handle": partsMaterial,
            "10x8_Overhead_Garage_Door_Threshold": thresholdMaterial,
            "10x8_Overhead_Garage_Door_Wall_Part": mainMaterial,
            "10x8_Overhead_Garage_Door_Wall_Part_Corner": mainMaterial,
            "10x8_Roll_Up_Door": metalMaterial,
            "10x8_Roll_Up_Door_Black_Part": partsMaterial,
            "10x8_Roll_Up_Door_Frame": secondaryMaterial,
            "10x8_Roll_Up_Door_Handle": partsMaterial,
            "10x8_Roll_Up_Door_Metal_Part": metalMaterial,
            "10x8_Roll_Up_Door_Threshold": thresholdMaterial,
            "8x7_Overhead_Garage_Door_With_Windows": whiteMaterial,
            "8x8_Overhead_Garage_Door_With_Windows": whiteMaterial,
            "9x7_Overhead_Garage_Door_With_Windows": whiteMaterial,
            "9x8_Overhead_Garage_Door_With_Windows": whiteMaterial,
            "10x7_Overhead_Garage_Door_With_Windows": whiteMaterial,
            "10x8_Overhead_Garage_Door_With_Windows": whiteMaterial,
            "8x7_Overhead_Garage_Door_Windows": glassMaterial,
            "8x8_Overhead_Garage_Door_Windows": glassMaterial,
            "9x7_Overhead_Garage_Door_Windows": glassMaterial,
            "9x8_Overhead_Garage_Door_Windows": glassMaterial,
            "10x7_Overhead_Garage_Door_Windows": glassMaterial,
            "10x8_Overhead_Garage_Door_Windows": glassMaterial,
        };

        addDoorVariations(materialMap);

        if (!doorTypes[type]) {
            throw(new Error("There is no model fond - " + type));
        }

        let orientation_ = doorOrientations[type];
        let planModel = generatePlanModel();
        let reversedPlanModel = generatePlanModel(true);
        super({
            models: doorTypes[type].models,
            secondaryColorModels: doorTypes[type].secondaryColorModels,
            mainColorModels: doorTypes[type].mainColorModels,
            materialMap: materialMap,
            planModel,
            reversedPlanModel
        });
        let self = this;

        let superSetColor = this.setColor;

        let currentWall_ = null;
        let top_;
        let topMaterial = tools.PAINT_MATERIAL;
        let topWidth = 0;
        let topHeight = 0;

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

        /**
         * Restores the wall that was removed
         */
        this.restoreWalls = ()=> {
            if (currentWall_ && isWallRemoved_) {
                currentWall_.geometry.clip.pop();
                isWallRemoved_ = false;
            }
        };

        /**
         * Sets the color of the object. Generates wooden texture with the right color, assigns bump to material
         * @param mainColor Main shed's color
         * @param secondaryColor Secondary Shed's color
         */
        this.setColor = (mainColor, secondaryColor)=> {
            superSetColor(mainColor, secondaryColor);

            let textureGenerator = new TextureGenerator();
            return textureGenerator.getWall(mainColor).then((texture)=> {
                let bump = textureLoader.load(assets.img["tiles_b"]);

                texture.wrapS = texture.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

                texture.repeat.x = bump.repeat.x = topWidth / WALL_MAP_WIDTH;
                texture.repeat.y = bump.repeat.y = topHeight / shedHeight;

                let angle = tools.getAngleByRotation(self.rotation);
                texture.offset.x = bump.offset.x = ((Math.abs(angle) == Math.PI * 0.5) ? self.z : self.x) - topWidth * 0.5;
                topMaterial.map = texture;
                topMaterial.bumpMap = bump;
                topMaterial.needsUpdate = true;
            });
        };

        Object.defineProperties(this, {
            planBox: {
                get: ()=> {
                    return planBoxes[type];
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
            z: {
                get: ()=> {
                    return self.position.z
                },
                set: (value)=> {
                    self.position.z = value;

                    if (currentWall_) {
                        if (isWallRemoved_) {
                            currentWall_.geometry.clip.pop();
                        }
                        let angle = tools.getAngleByRotation(self.rotation);
                        let angleMap = {};

                        let worldPosition = currentWall_.position.clone().setFromMatrixPosition(currentWall_.matrixWorld);
                        let wallPosition = (Math.abs(angle) == Math.PI * 0.5) ? worldPosition.z : worldPosition.x;

                        angleMap[0] = ()=> {
                            currentWall_.geometry.clip
                                .push(-wallPosition + self.position.x + cutBoxes[type].min.x,
                                    -wallPosition + self.position.x + cutBoxes[type].max.x);
                        };
                        angleMap[Math.PI * 0.5] = ()=> {
                            currentWall_.geometry.clip
                                .push(wallPosition - self.position.z + cutBoxes[type].min.x,
                                    wallPosition - self.position.z + cutBoxes[type].max.x);
                        };
                        angleMap[Math.PI] = ()=> {
                            currentWall_.geometry.clip
                                .push(wallPosition - self.position.x + cutBoxes[type].min.x,
                                    wallPosition - self.position.x + cutBoxes[type].max.x);
                        };
                        angleMap[-Math.PI * 0.5] = ()=> {
                            currentWall_.geometry.clip
                                .push(-wallPosition + self.position.z + cutBoxes[type].min.x,
                                    -wallPosition + self.position.z + cutBoxes[type].max.x);
                        };

                        angleMap[angle]();
                        isWallRemoved_ = true;
                    }
                }
            },
            /**
             * The wall of the shed/deck on which the door is placed
             */
            currentWall: {
                get: ()=> {
                    return currentWall_;
                },
                set: (value)=> {
                    if (currentWall_ && isWallRemoved_) {
                        currentWall_.geometry.clip.pop();
                        isWallRemoved_ = false;
                    }

                    currentWall_ = value;

                    if (top_) {
                        self.remove(top_);
                    }

                    shedHeight = currentWall_.geometry.height;

                    //adding the wall on top
                    let doorHeight = (cutBoxes[type].max.y - cutBoxes[type].min.y);
                    topWidth = cutBoxes[type].max.x - cutBoxes[type].min.x;
                    topHeight = shedHeight - doorHeight;
                    top_ = new THREE.Mesh(new THREE.PlaneGeometry(topWidth, topHeight), topMaterial);
                    top_.receiveShadow = true;
                    top_.position.y = doorHeight + topHeight * 0.5;
                    top_.castShadow = top.receiveShadow = true;
                    self.add(top_);

                }
            },
            boundingBox: {
                get: ()=> {
                    let boxClone = bboxes[type].clone();
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

            let whiteBG = new THREE.Mesh(new THREE.PlaneGeometry(width, width * (isDouble ? 0.5 : 1) + THICKNESS),
                new THREE.MeshPhongMaterial({color: 0xffffff, transparent: true, opacity: 0}));
            whiteBG.rotateX(-Math.PI * 0.5);
            whiteBG.position.y = 0;
            whiteBG.position.z = -(width * (isDouble ? 0.5 : 1) + THICKNESS) * 0.5;
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


module.exports = DeepDoor;
