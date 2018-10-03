/**
 * Map asset paths
 */

const _ = require('lodash');
const Viewer3DPath = window.Viewer3DPath || '';
const assets = require('../../assets.json');

module.exports = {
    models: _.mapValues(assets.models, (path)=> {
        return Viewer3DPath + 'models/' + path;
    }),
    img: _.mapValues(assets.img, (path)=> {
        return Viewer3DPath + 'img/' + path;
    }),
    fonts: _.mapValues(assets.fonts, (path)=> {
        return Viewer3DPath + path;
    }),
    shader: _.mapValues(assets.shader, (path)=> {
        return Viewer3DPath + 'shaders/' + path;
    })
};
