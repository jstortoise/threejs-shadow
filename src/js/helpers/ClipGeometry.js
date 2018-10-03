const THREE = require('three');
const _ = require('lodash');

/**
 * Geometry that can be cliped by horizontal lines (z-axiss). Used when deck cuts the walls
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 */
class ClipGeometry extends THREE.BufferGeometry {
    /**
     * Generates the geometry from THREE.PlaneGeometry
     * @param planeGeometry THREE.PlaneGeometry object
     */
    constructor(planeGeometry) {
        super();
        let self = this;

        let clipRects_ = [];

        planeGeometry.computeBoundingBox();
        let width_ = Math.round((planeGeometry.boundingBox.max.x - planeGeometry.boundingBox.min.x) * 100) / 100;
        let height_ = Math.round((planeGeometry.boundingBox.max.y - planeGeometry.boundingBox.min.y) * 100) / 100;

        let vertices_ = [
            -width_ * 0.5, -height_ * 0.5, 0,   //0
            width_ * 0.5, -height_ * 0.5, 0,    //1
            -width_ * 0.5, height_ * 0.5, 0,    //2
            width_ * 0.5, height_ * 0.5, 0,     //3
        ];

        let indices_ = [
            2, 0, 1,
            2, 1, 3
        ];

        let uvs_ = [
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];

        let normal_ = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ];

        setAttributes();

        Object.defineProperties(this, {
            clip: {
                get: ()=> {
                    let clip = {};
                    clip.push = clipPush;
                    clip.pop = clipPop;

                    Object.defineProperties(clip, {
                        areas: {
                            get: ()=> {
                                let areas = [];
                                let clips = clipRects_.slice();

                                _.each(clips, (clip)=> {
                                    areas.push(clip.min);
                                    areas.push(clip.max);
                                });


                                areas.sort((a, b)=> {
                                    return a - b;
                                });

                                areas.unshift(-width_ * 0.5);
                                areas.push(width_ * 0.5);

                                return _.times(areas.length / 2, (i)=> {
                                    let rect = {minX: areas[i * 2], maxX: areas[i * 2 + 1]};

                                    return {
                                        width: rect.maxX - rect.minX,
                                        height: height_,
                                        center: (rect.minX + rect.maxX) * 0.5
                                    }
                                });
                            }
                        },
                        rectangles: {
                            get: ()=> {
                                return clipRects_.slice();
                            }
                        }
                    });

                    return clip;
                }
            },
            width: {
                get: ()=> {
                    return width_;
                }
            },
            height: {
                get: ()=> {
                    return height_;
                }
            }
        });

        /**
         * Clones the ClipGeometry
         * @returns {ClipGeometry} Clonned ClipGeometry
         */
        this.clone = ()=> {
            let returnGeometry = new ClipGeometry(planeGeometry.clone());
            _.each(clipRects_, (rect)=> {
                returnGeometry.clip.push(rect.min, rect.max);
            });

            return returnGeometry;
        };

        /**
         * Cuts the geometry. Areaa between minX and maxX (called clip rectangle) wll be clipped
         */
        function clipPush(minX, maxX) {
            minX = Math.max(minX, -width_ * 0.5);
            maxX = Math.min(maxX, width_ * 0.5);

            clipRects_.push({min: minX, max: maxX});
            generateGeometry();
        }

        /**
         * Removes last clip rectangle
         * @returns Clip rectangle as object {min:Number,max:Number}
         */
        function clipPop() {
            let returnValue = clipRects_.pop();
            generateGeometry();

            return returnValue;
        }

        /**
         * Actually generates new geometry, from list of clip rectangles
         */
        function generateGeometry() {
            let areas = [];
            let clips = clipRects_.slice();

            _.each(clips, (clip)=> {
                areas.push(clip.min);
                areas.push(clip.max);
            });


            areas.sort((a, b)=> {
                return a - b;
            });

            areas.unshift(-width_ * 0.5);
            areas.push(width_ * 0.5);

            vertices_ = [];
            indices_ = [];
            normal_ = [];
            uvs_ = [];
            let aLength = areas.length;
            _.times(aLength * 2, (i)=> {
                vertices_[i * 3] = areas[i % aLength];
                vertices_[i * 3 + 1] = i < aLength ? -height_ * 0.5 : height_ * 0.5;
                vertices_[i * 3 + 2] = 0;

                normal_[i * 3] = 0;
                normal_[i * 3 + 1] = 0;
                normal_[i * 3 + 2] = 1;

                uvs_[i * 2] = (areas[i % aLength] + width_ * 0.5) / width_;
                uvs_[i * 2 + 1] = i < aLength ? 0 : 1;
            });

            _.times(aLength * 0.5, (i)=> {
                indices_.push(i * 2);
                indices_.push(i * 2 + 1);
                indices_.push(i * 2 + aLength);

                indices_.push(i * 2 + 1);
                indices_.push(i * 2 + aLength + 1);
                indices_.push(i * 2 + aLength);
            });

            setAttributes();
        }

        /**
         * Sets the attributes of current geometry, like position, uvs, normals.
         * Used in the end of the geometry generation
         */
        function setAttributes() {
            self.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices_), 3));
            self.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs_), 2));
            self.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normal_), 3));
            self.setIndex(new THREE.BufferAttribute(new Uint32Array(indices_), 1));
            self.needsUpdate = true;
        }
    }
}

module.exports = ClipGeometry;
