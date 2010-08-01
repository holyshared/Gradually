/*
---
description: The slide show using Gradually can be used.

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


Gradually.Slideshow = new Class({

	Extends: Gradually,

	options: {
		'drawer': null,
		'images': null,
		'interval': 3000,
		'zIndex': 9000,
		'titleClass': 'title',
		'currentClass': 'current',
		'totalClass': 'total'
		/*
			onPreload: $empty,
			onSelect: $empty,
			onDrawStart: $empty,
			onDrawComplete: $empty
		*/
	},

	initialize: function (container, options) {
		this.parent(container, options);
		this.addEvent("drawComplete", this.onNextDelay.bind(this));
		this.addEvent("preload", this.onStart.bind(this));
		this.addEvent("select", this.onSelect.bind(this));
		this.start();
	},

	onNextDelay: function() {
		this.next.delay(this.options.interval, this);
	},

	onStart: function() {
		this.title = this.container.getElement("." + this.options.titleClass);
		this.currentPanel = this.container.getElement("." + this.options.currentClass);
		this.totalPanel = this.container.getElement("." + this.options.totalClass);

		var current = this.getCurrent();
		this.title.set("html", current.title);
		this.currentPanel.set("html", this.current + 1);
		this.totalPanel.set("html", this.panels.length);
		this.next.delay(this.options.interval, this);
	},

	onSelect: function(index, panel) {
		this.title.set("html", panel.title);
		this.currentPanel.set("html", index + 1);
	},

	next: function() {
		if (this.current < this.panels.length - 1) {
			var nextIndex = this.current + 1;
			this.set(nextIndex);
		} else {
			this.set(0);
		}
	}

});