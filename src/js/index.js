/**
 * Initial script, used with test index.html.
 * @author Ievgen Petrashchuk a.k.a Vaper de kin 2017
 */
const Viewer3D = require('./Viewer3D');
const _ = require('lodash');

const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
    })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

const isFirefox = typeof InstallTrigger !== 'undefined';
const isLinux = /Linux/.test(window.navigator.platform);

/**
 * Downloads a text file
 * @param filename Filename you want
 * @param text Text contents
 */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

document.addEventListener('DOMContentLoaded', ()=> {
    if (typeof test !== 'undefined') {
        $.fn.touch = function (handler) {
            $(this).on('click touchend', handler);
        };

        let viewer3D = new Viewer3D(600, 400, {
            roofs: ["Heritage Rustic Black", "Heritage Black Walnut", "Heritage Rustic Cedar",
                "Heritage Mountain Slate", "Vintage White", "Rustic Red", "Gray", "Evergreen",
                "Desert Sand", "Coal Black", "Galvalume"],
            windows: ["1'x1' loft window", "14'x21' aluminum single pane window", "18'x27' aluminum single pane window",
                "18'x36' aluminum single pane window", "23'x10' transom window with grids",
                "24'x24' vinyl double pane window (without-grids)", "24'x24' vinyl double pane window with grids",
                "24'x27' aluminum single pane window", "24'x36' aluminum single pane window",
                "24'x36' vinyl double pane window (without-grids)", "24'x36' vinyl double pane window with grids",
                "29'x10' transom window with grids", "30'x40' vinyl double pane window (without-grids)",
                "30'x40' vinyl double pane window with grids", "36'x48' vinyl double pane window (without-grids)",
                "36'x48' vinyl double pane window with grids", "60'x10' transom window with grids",
                "72'x10' transom window with grids"],
            doors: ["3' steel entry door with half glass",
                "3' steel entry door (lh-out)",
                "3' steel entry door half glass with grids (lh-out)",
                "3' steel entry door with half glass (lh-out)",
                "3' steel entry door",
                "3' steel entry door with grid half glass",
                "5'x7' roll up door",
                "6'x6' roll up door",
                "7'x7' roll up door",
                "8'x7' overhead garage door",
                "8'x7' roll up door",
                "8'x8' overhead garage door",
                "9'x7' overhead garage door",
                "9'x8' overhead garage door",
                "9'x8' roll up door",
                "10'x7' overhead garage door",
                "10'x8' overhead garage door",
                "10'x8' roll up door",
                "5'x6' double wood door",
                "5'x7' double wood door",
                "6'x6' double wood door",
                "6'x7' double wood door",
                "7'x6' double wood door",
                "7'x7' double wood door",
                "8'x6' double wood door",
                "8'x7' double wood door",
                "9'x6' double wood door",
                'single wood door 36"x72"',
                'single wood door 42"x72"',
                '42 single wood door (arch-top-trim)',
                "8'x7' overhead garage door with windows",
                "8'x8' overhead garage door with windows",
                "9'x7' overhead garage door with windows",
                "9'x8' overhead garage door with windows",
                "10'x7' overhead garage door with windows",
                "10'x8' overhead garage door with windows"
            ],
        });
        $('.viewer-3d').append(viewer3D.element);

        viewer3D.addEventListener('progress', (e)=> {
            //console.log((e.loaded / e.total * 100).toFixed(2) + '%');
        });

        setTimeout(()=> {
            viewer3D.shed.setSize(8, 12, 8, "Single Slope");
        }, 200);

        viewer3D.addEventListener('ready', ()=> {
            console.log('ready');
        });

        $('.set').touch(()=> {
            viewer3D.shed.setSize($('.width').val(), $('.depth').val(), $('.height').val(), $('.style').val());
        });

        //for dimensions
        $('#eightdimension').touch(()=> {
            let width = 8;
            let height = 7;
            let depth = 12;
            viewer3D.shed.setSize(width, depth, height);
        });
        $('#tendimension').touch(()=> {
            let width = 10;
            let height = 7;
            let depth = 16;
            viewer3D.shed.setSize(width, depth, height);
        });
        $('#twelvedimension').touch(()=> {
            let width = 12;
            let height = 7;
            let depth = 32;
            viewer3D.shed.setSize(width, depth, height);
        });

        $('.show-door').touch(function () {
            viewer3D.shed.doors.show = $(this)[0].checked;
        });

        $('.show-windows').touch(function () {
            viewer3D.shed.windows.show = $(this)[0].checked;
        });

        $('.show-flower-boxes').touch(function () {
            viewer3D.shed.windows.flowerBoxes.show = $(this)[0].checked;
        });

        $('.show-shutters').touch(function () {
            viewer3D.shed.windows.shutters.show = $(this)[0].checked;
        });

        $('.enable-flower-boxes').touch(function () {
            viewer3D.shed.windows.flowerBoxes.enable = $(this)[0].checked;
        });

        $('.enable-shutters').touch(function () {
            viewer3D.shed.windows.shutters.enable = $(this)[0].checked;
        });

        $('.show-environemnt').touch(function () {
            viewer3D.environment.enabled = $(this)[0].checked;
        });

        $('.grass-scale-set').touch(()=> {
            viewer3D.environment.grassScale = $('.grass-scale').val();
        });

        $('.grass-count-set').touch(()=> {
            viewer3D.environment.grassCount = parseInt($('.grass-count').val());
        });

        let mainColor = '#b5001a';
        let secondaryColor = '#ffffff';

        $('.colors-item').touch((e)=> {
            mainColor = e.currentTarget.getAttribute('color');
            secondaryColor = document.getElementById("primarykey").getAttribute("secondarycolor");
            viewer3D.shed.setColor(mainColor, secondaryColor);
            document.getElementById("primarykey").setAttribute("maincolor", mainColor);
        });

        $('.trim-colors-item').touch((e)=> {
            mainColor = document.getElementById("primarykey").getAttribute("maincolor");
            secondaryColor = e.currentTarget.getAttribute('color');

            viewer3D.shed.setColor(mainColor, secondaryColor);
            document.getElementById("primarykey").setAttribute("secondarycolor", secondaryColor);
        });

        $('.main-color').colorpicker({
            color: '#b5001a',
            format: 'hex'
        }).on('changeColor', (e)=> {
            mainColor = e.color.toString('hex');
            viewer3D.shed.setColor(mainColor, secondaryColor);
        });

        $('.secondary-color').colorpicker({
            color: '#ffffff',
            format: 'hex'
        }).on('changeColor', (e)=> {
            secondaryColor = e.color.toString('hex');
            viewer3D.shed.setColor(mainColor, secondaryColor);
        });

        $('.view-button').touch((e)=> {
            viewer3D.perspective = e.currentTarget.getAttribute('data-type');
        });

        $('.roof-item').touch((e)=> {
            viewer3D.shed.roof.color = e.currentTarget.getAttribute('data-type');
        });

        $('.save').touch(()=> {
            download("usc3d.json", JSON.stringify(viewer3D.save()));
        });

        $('.load').touch(()=> {
            let $fileInput = $('<input>').attr({style: 'display:none;', type: 'file'}).appendTo($('body'));

            $fileInput.click();

            $fileInput.on("change", (e)=> {
                let reader = new FileReader();
                reader.onload = (e) => {
                    viewer3D.load(JSON.parse(e.target.result));
                };
                reader.readAsText($fileInput[0].files[0]);

                $fileInput.remove();
            });
        });

        $('.full-screen').touch(()=> {
            if (viewer3D.element.requestFullScreen) {
                viewer3D.element.requestFullScreen();
            } else if (viewer3D.element.webkitRequestFullScreen) {
                viewer3D.element.webkitRequestFullScreen();
            } else if (viewer3D.element.mozRequestFullScreen) {
                viewer3D.element.mozRequestFullScreen();
            } else if (viewer3D.element.msRequestFullScreen) {
                viewer3D.element.msRequestFullScreen();
            }

            //let fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            //console.log(window.innerWidth + "x" + window.innerHeight);
            /* viewer3D.width = window.innerWidth;
             viewer3D.height = window.innerHeight;*/
        });

        $('.get-views').touch(()=> {
            viewer3D.getImages().then((views)=> {
                $('.render-front').html('<img src="' + views.front + '">');
                $('.render-left').html('<img src="' + views.left + '">');
                $('.render-back').html('<img src="' + views.back + '">');
                $('.render-right').html('<img src="' + views.right + '">');
                $('.render-plan').html('<img src="' + views.plan + '">');
            });
        });

        document.onfullscreenchange = document.onwebkitfullscreenchange = document.onmozfullscreenchange = document.MSFullscreenChange = document.onwebkitfullscreenchange = document.onwebkitfullscreenchange = (event)=> {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                viewer3D.width = window.innerWidth;
                viewer3D.height = window.innerHeight;
            } else {
                viewer3D.width = 600;
                viewer3D.height = 400;
            }
        };

        viewer3D.addEventListener("changeView", (e)=> {
        });

        viewer3D.addEventListener("change", (e)=> {
            console.log("change");
        });
    }

    let items = document.getElementsByClassName('item');
    let items2D = document.getElementsByClassName('item2d');
    _.each([].slice.call(items).concat([].slice.call(items2D)), (element)=> {
        element.addEventListener('touchstart', (e)=> {
            let event = new DragEvent("dragstart", {dataTransfer: new DataTransfer()});
            window.mainDragEvent = event;
            element.dispatchEvent(event);
        });
        element.addEventListener('dragstart', (e)=> {
            let data = {
                id: e.currentTarget.getAttribute('data-id'),
                info: e.currentTarget.getAttribute('data-info')
            };

            e.dataTransfer.setData(JSON.stringify(data), '');

            //Drag-n-drop does not work on Mac and firefox on inux
            if (!isSafari && !(isLinux && isFirefox)) {
                var crt = document.createElement('div');
                crt.style.display = "none";
                e.dataTransfer.setDragImage(crt, 0, 0);
            }
        }, false);

    });

}, false);
