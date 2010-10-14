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
		this.fireEvent('motion', [this.value]);
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
