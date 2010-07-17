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

var ImageDrawer = new Class({

	Implements: [Events, Options],

	options: {
		'canvas': null,
		'source': null,
		'duration': 30
	},

	initialize: function(options) {
		this.setOptions(options);
		this.setDefaultValues();
	},

	setDefaultValues: function() {
		var options = this.options;
		this.counter = 0;
		if (options.canvas) { this.setCanvas(options.canvas); }
		if (options.source) { this.setImage(options.source); }
	},

	setCanvas: function(canvas) {
		this.canvas = canvas;
		this.setupDrawer(this.canvas);
	},

	setupDrawer: function(canvas) {
		this.size = canvas.getSize();
		this.cols = this.size.x / this.options.width; 
		this.rows = this.size.y / this.options.height;
		this.total = this.cols * this.rows;
		this.context = canvas.getContext('2d');
	},

	onMotion: function(props) {},

	onProgress: function() {
		this.counter++;
		if (this.counter >= this.total) {
			this.counter = 0;
			this.fireEvent("drawComplete");
		}
	},

	setImage: function(image) {
		this.canvas.store("source", image);
		if ($type(image) == "string") {
			var source = new Image();
			source.src = image;
			this.source = source;
		} else {
			this.source = image;
		}
	},

	getImage: function(image) {
		return this.canvas.retrieve("source");
	},

	draw: function(porps) {
		this.fireEvent("drawStart");
		var duration = this.options.duration;
		porps.each(function(p, k) {
			var fx = new Fx.Gradually({
				"transition": this.options.transition,
				"duration": duration,
				"link": "cancel",
				"fps": 30,
				"onMotion":	this.onMotion.bind(p),
				"onComplete": this.onProgress.bind(this)
			});

			fx.start({
				"height": [this.options.height, 0],
				"width": [this.options.width, 0],
				"top": [p.y, p.y + this.options.height / 2],
				"left": [p.x, p.x + this.options.width / 2]
			});
			duration = duration + 70;
		}, this);
	}

});


ImageDrawer.factory = function(imageDrawer, options) {
	var typeKey = imageDrawer.capitalize();
	if (ImageDrawer[typeKey]) {
		var instance = new ImageDrawer[typeKey](options);
	}
	return instance;
};


/*
ImageDrawer.implement({

	getInstance: function(imageDrawer, options) {
		var typeKey = imageDrawer.capitalize();
		if (ImageDrawer[typeKey]) {
			var instance = new ImageDrawer[typeKey](options);
		}
		return instance;
	}

});
*/

ImageDrawer.Square = new Class({

	Extends: ImageDrawer,

	options: {
		'canvas': null,
		'source': null,
		'height': 50,
		'width': 50,
		'duration': 30
	},

	initialize: function(options) {
		this.parent(options);
	},

	onMotion: function(props) {
		var drawHeight = (props.height > 0) ? props.height : 0.01;
		var drawWidth  = (props.width > 0) ? props.width : 0.01;
		var left = (props.left > 0) ? props.left : 0.01;
		var top = (props.top > 0) ? props.top : 0.01;

		this.context.clearRect(this.x, this.y, this.width, this.height);
		this.context.drawImage(this.source,
			left, top, drawWidth, drawHeight,
			left, top, drawWidth, drawHeight);
	},

	getContext: function(x, y) {
		var options = this.options;
		return {
			"context": this.context,
			"source": this.source,
			"x": x, "y": y,
			"width": options.width,
			"height": options.height
		};		
	},

	drawLeft: function() {
		var contexts = [];
		var options = this.options;
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				var left = x * options.width;
				var top = y * options.height;
				contexts.push(this.getContext(left, top));
			}
		}
		this.draw(contexts);
	},

	drawRight: function() {
		var contexts = [];
		var options = this.options;
		for (var x = this.cols; x > 0; x--) {
			for (var y = 0; y < this.rows; y++) {
				var left = (x - 1) * options.width;
				var top = y * options.height;
				contexts.push(this.getContext(left, top));
			}
		}
		this.draw(contexts);
	},


	drawTop: function() {
		var contexts = [];
		var options = this.options;
		for (var y = 0; y < this.rows; y++) {
			for (var x = 0; x < this.cols; x++) {
				var left = x * options.width;
				var top = y * options.height;
				contexts.push(this.getContext(left, top));
			}
		}
		this.draw(contexts);
	},


	drawBottom: function() {
		var contexts = [];
		var options = this.options;
		for (var y = this.rows; y >= 0; y--) {
			for (var x = 0; x < this.cols; x++) {
				var left = x * options.width;
				var top = y * options.height;
				contexts.push(this.getContext(left, top));
			}
		}
		this.draw(contexts);
	}

});
