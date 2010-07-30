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


Gradually.Gallery = new Class({

	Extends: Gradually,

	options: {
		'drawer': null,
		'images': null,
		'interval': 1000,
		'zIndex': 9000
		/*
			onPreload: $empty,
			onSelect: $empty,
			onDrawStart: $empty,
			onDrawComplete: $empty
		*/
	},

	initialize: function (container, options) {
		this.parent(container, options);
//		this.addEvent("drawComplete", this.onNextDelay.bind(this));
		this.addEvent("preload", this.onStart.bind(this));
		this.addEvent("select", this.onSelect.bind(this));
		this.start();
	},

//	onNextDelay: function() {
	//	this.next.delay(this.options.interval, this);
//	},

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

	onSelect: function(index, panel) {
//		this.title.set("html", panel.title);
//		this.currentPanel.set("html", index + 1);
	},

	prev: function() {
	},

	next: function() {
/*
		if (this.current < this.panels.length - 1) {
			var nextIndex = this.current + 1;
			this.set(nextIndex);
		} else {
			this.set(0);
		}
*/
	}

});






Gradually.Gallery.Controller = new Class({

	Implements: [Events, Options],

	options: {
		'defaultIndex': 0,
		'prepage': 5
		'containerClass': 'graduallyThumbnails',
		'prevClass': 'prev',
		'nextClass': 'next',
		'disableOpacity': 0.6
		/*
		'onNext': $empty,
		'onPrev': $empty,
		'onChange': $empty
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
	},

	onPrevClick: function() {
		if (this.current - 1 >= 0) {
			this.current--;
			this.set(this.current);
		}
	},

	onNextClick: function() {
		if (this.current + 1 <= this.images.length - 1) {
			this.current++;
			this.set(this.current);
		}
	},

	getRange: function() {
		var sIndex = eIndex = this.current;
		var page = Math.floor(this.current / this.options.prepage);
		if (this.current <= this.options.prepage - 1) {
			sIndex = 0;
			eIndex = this.options.prepage - 1;
		} else if (this.current == this.images.length - 1) {
			sIndex = this.current - this.options.prepage + 1;
			eIndex = this.images.length - 1;
		} else {
			sIndex = page * this.options.prepage + 1
			eIndex = sIndex + this.options.prepage - 1;
		}
		return {"from": sIndex, "to": eIndex};
	},

	set: function(index) {
		this.current = index;
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
