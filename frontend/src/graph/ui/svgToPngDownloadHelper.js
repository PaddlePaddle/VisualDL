// URL for this library : https://github.com/exupero/saveSvgAsPng
// Blog about it: https://spin.atomicobject.com/2014/01/21/convert-svg-to-png/
(function() {
    var out$ = window;
    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [<!ENTITY nbsp "&#160;">]>';

    function isElement(obj) {
        return obj instanceof HTMLElement || obj instanceof SVGElement;
    }

    function requireDomNode(el) {
        if (!isElement(el)) {
            throw new Error('an HTMLElement or SVGElement is required; got ' + el);
        }
    }

    function isExternal(url) {
        return url && url.lastIndexOf('http',0) == 0 && url.lastIndexOf(window.location.host) == -1;
    }

    function inlineImages(el, callback) {
        requireDomNode(el);

        var images = el.querySelectorAll('image'),
            left = images.length,
            checkDone = function() {
                if (left === 0) {
                    callback();
                }
            };

        checkDone();
        for (var i = 0; i < images.length; i++) {
            (function(image) {
                var href = image.getAttributeNS("http://www.w3.org/1999/xlink", "href");
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var img = new Image();
                img.crossOrigin="anonymous";
                href = href || image.getAttribute('href');
                if (isExternal(href)) {
                    href += (href.indexOf('?') === -1 ? '?' : '&') + 't=' + (new Date().valueOf());
                }
                if (href) {
                    img.src = href;
                    img.onload = function() {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        image.setAttributeNS("http://www.w3.org/1999/xlink", "href", canvas.toDataURL('image/png'));
                        left--;
                        checkDone();
                    }
                    img.onerror = function() {
                        console.log("Could not load "+href);
                        left--;
                        checkDone();
                    }
                } else {
                    left--;
                    checkDone();
                }
            })(images[i]);
        }
    }

    function styles(el, options, cssLoadedCallback) {
        var selectorRemap = options.selectorRemap;
        var modifyStyle = options.modifyStyle;
        var modifyCss = options.modifyCss || function(selector, properties) {
                var selector = selectorRemap ? selectorRemap(selector) : selector;
                var cssText = modifyStyle ? modifyStyle(properties) : properties;
                return selector + " { " + cssText + " }\n";
            };
        var css = "";

        // Each font that has an external link is saved into queue, and processed asynchronously.
        var fontsQueue = [];
        var sheets = document.styleSheets;
        for (var i = 0; i < sheets.length; i++) {
            try {
                var rules = sheets[i].cssRules;
            } catch (e) {
                console.warn("Stylesheet could not be loaded: "+sheets[i].href);
                continue;
            }

            if (rules != null) {
                for (var j = 0, match; j < rules.length; j++, match = null) {
                    var rule = rules[j];
                    if (typeof(rule.style) != "undefined") {
                        var selectorText;

                        try {
                            selectorText = rule.selectorText;
                        } catch(err) {
                            console.warn('The following CSS rule has an invalid selector: "' + rule + '"', err);
                        }

                        try {
                            if (selectorText) {
                                match = el.querySelector(selectorText) || (el.parentNode && el.parentNode.querySelector(selectorText));
                            }
                        } catch(err) {
                            console.warn('Invalid CSS selector "' + selectorText + '"', err);
                        }

                        if (match) {
                            css += modifyCss(rule.selectorText, rule.style.cssText);
                        } else if(rule.cssText.match(/^@font-face/)) {
                            // below we are trying to find matches to external link. E.g.
                            // @font-face {
                            //   // ...
                            //   src: local('Abel'), url(https://fonts.gstatic.com/s/abel/v6/UzN-iejR1VoXU2Oc-7LsbvesZW2xOQ-xsNqO47m55DA.woff2);
                            // }
                            //
                            // This regex will save extrnal link into first capture group
                            var fontUrlRegexp = /url\(["']?(.+?)["']?\)/;
                            // TODO: This needs to be changed to support multiple url declarations per font.
                            var fontUrlMatch = rule.cssText.match(fontUrlRegexp);

                            var externalFontUrl = (fontUrlMatch && fontUrlMatch[1]) || '';
                            var fontUrlIsDataURI = externalFontUrl.match(/^data:/);
                            if (fontUrlIsDataURI) {
                                // We should ignore data uri - they are already embedded
                                externalFontUrl = '';
                            }

                            if (externalFontUrl === 'about:blank') {
                                // no point trying to load this
                                externalFontUrl = '';
                            }

                            if (externalFontUrl) {
                                // okay, we are lucky. We can fetch this font later

                                //handle url if relative
                                if (externalFontUrl.startsWith('../')) {
                                    externalFontUrl = sheets[i].href + '/../' + externalFontUrl
                                } else if (externalFontUrl.startsWith('./')) {
                                    externalFontUrl = sheets[i].href + '/.' + externalFontUrl
                                }

                                fontsQueue.push({
                                    text: rule.cssText,
                                    // Pass url regex, so that once font is downladed, we can run `replace()` on it
                                    fontUrlRegexp: fontUrlRegexp,
                                    format: getFontMimeTypeFromUrl(externalFontUrl),
                                    url: externalFontUrl
                                });
                            } else {
                                // otherwise, use previous logic
                                css += rule.cssText + '\n';
                            }
                        }
                    }
                }
            }
        }

        // Now all css is processed, it's time to handle scheduled fonts
        processFontQueue(fontsQueue);

        function getFontMimeTypeFromUrl(fontUrl) {
            var supportedFormats = {
                'woff2': 'font/woff2',
                'woff': 'font/woff',
                'otf': 'application/x-font-opentype',
                'ttf': 'application/x-font-ttf',
                'eot': 'application/vnd.ms-fontobject',
                'sfnt': 'application/font-sfnt',
                'svg': 'image/svg+xml'
            };
            var extensions = Object.keys(supportedFormats);
            for (var i = 0; i < extensions.length; ++i) {
                var extension = extensions[i];
                // TODO: This is not bullet proof, it needs to handle edge cases...
                if (fontUrl.indexOf('.' + extension) > 0) {
                    return supportedFormats[extension];
                }
            }

            // If you see this error message, you probably need to update code above.
            console.error('Unknown font format for ' + fontUrl+ '; Fonts may not be working correctly');
            return 'application/octet-stream';
        }

        function processFontQueue(queue) {
            if (queue.length > 0) {
                // load fonts one by one until we have anything in the queue:
                var font = queue.pop();
                processNext(font);
            } else {
                // no more fonts to load.
                cssLoadedCallback(css);
            }

            function processNext(font) {
                // TODO: This could benefit from caching.
                var oReq = new XMLHttpRequest();
                oReq.addEventListener('load', fontLoaded);
                oReq.addEventListener('error', transferFailed);
                oReq.addEventListener('abort', transferFailed);
                oReq.open('GET', font.url);
                oReq.responseType = 'arraybuffer';
                oReq.send();

                function fontLoaded() {
                    // TODO: it may be also worth to wait until fonts are fully loaded before
                    // attempting to rasterize them. (e.g. use https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet )
                    var fontBits = oReq.response;
                    var fontInBase64 = arrayBufferToBase64(fontBits);
                    updateFontStyle(font, fontInBase64);
                }

                function transferFailed(e) {
                    console.warn('Failed to load font from: ' + font.url);
                    console.warn(e)
                    css += font.text + '\n';
                    processFontQueue(queue);
                }

                function updateFontStyle(font, fontInBase64) {
                    var dataUrl = 'url("data:' + font.format + ';base64,' + fontInBase64 + '")';
                    css += font.text.replace(font.fontUrlRegexp, dataUrl) + '\n';

                    // schedule next font download on next tick.
                    setTimeout(function() {
                        processFontQueue(queue)
                    }, 0);
                }

            }
        }

        function arrayBufferToBase64(buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;

            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }

            return window.btoa(binary);
        }
    }

    function getDimension(el, clone, dim) {
        var v = (el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal[dim]) ||
            (clone.getAttribute(dim) !== null && !clone.getAttribute(dim).match(/%$/) && parseInt(clone.getAttribute(dim))) ||
            el.getBoundingClientRect()[dim] ||
            parseInt(clone.style[dim]) ||
            parseInt(window.getComputedStyle(el).getPropertyValue(dim));
        return (typeof v === 'undefined' || v === null || isNaN(parseFloat(v))) ? 0 : v;
    }

    function reEncode(data) {
        data = encodeURIComponent(data);
        data = data.replace(/%([0-9A-F]{2})/g, function(match, p1) {
            var c = String.fromCharCode('0x'+p1);
            return c === '%' ? '%25' : c;
        });
        return decodeURIComponent(data);
    }

    out$.prepareSvg = function(el, options, cb) {
        requireDomNode(el);

        options = options || {};
        options.scale = options.scale || 1;
        options.responsive = options.responsive || false;
        var xmlns = "http://www.w3.org/2000/xmlns/";

        inlineImages(el, function() {
            var outer = document.createElement("div");
            var clone = el.cloneNode(true);
            var width, height;
            if(el.tagName == 'svg') {
                width = options.width || getDimension(el, clone, 'width');
                height = options.height || getDimension(el, clone, 'height');
            } else if(el.getBBox) {
                var box = el.getBBox();
                width = box.x + box.width;
                height = box.y + box.height;
                clone.setAttribute('transform', clone.getAttribute('transform').replace(/translate\(.*?\)/, ''));

                var svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
                svg.appendChild(clone)
                clone = svg;
            } else {
                console.error('Attempted to render non-SVG element', el);
                return;
            }

            clone.setAttribute("version", "1.1");
            if (!clone.getAttribute('xmlns')) {
                clone.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/2000/svg");
            }
            if (!clone.getAttribute('xmlns:xlink')) {
                clone.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
            }

            if (options.responsive) {
                clone.removeAttribute('width');
                clone.removeAttribute('height');
                clone.setAttribute('preserveAspectRatio', 'xMinYMin meet');
            } else {
                clone.setAttribute("width", width * options.scale);
                clone.setAttribute("height", height * options.scale);
            }

            clone.setAttribute("viewBox", [
                options.left || 0,
                options.top || 0,
                width,
                height
            ].join(" "));

            var fos = clone.querySelectorAll('foreignObject > *');
            for (var i = 0; i < fos.length; i++) {
                if (!fos[i].getAttribute('xmlns')) {
                    fos[i].setAttributeNS(xmlns, "xmlns", "http://www.w3.org/1999/xhtml");
                }
            }

            outer.appendChild(clone);

            // In case of custom fonts we need to fetch font first, and then inline
            // its url into data-uri format (encode as base64). That's why style
            // processing is done asynchonously. Once all inlining is finshed
            // cssLoadedCallback() is called.
            styles(el, options, cssLoadedCallback);

            function cssLoadedCallback(css) {
                // here all fonts are inlined, so that we can render them properly.
                var s = document.createElement('style');
                s.setAttribute('type', 'text/css');
                s.innerHTML = "<![CDATA[\n" + css + "\n]]>";
                var defs = document.createElement('defs');
                defs.appendChild(s);
                clone.insertBefore(defs, clone.firstChild);

                if (cb) {
                    var outHtml = outer.innerHTML;
                    outHtml = outHtml.replace(/NS\d+:href/gi, 'xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href');
                    cb(outHtml, width, height);
                }
            }
        });
    }

    out$.svgAsDataUri = function(el, options, cb) {
        out$.prepareSvg(el, options, function(svg) {
            var uri = 'data:image/svg+xml;base64,' + window.btoa(reEncode(doctype + svg));
            if (cb) {
                cb(uri);
            }
        });
    }

    out$.svgAsPngUri = function(el, options, cb) {
        requireDomNode(el);

        options = options || {};
        options.encoderType = options.encoderType || 'image/png';
        options.encoderOptions = options.encoderOptions || 0.8;

        var convertToPng = function(src, w, h) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = w;
            canvas.height = h;

            var pixelRatio = window.devicePixelRatio || 1;

            canvas.style.width = canvas.width+'px';
            canvas.style.height = canvas.height+'px';
            canvas.width *= pixelRatio;
            canvas.height *= pixelRatio;

            context.setTransform(pixelRatio,0,0,pixelRatio,0,0);

            if(options.canvg) {
                options.canvg(canvas, src);
            } else {
                context.drawImage(src, 0, 0);
            }

            if(options.backgroundColor){
                context.globalCompositeOperation = 'destination-over';
                context.fillStyle = options.backgroundColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
            }

            var png;
            try {
                png = canvas.toDataURL(options.encoderType, options.encoderOptions);
            } catch (e) {
                if ((typeof SecurityError !== 'undefined' && e instanceof SecurityError) || e.name == "SecurityError") {
                    console.error("Rendered SVG images cannot be downloaded in this browser.");
                    return;
                } else {
                    throw e;
                }
            }
            cb(png);
        }

        if(options.canvg) {
            out$.prepareSvg(el, options, convertToPng);
        } else {
            out$.svgAsDataUri(el, options, function(uri) {
                var image = new Image();

                image.onload = function() {
                    convertToPng(image, image.width, image.height);
                }

                image.onerror = function() {
                    console.error(
                        'There was an error loading the data URI as an image on the following SVG\n',
                        window.atob(uri.slice(26)), '\n',
                        "Open the following link to see browser's diagnosis\n",
                        uri);
                }

                image.src = uri;
            });
        }
    }

    out$.download = function(name, uri) {
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(uriToBlob(uri), name);
        } else {
            var saveLink = document.createElement('a');
            var downloadSupported = 'download' in saveLink;
            if (downloadSupported) {
                saveLink.download = name;
                saveLink.style.display = 'none';
                document.body.appendChild(saveLink);
                try {
                    var blob = uriToBlob(uri);
                    var url = URL.createObjectURL(blob);
                    saveLink.href = url;
                    saveLink.onclick = function() {
                        requestAnimationFrame(function() {
                            URL.revokeObjectURL(url);
                        })
                    };
                } catch (e) {
                    console.warn('This browser does not support object URLs. Falling back to string URL.');
                    saveLink.href = uri;
                }
                saveLink.click();
                document.body.removeChild(saveLink);
            }
            else {
                window.open(uri, '_temp', 'menubar=no,toolbar=no,status=no');
            }
        }
    }

    function uriToBlob(uri) {
        var byteString = window.atob(uri.split(',')[1]);
        var mimeString = uri.split(',')[0].split(':')[1].split(';')[0]
        var buffer = new ArrayBuffer(byteString.length);
        var intArray = new Uint8Array(buffer);
        for (var i = 0; i < byteString.length; i++) {
            intArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([buffer], {type: mimeString});
    }

    out$.saveSvg = function(el, name, options) {
        requireDomNode(el);

        options = options || {};
        out$.svgAsDataUri(el, options, function(uri) {
            out$.download(name, uri);
        });
    }

    out$.saveSvgAsPng = function(el, name, options) {
        requireDomNode(el);

        options = options || {};
        out$.svgAsPngUri(el, options, function(uri) {
            out$.download(name, uri);
        });
    }

    // if define is defined create as an AMD module
    if (typeof define !== 'undefined') {
        define(function() {
            return out$;
        });
    }

})();
