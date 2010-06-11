var Test = {

	initialize: function() {
		var image = new Asset.image('images/demo1.jpg', {
			'id': 'demo',
			'onload': this.initCanvas.bind(this)
		});
	},

	initCanvas: function() {
		var canvas = new Element("canvas", {"height": "257", "width": 650});
		canvas.inject($("canvasContainer"));

		CANVAS.init({'canvasElement' : canvas});
		CANVAS.layers.add(new Layer({'id' : 'master'}));
		CANVAS.layers.get('master').add(new CanvasItem({id : 'item-1', 'events': {'onDraw': onDraw}}));
		CANVAS.draw();
	},

	onDraw: function(ctx) {
		ctx.clearRect(props.x, props.y, props.width, props.height);
		ctx.drawImage(props.source,
			props.x, props.y, props.width, props.height,
			props.x, props.y, props.width, props.height);
	},

	cal: function(ctx) {
		var p = [];
		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {
				var left = x * 50, top = y * 50;
				var values = {
					"source": source,
					"x": left,
					"y": top,
					"width": 50,
					"height": 50
				}
				p.push(values)
			}
		}
	}



};