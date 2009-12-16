/*
---
description: 

license: MIT-style

authors:
- Noritaka Horio
- Buck Kingsley

requires:
- localComponent1
- [localComponent2, localComponent3]
- externalPackage1:tag/component1
- externalPackage1:tag: component4
- externalPackage2:tag: [component1, component2]

provides: [Gradually]

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
		this.container = ($type(container) == "string" ) ? $(container) : container;


		this.container.setStyle("height", 450);
		this.container.setStyle("width", 950);
		
		this.images = this.source.getElements("li img");
		this.source.setStyle("diplay","none");

		this.buildStructure();
//		this._onTime.periodical(10000, this);
	},

	buildStructure: function() {
		var zIndex = this.images.length;
		this.elements = new Array();
		this.panelPosition = new Array();



		this.images.each(function(image,k) {
			var panelSet = this.createPanelSet(image);

	
			
			panelSet.inject(this.container);
		}.bind(this));

		this.source.dispose();
		this.elements = $(this.container).getElements(".gradually");
		this.index = 0;
	},

	createPanelSet: function(targetImage) {

		var zIndex = this.images.length;

		var src		= targetImage.getProperty('src');
		var height	= targetImage.getProperty('height');
		var width	= targetImage.getProperty('width');
		var size    = this.options.size;
		
		var panelSet = new Element('ul', {'styles': { 
			'height': height + "px",
			'width': width + "px",
			'zIndex': zIndex--
		}});

		var cols = width / size, rows = height / size; 

		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {
				var l = x * size, t = y * size;
				var panel = this.createPanel(l, t, src, size);
				panel.inject(panelSet);
			}
		}
		return panelSet;
	},


	createPanel: function() {
		var p = Array.link(arguments, {'x': Number.type,'y': Number.type, 'src': String.type, 'size': Number.type});
		var panel = new Element("li", {
			"styles": {
				"background": "url(" + p.src + ") no-repeat " + -p.x.toString() + "px  " + -p.y.toString() + "px",
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