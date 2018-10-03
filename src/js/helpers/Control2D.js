const THREE = require('three');
/**
 * Camera control for orthogonal/2D plan view
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class Control2D {
    /**
     * Initializes the controls
     * @param camera THREE.OrthographicCamera object
     * @param renderElement renderer's DOMElement
     */
    constructor(camera, renderElement) {

        let self = this;
        let lastMouse_;
        let width = renderElement.width;
        let height = renderElement.height;
        let zoom_ = {max: 2.5, min: 0.5};

        /**
         * Default values. THese values are used by setDefaults()
         * @type {{x: number, z: number, zoom: number}}
         * @private
         */
        const defaults_ = {
            x: 0,
            z: 0,
            zoom: 1
        };

        /**
         * Indicates if control is enabled (reacts on mouse events) or not
         * @type {boolean}
         */
        this.enabled = true;

        camera.position.setY(6100);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        camera.rotateZ(Math.PI * 0.5);

        renderElement.removeEventListener("mousemove", mouseMoveHandler);
        renderElement.addEventListener("mousemove", mouseMoveHandler);

        renderElement.removeEventListener("mousedown", mouseDownHandler);
        renderElement.addEventListener("mousedown", mouseDownHandler);

        renderElement.removeEventListener("mousewheel", mouseWheelHandler);
        renderElement.addEventListener("mousewheel", mouseWheelHandler);

        /**
         * Returns camera to initial position
         */
        this.setDefaults = ()=> {
            camera.position.setX(defaults_.x);
            camera.position.setZ(defaults_.z);
            camera.zoom = defaults_.zoom;
            camera.updateProjectionMatrix();
        };


        function mouseDownHandler(e) {
            lastMouse_ = new THREE.Vector3(1 - 2 * ( e.offsetY / height), 0, 2 * (e.offsetX / width) - 1);
        }

        function mouseMoveHandler(e) {
            if (self.enabled && (e.buttons == 4 || e.button == 1)) {
                let currentMouse = new THREE.Vector3(1 - 2 * ( e.offsetY / height), 0, 2 * (e.offsetX / width) - 1);
                let moveVector = lastMouse_.clone().sub(currentMouse);
                moveVector.z *= -1;
                moveVector.x *= -1;
                lastMouse_ = currentMouse;

                let newPosition = camera.position.clone().add(moveVector.multiplyScalar(500));
                camera.position.setX(newPosition.x);
                camera.position.setZ(newPosition.z);
            }
        }

        function mouseWheelHandler(e) {
            camera.zoom = Math.max(Math.min(zoom_.max, camera.zoom + e.wheelDelta / 1000), zoom_.min);

            camera.updateProjectionMatrix();
        }

        this.setDefaults();
    }
}

module.exports = Control2D;
