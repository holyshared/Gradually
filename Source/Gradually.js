/*
---
description: Element class, Elements class, and basic dom methods.

license: MIT-style

authors:
- Jimmy Dean
- Buck Kingsley

requires:
- localComponent1
- [localComponent2, localComponent3]
- externalPackage1:tag/component1
- externalPackage1:tag: component4
- externalPackage2:tag: [component1, component2]

provides: [Element, Elements, $, $$]

...
*/

var Gradually = new Class({

	Implements: [Events, Options],

	options: {
		'size': 100,
		'periodical': 10000,
		'zIndex': 9000
	},

	initialize: function (container, source, options) {
		this.setOptions(options);
		this.source = ($type(source) == "string" ) ? $(source) : source;
//		this.container = ($type(container) == "string" ) ? $(container) : container;


		this.sources = this.source.getElements("li img");

		this.buildStructure();
		this._onTime.periodical(10000, this);
	},


	buildStructure: function() {
		var zIndex = sources.length;
		this.elements = new Array();
		this.panelPosition = new Array();



		sources.each(function(e,k) {
			var panelSet = this.createPanelSet(e);
			panelSet.inject(this.container);
		}.bind(this));

		this.source.dispose();
		this.elements = $(this.container).getElements(".gradually");
		this.index = 0;
	},

	createPanelSet: function(targetImage) {
		var zIndex = sources.length;
		var src	= targetImage.getProperty('src');
		var width = targetImage.getProperty('width');

		var panelSet = new Element('ul', {
			'class': 'gradually',
			'styles': {
				'width': width + "px",
				'zIndex': zIndex--
			}
		});







		for (var i = 0; i < this.options.colum; i++) {
			left = 0;
			for (var j = 0; j < this.options.colum; j++) {
				var l = j * size, t = i * size;
				var p = this.createPanel(l,t,size);
				p.inject(panelSet);
				left = left - size;
				this.panelPosition.push({x:l, y:t});
			}
			top = top - size;
		}
		return panelSet;
	},


	createPanel: function() {
		var p = arguments.link({'x': Number.type,'y': Number.type,'size': Number.type});
		var panel = new Element("li", {
			"styles": {
				"background": "url(" + src + ") no-repeat " + p.x.toString() + "px  " + p.y.toString() + "px",
				"height": p.size, "width": p.size,
				"top": p.y, "left": p.x
			}
		});
		return panel;
	},





	_onTime: function() {
		this._hideImage();
	},

	_hideImage: function() {
		var panelSet = this.elements[this.index ];
		var panels = $(panelSet).getElements("li");

		var duration = 0;
		this.hideImageCount = 0;
		this.panelCount = panels.length;

		var complete = function() {
			if (this.hideImageCount >= this.panelCount - 1) {
				this._changeZindex();
				this.index = (this.index < this.elements.length - 1) ? this.index + 1 :  0;
			}
			this.hideImageCount++;
		}.bind(this);

		var i = 0;
		while(panels.length > 0) {
			var target = panels.getRandom();
			var index = panels.indexOf(target);

			var fx = target.get("morph", {"duration": duration, "transition": "expo:out", "onComplete": complete});
			fx.start({"opacity": [100, 0]});
			duration = duration + 50;
			panels.erase(target);
			i++;
		}
	},

	_changeZindex: function() {
		var panelSet = this.elements[this.index];
		var panels = $(panelSet).getElements("li");
		panelSet.setStyle("zIndex", 1);
		panels.each(function(e,k) {
			e.setStyles({
				"opacity": 100,
				"left": this.panelPosition[k].x,
				"top": this.panelPosition[k].y
			});
		}.bind(this));

		this.elements.each(function(e,k) {
			if (k != this.index) {
				var zIndex= e.getStyle("zIndex").toInt();
				e.setStyle("zIndex", ++zIndex);
			}
		}.bind(this));
	}
	
});