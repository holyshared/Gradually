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

var RandomImage = new Class({

	Implements: [Events, Options],

	options: {
		"colum": 10
	},

	initialize: function (container, source, options) {
		this.setOptions(options);
		this.source = ($type(source) == "string" ) ? $(source) : source;
		this.container = ($type(container) == "string" ) ? $(container) : container;
		this._buildStructure();
//		this._savePostion();
		this._onTime.periodical(10000, this);
	},

	_buildStructure: function() {
		var sources = this.source.getElements("li img");
		var zIndex = sources.length;
		this.elements = new Array();
		this.panelPosition = new Array();
		sources.each(function(e,k) {
			var src			= e.getProperty("src");
			var width	= e.getProperty("width");
			var size = width / this.options.colum;
			var left = 0, top = 0;
			var ul = new Element("ul", {"class": "random",  "styles": {"width": width + "px", "zIndex": zIndex--}});
			for (var i = 0; i < this.options.colum; i++) {
				left = 0;
				for (var j = 0; j < this.options.colum; j++) {
					var li = new Element("li", {"styles": {"background": "url(" + src + ") no-repeat " + left.toString() + "px  " + top.toString() + "px",
						"width": size, "height": size, "left": j * 50, "top": i * 50}});
					li.inject(ul);
					left = left - size;
					this.panelPosition.push({x: j * 50, y: i * 50});
				}
				top = top - size;
			}
			ul.inject(this.container);
//			this.elements.push(ul);
		}.bind(this));
		this.source.dispose();
		this.elements = $(this.container).getElements(".random");
		this.index = 0;
	},
/*
	_savePostion: function() {
		this.panelPosition = new Array();
		var panelSet = this.elements[this.index ];
		var panels = $(panelSet).getElements("li");
		panels.each(function(e,k){
			var postion = e.getPosition();
			this.panelPosition.push(postion.x);
		}.bind(this));
	},
*/
	_onTime: function() {
		this._hideImage();
	},

	_hideImage: function() {
		var panelSet = this.elements[this.index ];
		var panels = $(panelSet).getElements("li");

		var duration = 0;
		this.hideImageCount = 0;
		this.panelCount = panels.length;
//		this.panelPosition = new Array();

		var complete = function() {
			if (this.hideImageCount >= this.panelCount - 1) {
				this._changeZindex();
				this.index = (this.index < this.elements.length - 1) ? this.index + 1 :  0;
			}
			this.hideImageCount++;
		}.bind(this);

		var i = 0;
		while(panels.length > 0) {
//			var target = panels.shift();
			var target = panels.getRandom();
			var index = panels.indexOf(target);

//			var fx = target.get("tween", {"duration": duration, "onComplete": complete});
//			fx.start("opacity", [100, 0]);
//			var postion = target.getPosition();
			var fx = target.get("morph", {"duration": duration, "transition": "expo:out", "onComplete": complete});
			fx.start({
//				"opacity": [100, 0],
				"opacity": [100, 0]
//				"left": [this.panelPosition[index + i].x, this.panelPosition[index + i].x - $random(-100, 100)],
//				"top": [this.panelPosition[index + i].y, this.panelPosition[index + i].y - $random(-100, 100)]
			});
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
//			e.setStyle("left", this.panelPosition[k].x);
//			e.setStyle("top", this.panelPosition[k].y);
		}.bind(this));

		this.elements.each(function(e,k) {
			if (k != this.index) {
				var zIndex= e.getStyle("zIndex").toInt();
				e.setStyle("zIndex", ++zIndex);
			}
		}.bind(this));
	}

	
});



window.addEvent("domready", function() {
//	var images = $("base").getElements("li img");
	new RandomImage($("container"),  $("base"));
});
