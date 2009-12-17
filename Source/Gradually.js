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
		'panelHeight': 80,
		'panelWidth': 95,
		'periodical': 10000,
		'duration': 100,
		'zIndex': 9000
	},

	initialize: function (container, source, options) {
		this.setOptions(options);
		this.source = ($type(source) == "string" ) ? $(source) : source;
		this.container = ($type(container) == "string" ) ? $(container) : container;

		
		this.parseElements(source);
				this.index = 0;

		
		this.container.setStyle("height", 400);
		this.container.setStyle("width", 950);
		
		this.images = this.source.getElements("li img");
		this.zIndex	= this.images.length;
		this.source.setStyle("diplay","none");

		this.build();
		this.onTime.delay(this.options.periodical, this);
	},

	parseElements: function(source) {
		var height	= this.options.panelHeight;
		var width	= this.options.panelWidth;
		var images	= source.getElements("li img");

		this.zIndex = images.length;
		this.psets = new Array();

		images.each(function(e,k){
			var panels = new Array();
			var p    = e.getProperties("height", "width", "src", "title");
			var cols = ((p.width/width) * width >= p.width) ? (p.width/width) : (p.width/width) + 1; 
			var rows = ((p.height/height) * height >= p.height) ? (p.height/height) : (p.height/height) + 1; 
			for (var x = 0; x < cols; x++) {
				for (var y = 0; y < rows; y++) {
					var l = x * width, t = y * height;
					//heigth,width,top,left,background-position,src
					var image = {"h": height, "w": width, "pt": t, "pl": l, "il": -l, "it": -t, "src": p.src};
					panels.push(image);
				}
			}
			this.psets.push({"h": p.height, "w": p.width, "panels": panels, "zIndex": this.zIndex--});
		}.bind(this));

		//Bye bye
		source.dispose();
	},
	
	build: function() {
		this.psets.each(function(pset,k) {
			var panelSet = this.createPanelSet(pset);
			panelSet.inject(this.container);
		}.bind(this));
		this.elements = $(this.container).getElements("ul");
	},


	
	
	createPanelSet: function(p) {
		var size = this.options.size;
		var panelSet = new Element('ul', {
			'styles': {
				'height': p.h + "px",
				'width': p.w + "px",
				'zIndex': p.zIndex
			}
		});

		var panels = p.panels;
		panels.each(function(panel,k){
			var panel = this.createPanel(panel);
			panel.inject(panelSet);
		}.bind(this));
		return panelSet;
	},


	createPanel: function(p) {
		var panel = new Element("li", {
			"styles": {
				"background": "url(" + p.src + ") no-repeat " + p.il.toString() + "px  " + p.it.toString() + "px",
				"height": p.h, "width": p.w,
				"top": p.pt, "left": p.pl
			}
		});
		return panel;
	},
	

	getCurrentPanelSet: function() {
		return this.elements[this.index];
	},

	getCurrentPanels: function() {
		var current = this.elements[this.index];
		var panels = $(current).getElements("li");
		return panels;
	},

	reset: function() {
		this.progress = 0;
		this.total = 0;
	},

	random: function() {
		this.reset();
		var panels = this.getCurrentPanels();
		var total = panels.length;
//		var duration = 0;




		this.total = panels.length;
		this.progress = 0;


		var duration = this.options.duration;
		while(panels.length > 0) {
			var pickup = panels.getRandom();
			var size = pickup.getSize();
			var position = pickup.getStyles("left", "top");
			var fx = pickup.get("morph", {"duration": duration, "transition": "expo:out", "onComplete": this.onProgress.bind(this)});
/*			fx.start({
				"opacity": [1, 0],
				"height": [size.y, 0], "width": [size.x, 0],
				"top": [position.top.toInt(), position.top.toInt() + (size.y/2)],
				"left": [position.left.toInt(), position.left.toInt() + (size.x/2)]
			});
*/
			fx.start({
				"opacity": [1, 0]
			});


			duration = duration + this.options.duration;
			panels.erase(pickup);
		}
	},

	
	sequential: function() {
		this.reset();
		var panels = this.getCurrentPanels();

		var duration = 0;
		for (var i = 0; i < total; i++) {
			var pickup = panels[i];
			var size = pickup.getSize();
			var position = pickup.getStyles("left", "top");
			var fx = pickup.get("morph", {"duration": duration, "transition": "expo:out", "onComplete": this.onProgress.bind(this)});
			fx.start({
				"opacity": [1, 0],
				"height": [size.y, 0], "width": [size.x, 0],
				"top": [position.top.toInt(), position.top.toInt() + (size.y/2)],
				"left": [position.left.toInt(), position.left.toInt() + (size.x/2)]
			});
			duration = duration + this.options.duration;
		}
	},
	
	
	
	onTime: function() {
//this.sequential();
		this.random();
	},

	onProgress: function() {
		this.progress++;
		(this.progress >= this.total - 1) ? this.onComplete.bind(this)() : false;
	},

	onComplete: function() {
		this.reset();
		this.toFront();
		this.index = (this.index < this.elements.length - 1) ? this.index + 1 : 0;
		this.onTime.delay(this.options.periodical, this);
	},

	toFront: function() {
		var current = this.getCurrentPanelSet();
		var panels	= this.getCurrentPanels();
		current.setStyle("zIndex", 1);
		panels.each(function(e,k) {
			e.setStyle("opacity", 1);
		}.bind(this));

		this.elements.each(function(e,k) {
			if (k != this.index) {
				var zIndex= e.getStyle("zIndex").toInt();
				e.setStyle("zIndex", ++zIndex);
			}
		}.bind(this));
	}
	
});