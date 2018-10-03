const THREE = require('three');
const _ = require('lodash');
const Door = require('./../objects/Door');
const DeepDoor = require('./../objects/DeepDoor');
const Window = require('./../objects/Window');
const Deck = require('./../objects/Deck');
const WrapAround = require('./../objects/WrapAround');
const HorseStall = require('./../objects/HorseStall');
const Loft = require('./../objects/Loft');
const Skylight = require('./../objects/Skylight');
const Truss = require('./Truss');
const BarnRoof = require('./roofs/BarnRoof');
const ShackRoof = require('./roofs/ShackRoof');
const LeanToRoof = require('./roofs/LeanToRoof');
const ARoof = require('./roofs/ARoof');
const QuakerRoof = require('./roofs/QuakerRoof');
const SingleSlopeRoof = require('./roofs/SingleSlopeRoof');
const MiniBarnRoof = require('./roofs/MiniBarnRoof');
const BarnRoofBorder = require('./roofs/parts/BarnRoofBorder');
const ShackRoofBorder = require('./roofs/parts/ShackRoofBorder');
const LeanToRoofBorder = require('./roofs/parts/LeanToRoofBorder');
const ARoofBorder = require('./roofs/parts/ARoofBorder');
const QuakerRoofBorder = require('./roofs/parts/QuakerRoofBorder');
const SingleSlopeRoofBorder = require('./roofs/parts/SingleSlopeRoofBorder');
const tools = require('./../helpers/tools');
const TextureGenerator = require('./../helpers/TextureGenerator');
const GridObject = require('./../helpers/GridObject');
const Grid = require('./../helpers/Grid');
const Vent = require('./../objects/Vent');
const colors = require('./../helpers/colors');
const ClipGeometry = require('./../helpers/ClipGeometry');
const Floor = require('./Floor');
const Plan = require('./../helpers/Plan');
const assets = require('../helpers/assets');

/**
 * Shed 3D object, contains other objects like roof, roof border, doors and windows
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Shed extends THREE.Object3D {
    /**
     * Creates shed 3D object
     * @param environmentCamera CubeCamera for reflections
     * @param generatedCallback Called, when the shed is generated and ready to use
     * @param features filter of available features. Shed styles and doors/windows objects are here
     */
    constructor(environmentCamera, generatedCallback, features) {
        super();

        this.setSize = setSize;
        this.setColor = setColor;
        this.placeRail = placeRail;
        this.placeShutters = placeShutters;
        this.placeFlowerBox = placeFlowerBox;
        this.dropRail = dropRail;
        this.dropShutters = dropShutters;
        this.dropFlowerBox = dropFlowerBox;
        this.cancelRail = cancelRail;
        this.cancelShutters = cancelShutters;
        this.cancelFlowerBox = cancelFlowerBox;
        this.enableRailGrid = enableRailGrid;
        this.enableWindowGrid = enableWindowGrid;

        let self = this;
        const WALL_MAP_WIDTH = tools.ft2cm(4);
        const STEP_SIZE = tools.in2cm(6);

        let width_ = tools.ft2cm(12);
        let depth_ = tools.ft2cm(10);
        let height_ = tools.ft2cm(8);
        let roofHeight_;
        let halfWidth_ = width_ * 0.5;
        let halfDepth_ = depth_ * 0.5;
        let mainColor_ = '#b5001a';
        let secondaryColor_ = '#ffffff';
        let style_ = tools.URBAN_BARN;

        let objects_ = [];
        let windows_ = [];
        let doors_ = [];
        let decks_ = [];
        let deepDoors_ = [];
        let lofts_ = [];
        let skylights_ = [];
        let windowsAreVisible_ = true, doorsAreVisible_ = true, flowerBoxesAreVisible_ = false, shuttersAreVisible_ = false;

        let widthMesh1, widthMesh2, depthMesh1, depthMesh2;
        let top1, top2;
        let roofBorder2_, roofBorder1_, truss1_, truss2_;
        let rails_, columns_, roof_, vent1_, vent2_, vent3_, vent4_, roofContainer_;
        let plan_;
        let floor_;

        let boxGrid_, wallGrid_, topGrid_, railGrid_, windowGrid_, roofGrid_, windowWalls_, windowWallMap_;
        let currentDrag_;
        let dragObjects_ = {};
        let maxDragX_;
        let maxDragZ_;

        let lastPlacedRail_, lastFlowerBox_, lastShutters_;

        let inPlanResize_ = false;

        const FLOOR_HEIGHT = tools.in2cm(7);

        let realWallMap_ = {};
        let lastMovedIsDeck_ = false;

        let moveObjectLastPosition_ = {};

        if (features) {
            features.doors = features.doors || {};
            features.windows = features.windows || {};
            features.roofs = features.roofs || {};
            features['2d'] = features['2d'] || {};

            _.each(['doors', 'windows', 'roofs', '2d'], (category)=> {
                if (features[category].length) {
                    features[category] = _.zipObject(features[category], _.times(features[category].length, ()=>1));
                }
            });
        }

        if (!features) {
            features = {doors: {}, windows: {}, roofs: {}};
            let defaultDoorsList = [
                "3' shed door", "3' shed door (w-transom)", "4' dutch shed door", "4' shed door",
                "4' shed door (w-transom)", "double dutch shed door", "double shed door",
                "double shed door (w-transom)", "econ door", "3' shed door lh", "3' shed door (w-transom) lh",
                "4' dutch shed door lh", "4' shed door lh", "4' shed door (w-transom) lh", "double dutch shed door lh",
                "double shed door lh", "double shed door (w-transom) lh", "econ door lh", "3' shed door rh",
                "3' shed door (w-transom) rh", "4' dutch shed door rh", "4' shed door rh",
                "4' shed door (w-transom) rh", "double dutch shed door rh", "double shed door rh",
                "double shed door (w-transom) rh", "econ door rh", "6'x7' roll up door", "8'x8' roll up door",
                "9'x7' roll up door", "15 light french doors", "steel 9' light walk-in door",
                "short steel 9' light walk-in door", "short steel 9' light walk-in door lh",
                "short steel 9' light walk-in door rh", "steel french doors", "steel french doors lh",
                "steel french doors rh", "steel walk-in door", "steel walk-in door lh", "steel walk-in door rh",
                "short steel walk-in door", "short steel walk-in door lh", "short steel walk-in door rh"
            ];
            let defaultWindowsList = [
                "1'x1' loft window", "2'x3' single pane window", "3'x3' single pane window", "29 transom window",
                "60 transom window", "1'x1' loft gable window", "29 transom gable window", "60 transom gable window",
                "14'x21' aluminum single pane window", "18'x27' aluminum single pane window",
                "18'x36' aluminum single pane window", "23'x10' transom window with grids",
                "24'x24' vinyl double pane window (without-grids)", "24'x24' vinyl double pane window with grids",
                "24'x27' aluminum single pane window", "24'x36' aluminum single pane window",
                "24'x36' vinyl double pane window (without-grids)", "24'x36' vinyl double pane window with grids",
                "29'x10' transom window with grids", "30'x40' vinyl double pane window (without-grids)",
                "30'x40' vinyl double pane window with grids", "36'x48' vinyl double pane window (without-grids)",
                "36'x48' vinyl double pane window with grids", "60'x10' transom window with grids",
                "72'x10' transom window with grids"
            ];
            let defaultRoofList = ["Heritage Rustic Black", "Heritage Black Walnut", "Heritage Rustic Cedar",
                "Heritage Mountain Slate", "Vintage White", "Rustic Red", "Gray", "Evergreen", "Desert Sand",
                "Coal Black", "Galvalume"];

            features.loft = 1;
            features.skylight = 1;
            _.each(defaultDoorsList, (defaultDoor)=> {
                features.doors[defaultDoor] = 1;
            });
            _.each(defaultWindowsList, (defaultWindow)=> {
                features.windows[defaultWindow] = 1;
            });
            _.each(defaultRoofList, (defaultRoof)=> {
                features.windows[defaultRoof] = 1;
            });

            features['2d'] = {
                "atv": 1,
                "bed": 1,
                "bike": 1,
                "computer_table": 1,
                "croquet": 1,
                "kf-04": 1,
                "lawn_mower": 1,
                "lazyboy": 1,
                "office_desk": 1,
                "ping_pong": 1,
                "sofa1": 1,
                "sofa2": 1,
                "toolbox": 1,
                "tv": 1,
                "wagon": 1,
                "wheel_barrow": 1,
                "work_bench": 1
            };
        }

        const dragObjectClasses_ = {
            "1'x1' loft window": features.windows["1'x1' loft window"] ? Window : null,
            "2'x3' single pane window": features.windows["2'x3' single pane window"] ? Window : null,
            "3'x3' single pane window": features.windows["3'x3' single pane window"] ? Window : null,
            "29 transom window": features.windows["29 transom window"] ? Window : null,
            "60 transom window": features.windows["60 transom window"] ? Window : null,
            "1'x1' loft gable window": features.windows["1'x1' loft gable window"] ? Window : null,
            "29 transom gable window": features.windows["29 transom gable window"] ? Window : null,
            "60 transom gable window": features.windows["60 transom gable window"] ? Window : null,
            "3' shed door": features.doors["3' shed door"] ? Door : null,
            "3' shed door (w-transom)": features.doors["3' shed door (w-transom)"] ? Door : null,
            "4' dutch shed door": features.doors["4' dutch shed door"] ? Door : null,
            "4' shed door": features.doors["4' shed door"] ? Door : null,
            "4' shed door (w-transom)": features.doors["4' shed door (w-transom)"] ? Door : null,
            "double dutch shed door": features.doors["double dutch shed door"] ? Door : null,
            "double shed door": features.doors["double shed door"] ? Door : null,
            "double shed door (w-transom)": features.doors["double shed door (w-transom)"] ? Door : null,
            "econ door": features.doors["econ door"] ? Door : null,
            "3' shed door lh": features.doors["3' shed door lh"] ? Door : null,
            "3' shed door (w-transom) lh": features.doors["3' shed door (w-transom) lh"] ? Door : null,
            "4' dutch shed door lh": features.doors["4' dutch shed door lh"] ? Door : null,
            "4' shed door lh": features.doors["4' shed door lh"] ? Door : null,
            "4' shed door (w-transom) lh": features.doors["4' shed door (w-transom) lh"] ? Door : null,
            "double dutch shed door lh": features.doors["double dutch shed door lh"] ? Door : null,
            "double shed door lh": features.doors["double shed door lh"] ? Door : null,
            "double shed door (w-transom) lh": features.doors["double shed door (w-transom) lh"] ? Door : null,
            "econ door lh": features.doors["econ door lh"] ? Door : null,
            "3' shed door rh": features.doors["3' shed door rh"] ? Door : null,
            "3' shed door (w-transom) rh": features.doors["3' shed door (w-transom) rh"] ? Door : null,
            "4' dutch shed door rh": features.doors["4' dutch shed door rh"] ? Door : null,
            "4' shed door rh": features.doors["4' shed door rh"] ? Door : null,
            "4' shed door (w-transom) rh": features.doors["4' shed door (w-transom) rh"] ? Door : null,
            "double dutch shed door rh": features.doors["double dutch shed door rh"] ? Door : null,
            "double shed door rh": features.doors["double shed door rh"] ? Door : null,
            "double shed door (w-transom) rh": features.doors["double shed door (w-transom) rh"] ? Door : null,
            "econ door rh": features.doors["econ door rh"] ? Door : null,
            "loft": features["loft"] ? Loft : null,
            "skylight": features["skylight"] ? Skylight : null,
            "5'x6' double wood door": features.doors["5'x6' double wood door"] ? Door : null,
            "5'x7' double wood door": features.doors["5'x7' double wood door"] ? Door : null,
            "6'x6' double wood door": features.doors["6'x6' double wood door"] ? Door : null,
            "6'x7' double wood door": features.doors["6'x7' double wood door"] ? Door : null,
            "7'x6' double wood door": features.doors["7'x6' double wood door"] ? Door : null,
            "7'x7' double wood door": features.doors["7'x7' double wood door"] ? Door : null,
            "8'x6' double wood door": features.doors["8'x6' double wood door"] ? Door : null,
            "8'x7' double wood door": features.doors["8'x7' double wood door"] ? Door : null,
            "9'x6' double wood door": features.doors["9'x6' double wood door"] ? Door : null,
            'single wood door 36"x72"': features.doors['single wood door 36"x72"'] ? Door : null,
            'single wood door 42"x72"': features.doors['single wood door 42"x72"'] ? Door : null,
            '42 single wood door (arch-top-trim)': features.doors['42 single wood door (arch-top-trim)'] ? Door : null,
            "5'x6' double wood door lh": features.doors["5'x6' double wood door lh"] ? Door : null,
            "5'x7' double wood door lh": features.doors["5'x7' double wood door lh"] ? Door : null,
            "6'x6' double wood door lh": features.doors["6'x6' double wood door lh"] ? Door : null,
            "6'x7' double wood door lh": features.doors["6'x7' double wood door lh"] ? Door : null,
            "7'x6' double wood door lh": features.doors["7'x6' double wood door lh"] ? Door : null,
            "7'x7' double wood door lh": features.doors["7'x7' double wood door lh"] ? Door : null,
            "8'x6' double wood door lh": features.doors["8'x6' double wood door lh"] ? Door : null,
            "8'x7' double wood door lh": features.doors["8'x7' double wood door lh"] ? Door : null,
            "9'x6' double wood door lh": features.doors["9'x6' double wood door lh"] ? Door : null,
            'single wood door 36"x72" lh': features.doors['single wood door 36"x72" lh'] ? Door : null,
            'single wood door 42"x72" lh': features.doors['single wood door 42"x72" lh'] ? Door : null,
            '42 single wood door (arch-top-trim) lh': features.doors['42 single wood door (arch-top-trim) lh'] ? Door : null,
            "5'x6' double wood door rh": features.doors["5'x6' double wood door rh"] ? Door : null,
            "5'x7' double wood door rh": features.doors["5'x7' double wood door rh"] ? Door : null,
            "6'x6' double wood door rh": features.doors["6'x6' double wood door rh"] ? Door : null,
            "6'x7' double wood door rh": features.doors["6'x7' double wood door rh"] ? Door : null,
            "7'x6' double wood door rh": features.doors["7'x6' double wood door rh"] ? Door : null,
            "7'x7' double wood door rh": features.doors["7'x7' double wood door rh"] ? Door : null,
            "8'x6' double wood door rh": features.doors["8'x6' double wood door rh"] ? Door : null,
            "8'x7' double wood door rh": features.doors["8'x7' double wood door rh"] ? Door : null,
            "9'x6' double wood door rh": features.doors["9'x6' double wood door rh"] ? Door : null,
            'single wood door 36"x72" rh': features.doors['single wood door 36"x72" rh'] ? Door : null,
            'single wood door 42"x72" rh': features.doors['single wood door 42"x72" rh'] ? Door : null,
            '42 single wood door (arch-top-trim) rh': features.doors['42 single wood door (arch-top-trim) rh'] ? Door : null,
            "14'x21' aluminum single pane window": features.windows["14'x21' aluminum single pane window"] ? Window : null,
            "18'x27' aluminum single pane window": features.windows["18'x27' aluminum single pane window"] ? Window : null,
            "18'x36' aluminum single pane window": features.windows["18'x36' aluminum single pane window"] ? Window : null,
            "23'x10' transom window with grids": features.windows["23'x10' transom window with grids"] ? Window : null,
            "24'x24' vinyl double pane window (without-grids)": features.windows["24'x24' vinyl double pane window (without-grids)"] ? Window : null,
            "24'x24' vinyl double pane window with grids": features.windows["24'x24' vinyl double pane window with grids"] ? Window : null,
            "24'x27' aluminum single pane window": features.windows["24'x27' aluminum single pane window"] ? Window : null,
            "24'x36' aluminum single pane window": features.windows["24'x36' aluminum single pane window"] ? Window : null,
            "24'x36' vinyl double pane window (without-grids)": features.windows["24'x36' vinyl double pane window (without-grids)"] ? Window : null,
            "24'x36' vinyl double pane window with grids": features.windows["24'x36' vinyl double pane window with grids"] ? Window : null,
            "29'x10' transom window with grids": features.windows["29'x10' transom window with grids"] ? Window : null,
            "30'x40' vinyl double pane window (without-grids)": features.windows["30'x40' vinyl double pane window (without-grids)"] ? Window : null,
            "30'x40' vinyl double pane window with grids": features.windows["30'x40' vinyl double pane window with grids"] ? Window : null,
            "36'x48' vinyl double pane window (without-grids)": features.windows["36'x48' vinyl double pane window (without-grids)"] ? Window : null,
            "36'x48' vinyl double pane window with grids": features.windows["36'x48' vinyl double pane window with grids"] ? Window : null,
            "60'x10' transom window with grids": features.windows["60'x10' transom window with grids"] ? Window : null,
            "72'x10' transom window with grids": features.windows["72'x10' transom window with grids"] ? Window : null,
        };

        let deepIDs_ = [];

        _.each(["6'x7' roll up door", "8'x8' roll up door", "9'x7' roll up door", "15 light french doors",
            "steel 9' light walk-in door", "short steel 9' light walk-in door", "steel french doors",
            "steel walk-in door", "short steel walk-in door", "3' steel entry door with half glass",
            "3' steel entry door (lh-out)", "3' steel entry door half glass with grids (lh-out)", "3' steel entry door with half glass (lh-out)",
            "3' steel entry door", "3' steel entry door with grid half glass",
            "8'x7' overhead garage door", "8'x8' overhead garage door", "9'x7' overhead garage door",
            "9'x8' overhead garage door", "10'x7' overhead garage door", "10'x8' overhead garage door",
            "5'x7' roll up door", "6'x6' roll up door", "7'x7' roll up door",
            "8'x7' roll up door", "9'x8' roll up door", "10'x8' roll up door",
            "8'x7' overhead garage door with windows", "8'x8' overhead garage door with windows",
            "9'x7' overhead garage door with windows", "9'x8' overhead garage door with windows",
            "10'x7' overhead garage door with windows", "10'x8' overhead garage door with windows"
        ], (deepOption)=> {
            if (features.doors[deepOption]) {
                deepIDs_.push(deepOption);
            }
        });

        _.each(deepIDs_, (id)=> {
            deepIDs_.push(id + " lh");
            deepIDs_.push(id + " rh");
        });

        /**
         * Generates shed, using gived width,depth and height
         * @param width Width of the shed
         * @param depth Depth of the shed
         * @param height Wall height of the shed
         * @param noEvent Shows if "ready" event should not be fired
         * @param style Shed's style
         */
        function generateShed(width, depth, height, noEvent = false, style = tools.URBAN_BARN) {
            objects_ = [];
            doors_ = [];
            lofts_ = [];
            skylights_ = [];
            deepDoors_ = [];
            windows_ = [];
            decks_ = [];

            width_ = width;
            depth_ = depth;
            height_ = height;
            halfWidth_ = width * 0.5;
            halfDepth_ = depth * 0.5;
            style_ = style;

            for (var i = self.children.length - 1; i >= 0; i--) {
                self.remove(self.children[i]);
            }

            //  Generating shed's walls
            let widthObj = new THREE.Object3D();
            widthObj.receiveShadow = true;


            if (style == tools.LEAN_TO) {
                let topVertices = [
                    -width * 0.5, 0, 0,//0
                    width * 0.5, -width * 2.5 / 12, 0,//1
                    -width * 0.5, -width * 2.5 / 12, 0,//2
                ];

                let topIndices = [0, 2, 1];
                let topUvs = [0, 0, 1, 1, 0, 1];

                let topGeometry = new THREE.BufferGeometry();
                topGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(topVertices), 3));
                topGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(topUvs), 2));
                topGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(topIndices), 1));
                topGeometry.computeVertexNormals();

                top1 = new THREE.Mesh(topGeometry, tools.PAINT_MATERIAL);

                top1.position.setY(FLOOR_HEIGHT + height);
                top1.position.setZ(depth * 0.5);
                self.add(top1);


                topIndices = [0, 1, 2];
                topUvs = [0, 0, 1, 1, 0, 1];

                topGeometry = new THREE.BufferGeometry();
                topGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(topVertices), 3));
                topGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(topUvs), 2));
                topGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(topIndices), 1));
                topGeometry.computeVertexNormals();

                top2 = new THREE.Mesh(topGeometry, tools.PAINT_MATERIAL);

                top2.position.setY(FLOOR_HEIGHT + height);
                top2.position.setZ(-depth * 0.5);
                self.add(top2);

                top1.receiveShadow = top2.receiveShadow = top1.castShadow = top2.castShadow = true;
            }

            let widthGeometryWidth = {
                6: {x: 54.054, y: 9.043, h: 37.5},
                8: {x: 78, y: 13.049, h: 41.5},
                10: {x: 102.182, y: 17.095, h: 45.5},
                12: {x: 125.416, y: 20.982, h: 49.5}
            };

            let widthGeometry1 = new ClipGeometry(new THREE.PlaneGeometry(width, height));
            if (style == tools.LEAN_TO) {
                widthGeometry1 = new ClipGeometry(new THREE.PlaneGeometry(width, height - width * 2.5 / 12));
            } else if (style == tools.MINI_BARN) {
                let planeWidth = tools.ft2cm(widthGeometryWidth[12].x);
                roofHeight_ = tools.in2cm(widthGeometryWidth[12].h);
                try {
                    _.forOwn(widthGeometryWidth, (value, w)=> {
                        if (tools.ft2cm(w) >= width) {
                            planeWidth = tools.in2cm(value.x);
                            roofHeight_ = tools.in2cm(value.h);
                            throw new Error();
                        }
                    });
                } catch (e) {
                }

                widthGeometry1 = new ClipGeometry(new THREE.PlaneGeometry(planeWidth, tools.in2cm(28.45) + height - roofHeight_));
            }

            let widthGeometry2 = widthGeometry1.clone();

            widthMesh1 = new THREE.Mesh(widthGeometry1, tools.PAINT_MATERIAL);

            widthMesh1.position.setZ(depth / 2);
            widthMesh1.castShadow = true;
            widthMesh1.receiveShadow = true;
            widthObj.add(widthMesh1);

            widthMesh2 = new THREE.Mesh(widthGeometry2, tools.PAINT_MATERIAL);
            widthMesh2.castShadow = true;
            widthMesh2.receiveShadow = true;
            widthMesh2.position.setZ(-depth / 2);
            widthMesh2.rotateY(Math.PI);
            widthObj.add(widthMesh2);

            if (style == tools.LEAN_TO) {
                widthObj.position.y = FLOOR_HEIGHT + height / 2 - width * 2.5 / 24;
            } else if (style == tools.MINI_BARN) {
                widthObj.position.y = FLOOR_HEIGHT + (tools.in2cm(28.45) + height - roofHeight_) / 2
            } else {
                widthObj.position.y = FLOOR_HEIGHT + height / 2;
            }
            self.add(widthObj);

            let depthObj = new THREE.Object3D();
            let leftHeight = height;
            let rightHeight = height;
            if (style == tools.LEAN_TO) {
                leftHeight -= width * 2.5 / 12;
            } else if (style == tools.SINGLE_SLOPE) {
                rightHeight += width * 0.25;
            } else if (style == tools.MINI_BARN) {
                leftHeight = rightHeight = height - roofHeight_;
            }
            depthMesh1 = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(depth, leftHeight)), tools.PAINT_MATERIAL);
            depthMesh1.castShadow = true;
            depthMesh1.receiveShadow = true;
            depthMesh1.position.setX(width / 2);
            if (style == tools.LEAN_TO) {
                depthMesh1.position.y -= width * 2.5 / 12 * 0.5;
            } else if (style == tools.SINGLE_SLOPE) {
                depthMesh1.position.y -= width * 0.25 * 0.5;
            }
            depthMesh1.rotateY(Math.PI / 2);
            depthObj.add(depthMesh1);

            depthMesh2 = new THREE.Mesh(new ClipGeometry(new THREE.PlaneGeometry(depth, rightHeight)), tools.PAINT_MATERIAL);
            depthMesh2.castShadow = true;
            depthMesh2.receiveShadow = true;
            depthMesh2.position.setX(-width / 2);
            depthMesh2.rotateY(-Math.PI / 2);
            depthObj.add(depthMesh2);

            self.add(depthObj);
            depthObj.position.setY(FLOOR_HEIGHT + rightHeight / 2);

            plan_ = new Plan(width, depth, features);
            plan_.position.y = tools.planY;
            self.add(plan_);

            plan_.drawElements([widthMesh1, widthMesh2, depthMesh1, depthMesh2]);
            plan_.drawMeasurements([widthMesh1, widthMesh2, depthMesh1, depthMesh2]);

            const generator = {};

            generator[tools.URBAN_BARN] = {
                generateRoofHeight: ()=> {
                    return tools.ft2cm(3.875);
                },
                roofConstructor: () => new BarnRoof(width, depth, roofHeight_),
                border1Constructor: (roofVertices) => new BarnRoofBorder(roofVertices, width, depth, roofHeight_),
                border2Constructor: (roofVertices) => new BarnRoofBorder(roofVertices, width, depth, roofHeight_)
            };
            generator[tools.URBAN_SHACK] = {
                generateRoofHeight: ()=> {
                    return width_ / 24 * 5;
                },
                roofConstructor: () => new ShackRoof(width, depth, roofHeight_),
                border1Constructor: (roofVertices) => new ShackRoofBorder(roofVertices, width, depth, roofHeight_),
                border2Constructor: (roofVertices) => new ShackRoofBorder(roofVertices, width, depth, roofHeight_)
            };
            generator[tools.LEAN_TO] = {
                generateRoofHeight: ()=> {
                    return 0;
                },
                roofConstructor: () => new LeanToRoof(width, depth, roofHeight_),
                border1Constructor: (roofVertices) => new LeanToRoofBorder(roofVertices, width, depth, roofHeight_),
                border2Constructor: (roofVertices) => null
            };
            generator[tools.A_FRAME] = {
                generateRoofHeight: ()=> {
                    return (width_ + tools.in2cm(9)) / 24 * 5;
                },
                roofConstructor: () => new ARoof(width, depth, roofHeight_),
                border1Constructor: (roofVertices) => new ARoofBorder(roofVertices, width, depth, roofHeight_),
                border2Constructor: (roofVertices) => new ARoofBorder(roofVertices, width, depth, roofHeight_)
            };
            generator[tools.DOUBLE_WIDE] = {
                generateRoofHeight: ()=> {
                    return (width_ + tools.in2cm(11)) / 24 * 4;
                },
                roofConstructor: () => new ARoof(width, depth, roofHeight_, tools.in2cm(5.5), tools.in2cm(5.1875)),
                border1Constructor: (roofVertices) => new ARoofBorder(roofVertices, width, depth, roofHeight_,
                    tools.in2cm(5.5), tools.in2cm(5.1875)),
                border2Constructor: (roofVertices) => new ARoofBorder(roofVertices, width, depth, roofHeight_,
                    tools.in2cm(5.5), tools.in2cm(5.1875))
            };
            generator[tools.ECO] = {
                generateRoofHeight: ()=> {
                    return width_ / 24 * 4;
                },
                roofConstructor: () => new ShackRoof(width, depth, roofHeight_, 0, 5, false),
                border1Constructor: (roofVertices) => null,
                border2Constructor: (roofVertices) => null
            };
            generator[tools.CASTLE_MOUNTAIN] = {
                generateRoofHeight: ()=> {
                    return (width_ + tools.in2cm(9)) / 24 * 7;
                },
                roofConstructor: () => new ARoof(width, depth, roofHeight_, undefined, undefined, undefined,
                    tools.in2cm(6.5)),
                border1Constructor: (roofVertices) => new ARoofBorder(roofVertices, width, depth, roofHeight_),
                border2Constructor: (roofVertices) => new ARoofBorder(roofVertices, width, depth, roofHeight_)
            };
            generator[tools.QUAKER] = {
                generateRoofHeight: ()=> {
                    const heights = {6: 24, 8: 28.75, 10: 33.75, 12: 38.25, 14: 43.25};
                    let sizes = _.keys(heights);
                    for (let i = 0, n = sizes.length; i < n; i++) {
                        if (tools.ft2cm(sizes[i]) >= width_) {
                            return tools.in2cm(heights[sizes[i]]);
                        }
                    }

                    return tools.in2cm(heights[14]);
                },
                roofConstructor: () => new QuakerRoof(width, depth, roofHeight_),
                border1Constructor: (roofVertices) => new QuakerRoofBorder(roofVertices, width, depth, roofHeight_),
                border2Constructor: (roofVertices) => new QuakerRoofBorder(roofVertices, width, depth, roofHeight_,
                    true)
            };
            generator[tools.MINI_BARN] = {
                generateRoofHeight: ()=> {
                    let heights = {6: 37.5, 8: 41.5, 10: 45.5, 12: 49.5};

                    let sizes = _.keys(heights);
                    for (let i = 0, n = sizes.length; i < n; i++) {
                        if (tools.ft2cm(sizes[i]) >= width_) {
                            return tools.in2cm(heights[sizes[i]]);
                        }
                    }

                    return tools.in2cm(heights[12]);
                },
                roofConstructor: () => new MiniBarnRoof(width, depth, roofHeight_),
                border1Constructor: (roofVertices) => new BarnRoofBorder(roofVertices),
                border2Constructor: (roofVertices) => new BarnRoofBorder(roofVertices)
            };
            generator[tools.HI_BARN] = {
                generateRoofHeight: ()=> {
                    let heights = {6: 37.5, 8: 41.5, 10: 45.5, 12: 49.5};

                    let sizes = _.keys(heights);
                    for (let i = 0, n = sizes.length; i < n; i++) {
                        if (tools.ft2cm(sizes[i]) >= width_) {
                            return tools.in2cm(heights[sizes[i]]);
                        }
                    }

                    return tools.in2cm(heights[12]);
                },
                roofConstructor: () => new MiniBarnRoof(width, depth, roofHeight_, false),
                border1Constructor: (roofVertices) => new BarnRoofBorder(roofVertices),
                border2Constructor: (roofVertices) => new BarnRoofBorder(roofVertices)
            };
            generator[tools.SINGLE_SLOPE] = {
                generateRoofHeight: ()=> {
                    return 0;
                },
                roofConstructor: () => new SingleSlopeRoof(width, depth, roofHeight_),
                border1Constructor: (roofVertices) => new SingleSlopeRoofBorder(roofVertices, width, depth),
                border2Constructor: (roofVertices) => new SingleSlopeRoofBorder(roofVertices, width, depth, true)
            };

            // Generating trusses
            roofHeight_ = generator[style].generateRoofHeight();

            truss1_ = new Truss(width, roofHeight_, style, false, height);
            truss1_.position.setZ(depth / 2);
            truss1_.position.setY(height + FLOOR_HEIGHT);
            self.add(truss1_);

            truss2_ = new Truss(width, roofHeight_, style, true, height);
            truss2_.position.setZ(-depth / 2);
            truss2_.position.setY(height + FLOOR_HEIGHT);

            self.add(truss2_);

            roofContainer_ = new THREE.Object3D();
            self.add(roofContainer_);

            // Generating Roof
            roof_ = generator[style].roofConstructor();
            roof_.position.setY(height + FLOOR_HEIGHT + ((style == tools.DOUBLE_WIDE || style == tools.CASTLE_MOUNTAIN) ? 0.5 : 0.1));
            roofContainer_.add(roof_);

            // Generating roof borders
            roofBorder1_ = (generator[style].border1Constructor) ?
                generator[style].border1Constructor(roof_.vertices) : null;
            if (_.includes([tools.ECO], style)) {
                roofBorder1_ = new THREE.Mesh();
                roofBorder1_.setColor = ()=> {
                };
            }

            roofBorder1_.position.setY(height + FLOOR_HEIGHT);
            roofContainer_.add(roofBorder1_);

            roofBorder2_ = (generator[style].border2Constructor) ?
                generator[style].border2Constructor(roof_.vertices) : null;
            if (_.includes([tools.LEAN_TO, tools.ECO], style)) {
                roofBorder2_ = new THREE.Mesh();
                roofBorder2_.setColor = ()=> {
                };
            }

            roofBorder2_.position.setY(height + FLOOR_HEIGHT);
            if (!_.includes([tools.QUAKER, tools.SINGLE_SLOPE], style)) {
                roofBorder2_.rotateY(Math.PI);
            }
            roofContainer_.add(roofBorder2_);

            if (_.includes([tools.URBAN_BARN, tools.URBAN_SHACK, tools.LEAN_TO], style)) {
                vent1_ = new Vent();
                let ventPosition = roof_.getPointOnRoof(
                    new THREE.Vector3(-width_ * 0.15, roof_.position.y, depth >= tools.ft2cm(20) ? halfDepth_ / 2 : 0));
                let ventAngle = roof_.getRoofAngle(ventPosition);
                vent1_.position.set(ventPosition.x, ventPosition.y, ventPosition.z);

                vent1_.rotateZ(ventAngle);
                roofContainer_.add(vent1_);

                vent3_ = new Vent(Vent.METAL);
                vent3_.position.setX(vent1_.position.x);
                vent3_.position.setY(vent1_.position.y);
                vent3_.position.setZ(vent1_.position.z);
                vent3_.rotation.fromArray(vent1_.rotation.toArray());
                roofContainer_.add(vent3_);
                vent3_.visible = false;

                if (depth >= tools.ft2cm(20)) {
                    vent2_ = new Vent();
                    vent2_.position.setX(vent1_.position.x);
                    vent2_.position.setY(vent1_.position.y);
                    vent2_.rotateZ(ventAngle);
                    vent2_.position.setZ(-halfDepth_ / 2);
                    roofContainer_.add(vent2_);

                    vent4_ = new Vent(Vent.METAL);
                    vent4_.position.setX(vent2_.position.x);
                    vent4_.position.setY(vent2_.position.y);
                    vent4_.position.setZ(vent2_.position.z);
                    vent4_.rotation.fromArray(vent2_.rotation.toArray());
                    roofContainer_.add(vent4_);
                    vent4_.visible = false;
                }
            } else {
                vent1_ = vent3_ = new Vent(Vent.GABLE_STANDARD);
                vent2_ = vent4_ = new Vent(Vent.GABLE_STANDARD);

                if (style == tools.MINI_BARN) {
                    vent1_.position.y = vent2_.position.y = FLOOR_HEIGHT + height - 85;
                } else if (style == tools.SINGLE_SLOPE) {
                    vent1_.position.y = vent2_.position.y = FLOOR_HEIGHT + height - 45;
                } else {
                    vent1_.position.y = vent2_.position.y = FLOOR_HEIGHT + height + roofHeight_ - 85;
                }
                vent1_.position.z = depth * 0.5;
                vent2_.position.z = -depth * 0.5;
                vent2_.rotation.fromArray([0, Math.PI, 0]);

                if (style == tools.QUAKER) {

                    const in4_5 = tools.in2cm(4.5);
                    const tanQ = Math.tan(0.3228859);
                    let quakerTopX = width * 0.5 - ((roofHeight_ - in4_5) / tanQ - in4_5) - 10;
                    vent1_.position.x = vent2_.position.x = quakerTopX;
                }

                roofContainer_.add(vent1_);
                roofContainer_.add(vent2_);
            }

            // Generating columns (vertical trims)
            let leftColumnGeometry = new THREE.CubeGeometry(7, leftHeight, 7);
            let rightColumnGeometry = new THREE.CubeGeometry(7, rightHeight, 7);

            columns_ = _.times(4, (idx)=> {
                let column = new THREE.Mesh((idx == 1 || idx == 2) ?
                        leftColumnGeometry : rightColumnGeometry,
                    tools.PAINT_MATERIAL);
                column.castShadow = true;
                column.receiveShadow = true;
                //column.rotateX(Math.PI / 2);
                column.position.y = ((idx == 1 || idx == 2) ? leftHeight : rightHeight) * 0.5 + FLOOR_HEIGHT;

                let columnShift = {x: 0, z: 0};

                if (_.includes([tools.A_FRAME, tools.DOUBLE_WIDE, tools.CASTLE_MOUNTAIN, tools.ECO, tools.QUAKER,
                        tools.MINI_BARN, tools.HI_BARN, tools.SINGLE_SLOPE], style)) {
                    columnShift.x -= 3;
                    columnShift.z -= 3;
                }

                switch (idx) {
                    case 0:
                        column.position.x = -width * 0.5 - columnShift.x;
                        column.position.z = depth * 0.5 + columnShift.z;
                        break;
                    case 1:
                        column.position.x = width * 0.5 + columnShift.x;
                        column.position.z = depth * 0.5 + columnShift.z;
                        break;
                    case 2:
                        column.position.x = width * 0.5 + columnShift.x;
                        column.position.z = -depth * 0.5 - columnShift.z;
                        break;
                    case 3:
                        column.position.x = -width * 0.5 - columnShift.x;
                        column.position.z = -depth * 0.5 - columnShift.z;
                        break;
                }

                self.add(column);

                return column;
            });


            // Generating rails (horizontal trims)
            if (!_.includes([tools.LEAN_TO, tools.A_FRAME, tools.DOUBLE_WIDE, tools.ECO, tools.CASTLE_MOUNTAIN,
                    tools.QUAKER, tools.MINI_BARN, tools.HI_BARN, tools.SINGLE_SLOPE], style)) {
                rails_ = _.times(2, (i)=> {

                    let railVertices = [
                        -width / 2 - 3.5, -3.5, 3.5,      //0
                        -width / 2 - 3.5, -3.5, -3.5,     //1
                        -width / 2 + 3.5, 3.5, -3.5,          //2
                        -width / 2 + 3.5, 3.5, 3.5,           //3
                        -width / 2 - 3.5, -3.5, 3.5,      //4
                        width / 2 + 3.5, -3.5, 3.5,       //5
                        width / 2 - 3.5, 3.5, 3.5,            //6
                        -width / 2 + 3.5, 3.5, 3.5,           //7
                        width / 2 + 3.5, -3.5, 3.5,       //8
                        width / 2 + 3.5, -3.5, -3.5,      //9
                        width / 2 - 3.5, 3.5, -3.5,           //10
                        width / 2 - 3.5, 3.5, 3.5,            //11
                        -width / 2 + 3.5, 3.5, 3.5,           //12
                        width / 2 - 3.5, 3.5, 3.5,            //13
                        width / 2 - 3.5, 3.5, -3.5,           //14
                        -width / 2 + 3.5, 3.5, -3.5,          //15
                        -width / 2 - 3.5, -3.5, 3.5,      //16
                        width / 2 + 3.5, -3.5, 3.5,       //17
                        width / 2 + 3.5, -3.5, -3.5,      //18
                        -width / 2 - 3.5, -3.5, -3.5,     //19
                    ];

                    let railIndices = [
                        0, 2, 1,
                        0, 3, 2,
                        4, 6, 7,
                        4, 5, 6,
                        8, 10, 11,
                        8, 9, 10,
                        12, 14, 15,
                        12, 13, 14,
                        16, 19, 18,
                        16, 18, 17
                    ];

                    let railUVs = [
                        1, 1,       //0
                        0, 1,       //1
                        0, 0,       //2
                        1, 0,       //3
                        0, 1,       //4
                        1, 1,       //5
                        1, 0,       //6
                        0, 0,       //7
                        0, 1,       //8
                        1, 1,       //9
                        1, 0,       //10
                        0, 0,       //11
                        0, 1,       //12
                        1, 1,       //13
                        1, 0,       //14
                        0, 0,       //15
                        0, 0,       //16
                        1, 0,       //17
                        1, 1,       //18
                        0, 1        //19
                    ];

                    railUVs = _.map(railUVs, (uv, idx)=> {
                        if (idx % 2 == 0) {
                            return uv * 25;
                        }
                        return uv * 0.5;
                    });

                    let railNormals = _.times(12, (i)=> {
                        if (i % 3 == 0) {
                            return -1
                        }

                        return 0;
                    });
                    railNormals = railNormals.concat(_.times(12, ()=> {
                        if (i % 3 == 2) {
                            return 1
                        }

                        return 0;
                    }));
                    railNormals = railNormals.concat(_.times(12, ()=> {
                        if (i % 3 == 0) {
                            return 1
                        }

                        return 0;
                    }));
                    railNormals = railNormals.concat(_.times(12, ()=> {
                        if (i % 3 == 1) {
                            return 1
                        }

                        return 0;
                    }));
                    railNormals = railNormals.concat(_.times(12, ()=> {
                        if (i % 3 == 1) {
                            return -1
                        }

                        return 0;
                    }));

                    let railGeometry = new THREE.BufferGeometry();
                    railGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(railVertices), 3));
                    railGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(railUVs), 2));
                    railGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(railNormals), 3));
                    railGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(railIndices), 1));
                    railGeometry.computeVertexNormals();
                    railGeometry.attributes.normal.array[12] = 0;
                    railGeometry.attributes.normal.array[13] = 0;
                    railGeometry.attributes.normal.array[14] = 1;


                    let rail = new THREE.Mesh(railGeometry, tools.PAINT_MATERIAL);
                    rail.castShadow = true;
                    rail.receiveShadow = true;
                    rail.position.y = height + FLOOR_HEIGHT;
                    rail.rotateY(Math.PI * (i + 1));
                    rail.position.z = Math.pow((-1), i + 1) * depth * 0.5;

                    self.add(rail);
                    return rail;
                });
            }

            //adding the floor
            floor_ = new Floor(width, depth, style);
            self.add(floor_);

            // Adding grid
            boxGrid_ = new GridObject(STEP_SIZE, self.boxWalls);
            boxGrid_.position.setY(height * 0.5 + FLOOR_HEIGHT);
            self.add(boxGrid_);
            boxGrid_.visible = false;

            generateWallGrid();

            //initialize drag objects
            _.forOwn(dragObjectClasses_, (ObjectConstructor, objectID)=> {
                if (!ObjectConstructor) {
                    return;
                }

                let object = new ObjectConstructor(objectID, environmentCamera, height, {
                    shedWidth: width_,
                    shedDepth: depth_,
                    noText: true
                });

                object.z = depth_ * 0.5;
                object.position.y = FLOOR_HEIGHT;
                object.visible = false;
                dragObjects_[objectID] = object;
                if (objectID.indexOf('door') >= 0) {
                    dragObjects_[objectID + ' lh'] = object;
                    dragObjects_[objectID + ' rh'] = object;
                }
                self.add(object);
            });

            setColor(mainColor_, secondaryColor_).then(()=> {
                if (generatedCallback && !noEvent) {
                    generatedCallback()
                }
            });
        }

        function generteWindowGrid() {
            windowWallMap_ = {};
            if (windowWalls_) {
                _.each(windowWalls_, (wall)=> {
                    self.remove(wall);
                })
            }
            windowWalls_ = [];
            _.each(windows_, (window)=> {
                if (window.canHaveFlowerBox) {
                    let box = window.planBox;
                    let wall = new THREE.Mesh(new THREE.PlaneGeometry(box.max.x - box.min.x, box.max.y - box.min.y), new THREE.MeshStandardMaterial({
                        transparent: true,
                        opacity: 0.01
                    }));
                    let addition = {x: 0, z: 0};
                    let angleMap = {};
                    angleMap[0] = ()=> {
                        addition.z = 5;
                    };
                    angleMap[Math.PI * 0.5] = ()=> {
                        addition.x = 5;
                    };
                    angleMap[Math.PI] = ()=> {
                        addition.z = -5;
                    };
                    angleMap[-Math.PI * 0.5] = ()=> {
                        addition.x = -5;
                    };
                    angleMap[tools.getAngleByRotation(window.rotation)]();

                    wall.position.y = window.position.y + height_ * 0.5 + FLOOR_HEIGHT;
                    wall.position.z = window.position.z + addition.z;
                    wall.position.x = window.position.x + addition.x;
                    wall.rotation.fromArray(window.rotation.toArray());
                    windowWalls_.push(wall);
                    self.add(wall);
                    windowWallMap_[wall.uuid] = window;
                }
            });

            windowGrid_ = new GridObject(STEP_SIZE, self.windowWalls);
            self.add(windowGrid_);
            windowGrid_.visible = false;
        }

        /**
         * Generates the grid for all walls, including deck walls
         */
        function generateWallGrid() {
            if (wallGrid_) {
                self.remove(wallGrid_);
            }
            if (topGrid_) {
                self.remove(topGrid_);
            }

            wallGrid_ = new GridObject(STEP_SIZE, self.wallClones, false);
            wallGrid_.position.setY(height_ * 0.5);
            self.add(wallGrid_);
            wallGrid_.visible = false;

            railGrid_ = new GridObject(STEP_SIZE, self.railGridWalls);
            //self.add(railGrid_);
            railGrid_.visible = false;

            topGrid_ = new THREE.Object3D();
            let grid1 = new Grid(width_ / 3 * 2 + tools.ft2cm(1), tools.ft2cm(3), tools.ft2cm(0.5));
            grid1.position.setY(truss1_.position.y + tools.ft2cm(1));
            grid1.position.setZ(depth_ * 0.5 + 1);
            topGrid_.add(grid1);

            roofGrid_ = new GridObject(STEP_SIZE, roof_.planes);
            roofGrid_.position.setY(height_ + FLOOR_HEIGHT + 2);
            self.add(roofGrid_);
            roofGrid_.visible = false;

            let grid2 = grid1.clone();
            grid2.position.setZ(-depth_ * 0.5 - 1);
            topGrid_.add(grid2);

            let grid3 = new Grid(width_ / 2, tools.ft2cm(2), tools.ft2cm(0.5));
            grid3.position.setY(grid1.position.y + tools.ft2cm(1.5));
            grid3.position.setZ(depth_ * 0.5 + 1);
            topGrid_.add(grid3);

            let grid4 = grid3.clone();
            grid4.position.setZ(-depth_ * 0.5 - 1);
            topGrid_.add(grid4);

            self.add(topGrid_);
            topGrid_.visible = false;
        }

        /**
         * Set size of the shed in feet
         * @param width Width of the shed in feet @default 8
         * @param depth Depth of the shed in feet @default 8
         * @param height Height of the shed in feet @default 6.854
         * @param noEvent Shows if "ready" event should not be fired
         * @param style Shed's style
         */
        function setSize(width = 8, depth = 8, height = 6.854, noEvent = false, style) {
            generateShed(tools.ft2cm(width), tools.ft2cm(depth), tools.ft2cm(height), noEvent, style);
        }

        /**
         * Set the color of the shed
         * @param mainColor Main color - color fo the walls
         * @param secondaryColor Secondary color - color of details and objects like doors and windows
         */
        function setColor(mainColor, secondaryColor) {
            mainColor_ = mainColor;
            secondaryColor_ = secondaryColor;

            let textureGenerator = new TextureGenerator();
            let generatedTextures_;
            let textureLoader = new THREE.TextureLoader();
            return Promise.all([
                textureGenerator.getWall(mainColor),
                textureGenerator.getWall(mainColor),
                textureGenerator.getWood(secondaryColor),
                textureGenerator.getWood(secondaryColor, Math.PI / 2),
                textureGenerator.getWoodBump(),
                textureGenerator.getWoodBump(Math.PI / 2)
            ]).then((results)=> {
                generatedTextures_ = results;

                let texturePromise = new Promise((done)=> {
                    let result = textureLoader.load(assets.img.tiles_b, ()=> {
                        done(result);
                    })
                });
                return Promise.all([texturePromise, texturePromise]);
            }).then((bumps)=> {
                let widthMap = generatedTextures_[0];
                let widthBumpMap = bumps[0];
                let depthMap = generatedTextures_[1];
                let depthBumpMap = bumps[1];

                widthMap.wrapS = widthMap.wrapT =
                    widthBumpMap.wrapS = widthBumpMap.wrapT =
                        depthMap.wrapS = depthMap.wrapT =
                            depthBumpMap.wrapS = depthBumpMap.wrapT = THREE.RepeatWrapping;

                widthMap.repeat.x = widthBumpMap.repeat.x = width_ / WALL_MAP_WIDTH;
                depthMap.repeat.x = depthBumpMap.repeat.x = depth_ / WALL_MAP_WIDTH;

                widthMesh1.material.map = widthMap;
                widthMesh1.material.bumpMap = widthBumpMap;
                widthMesh1.material.needsUpdate = true;
                widthMesh2.material.map = widthMap;
                widthMesh2.material.bumpMap = widthBumpMap;
                widthMesh2.material.needsUpdate = true;

                if (top1 && top2) {
                    top1.material.map = widthMap;
                    top1.material.bumpMap = widthBumpMap;
                    top1.material.needsUpdate = true;
                    top2.material.map = widthMap;
                    top2.material.bumpMap = widthBumpMap;
                    top2.material.needsUpdate = true;
                }

                depthMesh1.material.map = depthMap;
                depthMesh1.material.bumpMap = depthBumpMap;
                depthMesh1.material.needsUpdate = true;
                depthMesh2.material.map = depthMap;
                depthMesh2.material.bumpMap = depthBumpMap;
                depthMesh2.material.needsUpdate = true;

                return Promise.all([
                    truss1_.setColor(width_, mainColor),
                    truss2_.setColor(width_, mainColor),
                    roofBorder1_.setColor(mainColor, secondaryColor),
                    roofBorder2_.setColor(mainColor, secondaryColor)
                ]);
            }).then(()=> {
                if (!columns_) {
                    return Promise.resolve();
                }
                columns_.forEach((mesh)=> {
                    let texture = generatedTextures_[2];
                    let bump = generatedTextures_[4];
                    mesh.material.map = texture;
                    mesh.material.bumpMap = bump;
                    texture.wrapS = texture.wrapT =
                        bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
                    texture.repeat.y = 12;
                    bump.repeat.y = 12;
                    texture.repeat.x = 0.5;
                    bump.repeat.x = 0.5;
                    mesh.material.needsUpdate = true;
                });

                if (!rails_) {
                    return Promise.resolve();
                }
                rails_.forEach((mesh)=> {
                    let texture = generatedTextures_[3];
                    let bump = generatedTextures_[5];
                    mesh.material.map = texture;
                    mesh.material.bumpMap = bump;
                    texture.wrapS = texture.wrapT =
                        bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
                    mesh.material.needsUpdate = true;
                });

                return Promise.all(_.map(objects_, (object)=> {
                    return object.setColor(mainColor, secondaryColor);
                }));
            });
        }

        /**
         * Used inside the darg() function to precalculate paramters of the dragable object
         */
        function calculateDragOptions() {
            let dragBox = currentDrag_.boundingBox;
            let dragHalf = Math.max(dragBox.max.x - dragBox.min.x, dragBox.max.z - dragBox.min.z) * 0.5;
            maxDragX_ = halfWidth_ - dragHalf// - tools.ft2cm(0.5);
            maxDragZ_ = halfDepth_ - dragHalf// - tools.ft2cm(0.5);

            if (currentDrag_.limits) {
                maxDragX_ = halfWidth_ * currentDrag_.limits;
            }
        }

        /**
         * Starts moving some draggable object
         * @param object Slected user object that should be moved
         */
        function moveObject(object) {
            if (object) {

                let isDeck = object instanceof Deck;
                let isDeep = object instanceof DeepDoor;

                let currentObject;
                if (isDeep || isDeck) {
                    currentObject = object;
                }

                if (currentObject) {

                    //restore walls for all decks
                    _.each(deepDoors_.concat(decks_), (object)=> {
                        object.restoreWalls();
                    });

                    _.remove(isDeck ? decks_ : deepDoors_, (object)=> {
                        return currentObject == object;
                    });

                    (isDeck ? decks_ : deepDoors_).push(currentObject);

                    function removeDeckWalls() {
                        _.each(decks_, (deck)=> {
                            deck.removeWall();
                            deck.setColor(mainColor_, secondaryColor_);
                        });
                    }

                    function removeDoorWalls() {
                        _.each(deepDoors_, (deepDoor)=> {
                            deepDoor.z = deepDoor.z;
                            deepDoor.setColor(mainColor_, secondaryColor_);
                        });
                    }

                    if (isDeck) {
                        removeDoorWalls();
                        removeDeckWalls();
                    } else {
                        removeDeckWalls();
                        removeDoorWalls();

                    }

                    if (currentObject instanceof Deck) {
                        boxGrid_.visible = true;
                        currentDrag_ = currentObject;
                        let dragHalf = currentDrag_.size * 0.5;
                        maxDragX_ = halfWidth_ - dragHalf;
                        maxDragZ_ = halfDepth_ - dragHalf;
                    } else {
                        if (currentDrag_ instanceof Skylight) {
                            roofGrid_.visible = true;
                        } else {
                            wallGrid_.visible = true;
                        }
                        currentDrag_ = object;
                        calculateDragOptions();
                    }
                } else {
                    if (object.type.indexOf('skylight') >= 0) {
                        roofGrid_.visible = true;
                    } else if (object.type.indexOf('gable') < 0) {
                        wallGrid_.visible = true;
                    } else {
                        topGrid_.visible = true;
                    }
                    currentDrag_ = object;
                    calculateDragOptions();
                }

                moveObjectLastPosition_ = {
                    x: currentDrag_.x,
                    z: currentDrag_.z,
                    rotate: currentDrag_.rotate,
                    rotation: currentDrag_.rotation
                }
            } else if (!object && currentDrag_) {
                if (currentDrag_ instanceof Deck || currentDrag_ instanceof DeepDoor) {
                    let object = currentDrag_;
                    setTimeout(()=> {
                        object.setColor(mainColor_, secondaryColor_);
                    }, 200);
                }

                boxGrid_.visible = false;
                wallGrid_.visible = false;
                topGrid_.visible = false;
                roofGrid_.visible = false;
                currentDrag_ = null;
            }
        }

        /**
         * Starts dragging the object, used for drag-n-droping objects
         * @param objectID ID of the object to add to the scene
         */
        function dragObject(objectID) {
            if (!objectID && currentDrag_) {
                if (currentDrag_.restoreWalls) {
                    currentDrag_.restoreWalls();
                }

                boxGrid_.visible = false;
                wallGrid_.visible = false;
                topGrid_.visible = false;
                currentDrag_.visible = false;
                roofGrid_.visible = false;

                if (currentDrag_ instanceof Deck || currentDrag_ instanceof DeepDoor) {
                    self.remove(currentDrag_);
                }

                currentDrag_ = null;
                return;
            }

            if (objectID && tools.isDeckID(objectID)) {
                boxGrid_.visible = true;
                let size;
                if (objectID.indexOf("deck") >= 0) {
                    size = (objectID == "8' x 4' deck") ? 8 : (objectID == "10' x 4' deck" ? 10 : 12);
                    currentDrag_ = new Deck({
                        width: tools.ft2cm(size),
                        walls: [widthMesh1, depthMesh1, widthMesh2, depthMesh2],
                        columns: columns_,
                        shedWidth: width_,
                        shedDepth: depth_,
                        shedHeight: height_
                    });
                } else if (objectID == "wrap-around") {
                    currentDrag_ = new WrapAround({
                        walls: [widthMesh1, depthMesh1, widthMesh2, depthMesh2],
                        columns: columns_,
                        shedWidth: width_,
                        shedDepth: depth_,
                        shedHeight: height_
                    });
                    size = 12;
                } else if (objectID == "horse-stall") {
                    currentDrag_ = new HorseStall({
                        walls: [widthMesh1, depthMesh1, widthMesh2, depthMesh2],
                        columns: columns_,
                        shedWidth: width_,
                        shedDepth: depth_,
                        shedHeight: height_,
                        floor: floor_,
                        roof: roof_,
                        truss: truss1_,
                        style: style_
                    });
                    size = 10;
                }

                currentDrag_.position.y = FLOOR_HEIGHT;
                self.add(currentDrag_);

                let dragHalf = tools.ft2cm(size) * 0.5;
                maxDragX_ = halfWidth_ - dragHalf;
                maxDragZ_ = halfDepth_ - dragHalf;

                return;
            }

            if (objectID && _.includes(deepIDs_, objectID)) {
                wallGrid_.visible = true;

                currentDrag_ = new DeepDoor(objectID, environmentCamera, height_);
                currentDrag_.position.y = FLOOR_HEIGHT;

                self.add(currentDrag_);

                calculateDragOptions();
                return;
            }

            if (objectID == "loft" && lofts_.length > 1) {
                self.remove(lofts_.pop());
            }

            if (dragObjects_[objectID]) {
                if (objectID.indexOf('skylight') >= 0) {
                    roofGrid_.visible = true;
                } else if (objectID.indexOf('gable') < 0) {
                    wallGrid_.visible = true;
                } else {
                    topGrid_.visible = true;
                }

                currentDrag_ = dragObjects_[objectID];
                currentDrag_.visible = true;

                currentDrag_.z = 0;
                currentDrag_.placementForbidden = true;

                calculateDragOptions();
            }
        }

        /**
         * Checks if current drag object intersects with existing objects on the shed. If intersects, forbids the placement of drag object
         */
        function checkIntersection() {
            try {
                if (currentDrag_ instanceof WrapAround) {
                    if (width_ < currentDrag_.size || depth_ < currentDrag_.size) {
                        currentDrag_.placementForbidden = true;
                        throw(new Error());
                    }
                }

                if (currentDrag_ instanceof HorseStall) {
                    if (width_ < tools.ft2cm(12) || depth_ < tools.ft2cm(12)) {
                        currentDrag_.placementForbidden = true;
                        throw(new Error());
                    }
                }

                self.objects.forEach((object)=> {
                    //skip skylights
                    if (object instanceof Skylight) {
                        return;
                    }

                    let dragBox1 = currentDrag_.boundingBox.clone();
                    let dragBox2 = object.boundingBox.clone();

                    dragBox1.translate(new THREE.Vector3(currentDrag_.x, 0, currentDrag_.z));
                    dragBox2.translate(new THREE.Vector3(object.x, 0, object.z));

                    if (dragBox1.intersectsBox(dragBox2)) {
                        currentDrag_.placementForbidden = true;
                        throw(new Error());
                    }
                });

                currentDrag_.placementForbidden = false;
            } catch (e) {
            }
        }

        /**
         * Sets x coordinate of the drag object
         * @param value
         */
        function setDragX(value) {
            if (!currentDrag_) {
                plan_.drag.x = value;
                return;
            }

            if (currentDrag_ instanceof Loft && lofts_.length > 0 && value == lofts_[0].x) {
                return;
            }

            if (currentDrag_ instanceof Skylight) {
                currentDrag_.x = Math.round(value / STEP_SIZE) * STEP_SIZE;
                return;
            }

            if (parseFloat(Math.abs(value).toFixed(2)) >= parseFloat(halfWidth_.toFixed(2))) {
                value = (value > 0 ? 1 : -1) * halfWidth_;
                if (currentDrag_.type.indexOf('gable') >= 0) {
                    currentDrag_.placementForbidden = true;
                    return;
                }

                currentDrag_.x = value;
                if (Math.abs(currentDrag_.z).toFixed(2) == halfDepth_.toFixed(2)) {
                    currentDrag_.z = 0;
                }
            } else {
                if (value > maxDragX_) {
                    value = maxDragX_;
                }
                if (value < -maxDragX_) {
                    value = -maxDragX_;
                }
                currentDrag_.x = Math.round(value / STEP_SIZE) * STEP_SIZE;
            }
        }

        /**
         * Sets z coordinate of the drag object
         * @param value
         */
        function setDragZ(value) {
            if (!currentDrag_) {
                plan_.drag.z = value;
                return;
            }

            if (currentDrag_ instanceof Loft && lofts_.length > 0) {
                if (((value > 0 && lofts_[0].z > 0) || (value < 0 && lofts_[0].z < 0))) {
                    currentDrag_.placementForbidden = true;
                    return;
                } else {
                    currentDrag_.placementForbidden = false;
                }
            }

            if (currentDrag_ instanceof Skylight) {
                currentDrag_.z = Math.round(value / STEP_SIZE / 2) * STEP_SIZE * 2;
                let position = roof_.getPointOnRoof({x: currentDrag_.x, y: roof_.position.y, z: currentDrag_.z});
                let angle = roof_.getRoofAngle(position);
                currentDrag_.position.y = position.y;
                currentDrag_.rotation.fromArray([0, currentDrag_.position.x > 0 ? 0 : Math.PI, currentDrag_.position.x > 0 ? angle : -angle]);

                currentDrag_.placementForbidden = false;
                let vents = [vent1_];
                if (vent2_) {
                    vents.push(vent2_);
                }

                try {
                    vents.forEach((object)=> {
                        let dragBox1 = currentDrag_.boundingBox.clone();
                        let dragBox2 = object.boundingBox.clone();

                        dragBox1.translate(new THREE.Vector3(currentDrag_.x, 0, currentDrag_.z));
                        dragBox2.translate(new THREE.Vector3(object.x, 0, object.z));

                        if (dragBox1.intersectsBox(dragBox2)) {
                            currentDrag_.placementForbidden = true;
                            throw(new Error());
                        }
                    });
                } catch (e) {
                }

                return;
            }

            if (parseFloat(Math.abs(value).toFixed(2)) >= parseFloat(halfDepth_.toFixed(2))) {
                value = (value > 0 ? 1 : -1) * halfDepth_;
                currentDrag_.z = value;
                if (Math.abs(currentDrag_.x).toFixed(2) == halfWidth_.toFixed(2)) {
                    currentDrag_.x = 0;
                }
            } else {
                if (value > maxDragZ_) {
                    value = maxDragZ_;
                }
                if (value < -maxDragZ_) {
                    value = -maxDragZ_;
                }
                currentDrag_.z = Math.round(value / STEP_SIZE) * STEP_SIZE;
            }

            checkIntersection();
        }

        function drawPlan() {
            plan_.clear();

            let deckWalls = [];
            /* _.each(decks_, (deck)=> {
             if (!(deck instanceof WrapAround)) {
             deckWalls = deckWalls.concat(deck.walls);
             }
             });*/

            let objects = [widthMesh1, widthMesh2, depthMesh1, depthMesh2].concat(deckWalls).concat(windows_).concat(doors_).concat(decks_).concat(deepDoors_);
            plan_.drawElements(objects);
            plan_.drawMeasurements(objects);
        }

        /**
         * Aligns all windows to the highest door
         */
        function alignWindows() {
            let allDoors = doors_.concat(deepDoors_);
            let maxHeight = Math.max.apply(Math, _.map(allDoors, (door)=> {
                let bbox = door.boundingBox;
                return bbox.max.y - bbox.min.y;
            }));

            if (!allDoors.length) {
                maxHeight = tools.ft2cm(6);
            }

            let windowY = maxHeight - tools.ft2cm(6);

            _.each(windows_, (window)=> {
                if (window.type.indexOf("gable") < 0) {
                    window.position.setY(FLOOR_HEIGHT + windowY);
                }
            });

            _.forOwn(dragObjects_, (object)=> {
                if (object instanceof Window) {
                    if (object.type.indexOf("gable") < 0) {
                        object.position.setY(FLOOR_HEIGHT + windowY);
                    }
                }
            })
        }

        function placeRail(intersection, info) {
            if (lastPlacedRail_) {
                decks_[lastPlacedRail_.deck].showRail(lastPlacedRail_.index, false)
            }
            try {
                _.each(decks_, (deck, i)=> {
                    let railWalls = deck.railWalls;

                    let foundWall = _.findIndex(railWalls, (wall)=>intersection.object == wall);
                    if (foundWall >= 0 && !deck.isRailShown(foundWall)) {
                        lastPlacedRail_ = {deck: i, index: foundWall}
                        deck.showRail(foundWall, true, info);
                        throw new Error();
                    }
                });
            } catch (e) {
                if (e.message) {
                    throw e;
                }
            }
        }

        function placeShutters(intersection) {
            let window = findWindowByWindowWall(intersection.object);
            if (window && !window.hasShutters) {
                lastShutters_ = window;
                window.hasShutters = true;
            }
        }

        function placeFlowerBox(intersection) {
            let window = findWindowByWindowWall(intersection.object);
            if (window && !window.hasFlowerBox) {
                lastFlowerBox_ = window;
                window.hasFlowerBox = true;
            }
        }

        function findWindowByWindowWall(windowWall) {
            return windowWallMap_[windowWall.uuid];
        }

        function dropRail() {
            lastPlacedRail_ = null;
            drawPlan();
        }

        function cancelRail() {
            if (lastPlacedRail_) {
                decks_[lastPlacedRail_.deck].showRail(lastPlacedRail_.index, false);
                lastPlacedRail_ = null;
            }
        }

        function cancelFlowerBox() {
            if (lastFlowerBox_) {
                lastFlowerBox_.hasFlowerBox = false;
                lastPlacedRail_ = null;
            }
        }

        function cancelShutters() {
            if (lastShutters_) {
                lastShutters_.hasShutters = false;
                lastPlacedRail_ = null;
            }
        }

        function dropShutters() {
            lastShutters_ = null;
        }

        function dropFlowerBox() {
            lastFlowerBox_ = null;
        }

        function enableRailGrid(enable = true) {
            railGrid_.visible = enable;
        }

        function enableWindowGrid(enable = true) {
            windowGrid_.visible = enable;
        }

        Object.defineProperties(this, {
            /**
             * Shows/hides doors
             */
            showDoors: {
                set: (value)=> {
                    doors_.forEach((door)=> {
                        door.visible = value;
                    });
                    doorsAreVisible_ = value;

                    _.each(deepDoors_, (deepDoor)=> {
                        deepDoor.visible = value;
                        if (!value) {
                            deepDoor.restoreWalls();
                        } else {
                            deepDoor.z = deepDoor.z;
                        }
                    })
                },
                get: ()=> {
                    return doorsAreVisible_;
                }
            },
            /**
             * Shows/hides windows
             */
            showWindows: {
                set: (value)=> {
                    windows_.forEach((window)=> {
                        window.visible = value;
                    });
                    windowsAreVisible_ = value;
                },
                get: ()=> {
                    return windowsAreVisible_;
                }
            },
            showFlowerBoxes: {
                set: (value)=> {
                    _.each(dragObjects_, (object)=> {
                        if (object instanceof Window) {
                            object.hasFlowerBox = value;
                        }
                    });
                    flowerBoxesAreVisible_ = value;
                },
                get: ()=> {
                    return flowerBoxesAreVisible_;
                }
            },
            showShutters: {
                set: (value)=> {
                    _.each(dragObjects_, (object)=> {
                        if (object instanceof Window) {
                            object.hasShutters = value;
                        }
                    });
                    shuttersAreVisible_ = value;
                },
                get: ()=> {
                    return shuttersAreVisible_;
                }
            },
            /**
             * Width of the shed
             */
            width: {
                get: ()=> {
                    return width_;
                }
            },
            /**
             * Depth of the shed
             */
            depth: {
                get: ()=> {
                    return depth_;
                }
            },
            height: {
                get: ()=> {
                    return height_;
                }
            },
            drag: {
                get: ()=> {
                    let drag = {};

                    Object.defineProperties(drag, {
                        x: {
                            get: ()=> {
                                return currentDrag_.x;
                            },
                            set: setDragX
                        },
                        z: {
                            get: ()=> {
                                return currentDrag_.z;
                            },
                            set: setDragZ
                        },
                        rotate: {
                            set: (value)=> {
                                currentDrag_.rotate = value;
                            }
                        },
                        width: {
                            get: ()=> {
                                if (currentDrag_.width) {
                                    return currentDrag_.width;
                                }

                                let dragBox = currentDrag_.boundingBox;
                                return Math.max(dragBox.max.x - dragBox.min.x, dragBox.max.z - dragBox.min.z);
                            }
                        },
                        currentWall: {
                            get: ()=> {
                                return currentDrag_.currentWall;
                            }, set: (wall)=> {
                                if (realWallMap_[wall.uuid]) {
                                    currentDrag_.currentWall = realWallMap_[wall.uuid];
                                } else {
                                    currentDrag_.currentWall = wall;
                                }
                            }
                        },
                        size: {
                            get: ()=> {
                                return currentDrag_.size;
                            },
                            set: (value)=> {
                                if (currentDrag_.size) {
                                    currentDrag_.size = value;
                                }
                            }
                        }
                    });

                    drag.drop = (objectID, info)=> {
                        if (objectID.indexOf("2d") == 0) {
                            plan_.drag.drop(objectID, info);
                            return null;
                        }

                        if (currentDrag_.placementForbidden) {
                            dragObject(false);
                            return null;
                        }

                        let object;
                        let simpleID = objectID;
                        if (/\slh$/.test(objectID)) {
                            simpleID = objectID.replace(/\slh$/, '');
                        } else if (/\srh$/.test(objectID)) {
                            simpleID = objectID.replace(/\srh$/, '');
                        }
                        if (_.includes(_.keys(dragObjectClasses_), simpleID)) {
                            if (objectID.indexOf('skylight') >= 0) {
                                object = new Skylight(colors.shingleMap[roof_.color] ? 'simple' : 'metal', environmentCamera);
                            } else {
                                object = new dragObjectClasses_[simpleID](objectID, environmentCamera, height_, {
                                    shedWidth: width_,
                                    shedDepth: depth_
                                });
                            }
                            object.info = info;
                            if (object instanceof Window) {
                                object.hasFlowerBox = flowerBoxesAreVisible_;
                                object.hasShutters = shuttersAreVisible_;
                            }
                        } else if (tools.isDeckID(objectID)) {
                            object = currentDrag_;
                            object.info = info;
                            currentDrag_ = null;
                            boxGrid_.visible = false;
                            //objects_.push(object);
                            decks_.push(object);
                            objects_.push(object);

                            generateWallGrid();
                            setColor();
                            alignWindows();
                            return object;
                        } else if (_.includes(deepIDs_, objectID)) {
                            object = currentDrag_;
                            object.info = info;
                            currentDrag_ = null;
                            deepDoors_.push(object);
                            _.each(deepDoors_, (deepDoor)=> {
                                deepDoor.visible = doorsAreVisible_;
                                if (!doorsAreVisible_) {
                                    deepDoor.restoreWalls();
                                } else {
                                    deepDoor.z = deepDoor.z;
                                }
                            });
                            objects_.push(object);

                            wallGrid_.visible = false;
                            topGrid_.visible = false;

                            setColor();
                            alignWindows();
                            return object;
                        }

                        if (!object) {
                            return null;
                        }

                        if (object instanceof Skylight) {
                            object.position.y = currentDrag_.position.y + 1;
                            object.rotation.fromArray(currentDrag_.rotation.toArray());
                            skylights_.push(object);
                        } else {
                            object.position.y = FLOOR_HEIGHT;
                            object.rotate = currentDrag_.rotate;
                        }

                        object.currentWall = currentDrag_.currentWall;
                        object.x = currentDrag_.x;
                        object.z = currentDrag_.z;

                        self.add(object);
                        objects_.push(object);
                        if (objectID.indexOf("door") >= 0) {
                            doors_.push(object);
                            object.visible = doorsAreVisible_;
                        } else if (objectID.indexOf("window") >= 0) {
                            windows_.push(object);
                            object.visible = windowsAreVisible_;
                            generteWindowGrid();
                        } else if (objectID.indexOf("loft") >= 0) {
                            lofts_.push(object);
                        }

                        function setColor() {
                            //not a good thing, but it requires time to load 3D model implementing callback for it will make it uglier
                            setTimeout(()=> {
                                object.setColor(mainColor_, secondaryColor_);

                                drawPlan();
                            }, 200);
                        }

                        setColor();
                        alignWindows();

                        return object;
                    };

                    return drag;
                },
                set: (value)=> {
                    if (value) {
                        if (value.indexOf('2d') == 0) {
                            plan_.drag = value;
                        } else {
                            dragObject(value);
                        }
                    } else {
                        dragObject(false);
                        plan_.drag = false;
                    }
                }
            },
            move: {
                get: ()=> {
                    let move = {};

                    Object.defineProperties(move, {
                        x: {
                            get: ()=> {
                                if (plan_.inMove) {
                                    return plan_.x
                                }

                                return currentDrag_.x;
                            },
                            set: setDragX
                        },
                        z: {
                            get: ()=> {
                                if (plan_.inMove) {
                                    return plan_.x
                                }

                                return currentDrag_.z;
                            },
                            set: setDragZ
                        },
                        rotate: {
                            set: (value)=> {
                                currentDrag_.rotate = value;
                            }
                        },
                        isDeck: {
                            get: ()=> {
                                return currentDrag_ instanceof Deck;
                            }
                        },
                        type: {
                            get: ()=> {
                                return currentDrag_.type;
                            }
                        }
                    });

                    function cancel() {
                        currentDrag_.x = moveObjectLastPosition_.x;
                        currentDrag_.z = moveObjectLastPosition_.z;
                        if (currentDrag_ instanceof Skylight) {
                            currentDrag_.rotation.fromArray(moveObjectLastPosition_.rotation.toArray());
                        } else {
                            currentDrag_.rotate = moveObjectLastPosition_.rotate;
                        }
                    }

                    move.drop = ()=> {
                        if (plan_.inMove) {
                            plan_.move.drop();
                            return;
                        }

                        if (currentDrag_.placementForbidden) {
                            cancel();
                            currentDrag_.placementForbidden = false;
                        } else {
                            generateWallGrid();
                        }

                        if (currentDrag_ instanceof DeepDoor) {
                            currentDrag_.setColor(mainColor_, secondaryColor_);
                        } else if (currentDrag_ instanceof Window) {
                            generteWindowGrid();
                        }
                        moveObject(false);
                        drawPlan();
                    };

                    move.cancel = ()=> {
                        if (plan_.inMove) {
                            plan_.move.cancel();
                            return;
                        }

                        cancel();
                        moveObject(false);
                    };

                    move.delete = ()=> {
                        if (plan_.inMove) {
                            plan_.move.delete();
                            return;
                        }

                        if (currentDrag_ instanceof Loft) {
                            _.remove(lofts_, (loft)=> {
                                return loft == currentDrag_;
                            })
                        }

                        function filterObjects(objects) {
                            return _.filter(objects, (object)=> {
                                return object != currentDrag_;
                            });
                        }

                        doors_ = filterObjects(doors_);
                        deepDoors_ = filterObjects(deepDoors_);
                        objects_ = filterObjects(objects_);
                        windows_ = filterObjects(windows_);
                        decks_ = filterObjects(decks_);

                        self.remove(currentDrag_);

                        if (currentDrag_.restoreWalls) {
                            currentDrag_.restoreWalls();
                        }

                        generateWallGrid();
                        moveObject(false);
                        drawPlan();
                        alignWindows();
                    };

                    move.resize = (x, y, z)=> {
                        if (!currentDrag_.resize) {
                            return;
                        }

                        currentDrag_.resize(x, y, z);
                    };

                    return move;
                },
                set: (value)=> {
                    if (_.includes(plan_.objects2D, value)) {
                        plan_.move = value;
                    } else {
                        moveObject(value);
                    }
                }
            },
            boxWalls: {
                get: ()=> {
                    return [widthMesh1, depthMesh1, widthMesh2, depthMesh2];
                }
            },
            walls: {
                get: ()=> {
                    let returnArray = [widthMesh1, depthMesh1, widthMesh2, depthMesh2];
                    _.each(decks_, (deck)=> {
                        returnArray = returnArray.concat(deck.walls);
                    });

                    return returnArray;
                }
            },
            wallClones: {
                get: ()=> {
                    _.each(deepDoors_.concat(decks_), (object)=> {
                        object.restoreWalls();
                    });

                    removeDeckWalls();

                    let returnArray;
                    returnArray = [widthMesh1, depthMesh1, widthMesh2, depthMesh2];
                    if (style_ == tools.LEAN_TO) {
                        returnArray = [widthMesh1, widthMesh2, depthMesh2];
                    }
                    _.each(decks_, (deck)=> {
                        returnArray = returnArray.concat(deck.wallClones);
                    });

                    realWallMap_ = {};
                    returnArray = _.map(returnArray, (wall, i)=> {
                        let newWall = wall.clone();
                        if (style_ == tools.LEAN_TO && width_ == tools.ft2cm(8) && i < 2) {
                            newWall.geometry = wall.geometry.clone();
                            newWall.geometry.clip.push(width_ * 0.5 - tools.ft2cm(1.5), width_ * 0.5);
                        } else {
                            newWall.geometry = wall.geometry.clone();
                        }
                        newWall.original = wall.original || wall;
                        realWallMap_[newWall.uuid] = wall.original || wall;
                        return newWall;
                    });

                    removeDoorWalls();

                    return returnArray;

                    function removeDoorWalls() {
                        _.each(deepDoors_, (deepDoor)=> {
                            deepDoor.z = deepDoor.z;
                            deepDoor.setColor(mainColor_, secondaryColor_);
                        });
                    }

                    function removeDeckWalls() {
                        _.each(decks_, (deck)=> {
                            deck.removeWall();
                            deck.setColor(mainColor_, secondaryColor_);
                        });
                    }
                }
            },
            windows: {
                get: ()=> {
                    return windows_;
                }
            },
            doors: {
                get: ()=> {
                    return doors_.concat(deepDoors_);
                }
            },
            decks: {
                get: ()=> {
                    return decks_;
                }
            },
            objects: {
                get: ()=> {
                    return _.filter((currentDrag_ instanceof Deck) ? objects_ : doors_.concat(deepDoors_).concat(windows_), (object)=> {
                        return object != currentDrag_;
                    })
                }
            },
            allObjects: {
                get: ()=> {
                    return objects_.slice();
                }
            },
            roof: {
                get: ()=> {
                    let roof = {};
                    Object.defineProperties(roof, {
                        color: {
                            get: ()=> {
                                return roof_.color;
                            },
                            set: (value)=> {
                                roof_.color = value;
                                if (colors.shingleMap[value]) {
                                    if (vent1_) {
                                        vent1_.visible = true;
                                    }
                                    if (vent2_) {
                                        vent2_.visible = true;
                                    }
                                    if (vent3_) {
                                        vent3_.visible = false;
                                    }
                                    if (vent4_) {
                                        vent4_.visible = false;
                                    }

                                    _.each(skylights_, (skylight)=> {
                                        skylight.switchToMetal(false);
                                    });
                                    if (dragObjects_['skylight']) {
                                        dragObjects_['skylight'].switchToMetal(false);
                                    }

                                } else {
                                    if (vent1_) {
                                        vent1_.visible = false;
                                    }
                                    if (vent2_) {
                                        vent2_.visible = false;
                                    }
                                    if (vent3_) {
                                        vent3_.visible = true;
                                    }
                                    if (vent4_) {
                                        vent4_.visible = true;
                                    }

                                    _.each(skylights_, (skylight)=> {
                                        skylight.switchToMetal();
                                    });
                                    if (dragObjects_['skylight']) {
                                        dragObjects_['skylight'].switchToMetal();
                                    }
                                }
                            }
                        },
                        visible: {
                            set: (value)=> {
                                roofContainer_.visible = value;
                            }
                        },
                        planes: {
                            get: ()=> {
                                return roof_.planes;
                            }
                        }
                    });
                    return roof;
                }
            },
            plan: {
                get: ()=> {
                    let plan = {};
                    plan.redraw = drawPlan;
                    Object.defineProperties(plan, {
                        objects2D: {
                            get: ()=> {
                                return plan_.objects2D;
                            }
                        },
                        inMove: {
                            get: ()=> {
                                return plan_.inMove;
                            }
                        },
                        inResize: {
                            get: ()=> {
                                return inPlanResize_;
                            },
                            set: (value)=> {
                                inPlanResize_ = value;
                            }
                        },
                        grips: {
                            get: ()=> {
                                return _.map(lofts_, (loft)=> {
                                    return loft.grip;
                                });
                            }
                        },
                        crosses: {
                            get: ()=> {
                                return _.map(lofts_, (loft)=> {
                                    return loft.cross;
                                });
                            }
                        },
                        walls: {
                            get: ()=> {
                                return plan_.walls;
                            }
                        }
                    });

                    return plan;
                }
            },
            colors: {
                get: ()=> {
                    return {mainColor: mainColor_, secondaryColor: secondaryColor_};
                }
            },
            lofts: {
                get: ()=> {
                    return lofts_.slice();
                }
            },
            railWalls: {
                get: ()=> {
                    let railWalls = [];
                    _.each(decks_, (deck)=> {
                        railWalls = railWalls.concat(deck.railWalls);
                    });

                    return railWalls;
                }
            },
            railGridWalls: {
                get: ()=> {
                    let railWalls = [];
                    _.each(decks_, (deck)=> {
                        railWalls = railWalls.concat(_.map(deck.railWalls, (railWall)=> {
                            let clone = railWall.clone();
                            return clone;
                        }));
                    });

                    return railWalls;
                }
            },
            windowWalls: {
                get: ()=> {
                    return windowWalls_;
                }
            },
            roofHeight: {
                get: ()=> {
                    return roofHeight_;
                }
            },
            features: {
                get: ()=> {
                    return features;
                }
            },
            style: {
                get: ()=> {
                    return style_;
                }
            }
        });

        generateShed(width_, depth_, height_);
    }
}

module.exports = Shed;
