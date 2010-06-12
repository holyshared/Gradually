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


Gradually.Drawer = new Class({

	Implements: [Events, Options],

	options: {
		'source': null,
		'height': 55,
		'width': 65,
		'duration': 30
	},

	initialize: function(canvas, options) {
		this.setOptions(options);
		this.canvas = canvas;
		this.size = this.canvas.getSize();
		this.cols = this.size.x / this.options.width; 
		this.rows = this.size.y / this.options.height;
		this.total = this.cols * this.rows;
		this.context = canvas.getContext('2d');
		this.counter = 0;
	},

	calculationLeft: function() {},
	calculationRight: function() {},

	onMotion: function(props) {
		var drawHeight = (props.height > 0) ? props.height : 0.01;
		var drawWidth  = (props.width > 0) ? props.width : 0.01;

		this.context.clearRect(this.x, this.y, this.width, this.height);
		this.context.drawImage(this.source,
			props.left, props.top, drawWidth, drawHeight,
			props.left, props.top, drawWidth, drawHeight);
	},

	onProgress: function() {
		this.counter++;
		if (this.counter >= this.total) {
			this.counter = 0;
			this.fireEvent("change");
		}
	},

	draw: function(type) {
		var porps = (type == "left")
			? this.calculationLeft() : this.calculationRight();

		var duration = this.options.duration;
		porps.each(function(p, k) {
			var fx = new Fx.Gradually({
				"transition": "back:out",
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


Gradually.Drawer.Square = new Class({

	Extends: Gradually.Drawer,

	Implements: [Events, Options],

	options: {
		'source': null,
		'height': 55,
		'width': 65,
		'duration': 30
	},

	initialize: function(canvas, options) {
		this.parent(canvas, options);
	},

	calculationLeft: function() {
		var contexts = [];
		var options = this.options;
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				var left = x * options.width, top = y * options.height;
				var context = {
					"context": this.context,
					"source": options.source,
					"x": left, "y": top,
					"width": options.width, "height": options.height
				}
				contexts.push(context);
			}
		}
		return contexts;
	},

	calculationRight: function() {
		var contexts = [];
		var options = this.options;
		for (var x = this.cols; x > 0; x--) {
			for (var y = this.rows; y > 0; y--) {
				var left = x * options.width, top = y * options.height;
				var context = {
					"context": this.context,
					"source": options.source,
					"x": left, "y": top,
					"width": options.width,
					"height": options.height
				}
				contexts.push(context);
			}
		}
		return contexts;
	}

});
