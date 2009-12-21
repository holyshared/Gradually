/*!! uuCanvas.js { version: "1.0.3", author: "uupaa.js@gmail.com",
                   license: "MIT, Apache License Version 2.0" } */

// === uuMeta ===
// depend: none
/*
window.UUMETA_DEBUG = 0;
window.UUMETA_IMAGE_DIR = "."
uuMeta.ie
uuMeta.iemode8
uuMeta.quirks
uuMeta.opera
uuMeta.gecko
uuMeta.gecko191 - Firefox3.5+
uuMeta.firefox
uuMeta.webkit
uuMeta.webkit522 - Safari3+, Chrome1+
uuMeta.webkit530 - Safari4+, Chrome2+
uuMeta.safari
uuMeta.chrome
uuMeta.iphone
uuMeta.uaver
uuMeta.slver
uuMeta.flashver
uuMeta.enginever
uuMeta.canvas
uuMeta.runstyle
uuMeta.imagedir
uuMeta.blackout
uuMeta.debug
uuMeta.hex
uuMeta.mix(base, flavor, aroma = undef, override = true) - return base
uuMeta.toArray(fake) - return array
-- element unique id ---
uuMeta.uid(node) - return unique id
uuMeta.uid2node(uid) - return node or void 0
uuMeta.uid2node.refHash() - return { uid: node, ... }
--- boot ---
window.boot - user defined boot loader
uuMeta.boot(callback, highPriority = false)
--- event ---
uuMeta.event.bind(elm, eventName, fn, capture)
uuMeta.event.unbind(elm, eventName, fn, capture)
uuMeta.event.stop(evt)
 */
(function() {
var _meta,  // inner namespace
    _win = window,
    _doc = document,
    _debug = (_win.UUMETA_DEBUG || 0),
    _float = parseFloat,
    _nu = navigator.userAgent,
    _ie = !!_doc.uniqueID,
    _opera = !!_win.opera,
    _gecko = _nu.indexOf("Gecko/") > 0,
    _webkit = _nu.indexOf("WebKit") > 0,
    _chrome = _nu.indexOf("Chrome") > 0,
    _uaver = _opera ? (opera.version().replace(/\d$/, "") - 0) // Opera10 shock
                    : _float((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.
                             exec(_nu) || [,0])[1]),
    _slver = (function() {
      try {
        var a = ["1.0", "2.0", "3.0"], i = 3, ok,
            o = _ie ? new ActiveXObject("AgControl.AgControl")
                    : navigator.plugins["Silverlight Plug-In"];
        while (i--) {
          ok = _ie ? o.IsVersionSupported(a[i])
                   : _float(/\d+\.\d+/.exec(o.description)[0]) >= _float(a[i]);
          if (ok) {
            return _float(a[i]);
          }
        }
      } catch(err) {}
      return 0;
    })(),
    _flashver = (function() {
      try {
        var o = _ie ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
                    : navigator.plugins["Shockwave Flash"],
            v = _ie ? o.GetVariable("$version").replace(/,/g, ".")
                    : o.description,
            m = /\d+\.\d+/.exec(v);
        return m ? _float(m[0], 10) : 0;
      } catch(err) {}
      return 0;
    })(),
    _egver = _float(((/(?:rv\:|ari\/|sto\/)(\d+\.\d+(\.\d+)?)/.
      exec(_nu) || [,0])[1]).toString().
      replace(/[^\d\.]/g, "").replace(/^(\d+\.\d+)(\.(\d+))?$/, "$1$3")
    ),
    _hex = (function() {
      var r = [], i = 256;
      for(; i < 512; ++i) {
        r.push(i.toString(16).slice(1));
      }
      return r;
    })(),
    _mix = function(base,       // @param Hash: mixin base
                    flavor,     // @param Hash: add flavor
                    aroma,      // @param Hash(= undefined): add aroma
                    override) { // @param Boolean(= true): true is override
                                // @return Hash: base
      var i, ride = (override === void 0) || override;

      for (i in flavor) {
        if (ride || !(i in base)) {
          base[i] = flavor[i];
        }
      }
      return aroma ? _meta.mix(base, aroma, void 0, ride) : base;
    },
    _toArray = function(fake) { // @param NodeList/Array:
                                // @return Array:
      if (!_ie && (_opera && _uaver >= 9.5)) {
        return Array.prototype.slice.call(fake, 0);
      }
      var rv = [], ri = -1, i = 0, iz = fake.length;
      for (; i < iz; ++i) {
        rv[++ri] = fake[i];
      }
      return rv;
    },
    _uid2node = {}, // { uid: node, ... }
    _bootFire = 0, // fired flag
    _bootOrder = [[], []], // [high, low]
    UNIQUEID = "uuqid";

_meta = {
  ie:         _ie,
  iemode8:    _ie && _doc.documentMode >= 8,
  quirks:     (_doc.compatMode || "") !== "CSS1Compat",
  opera:      _opera,
  gecko:      _gecko,
  gecko191:   (_gecko && _egver >= 1.91), // Firefox3.5+
  firefox:    _nu.indexOf("Firefox/") > 0,
  webkit:     _webkit,
  webkit522:  (_webkit && _egver >= 522), // Safari3+, Chrome1+
  webkit530:  (_webkit && _egver >= 530), // Safari4+, Chrome2+
  chrome:     _chrome,
  safari:     !_chrome && _nu.indexOf("Safari") > 0,
  iphone:     _webkit && /iPod|iPhone/.test(_nu),
  uaver:      _uaver,     // User Agent version
  slver:      _slver,     // Silverlight version
  flashver:   _flashver,  // Flash version(ver 7 later)
  enginever:  _egver,     // Render engine version
  canvas:     (_ie && _uaver >= 6) || // <canvas> support
              (_opera  && _uaver >= 9.2) ||
              (_gecko  && _egver >= 1.81) ||
              (_webkit && _egver >= 522),
  runstyle:   _ie ? "currentStyle"
                  : (_win.getComputedStyle ||
                     _doc.defaultView.getComputedStyle), // old WebKit
  imagedir:   (_win.UUMETA_IMAGE_DIR || ".").replace(/\/+$/, ""),
  blackout:   0, // 1: fire location.reload()
  debug:      _debug,
  hex:        _hex,
  mix:        _mix,
  toArray:    _toArray
};

// uuMeta.uid - get unique id by node
_meta.uid = function(node) { // @param Node:
                             // @return Number: unique id, from 1
  var newid;

  return node[UNIQUEID] ||
            (_uid2node[node[UNIQUEID] = newid = ++_win[UNIQUEID]] = node,
             newid);
};

// uuMeta.uid2node - get node by unique id
_meta.uid2node = function(uid) { // @param String: unique id
                                 // @return Node/undefined:
  return _uid2node[uid];
};

// uuMeta.uid2node.refHash
_meta.uid2node.refHash = function() { // @return Hash:
  return _uid2node;
};

// uuMeta.boot - catch DOMContentReady/window.onload event
_meta.boot = function(callback,       // @param Function:
                      highPriority) { // @param Boolean(= false):
  (_bootFire && !_meta.blackout)
      ? callback(0x101) // run now
      : _bootOrder[highPriority ? 0 : 1].push(callback); // stock
};

// uuMeta.event
_meta.event = {
  // uuMeta.event.bind
  bind: function(elm,       // @param Node:
                 eventName, // @param String:
                 callback,  // @param Function: callback
                 capture) { // @param Boolean(= false):
    _ie ? elm.attachEvent("on" + eventName, callback)
        : elm.addEventListener(eventName, callback, capture || false);
  },
  // uuMeta.event.unbind
  unbind: function(elm,       // @param Node:
                   eventName, // @param String:
                   callback,  // @param Function: callback
                   capture) { // @param Boolean(= false):
    _ie ? elm.detachEvent("on" + eventName, callback)
        : elm.removeEventListener(eventName, callback, capture || false);
  },
  // uuMeta.event.stop
  stop: function(evt) { // @param EventObject(= undefined):
    evt = evt || _win.event;
    _ie ? (evt.cancelBubble = true) : evt.stopPropagation();
    _ie ? (evt.returnValue = false) : evt.preventDefault();
  }
};

function bootFire(v) {
  if (!_bootFire++) {
    if (_debug) {
      while ( (v = _bootOrder[0].shift()) ) { !_meta.blackout && v(); }
      while ( (v = _bootOrder[1].shift()) ) { !_meta.blackout && v(); }
      !_meta.blackout &&
          (typeof _win.boot === "function") && _win.boot(0x100);
    } else {
      try {
        // high priority
        while ( (v = _bootOrder[0].shift()) ) { !_meta.blackout && v(); }
        // low priority
        while ( (v = _bootOrder[1].shift()) ) { !_meta.blackout && v(); }
        // boot loader
        !_meta.blackout &&
            (typeof _win.boot === "function") && _win.boot(0x100);
      } catch(err) {}
    }
  }
}

// --- initialize ---
// boot: windowReadyState and domReadyState
if (_ie) {
  _win.attachEvent("onload", bootFire);
  (function peek() {
    try {
      _doc.firstChild.doScroll("up"), bootFire();
    } catch(err) { setTimeout(peek, 16); }
  })();
} else { // WebKit, Firefox, Opera
  _win.addEventListener("load", bootFire, false);
  _doc.addEventListener("DOMContentLoaded", bootFire, false);
}

// prebuild element unique id ( node[UNIQUEID] )
_meta.boot(function() {
  var node = _doc.getElementsByTagName("*"), v, i = 0, iz = node.length,
      newid;

  for (; i < iz; ++i) {
    v = node[i];
    if (!_ie || v.nodeType === 1) {
      v[UNIQUEID] ||
          (_uid2node[v[UNIQUEID] = newid = ++_win[UNIQUEID]] = v, newid);
    }
  }
}, 1);

// init VML namespace
_ie && _meta.boot(function() {
  var NS = 'urn:schemas-microsoft-com:', NSV = '#default#VML',
      ns = _doc.namespaces;

  if (!ns["v"]) {
    ns.add("v", NS + "vml", NSV);
    ns.add("o", NS + "office:office", NSV);
  }
  _doc.createStyleSheet().cssText =
    "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
    "v\:roundrect,v\:oval,v\:shape,v\:stroke,v\:fill,v\:textpath," +
    "v\:image,v\:line,v\:skew,v\:path,o\:opacity2" +
    "{behavior:url(" + NSV + ");display:inline-block}"; // inline-block [!]
});

// --- export ---
_win.uuMeta = _meta; // window.uuMeta
_win[UNIQUEID] = 0;  // window.uuqid

})(); // uuMeta scope


// === uuStyle ===
// depend: uuMeta, uuColor
/*
uuStyle.toPixel(node, value) - return pixel value
uuStyle.getPixel(node, prop) - return pixel value
uuStyle.getBGImg(node) - return "http://..." or ""
uuStyle.getBGColor(node, ancestor = false, toRGBA = false)
                                        - return [color, alpha] or { r,g,b,a }
uuStyle.getViewport() - return { w, h, sx, sy }
uuStyle.getRect(node) - return { x, y, w, h, ow, oh }
uuStyle.setRect(node, { x, y, w, h })
uuStyle.getRelPos(node) - return { x, y }
 */
(function() {
var _style, // inner namespace
    _mm = uuMeta,
    _win = window,
    _doc = document,
    _int = parseInt,
    _float = parseFloat,
    _ie = _mm.ie,
    _opera = _mm.opera,
    _webkit = _mm.webkit,
    _ieroot = _mm.quirks ? "body" : "documentElement",
    _runstyle = _mm.runstyle,
    TRANSPARENT = "transparent",
    TRANS_RGBA = "rgba(0, 0, 0, 0)", // webkit format
    IMPORTANT = "important",
    POSITION = "position",
    ABSOLUTE = "absolute",
    DISPLAY = "display",
    BLOCK = "block",
    LEFT = "left";

_style = {
  // uuStyle.toPixel - covert unit
  //    toPixel(node, 123)    -> 123
  //    toPixel(node, "12px") -> 12
  //    toPixel(node, "12pt") -> 16
  //    toPixel(node, "12em") -> 192
  toPixel: function(node,         // @param Node: context
                    value,        // @param String/Number:
                    accurately) { // @param Boolena(= false): false = quick
                                  // @return Number: pixel value
    var rv, st, rs, mem1, mem2, mem3, fontSize;

    if (typeof value === "string") {
      if (value.lastIndexOf("px") > 0) { // value is pixel unit
        return _int(value) || 0;
      }

      if (!accurately) {
        // quick
        rv = _float(value);
        if (value.lastIndexOf("pt") > 0) {
          rv *= 4 / 3; // 1.333...
        } else if (value.lastIndexOf("em") > 0) {
          fontSize = (_ie ? node[_runstyle]
                          : _runstyle(node, "")).fontSize;
          if (fontSize.lastIndexOf("pt") > 0) { // 12pt * 1.333 = 16px
            rv *= _float(fontSize) * 4 / 3;
          } else {
            rv *= _float(fontSize); // 12px
          }
        }
        return _int(rv) || 0;
      }

      st = node.style, mem1 = st[LEFT];
      if (_ie) {
        rs = node.runtimeStyle, mem2 = rs[LEFT]; // keep !important value
        // overwrite
        rs[LEFT] = node[_runstyle][LEFT];
        st[LEFT] = value;
        // get pixel
        value = st.pixelLeft;
        // restore
        st[LEFT] = mem1;
        rs[LEFT] = mem2;
      } else {
        // overwrite
        if (_webkit) {
          mem2 = st.getPropertyValue(POSITION);
          mem3 = st.getPropertyValue(DISPLAY);
          st.setProperty(POSITION, ABSOLUTE, IMPORTANT);
          st.setProperty(DISPLAY,  BLOCK,    IMPORTANT);
        }
        st.setProperty(LEFT, value, IMPORTANT);
        // get pixel
        value = _int(_runstyle(node, "")[LEFT]);
        // restore
        st.removeProperty(LEFT);
        st.setProperty(LEFT, mem1, "");
        if (_webkit) {
          st.removeProperty(POSITION);
          st.removeProperty(DISPLAY);
          st.setProperty(POSITION, mem2, "");
          st.setProperty(DISPLAY,  mem3, "");
        }
      }
    }
    return value || 0;
  },

  // uuStyle.getPixel - get pixel value
  //    getPixel(node, "left")
  //    getPixel(node, "width")
  getPixel: function(node,   // @param Node:
                     prop) { // @param String: style property name
                             // @return Number: pixel value
    function dim(horizontal) {
      var r = node.getBoundingClientRect();
      return horizontal ? (r.right - r.left) : (r.bottom - r.top);
    }
    var rv;

    if (_ie) {
      switch (prop) {
      case "width":  return node.clientWidth  || dim(1);
      case "height": return node.clientHeight || dim(0);
      }
      rv = node[_runstyle][prop];
      (rv === "auto") && (rv = _style.toPixel(node, rv));
    } else {
      rv = _runstyle(node, "")[prop];
    }
    return _int(rv) || 0;
  },

  // uuStyle.getBGImg - get background-image url
  getBGImg: function(node) { // @param Node:
                             // @return String: "http://..." or ""
    var bg = "backgroundImage", m,
        url = _ie ? (node.style[bg] || node[_runstyle][bg])
                  : _runstyle(node, "")[bg];
    if (url.indexOf(",") < 0) { // skip CSS3 multiple background-image
      if (url) {
        if ( (m = /^url\((.*)\)$/.exec(url)) ) {
          return m[1].replace(/^\s*[\"\']?|[\"\']?\s*$/g, ""); // trim quote
        }
      }
    }
    return "";
  },

  // uuStyle.getBGColor - get background-color (from ancestor)
  // depend: uuColor
  getBGColor:
      function(node,     // @param Node:
               ancestor, // @param Boolean(= false):
               toRGBA) { // @param Boolean(= false): true = return RGBAHash
                         //                          false = return Array
                         // @return Array: [HexColorString, Alpha]
    function isZero(color) {
      return color === TRANSPARENT || color === TRANS_RGBA;
    }
    var bgc = "backgroundColor", n = node, color = TRANSPARENT;

    if (!ancestor) {
      return _ie ? (n.style[bgc] || n[_runstyle][bgc])
                 : _runstyle(n, "")[bgc];
    }
    while (n && n !== _doc && isZero(color)) {
      if ((_ie && n[_runstyle]) || !_ie) {
        color = _ie ? n[_runstyle][bgc]
                    : _runstyle(n, "")[bgc];
      }
      n = n.parentNode;
    }
    if (toRGBA) {
      return isZero(color) ? { r: 255, g: 255, b: 255, a: 1 }
                           : uuColor.parse(color, 1);
    }
    return isZero(color) ? ["white", 1]
                         : uuColor.parse(color);
  },

  // uuStyle.getViewport - get viewport dimension and scroll offset
  getViewport: function() { // @return { w, h, sx, sy }
    var e = _win;

    if (_ie) {
      e = _doc[_ieroot];
      return { w: e.clientWidth  || e.scrollWidth,
               h: e.clientHeight || e.scrollHeight,
               sx: e.scrollLeft,
               sy: e.scrollTop };
    }
    // "window.pageXOffset" alias "window.scrollX" in gecko, webkit
    return { w: e.innerWidth,
             h: e.innerHeight,
             sx: e.pageXOffset,
             sy: e.pageYOffset };
  },

  // uuStyle.getRect - get element absolute position and rectangle
  getRect: function(node) { // @param Node:
                            // @return Hash: { x, y, w, h, ow, oh }
    var e, x = 0, y = 0, w = 0, h = 0, fix = 0, rect, vp;

    if (node.getBoundingClientRect) {
      // get relative position
      rect = node.getBoundingClientRect();
      fix = (_ie && node.parentNode === _doc.body) ? 2 : 0;
      // to absolute position
      vp = _style.getViewport();
      x = rect.left + vp.sx - fix;
      y = rect.top  + vp.sy - fix;
      w = rect.right - rect.left;
      h = rect.bottom - rect.top;
    } else {
      // get absolute position(for Fx2)
      e = node;
      while (e) {
        x += e.offsetLeft || 0;
        y += e.offsetTop  || 0;
        e  = e.offsetParent;
      }
    }
    return {
      // element position(absolute)
      x: x,
      y: y,
      // element dimension(style.width + padding)
      w: node.clientWidth  || w,
      h: node.clientHeight || h,
      // element dimension(style.width + padding + border)
      ow: node.offsetWidth,
      oh: node.offsetHeight
    };
  },

  // uuStyle.setRect - set element rect
  setRect: function(node,   // @param Node:
                    rect) { // @param Hash: { x, y, w, h }
    var s = node.style;

    if (_ie || _opera) {
      if ("x" in rect) { s.pixelLeft   = rect.x; }
      if ("y" in rect) { s.pixelTop    = rect.y; }
      if ("w" in rect) { s.pixelWidth  = rect.w > 0 ? rect.w : 0; }
      if ("h" in rect) { s.pixelHeight = rect.h > 0 ? rect.h : 0; }
    } else {
      if ("x" in rect) { s.left   = rect.x + "px"; }
      if ("y" in rect) { s.top    = rect.y + "px"; }
      if ("w" in rect) { s.width  = (rect.w > 0 ? rect.w : 0) + "px"; }
      if ("h" in rect) { s.height = (rect.h > 0 ? rect.h : 0) + "px"; }
    }
  },

  // uuStyle.getRelPos - get element relative position
  getRelPos: function(node) { // @param Node:
                              // @return Hash: { x, y }
    var x = 0, y = 0, ns,
        hash = { relative: 1, absolute: 1 };

    while (node) {
      x   += node.offsetLeft || 0;
      y   += node.offsetTop  || 0;
      node = node.offsetParent;
      ns   = _ie ? node[_runstyle]
                 : _runstyle(node, "");
      if (hash[ns.position]) {
        break;
      }
    }
    return { x: x, y: y };
  }
};

// --- initialize ---

// --- export ---
_win.uuStyle = _style; // window.uuStyle

})(); // uuStyle scope


// === uuStyle.opacity ===
// depend: uuMeta
/*
uuStyle.getOpacity(elm) - return 0.0 ~ 1.0
uuStyle.setOpacity(elm, opacity = 1.0, diff = 0)
 */
(function() {
var _mm = uuMeta,
    _float = parseFloat,
    _runstyle = _mm.runstyle,
    ALPHA = "DXImageTransform.Microsoft.Alpha";

// uuStyle.setOpacity - set opacity value(from 0.0 to 1.0)
function setOpacity(elm,     // @param Node:
                    opacity, // @param Number: float(from 0.0 to 1.0)
                    diff) {  // @param Boolean(= false):
  if (diff) {
    opacity += _float(elm.style.opacity || _runstyle(elm, "").opacity);
  }
  elm.style.opacity = (opacity > 0.999) ? 1
                    : (opacity < 0.001) ? 0 : opacity;
}

function setOpacityIE(elm, opacity, diff) {
  var es = elm.style, obj;

  if (es.uuopacity === void 0) {
    es.uuopacity = 1;
    (es.filter.indexOf(ALPHA) < 0) && (es.filter += " progid:" + ALPHA);
    if (!_mm.iemode8 && elm.currentStyle.width === "auto") {
      es.zoom = 1; // IE6, IE7: force "hasLayout"
    }
  }
  if (diff) {
    opacity += _float(es.uuopacity);
  }
  es.uuopacity = opacity = (opacity > 0.999) ? 1
                         : (opacity < 0.001) ? 0 : opacity;
  obj = elm.filters.item(ALPHA);
  obj.Opacity = (opacity * 100) | 0;
  obj.Enabled = (opacity === 1 || opacity === 0) ? false : true;
  es.visibility = (opacity === 0) ? "hidden" : "";
}

// uuStyle.getOpacity - get opacity value(from 0.0 to 1.0)
function getOpacity(elm) { // @param Node:
                           // @return Number: float(from 0.0 to 1.0)
  return _float(elm.style.opacity || _runstyle(elm, "").opacity);
}

function getOpacityIE(elm) {
  var rv = elm.style.uuopacity;

  return (rv === void 0) ? 1 : rv;
}

// --- initialize ---

// --- export ---
window.uuStyle.getOpacity = _mm.ie ? getOpacityIE : getOpacity;
window.uuStyle.setOpacity = _mm.ie ? setOpacityIE : setOpacity;

})(); // uuStyle.opacity scope


// === uuImage ===
// depend: none
/*
uuImage.load(url, callback)
uuImage.getActualDimension(image) - return { w, h }
 */

(function() {
var _image, // inner namespace
    _ie = document.uniqueID;

_image = {
  // uuImage.load - delay loader
  load: function(url,        // @param String:
                 callback) { // @param Function: callback(img, state, dim)
                             //     img: image object
                             //     state: 0(loading...), 1(loaded), -1(error)
                             //     dim: { w, h }
    var img = new Image();
    img.state = 0; // bond

    img.clear = function() { // bond
      img.onerror = "";
      img.onload = "";
      img = void 0; // fix memory leak in IE6
    };
    img.onerror = function() {
      img.state = -1; // error
      callback &&
          callback(img, img.state, { w: 0, h: 0 });
    };
    img.onload = function() {
      if (img.complete ||
          img.readyState === "complete") { // IE8
        img.state = 1; // ok
        setTimeout(function() {
          callback &&
              callback(img, img.state, { w: img.width,
                                         h: img.height });
        }, 0);
      }
    };
    img.setAttribute("src", url);
  },

  // uuImage.getActualDimension
  // http://d.hatena.ne.jp/uupaa/20090602/1243933843
  getActualDimension: function(image) { // @param HTMLImageElement
                                        // @return Hash: { w, h }
    var run, mem, w, h, key = "actual";

    // for Firefox, Safari, Chrome
    if ("naturalWidth" in image) {
      return { w: image.naturalWidth, h: image.naturalHeight };
    }

    if ("src" in image) { // HTMLImageElement
      if (image[key] && image[key].src === image.src) {
        return image[key];
      }
      if (_ie) { // for IE
        run = image.runtimeStyle;
        mem = { w: run.width, h: run.height }; // keep runtimeStyle
        run.width  = "auto"; // override
        run.height = "auto";
        w = image.width;
        h = image.height;
        run.width  = mem.w; // restore
        run.height = mem.h;
      } else { // for Opera
        mem = { w: image.width, h: image.height }; // keep current style
        image.removeAttribute("width");
        image.removeAttribute("height");
        w = image.width;
        h = image.height;
        image.width  = mem.w; // restore
        image.height = mem.h;
      }
      return image[key] = { w: w, h: h, src: image.src }; // bond
    }
    // HTMLCanvasElement
    return { w: image.width, h: image.height };
  }
};

// --- initialize ---

// --- export ---
window.uuImage = _image;

})();


// === uuCanvas ===
// depend: uuMeta, uuColor, uuStyle, uuImage
/*
uuCanvas.init(canvas, vml = false) - return new canvas element
uuCanvas.ready(callback)
uuCanvas.already() - return true is already
uuCanvas.expire()
uuCanvas.SL2D
uuCanvas.VML2D
 */
(function() {
var _canvas, // inner namespace
    _mm = uuMeta,
    _style = uuStyle,
    _image = uuImage,
    _win = window,
    _doc = document,
    _ie = _mm.ie,
    _opera = _mm.opera,
    _gecko = _mm.gecko,
    _webkit = _mm.webkit,
    _chrome = _mm.chrome,
    _slver = _mm.slver,
    _uaver = _mm.uaver,
    _egver = _mm.enginever,
    _int = parseInt,
    _float = parseFloat,
    _math = Math,
    _round = _math.round,
    _ceil = _math.ceil,
    _sin = _math.sin,
    _cos = _math.cos,
    _max = _math.max,
//  _rad = _math.PI / 180, // Math.toRadians
    _deg = 180 / _math.PI, // Math.toDegrees
    _runstyle = _mm.runstyle,
    _mix = _mm.mix,
    _hex = _mm.hex,
    _uid = 0, // cache uid
    // ---
    _canvasReady = 0,
    _crc2d, // lazy
    _metric, // Text Metric Element
    _matrix,
    _zoom = 10,
    _halfZoom = 5,
    _slHostCount = 0,
    _super,
    _shadowWidth = 4,
    _fontCache = {},  // { uid: { font: fontString } }
    _unitCache = {},  // { uid: { pt, em } }
    _colorCache = {}, // { color: ["#ffffff", alpha] }
    _parseColor = function(c) {
      return _colorCache[c] = uuColor.parse(c); // add cache
    },
    // property alias
    CANVAS_RENDERING_CONTEXT_2D = "CanvasRenderingContext2D",
    GLOBAL_ALPHA    = "globalAlpha",
    GLOBAL_COMPO    = "globalCompositeOperation",
    STROKE_STYLE    = "strokeStyle",
    FILL_STYLE      = "fillStyle",
    LINE_WIDTH      = "lineWidth",
    LINE_CAP        = "lineCap",
    LINE_JOIN       = "lineJoin",
    MITER_LIMIT     = "miterLimit",
    SHADOW_OFFSET_X = "shadowOffsetX",
    SHADOW_OFFSET_Y = "shadowOffsetY",
    SHADOW_BLUR     = "shadowBlur",
    SHADOW_COLOR    = "shadowColor",
    SHADOWS         = [SHADOW_COLOR, SHADOW_OFFSET_X, SHADOW_OFFSET_Y,
                       SHADOW_BLUR],
    FONT            = "font",
    TEXT_ALIGN      = "textAlign",
    TEXT_BASELINE   = "textBaseline",
    MEASURE_STYLE   = "position:absolute;border:0 none;margin:0;padding:0;",
    TRANSPARENT     = "transparent",
    // property sets
    HIT_PROPS       = { width: 1, height: 1 },
    HIT_PROPS2      = { width: 1, height: 1,
                        display: 2, visibility: 2, opacity: 2 },
    COMPOSITES      = { "source-over": 0, "destination-over": 4, copy: 10 },
    SAVE_PROPS      = { strokeStyle: 1, fillStyle: 1, globalAlpha: 1,
                        lineWidth: 1, lineCap: 1, lineJoin: 1, miterLimit: 1,
                        shadowOffsetX: 1, shadowOffsetY: 1, shadowBlur: 1,
                        shadowColor: 1, globalCompositeOperation: 1, font: 1,
                        textAlign: 1, textBaseline: 1, _lineScale: 1,
                        _scaleX: 1, _scaleY: 1, _efx: 1, _clipPath: 1 },
    CAPS            = { square: "square", butt: "flat", round: "round" },
    FONT_SIZES      = { "xx-small": 0.512, "x-small": 0.64, smaller: 0.8,
                        small: 0.8, medium: 1, large: 1.2, larger: 1.2,
                        "x-large": 1.44, "xx-large": 1.728 },
    FONT_STYLES     = { normal: "Normal", italic: "Italic", oblique: "Italic" },
    FONT_WEIGHTS    = { normal: "Normal", bold: "Bold", bolder: "ExtraBold",
                        lighter: "Thin", "100": "Thin", "200": "ExtraLight",
                        "300": "Light", "400": "Normal", "500": "Medium",
                        "600": "SemiBold", "700": "Bold", "800": "ExtraBold",
                        "900": "Black" },
    FONT_SCALES     = { ARIAL: 1.55, "ARIAL BLACK": 1.07,
                        "COMIC SANS MS": 1.15, "COURIER NEW": 1.6,
                        GEORGIA: 1.6, "LUCIDA GRANDE": 1,
                        "LUCIDA SANS UNICODE": 1, "TIMES NEW ROMAN": 1.65,
                        "TREBUCHET MS": 1.55, VERDANA: 1.4, "MS UI GOTHIC": 2,
                        "MS PGOTHIC": 2, MEIRYO: 1,
                        "SANS-SERIF": 1, SERIF: 1, MONOSPACE: 1,
                        FANTASY: 1, CURSIVE: 1 },
    FUNCS           = { 1: "_lfill", 2: "_rfill", 3: "_pfill" },
    // fragments
    SL_FILL         = '" Fill="',
    SL_STROKE       = '" Stroke="',
    SL_DATA         = '" Data="',
    SL_PATH_OPACITY = '<Path Opacity="',
    SL_CANVAS_ZINDEX= '<Canvas Canvas.ZIndex="',
    SL_CANVAS_LEFT  = '" Canvas.Left="',
    SL_CANVAS_TOP   = '" Canvas.Top="',
    VML_COORD       = '" coordsize="100,100',
    VML_FILL        = '" filled="t" stroked="f',
    VML_STROKE      = '" filled="f" stroked="t',
    VML_PATH        = '" path="',
    VML_COLOR       = '" color="',
    VML_COLORS      = '" colors="',
    VML_OPACITY     = '" opacity="',
    VML_ANGLE       = '" angle="',
    VML_FILLTYPE_HEAD = ' filltype="',
    VML_TYPE_HEAD   = ' type="',
    VML_COLOR_HEAD  = ' color="',
    VML_BASE_STYLE  = ' style="position:absolute;z-index:',
    VML_SHAPE_STYLE =
          '<v:shape style="position:absolute;width:10px;height:10px;z-index:',
    VML_END_SHAPE   = '" /></v:shape>',
    VML_VSTROKE     = '"><v:stroke',
    VML_VFILL       = '"><v:fill',
    DX_PFX          = 'progid:DXImageTransform.Microsoft';

_canvas = {
  // uuCanvas.init - initialize a canvas made dynamically
  init: function(canvas, // @param Node: canvas element
                 vml) {  // @param Boolean(= false): true = force VML
    return canvas.getContext ? canvas // already initialized
                             : (vml || !_slver) ? VMLInit(canvas)
                                                : SLInit(canvas);
  },

  // uuCanvas.ready
  ready: function(callback) { // @param Function:
    var lp = function() {
      (_ie ? _canvas.already()
           : _canvasReady) ? callback() : setTimeout(lp, 64);
    }
    setTimeout(lp, 16);
  },

  // uuCanvas.already
  already: function() { // @return Boolean: true is already
    if (!_ie) { return !!_canvasReady; }
    var node = _doc.getElementsByTagName("canvas"), i = node.length;
    while (i--) {
      if (!("uuCanvasType" in node[i])) {
        return false;
      }
    }
    return true;
  },

  // uuCanvas.expire - expire cache
  expire: function() {
    _fontCache = {};
    _unitCache = {};
    _colorCache = {};
  }
};

// 2D Matrix
_matrix = {
  multiply: function(a, b) {
    return [a[0] * b[0] + a[1] * b[3] + a[2] * b[6],  // m11
            a[0] * b[1] + a[1] * b[4] + a[2] * b[7],  // m12
            0,                                        // m13
            a[3] * b[0] + a[4] * b[3] + a[5] * b[6],  // m21
            a[3] * b[1] + a[4] * b[4] + a[5] * b[7],  // m22
            0,                                        // m23
            a[6] * b[0] + a[7] * b[3] + a[8] * b[6],  // m31(dx)
            a[6] * b[1] + a[7] * b[4] + a[8] * b[7],  // m32(dy)
            a[6] * b[2] + a[7] * b[5] + a[8] * b[8]]; // m33
  },

  translate: function(x, y) {
    return [1, 0, 0,  0, 1, 0,  x, y, 1];
  },

  rotate: function(angle) {
    var c = _cos(angle), s = _sin(angle);
    return [c, s, 0,  -s, c, 0,  0, 0, 1];
  },

  scale: function(x, y) {
    return [x, 0, 0,  0, y, 0,  0, 0, 1];
  },

  transform: function(m11, m12, m21, m22, dx, dy) {
    return [m11, m12, 0,  m21, m22, 0,  dx, dy, 1];
  }
};

function detectDrawImageArg(image) {
  var a = arguments, az = a.length,
      dim = _image.getActualDimension(image);

  if (az < 9) {
    return {
      az: az, dim: dim,
      sx: 0, sy: 0, sw: dim.w, sh: dim.h,
      dx: a[1], dy: a[2], dw: a[3] || dim.w, dh: a[4] || dim.h
    };
  } else if (az === 9) {
    return {
      az: az, dim: dim,
      sx: a[1], sy: a[2], sw: a[3], sh: a[4],
      dx: a[5], dy: a[6], dw: a[7], dh: a[8]
    };
  }
  throw "";
}

function toHTMLEntity(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// measure text rect(width, height)
function getTextMetric(text, font) {
  if (!_metric) {
    _metric = _doc.createElement("div");
    // "left:-10000px" is fixed word wrap
    _metric.style.cssText =
        MEASURE_STYLE +
        "top:-10000px;left:-10000px;text-align:left;visibility:hidden";
    _doc.body.appendChild(_metric);
  }
  _metric.style.font = font;
  _ie ? (_metric.innerText = text)
      : (_metric.textContent = text);

  var w = 0, h = 0, rect;
  if (_metric.getBoundingClientRect) {
    rect = _metric.getBoundingClientRect();
    w = rect.right - rect.left, h = rect.bottom - rect.top;
  }
  return { w: _metric.clientWidth || w, h: _metric.clientHeight || h };
}

// parse CSS::font style
function parseFont(font, embase) {
  var rv = {}, w, sz, dummy, style, uid, key = "uuCanvasID";

  function measureUnit(elm) {
    var node = elm.appendChild(_doc.createElement("div")), pt, em;
    node.style.cssText = MEASURE_STYLE + "width:12pt;height:12em";
    pt = node.clientWidth  / 12;
    em = node.clientHeight / 12;
    elm.removeChild(node);
    return { pt: pt, em: em };
  }

  uid = embase[key] || (embase[key] = ++_uid);

  if (uid in _fontCache) {
    if (font in _fontCache[uid]) {
      return _fontCache[uid][font];
    }
  } else {
    _fontCache[uid] = {};
  }

  // computed font style by CSS parser
  dummy = _doc.createElement("div");
  style = dummy.style;
  try {
    style.font = font;
  } catch (err) {}

  sz = style.fontSize;

  if ( (w = FONT_SIZES[sz]) ) {
    w *= 16;
  } else {
    w = _float(sz);
    if (/pt$/.test(sz)) { // "12.3pt"
      w *= 1.33; // 1.3333...
    } else if (/em$/.test(sz)) { // "10.5em"
      if (!(uid in _unitCache)) {
        _unitCache[uid] = measureUnit(embase);
      }
      w *= _unitCache[uid].em;
    }
  }
  rv.size = _float(w);
  rv.style = style.fontStyle;
  rv.weight = style.fontWeight;
  rv.variant = style.fontVariant;
  rv.rawfamily = style.fontFamily.replace(/[\"\']/g, "");
  rv.family = "'" + rv.rawfamily.replace(/\s*,\s*/g, "','") + "'";
  rv.formal = [rv.style, rv.variant, rv.weight, rv.size.toFixed(2) + "px",
               rv.family].join(" ");
  return _fontCache[uid][font] = rv;
}

function applyCanvasSize(elm) {
  var e = elm, attr = e.attributes;
  if (attr.width && attr.width.specified) {
    e.style.pixelWidth = _int(attr.width.nodeValue);
  } else {
    e.width = e.clientWidth;
  }
  if (attr.height && attr.height.specified) {
    e.style.pixelHeight = _int(attr.height.nodeValue);
  } else {
    e.height = e.clientHeight;
  }
}

function strokeProps(obj, vml) {
  var cap = CAPS[obj[LINE_CAP]],
      join = obj[LINE_JOIN],
      width = (obj[LINE_WIDTH] * obj._lineScale).toFixed(2),
      miter = obj[MITER_LIMIT];
  if (!vml) {
    return ['" StrokeLineJoin="', join,
            '" StrokeMiterLimit="', miter,
            '" StrokeThickness="', width,
            '" StrokeStartLineCap="', cap,
            '" StrokeEndLineCap="', cap].join("");
  }
  return ['" weight="', width, 'px" endcap="', cap,
          '" joinstyle="', join,
          '" miterlimit="', miter].join("");
}

_super = {
  save: function() {
    var prop = {}, i;
    for (i in SAVE_PROPS) {
      prop[i] = this[i];
    }
    this._stack.push([prop, _mix([], this._mtx),
                      this._clipPath ? String(this._clipPath) : null]);
  },

  restore: function() {
    if (!this._stack.length) { return; }

    var last = this._stack.pop(), i;
    for (i in SAVE_PROPS) {
      this[i] = last[0][i];
    }
    this._mtx = last[1];
    this._clipPath = last[2];
  },

  scale: function(x, y) {
    this._efx = 1;
    // inlining
    this._mtx = _matrix.multiply([x, 0, 0,  0, y, 0,  0, 0, 1], this._mtx);
    this._scaleX *= x;
    this._scaleY *= y;
    this._lineScale = (this._mtx[0] + this._mtx[4]) / 2;
  },

  rotate: function(angle) {
    this._efx = 1;
    var c = _cos(angle), s = _sin(angle);
    // inlining
    this._mtx = _matrix.multiply([c, s, 0,  -s, c, 0,  0, 0, 1], this._mtx);
  },

  translate: function(x, y) {
    this._efx = 1;
    // inlining
    this._mtx = _matrix.multiply([1, 0, 0,  0, 1, 0,  x, y, 1], this._mtx);
  },

  transform: function(m11, m12, m21, m22, dx, dy) {
    this._efx = 1;
    // inlining
    this._mtx = _matrix.multiply([m11, m12, 0,  m21, m22, 0,  dx, dy, 1],
                                 this._mtx);
  },

  setTransform: function(m11, m12, m21, m22, dx, dy) {
    // reset _efx flag
    this._efx = (m11 === 1 && !m12 &&
                 !m21 && m22 === 1 && !dx && !dy) ? 0 : 1;
    this._mtx = _matrix.transform(m11, m12, m21, m22, dx, dy);
  },

  strokeRect: function(x, y, w, h) {
    this.fill(1, this._rect(x, y, w, h));
  },

  beginPath: function() {
    this._path = [];
  },

  arcTo: function(x1, y1, x2, y2, radius) {
    // not impl
  },

  stroke: function() {
    this.fill(1);
  },

  isPointInPath: function(x, y) {
    // not impl
  },

  strokeText: function(text, x, y, maxWidth) {
    this.fillText(text, x, y, maxWidth, 1);
  },

  measureText: function(text) {
    var metric = getTextMetric(text, this[FONT]);
    return new TextMetrics(metric.w, metric.h);
  },

  createImageData: function(sw, sh) {
    // not impl
  },

  getImageData: function(sx, sy, sw, sh) {
    // not impl
  },

  putImageData: function(imagedata, dx, dy, dirtyX, dirtyY,
                         dirtyWidth, dirtyHeight) {
    // not impl
  },

  _initSurface: function(resize) {
    _mix(this, {
      // --- compositing ---
      globalAlpha:    1.0,
      globalCompositeOperation: "source-over",
      // --- colors and styles ---
      strokeStyle:    "#000000", // black
      fillStyle:      "#000000", // black
      // --- line caps/joins ---
      lineWidth:      1,
      lineCap:        "butt",
      lineJoin:       "miter",
      miterLimit:     10,
      // --- shadows ---
      shadowOffsetX:  0,
      shadowOffsetY:  0,
      shadowBlur:     0,
      shadowColor:    TRANSPARENT, // transparent black
      // --- text ---
      font:           "10px sans-serif",
      textAlign:      "start",
      textBaseline:   "alphabetic",
      // --- extend properties ---
      xMissColor:     "#000000", // black
      xTextMarginTop: 1.3, // for VML
      xClipStyle:     0, // for VML
      xImageRender:   0, // 0: normal, 1: vml:image
      xFlyweight:     0, // for Silverlight, VML
      xShadowOpacityFrom:  0.01, // for Silverlight, VML
      xShadowOpacityDelta: 0.05, // for Silverlight, VML
      // --- hidden properties ---
      _lineScale:     1,
      _scaleX:        1,
      _scaleY:        1,
      _zindex:        -1,
      _efx:           0 // 1: matrix effected
    });

    this._mtx = [1, 0, 0,  0, 1, 0,  0, 0, 1]; // Matrix.identity
    this._history = []; // canvas rendering history
    this._stack = []; // matrix and prop stack.
    this._path = []; // current path
    this._clipPath = null; // clipping path

    if (this.canvas.uuCanvasType === "VML2D") {
      this._shadow = ["#000", 0, 0, 0];
      this._px = 0; // current position x
      this._py = 0; // current position y
      if (resize) {
        this._elm.style.pixelWidth = this.canvas.width;
        this._elm.style.pixelHeight = this.canvas.height;
      }
    } else {
      this._shadow = ["#000", 0, 0, 0];
      this.xShadowBlur = _slver >= 3 ? 1 : 0;
      this.xTiling = 1; // 1 = TileBrush simulate(slow)
      this._clipRect = null; // clipping rect
    }
    return this;
  }
};

function onPropertyChange(evt) {
  var tgt, name = evt.propertyName;
  if (HIT_PROPS[name]) {
    tgt = evt.srcElement;
    tgt.style[name] = _max(_int(tgt.attributes[name].nodeValue), 0) + "px";
    tgt.uuCanvasType && tgt.getContext()._initSurface(1)._clear();
  }
}

function TextMetrics(w, h) { // for measureText
  this.width = w;
  this.height = h;
}

function Patt(image, repetition) { // for createPattern
  repetition = repetition || "repeat";
  switch (repetition) {
  case "repeat": break;
  default: throw "";
  }

  if (!("src" in image)) { // HTMLCanvasElement unsupported
    throw "";
  }
  this._src = image.src; // HTMLImageElement
  this._dim = _image.getActualDimension(image);
  this._type = 3; // 3:tile
  this._repeat = repetition;
}

function Grad(type, param, vml) { // for create(Linear|Radial)Gradient
  this._vml = vml;
  this._type = type;
  this._param = param;
  this._colorStop = [];
}

Grad.prototype.addColorStop = function(offset, color) {
  function fn(a, b) {
    return a.offset - b.offset;
  }

  var c = _colorCache[color] || _parseColor(color),
      v, i = 0, iz;

  if (!this._vml) { // SL
    this._colorStop.push({ offset: offset, color: c });
  } else { // VML
    // collision of the offset is evaded
    for (iz = this._colorStop.length; i < iz; ++i) {
      v = this._colorStop[i];
      if (v.offset === offset) {
        if (offset < 1 && offset > 0) {
          offset += iz / 1000; // collision -> +0.001
        }
      }
    }
    this._colorStop.push({ offset: 1 - offset, color: c });
  }
  this._colorStop.sort(fn); // sort offset
};

function removeFallbackContents(elm) {
  if (!elm.parentNode) {
    return elm;
  }
  var rv = _doc.createElement(elm.outerHTML),
      endTags = _doc.getElementsByTagName("/CANVAS"),
      idx = elm.sourceIndex,
      v, w, i = 0, iz = endTags.length;
  for (; i < iz; ++i) {
    if (idx < endTags[i].sourceIndex &&
        elm.parentNode === endTags[i].parentNode) {
      v = _doc.all[endTags[i].sourceIndex];
      do {
        w = v.previousSibling; // keep previous
        v.parentNode.removeChild(v);
        v = w;
      } while (v !== elm);
      break;
    }
  }
  elm.parentNode.replaceChild(rv, elm);
  return rv;
}

// --- Silverlight ---
function SLInit(elm) {
  var e = removeFallbackContents(elm),
      onload = "_sl" + (++_slHostCount) + "_onload";

  applyCanvasSize(e);
  e.getContext = function() { return e._ctx2d; };
  e._ctx2d = new SL2D(e);
  _win[onload] = function(sender) {
    e.uuCanvasType = "SL2D"; // canvas.already mark
    // lazy detection
    e.style.direction = e.currentStyle.direction;
    // sender is <Canvas> element
    // sender.getHost() is <object> element
    e._ctx2d._view = sender.children;
    e._ctx2d._content = sender.getHost().content;
    _win[onload] = void 0; // free event-hander
  };
  e.innerHTML = [
    '<object type="application/x-silverlight" width="100%" height="100%">',
      '<param name="background" value="#00000000" />',  // transparent
      '<param name="windowless" value="true" />',
      '<param name="source" value="#xaml" />',          // XAML ID
      '<param name="onLoad" value="', onload, '" />',   // bond to global
    '</object>'].join("");
  e.bind = function() {
    e.attachEvent("onpropertychange", onPropertyChange);
  };
  e.unbind = function() {
    e.detachEvent("onpropertychange", onPropertyChange);
  };
  e.bind();
  return e;
}

// Silverlight 2D
function SL2D(elm) {
  this.canvas = elm;
  this._initSurface();
  this._elm = elm;
  this._view = null;
  this._content = null;
};

_mix(SL2D.prototype, _super, {
  _rect: function(x, y, w, h) {
    if (this._efx) {
      var c0 = this._map(x, y),
          c1 = this._map(x + w, y),
          c2 = this._map(x + w, y + h),
          c3 = this._map(x, y + h);
      return [" M", c0.x, " ", c0.y,
              " L", c1.x, " ", c1.y,
              " L", c2.x, " ", c2.y,
              " L", c3.x, " ", c3.y,
              " Z"].join("");
    }
    return [" M", x,     " ", y,
            " L", x + w, " ", y,
            " L", x + w, " ", y + h,
            " L", x,     " ", y + h,
            " Z"].join("");
  },

  _map: function(x, y) {
    var m = this._mtx;
    return {
      x: x * m[0] + y * m[3] + m[6], // x * m11 + y * m21 + dx
      y: x * m[1] + y * m[4] + m[7]  // x * m12 + y * m22 + dy
    }
  },

  // === State =============================================
  // === Transformations ===================================
  // === Rects =============================================
  clearRect: function(x, y, w, h) {
    w = _int(w), h = _int(h);
    if ((!x && !y &&
         w == this.canvas.width &&
         h == this.canvas.height)) {
      this._clear(); // clear all
    } else {
      var zindex = 0, c = _style.getBGColor(this._elm, 1), xaml;

      switch (COMPOSITES[this[GLOBAL_COMPO]]) {
      case  4: zindex = --this._zindex; break;
      case 10: this._clear();
      }

      xaml = [SL_PATH_OPACITY, c[1] * this[GLOBAL_ALPHA],
              '" Canvas.ZIndex="', zindex,
              SL_FILL, c[0],
              SL_DATA, this._rect(x, y, w, h), '" />'].join("");
      !this.xFlyweight &&
        this._history.push(this._clipPath ? (xaml = this._clippy(xaml)) : xaml);
      this._view.add(this._content.createFromXaml(xaml, false));
    }
  },

  _clear: function(x, y, w, h) {
    this._history = [];
    this._zindex = 0;
    this._view && this._view.clear(); // fix for IE8
  },

  fillRect: function(x, y, w, h) {
    this.fill(0, this._rect(x, y, w, h));
  },

  // === Path API ==========================================
  closePath: function() {
    this._path.push(" Z");
  },

  moveTo: function(x, y) {
    if (this._efx) {
      var m = this._mtx; // inlining: this._map(x, y)
      this._path.push(" M", x * m[0] + y * m[3] + m[6], " ",
                            x * m[1] + y * m[4] + m[7]);
    } else {
      this._path.push(" M", x, " ", y);
    }
  },

  lineTo: function(x, y) {
    if (this._efx) {
      var m = this._mtx; // inlining: this._map(x, y)
      this._path.push(" L", x * m[0] + y * m[3] + m[6], " ",
                            x * m[1] + y * m[4] + m[7]);
    } else {
      this._path.push(" L", x, " ", y);
    }
  },

  quadraticCurveTo: function(cpx, cpy, x, y) {
    if (this._efx) {
      var c0 = this._map(cpx, cpy), c1 = this._map(x, y);
      cpx = c0.x, cpy = c0.y, x = c1.x, y = c1.y;
    }
    this._path.push(" Q", cpx, " ", cpy, " ", x, " ", y);
  },

  bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
    if (this._efx) {
      var c0 = this._map(cp1x, cp1y), c1 = this._map(cp2x, cp2y),
          c2 = this._map(x, y);
      cp1x = c0.x, cp1y = c0.y, cp2x = c1.x, cp2y = c1.y, x = c2.x, y = c2.y;
    }
    this._path.push(" C", cp1x, " ", cp1y, " ", cp2x, " ", cp2y, " ",
                          x, " ", y);
  },

  rect: function(x, y, w, h) {
    this._path.push(this._rect(x, y, w, h));
  },

  arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
    var deg1 = startAngle * _deg,
        deg2 = endAngle * _deg,
        isLargeArc = 0, magic = 0.0001570796326795,
        sweepDirection = anticlockwise ? 0 : 1,
        sx, sy, ex, ey, rx, ry, c0;

    // angle normalize
    if (deg1 < 0)   { deg1 += 360; }
    if (deg1 > 360) { deg1 -= 360; }
    if (deg2 < 0)   { deg2 += 360; }
    if (deg2 > 360) { deg2 -= 360; }

    // circle
    if (deg1 + 360 == deg2 || deg1 == deg2 + 360) {
      if (sweepDirection) {
        endAngle -= magic;
      } else {
        endAngle += magic;
      }
      isLargeArc = 1;
    } else if (sweepDirection) {
      if (deg2 - deg1 > 180) {
        isLargeArc = 1;
      }
    } else {
      if (deg1 - deg2 > 180) {
        isLargeArc = 1;
      }
    }

    rx = this._scaleX * radius;
    ry = this._scaleY * radius;

    sx = x + (_cos(startAngle) * radius);
    sy = y + (_sin(startAngle) * radius);
    ex = x + (_cos(endAngle) * radius);
    ey = y + (_sin(endAngle) * radius);

    // add <PathFigure StartPoint="..">
    this._path.length ? this.lineTo(sx, sy)
                      : this.moveTo(sx, sy);
    if (this._efx) {
      c0 = this._map(ex, ey);
      ex = c0.x;
      ey = c0.y;
    }
    this._path.push(" A", rx, " ", ry, " 0 ", isLargeArc, " ",
                    sweepDirection, " ", ex, " ", ey);
  },

  fill: function(wire, path) {
    path = path || this._path.join("");

    var rv = [], xaml, zindex = 0, mix, c,
        style = wire ? this[STROKE_STYLE] : this[FILL_STYLE],
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _parseColor(this[SHADOW_COLOR]);

    if ( (mix = COMPOSITES[this[GLOBAL_COMPO]]) ) {
      (mix === 4) ? (zindex = --this._zindex) : this._clear();
    }

    if (typeof style === "string") {
      c = _colorCache[style] || _parseColor(style);

      rv.push(SL_CANVAS_ZINDEX, zindex, '">');

      if (sc[1] && !this.xShadowBlur) {
        sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
        sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
        so = this.xShadowOpacityFrom;
        sd = this.xShadowOpacityDelta;

        for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
          rv.push(SL_PATH_OPACITY, so.toFixed(2),
                  SL_CANVAS_LEFT, sx, SL_CANVAS_TOP, sy,
                  SL_DATA, path,
                  wire ? strokeProps(this) : "",
                  wire ? SL_STROKE : SL_FILL, sc[0], '" />');
        }
      }
      rv.push(SL_PATH_OPACITY, c[1] * this[GLOBAL_ALPHA],
              SL_DATA, path,
              wire ? strokeProps(this) : "",
              wire ? SL_STROKE : SL_FILL, c[0], '">',
              (sc[1] && this.xShadowBlur) ? this._blur("Path", sc) : "",
              '</Path></Canvas>');
      xaml = rv.join("");
    } else {
      xaml = this[FUNCS[style._type]](style, path, wire, mix, zindex, sc);
    }
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (xaml = this._clippy(xaml)) : xaml);
    this._view.add(this._content.createFromXaml(xaml, false));
  },

  // LinearGradient fill
  _lfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [],
        fp = style._param,
        color = this._lcolor(style._colorStop),
        prop = wire ? "Stroke" : "Fill",
        c0 = this._map(fp.x0, fp.y0), c1 = this._map(fp.x1, fp.y1),
        // for shadow
        si = 0, siz = _shadowWidth, sc, so = 0, sd = 0, shx = 0, shy = 0;

    rv.push(SL_CANVAS_ZINDEX, zindex, '">');

    if (shadowColor[1] && !this.xShadowBlur) {
      sc = this._lcolor([
        { offset: 0.0, color: shadowColor },
        { offset: 1.0, color: shadowColor }
      ]);
      shx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      shy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;

      if (wire) {
        siz = this[LINE_WIDTH];
        sd = 0.2 / siz; // opacity from 0.05 to 0.25
      }
      for (; si < siz; so += sd, --shx, --shy, ++si) {
        rv.push(SL_PATH_OPACITY, so.toFixed(2),
                SL_CANVAS_LEFT, shx, SL_CANVAS_TOP, shy,
                SL_DATA, path,
                wire ? strokeProps(this) : "", '"><Path.', prop,
                '><LinearGradientBrush MappingMode="Absolute" StartPoint="',
                c0.x, ",", c0.y,
                '" EndPoint="', c1.x, ",", c1.y, '">', sc,
                '</LinearGradientBrush></Path.', prop, '></Path>');
      }
    }

    rv.push(SL_PATH_OPACITY, this[GLOBAL_ALPHA],
            SL_DATA, path,
            wire ? strokeProps(this) : "", '"><Path.', prop,
            '><LinearGradientBrush MappingMode="Absolute" StartPoint="',
            c0.x, ",", c0.y,
              '" EndPoint="', c1.x, ",", c1.y, '">', color,
            '</LinearGradientBrush></Path.', prop, '>',
              (shadowColor[1] &&
               this.xShadowBlur) ? this._blur("Path", shadowColor) : "",
            '</Path></Canvas>');
    return rv.join("");
  },

  // RadialGradient fill
  _rfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [], prop = wire ? "Stroke" : "Fill",
        fp = style._param,
        zindex2 = 0,
        color = this._rcolor(style),
        rr = fp.r1 * 2,
        x = fp.x1 - fp.r1,
        y = fp.y1 - fp.r1,
        gx = (fp.x0 - (fp.x1 - fp.r1)) / rr,
        gy = (fp.y0 - (fp.y1 - fp.r1)) / rr,
        m = _matrix.multiply(_matrix.translate(x, y), this._mtx),
        tmpmtx = this._trns('Ellipse', m),
        v, bari = "",
        // for shadow
        si = 0, siz = _shadowWidth, so = 0, sd = 0, sx = 0, sy = 0;

    rv.push(SL_CANVAS_ZINDEX, zindex, '">');

    if (shadowColor[1] && !this.xShadowBlur) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;

      if (wire) {
        siz = this[LINE_WIDTH];
        sd = 0.2 / siz; // opacity from 0.05 to 0.25
      }

      for (; si < siz; so += sd, --sx, --sy, ++si) {
        rv.push('<Ellipse Opacity="', so.toFixed(2),
                SL_CANVAS_LEFT, sx, SL_CANVAS_TOP, sy,
                '" Width="', rr, '" Height="', rr,
                wire ? strokeProps(this) : "",
                wire ? SL_STROKE : SL_FILL, shadowColor[0],
                '">', tmpmtx, '</Ellipse>');
      }
    }

    if (!wire) {
      // fill outside
      if (style._colorStop.length) {
        v = style._colorStop[style._colorStop.length - 1];
        if (v.color[1] > 0.001) {
          if (mix === 4) { zindex2 = --this._zindex; }
          bari =  [ SL_PATH_OPACITY, this[GLOBAL_ALPHA],
                    '" Canvas.ZIndex="', zindex2,
                    SL_DATA, path, SL_FILL, '#',
                    _hex[_float(v.color[1] / (1 / 255))] +
                    v.color[0].substring(1),
                    '" />'].join("");
          !this.xFlyweight &&
            this._history.push(this._clipPath ? (bari = this._clippy(bari))
                                              : bari);
          this._view.add(this._content.createFromXaml(bari, false));
        }
      }
    }

    rv.push('<Ellipse Opacity="', this[GLOBAL_ALPHA],
            '" Width="', rr, '" Height="', rr,
            wire ? strokeProps(this) : "",
            '"><Ellipse.', prop, '><RadialGradientBrush GradientOrigin="',
            gx, ',', gy,
            '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">', color,
            '</RadialGradientBrush></Ellipse.', prop, '>',
              tmpmtx,
              (shadowColor[1] &&
               this.xShadowBlur) ? this._blur("Ellipse", shadowColor) : "",
            '</Ellipse></Canvas>');
    return rv.join("");
  },

  // Pattern fill
  _pfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [], prop = wire ? "Stroke" : "Fill",
        zindex2 = 0,
        sw, sh, xz, yz, x, y, // use tile mode
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0;

    if (!wire && this.xTiling) {
      x  = 0;
      y  = 0;
      sw = style._dim.w;
      sh = style._dim.h;
      xz = _ceil(_int(this.canvas.width)  / sw);
      yz = _ceil(_int(this.canvas.height) / sh);

      if (mix === 4) { zindex2 = --this._zindex; }

      rv.push(SL_CANVAS_ZINDEX, zindex, '">');

      if (shadowColor[1]) {
        sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
        sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
        so = this.xShadowOpacityFrom;
        sd = this.xShadowOpacityDelta;

        for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
          rv.push(SL_PATH_OPACITY, so.toFixed(2),
                  SL_CANVAS_LEFT, sx, SL_CANVAS_TOP, sy,
                  SL_DATA, path, wire ? strokeProps(this) : "",
                  SL_FILL, shadowColor[0],
                  '" />');
        }
      }

      rv.push(SL_CANVAS_ZINDEX, zindex2, '" Clip="', path, '">');
      for (y = 0; y < yz; ++y) {
        for (x = 0; x < xz; ++x) {
          rv.push('<Image Opacity="', this[GLOBAL_ALPHA],
                  SL_CANVAS_LEFT, x * sw, SL_CANVAS_TOP, y * sh,
                  '" Source="', style._src, '">',
//                  (shadowColor[1] &&
//                   this.xShadowBlur) ? this._blur("Image", shadowColor) : "",
                  '</Image>');
        }
      }
      rv.push('</Canvas></Canvas>');

      return rv.join("");
    }

    rv.push(SL_CANVAS_ZINDEX, zindex, '">');

    if (shadowColor[1] && !this.xShadowBlur) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;

      for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
        rv.push(SL_PATH_OPACITY, so.toFixed(2),
                SL_CANVAS_LEFT, sx, SL_CANVAS_TOP, sy,
                SL_DATA, path, wire ? strokeProps(this) : "",
                '"><Path.', prop, '><ImageBrush Stretch="None" ImageSource="',
                style._src,
                '" /></Path.', prop, '></Path>');
      }
    }

    rv.push(SL_PATH_OPACITY, this[GLOBAL_ALPHA],
            wire ? strokeProps(this) : "",
            SL_DATA, path,
            '"><Path.', prop, '><ImageBrush Stretch="None" ImageSource="',
            style._src,
            '" /></Path.', prop, '>',
              (shadowColor[1] &&
               this.xShadowBlur) ? this._blur("Path", shadowColor) : "",
            '</Path></Canvas>');
    return rv.join("");
  },

  clip: function() {
    this._clipPath = this._path.join("");
  },

  _clippy: function(xaml) {
    return ['<Canvas Clip="', this._clipPath, '">', xaml,
            '</Canvas>'].join("");
  },

  // === Text ==============================================
  fillText: function(text, x, y, maxWidth, wire) {
    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");
    var style = wire ? this[STROKE_STYLE] : this[FILL_STYLE],
        types = (typeof style === "string") ? 0 : style._type,
        rv = [], xaml, c, fp, c0, c1, zindex = 0, mtx, rgx, rgy,
        font = parseFont(this[FONT], this.canvas),
        metric = getTextMetric(text, font.formal),
        offX = 0, align = this[TEXT_ALIGN], dir = "ltr",
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _parseColor(this[SHADOW_COLOR]);

    switch (align) {
    case "end": dir = "rtl"; // break;
    case "start":
      align = this._elm.style.direction === dir ? "left" : "right"
    }
    if (align === "center") {
      offX = (metric.w - 4) / 2; // -4: adjust
    } else if (align === "right") {
      offX = metric.w;
    }

    mtx = this._trns('TextBlock',
                     _matrix.multiply(_matrix.translate(x - offX, y),
                                      this._mtx));

    switch (COMPOSITES[this[GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: this._clear();
    }

    rv.push(SL_CANVAS_ZINDEX, zindex, '">');

    if (sc[1] && !this.xShadowBlur) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = _max(this.xShadowOpacityFrom + 0.9, 1);
      sd = this.xShadowOpacityDelta;

      for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
        rv.push('<TextBlock Opacity="', so.toFixed(2),
                '" Foreground="', sc[0],
                SL_CANVAS_LEFT, sx, SL_CANVAS_TOP, sy,
                '" FontFamily="', font.rawfamily,
                '" FontSize="', font.size.toFixed(2),
                '" FontStyle="', FONT_STYLES[font.style] || "Normal",
                '" FontWeight="', FONT_WEIGHTS[font.weight] || "Normal",
                '">', toHTMLEntity(text), mtx, '</TextBlock>');
      }
    }

    if (!types) {
      c = _colorCache[style] || _parseColor(style);
      rv.push('<TextBlock Opacity="', c[1] * this[GLOBAL_ALPHA],
              '" Foreground="', c[0]);
    } else {
      rv.push('<TextBlock Opacity="', this[GLOBAL_ALPHA]);
    }
    rv.push('" FontFamily="', font.rawfamily,
            '" FontSize="', font.size.toFixed(2),
            '" FontStyle="', FONT_STYLES[font.style] || "Normal",
            '" FontWeight="', FONT_WEIGHTS[font.weight] || "Normal",
            '">', toHTMLEntity(text), mtx,
              (sc[1] && this.xShadowBlur) ? this._blur("TextBlock", sc) : "");

    switch (types) {
    case 1: c = this._lcolor(style._colorStop);
            fp = style._param;
            c0 = this._map(fp.x0, fp.y0), c1 = this._map(fp.x1, fp.y1),
            rv.push('<TextBlock.Foreground>',
                    '<LinearGradientBrush MappingMode="Absolute" StartPoint="',
                    c0.x, ",", c0.y,
                    '" EndPoint="', c1.x, ",", c1.y, '">', c,
                    '</LinearGradientBrush></TextBlock.Foreground>');
            break;
    case 2: c = this._rcolor(style);
            fp = style._param,
            rgx = (fp.x0 - (fp.x1 - fp.r1)) / (fp.r1 * 2),
            rgy = (fp.y0 - (fp.y1 - fp.r1)) / (fp.r1 * 2),
            rv.push('<TextBlock.Foreground>',
                    '<RadialGradientBrush GradientOrigin="', rgx, ',', rgy,
                    '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">', c,
                    '</RadialGradientBrush></TextBlock.Foreground>');
            break;
    case 3: rv.push('<TextBlock.Foreground>',
                    '<ImageBrush Stretch="None" ImageSource="', style._src,
                    '" /></TextBlock.Foreground>');
    }
    rv.push('</TextBlock></Canvas>');
    xaml = rv.join("");
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (xaml = this._clippy(xaml)) : xaml);
    this._view.add(this._content.createFromXaml(xaml, false));
  },

  // === Drawing images ====================================
  // drawImage(image, dx, dy)
  // drawImage(image, dx, dy, dw, dh)
  // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  drawImage: function(image) {
    var info = detectDrawImageArg.apply(this, arguments),
        dx = info.dx,
        dy = info.dy,
        dw = info.dw,
        dh = info.dh,
        sx = info.sx,
        sy = info.sy,
        sw = info.sw,
        sh = info.sh,
        iw = info.dim.w,
        ih = info.dim.h,
        rv = [], xaml,
        bw, bh, w, h, x, y, // slice
        m, tmpmtx, size = "", clip = "",
        zindex = 0, sclip = "",
        i = 0, iz, // for copy canvas
        // for shadow
        si = 0, so = 0, sd = 0, shx = 0, shy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _parseColor(this[SHADOW_COLOR]);

    switch (COMPOSITES[this[GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: this._clear();
    }

    if ("src" in image) { // image is HTMLImageElement
      switch (info.az) {
      case 3:
        m = _matrix.multiply(_matrix.translate(dx, dy), this._mtx);
        break;
      case 5:
        m = _matrix.multiply(_matrix.translate(dx, dy), this._mtx);
        size = ['" Width="', dw, '" Height="', dh].join("");
        break;
      case 9:
        // TODO: image ratio
        //
        bw = dw / sw; // bias width
        bh = dh / sh; // bias height
        w = bw * iw;
        h = bh * ih;
        x = dx - (bw * sx);
        y = dy - (bh * sy);

        m = _matrix.multiply(_matrix.translate(x, y), this._mtx);

        size = ['" Width="', w, '" Height="', h].join("");
        clip = ['<Image.Clip><RectangleGeometry Rect="',
                  [dx - x, dy - y, dw, dh].join(" "),
                '" /></Image.Clip>'].join("");
        if (sc[1] && !this.xShadowBlur) {
          sclip = ['<Rectangle.Clip><RectangleGeometry Rect="',
                    [dx - x, dy - y, dw, dh].join(" "),
                   '" /></Rectangle.Clip>'].join("");
        }
      }

      rv.push(SL_CANVAS_ZINDEX, zindex, '">');

      if (sc[1] && !this.xShadowBlur) {
        shx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
        shy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
        so = this.xShadowOpacityFrom;
        sd = this.xShadowOpacityDelta;
        tmpmtx = this._trns('Rectangle', m);

        for (; si < _shadowWidth; so += sd, --shx, --shy, ++si) {
          rv.push('<Rectangle Opacity="', so.toFixed(2),
                  SL_CANVAS_LEFT, shx, SL_CANVAS_TOP, shy,
                  size, SL_FILL, sc[0], '">', sclip,
                  tmpmtx,
                  '</Rectangle>');
        }
      }

      rv.push('<Image Opacity="', this[GLOBAL_ALPHA],
              '" Source="', image.src, size, '">',
              clip, this._trns('Image', m),
              (sc[1] && this.xShadowBlur) ? this._blur("Image", sc) : "",
              '</Image></Canvas>');
      xaml = rv.join("");
      !this.xFlyweight &&
        this._history.push(this._clipPath ? (xaml = this._clippy(xaml)) : xaml);
      this._view.add(this._content.createFromXaml(xaml, false));
    } else { // HTMLCanvasElement
      iz = image._ctx2d._history.length;
      switch (info.az) {
      case 3:
        m = _matrix.multiply(_matrix.translate(dx, dy), this._mtx);
        break;
      case 5:
        m = _matrix.multiply(_matrix.translate(dx, dy), this._mtx);
        m = _matrix.multiply(_matrix.scale(dw / iw, dh / ih), m);
        break;
      case 9:
        bw = dw / sw; // bias width
        bh = dh / sh; // bias height
        w = bw * iw;
        h = bh * ih;
        x = dx - (bw * sx);
        y = dy - (bh * sy);

        m = _matrix.multiply(_matrix.translate(x, y), this._mtx);
        m = _matrix.multiply(_matrix.scale(bw, bh), m);

        clip = ['<Canvas.Clip><RectangleGeometry Rect="',
                  [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" "),
                '" /></Canvas.Clip>'].join("");
//        if (sc[1] && !this.xShadowBlur) {
//          sclip = ['<Rectangle.Clip><RectangleGeometry Rect="',
//                   [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" "),
//                   '" /></Rectangle.Clip>'].join("");
//        }
      }

      // shadow not impl

      rv.push(SL_CANVAS_ZINDEX, zindex,
              '" Opacity="', this[GLOBAL_ALPHA], // image._ctx2d[GLOBAL_ALPHA],
              size, '">',
              clip, this._trns('Canvas', m),
//              (sc[1] && this.xShadowBlur) ? this._blur("Canvas", sc) : "",
              '<Canvas>');

      for (; i < iz; ++i) {
        rv.push(image._ctx2d._history[i]);
      }
      rv.push('</Canvas></Canvas>');

      xaml = rv.join("");
      !this.xFlyweight &&
        this._history.push(this._clipPath ? (xaml = this._clippy(xaml)) : xaml);
      this._view.add(this._content.createFromXaml(xaml, false));
    }
  },

  // === Pixel manipulation ================================
  // === Gradient ==========================================
  createLinearGradient: function(x0, y0, x1, y1) {
    return new Grad(1, // 1:LinearGradient
                    { x0: x0, y0: y0, x1: x1, y1: y1 });
  },

  createRadialGradient: function(x0, y0, r0, x1, y1, r1) {
    return new Grad(2, // 2:RadialGradient
                    { x0: x0, y0: y0, r0: r0, x1: x1, y1: y1, r1: r1 });
  },

  createPattern: function(image, repetition) {
    return new Patt(image, repetition);
  },

  // build Linear Color
  _lcolor: function(ary) {
    var rv = [], v, i = 0, iz = ary.length, n = 1 / 255;
    for (; i < iz; ++i) {
      v = ary[i];
      rv.push('<GradientStop Color="#',
                _hex[_float(v.color[1] / n)],
                v.color[0].substring(1),
                '" Offset="', v.offset, '" />');
    }
    return rv.join("");
  },

  // build Radial Color
  _rcolor: function(style) {
    var rv = [],
        fp = style._param, n = 1 / 255,
        r0 = fp.r0 / fp.r1,
        remain = 1 - r0,
        v,
        i = 0,
        iz = style._colorStop.length;
    if (!iz) { return ""; }

    rv.push('<GradientStop Color="#',
              _hex[_float(style._colorStop[0].color[1] / n)],
              style._colorStop[0].color[0].substring(1),
              '" Offset="', 0, '" />');
    for (i = 0; i < iz; ++i) {
      v = style._colorStop[i];
      rv.push('<GradientStop Color="#',
                _hex[_float(v.color[1] / n)],
                v.color[0].substring(1),
                '" Offset="', (v.offset * remain + r0), '" />');
    }
    return rv.join("");
  },

  // build MatrixTransform
  _trns: function(type, m) {
    return [
      '<', type,
      '.RenderTransform><MatrixTransform><MatrixTransform.Matrix><Matrix M11="',
                 m[0], '" M21="', m[3], '" OffsetX="', m[6],
      '" M12="', m[1], '" M22="', m[4], '" OffsetY="', m[7],
      '" /></MatrixTransform.Matrix></MatrixTransform></', type,
      '.RenderTransform>'].join("");
  },

  // build Shadow Blur
  _blur: function(type, shadowColor) {
    var sdepth = 0,
        sx = this[SHADOW_OFFSET_X],
        sy = this[SHADOW_OFFSET_Y];

    if (shadowColor[1]) {
      sdepth = _max(_math.abs(sx), _math.abs(sy)) * 1.2;
      return ['<', type, '.Effect><DropShadowEffect Opacity="', 1.0,
              '" Color="', shadowColor[0],
              '" BlurRadius="', this[SHADOW_BLUR] * 1.2,
              '" Direction="', _math.atan2(-sy, sx) * _deg,
              '" ShadowDepth="', sdepth,
              '" /></', type, '.Effect>'].join("");
    }
    return "";
  }
});

// --- VML ---
function VMLInit(elm) {
  var e = removeFallbackContents(elm);

  applyCanvasSize(e);
  e.getContext = function() { return e._ctx2d; }
  e._ctx2d = new VML2D(e);
  e.bind = function() {
    e.attachEvent("onpropertychange", onPropertyChange);
  };
  e.unbind = function() {
    e.detachEvent("onpropertychange", onPropertyChange);
  };
  e.bind();
  return e;
}

function VML2D(elm) {
  this.canvas = elm;
  elm.uuCanvasType = "VML2D";
  this._initSurface();
  this._elm = elm.appendChild(_doc.createElement("div"));
  this._elm.style.pixelWidth = elm.width;
  this._elm.style.pixelHeight = elm.height;
  this._elm.style.overflow = "hidden";
  this._elm.style.position = "absolute";
  this._elm.uuCanvasDirection = elm.currentStyle.direction;
  this._elm.style.direction = "ltr";
  this._clipRect = this._rect(0, 0, this.canvas.width, this.canvas.height);
};

_mix(VML2D.prototype, _super, {
  _rect: function(x, y, w, h) {
    var c0 = this._map(x, y),
        c1 = this._map(x + w, y),
        c2 = this._map(x + w, y + h),
        c3 = this._map(x, y + h);
    return [" m", c0.x, " ", c0.y,
            " l", c1.x, " ", c1.y,
            " l", c2.x, " ", c2.y,
            " l", c3.x, " ", c3.y,
            " x"].join("");
  },

  _map: function(x, y) {
    var m = this._mtx;
    return { x: _round((x * m[0] + y * m[3] + m[6]) * _zoom - _halfZoom),
             y: _round((x * m[1] + y * m[4] + m[7]) * _zoom - _halfZoom) };
  },

  // === State =============================================
  // === Transformations ===================================
  // === Rects =============================================
  clearRect: function(x, y, w, h) {
    w = _int(w), h = _int(h);
    if ((!x && !y &&
         w == this.canvas.width &&
         h == this.canvas.height)) {
      this._clear();
    } else {
      var zindex = 0, c = _style.getBGColor(this._elm, 1), vml;

      switch (COMPOSITES[this[GLOBAL_COMPO]]) {
      case  4: zindex = --this._zindex; break;
      case 10: this._clear();
      }

      vml =  [VML_SHAPE_STYLE, zindex,
              VML_FILL, VML_COORD, VML_PATH, this._rect(x, y, w, h),
              VML_VFILL, VML_TYPE_HEAD, 'solid',
              VML_COLOR, c[0], VML_OPACITY, c[1] * this[GLOBAL_ALPHA],
              VML_END_SHAPE].join("");
      !this.xFlyweight &&
        this._history.push(this._clipPath ? (vml = this._clippy(vml)) : vml);
      this._elm.insertAdjacentHTML("BeforeEnd", vml);
    }
  },

  _clear: function() {
    this._history = [];
    this._elm.innerHTML = ""; // clear all
    this._zindex = 0;
  },

  fillRect: function(x, y, w, h) {
    var path = this._rect(x, y, w, h);
    this._px = x;
    this._py = y;

    // When all canvases are painted out,
    // the fillStyle(background-color) is preserved.
    if (path === this._clipRect) { // full size path
      if (typeof this[FILL_STYLE] === "string") {
        this.xClipStyle = this[FILL_STYLE]; // keep bgcolor
      }
    }
    this.fill(0, path);
  },

  // === Path API ==========================================
  closePath: function() {
    this._path.push(" x");
  },

  moveTo: function(x, y) {
    var m = this._mtx; // inlining: this._map(x, y)
    this._path.push(
      "m ", _round((x * m[0] + y * m[3] + m[6]) * _zoom - _halfZoom), " ",
            _round((x * m[1] + y * m[4] + m[7]) * _zoom - _halfZoom));
    this._px = x;
    this._py = y;
  },

  lineTo: function(x, y) {
    var m = this._mtx; // inlining: this._map(x, y)
    this._path.push(
      "l ", _round((x * m[0] + y * m[3] + m[6]) * _zoom - _halfZoom), " ",
            _round((x * m[1] + y * m[4] + m[7]) * _zoom - _halfZoom));
    this._px = x;
    this._py = y;
  },

  quadraticCurveTo: function(cpx, cpy, x, y) {
    var cp1x = this._px + 2.0 / 3.0 * (cpx - this._px),
        cp1y = this._py + 2.0 / 3.0 * (cpy - this._py),
        cp2x = cp1x + (x - this._px) / 3.0,
        cp2y = cp1y + (y - this._py) / 3.0,
        c0 = this._map(x, y),
        c1 = this._map(cp1x, cp1y),
        c2 = this._map(cp2x, cp2y);
    this._path.push("c ", c1.x, " ", c1.y, " ",
                          c2.x, " ", c2.y, " ",
                          c0.x, " ", c0.y);
    this._px = x;
    this._py = y;
  },

  bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
    var c0 = this._map(x, y),
        c1 = this._map(cp1x, cp1y),
        c2 = this._map(cp2x, cp2y);
    this._path.push("c ", c1.x, " ", c1.y, " ",
                          c2.x, " ", c2.y, " ",
                          c0.x, " ", c0.y);
    this._px = x;
    this._py = y;
  },

  rect: function(x, y, w, h) {
    this._path.push(this._rect(x, y, w, h));
    this._px = x;
    this._py = y;
  },

  arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
    radius *= _zoom;
    var x1 = x + (_cos(startAngle) * radius) - _halfZoom,
        y1 = y + (_sin(startAngle) * radius) - _halfZoom,
        x2 = x + (_cos(endAngle)   * radius) - _halfZoom,
        y2 = y + (_sin(endAngle)   * radius) - _halfZoom,
        c0, c1, c2, rx, ry;

    if (!anticlockwise) {
      // fix "wa" bug
      (x1.toExponential(5) === x2.toExponential(5)) && (x1 += 0.125);
      (y1.toExponential(5) === y2.toExponential(5)) && (y1 += 0.125);
    }
    c0 = this._map(x, y),
    c1 = this._map(x1, y1),
    c2 = this._map(x2, y2),
    rx = this._scaleX * radius,
    ry = this._scaleY * radius;
    this._path.push(anticlockwise ? "at " : "wa ",
                    c0.x - rx, " ", c0.y - ry, " ",
                    c0.x + rx, " ", c0.y + ry, " ",
                    c1.x, " ", c1.y, " ",
                    c2.x, " ", c2.y);
  },

  fill: function(wire, path) {
    path = path || this._path.join("");

    var rv = [], vml, zindex = 0, mix, c,
        style = wire ? this[STROKE_STYLE] : this[FILL_STYLE],
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _parseColor(this[SHADOW_COLOR]);

    if ( (mix = COMPOSITES[this[GLOBAL_COMPO]]) ) {
      (mix === 4) ? (zindex = --this._zindex) : this._clear();
    }

    if (typeof style === "string") {
      c = _colorCache[style] || _parseColor(style);

      if (sc[1]) {
        sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
        sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
        so = this.xShadowOpacityFrom;
        sd = this.xShadowOpacityDelta;

        for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
          rv.push(VML_SHAPE_STYLE, zindex,
                  ';left:', sx,
                  'px;top:', sy, 'px',
                  wire ? VML_STROKE : VML_FILL,
                  VML_COORD, VML_PATH, path,
                  wire ? VML_VSTROKE : VML_VFILL,
                  VML_COLOR_HEAD, sc[0],
                  VML_OPACITY, so.toFixed(2),
                  wire ? strokeProps(this, 1) : "",
                  VML_END_SHAPE);
        }
      }

      rv.push(VML_SHAPE_STYLE, zindex,
              wire ? VML_STROKE : VML_FILL,
              VML_COORD, VML_PATH, path,
              wire ? VML_VSTROKE : VML_VFILL,
              VML_COLOR_HEAD, c[0],
              VML_OPACITY, c[1] * this[GLOBAL_ALPHA],
              wire ? strokeProps(this, 1) : "",
              VML_END_SHAPE);

      vml = rv.join("");
    } else {
      vml = this[FUNCS[style._type]](style, path, wire, mix, zindex, sc);
    }
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (vml = this._clippy(vml)) : vml);
    this._elm.insertAdjacentHTML("BeforeEnd", vml);
  },

  _lfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [],
        fp = style._param,
        c0 = this._map(fp.x0, fp.y0),
        c1 = this._map(fp.x1, fp.y1),
        angle = _math.atan2(c1.x - c0.x, c1.y - c0.y) * _deg,
        color = this._gcolor(style._colorStop),
        // for shadow
        si = 0, siz = _shadowWidth, so = 0, sd = 0, sx = 0, sy = 0;

    (angle < 0) && (angle += 360);

    if (shadowColor[1]) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;

      if (wire) {
        siz = this[LINE_WIDTH];
        sd = 0.2 / siz; // opacity from 0.05 to 0.25
      }
      for (; si < siz; so += sd, --sx, --sy, ++si) {
        rv.push(VML_SHAPE_STYLE, zindex,
                ';left:', sx, 'px;top:', sy, 'px',
                VML_COORD, wire ? VML_STROKE : VML_FILL,
                VML_PATH, path,
                  // brush
                  wire ? VML_VSTROKE : VML_VFILL,
                  wire ? VML_FILLTYPE_HEAD : VML_TYPE_HEAD,
                  wire ? 'solid' : 'gradient" method="sigma" focus="0%',
                  VML_COLOR, shadowColor[0],
                  VML_OPACITY, so.toFixed(2),
                  VML_ANGLE, angle,
                  wire ? strokeProps(this, 1) : "",
                VML_END_SHAPE);
      }
    }
    rv.push(VML_SHAPE_STYLE, zindex,
            VML_COORD, wire ? VML_STROKE : VML_FILL,
            VML_PATH, path,
              // brush
              wire ? VML_VSTROKE : VML_VFILL,
              wire ? VML_FILLTYPE_HEAD : VML_TYPE_HEAD,
              wire ? 'solid' : 'gradient" method="sigma" focus="0%',
              wire ? VML_COLOR : VML_COLORS,
              wire ? _parseColor(this.xMissColor)[0] : color,
              VML_OPACITY, this[GLOBAL_ALPHA],
              '" o:opacity2="', this[GLOBAL_ALPHA], // fill only
              VML_ANGLE, angle,
              wire ? strokeProps(this, 1) : "",
            VML_END_SHAPE);
    return rv.join("");
  },

  _rfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [], brush, v,
        fp = style._param, fsize, fposX, fposY, focusParam = "",
        color = this._gcolor(style._colorStop),
        zindex2 = 0,
        x = fp.x1 - fp.r1,
        y = fp.y1 - fp.r1,
        r1x = fp.r1 * this._scaleX,
        r1y = fp.r1 * this._scaleY,
        c0 = this._map(x, y),
        // for shadow
        si = 0, siz = _shadowWidth, so = 0, sd = 0, sx = 0, sy = 0;

    // focus
    if (!wire) {
      fsize = (fp.r0 / fp.r1);
      fposX = (1 - fsize + (fp.x0 - fp.x1) / fp.r1) / 2; // forcus position x
      fposY = (1 - fsize + (fp.y0 - fp.y1) / fp.r1) / 2; // forcus position y
    }

    if (shadowColor[1]) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;

      if (wire) {
        siz = this[LINE_WIDTH];
        sd = 0.2 / siz; // opacity from 0.05 to 0.25
      }

      if (wire) {
        focusParam = [VML_VSTROKE, VML_FILLTYPE_HEAD, 'tile',
                      strokeProps(this, 1)].join("");
      } else {
        focusParam = [VML_VFILL, VML_TYPE_HEAD,
                      'gradientradial" method="sigma" focussize="',
                      fsize, ',', fsize,
                      '" focusposition="', fposX, ',', fposY].join("");
      }
      for (; si < siz; so += sd, --sx, --sy, ++si) {
        rv.push('<v:oval', VML_BASE_STYLE, zindex,
                ';left:', _round(c0.x / _zoom) + sx,
                'px;top:', _round(c0.y / _zoom) + sy,
                'px;width:', r1x, 'px;height:', r1y,
                'px', wire ? VML_STROKE : VML_FILL,
                '" coordsize="11000,11000',
                focusParam, VML_OPACITY, so.toFixed(2),
                VML_COLOR, shadowColor[0],
                '" /></v:oval>');
      }
    }

    if (wire) {
      // VML has not stroke gradient
      brush = [VML_VSTROKE, VML_FILLTYPE_HEAD, 'tile', strokeProps(this, 1),
               VML_OPACITY, this[GLOBAL_ALPHA],
               VML_COLOR, _parseColor(this.xMissColor)[0]].join("");
    } else {
      // fill outside
      if (style._colorStop.length) {
        v = style._colorStop[0]; // 0 = outer color
        if (v.color[1] > 0.001) {
          if (mix === 4) { zindex2 = --this._zindex; }
          rv.push(VML_SHAPE_STYLE, zindex2,
                  VML_FILL, VML_COORD, VML_PATH, path,
                  VML_VFILL, VML_TYPE_HEAD, 'solid',
                  VML_COLOR, v.color[0],
                  VML_OPACITY, v.color[1] * this[GLOBAL_ALPHA],
                  VML_END_SHAPE);
        }
      }
      brush = [VML_VFILL, VML_TYPE_HEAD,
               'gradientradial" method="sigma" focussize="',
               fsize , ',', fsize,
               '" focusposition="', fposX, ',', fposY,
               VML_OPACITY, this[GLOBAL_ALPHA],
               '" o:opacity2="', this[GLOBAL_ALPHA],
               VML_COLORS, color].join("");
    }
    rv.push('<v:oval', VML_BASE_STYLE, zindex, // need z-index
            ';left:', _round(c0.x / _zoom),
            'px;top:', _round(c0.y / _zoom),
            'px;width:', r1x, 'px;height:', r1y, 'px',
            wire ? VML_STROKE : VML_FILL,
            '" coordsize="11000,11000', brush,
            '" /></v:oval>');
    return rv.join("");
  },

  _pfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [],
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0;

    if (shadowColor[1]) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = this.xShadowOpacityFrom;
      sd = this.xShadowOpacityDelta;

      for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
        rv.push(VML_SHAPE_STYLE, zindex,
                ';left:', sx, 'px;top:', sy, 'px',
                VML_COORD,
                wire ? VML_STROKE : VML_FILL,
                VML_PATH, path,
                  // brush
                  wire ? VML_VSTROKE: VML_VFILL,
                  wire ? VML_FILLTYPE_HEAD : VML_TYPE_HEAD, 'solid',
                  wire ? strokeProps(this, 1) : "",
                  VML_COLOR, shadowColor[0],
                  VML_OPACITY, so.toFixed(2),
                VML_END_SHAPE);
      }
    }

    rv.push(VML_SHAPE_STYLE, zindex,
            VML_COORD,
            wire ? VML_STROKE : VML_FILL,
            VML_PATH, path,
              // brush
              wire ? VML_VSTROKE : VML_VFILL,
              wire ? VML_FILLTYPE_HEAD : VML_TYPE_HEAD, 'tile',
              VML_OPACITY, this[GLOBAL_ALPHA],
              '" src="', style._src,
              wire ? strokeProps(this, 1) : "",
            VML_END_SHAPE);

    return rv.join("");
  },

  clip: function() {
    this._clipPath = this._clipRect + " x " + this._path.join("");
  },

  _clippy: function(vml) {
    if (!this.xClipStyle) {
      var bg = _style.getBGColor(this._elm, 1);
      this.xClipStyle = bg[0];
    }
    return [vml, '<v:shape style="position:absolute;width:10px;height:10px',
            VML_FILL, VML_COORD, VML_PATH, this._clipPath,
            VML_VFILL, VML_TYPE_HEAD, 'solid', VML_COLOR, this.xClipStyle,
            VML_END_SHAPE].join("");
  },

  // === Text ==============================================
  fillText: function(text, x, y, maxWidth, wire) {
    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");
    var style = wire ? this[STROKE_STYLE] : this[FILL_STYLE],
        types = (typeof style === "string") ? 0 : style._type,
        rv = [], vml, align = this[TEXT_ALIGN], dir = "ltr", c,
        font = parseFont(this[FONT], this.canvas),
        m = this._mtx, zindex = 0,
        fp, c0, c1, // for grad
        skew = [m[0].toFixed(3) + ',' + m[3].toFixed(3) + ',' +
                m[1].toFixed(3) + ',' + m[4].toFixed(3) + ',0,0'].join(""),
        skewOffset,
        delta = 1000, left = 0, right = delta,
        offset = { x: 0, y: 0 },
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _parseColor(this[SHADOW_COLOR]);

    switch (COMPOSITES[this[GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: this._clear();
    }

    switch (align) {
    case "end": dir = "rtl"; // break;
    case "start":
      align = this._elm.uuCanvasDirection === dir ? "left" : "right"
    }
    switch (align) {
    case "center": left = right = delta / 2; break;
    case "right": left = delta, right = 0.05;
    }
    if (this[TEXT_BASELINE] === "top") {
      // text margin-top fine tuning
      offset.y = font.size /
          (FONT_SCALES[font.rawfamily.split(",")[0].toUpperCase()] ||
           this.xTextMarginTop);
    }
    skewOffset = this._map(x + offset.x, y + offset.y);

    if (sc[1] && !this.xShadowBlur) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = _max(this.xShadowOpacityFrom + 0.9, 1);
      sd = this.xShadowOpacityDelta;

      for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
        rv.push('<v:line',
                VML_BASE_STYLE, zindex, ';width:1px;height:1px;left:', sx,
                'px;top:', sy, 'px',
                VML_FILL, '" from="', -left, ' 0" to="', right,
                ' 0.05" coordsize="100 100">',
                '<v:fill color="', sc[0],
                '" opacity="', so.toFixed(2), '" />',
                '<v:skew on="t" matrix="', skew ,'" ',
                ' offset="', _round(skewOffset.x / _zoom), ',',
                             _round(skewOffset.y / _zoom),
                '" origin="', left ,' 0" />',
                '<v:path textpathok="t" />',
                '<v:textpath on="t" string="', toHTMLEntity(text),
                '" style="v-text-align:', align,
                ';font:', toHTMLEntity(font.formal),
                '" /></v:line>');
      }
    }

    rv.push('<v:line',
            VML_BASE_STYLE, zindex, ';width:1px;height:1px',
            VML_FILL, '" from="', -left, ' 0" to="', right,
            ' 0.05" coordsize="100 100">');

    switch (types) {
    case 0:
      c = _colorCache[style] || _parseColor(style);
      rv.push('<v:fill color="', c[0],
              '" opacity="', c[1] * this[GLOBAL_ALPHA], '" />');
      break;
    case 1:
    case 2:
      fp = style._param;
      c0 = this._map(fp.x0, fp.y0);
      c1 = this._map(fp.x1, fp.y1);
      rv.push('<v:fill type="gradient" method="sigma" focus="0%',
              VML_COLORS, this._gcolor(style._colorStop),
              VML_OPACITY, this[GLOBAL_ALPHA],
              '" o:opacity2="', this[GLOBAL_ALPHA],
              VML_ANGLE,
              _math.atan2(c1.x - c0.x, c1.y - c0.y) * _deg,
              '" />');
      break;
    case 3:
      rv.push('<v:fill position="0,0" type="tile" src="',
              style._src, '" />');
      break;
    }
    rv.push('<v:skew on="t" matrix="', skew ,'" ',
            ' offset="', _round(skewOffset.x / _zoom), ',',
                         _round(skewOffset.y / _zoom),
            '" origin="', left ,' 0" />',
            '<v:path textpathok="t" />',
            '<v:textpath on="t" string="', toHTMLEntity(text),
            '" style="v-text-align:', align,
            ';font:', toHTMLEntity(font.formal),
            '" /></v:line>');
    vml = rv.join("");
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (vml = this._clippy(vml)) : vml);
    this._elm.insertAdjacentHTML("BeforeEnd", vml);
  },
  // drawing images
  // drawImage(image, dx, dy)
  // drawImage(image, dx, dy, dw, dh)
  // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  drawImage: function(image) {
    var info = detectDrawImageArg.apply(this, arguments),
        method = info.az === 3 ? "image" : "scale",
        dx = info.dx,
        dy = info.dy,
        dw = info.dw,
        dh = info.dh,
        sx = info.sx,
        sy = info.sy,
        sw = info.sw,
        sh = info.sh,
        iw = info.dim.w,
        ih = info.dim.h,
        rv = [], vml, m,
        frag = [], sfrag, tfrag, // code fragment
        i = 0, iz, me = this, c0, zindex = 0,
        ieMode8 = _doc.documentMode >= 8,
        prefix = ieMode8 ? "-ms-filter:'" : "filter:", // filter prefix
        postfix = ieMode8 ? "'" : "",
        sizeTrans, // 0: none size transform, 1: size transform
        // for shadow
        si = 0, so = 0, sd = 0, shx = 0, shy = 0, shw = _shadowWidth,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _parseColor(this[SHADOW_COLOR]);

    function trans(m, x, y, w, h) {
      var c1 = me._map(x, y),
          c2 = me._map(x + w, y),
          c3 = me._map(x + w, y + h),
          c4 = me._map(x, y + h);
      return [";padding:0 ",
              _round(_max(c1.x, c2.x, c3.x, c4.x) / _zoom), "px ",
              _round(_max(c1.y, c2.y, c3.y, c4.y) / _zoom), "px 0;",
              prefix, DX_PFX, ".Matrix(M11=", m[0], ",M12=", m[3],
                ",M21=", m[1], ",M22=", m[4],
                ",Dx=", _round(c1.x / _zoom),
                ",Dy=", _round(c1.y / _zoom), ")", postfix].join("");
    }

    switch (COMPOSITES[this[GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: this._clear();
    }

    if ("src" in image) { // image is HTMLImageElement
      c0 = this._map(dx, dy);

      if (this.xImageRender) {
        rv.push(
          '<v:image', VML_BASE_STYLE, zindex,
          ';width:',    dw,
          'px;height:', dh,
          'px;left:', _round(c0.x / _zoom),
          'px;top:',  _round(c0.y / _zoom),
          'px" coordsize="100,100',
          '" src="', image.src,
          '" cropleft="',   sx / iw,
          '" croptop="',    sy / ih,
          '" cropright="',  (iw - sx - sw) / iw,
          '" cropbottom="', (ih - sy - sh) / ih,
          '" />');
      } else {
        sizeTrans = (sx || sy); // 0: none size transform, 1: size transform
        tfrag = this._efx ? trans(this._mtx, dx, dy, dw, dh) : '';

        frag = [
          // shadow only
          [ '<div', VML_BASE_STYLE, zindex - 10,
              ';left:$1px;top:$2px', tfrag, '">'].join(""),
          [ '<div style="position:relative;overflow:hidden;width:',
              _round(dw), 'px;height:', _round(dh), 'px">'].join(""),
          !sizeTrans ? "" : [
            '<div style="width:', _ceil(dw + sx * dw / sw),
              'px;height:', _ceil(dh + sy * dh / sh),
              'px;',
              prefix, DX_PFX,
              '.Matrix(Dx=', (-sx * dw / sw).toFixed(3),
                     ',Dy=', (-sy * dh / sh).toFixed(3), ')',
              postfix, '">'].join(""),
          [ '<div style="width:', _round(iw * dw / sw),
              'px;height:', _round(ih * dh / sh),
              'px;'].join(""),
          // shadow only
          [ 'background-color:', sc[0], ';',
            prefix, DX_PFX, '.Alpha(opacity=$3)', postfix].join(""),
          // alphaloader
          [ prefix, DX_PFX, '.AlphaImageLoader(src=',
            image.src, ',SizingMethod=',
            method, ')', postfix].join(""),
          [ '"></div>',
              sizeTrans ? '</div>' : '', '</div></div>'].join("")
        ];

        if (sc[1]) {
          shx = shw / 2 + this[SHADOW_OFFSET_X];
          shy = shw / 2 + this[SHADOW_OFFSET_Y];
          so = this.xShadowOpacityFrom;
          sd = this.xShadowOpacityDelta;

          sfrag = [frag[0], frag[1], frag[2], frag[3],
                   frag[4], frag[6]].join("");
          for (; si < shw; so += sd, --shx, --shy, ++si) {
            rv.push(
              sfrag.replace(/\$1/, this._efx ? shx : _round(c0.x / _zoom) + shx)
                   .replace(/\$2/, this._efx ? shy : _round(c0.y / _zoom) + shy)
                   .replace(/\$3/, (so * 100).toFixed(2)));
          }
        }

        rv.push('<div', VML_BASE_STYLE, zindex);
        if (this._efx) {
          rv.push(tfrag, '">');
        } else { // 1:1 scale
          rv.push(';top:', _round(c0.y / _zoom),
                  'px;left:', _round(c0.x / _zoom), 'px">')
        }
        rv.push(frag[1], frag[2], frag[3], frag[5], frag[6]);
      }
      vml = rv.join("");
    } else {
      c0 = this._map(dx, dy);
      switch (info.az) {
      case 3: // 1:1 scale
              rv.push('<div', VML_BASE_STYLE, zindex,
                      ';left:', _round(c0.x / _zoom),
                      'px;top:', _round(c0.y / _zoom), 'px">')
              iz = image._ctx2d._history.length;

              for (; i < iz; ++i) {
                rv.push(image._ctx2d._history[i]);
              }
              rv.push('</div>');
              break;
      case 5:
              m = _matrix.multiply(_matrix.scale(dw / iw, dh / ih), this._mtx);
              rv.push('<div', VML_BASE_STYLE, zindex,
                      trans(m, dx, dy, dw, dh),
                      '"><div style="width:',  _round(iw * dw / sw),
                                 'px;height:', _round(ih * dh / sh), 'px">');
              iz = image._ctx2d._history.length;

              for (; i < iz; ++i) {
                rv.push(image._ctx2d._history[i]);
              }
              rv.push('</div></div>');
              break;
      case 9: // buggy(not impl)
              m = _matrix.multiply(_matrix.scale(dw / sw, dh / sh), this._mtx);
  //          m = _matrix.multiply(_matrix.translate(dx, dy), m);
              rv.push('<div', VML_BASE_STYLE, zindex,
                      ';overflow:hidden',
                      trans(m, dx, dy, dw, dh), '">');

              iz = image._ctx2d._history.length;

              for (; i < iz; ++i) {
                rv.push(image._ctx2d._history[i]);
              }
              rv.push('</div>');
              break;
      }
      vml = rv.join("");
/*
      // effect CSS::opacity and filter::opacity
      vml = vml.replace(/opacity=\"([\d\.]+)\"/g, function(m, opa) {
        return 'opacity="' + (opa * me[GLOBAL_ALPHA]).toFixed(3) + '"';
      }).replace(/opacity=([\d\.]+)/g, function(m, opa) {
        return 'opacity=' + (opa * me[GLOBAL_ALPHA]).toFixed(3);
      });
 */
    }
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (vml = this._clippy(vml)) : vml);
    this._elm.insertAdjacentHTML("BeforeEnd", vml);
  },

  // === Pixel manipulation ================================
  // === Gradient ==========================================
  createLinearGradient: function(x0, y0, x1, y1) {
    return new Grad(1, // 1:gradient
                    { x0: x0, y0: y0, x1: x1, y1: y1 }, 1);
  },

  createRadialGradient: function(x0, y0, r0, x1, y1, r1) {
    return new Grad(2, // 2:gradientradial
                    { x0: x0, y0: y0, r0: r0, x1: x1, y1: y1, r1: r1 }, 1);
  },

  createPattern: function(image, repetition) {
    return new Patt(image, repetition);
  },

  // build Gradation Color
  _gcolor: function(ary) {
    var rv = [], i = 0, iz = ary.length;
    for (; i < iz; ++i) {
      rv.push(ary[i].offset + " " + ary[i].color[0]);
    }
    return rv.join(",");
  }
});

// === Extend Test, Shadow API =============================
if (CANVAS_RENDERING_CONTEXT_2D in _win) { // include Safari4
  _crc2d = _win[CANVAS_RENDERING_CONTEXT_2D].prototype;
}

if (_crc2d &&
    ((_gecko  && _egver <= 1.9) || // Firefox2-3
     (_opera  && _uaver <= 10))) { // Opera9.2-10
                                   // exclude Chrome1, Safari3.x
  // wrapper
  _crc2d._save = _crc2d.save;
  _crc2d._restore = _crc2d.restore;
  _crc2d._clearRect = _crc2d.clearRect;

  _mix(_crc2d, {
    _shadow:      [TRANSPARENT, 0, 0, 0],
    _stack:       [],
    font:         "10px sans-serif", // for Firefox3
    textAlign:    "start",
    textBaseline: "top",    // spec: "alphabetic"
    xMissColor:           "#000",
    xTextMarginTop:       1.3,
    xAutoTextRender:      1, // 1 = auto;
    xShadowOpacityFrom:   0.01, // for Silverlight, VML
    xShadowOpacityDelta:  0.05, // for Silverlight, VML

    save: function() {
      this._stack.push([this[FONT],
                        this[TEXT_ALIGN],
                        this[TEXT_BASELINE],
                        _mix([], this._shadow)]);
      this._save();
    },
    restore: function() {
      this._restore();
      if (this._stack.length) { // for Opera9.5+, Firefox2, Firefox3
        var last = this._stack.pop();
        this[FONT] = last[0];
        this[TEXT_ALIGN] = last[1];
        this[TEXT_BASELINE] = last[2];
        this._shadow = last[3];
      }
    },
    clearRect: function(x, y, w, h) {
      var fn = clearRectDOM;
      if (this.xAutoTextRender) {
        if (_gecko && _egver === 1.9) {
          fn = clearRectMoz;
        } else if (_opera && _uaver >= 9.5 && _uaver <= 10) {
          fn = clearRectSVG;
        }
      }
      fn(this, x, y, w, h);
    },
    fillText: function(text, x, y, maxWidth, wire) {
      var fn = fillTextDOM;
      if (this.xAutoTextRender) {
        if (_gecko && _egver === 1.9) {
          fn = fillTextMoz;
        } else if (_opera && _uaver >= 9.5 && _uaver <= 10) {
          fn = fillTextSVG;
        }
      }
      fn(this, text, x, y, maxWidth, wire);
    },
    strokeText: function(text, x, y, maxWidth) {
      this.fillText(text, x, y, maxWidth, 1);
    },
    measureText: function(text) {
      var metric = getTextMetric(text, this[FONT]);
      return new TextMetrics(metric.w, metric.h);
    }
  });

  // Extend Shadow Accesser
  if (_gecko && _egver <= 1.9) { // Firefox2-3
    _crc2d.__defineSetter__(SHADOWS[0], function(c) { this._shadow[0] = c; });
    _crc2d.__defineSetter__(SHADOWS[1], function(x) { this._shadow[1] = x; });
    _crc2d.__defineSetter__(SHADOWS[2], function(y) { this._shadow[2] = y; });
    _crc2d.__defineSetter__(SHADOWS[3], function(b) { this._shadow[3] = b; });
    _crc2d.__defineGetter__(SHADOWS[0], function() { return this._shadow[0]; });
    _crc2d.__defineGetter__(SHADOWS[1], function() { return this._shadow[1]; });
    _crc2d.__defineGetter__(SHADOWS[2], function() { return this._shadow[2]; });
    _crc2d.__defineGetter__(SHADOWS[3], function() { return this._shadow[3]; });
  }
}

if (_crc2d &&
    (_chrome && _uaver === 2)) { // Chrome3 strokeText() implemented

  _crc2d.strokeText = function(text, x, y, maxWidth) {
    this.save();
    this[FILL_STYLE] = this[STROKE_STYLE];
    this.fillText(text, x, y, maxWidth);
    this.restore();
  }
}

function clearTextView(me) {
  var i = 1, iz = me.canvas._canvasTextView.length;
  for (; i < iz; ++i) {
    me.canvas._canvasTextView[i].textContent = "";
  }
}

function clearRectMoz(me, x, y, w, h) {
  me._clearRect(x, y, w, h);
}

function clearRectDOM(me, x, y, w, h) {
  if (me.canvas._canvasTextView &&
      !x && !y && w == me.canvas.width && h == me.canvas.height) {
    clearTextView(me);
  }
  me._clearRect(x, y, w, h);
}

function clearRectSVG(me, x, y, w, h) {
  me._clearRect(x, y, w, h);
}

function fillTextMoz(me, text, x, y, maxWidth, wire) {
  var align = me[TEXT_ALIGN], dir = "ltr",
      metric = getTextMetric(text, me[FONT]),
      offX = 0, offY = 0,
      // for shadow
      si = 0, so = 0, sd = 0,
      sc = _colorCache[me._shadow[0]] ||
           _parseColor(me._shadow[0]);

  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = _runstyle(me.canvas, "").direction === dir ? "left" : "right"
  }
  if (align === "center") {
    offX = metric.w / 2;
  } else if (align === "right") {
    offX = metric.w;
  }
  offY = (metric.h + metric.h / 2) / 2; // emulate textBaseline="top"

  me.save();
  me[GLOBAL_COMPO] = "source-over";
  me.mozTextStyle = me.font;
  me.translate(x - offX, y + offY);
  if (wire) {
    me[FILL_STYLE] = me[STROKE_STYLE];
  }

  if (sc[1]) {
    so = _max(me.xShadowOpacityFrom + 0.9, 1);
    sd = me.xShadowOpacityDelta;

    me.save();
    me.translate(_shadowWidth / 2 + me._shadow[1],
                 _shadowWidth / 2 + me._shadow[2]);
    for (; si < _shadowWidth; so += sd, ++si) {
      me.translate(-1, -1);
      me[GLOBAL_ALPHA] = so.toFixed(2);
      me[FILL_STYLE] = sc[0];
      me.mozDrawText(text);
    }
    me.restore();
  }

  me.mozDrawText(text);
  // http://d.hatena.ne.jp/uupaa/20090506/1241572019
  me.fillRect(0,0,0,0); // force redraw(Firefox3.0 bug)
  me.restore();
}

function fillTextDOM(me, text, x, y, maxWidth, wire) {
  var canvas = me.canvas, // HTMLCanvasElement
      view, layer, sc, name,
      offX = 0, metric, align = me[TEXT_ALIGN], dir = "ltr";

  if (canvas._canvasLayerView) {
    view = canvas._canvasLayerView._view;
    canvas._canvasTextView = [view];
  } else if (!canvas._canvasTextView) {
//  view = canvas.parentNode.appendChild(_doc.createElement("div"));
    view = _doc.body.appendChild(_doc.createElement("div"));
    view.style.position = "absolute";
    view.style.overflow = "hidden";
    canvas._canvasTextView = [view];

    // reposition
    function repos(attr) {
      function getPos(elm) {
        var x = 0, y = 0, r;
        if (elm.getBoundingClientRect) {
          r = elm.getBoundingClientRect();
          x = r.left + pageXOffset;
          y = r.top  + pageYOffset;
        } else {
          while (elm) {
            x += elm.offsetLeft || 0;
            y += elm.offsetTop  || 0;
            elm = elm.offsetParent;
          }
        }
        return { x: x, y: y };
      }

      try {
        var rect, style = _runstyle(me.canvas, "");
        if (attr & 1) {
          rect = getPos(me.canvas);
        } else {
          rect = { x: _int(style.left), y: _int(style.top) };
        }
        _mix(me.canvas._canvasTextView[0].style, {
//        zIndex: (_int(style.zIndex) || 0) + 1, // Fx2"auto" -> 1
          height: _int(canvas.height) + "px",
          width: _int(canvas.width) + "px",
          left: rect.x + "px",
          top: rect.y + "px",
          visibility: style.visibility,
          display: style.display,
          opacity: _float(style.opacity)
        });
        if (!_gecko) {
          _mix(me.canvas._canvasTextView[0].style, {
            zIndex: (_int(style.zIndex) || 0) + 1
          });
        }
      } catch (err) {}
    }
    function onAttr(evt) {
      var attr = HIT_PROPS2[evt.attrName] || 0;
      if (attr) {
        (attr & 1) && clearTextView(me); // clear
        repos(attr);
      }
    }
    repos(3);
    canvas.addEventListener("DOMAttrModified", onAttr, false);
    setInterval(function() { repos(3); }, 1000); // delay 1sec
  } else {
    view = canvas._canvasTextView[0];
  }
  // Firefox2: shadowColor is always null
  if (_gecko) {
    sc = _colorCache[me._shadow[0]] ||
         _parseColor(me._shadow[0]);
  } else {
    sc = _colorCache[me[SHADOW_COLOR]] ||
         _parseColor(me[SHADOW_COLOR]);
  }

  metric = getTextMetric(text, me[FONT]);
  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = _runstyle(me.canvas, "").direction === dir ? "left" : "right"
  }
  if (align === "center") {
    offX = metric.w / 2;
  } else if (align === "right") {
    offX = metric.w;
  }

  layer = view.appendChild(_doc.createElement("div"));
  _mix(layer.style, {
    font: me[FONT],
    position: "absolute",
    opacity: me[GLOBAL_ALPHA],
    height: _int(metric.h * 1.2) + "px",
    width: _int(metric.w * 1.2) + "px", // avoid word wrap
    left: (x - offX) + "px",
    top: y + "px"
  });

  if (sc[1]) {
    layer.style.textShadow = [me[SHADOWS[1]] + "px",
                              me[SHADOWS[2]] + "px",
                              me[SHADOWS[3]] + "px",
                              me[SHADOWS[0]]].join(" ");
  }
  name = wire ? STROKE_STYLE : FILL_STYLE;
  if (typeof me[name] === "string") {
    layer.style.color = me[name];
  }
  layer.textContent = text;
  canvas._canvasTextView.push(layer);
}

function fillTextSVG(me, text, x, y, maxWidth, wire) {
  text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

  function svge(name) {
    return _doc.createElementNS("http://www.w3.org/2000/svg", name);
  }
  function attr(elm, hash) {
    for (var i in hash) {
      elm.setAttribute(i, hash[i]);
    }
  }
  function filter(svg, sx, sy, sb, sc) {
    var e = [];
    svg.appendChild(e[0] = svge("defs"));
      e[0].appendChild(e[1] = svge("filter"));
        e[1].appendChild(e[2] = svge("feGaussianBlur"));
        e[1].appendChild(e[3] = svge("feOffset"));
        e[1].appendChild(e[4] = svge("feFlood"));
        e[1].appendChild(e[5] = svge("feComposite"));
        e[1].appendChild(e[6] = svge("feMerge"));
          e[6].appendChild(e[7] = svge("feMergeNode"));
          e[6].appendChild(e[8] = svge("feMergeNode"));
    attr(e[1], {
      id:             "dropshadow",
      filterUnits:    "userSpaceOnUse"
    });
    attr(e[2], {
      "in":           "SourceAlpha",
      stdDeviation:   (sb < 8) ? sb / 2 : _math.sqrt(sb * 2)
    });
    attr(e[3], {
      dx:             sx,
      dy:             sy,
      result:         "offsetblur"
    });
    attr(e[4], {
      "flood-color":   sc[0],
      "flood-opacity": sc[1]
    });
    attr(e[5], {
      in2:            "offsetblur",
      operator:       "in"
    });
    attr(e[8], {
      "in":           "SourceGraphic"
    });
  }

  var style = wire ? me[STROKE_STYLE] : me[FILL_STYLE],
      types = (typeof style === "string") ? 0 : style._type,
      align = me[TEXT_ALIGN],
      dir = _runstyle(me.canvas, "").direction === "ltr",
      font = parseFont(me[FONT], me.canvas),
      metric = getTextMetric(text, me[FONT]),
      svg = svge("svg"),
      txt = svge("text"),
      sc = _colorCache[me[SHADOW_COLOR]] ||
           _parseColor(me[SHADOW_COLOR]),
      offset = { x: 0, y: 0 },
      margin = 100,
      validFontFamily;

  switch (align) {
  case "left":   align = "start"; break;
  case "center": align = "middle"; break;
  case "right":  align = "end"; break;
  case "start":  align = dir ? "start" : "end"; break;
  case "end":    align = dir ? "end"   : "start";
  }
  switch (align) {
  case "middle": offset.x = metric.w / 2; break;
  case "end":    offset.x = metric.w;
  }
  if (me[TEXT_BASELINE] === "top") {
    // text margin-top fine tuning
    offset.y = font.size /
        (FONT_SCALES[font.rawfamily.split(",")[0].toUpperCase()] ||
         me.xTextMarginTop);
  }
  attr(svg, {
    width:  metric.w + margin,
    height: metric.h + margin
  });
  if (sc[1]) {
    filter(svg, me[SHADOW_OFFSET_X], me[SHADOW_OFFSET_Y],
           me[SHADOW_BLUR], sc);
    attr(txt, {
      filter: "url(#dropshadow)"
    });
  }
  attr(txt, {
    x:              0 + margin / 2 + offset.x,
    y:              offset.y + offset.y / 2.4 + margin / 2,
    fill:           types ? me.xMissColor : style,
    "text-anchor":  align,
    "font-style":   font.style,
    "font-variant": font.variant,
    "font-size":    font.size + "px",
    "font-weight":  font.weight,
    "font-family":  font.family
  });
  validFontFamily = txt.getAttribute("font-family");
  if (!validFontFamily.replace(/[\"\']/g, "")) {
    return; // Opera9.5, Opera9.6 buggy
  }
  svg.appendChild(txt);
  txt.appendChild(_doc.createTextNode(text));

  _doc.body.appendChild(svg);
  me.save();
  me[GLOBAL_COMPO] = "source-over";
  try {
    me.drawImage(svg, x - margin / 2 - offset.x, y - margin / 2);
  } catch(err) {} // Opera9.2x
  me.restore();
  _doc.body.removeChild(svg);
}

// --- initialize ---
function initCanvas() {
  var lc = /loaded|complete/, rs = "readyState", fn,
      fnready ="onreadystatechange";

  if (!_ie) {
    if (_doc.getElementsByTagName("canvas").length) { // window.loaded state
      ++_canvasReady;
    } else if (_opera) {
      addEventListener("load", function() {
        ++_canvasReady;
      }, false);
    } else if (_webkit && _doc[rs]) {
      fn = function() {
        lc.test(_doc[rs]) ? ++_canvasReady : setTimeout(fn, 0);
      };
      fn();
    } else if (_gecko) {
      _doc.addEventListener("DOMContentLoaded", function() {
        ++_canvasReady;
      }, false);
    } else {
      ++_canvasReady;
    }
    return;
  }
  // --- IE part ---
  function initIE() {
    var v, node = _doc.getElementsByTagName("canvas"), i = node.length;
    while (i--) {
      v = node[i];
      _canvas.init(node[i],
          (!_slver || (" " + v.className + " ").indexOf(" vml ") >= 0));
    }
    ++_canvasReady;
  }

  if (lc.test(_doc[rs])) { // DOM already
    initIE();
  } else {
    fn = function() {
      lc.test(_doc[rs]) && (initIE(), _doc.detachEvent(fnready, fn));
    };
    _doc.attachEvent(fnready, fn);
  }
};

// --- export ---
_win.uuCanvas = _canvas; // window.uuCanvas
_canvas.SL2D = SL2D;
_canvas.VML2D = VML2D;
if (_ie) {
  _doc.createElement("canvas"); // dummy
  _win.CanvasRenderingContext2D = function() {};
  _win.CanvasGradient = Grad;
  _win.CanvasPattern = Patt;
}
initCanvas();

})(); // uuCanvas scope

// === uuColor ===
// depend: uuMeta
/*
type RGBAHash = { r,g,b,a }
type RGBAValidHash = { r,g,b,a,valid }
type HexColorString = "#ffffff"
type RGBAColorString = "rgba(0,0,0,0)"
type W3CNamedColorString = "pink", "skyblue"

uuColor.parse(color, toRGBA = 0, valid = 0)
                         - return ["#ffffff", alpha, valid] or RGBAValidHash
uuColor.refHash - return Hash( { black: {}, gray: {}, ... } )
uuColor.hex(rgba) - return HexColorString("#ffffff")
uuColor.rgba(rgba) - return RGBAColorString("rgba(0,0,0,0)")
uuColor.arrange(rgba, h = 0, s = 0, v = 0) - return RGBAHash
uuColor.comple(rgba) - return RGBAHash
uuColor.gray(rgba) - return RGBAHash
uuColor.sepia(rgba) - return RGBAHash
uuColor.hex2rgba(hex) - return RGBAHash
uuColor.rgba2hsva(rgba) - return HSVAHash
uuColor.hsva2rgba(hsva) - return RGBAHash
uuColor.rgba2hsla(rgba) - return HSLAHash
uuColor.hsla2rgba(hsla) - return RGBAHash
 */
(function() {
var _color, // inner namespace
    _mm = uuMeta,
    _float = parseFloat,
    _math = Math,
    _round = _math.round,
    _hex = _mm.hex,
    _hash = { transparent: { hex: "#000000", num: 0,
                             r: 0, g: 0, b: 0, a: 0, valid: 1 } },
    PARSE_HEX = /^#(([\da-f])([\da-f])([\da-f])([\da-f]{3})?)$/,
    PARSE_PERCENT = /[\d\.]+%/g,
    PARSE_RGBA = /(rgba?)\((\d+),(\d+),(\d+)(?:,([\d\.]+))?\)/;

_color = {
  // uuColor.parse - parse color
  parse: function(
      color,    // @parem RGBAColorString
                //        /HexColorString
                //        /W3CNamedColorString:
      toRGBA) { // @param Boolean(= false): true = return RGBAValidHash
                //                          false = return Array
                // @return Array/RGBAValidHash:
                //          [ HexColorString, Number(alpha), valid ]
                //          { r, g, b, a, valid }
    var rv = _hash[color], m, n;

    !rv && (color = color.toLowerCase().replace(/\s+/g, ""),
            rv = _hash[color]);
    if (rv) {
      return toRGBA ? rv
                    : [rv.hex, rv.a, rv.valid];
    }
    if ( (m = PARSE_HEX.exec(color)) ) {
      rv = m[5] ? m[1]
                : [m[2], m[2], m[3], m[3], m[4], m[4]].join("");
      if (toRGBA) {
        n = parseInt(rv, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255,
                 a: 1, valid: 1 };
      }
      return ["#" + rv, 1, 1];
    }
    m = PARSE_RGBA.exec(color);
    if (!m) {
      m = PARSE_RGBA.exec(color.replace(PARSE_PERCENT, function(n) {
        return _math.min((_float(n) || 0) * 2.55, 255) | 0
      }));
    }
    if (m) {
      return toRGBA ? { r: m[2] | 0, g: m[3] | 0, b: m[4] | 0,
                        a: m[1] === "rgb" ? 1 : _float(m[5]), valid: 1 }
                    : [["#", _hex[m[2]], _hex[m[3]], _hex[m[4]]].join(""),
                       m[1] === "rgb" ? 1 : _float(m[5]), 1];
    }
    return toRGBA ? { r: 0, g: 0, b: 0, a: 0, valid: 0 }
                  : ["#000000", 0, 0];
  },

  // uuColor.refHash - return color hash table
  refHash: function() {
    return _hash;
  },

  // uuColor.hex - return Hex Color String( "#ffffff" )
  hex: function(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                        // @return HexColorString( "#ffffff" )
    return ["#", _hex[rgba.r], _hex[rgba.g], _hex[rgba.b]].join("");
  },

  // uuColor.rgba - return RGBA Color String( "rgba(0,0,0,0)" )
  rgba: function(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                         // @return RGBAColorString( "rgba(0,0,0,0)" )
    return "rgba(" + [rgba.r, rgba.g, rgba.b, rgba.a].join(",") + ")";
  },

  // uuColor.arrange - arrangemented color(Hue, Saturation and Value)
  //    Hue is absolure value,
  //    Saturation and Value is relative value.
  arrange: function(rgba, // @param RGBAHash: Hash( { r,g,b,a })
                    h,    // @param Number(=0): Hue (from -360 to 360)
                    s,    // @param Number(=0): Saturation (from -100 to 100)
                    v) {  // @param Number(=0): Value (from -100 to 100)
                          // @return RGBAHash:
    var rv = _color.rgba2hsva(rgba), r = 360;
    rv.h += h, rv.h = (rv.h > r) ? rv.h - r : (rv.h < 0) ? rv.h + r : rv.h;
    rv.s += s, rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;
    rv.v += v, rv.v = (rv.v > 100) ? 100 : (rv.v < 0) ? 0 : rv.v;
    return _color.hsva2rgba(rv);
  },

  // uuColor.comple - complementary color
  comple: function(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                           // @return RGBAHash:
    return { r: rgba.r ^ 255, g: rgba.g ^ 255, b: rgba.b ^ 255, a: rgba.a };
  },

  // uuColor.gray - gray color (G channel method)
  gray: function(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                         // @return RGBAHash:
    return { r: rgba.g, g: rgba.g, b: rgba.g, a: rgba.a };
  },

  // uuColor.sepia - sepia color
  sepia: function(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                          // @return RGBAHash:
    var r = rgba.r, g = rgba.g, b = rgba.b,
        y = 0.2990 * r + 0.5870 * g + 0.1140 * b, u = -0.091, v = 0.056;

    r = y + 1.4026 * v;
    g = y - 0.3444 * u - 0.7114 * v;
    b = y + 1.7330 * u;
    r *= 1.2;
    b *= 0.8;
    return { r: r < 0 ? 0 : r > 255 ? 255 : r | 0,
             g: g < 0 ? 0 : g > 255 ? 255 : g | 0,
             b: b < 0 ? 0 : b > 255 ? 255 : b | 0, a: rgba.a };
  },

  // uuColor.hex2rgba - convert "#ffffff" to RGBAHash
  hex2rgba: function(hex) { // @param HexColorString: String( "#ffffff" )
                            // @return RGBAHash: Hash( { r,g,b,a } )
    var n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff, a: 1 };
  },

  // uuColor.rgba2hsva
  rgba2hsva: function(rgba) { // @param RGBAHash:
                              // @return HSVAHash:
    var r = rgba.r / 255, g = rgba.g / 255, b = rgba.b / 255,
        max = _math.max(r, g, b), diff = max - _math.min(r, g, b),
        h = 0, s = max ? _round(diff / max * 100) : 0, v = _round(max * 100);
    if (!s) {
      return { h: 0, s: 0, v: v, a: rgba.a };
    }
    h = (r === max) ? ((g - b) * 60 / diff) :
        (g === max) ? ((b - r) * 60 / diff + 120)
                    : ((r - g) * 60 / diff + 240);
    // HSVAHash( { h:360, s:100, v:100, a:1.0 } )
    return { h: (h < 0) ? h + 360 : h, s: s, v: v, a: rgba.a };
  },

  // uuColor.hsva2rgba
  hsva2rgba: function(hsva) { // @param HSVAHash:
                              // @return RGBAHash:
    var h = (hsva.h >= 360) ? 0 : hsva.h,
        s = hsva.s / 100,
        v = hsva.v / 100,
        a = hsva.a,
        h60 = h / 60, matrix = h60 | 0, f = h60 - matrix,
        v255, p, q, t, w;
    if (!s) {
      h = _round(v * 255);
      return { r: h, g: h, b: h, a: a };
    }
    v255 = v * 255,
    p = _round((1 - s) * v255),
    q = _round((1 - (s * f)) * v255),
    t = _round((1 - (s * (1 - f))) * v255),
    w = _round(v255);
    switch (matrix) {
      case 0: return { r: w, g: t, b: p, a: a };
      case 1: return { r: q, g: w, b: p, a: a };
      case 2: return { r: p, g: w, b: t, a: a };
      case 3: return { r: p, g: q, b: w, a: a };
      case 4: return { r: t, g: p, b: w, a: a };
      case 5: return { r: w, g: p, b: q, a: a };
    }
    return { r: 0, g: 0, b: 0, a: a };
  },

  // uuColor.rgba2hsla
  rgba2hsla: function(rgba) { // @param RGBAHash:
                              // @return HSLAHash:
    var r = rgba.r / 255,
        g = rgba.g / 255,
        b = rgba.b / 255,
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        diff = max - min,
        h = 0, s = 0, l = (min + max) / 2;

    if (l > 0 && l < 1) {
      s = diff / (l < 0.5 ? l * 2 : 2 - (l * 2));
    }
    if (diff > 0) {
      if (max === r && max !== g) {
        h += (g - b) / diff;
      } else if (max === g && max !== b) {
        h += (b - r) / diff + 2;
      } else if (max === b && max !== r) {
        h += (r - g) / diff + 4;
      }
      h *= 60;
    }
    return { h: h, s: _round(s * 100), l: _round(l * 100), a: rgba.a };
  },

  // uuColor.hsla2rgba - ( h: 0-360, s: 0-100, l: 0-100, a: alpha )
  hsla2rgba: function(hsla) { // @param HSLAHash:
                              // @return RGBAHash:
    var h = (hsla.h === 360) ? 0 : hsla.h,
        s = hsla.s / 100,
        l = hsla.l / 100,
        r, g, b, s1, s2, l1, l2;

    if (h < 120) {
      r = (120 - h) / 60, g = h / 60, b = 0;
    } else if (h < 240) {
      r = 0, g = (240 - h) / 60, b = (h - 120) / 60;
    } else {
      r = (h - 240) / 60, g = 0, b = (360 - h) / 60;
    }
    s1 = 1 - s;
    s2 = s * 2;

    r = s2 * (r > 1 ? 1 : r) + s1;
    g = s2 * (g > 1 ? 1 : g) + s1;
    b = s2 * (b > 1 ? 1 : b) + s1;

    if (l < 0.5) {
      r *= l, g *= l, b *= l;
    } else {
      l1 = 1 - l;
      l2 = l * 2 - 1;
      r = l1 * r + l2;
      g = l1 * g + l2;
      b = l1 * b + l2;
    }
    return { r: _round(r * 255), g: _round(g * 255),
             b: _round(b * 255), a: hsla.a };
  }
};

// --- initialize ---
function init() {
  var key, val, num, v, i = 0, item = (
// FAMICOM(R) Named Color(from "FC00" to "FC3F")
"7b7b7bfc00,0000fffc01,0000bdfc02,4229bdfc03,940084fc04,ad0021fc05,8c1000fc06,"+
"8c1000fc07,522900fc08,007300fc09,006b00fc0a,005a00fc0b,004252fc0c,000000fc0d,"+
"000000fc0e,000000fc0f,bdbdbdfc10,0073f7fc11,0052f7fc12,6b42fffc13,de00cefc14,"+
"e7005afc15,f73100fc16,e75a10fc17,ad7b00fc18,00ad00fc19,00ad00fc1a,00ad42fc1b,"+
"008c8cfc1c,000000fc1d,000000fc1e,000000fc1f,f7f7f7fc20,39bdfffc20,6b84fffc22,"+
"9473f7fc23,f773f7fc24,f75294fc25,f77352fc26,ffa542fc27,f7b500fc28,b5f710fc29,"+
"5ade52fc2a,52f794fc2b,00efdefc2c,737373fc2d,000000fc2e,000000fc2f,fffffffc30,"+
"a5e7fffc31,b5b5f7fc32,d6b5f7fc33,f7b5f7fc34,ffa5c6fc35,efceadfc36,ffe7adfc37,"+
"ffde7bfc38,d6f773fc39,b5f7b5fc3a,b5f7d6fc3b,00fffffc3c,f7d6f7fc3d,000000fc3e,"+
"000000fc3f,"+
// W3C Named Color
"000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,"+
"ffff00yellow,00ff00lime,00ffffaqua,00ffffcyan,0000ffblue,ff00fffuchsia,"+
"ff00ffmagenta,880000maroon,888800olive,008800green,008888teal,000088navy,"+
"880088purple,696969dimgray,808080gray,a9a9a9darkgray,c0c0c0silver,"+
"d3d3d3lightgrey,dcdcdcgainsboro,f5f5f5whitesmoke,fffafasnow,708090slategray,"+
"778899lightslategray,b0c4delightsteelblue,4682b4steelblue,5f9ea0cadetblue,"+
"4b0082indigo,483d8bdarkslateblue,6a5acdslateblue,7b68eemediumslateblue,"+
"9370dbmediumpurple,f8f8ffghostwhite,00008bdarkblue,0000cdmediumblue,"+
"4169e1royalblue,1e90ffdodgerblue,6495edcornflowerblue,87cefalightskyblue,"+
"add8e6lightblue,f0f8ffaliceblue,191970midnightblue,00bfffdeepskyblue,"+
"87ceebskyblue,b0e0e6powderblue,2f4f4fdarkslategray,00ced1darkturquoise,"+
"afeeeepaleturquoise,f0ffffazure,008b8bdarkcyan,20b2aalightseagreen,"+
"48d1ccmediumturquoise,40e0d0turquoise,7fffd4aquamarine,e0fffflightcyan,"+
"00fa9amediumspringgreen,7cfc00lawngreen,00ff7fspringgreen,7fff00chartreuse,"+
"adff2fgreenyellow,2e8b57seagreen,3cb371mediumseagreen,66cdaamediumaquamarine,"+
"98fb98palegreen,f5fffamintcream,006400darkgreen,228b22forestgreen,"+
"32cd32limegreen,90ee90lightgreen,f0fff0honeydew,556b2fdarkolivegreen,"+
"6b8e23olivedrab,9acd32yellowgreen,8fbc8fdarkseagreen,9400d3darkviolet,"+
"8a2be2blueviolet,dda0ddplum,d8bfd8thistle,8b008bdarkmagenta,9932ccdarkorchid,"+
"ba55d3mediumorchid,da70d6orchid,ee82eeviolet,e6e6falavender,"+
"c71585mediumvioletred,bc8f8frosybrown,ff69b4hotpink,ffc0cbpink,"+
"ffe4e1mistyrose,ff1493deeppink,db7093palevioletred,e9967adarksalmon,"+
"ffb6c1lightpink,fff0f5lavenderblush,cd5c5cindianred,f08080lightcoral,"+
"f4a460sandybrown,fff5eeseashell,dc143ccrimson,ff6347tomato,ff7f50coral,"+
"fa8072salmon,ffa07alightsalmon,ffdab9peachpuff,ffffe0lightyellow,"+
"b22222firebrick,ff4500orangered,ff8c00darkorange,ffa500orange,"+
"ffd700gold,fafad2lightgoldenrodyellow,8b0000darkred,a52a2abrown,"+
"a0522dsienna,b8860bdarkgoldenrod,daa520goldenrod,deb887burlywood,f0e68ckhaki,"+
"fffacdlemonchiffon,d2691echocolate,cd853fperu,bdb76bdarkkhaki,bdb76btan,"+
"eee8aapalegoldenrod,f5f5dcbeige,ffdeadnavajowhite,ffe4b5moccasin,"+
"ffe4c4bisque,ffebcdblanchedalmond,ffefd5papayawhip,fff8dccornsilk,"+
"f5deb3wheat,faebd7antiquewhite,faf0e6linen,fdf5e6oldlace,fffaf0floralwhite,"+
"fffff0ivory").split(",");

  while ( (v = item[i++]) ) {
    key = v.slice(6);
    val = v.slice(0, 6);
    num = parseInt(val, 16);
    _hash[key] = { hex: "#" + val,
                   num: num,
                   r: (num >> 16) & 255,
                   g: (num >> 8) & 255,
                   b: num & 255,
                   a: 1,
                   valid: 1 };
  }
}
init();

// --- export ---
window.uuColor = _color; // window.uuColor

})(); // uuColor scope


// === uuLayer ===
// depend: uuMeta, uuCanvas, uuStyle, uuStyle.opacity, uuImage
/*

--- layer functions ---
new uuLayer(view, width = "auto", height = "auto")
uuLayer.getLayerInstance(elm) - return LayerObject or null

--- view operations ---
uuLayer.view
uuLayer.resizeView(width, height)
uuLayer.getViewInfo() - return { clid, cctx, front, rear,
                                 zmax, zmin, zorder, length }

--- layer operations ---
uuLayer.createLayer(id, type, hide = 0, back = 0,
                    width = void 0, height = void 0) - return new layer element
uuLayer.appendLayer(id, node, hide = 0) - return node
uuLayer.removeLayer(id) - return this
uuLayer.resizeLayer(id, width, height) - return this
uuLayer.refLayer(id) - return layer element
uuLayer.bringLayer(id, tgt) - return this
uuLayer.moveLayer(id = "", x, y, diff = false) - return this
uuLayer.showLayer(id = "") - return this
uuLayer.hideLayer(id = "") - return this
uuLayer.getLayerOpacity(id) - return 0.0 ~ 1.0
uuLayer.setLayerOpacity(id = "", opacity = 1.0, diff = false) - return this

  --- canvas 2D context operations ---
  uuLayer.getContext(id = "") - return canvas context or undefined
  uuLayer.push(id) - return this
  uuLayer.pop() - return this

    --- canvas 2D context style operations ---
    uuLayer.alphas(globalAlpha) - return this
    uuLayer.fills(fillStyle) - return this
    uuLayer.wires(strokeStyle, lineWidth = undef) - return this
    uuLayer.fonts(font) - return this
    uuLayer.lines(lineWidth) - return this
    uuLayer.shadows(color = undef,
                    x = undef, y = undef, blur = undef) - return this
    uuLayer.sets(propHash) - return this
    uuLayer.gets(propHash) - return { prop: value, ... }

    --- canvas 2D context drawing operations ---
    uuLayer.clear(x = 0, y = 0,
                  w = canvas.width, h = canvas.height) - return this
    uuLayer.save() - return this
    uuLayer.restore() - return this
    uuLayer.scale(x, y) - return this
    uuLayer.translate(x, y) - return this
    uuLayer.rotate(90 or "90deg" or "1.2rad") - return this
    uuLayer.transform(m11, m12, m21, m22, dx, dy) - return this
    uuLayer.begin(x = undef, y = undef) - return this
    uuLayer.move(x, y) - return this
    uuLayer.line(x, y) - return this
    uuLayer.curve(a0, a1, a2, a3,
                  a4 = undef, a5 = undef) - return this
    uuLayer.clip() - return this
    uuLayer.arc(x, y, r, a0 = "0deg",
                         a1 = "360deg", clock = 1) - return this
    uuLayer.draw(wire = 0) - return this
    uuLayer.close() - return this
    uuLayer.text(text, x = 0, y = 0,
                 wire = 0, maxWidth = undef) - return this
    uuLayer.measureText(text) - return { width, height }
    uuLayer.poly([point, ...], wire = 0) - return this
    uuLayer.box(x, y, w, h, r = 0, wire = 0) - return this
    uuLayer.boxpath(x, y, w, h, r = 0) - return this
    uuLayer.metabo(x, y, w, h, r = 0,
                   bulge = 10, wire = 0) - return this
    uuLayer.circle(x, y, w, h, r, wire = 0) - return this
    uuLayer.dots(x, y, w, h, {palette},
                 [data, ...], index = 0) - return this
    uuLayer.linearGrad(x1, y1,
                       x2, y2, [offset, ...],
                               [color, ...]) - return CanvasGradient
    uuLayer.radialGrad(x1, y1, r1,
                       x2, y2, r2, [offset, ...],
                                   [color, ...]) - return CanvasGradient
    uuLayer.pattern(image, pattern = "repeat") - return CanvasPattern
    uuLayer.image(image, arg1, arg2, arg3, arg4,
                         arg5, arg6, arg7, arg8) - return this

    --- canvas 2D context convenient operations ---

    uuLayer.fitImage(image) - return this
    uuLayer.grid(size = 10, unit = 5,
                 color = "skyblue", color2 = "steelblue") - return this
    uuLayer.angleGlossy(x, y, preset, extend) - return this
    uuLayer.metaboGlossy(x, y, preset, extend) - return this
    uuLayer.jellyBean(x, y, preset, extend) - return this
 */
(function() {
var _layer, // inner namespace
    _mm = uuMeta,
    _style = uuStyle,
    _image = uuImage,
    _doc = document,
    _ie = _mm.ie,
    _opera = _mm.opera,
    _int = parseInt,
    _float = parseFloat,
    _math = Math,
    _rad = _math.PI / 180, // Math.toRadians
//  _deg = 180 / _math.PI, // Math.toDegrees
    _runstyle = _mm.runstyle,
    _mix = _mm.mix,
    _instance = {}; // { uid: layer }

_layer =
    function(view,     // @param Node: layer container
             width,    // @param Number: view width
                       //        /CSSString(= "auto"): 300 "300px" "auto"
             height) { // @param Number: view height
                       //        /CSSString(= "auto"): 150 "150px" "auto"
  var uid = _mm.uid(view),
      vs = _ie ? view[_runstyle]
               : _runstyle(view, ""),
      w = (width  === void 0 || width  === "auto") ? "auto"
                                                   : _int(width) + "px",
      h = (height === void 0 || height === "auto") ? "auto"
                                                   : _int(height) + "px";

  if (uid in _instance) {
    return _instance[uid]; // already
  }

  // uuLayer.view - public property
  this.view = view;

  this._layer = {}; // Hash( { id: elm, ctx, chain } )
  // for canvas context
  this._stack = [];    // context stack
  this._cctx = void 0; // current canvas context
  this._clid = void 0; // current canvas context layer id

  _mix(view.style, {
    width: w,
    height: h,
    zIndex: _int(vs.zIndex) || 0,
    overflow: "hidden"
  });
  if (vs.position === "static") {
    view.style.position = "relative";
  }

  _instance[uid] = this;
};

// --- layer functions ---

// uuLayer.getLayerInstance
_layer.getLayerInstance = function(elm) { // @param Node:
                                          // @return LayerObject/null:
  var uid = _mm.uid(elm);
  if (uid in _instance) {
    return _instance[uid];
  }
  return null;
};


_layer.prototype = {

// --- view operations ---

  // uuLayer.resizeView - resize view
  resizeView: function(width,    // @param CSSPixelUnitString: "300px"
                       height) { // @param CSSPixelUnitString: "150px"
    this.view.style.width  = width;
    this.view.style.height = height;
  },

  // uuLayer.getViewInfo - get view state
  getViewInfo: function() { // @return Hash: { clid, cctx, front, rear,
                            //                 zmax, zmin, zorder, length }
    var hash = this._layer, v, i, j = 0,
        front, rear, max = 0, min = 0, order = [];

    for (i in hash) {
      ++j;
      v = _int(hash[i].elm.style.zIndex);
      (!front || max <= v) && (max = v, front = i);
      (!rear  || min >= v) && (min = v, rear = i);
      order[v] = i;
    }
    return { clid:  this._clid,   // current layer id
             cctx:  this._cctx,   // current canvas context
             front: front || "",  // front layer id
             rear:  rear  || "",  // rear layer id
             zmax:  max || 0,     // front layer z-index
             zmin:  min || 0,     // rear layer z-index
             zorder: order,       // order["a", "b", "c"]
             length: j };         // layer.length
  },

// --- layer operations ---

  // uuLayer.createLayer - create child layer
  createLayer:
      function(id,      // @param String: layer id
               type,    // @param String: "canvas", "vmlcanvas",
                        //                "div", "img", etc...
               hide,    // @param Boolean(= false): true = hidden layer
               back,    // @param Boolean(= false): back insertion
               width,   // @param Number(= undefined): canvas,image width
               height) {// @param Number(= undefined): canvas,image height
                        // @return Node: new layer element
    type = type.toLowerCase();

    var elm, es, ctx, v = this.view, viewInfo = this.getViewInfo();

    if (/canvas$/.test(type)) {
      elm = _doc.createElement("canvas");
      elm.width  = (width !== void 0) ? width :
                   (v.style.width === "auto") ? v.offsetWidth :
                   _int(v.style.width);
      elm.height = (height !== void 0) ? height :
                   (v.style.height === "auto") ? v.offsetHeight :
                   _int(v.style.height);
      elm = uuCanvas.init(elm, type === "vmlcanvas");
      if (_ie) {
        if (elm.unbind) {
          elm.unbind();
        }
      }
      es = elm.style;

      back ? v.insertBefore(elm, v.firstChild)
           : v.appendChild(elm);

      ctx = elm.getContext("2d");
      ctx.textBaseline = "top"; // force
      // set current context
      this._clid = id;
      this._cctx = ctx;
    } else {
      elm = _doc.createElement(type);
      es = elm.style;

      back ? v.insertBefore(elm, v.firstChild)
           : v.appendChild(elm);

      if (type !== "img") {
        es.width  = v.style.width;
        es.height = v.style.height;
      } else {
        (width  !== void 0) && (elm.width  = width);
        (height !== void 0) && (elm.height = height);
      }
    }
    es.zIndex = back ? (viewInfo.zmin - 1) : (viewInfo.zmax + 1);
    es.display = hide ? "none": "";
    es.position = "absolute";
    es.top = "0";
    es.left = "0";

    this._layer[id] = { elm: elm, ctx: ctx, chain: [] };
    return elm;
  },

  // uuLayer.appendLayer - add node
  appendLayer:
      function(id,      // @param String: layer id
               node,    // @param Node:
               hide) {  // @param Boolean(= false): true = hidden layer
                        // @return Node:
    var elm = node, type = elm.tagName.toLowerCase(), ctx;

    if (type === "canvas") {
      ctx = elm.getContext("2d");
      ctx.textBaseline = "top"; // force
      // set current context
      this._clid = id;
      this._cctx = ctx;
    }
    elm.style.zIndex = this.getViewInfo().length;

    this._layer[id] = { elm: elm, ctx: ctx, chain: [] };
    return elm;
  },

  // uuLayer.removeLayer - remove child layer
  removeLayer: function(id) { // @param String: layer id
                              // @return this:
    if (id in this._layer) {
      var v = this._layer[id], i = 0, iz = v.chain.length;
      for (; i < iz; ++i) {
        v.chain[i].elm.parentNode.removeChild(v.chain[i].elm);
        delete this._layer[v.chain[i]];
      }
      v.elm.parentNode.removeChild(v.elm);
      v.elm = void 0;
      delete this._layer[id];

      // reset context stack
      this._stack = [];
      this._clid = void 0;
      this._cctx = void 0;
    }
    return this;
  },

  // uuLayer.resizeLayer - resize child layer
  resizeLayer: function(id,       // @param String: layer id
                        width,    // @param Number: pixel width
                        height) { // @param Number: pixel height
                                  // @return this:
    var node = this._layer[id].elm;

    switch (node.tagName.toLowerCase()) {
    case "canvas":
    case "img":
      _ie && node.bind && node.bind();
      node.width  = width;
      node.height = height;
      _ie && node.unbind && node.unbind();
      break;
    default:
      node.style.width  = width  + "px";
      node.style.height = height + "px";
    }
    return this;
  },

  // uuLayer.refLayer - refer child layer
  refLayer: function(id) { // @param String: layer id
                           // @return Node: layer element
    return this._layer[id].elm;
  },

  // uuLayer.bringLayer - lift child layer
  //    bringLayer("a") is bring to front
  //    bringLayer("a", "b") is bring to layer("b")
  bringLayer: function(id,    // @param String: move layer id
                       tgt) { // @param String(= ""): target layer id
                              // @return this:
    var ly = this._layer, z, i,
        p1 = _int(ly[id].elm.style.zIndex),
        p2 = _int(ly[tgt || this.getViewInfo().front].elm.style.zIndex);

    if (p1 < p2) {
      for (i in ly) {
        z = _int(ly[i].elm.style.zIndex);
        if (z > p1 && z <= p2) {
          ly[i].elm.style.zIndex = z - 1;
        }
      }
      ly[id].elm.style.zIndex = p2;
    } else if (p1 === p2) {
      ly[id].elm.style.zIndex = p1 + 1;
    }
    return this;
  },

  _chains: function(id) {
    var rv = {}, v, i = 0, iz;

    rv[id] = v = this._layer[id];
    for (iz = v.chain.length; i < iz; ++i) {
      rv[v.chain[i]] = this._layer[v.chain[i]];
    }
    return rv;
  },

  // uuLayer.moveLayer - set absolute/relative child layer position
  //    moveLayer("", 100, 100) is move all layers to pos(100px, 100px)
  //    moveLayer("a", 100, 100, 1) is move layer("a") to pos(+100px, +100px)
  moveLayer:
      function(id,     // @param String(= ""): layer id
               x,      // @param Number: style.left value(unit px)
               y,      // @param Number: style.top value(unit px)
               diff) { // @param Boolean(= false): difference,
                       //           false = x and y is absolute value
                       //           true = x and y is relative value
                       // @return this:
    x = _int(x), y = _int(y), diff = diff || 0;

    var hash = id ? this._chains(id) : this._layer, v, i,
        doPixel = _ie || _opera;

    for (i in hash) {
      v = hash[i].elm.style;
      if (doPixel) {
        v.pixelLeft = (diff ? v.pixelLeft : 0) + x;
        v.pixelTop  = (diff ? v.pixelTop  : 0) + y;
      } else {
        v.left = (diff ? _int(v.left) : 0) + x + "px";
        v.top  = (diff ? _int(v.top)  : 0) + y + "px";
      }
    }
    return this;
  },

  // uuLayer.showLayer - show child layer
  //    showLayer() is show all layers
  //    showLayer("a") is show layer("a")
  showLayer: function(id) { // @param String(= ""): layer id
                            // @return this:
    return this._showLayer(id, 0);
  },

  // uuLayer.hideLayer - hide child layer
  //    hideLayer() is hide all layers
  //    hideLayer("a") is hide layer("a")
  hideLayer: function(id) { // @param String(= ""): layer id
                            // @return this:
    return this._showLayer(id, 1);
  },

  _showLayer: function(id, hide) {
    var hash = id ? this._chains(id) : this._layer, i;

    for (i in hash) {
      hash[i].elm.style.display = hide ? "none" : "block";
    }
    return this;
  },

  // uuLayer.getLayerOpacity - get child layer opacity value(from 0.0 to 1.0)
  getLayerOpacity:
      function(id) { // @param String: layer id
                     // @return Number: float value(min: 0.0, max: 1.0)
    return _style.getOpacity(this._layer[id].elm);
  },

  // uuLayer.setLayerOpacity - set child layer opacity value(from 0.0 to 1.0)
  //    setLayerOpacity("", 0.1, 1) is set all layers opacity(+0.1)
  //    setLayerOpacity("a", 0.5) is set layer("a") opacity(0.5)
  setLayerOpacity:
      function(id,      // @param String(= ""): layer id
               opacity, // @param Number(= 1.0): float value(0.0 to 1.0)
               diff) {  // @param Boolean(= false):
                        // @return this:
    opacity = (opacity === void 0) ? 1 : opacity;
    diff = diff || 0;

    var hash = id ? this._chains(id) : this._layer, i;

    for (i in hash) {
      _style.setOpacity(hash[i].elm, opacity, diff);
    }
    return this;
  },

// --- canvas 2D context operations ---

  // uuLayer.getContext - get canvas context
  getContext: function(id) { // @param String(= ""): layer id
                             //                      "" is current context
                             // @return CanvasRenderingContext2D/undefined:
    if (id) {
      return (id in this._layer) ? this._layer[id].ctx
                                 : void 0;
    }
    return this._cctx;
  },

  // uuLayer.push - push current context
  push: function(id) { // @param String: layer id
                       // @return this:
    this._clid && this._stack.push(this._clid);
    this._clid = id;
    this._cctx = this._layer[id].ctx;
    return this;
  },

  // uuLayer.pop - pop current context
  pop: function() { // @param String: layer id
                    // @return this:
    if (this._stack.length) {
      this._clid = this._stack.pop();
      this._cctx = this._layer[this._clid].ctx;
    }
    return this;
  },

// --- canvas 2D context style operations ---

  // uuLayer.alphas - set globalAlpha
  //    globalAlpha: from 0.0 to 1.0
  alphas: function(globalAlpha) { // @param Number: globalAlpha
                                  // @return this:
    this._cctx.globalAlpha = globalAlpha;
    return this;
  },

  // uuLayer.fills - set fillStyle
  fills: function(fillStyle) { // @param String/Object: fillStyle
                               // @return this:
    this._cctx.fillStyle = fillStyle;
    return this;
  },

  // uuLayer.wires - set strokeStyle
  wires:
      function(strokeStyle, // @param String/Object: strokeStyle
               lineWidth) { // @param Number(= undefined): lineWidth(from 1.0)
                            // @return this:
    this._cctx.strokeStyle = strokeStyle;
    if (lineWidth !== void 0) {
      this._cctx.lineWidth = lineWidth;
    }
    return this;
  },

  // uuLayer.fonts - set font style
  //    font: CSS font style value. (eg: "10px sans-serif")
  fonts: function(font) { // @param CSSFontString: font
                          // @return this:
    this._cctx.font = font;
    return this;
  },

  // uuLayer.lines - set lineWidth
  lines: function(lineWidth) { // @param Number: lineWidth(from 1.0)
                               // @return this:
    this._cctx.lineWidth = lineWidth;
    return this;
  },

  // uuLayer.setShadow - set shadow styles
  shadows: function(color,  // @param String(= undefined): shadowColor
                    x,      // @param Number(= undefined): shadowOffsetX
                    y,      // @param Number(= undefined): shadowOffsetY
                    blur) { // @param Number(= undefined): shadowBlur
                            // @return this:
    var ctx = this._cctx;
    (color !== void 0) && (ctx.shadowColor   = color);
    (x     !== void 0) && (ctx.shadowOffsetX = x);
    (y     !== void 0) && (ctx.shadowOffsetY = y);
    (blur  !== void 0) && (ctx.shadowBlur    = blur);
    return this;
  },

  // uuLayer.sets - set styles
  sets: function(propHash) { // @param Hash: { prop: value, ... }
                             // @return this:
    var ctx = this._cctx, i;
    for (i in propHash) {
      ctx[i] = propHash[i];
    }
    return this;
  },

  // uuLayer.gets - get styles
  gets: function(propHash) { // @param Hash: { font: "", ... }
                             // @return Hash: { font: "32pt Arial", ... }
    var ctx = this._cctx, i, rv = {};
    for (i in propHash) {
      rv[i] = ctx[i];
    }
    return rv;
  },

// --- canvas 2D context drawing operations ---

  // uuLayer.clear - clear rect
  clear: function(x,   // @param Number(= 0): position x
                  y,   // @param Number(= 0): position y
                  w,   // @param Number(= canvas.width):  width
                  h) { // @param Number(= canvas.height): height
                       // @return this:
    var ctx = this._cctx;
    ctx.clearRect(x || 0, y || 0,
                  w || ctx.canvas.width, h || ctx.canvas.height);
    return this;
  },

  // uuLayer.save
  save: function() { // @return this:
    this._cctx.save();
    return this;
  },

  // uuLayer.restore
  restore: function() { // @return this:
    this._cctx.restore();
    return this;
  },

  // uuLayer.scale - scale
  scale: function(w,   // @param Number: width scale
                  h) { // @param Number: height scale
                       // @return this:
    this._cctx.scale(w, h);
    return this;
  },

  // uuLayer.translate - offset origin
  translate: function(x,   // @param Number: offset x
                      y) { // @param Number: offset y
                           // @return this:
    this._cctx.translate(x, y);
    return this;
  },

  // uuLayer.rotate - rotate
  //    angle: 360 or "360deg" or "1.5rad"
  rotate: function(angle) { // @param Number/String: angle
                            // @return this:
    var ang = (/rad$/.test(angle + "") ? 1 : _rad) * _float(angle);
    this._cctx.rotate(ang);
    return this;
  },

  // uuLayer.transform
  transform: function(m11, m12, m21, m22, dx, dy) {
    this._cctx.transform(m11, m12, m21, m22, dx, dy);
    return this;
  },

  // uuLayer.begin - beginPath + moveTo
  begin: function(x,    // @param Number(= undefined): move x
                  y) {  // @param Number(= undefined): move y
                        // @return this:
    this._cctx.beginPath();
    (x !== void 0 && y !== void 0) && this._cctx.moveTo(x || 0, y || 0);
    return this;
  },

  // uuLayer.move - moveTo
  move: function(x,   // @param Number: move x
                 y) { // @param Number: move y
                      // @return this:
    this._cctx.moveTo(x, y);
    return this;
  },

  // uuLayer.line - lineTo
  line: function(x,   // @param Number: move x
                 y) { // @param Number: move y
                      // @return this:
    this._cctx.lineTo(x, y);
    return this;
  },

  // uuLayer.curve - quadraticCurveTo or bezierCurveTo
  curve: function(a0,   // @param Number:
                  a1,   // @param Number:
                  a2,   // @param Number:
                  a3,   // @param Number:
                  a4,   // @param Number(= undefined):
                  a5) { // @param Number(= undefined):
                        // @return this:
    if (a4 === void 0) {
      // cpx, cpy, x, y
      this._cctx.quadraticCurveTo(a0, a1, a2, a3);
    } else {
      // cp1x, cp1y, cp2x, cp2y, x, y
      this._cctx.bezierCurveTo(a0, a1, a2, a3, a4, a5);
    }
    return this;
  },

  // uuLayer.clip - clip
  clip: function() { // @return this:
    this._cctx.clip();
    return this;
  },

  // uuLayer.arc - arc
  //    a0 and a1: 360 or "360deg" or "0rad"
  arc: function(x,       // @param Number:
                y,       // @param Number:
                r,       // @param Number:
                a0,      // @param Number/String(= "0deg"): angle0
                a1,      // @param Number/String(= "360deg"): angle1
                clock) { // @param Boolean(= true):
                         // @return this:
    a0 = a0 || "0deg";
    a1 = a1 || "360deg";
    var ang0 = (/rad$/.test(a0 + "") ? 1 : _rad) * _float(a0),
        ang1 = (/rad$/.test(a1 + "") ? 1 : _rad) * _float(a1);
    this._cctx.arc(x, y, r, ang0, ang1,
                   (clock === void 0) ? 0 : !clock);
    return this;
  },

  // uuLayer.draw - fill or stroke
  draw: function(wire) { // @param Boolean(= false):
                         // @return this:
    wire ? this._cctx.stroke() : this._cctx.fill();
    return this;
  },

  // uuLayer.close - closePath
  close: function() { // @return this:
    this._cctx.closePath();
    return this;
  },

  // uuLayer.text
  text: function(text,       // @param String:
                 x,          // @param Number(= 0):
                 y,          // @param Number(= 0):
                 wire,       // @param Boolean(= false):
                 maxWidth) { // @param Number(= undefined):
                             // @return this:
    var fn = wire ? "strokeText" : "fillText";
    if (maxWidth === void 0) { // for Firefox3.5 bug
      this._cctx[fn](text, x || 0, y || 0);
    } else {
      this._cctx[fn](text, x || 0, y || 0, maxWidth);
    }
    return this;
  },

  // uuLayer.measureText - get text dimension
  measureText: function(text) { // @param String:
                                // @return TextMetrics: { width, height }
    this._cctx.measureText(text);
  },

  // uuLayer.poly - poly line + fill
  poly: function(point,  // @param PointArray: Array( [x0, y0, x1, y1, ... ] )
                 wire) { // @param Boolean(= false):
                         // @return this:
    var p = point || [0, 0], i, iz = point.length;
    this.close().begin(p[0], p[1]);
    for (i = 2; i < iz; i += 2) {
      this.line(p[i], p[i + 1]);
    }
    this.draw(wire).close();
  },

  // uuLayer.box - add box path, fill inside
  box: function(x,      // @param Number:
                y,      // @param Number:
                w,      // @param Number:
                h,      // @param Number:
                r,      // @param Number(= 0):
                wire) { // @param Boolean(= false):
                        // @return this:
    return this.boxpath(x, y, w, h, r).draw(wire);
  },

  // uuLayer.boxpath - add box path
  boxpath: function(x,   // @param Number:
                    y,   // @param Number:
                    w,   // @param Number:
                    h,   // @param Number:
                    r) { // @param Number(= 0):
                         // @return this:
    if (!r) {
      this._cctx.rect(x, y, w, h);
      return this;
    }
    if (r < 0) {
      r = 0;
    }
    // round corner
    return this.close().begin(x, y + r).line(x, y + h - r).
                curve(x, y + h, x + r, y + h).line(x + w - r, y + h).
                curve(x + w, y + h, x + w, y + h - r).line(x + w, y + r).
                curve(x + w, y, x + w - r, y).line(x + r, y).
                curve(x, y, x, y + r).
                close();
  },

  // uuLayer.metabolic - metabolic box
  metabo: function(x,      // @param Number:
                   y,      // @param Number:
                   w,      // @param Number:
                   h,      // @param Number:
                   r,      // @param Number(= 0):
                   bulge,  // @param Number(= 10):
                   wire) { // @param Boolean(= false):
                           // @return this:
    r = r || 0;
    bulge = (bulge === void 0) ? 10 : bulge;

    if (bulge) {
      return this.close().begin(x, y + r).line(x, y + h - r). // 1
                  curve(x + w * 0.5, y + h + bulge, x + w, y + h - r). // 2,3,4
                  line(x + w, y + r). // 5
                  curve(x + w, y, x + w - r, y).line(x + r, y). // 6,7
                  curve(x, y, x, y + r).draw(wire). // 8
                  close();
    }
    return this.close().begin(x, y + r).line(x, y + h). // 1
                line(x + w, y + h). // 2,3,4
                line(x + w, y + r). // 5
                curve(x + w, y, x + w - r, y).line(x + r, y). // 6,7
                curve(x, y, x, y + r).draw(wire). // 8
                close();
  },

  // uuLayer.circle - circle + fill
  circle: function(x,      // @param Number:
                   y,      // @param Number:
                   w,      // @param Number:
                   h,      // @param Number:
                   r,      // @param Number:
                   wire) { // @param Boolean(= false):
                           // @return this:
    if (w === h) { // circle
      return this.close().begin(x, y).arc(x, y, r).
                  draw(wire).close();
    }
    // ellipse(oval) not impl.
    return this;
  },

  // uuLayer.dots - draw dot with palette
  //    palette: Hash( { paletteNo: "#ffffff" or { r,g,b,a }, ...} )
  //    data: [paletteNo, paletteNo, ...]
  dots: function(x,       // @param Number:
                 y,       // @param Number:
                 w,       // @param Number:
                 h,       // @param Number:
                 palette, // @param Hash: color palette,
                 data,    // @param Array: dot data
                 index) { // @param Number(= 0): start data index
                          // @return this:
    var ctx = this._cctx, i = 0, j = 0, p, v, idx = index || 0;
    for (; j < h; ++j) {
      for (i = 0; i < w; ++i) {
        v = data[idx + i + j * w];
        if (!(v in palette)) {
          continue;
        }
        p = palette[v];
        if (typeof p === "string") {
          ctx.fillStyle = p;
        } else if (p.a) { // skip alpha = 0
          ctx.fillStyle = "rgba(" + [p.r, p.g, p.b, p.a].join(",") + ")";
        }
        ctx.fillRect(x + i, y + j, 1, 1);
      }
    }
    return this;
  },

  // uuLayer.linearGrad - create linear gradient
  linearGrad:
      function(x1,      // @param Number:
               y1,      // @param Number:
               x2,      // @param Number:
               y2,      // @param Number:
               offset,  // @param Array: [offset, ...], offset from 0.0 to 1.0
               color) { // @param Number: [color, ...]
                        // @return CanvasGradient:
    var rv = this._cctx.createLinearGradient(x1, y1, x2, y2),
        i = 0, iz = offset.length;

    for (; i < iz; ++i) {
      rv.addColorStop(offset[i], color[i]);
    }
    return rv; // CanvasGradient object
  },

  // uuLayer.radialGrad - create radial gradient
  radialGrad:
      function(x1,      // @param Number:
               y1,      // @param Number:
               r1,      // @param Number:
               x2,      // @param Number:
               y2,      // @param Number:
               r2,      // @param Number:
               offset,  // @param Array: [offset, ...], offset from 0.0 to 1.0
               color) { // @param Number: [color, ...]
                        // @return CanvasGradient:
    var rv = this._cctx.createRadialGradient(x1, y1, r1, x2, y2, r2),
        i = 0, iz = offset.length;

    for (; i < iz; ++i) {
      rv.addColorStop(offset[i], color[i]);
    }
    return rv; // CanvasGradient object
  },

  // uuLayer.pattern - create pattern
  pattern: function(image,     // @param HTMLImageElement
                               //        /HTMLCanvasElement:
                    pattern) { // @param String(= "repeat"):
                               // @return CanvasPattern:
    return this._cctx.createPattern(image, pattern || "repeat");
  },

  // uuLayer.image - image
  image: function(image,  // @param HTMLImageElement
                          //        /HTMLCanvasElement:
                  arg1,   // @param Number(= undefined):
                  arg2,   // @param Number(= undefined):
                  arg3,   // @param Number(= undefined):
                  arg4,   // @param Number(= undefined):
                  arg5,   // @param Number(= undefined):
                  arg6,   // @param Number(= undefined):
                  arg7,   // @param Number(= undefined):
                  arg8) { // @param Number(= undefined):
                          // @return this:
    switch (arguments.length) {
    case 1: this._cctx.drawImage(image, 0, 0); break;
    case 3: this._cctx.drawImage(image, arg1, arg2); break;
    case 5: this._cctx.drawImage(image, arg1, arg2, arg3, arg4); break;
    case 9: this._cctx.drawImage(image, arg1, arg2, arg3, arg4,
                                        arg5, arg6, arg7, arg8); break;
    default: throw "";
    }
    return this;
  },

// --- canvas 2D context convenient operations ---

  // uuLayer.fitImage - image fitting(auto-scaling)
  fitImage: function(image) { // @param HTMLImageElement: image element
                              // @return this:
    var ctx = this._cctx,
        dim = _image.getActualDimension(image),
        cw = _int(ctx.canvas.width),
        ch = _int(ctx.canvas.height),
        sw = dim.w,
        sh = dim.h,
        dx = (sw <= cw) ? _math.floor((cw - sw) / 2) : 0,
        dy = (sh <= ch) ? _math.floor((ch - sh) / 2) : 0,
        dw = (sw <= cw) ? sw : cw,
        dh = (sh <= ch) ? sh : ch;
    ctx.drawImage(image, 0, 0, sw, sh, dx, dy, dw, dh);
    return this;
  },

  // uuLayer.grid - draw hatch
  grid: function(size,     // @param Number(= 10):
                 unit,     // @param Number(= 5):
                 color,    // @param String(= "skyblue"):
                 color2) { // @param String(= "steelblue"):
                           // @return this:
    size = size || 10, unit = unit || 5;
    color = color || "skyblue", color2 = color2 || "steelblue";
    var x = size, y = size, i = 1, j = 1,
        w = _int(this._cctx.canvas.width),
        h = _int(this._cctx.canvas.height);

    for (; x < w; ++i, x += size) {
      this.wires((i % unit) ? color : color2).
           begin(x, 0).line(x, h).draw(1).close();
    }
    for (; y < h; ++j, y += size) {
      this.wires((j % unit) ? color : color2).
           begin(0, y).line(w, y).draw(1).close();
    }
    return this;
  },

  // uuLayer.angleGlossy
  //    override: Hash ( { gcolor1, gcolor2, overlayAlpha, w, h, r, angle } )
  angleGlossy: function(x,        // @param Number: move x
                        y,        // @param Number: move y
                        preset,   // @param String(= "GBLACK"): preset name
                        extend) { // @param Hash(= undefined): extend style
                                  // @return this:
    preset = (preset || "GBLACK").toUpperCase();
    preset = (preset in this.preset) ? this.preset[preset] : {};
    extend = _mix({ w: 100, h: 100, r: 12, angle: 0 }, preset, extend || {});

    var w = extend.w, h = extend.h, r = extend.r, angle = extend.angle,
        oa = extend.overlayAlpha, b = 3, dist = 0; // bevel size

    if (angle < -45) { angle = -45; }
    if (angle >  45) { angle =  45; }

    this.fills(this.linearGrad(x, y, x, y + h,
                               [0.0, 1.0], [extend.gcolor1, extend.gcolor2])).
         begin().box(x, y, w, h, r).close().
         fills("rgba(255,255,255," + oa + ")");

    switch (angle) {
    case 45:  this.begin(x + b, y + b + r).line(x + b, y + h - b * 2).
                    line(x + w - b * 2, y + b).line(x + b + r, y + b).
                    curve(x, y, x + b, y + b + r).draw().close(); break;
    case -45: this.begin(x - b + w, y + b + r).line(x - b + w, y + h - b * 2).
                    line(x + b * 2, y + b).line(x - b - r + w, y + b).
                    curve(x + w, y, x - b + w, y + b + r).draw().close(); break;
    default:  dist = ((h - b * 2) / 45 * angle) / 2;
              this.begin(x + b, y + b + r).
                    line(x + b, y + (h / 2) - b * 2 + dist).
                    line(x + w - b, y + (h / 2) - b * 2 - dist).
                    line(x + w - b, y + b + r).
                    curve(x + w, y, x + w - r, y + b).line(x + b + r, y + b).
                    curve(x, y, x + b, y + b + r).draw().close();
    }
    return this;
  },

  // uuLayer.metaboGlossy
  metaboGlossy: function(x,        // @param Number: move x
                         y,        // @param Number: move y
                         preset,   // @param String(= "GBLACK"): preset name
                         extend) { // @param Hash(= undefined): extend style
                                   // @return this:
    preset = (preset || "GBLACK").toUpperCase();
    preset = (preset in this.preset) ? this.preset[preset] : {};
    extend = _mix({ w: 100, h: 50, r: 12, bulge: 6 }, preset, extend || {});

    var w = extend.w, h = extend.h, r = extend.r, bulge = extend.bulge,
        oa = extend.overlayAlpha, r2 = r > 4 ? r - 4 : 0, b = 3; // bevel size

    this.fills(this.linearGrad(x, y, x, y + h,
                               [0.0, 1.0], [extend.gcolor1, extend.gcolor2])).
          begin().box(x, y, w, h, r).close().
          fills("rgba(255,255,255," + oa + ")").
          begin().metabo(x + b, y + b, w - b * 2, h * 0.5, r2, bulge).close();
    return this;
  },

  // uuLayer.jellyBean
  jellyBean: function(x,        // @param Number: move x
                      y,        // @param Number: move y
                      preset,   // @param String(= "GBLACK"): preset name
                      extend) { // @param Hash(= undefined): extend style
                                // @return this:
    extend = _mix({ w: 100, h: 30, r: 16, bulge: 6 }, extend || {});
    this.metaboGlossy(x, y, preset, extend);
    return this;
  },

// --- ---
  createReflectionLayer:
      function(id,             // @param String: layer id
               image,          // @param Node: image element
               hide,           // @param Boolean(= false): true = hidden layer
               x,              // @param Number(= 0): x
               y,              // @param Number(= 0): y
               width,          // @param Number(= image width): width
               height,         // @param Number(= image height): height
               mirrorHeight,   // @param Number(= 0.625): mirror height(0 to 1)
               offsetX,        // @param Number(= 0): offset X
               offsetY) {      // @param Number(= 0): offset Y
                               // @return Node: new layer element
    var dim = _image.getActualDimension(image),
        w = width || dim.w,
        h = height || dim.h,
        ox = offsetX || 0,
        oy = offsetY || 0,
        mh = (mirrorHeight === void 0) ? 0.625 : mirrorHeight;

    if (!_ie) {
      return this._addReflection(id, image, hide,
                                 dim, x || 0, y || 0, w, h, mh, ox, oy);
    }
    return this._addReflectionIE(id, image, hide,
                                 dim, x || 0, y || 0, w, h, mh, ox, oy);
  },

  _addReflection: function(id, image, hide, dim, x, y, w, h, mh, ox, oy) {
    var elm = this.createLayer(id, "canvas", hide),
        grad,
        sx = w / dim.w, // scale x
        sy = h / dim.h; // scale y

    elm.width  = w;
    elm.height = h + h * mh;

    this.moveLayer(id, x, y);

    x = 0, y = 0;
    grad = this.linearGrad(x, y + h, x, y + h + h * mh,
                           [mh, 0],
                           ["rgba(255, 255, 255, 1.0)",
                            "rgba(255, 255, 255, 0.3)"]),
    this.clear().
      save().translate(x, y).scale(sx, sy).image(image).restore().
      save().translate(x + ox, y + h * 2 + oy).
             scale(sx, -sy).image(image).restore().
      save().sets({ globalCompositeOperation: "destination-out" }).
             fills(grad).box(x, y + h, w, h * mh).restore();
    return elm;
  },

  _addReflectionIE: function(id, image, hide, dim, x, y, w, h, mh, ox, oy) {
    var DXIMG = "DXImageTransform.Microsoft.",
        BASIC = DXIMG + "BasicImage",
        ALPHA = DXIMG + "Alpha",
        img1 = this.createLayer(id, "img", hide),
        img2 = this.createLayer(id + "_reflection", "img", hide), // mirror
        ns = img2.style, obj;

    _mix(img1, { src: image.src, width: w, height: h });
    _mix(img2, { src: image.src, width: w, height: h });

    _mix(img1.style, { top: x + "px", left: y + "px" });
    _mix(img2.style, { top: (x + h + oy) + "px", left: (y + ox) + "px" });

    (ns.filter.indexOf(BASIC) < 0) && (ns.filter += " progid:" + BASIC);
    (ns.filter.indexOf(ALPHA) < 0) && (ns.filter += " progid:" + ALPHA);

    obj = img2.filters.item(BASIC);
    obj.Mask = 0;
    obj.Xray = 0;
    obj.Invert = 0;
    obj.Mirror = 1;
    obj.Opacity = 1;
    obj.Rotation = 2;
    obj.GrayScale = 0;
    obj.Enabled = 1;

    obj = img2.filters.item(ALPHA);
    obj.Style = 1;
    obj.StartX = 0;
    obj.StartY = 0;
    obj.FinishX = 0;
    obj.FinishY = (1 - mh) * 100;
    obj.Opacity = 70;
    obj.FinishOpacity = 0;
    obj.Enabled = 1;

    this._layer[id].chain.push(id + "_reflection");
    return img1;
  }
};

// --- initialize ---
(function() {
  function make(gcolo1, gcolor2, overlayAlpha) {
    return { gcolor1: gcolo1, gcolor2: gcolor2, overlayAlpha: overlayAlpha };
  }
  _layer.prototype.preset = {
    GBLACK:   make("#000",    "#333",    0.25),
    GGRAY:    make("black",   "silver",  0.38),
    GSLIVER:  make("gray",    "white",   0.38),
    GBLUE:    make("#0000a0", "#0097ff", 0.38),
    GGREEN:   make("#006400", "#00ff00", 0.38),
    GRED:     make("#400000", "#ff0000", 0.38),
    GLEMON:   make("#dfcc00", "#FFE900", 0.38),
    GGOLD:    make("#fffacd", "gold",    0.45), // lemonchiffon
    GPEACH:   make("violet",  "red",     0.38),
    GBLOODORANGE:
              make("orange",  "red",     0.38)
  };
})();

// --- export ---
window.uuLayer = _layer; // window.uuLayer

})(); // uuLayer scope
