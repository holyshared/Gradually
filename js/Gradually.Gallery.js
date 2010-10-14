/*
---
name: Gradually.Gallery

description: The gallery with the thumbnail using Gradually can be used.

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
  - Core/Slick.Parser
  - Core/Slick.Finder
  - Core/Element
  - Core/Element.Style
  - Core/Element.Event
  - Core/Element.Dimensions
  - Core/Fx
  - Core/Fx.Transitions
  - More/Assets
  - ImageDrawer/ImageDrawer
  - ImageDrawer/ImageDrawer.Grid
  - ImageDrawer/ImageDrawer.Expand
  - Gradually/Gradually

provides: [Gradually.Gallery, Gradually.Gallery.Controller]

...
*/

(function($){

var Gradually = (this.Gradually || {});

Gradually.Gallery = new Class({

	Extends: Gradually,

	options: {
		drawer: null,
		images: null,
		zIndex: 9000,
		titleClass: 'title',
		currentClass: 'current',
		totalClass: 'total',
		controller: {
			controllerClass: 'graduallyController',
			defaultIndex: 0,
			prepage: 5,
			containerClass: 'graduallyThumbnails',
			prevClass: 'prev',
			nextClass: 'next',
			disableOpacity: 0.4
		}
		/*
			onPreload: $empty,
			onSelect: $empty,
			onDrawStart: $empty,
			onDrawComplete: $empty
		*/
	},

	initialize: function (container, options){
		this.parent(container, options);
		this.addEvent('preload', this.onStart.bind(this));
		this.addEvent('select', this.onSelect.bind(this));

		var controllerOptions = this.options.controller;
		var controller = this.container.getElement('.' + controllerOptions.controllerClass);
		controllerOptions = Object.merge(controllerOptions, {
			'onSelect': this.onThumbnailSelect.bind(this)
		});
		this.controller = new Gradually.Gallery.Controller(controller, controllerOptions);
		this.start();
	},

	onStart: function(){
		this.title = this.container.getElement('.' + this.options.titleClass);
		this.currentPanel = this.container.getElement('.' + this.options.currentClass);
		this.totalPanel = this.container.getElement('.' + this.options.totalClass);

		var current = this.getCurrent();
		this.title.set('html', current.title);
		this.currentPanel.set('html', this.current + 1);
		this.totalPanel.set('html', this.panels.length);
	},

	onSelect: function(index, panel){
		this.title.set('html', panel.title);
		this.currentPanel.set('html', index + 1);
	},

	onThumbnailSelect: function(index, image){
		this.set(index);
	}

});


Gradually.Gallery.Controller = new Class({

	Implements: [Events, Options],

	options: {
		defaultIndex: 0,
		prepage: 5,
		containerClass: 'graduallyThumbnails',
		prevClass: 'prev',
		nextClass: 'next',
		disableOpacity: 0.6
		/*
		'onSelect': $empty
		*/
	},

	initialize: function (container, options){
		this.setOptions(options);
		this.controller = container;
		this.images = this.controller.getElements('.' + this.options.containerClass + ' li img');
		this.prevButton = this.controller.getElement('.' + this.options.prevClass + ' a');
		this.nextButton = this.controller.getElement('.' + this.options.nextClass + ' a');
		this.set(this.options.defaultIndex);
		this.prevButton.addEvent('click', this.onPrevClick.bind(this));
		this.nextButton.addEvent('click', this.onNextClick.bind(this));
		this.images.addEvent('click', this.onThumbnailClick.bind(this));
	},

	onPrevClick: function(event){
		event.stop();
		if (this.current - 1 >= 0) {
			this.current--;
			this.set(this.current);
		}
	},

	onNextClick: function(event){
		event.stop();
		if (this.current + 1 <= this.images.length - 1) {
			this.current++;
			this.set(this.current);
		}
	},

	onThumbnailClick: function(event){
		event.stop();
		var index = this.images.indexOf(event.target);
		this.set(index);
	},

	getRange: function(){
		var prepage = this.options.prepage;
		var count = (prepage - 1) / 2;
		var diff = this.images.length - (this.current + count);
		if (this.images.length - 1 - count <= this.current) {
			var sIndex = this.images.length - this.options.prepage;
			var eIndex = this.images.length - 1;
		} else {
			var sIndex = ((this.current - count) < 0) ? 0 : this.current - count;
			var eIndex = ((this.current + count) >= prepage) ? this.current + count : prepage - 1;
		}
		return {
			'from': sIndex,
			'to': eIndex
		};
	},

	set: function(index){
		this.current = index;
		this.fireEvent('select', [index, this.images[index]]);
		var range = this.getRange();
		this.images.each(function(image, key) {
			var parent = image.getParent('li');
			if (key >= range.from && key <= range.to) {
				parent.setStyle('display', '');
			} else {
				parent.setStyle('display', 'none');
			}
			(key == this.current)
			? image.setStyle('opacity', 1)
			: image.setStyle('opacity', this.options.disableOpacity);
			(key == range.from)
			? parent.addClass('first') 
			: parent.removeClass('first');
		}, this);
	}

});

}(document.id));
