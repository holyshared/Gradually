/*
---
description: 

license: MIT-style

authors:
- Noritaka Horio

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
		'panelHeight': 55,
		'panelWidth': 65,
		'interval': 3000,
		'duration': 30,
		'zIndex': 9000,
		'frameColor': '#000000',
		'shadowColor': '#000000',
		'shadowSize': 5
	},

	initialize: function (container,sources,options) {
		this.setOptions(options);
		this.container = container;
		this.sources = sources;
		this.canvases = [];

		this.addEvent("onPreload", this.onPreload.bind(this));
		this.preload();
		this.currentIndex = 0;
	},

	onPreload: function() {
		var zIndex = this.sources.length;

var canvas = new Element("canvas", {"width": 650, "height": 275, "class":"frame","styles": {"zIndex": zIndex + 1}});
canvas.inject(this.container);

var ctx = canvas.getContext('2d');

/*
ctx.shadowBlur = 5;
ctx.shadowColor	=  "#990000";
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
*/
//ctx.fillStyle = "#990000";

//ctx.beginPath();
//ctx.arc(50, 50, 45, 0, Math.PI * 2, false);
//ctx.clip();

//var canvas = document.getElementById('c1');
//if ( ! canvas || ! canvas.getContext ) { return false; }
//var ctx = canvas.getContext('2d');
ctx.beginPath();

var grad  = ctx.createRadialGradient(
650/2,275/2,50,
650/2,275/2,650
);
grad.addColorStop(0,'rgba(0, 0, 0, 0)');
grad.addColorStop(0.5,'rgba(0, 0, 0, 1)');
ctx.fillStyle = grad;
ctx.rect(0,0,650,275);
ctx.fill();


/*
ctx.beginPath();
ctx.moveTo(5, 5);
ctx.lineTo(5, 5);
ctx.lineTo(660, 5);
ctx.lineTo(660, 285);
ctx.lineTo(5, 285);
ctx.closePath();
ctx.fill();
*/

/*
ctx.beginPath();
ctx.rect(0, 0, 100, 100);
ctx.fillStyle = "rgb(0,0,0)";
ctx.fill();
ctx.beginPath();
ctx.arc(50, 50, 45, 0, Math.PI * 2, false);
ctx.clip();
var img = new Image();
img.src = "clip_pic.png?" + new Date().getTime();
img.onload = function() {
  ctx.drawImage(img, 0, 0);
}

*/


		this.sources.each(function(e,k) {
			var p = e.getProperties("width", "height", "title", "alt", "src");
			var canvas = new Element("canvas", {
				"width": p.width,
				"height": p.height,
				"class": "source",
				"styles": { "zIndex": zIndex-- }
			});
			canvas.inject(this.container);
			this.canvases.push(canvas);

			var ctx = canvas.getContext('2d');
			ctx.drawImage(e,0,0,p.width,p.height);

		}.bind(this));

		this.onStart();
	},


	onStart: function() {
		var op = this.options;

		var current = this.getCurrent();
		var canvas	= current.canvas;
		var source	= current.source;
		var size	= canvas.getSize();
		var ctx		= canvas.getContext('2d');

		var cols = size.x / op.panelWidth; 
		var rows = size.y / op.panelHeight;
		var duration = op.duration;

		this.counter = 0;
		this.total = cols * rows;

		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {

				var left = x * op.panelWidth, top = y * op.panelHeight;
				var context = {"ctx2d": ctx, "source": source, "x": left, "y": top, "width": op.panelWidth, "height": op.panelHeight}

				var fx = new Fx.Gradually({
					"transition": "expo:out",
					"duration": duration,
					"fps": 30,
					"onMotion": this.onMotion.bind(context),
					"onComplete": this.onProgress.bind(this)
				});

				fx.start({
					"height": [op.panelHeight,0],
					"width": [op.panelWidth,0],
					"top": [top, top + op.panelHeight/2],
					"left": [left,left + op.panelWidth/2]}
				);
				duration = duration + op.duration;	
			}
		}

	},

	onMotion: function(props) {
		this.ctx2d.clearRect(this.x, this.y, this.width, this.height);	
		this.ctx2d.drawImage(this.source,
			props.left, props.top,
			props.width, props.height,
			props.left, props.top,
			props.width, props.height);
	},

	onProgress: function() {
		this.counter++;
		if (this.counter >= this.total) {
			this.next();
			this.onStart.delay(this.options.interval,this);
		}
	},

	next: function() {
		this.toFront();
		this.currentIndex = (this.currentIndex < this.canvases.length - 1) ? this.currentIndex + 1 : 0;
		return this.getCurrent();
	},

	getCurrent: function() {
		this.current = {
			"canvas": this.canvases[this.currentIndex],
			"source": this.sources[this.currentIndex]
		};		
		return this.current;
	},
	
	preload: function(){
		this.loadCount = 0;
		this.sources.each(function(e,k) {
			var src = e.getProperty("src");
			var img = new Image();
			img.src = src;

			var h = function() {
				this.loadCount++;
				if (this.loadCount >= this.sources.length) {
					this.fireEvent("onPreload");
				}	
			}.bind(this)
			img.onload = h;

		}.bind(this));
	},


	toFront: function() {
		var current = this.getCurrent();
		var canvas	= current.canvas;
		var source	= current.source;

		canvas.setStyle("zIndex", 1);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(source,0,0,source.getProperty("width"),source.getProperty("height"));

		this.canvases.each(function(e,k) {
			if (k != this.index) {
				var zIndex= e.getStyle("zIndex").toInt();
				e.setStyle("zIndex", ++zIndex);
			}
		}.bind(this));
	}
	
});

Fx.Gradually = new Class({

	Extends: Fx,

	compute: function(from, to, delta) {
		this.value = {};
		for (var p in from) this.value[p] = this.parent(from[p], to[p], delta);
		this.fireEvent('motion', this.value);
		return this.value;
	},

	get: function(){
		return this.value || 0;
	},

	start: function(props) {
		if (!this.check(props)) return this;
		var from = {}, to = {};
		for (var p in props) {
			from[p] = props[p].shift();
			to[p]	= props[p].shift();
		}
		return this.parent(from, to);
	}

});