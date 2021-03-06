<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [Sharp](#sharp)
    -   [format](#format)
    -   [versions](#versions)
-   [queue](#queue)

## Sharp

**Parameters**

-   `input` **([Buffer](https://nodejs.org/api/buffer.html) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))?** if present, can be
     a Buffer containing JPEG, PNG, WebP, GIF, SVG, TIFF or raw pixel image data, or
     a String containing the path to an JPEG, PNG, WebP, GIF, SVG or TIFF image file.
     JPEG, PNG, WebP, GIF, SVG, TIFF or raw pixel image data can be streamed into the object when null or undefined.
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** if present, is an Object with optional attributes.
    -   `options.density` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** integral number representing the DPI for vector images. (optional, default `72`)
    -   `options.raw` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** describes raw pixel input image data. See `raw()` for pixel ordering.
        -   `options.raw.width` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 
        -   `options.raw.height` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 
        -   `options.raw.channels` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 1-4
    -   `options.create` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** describes a new image to be created.
        -   `options.create.width` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 
        -   `options.create.height` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 
        -   `options.create.channels` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 3-4
        -   `options.create.background` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))?** parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha.
    -   `options.text` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** describe a new image with text.
        -   `options.text.align` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?**  (optional, default `left`)
        -   `options.text.color` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))?**  (optional, default `rgba(255,255,255,1)`)
        -   `options.text.colour` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))?** Alias for `options.text.color`
        -   `options.text.width` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** The **maximum** width of the rendered image.
        -   `options.text.height` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** The **maximum** height of the rendered image. At least one of `options.text.width`, `options.text.height` is needed for proper text rendering.
        -   `options.text.font` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?** Should be installed on the machine (optional, default `sans`)
        -   `options.text.fontSize` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** This will be ignored if both `options.text.width` and `options.text.height` are specified and text will be autofit to image bounds. (optional, default `12`)
        -   `options.text.lineSpacing` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Can accept floating-point values (optional, default `0`)
        -   `options.text.backgroundColor` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))?** Text background (optional, default `rgba(0,0,0,0)`)
        -   `options.text.backgroundColour` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))?** Alias for `options.text.backgroundColor`

**Examples**

```javascript
sharp('input.jpg')
  .resize(300, 200)
  .toFile('output.jpg', function(err) {
    // output.jpg is a 300 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });
```

```javascript
// Read image data from readableStream,
// resize to 300 pixels wide,
// emit an 'info' event with calculated dimensions
// and finally write image data to writableStream
var transformer = sharp()
  .resize(300)
  .on('info', function(info) {
    console.log('Image height is ' + info.height);
  });
readableStream.pipe(transformer).pipe(writableStream);
```

```javascript
// Create a blank 300x200 PNG image of semi-transluent red pixels
sharp(null, {
  create: {
    width: 300,
    height: 200,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
  }
})
.png()
.toBuffer()
.then( ... );
```

```javascript
// Create a blank image, no more than 400x600 with some text
sharp(null, {
  text: {
    value: '<span>This text can use Pango Markup</span>',
    width: 400,
    height: 600,
    color: '#FFF',
    backgroundColor: '#F00'
  }
})
.toBuffer()
.then( ... );
```

-   Throws **[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)** Invalid parameters

Returns **[Sharp](#sharp)** 

### format

An Object containing nested boolean values representing the available input and output formats/methods.

**Examples**

```javascript
console.log(sharp.format());
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### versions

An Object containing the version numbers of libvips and its dependencies.

**Examples**

```javascript
console.log(sharp.versions);
```

## queue

An EventEmitter that emits a `change` event when a task is either:

-   queued, waiting for _libuv_ to provide a worker thread
-   complete

**Examples**

```javascript
sharp.queue.on('change', function(queueLength) {
  console.log('Queue contains ' + queueLength + ' task(s)');
});
```
