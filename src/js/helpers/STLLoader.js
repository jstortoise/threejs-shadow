const THREE = require('three');
/**
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 * @author gero3 / https://github.com/gero3
 * @author Yevhen Petrashchuk a.k.a Vaper de kin 2017
 *
 * Description: A THREE loader for STL ASCII files, as created by Solidworks and other CAD programs.
 *
 * Supports both binary and ASCII encoded files, with automatic detection of type.
 *
 * Limitations:
 *  Binary decoding supports "Magics" color format (http://en.wikipedia.org/wiki/STL_(file_format)#Color_in_binary_STL).
 *  There is perhaps some question as to how valid it is to always assume little-endian-ness.
 *  ASCII decoding assumes file is UTF-8. Seems to work for the examples...
 *
 * Usage:
 *  let loader = new THREE.STLLoader();
 *  loader.load( './models/stl/slotted_disk.stl', function ( geometry ) {
 *    scene.add( new THREE.Mesh( geometry ) );
 *  });
 *
 * For binary STLs geometry might contain colors for vertices. To use it:
 *  // use the same code to load STL as above
 *  if (geometry.hasColors) {
 *    material = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: THREE.VertexColors });
 *  } else { .... }
 *  let mesh = new THREE.Mesh( geometry, material );
 */

class STLLoader {
    constructor(manager) {
        this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
    }

    /**
     * Parses STL file content, returning Buffer Geometry
     * @param data Content of the STL file
     * @returns {BufferGeometry} Geometry of the STL model
     */
    parse(data) {

        let isBinary = function () {

            let expect, face_size, n_faces, reader;
            reader = new DataView(binData);
            face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
            n_faces = reader.getUint32(80, true);
            expect = 80 + (32 / 8) + (n_faces * face_size);

            if (expect === reader.byteLength) {

                return true;

            }

            // some binary files will have different size from expected,
            // checking characters higher than ASCII to confirm is binary
            let fileLength = reader.byteLength;
            for (let index = 0; index < fileLength; index++) {

                if (reader.getUint8(index, false) > 127) {

                    return true;

                }

            }

            return false;

        };

        let binData = this.ensureBinary(data);

        return isBinary()
            ? this.parseBinary(binData)
            : this.parseASCII(this.ensureString(data));

    }

    /**
     * Parses binary STL content
     * @param data ByteArray data
     * @returns {BufferGeometry} STL model geometry
     */
    parseBinary(data) {

        let reader = new DataView(data);
        let faces = reader.getUint32(80, true);

        if (faces == 0)
            return null;

        let r, g, b, hasColors = false, colors;
        let defaultR, defaultG, defaultB, alpha;

        // process STL header
        // check for default color in header ("COLOR=rgba" sequence).

        for (let index = 0; index < 80 - 10; index++) {

            if ((reader.getUint32(index, false) == 0x434F4C4F /*COLO*/) &&
                (reader.getUint8(index + 4) == 0x52 /*'R'*/) &&
                (reader.getUint8(index + 5) == 0x3D /*'='*/)) {

                hasColors = true;
                colors = new Float32Array(faces * 3 * 3);

                defaultR = reader.getUint8(index + 6) / 255;
                defaultG = reader.getUint8(index + 7) / 255;
                defaultB = reader.getUint8(index + 8) / 255;
                alpha = reader.getUint8(index + 9) / 255;
            }
        }

        let dataOffset = 84;
        let faceLength = 12 * 4 + 2;

        let offset = 0;

        let geometry = new THREE.BufferGeometry();

        let vertices = new Float32Array(faces * 3 * 3);
        let normals = new Float32Array(faces * 3 * 3);

        for (let face = 0; face < faces; face++) {

            let start = dataOffset + face * faceLength;
            let normalX = reader.getFloat32(start, true);
            let normalY = reader.getFloat32(start + 4, true);
            let normalZ = reader.getFloat32(start + 8, true);

            if (hasColors) {

                let packedColor = reader.getUint16(start + 48, true);

                if ((packedColor & 0x8000) === 0) { // facet has its own unique color

                    r = (packedColor & 0x1F) / 31;
                    g = ((packedColor >> 5) & 0x1F) / 31;
                    b = ((packedColor >> 10) & 0x1F) / 31;
                } else {

                    r = defaultR;
                    g = defaultG;
                    b = defaultB;
                }
            }

            for (let i = 1; i <= 3; i++) {

                let vertexstart = start + i * 12;

                vertices[offset] = reader.getFloat32(vertexstart, true);
                vertices[offset + 1] = reader.getFloat32(vertexstart + 4, true);
                vertices[offset + 2] = reader.getFloat32(vertexstart + 8, true);

                normals[offset] = normalX;
                normals[offset + 1] = normalY;
                normals[offset + 2] = normalZ;

                if (hasColors) {
                    colors[offset] = r;
                    colors[offset + 1] = g;
                    colors[offset + 2] = b;
                }

                offset += 3;

            }

        }

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));

        if (hasColors) {
            geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.hasColors = true;
            geometry.alpha = alpha;
        }

        return geometry;

    }

    /**
     * Parse ASCII STL
     * @param data String STL content
     * @returns {BufferGeometry} STL model geometry
     */
    parseASCII(data) {

        let geometry, length, normal, patternFace, patternNormal, patternVertex, result, text;
        geometry = new THREE.Geometry();
        patternFace = /facet([\s\S]*?)endfacet/g;

        while (( result = patternFace.exec(data) ) !== null) {

            text = result[0];
            patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

            while (( result = patternNormal.exec(text) ) !== null) {

                normal = new THREE.Vector3(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));

            }

            patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

            while (( result = patternVertex.exec(text) ) !== null) {

                geometry.vertices.push(new THREE.Vector3(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5])));

            }

            length = geometry.vertices.length;

            geometry.faces.push(new THREE.Face3(length - 3, length - 2, length - 1, normal));

        }

        if (geometry.faces.length == 0)
            return null;

        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        return geometry;

    }

    ensureString(buf) {

        if (typeof buf !== "string") {
            let array_buffer = new Uint8Array(buf);
            let str = '';
            for (let i = 0; i < buf.byteLength; i++) {
                str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
            }
            return str;
        } else {
            return buf;
        }

    }

    ensureBinary(buf) {

        if (typeof buf === "string") {
            let array_buffer = new Uint8Array(buf.length);
            for (let i = 0; i < buf.length; i++) {
                array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
            }
            return array_buffer.buffer || array_buffer;
        } else {
            return buf;
        }

    }

}

if (typeof DataView === 'undefined') {

    DataView = function (buffer, byteOffset, byteLength) {

        this.buffer = buffer;
        this.byteOffset = byteOffset || 0;
        this.byteLength = byteLength || buffer.byteLength || buffer.length;
        this._isString = typeof buffer === "string";

    }

    DataView.prototype = {

        _getCharCodes: function (buffer, start, length) {
            start = start || 0;
            length = length || buffer.length;
            let end = start + length;
            let codes = [];
            for (let i = start; i < end; i++) {
                codes.push(buffer.charCodeAt(i) & 0xff);
            }
            return codes;
        },

        _getBytes: function (length, byteOffset, littleEndian) {

            let result;

            // Handle the lack of endianness
            if (littleEndian === undefined) {

                littleEndian = this._littleEndian;

            }

            // Handle the lack of byteOffset
            if (byteOffset === undefined) {

                byteOffset = this.byteOffset;

            } else {

                byteOffset = this.byteOffset + byteOffset;

            }

            if (length === undefined) {

                length = this.byteLength - byteOffset;

            }

            // Error Checking
            if (typeof byteOffset !== 'number') {

                throw new TypeError('DataView byteOffset is not a number');

            }

            if (length < 0 || byteOffset + length > this.byteLength) {

                throw new Error('DataView length or (byteOffset+length) value is out of bounds');

            }

            if (this.isString) {

                result = this._getCharCodes(this.buffer, byteOffset, byteOffset + length);

            } else {

                result = this.buffer.slice(byteOffset, byteOffset + length);

            }

            if (!littleEndian && length > 1) {

                if (!(result instanceof Array)) {

                    result = Array.prototype.slice.call(result);

                }

                result.reverse();
            }

            return result;

        },

        // Compatibility functions on a String Buffer

        getFloat64: function (byteOffset, littleEndian) {

            let b = this._getBytes(8, byteOffset, littleEndian),

                sign = 1 - (2 * (b[7] >> 7)),
                exponent = ((((b[7] << 1) & 0xff) << 3) | (b[6] >> 4)) - ((1 << 10) - 1),

                // Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
                mantissa = ((b[6] & 0x0f) * Math.pow(2, 48)) + (b[5] * Math.pow(2, 40)) + (b[4] * Math.pow(2, 32)) +
                    (b[3] * Math.pow(2, 24)) + (b[2] * Math.pow(2, 16)) + (b[1] * Math.pow(2, 8)) + b[0];

            if (exponent === 1024) {
                if (mantissa !== 0) {
                    return NaN;
                } else {
                    return sign * Infinity;
                }
            }

            if (exponent === -1023) { // Denormalized
                return sign * mantissa * Math.pow(2, -1022 - 52);
            }

            return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);

        },

        getFloat32: function (byteOffset, littleEndian) {

            let b = this._getBytes(4, byteOffset, littleEndian),

                sign = 1 - (2 * (b[3] >> 7)),
                exponent = (((b[3] << 1) & 0xff) | (b[2] >> 7)) - 127,
                mantissa = ((b[2] & 0x7f) << 16) | (b[1] << 8) | b[0];

            if (exponent === 128) {
                if (mantissa !== 0) {
                    return NaN;
                } else {
                    return sign * Infinity;
                }
            }

            if (exponent === -127) { // Denormalized
                return sign * mantissa * Math.pow(2, -126 - 23);
            }

            return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
        },

        getInt32: function (byteOffset, littleEndian) {
            let b = this._getBytes(4, byteOffset, littleEndian);
            return (b[3] << 24) | (b[2] << 16) | (b[1] << 8) | b[0];
        },

        getUint32: function (byteOffset, littleEndian) {
            return this.getInt32(byteOffset, littleEndian) >>> 0;
        },

        getInt16: function (byteOffset, littleEndian) {
            return (this.getUint16(byteOffset, littleEndian) << 16) >> 16;
        },

        getUint16: function (byteOffset, littleEndian) {
            let b = this._getBytes(2, byteOffset, littleEndian);
            return (b[1] << 8) | b[0];
        },

        getInt8: function (byteOffset) {
            return (this.getUint8(byteOffset) << 24) >> 24;
        },

        getUint8: function (byteOffset) {
            return this._getBytes(1, byteOffset)[0];
        }

    };

}


module.exports = STLLoader;
