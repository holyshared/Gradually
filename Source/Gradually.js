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
  imagedrawer/1.0:
  - ImageDrawer/ImageDrawer
  - ImageDrawer/Grid
  - ImageDrawer/Expand

provides: [Gradually]

...
*/

var Gradually = new Class({

	Implements: [Events, Options],

	options: {
		'drawerType': 'grid',
		'drawMethod': ['left', 'right'],
		'drawerOptions': {
			'height': 55,
			'width': 65,
			'duration': 1000,
			'transition': 'expo:in:out'
		},
		'images': null,
		'zIndex': 9000
	},

	/**
	 * Constructor
	 */
	initialize: function (container, options) {
		this.setOptions(options);
		this.container = container;
		this.canvases = [];
		this.properties = [];
		this.images = [];
		this.drawMethod = 0;
		this.current = 0;
	},

	/**
	 * Gradually Internal Events
	 */
	onPreload: function() {
		var options = this.options;
		var images = options.images;
		var zIndex = images.length + options.zIndex;
		images.each(function(image, key) {
			var canvas = this.getCanvas(image);
			var context = canvas.getContext('2d');
			(Browser.Engine.presto)
			? context.drawImage(image, 0, 0)
			: context.drawImage(image, 0, 0, canvas.getWidth(), canvas.getHeight());
		}.bind(this));

		this.orderToFirst(this.current);
		this.orderToNext(this.current + 1);

		var drawerType = options.drawerType;
		var drawerOptions = options.drawerOptions;
		drawerOptions = $merge(drawerOptions, {
			"onDrawStart": this.onDrawStart.bind(this),
			"onDrawComplete": this.onDrawComplete.bind(this)
		});

		var instance = ImageDrawer.factory(drawerType, drawerOptions);
		this.setDrawer(instance);
		this.fireEvent("preload");
	},

	onDrawStart: function()	{
		this.fireEvent("drawStart");
	},

	onDrawComplete: function(canvas) {
/*		var index = this.canvases.indexOf(canvas);
		this.orderToLast(index);
		this.orderToFirst(this.current);
*/
		this.fireEvent("drawComplete", [canvas]);
	},

	/**
	 * Setter/Getter Methods
	 */
	setDrawer: function(drawer) { this.drawer = drawer; },
	getDrawer: function() { return this.drawer; },

	set: function(index) {
		if (this.current != index) {
			//It cancels if it is drawing.
			if (this.drawer.isDrawing()) {
				this.drawer.cancel();
				this.drawer.fireEvent("drawComplete", [this.drawer.getCanvas()]);
			}
			var image = this.images[index];
			var canvas = this.canvases[index];
			this.orderToLast(this.current);
			this.orderToNext(index);
			this.current = index;
			this.drawer.setCanvas(canvas);
			this.drawer.setImage(image);
			this.draw();
		}
	},

	draw: function() {
		var methodType = this.options.drawMethod;
		if (this.drawMethod >= methodType.length) {
			this.drawMethod = 0;
		}
		var method = methodType[this.drawMethod];
		method = method.capitalize();
		this.drawer['draw' + method]();
		this.drawMethod++;
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
	},

	/**
	 * Private Methods
	 */
	getCanvas: function(image) {
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

	orderToNext: function(index) {
		var zIndex = this.options.zIndex + 2;
		var canvas = this.canvases[index];
		var image = this.images[index];
		canvas.setStyle("zIndex", zIndex);
		var ctx = canvas.getContext('2d');
//		ctx.drawImage(image, 0, 0);



		ctx.clearRect(0, 0, image.width , image.height);
	},

	orderToFirst: function(index) {
		canvas = this.canvases[index];
		canvas.setStyle("zIndex", this.options.zIndex + 2);
	},

	orderToLast: function(index) {
		var zIndex = this.options.zIndex;
		var canvas = this.canvases[index];
		var image = this.images[index];
		canvas.setStyle("zIndex", zIndex);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
	}

});