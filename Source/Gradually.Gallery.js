/*
---
description: The gallery with the thumbnail using Gradually can be used.

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
  - ImageDrawer/ImageDrawer.Grid
  - ImageDrawer/ImageDrawer.Expand

provides: [Gradually, Gradually.Slideshow, Gradually.Gallery]

...
*/

Gradually.Gallery = new Class({

	Extends: Gradually,

	options: {
		'drawer': null,
		'images': null,
		'zIndex': 9000,
		'controller': {
			'controllerClass': 'graduallyController',
			'defaultIndex': 0,
			'prepage': 5,
			'containerClass': 'graduallyThumbnails',
			'prevClass': 'prev',
			'nextClass': 'next',
			'disableOpacity': 0.4
		}
		/*
			onPreload: $empty,
			onSelect: $empty,
			onDrawStart: $empty,
			onDrawComplete: $empty
		*/
	},

	initialize: function (container, options) {
		this.parent(container, options);
		this.addEvent("preload", this.onStart.bind(this));

		var controllerOptions = this.options.controller;
		var controller = this.container.getElement("." + controllerOptions.controllerClass);
		controllerOptions = $merge(controllerOptions, {
			"onSelect": this.onSelect.bind(this)
		});
		this.controller = new Gradually.Gallery.Controller(controller, controllerOptions);
		this.start();
	},

	onStart: function() {
//		var information = this.container.getElement(".information");
//		this.title = information.getElement(".title");
//		this.currentPanel = information.getElement(".current");
//		this.totalPanel = information.getElement(".total");

	//	var current = this.getCurrent();
//		this.title.set("html", current.title);
//		this.currentPanel.set("html", this.current + 1);
//		this.totalPanel.set("html", this.panels.length);
//		this.next.delay(this.options.interval, this);
	},

	onSelect: function(index, image) {
		this.set(index);
	}

});


Gradually.Gallery.Controller = new Class({

	Implements: [Events, Options],

	options: {
		'defaultIndex': 0,
		'prepage': 5,
		'containerClass': 'graduallyThumbnails',
		'prevClass': 'prev',
		'nextClass': 'next',
		'disableOpacity': 0.6
		/*
		'onSelect': $empty
		*/
	},

	initialize: function (container, options) {
		this.setOptions(options);
		this.controller = container;
		this.images = this.controller.getElements("." + this.options.containerClass + " li img");
		this.prevButton = this.controller.getElement("." + this.options.prevClass + " a");
		this.nextButton = this.controller.getElement("." + this.options.nextClass + " a");
		this.set(this.options.defaultIndex);
		this.prevButton.addEvent("click", this.onPrevClick.bind(this));
		this.nextButton.addEvent("click", this.onNextClick.bind(this));
		this.images.addEvent("click", this.onThumbnailClick.bind(this));
	},

	onPrevClick: function(event) {
		event.stop();
		if (this.current - 1 >= 0) {
			this.current--;
			this.set(this.current);
		}
	},

	onNextClick: function(event) {
		event.stop();
		if (this.current + 1 <= this.images.length - 1) {
			this.current++;
			this.set(this.current);
		}
	},

	onThumbnailClick: function(event) {
		event.stop();
		var index = this.images.indexOf(event.target);
		this.set(index);
	},

	getRange: function() {
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
		return {"from": sIndex, "to": eIndex};
	},

	set: function(index) {
		this.current = index;
		this.fireEvent("select", [index, this.images[index]]);
		var range = this.getRange();
		this.images.each(function(image, key) {
			var parent = image.getParent("li");
			if (key >= range.from && key <= range.to) {
				parent.setStyle("display", "");
			} else {
				parent.setStyle("display", "none");
			}
			(key == this.current)
			? image.setStyle("opacity", 1)
			: image.setStyle("opacity", this.options.disableOpacity);
			(key == range.from)
			? parent.addClass("first") 
			: parent.removeClass("first");
		}, this);
	}

});
