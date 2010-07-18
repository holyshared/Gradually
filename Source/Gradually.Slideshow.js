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


Gradually.Slideshow = new Class({

	Extends: Gradually,

	options: {
		'drawerType': 'grid',
		'drawerOptions': {
			'height': 55,
			'width': 65,
			'duration': 1000,
			'transition': 'expo:in:out'
		},
		'images': null,
		'interval': 1000,
		'zIndex': 9000
	},

	initialize: function (container, options) {
	this.parent(container, options);
		this.addEvent("drawComplete", this.onNextDelay.bind(this));
		this.addEvent("preload", this.onNextDelay.bind(this));
		this.start();
	},

	onNextDelay: function() {
		this.next.delay(this.options.interval, this);
	},

	next: function() {
		if (this.current < this.images.length - 1) {
			var nextIndex = this.current + 1;
			this.set(nextIndex);
		} else {
			this.set(0);
		}
	}

});