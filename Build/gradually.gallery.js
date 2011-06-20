/*
---
name: Gradually

description: Gallery API using the canvas element is offered.

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

provides: Gradually

...
*/

(function($){

var Gradually = this.Gradually = new Class({

	Implements: [Events, Options],

	options: {
		drawer: null,
		images: null,
		zIndex: 9000,
		defaultIndex: 0
		/*
			onPreload: $empty,
			onSelect: $empty,
			onDrawStart: $empty,
			onDrawComplete: $empty
		*/
	},

	/**
	 * Constructor
	 */
	initialize: function (container, options){
		this.setOptions(options);
		this.container = container;
		this.current = this.options.defaultIndex;
		this.drawer = null;
		this.panels = [];
		this.setDefaultValues();
	},

	/**
	 * Gradually Internal Events
	 */
	onPreload: function(){
		var options = this.options;
		var images = options.images;

		images.each(function(image, key){
			this.addPanel(image);
		}.bind(this));

		this.drawDefaultImage();
		this.fireEvent('preload');
	},

	onDrawStart: function(drawer){
		this.fireEvent('drawStart', [this.getCurrent(), drawer]);
	},

	onDrawComplete: function(drawer){
		this.orderToBack();
		this.fireEvent('drawComplete', [this.getCurrent(), drawer]);
	},

	setDefaultValues: function(){
		var drawer = this.options.drawer;
		drawer.addEvent('onDrawStart', this.onDrawStart.bind(this));
		drawer.addEvent('onDrawComplete', this.onDrawComplete.bind(this));
		this.setDrawer(drawer);
	},

	drawDefaultImage: function(){
		var current = this.getCurrent();
		var canvas = current.canvas;
		var image = current.image;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image,
		0, 0, image.width, image.height,
		0, 0, image.width, image.height);
	},

	/**
	 * Setter/Getter Methods
	 */
	setDrawer: function(drawer){
		this.drawer = drawer;
	},

	getDrawer: function(){
		return this.drawer;
	},

	set: function(index){
		if (this.current != index) {
			this.current = index;
			this.fireEvent('select', [this.current, this.getCurrent()]);
			if (this.drawer.isDrawing()) {
				this.drawer.cancel();
				this.drawer.fireEvent('drawComplete', [this.drawer]);
			}

			var current = this.getCurrent();
			this.orderToNext();
			this.drawer.setCanvas(current.canvas);
			this.drawer.setImage(current.image);
			this.draw();
		}
	},

	draw: function(){
		(this.current % 2)
		? this.drawer.drawRight()
		: this.drawer.drawLeft();
	},

	orderToNext: function(){
		var current = this.getCurrent();
		var canvas = current.canvas;
		var image = current.image;
		canvas.setStyle('zIndex', this.options.zIndex + 2);
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, image.width, image.height);
	},

	orderToBack: function(){
		var current = this.getCurrent();
		var canvas = current.canvas;
		canvas.setStyle('zIndex', this.options.zIndex + 1);
		this.panels.each(function(panel) {
			var pcanvas = panel.canvas;
			if (canvas != pcanvas) {
				pcanvas.setStyle('zIndex', this.options.zIndex);
			}
		}, this);
	},

	setDrawer: function(drawer){
		this.drawer = drawer;
	},

	getDrawer: function(){
		return this.drawer;
	},

	getPanel: function(index){
		return this.panels[index];
	},

	getCurrent: function(){
		return this.getPanel(this.current);
	},

	/**
	 * Private Methods
	 */
	addPanel: function(image){

		var props = image.getProperties("width", "height", "title", "alt", "src");

		var canvas = new Element('canvas.source');
		canvas.setProperties({
			width: props.width,
			height: props.height
		})
		canvas.setStyle('z-index', this.options.zIndex);

		props = Object.merge({
			canvas: canvas,
			image: image
		}, props)

		this.panels.push(props);

		image.setStyle('display', 'none');
		canvas.inject(image.parentNode);
		return canvas;
	},

	start: function(){
		if (!this.drawer) throw new TypeError('Drawer is not set. Please set ImageDrawer.');

		var images = this.options.images;
		var preloadImages = [];
		images.each(function(e,k) {
			preloadImages.push(e.getProperty('src'));
			e.setStyle('display', 'none');
		});
		new Asset.images(preloadImages, {
			onComplete: this.onPreload.bind(this)
		});
	}

});

}(document.id));


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

