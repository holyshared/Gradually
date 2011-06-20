/*
---
name: ImageDrawer

description: ImageDrawer offers API that draws to the canvas in the image while doing animation.

license: MIT-style

authors:
- Noritaka Horio

requires:
  - Core/Core
  - Core/Array
  - Core/String
  - Core/Number
  - Core/Function
  - Core/Object
  - Core/Event
  - Core/Browser
  - Core/Class
  - Core/Class.Extras
  - Core/Element
  - Core/Element.Style
  - Core/Element.Event
  - Core/Element.Dimensions
  - Core/Fx
  - Core/Fx.Transitions

provides: [Fx.ImageDrawer, ImageDrawer]

...
*/


(function($){

Fx.ImageDrawer = new Class({

	Extends: Fx,

	initialize: function(options){
		this.parent(options);
	},

	prepare: function(property, values){
		values = Array.from(values);
		var values1 = values[1];
		if (!(values1 || values1 === 0)){
			values[1] = values[0];
			values[0] = values[0];
		}
		return {from: values[0], to: values[1]};
	},

	compute: function(from, to, delta){
		this.value = {};
		for (var p in from) { this.value[p] = this.parent(from[p], to[p], delta); }
		this.fireEvent('motion', this.value);
		return this.value;
	},

	get: function(){
		return this.value || 0;
	},

	start: function(props){
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


var ImageDrawer = this.ImageDrawer = new Class({

	Implements: [Events, Options],

	options: {
		canvas: null,
		source: null,
		interval: 70,
		transition: 'expo:out',
		duration: 600
	},

	initialize: function(options){
		this.setOptions(options);
		this.setDefaultValues();
	},

	setDefaultValues: function(){
		var options = this.options;
		this.counter = 0;
		this.drawers = [];
		if (options.canvas) { this.setCanvas(options.canvas); }
		if (options.source) { this.setImage(options.source); }
	},

	setCanvas: function(canvas){
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');
		if (this.source) {
			this.setSize();
		}
		this.setupDrawer();
		return this;
	},

	getCanvas: function(){
		return this.canvas;
	},

	setImage: function(image){
		if (instanceOf(image, String)) {
			var source = new Image();
			source.src = image;
			this.source = source;
		} else {
			this.source = image;
		}
		this.setSize();
		this.setupDrawer();
		return this;
	},
	
	getImage: function(image){
		return this.source;
	},

	//abstract method
	setupDrawer: function(){
	},

	setSize: function(){
		this.size = {
			x: this.source.width,
			y: this.source.height
		};
		if (this.canvas) {
			this.canvas.setProperties({
				width: this.size.x,
				height: this.size.y
			});
		}
	},

	isDrawing: function(){
		return (this.drawing) ? true : false;
	},

	//abstract method
	onMotion: function(props){
	},

	onProgress: function(){
		this.counter++;
		if (this.counter >= this.total) {
			this.counter = 0;
			this.drawing = false;
			this.fireEvent('drawComplete', [this]);
		}
	},

	pause: function(){
		if (!this.drawed) this.drawers.each(function(fx) { fx.pause(); });
		this.drawing = false;
	},

	cancel: function(){
		if (!this.drawed) this.drawers.each(function(fx) { fx.cancel(); });
		this.counter = 0;
		this.drawing = false;
	},

	draw: function(porps){
		if (!instanceOf(this.canvas, Element)
		|| this.canvas.nodeName != 'CANVAS') {
			throw new TypeError('The canvas element is not set.');
		}
		this.fireEvent('drawStart', [this]);
	}

});

ImageDrawer.factory = function(imageDrawer, options){
	var instance = null;
	var typeKey = imageDrawer.capitalize();
	if (ImageDrawer[typeKey]) {
		instance = new ImageDrawer[typeKey](options);
	}
	return instance;
};


}(document.id));


/*
---
name: ImageDrawer.Grid

description: It draws in the image in each small grid.

license: MIT-style

authors:
- Noritaka Horio

requires:
  - Core/Core
  - Core/Array
  - Core/String
  - Core/Number
  - Core/Function
  - Core/Object
  - Core/Event
  - Core/Browser
  - Core/Class
  - Core/Class.Extras
  - Core/Element
  - Core/Element.Style
  - Core/Element.Event
  - Core/Element.Dimensions
  - Core/Fx
  - Core/Fx.Transitions
  - ImageDrawer/ImageDrawer

provides: ImageDrawer.Grid

...
*/

(function($){

var ImageDrawer = (this.ImageDrawer || {});

ImageDrawer.Grid = new Class({

	Extends: ImageDrawer,

	options: {
		canvas: null,
		source: null,
		gridHeight: 50,
		gridWidth: 50,
		interval: 70,
		transition: 'expo:in:out',
		duration: 600
	},

	initialize: function(options) {
		this.parent(options);
	},

	onMotion: function(props) {
		var height = Math.round(props.height);
		var width  = Math.round(props.width);
		var left = Math.round(props.left);
		var top = Math.round(props.top);
		height = (height > 0) ? height : 1;
		width = (width > 0) ? width : 1;
		left = (left > 0) ? left : 1;
		top = (top > 0) ? top : 1;

		this.context.clearRect(this.drawX, this.drawY, this.drawWidth, this.drawHeight);
		this.context.drawImage(this.source,
			left, top, width, height,
			left, top, width, height);
	},

	setupDrawer: function() {
		if (this.size) {
			this.cols = this.size.x / this.options.gridWidth;
			this.rows = this.size.y / this.options.gridHeight;
			this.total = this.cols * this.rows;
		}
	},

	getContext: function(x, y) {
		var options = this.options;
		return {
			context: this.context,
			source: this.source,
			drawX: x,
			drawY: y,
			drawWidth: options.gridWidth,
			drawHeight: options.gridHeight
		};
	},

	draw: function(porps) {
		this.parent();

		var op = this.options;
		var duration = op.duration;

		this.drawing = true;
		this.drawers = [];

		porps.each(function(p, k) {
			var fx = new Fx.ImageDrawer({
				transition: op.transition,
				duration: duration,
				link: 'cancel',
				fps: 30,
				onMotion:	this.onMotion.bind(p),
				onComplete: this.onProgress.bind(this)
			});

			fx.start({
				height: [0, op.gridHeight],
				width: [0, op.gridWidth],
				top: [p.drawY + op.gridHeight / 2, p.drawY],
				left: [p.drawX + op.gridWidth / 2, p.drawX]
			});
			duration = duration + op.interval;
			this.drawers.push(fx);
		}, this);
	},

	drawLeft: function() {
		var contexts = [];
		var options = this.options;
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				var left = x * options.gridWidth;
				var top = y * options.gridHeight;
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
				var left = (x - 1) * options.gridWidth;
				var top = y * options.gridHeight;
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
				var left = x * options.gridWidth;
				var top = y * options.gridHeight;
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
				var left = x * options.gridWidth;
				var top = y * options.gridHeight;
				contexts.push(this.getContext(left, top));
			}
		}
		this.draw(contexts);
	}

});

}(document.id));


/*
---
name: ImageDrawer.Expand

description: It draws in the image while expanding the width of length.

license: MIT-style

authors:
- Noritaka Horio

requires:
  - Core/Core
  - Core/Array
  - Core/String
  - Core/Number
  - Core/Function
  - Core/Object
  - Core/Event
  - Core/Browser
  - Core/Class
  - Core/Class.Extras
  - Core/Element
  - Core/Element.Style
  - Core/Element.Event
  - Core/Element.Dimensions
  - Core/Fx
  - Core/Fx.Transitions
  - ImageDrawer/ImageDrawer

provides: ImageDrawer.Expand

...
*/

(function($){

var ImageDrawer = (this.ImageDrawer || {});

ImageDrawer.Expand = new Class({

	Extends: ImageDrawer,

	options: {
		canvas: null,
		source: null,
		slideWidth: 50,
		interval: 70,
		transition: 'expo:in',
		duration: 600
	},

	initialize: function(options){
		this.parent(options);
	},

	onMotion: function(props){
		this.context.clearRect(this.drawX, this.drawY, this.drawWidth, this.drawHeight);
		this.context.drawImage(this.source,
			this.drawX, props.top, this.drawWidth, props.height,
			this.drawX, props.top, this.drawWidth, props.height);
	},

	setupDrawer: function(){
		if (this.size) {
			this.cols = this.size.x / this.options.slideWidth; 
			this.total = this.cols; 
		}
	},

	getContext: function(x, y){
		var options = this.options;
		return {
			context: this.context,
			source: this.source,
			drawX: x,
			drawY: y,
			drawHeight: this.size.y,
			drawWidth: options.slideWidth
		};		
	},

	getShuffle: function(contexts){
		var shuffle = [];
		while (contexts.length > 0){
			var props = contexts.getRandom();
			shuffle.push(props);
			contexts.erase(props);
		}
		return shuffle;
	},

	draw: function(porps){
		this.parent();

		var op = this.options;
		var duration = op.duration;

		this.drawing = true;
		this.drawers = [];

		porps.each(function(p, k){
			var fx = new Fx.ImageDrawer({
				transition: op.transition,
				duration: duration,
				link: 'cancel',
				fps: 30,
				onMotion:	this.onMotion.bind(p),
				onComplete: this.onProgress.bind(this)
			});

			fx.start({
				top: p.top,
				height: [0, this.size.y]
			});

			duration = duration + op.interval;
			this.drawers.push(fx);
		}, this);
	},

	drawLeft: function(){
		var contexts = [];
		var options = this.options;
		for (var x = 0; x < this.cols; x++) {
			var left = x * options.slideWidth;
			var context = this.getContext(left, 0);
			context.top = [this.size.y / 2, 0];
			contexts.push(context);
		}
		this.draw(contexts);
	},

	drawRight: function(){
		var contexts = [];
		var options = this.options;
		for (var x = this.cols; x > 0; x--) {
			var left = (x - 1) * options.slideWidth;
			var context = this.getContext(left, 0);
			context.top = [this.size.y / 2, 0];
			contexts.push(context);
		}
		this.draw(contexts);
	},

	drawTop: function(){
		var contexts = [];
		var options = this.options;
		for (var x = this.cols; x > 0; x--) {
			var left = (x - 1) * options.slideWidth;
			var context = this.getContext(left, 0);
			context.top = [0, 0];
			contexts.push(context);
		}
		this.draw(this.getShuffle(contexts));
	},

	drawBottom: function(){
		var contexts = [];
		var options = this.options;
		for (var x = this.cols; x > 0; x--) {
			var left = (x - 1) * options.slideWidth;
			var context = this.getContext(left, 0);
			context.top = [this.size.y, 0];
			contexts.push(context);
		}
		this.draw(this.getShuffle(contexts));
	}

});

}(document.id));
