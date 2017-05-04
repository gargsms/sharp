'use strict';

const path = require('path');
const util = require('util');
const stream = require('stream');
const events = require('events');
const semver = require('semver');
const sharp = require('../build/Release/sharp.node');

// Versioning
let versions = {
  vips: sharp.libvipsVersion()
};
(function () {
  // Does libvips meet minimum requirement?
  const libvipsVersionMin = require('../package.json').config.libvips;
  /* istanbul ignore if */
  if (semver.lt(versions.vips, libvipsVersionMin)) {
    throw new Error('Found libvips ' + versions.vips + ' but require at least ' + libvipsVersionMin);
  }
  // Include versions of dependencies, if present
  try {
    versions = require('../vendor/lib/versions.json');
  } catch (err) {}
})();

/**
 * @class Sharp
 *
 * Constructor factory to create an instance of `sharp`, to which further methods are chained.
 *
 * JPEG, PNG or WebP format image data can be streamed out from this object.
 * When using Stream based output, derived attributes are available from the `info` event.
 *
 * Implements the [stream.Duplex](http://nodejs.org/api/stream.html#stream_class_stream_duplex) class.
 *
 * @example
 * sharp('input.jpg')
 *   .resize(300, 200)
 *   .toFile('output.jpg', function(err) {
 *     // output.jpg is a 300 pixels wide and 200 pixels high image
 *     // containing a scaled and cropped version of input.jpg
 *   });
 *
 * @example
 * // Read image data from readableStream,
 * // resize to 300 pixels wide,
 * // emit an 'info' event with calculated dimensions
 * // and finally write image data to writableStream
 * var transformer = sharp()
 *   .resize(300)
 *   .on('info', function(info) {
 *     console.log('Image height is ' + info.height);
 *   });
 * readableStream.pipe(transformer).pipe(writableStream);
 *
 * @example
 * // Create a blank 300x200 PNG image of semi-transluent red pixels
 * sharp(null, {
 *   create: {
 *     width: 300,
 *     height: 200,
 *     channels: 4,
 *     background: { r: 255, g: 0, b: 0, alpha: 0.5 }
 *   }
 * })
 * .png()
 * .toBuffer()
 * .then( ... );
 *
 * @example
 * // Create a blank image, no more than 400x600 with some text
 * sharp(null, {
 *   text: {
 *     value: '<span>This text can use Pango Markup</span>',
 *     width: 400,
 *     height: 600,
 *     color: '#FFF',
 *     backgroundColor: '#F00'
 *   }
 * })
 * .toBuffer()
 * .then( ... );
 *
 * @param {(Buffer|String)} [input] - if present, can be
 *  a Buffer containing JPEG, PNG, WebP, GIF, SVG, TIFF or raw pixel image data, or
 *  a String containing the path to an JPEG, PNG, WebP, GIF, SVG or TIFF image file.
 *  JPEG, PNG, WebP, GIF, SVG, TIFF or raw pixel image data can be streamed into the object when null or undefined.
 * @param {Object} [options] - if present, is an Object with optional attributes.
 * @param {Number} [options.density=72] - integral number representing the DPI for vector images.
 * @param {Object} [options.raw] - describes raw pixel input image data. See `raw()` for pixel ordering.
 * @param {Number} [options.raw.width]
 * @param {Number} [options.raw.height]
 * @param {Number} [options.raw.channels] - 1-4
 * @param {Object} [options.create] - describes a new image to be created.
 * @param {Number} [options.create.width]
 * @param {Number} [options.create.height]
 * @param {Number} [options.create.channels] - 3-4
 * @param {String|Object} [options.create.background] - parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha.
 * @param {Object} [options.text] - describe a new image with text.
 * @param {String} [options.text.align=left]
 * @param {String|Object} [options.text.color=rgba(255,255,255,1)]
 * @param {String|Object} [options.text.colour] Alias for `options.text.color`
 * @param {Number} [options.text.width] The **maximum** width of the rendered image.
 * @param {Number} [options.text.height] The **maximum** height of the rendered image. At least one of `options.text.width`, `options.text.height` is needed for proper text rendering.
 * @param {String} [options.text.font=sans] Should be installed on the machine
 * @param {Number} [options.text.fontSize=12] This will be ignored if both `options.text.width` and `options.text.height` are specified and text will be autofit to image bounds.
 * @param {Number} [options.text.lineSpacing=0] Can accept floating-point values
 * @param {String|Object} [options.text.backgroundColor=rgba(0,0,0,0)] Text background
 * @param {String|Object} [options.text.backgroundColour] Alias for `options.text.backgroundColor`
 * @returns {Sharp}
 * @throws {Error} Invalid parameters
 */
const Sharp = function (input, options) {
  if (!(this instanceof Sharp)) {
    return new Sharp(input, options);
  }
  stream.Duplex.call(this);
  this.options = {
    // input options
    sequentialRead: false,
    limitInputPixels: maximum.pixels,
    // ICC profiles
    iccProfilePath: path.join(__dirname, 'icc') + path.sep,
    // resize options
    topOffsetPre: -1,
    leftOffsetPre: -1,
    widthPre: -1,
    heightPre: -1,
    topOffsetPost: -1,
    leftOffsetPost: -1,
    widthPost: -1,
    heightPost: -1,
    width: -1,
    height: -1,
    canvas: 'crop',
    crop: 0,
    angle: 0,
    tiltAngle: 0,
    rotateBeforePreExtract: false,
    flip: false,
    flop: false,
    extendTop: 0,
    extendBottom: 0,
    extendLeft: 0,
    extendRight: 0,
    withoutEnlargement: false,
    kernel: 'lanczos3',
    interpolator: 'bicubic',
    centreSampling: false,
    // operations
    background: [0, 0, 0, 255],
    flatten: false,
    negate: false,
    blurSigma: 0,
    sharpenSigma: 0,
    sharpenFlat: 1,
    sharpenJagged: 2,
    threshold: 0,
    thresholdGrayscale: true,
    trimTolerance: 0,
    gamma: 0,
    greyscale: false,
    normalise: 0,
    booleanBufferIn: null,
    booleanFileIn: '',
    joinChannelIn: [],
    extractChannel: -1,
    colourspace: 'srgb',
    // overlay
    overlayGravity: 0,
    overlayXOffset: -1,
    overlayYOffset: -1,
    overlayTile: false,
    overlayCutout: false,
    // output
    fileOut: '',
    formatOut: 'input',
    streamOut: false,
    withMetadata: false,
    withMetadataOrientation: -1,
    resolveWithObject: false,
    // output format
    jpegQuality: 80,
    jpegProgressive: false,
    jpegChromaSubsampling: '4:2:0',
    jpegTrellisQuantisation: false,
    jpegOvershootDeringing: false,
    jpegOptimiseScans: false,
    pngProgressive: false,
    pngCompressionLevel: 6,
    pngAdaptiveFiltering: true,
    webpQuality: 80,
    webpAlphaQuality: 100,
    webpLossless: false,
    webpNearLossless: false,
    tiffQuality: 80,
    tiffCompression: 'jpeg',
    tiffPredictor: 'none',
    tiffSquash: false,
    tileSize: 256,
    tileOverlap: 0,
    // Function to notify of queue length changes
    queueListener: function (queueLength) {
      queue.emit('change', queueLength);
    }
  };
  this.options.input = this._createInputDescriptor(input, options, { allowStream: true });
  return this;
};
util.inherits(Sharp, stream.Duplex);

/**
 * Pixel limits.
 * @member
 * @private
 */
const maximum = {
  width: 0x3FFF,
  height: 0x3FFF,
  pixels: Math.pow(0x3FFF, 2)
};
Sharp.maximum = maximum;

/**
 * An EventEmitter that emits a `change` event when a task is either:
 * - queued, waiting for _libuv_ to provide a worker thread
 * - complete
 * @member
 * @example
 * sharp.queue.on('change', function(queueLength) {
 *   console.log('Queue contains ' + queueLength + ' task(s)');
 * });
 */
const queue = new events.EventEmitter();
Sharp.queue = queue;

/**
 * An Object containing nested boolean values representing the available input and output formats/methods.
 * @example
 * console.log(sharp.format());
 * @returns {Object}
 */
Sharp.format = sharp.format();

/**
 * An Object containing the version numbers of libvips and its dependencies.
 * @member
 * @example
 * console.log(sharp.versions);
 */
Sharp.versions = versions;

/**
 * Export constructor.
 * @private
 */
module.exports = Sharp;
