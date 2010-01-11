/*
---
description: Gradually is an experimental slide show plug-in using the canvas element.
license: MIT-style
authors: Noritaka Horio
requires:
  core/1.2.4:
    - Core/*
    - Native/*
    - Class/*
    - Element/*
    - Utilities/Selecter
    - Utilities/DomReady
    - Fx/Fx
  more/1.2.4.2:
    - Assets
provides: [Gradually]
...
*/

var Gradually = new Class({

	Implements: [Events, Options],

	options: {
		'panelHeight': 55,
		'panelWidth': 65,
		'interval': 3000,
		'duration': 30,
		'zIndex': 9000
/*
		'onStart': $empty,
		'onPreload': $empty,
		'onChange': $empty
*/
	},

	initialize: function (container,sources,options) {
		this.setOptions(options);
		this.container = container;
		this.sources = sources;
		this.canvases = [];
		this.properties = [];
		this.currentIndex = 0;
		this.counter = 0;
		this.addEvent("onImagePreload", this.onImagePreload.bind(this));
		this.preload();
		this.fireEvent("start");
	},

	onImagePreload: function() {
		var zIndex = this.sources.length + this.options.zIndex;
		this.sources.each(function(e,k) {
			var p = e.getProperties("width", "height", "title", "alt", "src");
			var canvas = new Element("canvas", {
				"width": p.width,
				"height": p.height,
				"class": "source",
				"styles": { "zIndex": zIndex-- }
			});
			e.setStyle("display", "none");
			canvas.inject(e.parentNode);
			canvas = (canvas.getContext) ? canvas : Gradually.EPCanvas.init(canvas,this.options);
			this.canvases.push(canvas);
			this.properties.push(p);
			var ctx = canvas.getContext('2d');
			(Browser.Engine.presto) ? ctx.drawImage(e,0,0) : ctx.drawImage(e,0,0,p.width,p.height);

		}.bind(this));

		this.draw.delay(this.options.interval,this);
		this.fireEvent("preload", [this.properties]);
		this.fireEvent("change", [this.properties[this.currentIndex]]);
	},

	onDrawMotion: function(props) {
		var drawHeight = (props.height > 0) ? props.height : 0.01;
		var drawWidth  = (props.width > 0) ? props.width : 0.01;

		this.ctx2d.clearRect(this.x, this.y, this.width, this.height);
		this.ctx2d.drawImage(this.source,
			props.left, props.top,
			drawWidth, drawHeight,
			props.left, props.top,
			drawWidth, drawHeight);
	},

	onDrawProgress: function() {
		this.counter++;
		if (this.counter >= this.total) {
			this.counter = 0;
			this.next();
			this.draw.delay(this.options.interval,this);
			this.fireEvent("change", [this.properties[this.currentIndex]]);
		}
	},

	next: function() {
		this.toFront();
		this.currentIndex = (this.currentIndex < this.canvases.length - 1) ? this.currentIndex + 1 : 0;
		return this.getCurrent();
	},

	getCurrent: function() {
		this.current = {
			"canvas": this.canvases[this.currentIndex],
			"source": this.sources[this.currentIndex]
		};
		return this.current;
	},
	
	preload: function(){
		var preloadImages = [];
		this.sources.each(function(e,k) {
			preloadImages.push(e.getProperty("src"));
			e.setStyle("display", "none");
		});
		var images = new Asset.images(preloadImages, {"onComplete": this.fireEvent.bind(this, "onImagePreload")});
	},

	draw: function() {
		var op		= this.options;
		var current = this.getCurrent();
		var canvas	= current.canvas;
		var source	= current.source;
		var size	= canvas.getSize();

		var ctx		= canvas.getContext('2d');

		var duration = op.duration;

		var cols = size.x / op.panelWidth; 
		var rows = size.y / op.panelHeight;
		this.total = cols * rows;

		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {
				var left = x * op.panelWidth, top = y * op.panelHeight;
				var context = {"ctx2d": ctx, "source": source, "x": left, "y": top, "width": op.panelWidth, "height": op.panelHeight}

				var fx = new Fx.Gradually({
					"transition": "back:out",
					"duration": duration,
					"link": "cancel",
					"fps": 30,
					"onMotion": this.onDrawMotion.bind(context),
					"onComplete": this.onDrawProgress.bind(this)
				});

				fx.start({
					"height": [op.panelHeight,0],
					"width": [op.panelWidth,0],
					"top": [top, top + op.panelHeight/2],
					"left": [left,left + op.panelWidth/2]}
				);
				duration = duration + 70;
			}
		}
	},

	toFront: function() {
		var current = this.getCurrent();
		var canvas	= current.canvas;
		var source	= current.source;

		canvas.setStyle("zIndex", this.options.zIndex);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(source,0,0);

		this.canvases.each(function(e,k) {
			if (k != this.currentIndex) {
				var zIndex = e.getStyle("zIndex").toInt();
				zIndex++;
				e.setStyle("zIndex", zIndex);
			}
		}.bind(this));
	}
	
});



Gradually.EPCanvas = {

	init: function(canvas, options) {
		return this.createCanvas(canvas, options);
	},

	createCanvas: function(canvas, options) {
		var o = options;
		var p = canvas.getProperties("width", "height", "title", "alt", "src", "class");
		var s = canvas.getStyles("zIndex");
		var resemblance = new Element("div", {"class": p["class"], "styles": $merge(s, {"width": p.width, "height": p.height})});
		var container = canvas.parentNode;
		resemblance.inject(container);

		var images = new Array(), cols = p.width / o.panelWidth, rows = p.height / o.panelHeight;
		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {
				var left = x * o.panelWidth, top = y * o.panelHeight;

				var image = new Element("div");
				image.inject(resemblance);

				var props = {
					"class": "x" + x.toString() + "y" + y.toString(),
					"position": "absolute",
					"left": left, "top": top,
					"width": o.panelWidth, "height": o.panelHeight
				};
				image.setStyles(props);
				image._restore = function(props) {
					this.setStyles(props);
				}.bind(image, props)

				images.push(image);
			}
		}
		canvas.dispose();

		canvas = this.create2DContxt(resemblance, images);

		return canvas;
	},

	create2DContxt: function(canvas, images) {

		var context = {};
		context.container	= canvas;
		context.images		= images;
		context.index		= 0;

		context.clearRect = function(x,y,width,height) {
			this.index = (this.images.length - 1 > this.index) ? this.index + 1 : 0;
			this.images[this.index].setStyle("background", "none");
		}

		context.drawImage = function(element,x,y,width,height) {
			var background = "url(" + element.getProperty("src") + ") no-repeat ";

			if (arguments.length > 3) {
				background += " -" + x.toString() + "px -" + y.toString() +  "px";
				this.images[this.index].setStyles({"left": x, "top": y, "width": width, "height": height, "background": background});
			} else {
				//_restore
				this.images.each(function(e,k){
					e._restore();
					var s = e.getStyles("left", "top", "width", "height");
					var p = " -" + s.left.toString() + " -" + s.top.toString();
					e.setStyle("background", background + p);
				});
			}
		}

		canvas.getContext = function(type) {
			return this;
		}.bind(context)

		return canvas;
	}

};



Fx.Gradually = new Class({

	Extends: Fx,

	initialize: function(options){
		this.parent(options);
	},

	prepare: function(property, values){
		values = $splat(values);
		var values1 = values[1];
		if (!$chk(values1)){
			values[1] = values[0];
			values[0] = values[0];
		}
		return {from: values[0], to: values[1]};
	},

	compute: function(from, to, delta) {
		this.value = {};
		for (var p in from) { this.value[p] = this.parent(from[p], to[p], delta); }
		this.fireEvent('motion', this.value);
		return this.value;
	},

	get: function(){
		return this.value || 0;
	},

	start: function(props) {
		if (!this.check(props)) return this;
		var from = {}, to = {};
		for (var p in props) {
			var parsed = this.prepare(p, props[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		return this.parent(from, to);
	}

});