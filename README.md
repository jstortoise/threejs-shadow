# Urban Sheds 3D viewer
This project is part of Urban Sheds project. Everything related to 3D viewer is here.

## Table of Contents
   * [Urban Sheds 3D viewer](#markdown-header-urban-sheds-3d-viewer)
      * [Table of Contents](#markdown-header-table-of-contents)
      * [Installation](#markdown-header-installation)
      * [Building](#markdown-header-building)
      * [API Reference](#markdown-header-api-reference)
         * [Integrating the library](#markdown-header-integrating-the-library)
         * [Viewer3D object structure](#markdown-header-viewer3d-object-structure)
         * [Viewer3D class reference](#markdown-header-viewer3d-class-reference)
            * [Methods](#markdown-header-methods)
            * [Parameters](#markdown-header-parameters)
            * [Events](#markdown-header-events)
         * [Shed object reference](#markdown-header-shed-object-reference)
            * [Parameters](#markdown-header-parameters_1)
            * [Methods](#markdown-header-methods_1)
         * [Roof object reference](#markdown-header-roof-object-reference)
            * [Parameters](#markdown-header-parameters_2)
         * [Environment object reference](#markdown-header-environment-object-reference)
            * [Parameters](#markdown-header-parameters_3)
         * [Drag-n-drop interface](#markdown-header-drag-n-drop-interface)
         * [Shed styles](#markdown-header-shed-styles)

## Installation
1. Install latest NodeJS with npm (instruction for ubuntu 16.04 and node 8):
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Clone git repo:
```
cd /path/to/the/project
git clone git@bitbucket.org:uscdomination/usc3d.git
```

3. Install dependencies
```
cd /path/to/the/project/usc3d
npm install
```

## Building
The grunt is used as a build system, to build the project, execute following commands:
```
cd /path/to/the/project/usc3d
node_modules/.bin/grunt
```

If you want to build debug version of the library without uglifying for debugging:
```
node_modules/.bin/grunt dev
```

If you want to build the version with the global variable, use
```
node_modules/.bin/grunt global
```

## API Reference
The 3D viewer is standalone library that can be built into a project and controlled via API.

### Integrating the library
If you use CommonJS-style (browserify/webpack) module system:
```
const Viewer3D = require('./path/to/the/Viewer3D');
```
If you are using ES6-style module system:
```
import Viewer3D from './path/to/the/Viewer3D';
```

If you don't use any kind of module system, build the library with global variable, which gies you global `window.Viewer3D` variable.

Also you should link `viewer3D.css` file in your html
```
<link rel="stylesheet" href="path/to/build/folder/css/viewer3D.css"/>
```

It also possible to define library path in global `window.Viewer3DPath`, which allows to load all assets from the same path as library location.  
(web server requires additional header `Access-Control-Allow-Origin {referer_path}`)

### Viewer3D object structure
This part just for you to imagine the structure of the Viewer3D object
```
{
  constructor(width, height, features),
  save(),
  load(data),
  element: DOMElement,
  width: Number,
  height: Number,
  perspective: String,
  shed: {
    setSize(width, depth, height, style),
    setColor(mainColor, secondaryColor),
    width: Number,
    height: Number,
    showWindows: DEPRECATED,
    showDoors: DEPRECATED,
    showFlowerBoxes: DEPRECATED,
    showShutters: DEPRECATED,
    doors: {
        show: Boolean
    },
    windows: {
        show: Boolean,
        shutters: {
            show: Boolean,
            enable: Boolean
        },
        flowerBoxes: {
            show: Boolean,
            enable: Boolean
        }
    },
    roof: {
      color: String
    },
    style: String
  },
  environemnt: {
    enabled: Boolean
  }
}
```

### Viewer3D class reference
First, you should initialize the 3D viewer:
```
constructor(width, height, features)
```
where:
 `width` - height of the 3D viewer in pixels, *default* - `window.innerWidth`  
 `height` - height of the 3D viewer in pixels, *default* - `window.innerHeight`  
 `features` - features object with all enabled features, like doors, windows, roofs.  

`Features` is used to filter available set of options and decrease loading times. It's structure looks like:
```
{
    roofs: Array,
    windows: Array,
    doors: Array,
    '2d': Array,
    loft: Boolean,
    skylight: Boolean
}
```
where:
    `roofs` - array of possible roof colors  
    `windows` - array of possible window IDs  
    `doors` - array of possible door IDs  
    `2d` - array of possible 2D items  
    `loft` - true, if loft should be present, false, if not  
    `skylight` - true, if skylight should be present, false, if not  

The default value use all features of Urban Shed Concepts set:
```
{
    roofs: ["Heritage Rustic Black", "Heritage Black Walnut", "Heritage Rustic Cedar",
            "Heritage Mountain Slate", "Vintage White", "Rustic Red", "Gray", "Evergreen", "Desert Sand",
            "Coal Black", "Galvalume"],
    doors: ["3' shed door", "3' shed door (w-transom)", "4' dutch shed door", "4' shed door",
            "4' shed door (w-transom)", "double dutch shed door", "double shed door",
            "double shed door (w-transom)", "econ door", "3' shed door lh", "3' shed door (w-transom) lh",
            "4' dutch shed door lh", "4' shed door lh", "4' shed door (w-transom) lh", "double dutch shed door lh",
            "double shed door lh", "double shed door (w-transom) lh", "econ door lh", "3' shed door rh",
            "3' shed door (w-transom) rh", "4' dutch shed door rh", "4' shed door rh",
            "4' shed door (w-transom) rh", "double dutch shed door rh", "double shed door rh",
            "double shed door (w-transom) rh", "econ door rh", "6'x7' roll up door", "8'x8' roll up door",
            "9'x7' roll up door", "15 light french doors", "steel 9' light walk-in door",
            "short steel 9' light walk-in door lh", "short steel 9' light walk-in door rh", "steel french doors lh",
            "steel french doors rh", "steel walk-in door lh", "steel walk-in door rh",
            "short steel walk-in door lh", "short steel walk-in door rh"]
    windows: ["1'x1' loft window", "2'x3' single pane window", "3'x3' single pane window", "29 transom window",
              "60 transom window", "1'x1' loft gable window", "29 transom gable window", "60 transom gable window",
              "14'x21' aluminum single pane window", "18'x27' aluminum single pane window",
              "18'x36' aluminum single pane window", "23'x10' transom window with grids",
              "24'x24' vinyl double pane window (without-grids)", "24'x24' vinyl double pane window with grids",
              "24'x27' aluminum single pane window", "24'x36' aluminum single pane window",
              "24'x36' vinyl double pane window (without-grids)", "24'x36' vinyl double pane window with grids",
              "29'x10' transom window with grids", "30'x40' vinyl double pane window (without-grids)",
              "30'x40' vinyl double pane window with grids", "36'x48' vinyl double pane window (without-grids)",
              "36'x48' vinyl double pane window with grids", "60'x10' transom window with grids",
              "72'x10' transom window with grids"],
    '2d': ["atv", "bed", "bike", "computer_table", "croquet", "kf-04", "lawn_mower", "lazyboy", "office_desk",
           "ping_pong", "sofa1", "sofa2", "toolbox", "tv", "wagon", "wheel_barrow", "work_bench"]
    loft: true,
    skylight: true
}
```

For Montana Shed Center you should use another set of options, see the list of [roof colors](#markdown-header-parameters_2),
the list of [shed styles](#markdown-header-shed-styles) and the [lists of possible items](#markdown-header-drag-n-drop-interface)

Example:
```
let viewer3D = new Viewer3D(800, 600);
$('.viewer-3d').append(viewer3D.element);
```

#### Methods
```
save()
```
Return object with configuration of the current shed.
The object looks as following:
```
{
  shed: {
    width: String,
    width_cm: Number,
    depth: String,
    depth_cm: Number,
    height: String,
    height_cm: Number
  },
  mainColor: String,
  secondaryColor: String,
  roof: {
    type: String,
    color: String
  },
  windows: Array,
  doors: Array,
  decks: Array,
  horseStalls: Array,
  wrapArounds: Array,
  lofts: Array,
}
```
where:  
`shed.width` - width of the shed  
`shed.depth` - depth of the shed  
`shed.height` - height of the shed  
`shed.mainColor` - the main color of the shed walls  
`shed.secondaryColor` - the secondary color of shed trims and doors/windows  
`shed.width_cm`, `shed.depth_cm` and `shed.height_cm` - shed's dimensions in cm. Used in load() function internally  
`roof.type` - type of the roof, could be "metallic" or "shingle"  
`roof.color` - color of the roof, see below for possible roof colors  
`windows` - array of windows objects  
`doors` - array of doors objects  
`decks` - array of decks  
`horseStalls` - array of horse stall objects  
`wrapArounds` - array of wrap-arounds  
`lofts` - array of lofts  
Objects look like:  
```
{
  type: String,
  info: Object|String,
  hasShutters: Boolean,
  hasFlowerBox: Boolean,
  position_cm: {
    x: Number,
    z: Number
  },
  position: {
    x: String,
    z: String
  },
  rotate: Number,
  size: Number,
  rails: Array
}
```
where:  
`type` - Identifier of the object. See the drag-n-drop section for all available values  
`info` = Any serializable data taken from `data-info` attribute of the drag-n-drop item  
`hasShutters` - Only for windows. Shows if window has shutters or not  
`hasFlowerBox`- Only for windows. Shows if window has flower box or not  
`position_cm` - position of the object in cm - used internally by load() function  
`position` - x and z coordinates from the center of the building in imperial system  
`rotate` - rotation angle along y axis in radians. Used internally by load() function  
`size` - Only for lofts. THe size of the loft in feet  
`rails` - Only for decks and wrap-around. The array of objects like {index: 0, info: String|Object} - array of rails of the current deck  

  
```
load(data)
```
Loads previously saved data object, the object returned by `save()` function  
`data` - object, returned by `save()` method

```
getImages()
```
Renders 5 images and returns the promise. Promise resolves the object with images
Example of resolved object:
```
{
    front: String,
    left: String,
    back: String,
    right: String,
    plan: String
}
```
where:  
`front`,`left`,`back`,`right` and `plan` - dataURLs of rendered images.  
  
Usage:
```
viewer3D.getImages().then((views)=> {
    $('body').append(`<img src="${views.front}">`);
    $('body').append(`<img src="${views.left}">`);
    $('body').append(`<img src="${views.back}">`);
    $('body').append(`<img src="${views.right}">`);
    $('body').append(`<img src="${views.plan}">`);
});
```

#### Parameters
`element` - DOM element of the 3D viewer that can be built into the html page  
`width` - width of the 3D viewer element, Change this value, when you want to resize 3D viewer  
`height` - height of the 3D viewer element, Change this value, when you want to resize 3D viewer  
`perspective` - Set it to change camera perspective. Possible values are - `front`,`left`,`back`,`right`,`top`
`shed` - shed object to configure shed parameters. See below.  
  
Example:
```
let viewer3D = new Viewer3D(800, 600);
$('.viewer-3d').append(viewer3D.element);

//...
//onResize event handler:
viewer3D.width = newWidth;
viewer3D.height = newHeight;
//...

//...
//perspective button handler:
viewer3D.perspective = "left";
```

#### Events
`changeView` - called  when camera changes between 3D and Plan views, has `view` parameter that could be `2d` or `3d`

Example:
```
let viewer3D = new Viewer3D(800, 600);
$('.viewer-3d').append(viewer3D.element);

viewer3D.addEventListener("changeView", (e)=> {
    console.log(e.view);
});
```

`change` - called on every user action like setting the colors, adding/moving/removing doors and windows, etc.

Example:
```
let viewer3D = new Viewer3D(800, 600);
$('.viewer-3d').append(viewer3D.element);

viewer3D.addEventListener("change", (e)=> {
    console.log(viewer3D.save());
});
```

`ready` - Called, when shed is generated

Example:
```
let viewer3D = new Viewer3D(800, 600);
$('.viewer-3d').append(viewer3D.element);

viewer3D.addEventListener("ready", (e)=> {
    console.log("Shed is ready");
});
```

`progress` - Called each time progress updates on initial load.  
Progress event properties:  
`loaded` - number of elements loaded  
`total` - total number of elements  
  
Example:  
```
let viewer3D = new Viewer3D(600, 400);
$('.viewer-3d').append(viewer3D.element);

viewer3D.addEventListener('progress', (e)=> {
    console.log((e.loaded / e.total * 100).toFixed(2) + '%');
});
```

### Shed object reference
Shed object is used as parameter of the Viewer3D object. Access it to change the shed parameters like shed width x depth x height, roof type, colors, etc.

#### Parameters
`width` - Shed width, default - `8`  
`depth` - Shed depth, default - `8`  
`showDoors` - DEPRECATED. Use `doors.show`. Defines if you want to show door objects or not, default - `true`  
`showWindows` - DEPRECATED. Use `windows.show`. Defines if you want to show window objects or not, default - `true`  
`showFlowerBoxes` - DEPRECATED. Use `windows.flowerBoxes.show`. Defines if windows should have flower boxes, default - `false`  
`showShutters` - DEPRECATED. Use `windows.shutters.show`. Defines if windows should have shutters, default - `false`  
`windows.shutters.enable` - Defines if the shutter option should be present in the context menu, default - true  
`windows.flowerBoxes.enable` - Defines if the flower box option should be present in the context menu, default - true.  
`roof` - Roof object to define roof parameters. See below.  
`environment` - Environment object to control environment. See below  
`style` - (read only) Style of the shed, can be one of the following: "Urban Barn", "Urban Shack", "Urban Lean-to", "Urban Econ"
  
#### Methods
```
setSize(width, depth, height, style)
```
Sets the size of the shed in feet, where:  
`width` - Shed width, default - `8`  
`depth` - Shed depth, default - `8`  
`height` - Shed wall height, default - `6.854`  
`style` - Style of the shed. You can see the list os shed styles in [Shed styles](#markdown-header-shed-styles) section

```
setColor: (mainColor, secondaryColor)
```
Sets the colors of the shed, where  
`mainColor` - The string value of the color of the walls. Example - "#fff000","red","rgba(255,0,255,0.75)"  
`mainColor` - The string value of the color of the wall trims. Example - "#fff000","red","rgba(255,0,255,0.75)"  
  
Example:
```
let viewer3D = new Viewer3D(800, 600);
$('.viewer-3d').append(viewer3D.element);

//...
//In shed size button handler
viewer3D.shed.setSize(shedWidth, shedDepth);
//...

//...
viewer3D.shed.showDoors = false;
//...

//...
//In color selection handler:
viewer3D.shed.setColor(userSelectedMainColor,userSelectedSecondaryColor);
/...
```

### Roof object reference
Controls roof color and type.

#### Parameters
`color` - String value, that represent the roof color and type.  
  
There are few values available for the roof:  

Value                   | Type
----------------------- | ---------
Heritage Rustic Black   | shingle
Heritage Black Walnut   | shingle
Heritage Rustic Cedar   | shingle
Heritage Mountain Slate | shingle
Vintage White           | metallic
Rustic Red              | metallic
Gray                    | metallic
Desert Sand             | metallic
Coal Black              | metallic
  
Example:  
```
let viewer3D = new Viewer3D(800, 600);
$('.viewer-3d').append(viewer3D.element);

//...
viewer3D.shed.roof.color = "Heritage Rustic Cedar";
```

### Environment object reference
Controls the environment, like grass and background panorama.

#### Parameters
`enabled` - Boolean value, show/hide the environment

### Drag-n-drop interface
To implement drag-n-drop items, you should create DOM element with `class="item"` `draggable="true"` and specified `data-id` element.  
`data-id` is used to identify the item, see the table below.
Also you can include optional "data-info" attribute. You can pass there any serializable data. It will be returned by `save()` function.
If the string value can be parsed to an object, `save()` returns an object.
  
Each door has it's orientation and can be left-handed (LH) and right-handed (RH). It's defined by the door ID. Just add RH or LH at the end of id string.
Example: `3' shed door RH`, `double shed door LH`, etc.

*WARNING: Using ids for doors without LH or RH is deprecated*

*Please note: When page loaded, all element should already be there. It's important for Viewer3D handle drag-n-drop properly*  
Example:
```
<script>
    let viewer3D = new Viewer3D(800, 600);
    $('.viewer-3d').append(viewer3D.element);
</script>
...
<body>
    <div style="background-image:url(img/DoorItem.png)" data-id="3' shed door LH" class="item" draggable="true"></div>
    <div style="background-image:url(img/WindowItem.png)" data-id="3'x3' single pane window" class="item" draggable="true"></div>
</body>
```
*Please note: If you use img-type elements, user will see drag image, following the cursor.
For div elements drag image is removed. It's recommended to use divs with background instead of img elements*

List of possible data-ids for Urban Shed Concepts:

Name                                | Value                               | Relative image URL
----------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------
3' Shed Door                        | 3' shed door                        | img/items/3_Shed_Door.png
3' Shed Door (w-transom)            | 3' shed door (w-transom)            | img/items/3_Shed_Door_w-transom.png
4' Dutch Shed Door                  | 4' dutch shed door                  | img/items/4_Dutch_Shed_Door.png
4' Shed Door                        | 4' shed door                        | img/items/4_Shed_Door.png
4' Shed Door (w-transom)            | 4' shed door (w-transom)            | img/items/4_Shed_Door_w-transom.png
6'x7' Roll Up Door                  | 6'x7' roll up door                  | img/items/6x7_Roll_Up_Door.png
8'x8' Roll Up Door                  | 8'x8' roll up door                  | img/items/8x8_Roll_Up_Door.png
9'x7' Roll Up Door                  | 9'x7' roll up door                  | img/items/9x7_Roll_Up_Door.png
15" Light French Doors              | 15 light french doors               | img/items/15Light_French_Doors.png
Double Dutch Shed Door              | double dutch shed door              | img/items/Double_Dutch_Shed_Door.png
Double Shed Door                    | double shed door                    | img/items/Double_Shed_Door.png
Double Shed Door (w-transom)        | double shed door (w-transom)        | img/items/Double_Shed_Doors_w-transom.png
Econ Door                           | econ door                           | img/items/Econ_Door.png
Steel 9' Light Walk-in Door         | steel 9' light walk-in door         | img/items/Steel_9Light_Walk-in_Door.png
Steel French Doors                  | steel french doors                  | img/items/Steel_French_Doors.png
Steel Walk-in Door                  | steel walk-in Door                  | img/items/Steel_Walk-in_Door.png
1'x1' Loft Window                   | 1'x1' loft window                   | img/items/1x1_Loft_Window.png
2'x3' Single Pane Window            | 2'x3' single pane window            | img/items/2x3_Window.png img/items/2x3_Window_Shutters.png img/items/2x3_Window_Flower_Box.png img/items/2x3_Window_Shutters_Flower_Box.png
3'x3' Single Pane Window            | 3'x3' single pane window            | img/items/3x3_Window.png img/items/3x3_Window_Shutters.png img/items/3x3_Window_Flower_Box.png img/items/3x3_Window_Shutters_Flower_Box.png
29 Transom Window                   | 29 transom window                   | img/items/29_Transom_Window.png
60 Transom Window                   | 60 transom window                   | img/items/60_Transom_Window.png
1'x1' Loft Gable Window             | 1'x1' loft gable window             | img/items/1x1_Loft_Window.png
29 Transom Gable Window             | 29 transom gable window             | img/items/29_Transom_Window.png
60 Transom Gable Window             | 60 transom gable window             | img/items/60_Transom_Window.png
8' x 4' Deck                        | 8' x 4' deck                        | We don't have yet, temporary you can use img/Deck8Item.png
10' x 4' Deck                       | 10' x 4' deck                       | We don't have yet, temporary you can use img/Deck10Item.png
12' x 4' Deck                       | 12' x 4' deck                       | We don't have yet, temporary you can use img/Deck12Item.png

List of possible data-ids for Montana Shed Center:

Name                                                | Value                                                 | Relative image URL
--------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------
3' Steel Entry Door with Half Glass                 | 3' steel entry door with half glass                   | img/items/3_Steel_Entry_Door_with_Half_Glass.png
3' Steel Entry Door (lh-out)                        | 3' steel entry door (lh-out)                          | img/items/3_Steel_Entry_Door_left_hand_out.png
3' Steel Entry Door Half Glass with Grids (lh-out)  | 3' steel entry door half glass with grids (lh-out)    | img/items/3_Steel_Entry_Door_Half_Glass_with_Grids_left_hand_out.png
3' Steel Entry Door with Half Glass (lh-out)        | 3' steel entry door with half glass (lh-out)          | img/items/3_Steel_Entry_Door_with_Half_Glass_left_hand_out.png
3' Steel Entry Door                                 | 3' steel entry door                                   | None
3' Steel Entry Door with Grid Half Glass            | 3' steel entry door with grid half glass              | None
42 Single Wood Door (arch-top-trim)                 | 42 single wood door (arch-top-trim)                   | img/items/42_Single_Wood_Door_arch_top_trim.png
5'x6' Double Wood Door                              | 5'x6' double wood door                                | img/items/5x6_Double_Wood_Door.png
5'x7' Double Wood Door                              | 5'x7' double wood door                                | img/items/5x7_Double_Wood_Door.png
5'x7' Roll Up Door                                  | 5'x7' roll up door                                    | img/items/5x7_Roll_Up_Door.png
6'x6' Double Wood                                   | 6'x6' double wood                                     | img/items/6x6_Double_Wood_Door.png
6'x6' Roll Up Door                                  | 6'x6' roll up door                                    | img/items/6x6_Roll_Up_Door.png
6'x7' Double Wood Door                              | 6'x7' double wood door                                | img/items/6x7_Double_Wood_Door.png
7'x6' Double Wood Door                              | 7'x6' double wood door                                | img/items/7x6_Double_Wood_Door.png
7'x7' Double Wood Door                              | 7'x7' double wood door                                | img/items/7x7_Double_Wood_Door.png
7'x7' Roll Up Door                                  | 7'x7' roll up door                                    | img/items/7x7_Roll_Up_Door.png
8'x6' Double Wood Door                              | 8'x6' double wood door                                | img/items/8x6_Double_Wood_Door.png
8'x7' Double Wood Door                              | 8'x7' double wood door                                | img/items/8x7_Double_Wood_Door.png
8'x7' Overhead Garage Door                          | 8'x7' overhead garage door                            | img/items/8x7_Overhead_Garage_Door.png
8'x7' Roll Up Door                                  | 8'x7' roll up door                                    | img/items/8x7_Roll_Up_Door.png
8'x8' Overhead Garage Door                          | 8'x8' overhead garage door                            | img/items/8x8_Overhead_Garage_Door.png
9'x6' Double Wood Door                              | 9'x6' double wood door                                | img/items/9x6_Double_Wood_Door.png
9'x7' Overhead Garage Door                          | 9'x7' overhead garage door                            | img/items/9x7_Overhead_Garage_Door.png
9'x8' Overhead Garage Door                          | 9'x8' overhead garage door                            | img/items/9x8_Overhead_Garage_Door.png
9'x8' Roll Up Door                                  | 9'x8' roll up door                                    | img/items/9x8_Roll_Up_Door.png
10'x7' Overhead Garage Door                         | 10'x7' overhead garage door                           | img/items/10x7_Overhead_Garage_Door.png
10'x8' Overhead Garage Door                         | 10'x8' overhead garage door                           | img/items/10x8_Overhead_Garage_Door.png
10'x8' Roll Up Door                                 | 10'x8' roll up door                                   | img/items/10x8_Roll_Up_Door.png
Single Wood Door 36"x72"                            | Single wood door 36"x72"                              | img/items/Single_Wood_Door_36x72.png
Single Wood Door 42"x72"                            | Single wood door 42"x72"                              | img/items/Single_Wood_Door_42x72.png
8'x7' Overhead Garage Door with Windows             | 8'x7' overhead garage door with windows               | img/items/8x7_Overhead_Garage_Door_With_Windows.png
8'x8' Overhead Garage Door with Windows             | 8'x8' overhead garage door with windows               | img/items/8x8_Overhead_Garage_Door_With_Windows.png
9'x7' Overhead Garage Door with Windows             | 9'x7' overhead garage door with windows               | img/items/9x7_Overhead_Garage_Door_With_Windows.png
9'x8' Overhead Garage Door with Windows             | 9'x8' overhead garage door with windows               | img/items/9x8_Overhead_Garage_Door_With_Windows.png
10'x7' Overhead Garage Door with Windows            | 10'x7' overhead garage door with windows              | img/items/10x7_Overhead_Garage_Door_With_Windows.png
10'x8' Overhead Garage Door with Windows            | 10'x8' overhead garage door with windows              | img/items/10x8_Overhead_Garage_Door_With_Windows.png

**Please Note** Some items have 4 versions of icons - with shutters, with box, with both, with neither. You should dynamically change icons of items, when user switch showShutters/showFlowerBoxes

There also a group of 2D items, used to place objects on the plan view. You should show them, when user in 2D plan view
and hide them, when user in 3D view. To keep track on 3d/2d view, use "changeView" event.
2D items are pretty similar to 3D items and have same requirements for DOM elements.
Example:
```
<script>
    let viewer3D = new Viewer3D(800, 600);
    $('.viewer-3d').append(viewer3D.element);
</script>
...
<body>
    <div data-id="2d-lawn-mower" class="item2d" draggable="true">
        <div style="background-image:url(img/LawnMowerItem.png)"></div>
        <span>Lawn Mower</span>
    </div>
</body>
```

List of possible 2D data-ids:

Name                        | Value
--------------------------- | --------------------
Loft                        | loft
ATV                         | 2d-atv
Bed                         | 2d-bed
Bike                        | 2d-bike
Computer table              | 2d-computer_table
Croquet                     | 2d-croquet
KF-04                       | 2d-kf-04
Lawn Mower                  | 2d-lawn-mower
Lazyboy                     | 2d-lazy-boy
Office Desk                 | 2d-office_desk
Ping Pong table             | 2d-ping_pong
Sofa #1                     | 2d-sofa1
Sofa #2                     | 2d-sofa2
Toolbox                     | 2d-toolbox
TV                          | 2d-tv
Wagon                       | 2d-wagon
Wheel barrow                | 2d-wheel_barrow
Work bench                  | 2d-work_bench

### Shed styles
List of possible shed styles for Urban Shed Concepts:

Name                        | Value
--------------------------- | --------------------
Urban Barn                  | Urban Barn
Urban Shack                 | Urban Shack
Urban Lean-to               | Urban Lean-to

List of possible shed styles for Montana Shed Center

Name                        | Value
--------------------------- | --------------------
A-Frame                     | A Frame
Double Wide Frame           | Double White
Eco Shed                    | Eco
Caste Mountain              | Caste Mountain
Quaker                      | Quaker
Mini Barn                   | Mini Barn
Single Slope                | Single Slope
"# threejs-shadow" 
