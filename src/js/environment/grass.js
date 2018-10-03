/**
 * LICENSE: MIT
 * Copyright (c) 2016 by Mike Linkovich
 *
 * Creates & animates a large patch of grass to fill the foreground.
 * One simple blade of grass mesh is repeated many times using instanced arrays.
 *
 * Uses grass shaders (see: shader/grass.*.glsl)
 *
 * Modified by Yevhen Petrashchuk a.k.a. Vaper de kin 2017
 *
 * @author Mike Linkovich 2016
 * @author Yevhen Petrashchuk 2017
 */

const THREE = require('three');
const assets = require('./../helpers/assets');
const SimplexNoise = require('simplex-noise');
const _ = require('lodash');

/**
 * Grass 3D object
 */
class Grass extends THREE.Object3D {
    /**
     * Generates the grass, excluding rectangular area, defined by shedWidth and shedDepth
     * @param shedWidth Shed's width
     * @param shedDepth Shed's depth
     */
    constructor(shedWidth, shedDepth) {

        super();

        let self = this;
        let mesh_, time_;
        let grassScale_ = 1;

        let textureLoader_ = new THREE.TextureLoader();
        let simplex_ = new SimplexNoise();

        const BLADE_SEGS = 2; // # of blade segments
        const BLADE_VERTS = (BLADE_SEGS + 1) * 2; // # of vertices per blade (1 side)
        const BLADE_INDICES = BLADE_SEGS * 12;
        const BLADE_WIDTH = 2.5;
        const BLADE_HEIGHT_MIN = 30;
        const BLADE_HEIGHT_MAX = 50;
        const RADIUS = 2500;

        /**
         * Setup options for grass patch
         */
        let opts = {
            lightDir: new THREE.Vector3(0.4242640, 0.5656854, 0.7071067),
            numBlades: 20000,
            radius: RADIUS,
            texture: textureLoader_.load(assets.img["grass_t"]),
            vertScript: assets.shader['grass.vert'],
            fragScript: assets.shader['grass.frag'],
            heightMap: textureLoader_.load(assets.img["white"]),
            heightMapScale: new THREE.Vector3(1, 1, 1),
            fogColor: new THREE.Color(0x646a12),
            fogFar: RADIUS * 20.0,
            grassFogFar: RADIUS * 2,
            grassColor: new THREE.Color(0x646a12),
            transitionLow: 0.31,
            transitionHigh: 0.36,
            windIntensity: 0.5
        };

        let buffers = {
            // Tells the shader which vertex of the blade its working on.
            // Rather than supplying positions, they are computed from this vindex.
            vindex: new Float32Array(BLADE_VERTS * 2),
            // Shape properties of all blades
            shape: new Float32Array(4 * opts.numBlades),
            // Positon & rotation of all blades
            offset: new Float32Array(4 * opts.numBlades),
            // Indices for a blade
            index: new Uint16Array(BLADE_INDICES)
        };

        this.update = this.setShedSize = ()=> {
        };

        let promises = _.map([assets.shader['grass.vert'], assets.shader['grass.frag']], (path)=> {
            return new Promise((done)=> {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', path);
                xhr.onload = ()=> {
                    done(xhr.responseText);
                };
                xhr.send();
            });
        });

        Promise.all(promises).then((results)=> {
            opts.vertScript = results[0];
            opts.fragScript = results[1];

            self.update = update;
            self.setShedSize = setShedSize;
            mesh_ = createMesh();
            self.add(mesh_);
            time_ = Date.now();
        });

        Object.defineProperties(this, {
            grassScale: {
                set: (value)=> {
                    grassScale_ = value;
                    initBladeShapeVerts(buffers.shape, opts.numBlades, buffers.offset);
                    mesh_.geometry.addAttribute('shape', new THREE.InstancedBufferAttribute(buffers.shape, 4));
                    mesh_.geometry.needsUpdate = true;
                }
            },
            grassCount: {
                set: (value)=> {
                    opts.numBlades = value;
                    buffers = {
                        // Tells the shader which vertex of the blade its working on.
                        // Rather than supplying positions, they are computed from this vindex.
                        vindex: new Float32Array(BLADE_VERTS * 2),
                        // Shape properties of all blades
                        shape: new Float32Array(4 * opts.numBlades),
                        // Positon & rotation of all blades
                        offset: new Float32Array(4 * opts.numBlades),
                        // Indices for a blade
                        index: new Uint16Array(BLADE_INDICES)
                    };

                    initBladeIndices(buffers.index, 0, BLADE_VERTS, 0);
                    initBladeOffsetVerts(buffers.offset, opts.numBlades, opts.radius);
                    initBladeShapeVerts(buffers.shape, opts.numBlades, buffers.offset);
                    initBladeIndexVerts(buffers.vindex);

                    const geo = new THREE.InstancedBufferGeometry()
                    geo.boundingSphere = new THREE.Sphere(
                        new THREE.Vector3(0, 0, 0), Math.sqrt(opts.radius * opts.radius * 2.0) * 10000.0
                    );
                    geo.addAttribute('vindex', new THREE.BufferAttribute(buffers.vindex, 1));
                    geo.addAttribute('shape', new THREE.InstancedBufferAttribute(buffers.shape, 4));
                    geo.addAttribute('offset', new THREE.InstancedBufferAttribute(buffers.offset, 4));
                    geo.setIndex(new THREE.BufferAttribute(buffers.index, 1));

                    mesh_.geometry = geo;
                    geo.needsUpdate = true;
                }
            }
        });

        /**
         * Creates a patch of grass mesh.
         */
        function createMesh() {
            // Buffers to use for instances of blade mesh

            initBladeIndices(buffers.index, 0, BLADE_VERTS, 0);
            initBladeOffsetVerts(buffers.offset, opts.numBlades, opts.radius);
            initBladeShapeVerts(buffers.shape, opts.numBlades, buffers.offset);
            initBladeIndexVerts(buffers.vindex);

            const geo = new THREE.InstancedBufferGeometry()
            geo.boundingSphere = new THREE.Sphere(
                new THREE.Vector3(0, 0, 0), Math.sqrt(opts.radius * opts.radius * 2.0) * 10000.0
            );
            geo.addAttribute('vindex', new THREE.BufferAttribute(buffers.vindex, 1));
            geo.addAttribute('shape', new THREE.InstancedBufferAttribute(buffers.shape, 4));
            geo.addAttribute('offset', new THREE.InstancedBufferAttribute(buffers.offset, 4));
            geo.setIndex(new THREE.BufferAttribute(buffers.index, 1));

            const tex = opts.texture;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            const htex = opts.heightMap;
            htex.wrapS = htex.wrapT = THREE.RepeatWrapping;
            const hscale = opts.heightMapScale;

            const lightDir = opts.lightDir.clone();
            lightDir.z *= 0.5;
            lightDir.normalize();

            // Fill in some constants that never change between draw calls
            const vertScript = opts.vertScript.replace(
                '%%BLADE_HEIGHT_TALL%%', (BLADE_HEIGHT_MAX * 1.5).toFixed(1)
            ).replace(
                '%%BLADE_SEGS%%', BLADE_SEGS.toFixed(1)
            ).replace(
                '%%PATCH_SIZE%%', (opts.radius * 2.0).toFixed(1)
            ).replace(
                '%%TRANSITION_LOW%%', opts.transitionLow.toString()
            ).replace(
                '%%TRANSITION_HIGH%%', opts.transitionHigh.toString()
            );

            // Setup shader
            const mat = new THREE.RawShaderMaterial({
                uniforms: {
                    lightDir: {type: '3f', value: lightDir.toArray()},
                    time: {type: 'f', value: 0.0},
                    map: {type: 't', value: tex},
                    heightMap: {type: 't', value: htex},
                    heightMapScale: {type: '3f', value: [hscale.x, hscale.y, hscale.z]},
                    camDir: {type: '3f', value: [1.0, 0.0, 0.0]},
                    drawPos: {type: '2f', value: [0.0, 0.0]},
                    fogColor: {type: '3f', value: opts.fogColor.toArray()},
                    fogNear: {type: 'f', value: 1.0},
                    fogFar: {type: 'f', value: opts.fogFar},
                    grassColor: {type: '3f', value: opts.grassColor.toArray()},
                    grassFogFar: {type: 'f', value: opts.grassFogFar},
                    windIntensity: {type: 'f', value: opts.windIntensity}
                },
                vertexShader: vertScript,
                fragmentShader: opts.fragScript,
                transparent: true
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.frustumCulled = true;

            mesh.rotateX(-Math.PI * 0.5);
            return mesh;
        }

        /**
         * Sets up indices for single blade mesh.
         * @param id array of indices
         * @param vc1 vertex start offset for front side of blade
         * @param vc2 vertex start offset for back side of blade
         * @param i index offset
         */
        function initBladeIndices(id, vc1, vc2, i) {
            let seg;
            // blade front side
            for (seg = 0; seg < BLADE_SEGS; ++seg) {
                id[i++] = vc1;
                id[i++] = vc1 + 1;
                id[i++] = vc1 + 2;
                id[i++] = vc1 + 2;
                id[i++] = vc1 + 1;
                id[i++] = vc1 + 3;
                vc1 += 2
            }
            // blade back side
            for (seg = 0; seg < BLADE_SEGS; ++seg) {
                id[i++] = vc2 + 2;
                id[i++] = vc2 + 1;
                id[i++] = vc2;
                id[i++] = vc2 + 3;
                id[i++] = vc2 + 1;
                id[i++] = vc2 + 2;
                vc2 += 2
            }
        }

        /** Set up shape variations for each blade of grass */
        function initBladeShapeVerts(shape, numBlades, offset) {
            let noise = 0;
            for (let i = 0; i < numBlades; ++i) {
                noise = Math.abs(simplex_.noise2D(offset[i * 4] * 0.03, offset[i * 4 + 1] * 0.03));
                noise = noise * noise * noise;
                noise *= 5.0;
                shape[i * 4] = BLADE_WIDTH * grassScale_ + Math.random() * BLADE_WIDTH * 0.5; // width
                shape[i * 4 + 1] = BLADE_HEIGHT_MIN * grassScale_ + Math.pow(Math.random(), 4.0) * (BLADE_HEIGHT_MAX - BLADE_HEIGHT_MIN) * grassScale_ + // height
                    noise;
                shape[i * 4 + 2] = Math.random() * 0.3;// lean
                shape[i * 4 + 3] = 0.05 + Math.random() * 0.3;// curve
            }
        }

        function getGrassPosition() {
            let x = 0;
            let y = 0;
            let randomRadius;

            let angle = 2 * Math.PI * Math.random();

            randomRadius = RADIUS * Math.random();
            x = randomRadius * Math.cos(angle);
            y = randomRadius * Math.sin(angle);

            let grassPadding = 20;
            if ((x <= shedWidth * 0.5 + grassPadding && x >= -shedWidth * 0.5 - grassPadding) && (y <= shedDepth * 0.5 + grassPadding && y >= -shedDepth * 0.5 - grassPadding)) {
                x = y = NaN;
            }

            return {x: x + RADIUS, y: y + RADIUS};
        }

        /** Set up positons & rotation for each blade of grass */
        function initBladeOffsetVerts(offset, numBlades, patchRadius) {
            for (let i = 0; i < numBlades; ++i) {
                let position = getGrassPosition();
                let x = position.x;
                let y = position.y;
                offset[i * 4] = x;//nrand() * patchRadius;
                offset[i * 4 + 1] = y;// nrand() * patchRadius;
                offset[i * 4 + 2] = 0.0;// z
                offset[i * 4 + 3] = Math.PI * 2.0 * Math.random();// rot
            }
        }

        /** Set up indices for 1 blade */
        function initBladeIndexVerts(vindex) {
            for (let i = 0; i < vindex.length; ++i) {
                vindex[i] = i
            }
        }

        /**
         * Call each frame to animate grass blades.
         */
        function update(camera) {
            let time = (Date.now() - time_) / 1000;
            const mat = mesh_.material;
            mat.uniforms['time'].value = time;

            /*let cameraDirection = camera.getWorldDirection();
             let drawPos = new THREE.Vector2(Math.cos(yaw) * opts.radius - opts.radius * 0.5, Math.sin(yaw) * opts.radius);

             let p = mat.uniforms['camDir'].value;
             p[0] = cameraDirection.x;
             p[1] = cameraDirection.y;
             p[2] = cameraDirection.z;
             p = mat.uniforms['drawPos'].value;
             p[0] = camera.position.x;
             p[1] = -camera.position.z;*/
        }

        function setShedSize(width, depth) {
            shedWidth = width;
            shedDepth = depth;

            initBladeOffsetVerts(buffers.offset, opts.numBlades, opts.radius);
            mesh_.geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(buffers.offset, 4));
            mesh_.geometry.needsUpdate = true;
        }

        function destroy() {
            mesh_.geometry.dispose();
            mesh_.material.dispose();
            mesh_ = null;
        }

        /**
         * Returns random value from -1 to 1
         * @returns Random number in interval [-1; 1]
         */
        function nrand() {
            return Math.random() * 2.0 - 1.0
        }
    }
}

module.exports = Grass;
