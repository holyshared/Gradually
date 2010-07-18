/*
---
description: Gradually is an experimental slide show plug-in using the canvas element.

license: MIT-style

authors:
- Noritaka Horio

requires:
  core/1.2.4:
  - Core/Core
  - Core/Browser
  - Native/Array
  - Native/Function
  - Native/Number
  - Native/String
  - Native/Hash
  - Native/Event
  - Class/Class
  - Class/Class.Extras
  - Element/Element
  - Element/Element.Event
  - Element/Element.Style
  - Element/Element.Dimensions
  - Utilities/Selecter
  - Utilities/DomReady
  - Fx/Fx
  - Fx/Fx.Transitions
  more/1.2.4.2:
  - Assets

provides: [Gradually]

...
*/


var Gradually = new Class({

	Implements: [Events, Options],

	options: {
		'drawerType': 'grid',
		'drawerOptions': {
			'height': 55,
			'width': 65,
			'duration': 1000,
			'transition': 'expo:in:out'
		},
		'images': null,
		'zIndex': 9000
	},

	initialize: function (container, options) {
		this.setOptions(options);
		this.container = container;
		this.canvases = [];
		this.properties = [];
		this.images = [];
		this.start();
		this.current = 0;
	},

	onPreload: function() {
		var options = this.options;
		var images = options.images;
		var zIndex = images.length + options.zIndex;
		images.each(function(image, key) {
			var canvas = this.factory(image);
			var context = canvas.getContext('2d');
			(Browser.Engine.presto)
			? context.drawImage(image, 0, 0)
			: context.drawImage(image, 0, 0, canvas.getWidth(), canvas.getHeight());
		}.bind(this));

		this.setFirst(this.current);
		this.setNext(this.current + 1);

		var drawerType = options.drawerType;
		var drawerOptions = options.drawerOptions;
		drawerOptions = $merge(drawerOptions, {
			"onDrawStart": this.onDrawStart,
			"onDrawComplete": this.onDrawComplete.bind(this)
		});

		var instance = ImageDrawer.factory(drawerType, drawerOptions);
		this.setDrawer(instance);
	},

	onDrawStart: function() {
	},

	onDrawComplete: function(canvas) {
		var index = this.canvases.indexOf(canvas);
		this.setLast(index);
		this.setFirst(this.current);
	},

	set: function(index) {
		if (this.current != index) {
			var image = this.images[this.current];
			var canvas = this.canvases[this.current];

			this.setNext(index);

			this.current = index;
			this.drawer.setCanvas(canvas);
			this.drawer.setImage(image);
			this.drawer.drawLeft();
		}
	},

	setNext: function(index) {
		var zIndex = this.options.zIndex + this.images.length - 1;
		var canvas = this.canvases[index];
		var image = this.images[index];
		canvas.setStyle("zIndex", zIndex);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
	},

	setFirst: function(index) {
		canvas = this.canvases[index];
		canvas.setStyle("zIndex", this.options.zIndex + this.images.length);
	},

	setLast: function(index) {
		var zIndex = this.options.zIndex;
		var canvas = this.canvases[index];
		var image = this.images[index];
		canvas.setStyle("zIndex", zIndex);
		var ctx = canvas.getContext('2d');
//		ctx.clearRect(0, 0, 9999, 9999);
		ctx.drawImage(image, 0, 0);
	},

	setDrawer: function(drawer) {
		this.drawer = drawer;
	},

	addCanvas: function(image) {
		var zIndex = this.canvases.length + 1;
		var canvas = this.factory(image);
		canvas.setStyle("zIndex", zIndex);
		return canvas;
	},

	factory: function(image) {
		var props = image.getProperties("width", "height", "title", "alt", "src");
		var canvas = new Element("canvas", {
			"width": props.width,
			"height": props.height,
			"class": "source"
		});
		this.canvases.push(canvas);
		this.properties.push(props);
		image.setStyle("display", "none");		
		canvas.inject(image.parentNode);

		return canvas;
	},

	start: function() {
		var images = this.options.images;
		var preloadImages = [];
		images.each(function(e,k) {
			preloadImages.push(e.getProperty("src"));
			e.setStyle("display", "none");
		});
		this.images = new Asset.images(preloadImages, {
			"onComplete": this.onPreload.bind(this)
		});
	}

});






/*


var Gradually = new Class({

	Implements: [Events, Options],

	options: {
		'panelHeight': 55,
		'panelWidth': 65,
		'interval': 3000,
		'duration': 30,
		'zIndex': 9000
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

//		this.draw();
		this.draw.delay(this.options.interval, this);
		this.fireEvent("preload", [this.properties]);
		this.fireEvent("change", [this.properties[this.currentIndex]]);
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
		var options = this.options;
		var current = this.getCurrent();
		var canvas	= current.canvas;
		var source	= current.source;

		var drawer = new Gradually.Drawer.Square(canvas, {
			'source': source,
			'height': options.panelHeight,
			'width': options.panelWidth,
			'duration': options.duration,
			"onChange": function() {
				this.fireEvent("change", [this.properties[this.currentIndex]]);
			}.bind(this)
		});
		drawer.draw();
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

*/