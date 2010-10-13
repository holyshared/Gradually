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