var Test = {

	initialize: function() {
		this.image = new Asset.image('images/demo1.jpg', {
			'id': 'demo',
			'onload': this.initCanvas.bind(this)
		});
	},

	initCanvas: function() {
//		this.image.inject(document.body);

		var canvas = new Element("canvas", {"height": "257", "width": 650});
		canvas.inject($("canvasContainer"));

		CANVAS.init({'canvasElement' : canvas});
		CANVAS.layers.add(new Layer({'id' : 'master'}));

		var l = CANVAS.layers.get('master');

		var a = this.cal();
		var duration = 600;
		a.each(function(v,k) {
			var item = new CanvasItem({id : 'item-' + k, 'events': {'onDraw': this.onDraw}});
			item.setDims(v.x, v.y, v.height, v.width); 
			l.add(item);
/*
			var props = {
				"left": v.x,
				"top": v.y,
				"width": v.width,
				"height": v.height
			};
	*/
			new Cmorph(item, {
				"transition": "back:out",
				"duration": duration,
				"link": "cancel",
				"fps": 30,
				"onComplete": function() {
				}
			}).morph({
				"left": [v.x,10],
				"top": [v.y,10],
				"width": [v.width, 0],
				"height": [v.height, 0]
			});
			duration = duration + 60;
		}, this);


        CANVAS.addThread(new Thread({
        	id : 'myThread',
            onExec : function() {
            	CANVAS.clear().draw();
            }
        }));
		
//		CANVAS.draw();
	},

	onDraw: function(ctx) {
		ctx.clearRect(this.x, this.y, this.width, this.height);
		ctx.drawImage(this.source,
			this.x, this.y, this.width, this.height,
			this.x, this.y, this.width, this.height);
	},

	cal: function() {
		var cols = 650 / 50; 
		var rows = 275 / 50;
		var total = cols * rows;
		var p = [];
		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {
				var left = x * 50, top = y * 50;
				var values = {"source": this.image,
					"x": left, "y": top,
					"width": 50, "height": 50
				}
				p.push(values);
			}
		}
		return p;
	}

};

window.addEvent("domready", Test.initialize.bind(Test));
