const _ = require('lodash');

/**
 * Shows the menu on top of the 3D viewer.
 * Please note, that Menu.parent should be set to proper DOM element, before calling this function
 * @param mouseEvent Mouse event that caused the menu
 * @param options Array of option objects like:
 *  {
 *      icon: {
 *          fa: String,
 *          color: String
 *      },
 *      text: String,
 *      click: Function
 *  },
 *      where:
 *          fa - font-awesome class, for example for fa-trash it's 'trash', for fa-refresh the proper value is 'refresh'
 *          color - css color value, could be hex value, like '#fff' or rgb/rgba value
 *          text - text of the option
 *          click - handler that called, when user clicks this option
 * @constructor
 */
function Menu(mouseEvent, options) {
    if (!Menu.parent) {
        throw(new Error("Set Menu.parent to the DOM element"));
    }

    let menuBG = document.createElement('div');
    menuBG.setAttribute('class', 'context-menu-bg');
    Menu.parent.appendChild(menuBG);

    let menu = document.createElement('div');
    menu.setAttribute('class', 'context-menu');
    Menu.parent.appendChild(menu);

    menu.setAttribute('style', 'top:' + (mouseEvent.touchY || mouseEvent.offsetY) + 'px;left:' + (mouseEvent.touchX || mouseEvent.offsetX) + 'px;');

    _.each(options, (option)=> {
        let optionElement = document.createElement('div');
        optionElement.setAttribute('class', 'context-menu-option');

        if (option.icon && option.icon.fa) {
            let icon = document.createElement('i');
            icon.setAttribute('class', 'fa fa-' + option.icon.fa);
            if (option.icon.color) {
                icon.setAttribute('style', 'color:' + option.icon.color);
            }

            optionElement.appendChild(icon);
        }

        let textSpan = document.createElement('span');
        textSpan.innerText = option.text;
        optionElement.appendChild(textSpan);

        function optionClicked() {
            removeMenu();
            if (option.click) {
                option.click();
            }
        }

        optionElement.addEventListener('click', optionClicked);
        optionElement.addEventListener('touchend', optionClicked);

        menu.appendChild(optionElement);
    });

    menuBG.addEventListener('click', ()=> {
        removeMenu();
    });
    menuBG.addEventListener('touchend', ()=> {
        removeMenu();
    });

    function removeMenu() {
        Menu.parent.removeChild(menuBG);
        Menu.parent.removeChild(menu);
    }
}

Menu.parent = null;

module.exports = Menu;
