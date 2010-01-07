SyntaxHighlighter.config.clipboardSwf = 'js/libraries/highlighter/clipboard.swf';
SyntaxHighlighter.all();

window.addEvent("domready", function(){

	var container	= null, sources = null, size = null, position = null, dHeight = null;
	var container	= $("gradually-container");
	var sources		= $("gradually-container").getElements("li img");
	var information = $("container").getElement("p.information");

	var options = {
		'panelHeight': 55,
		'panelWidth': 65,
		'interval': 3000,
		'duration': 800,
		'zIndex': 9000,
		'onStart': function() {
			size		= container.getSize();
			position	= container.getPosition();
			dHeight		= information.getSize().y;

			information.setStyles({
				"position": "absolute",
				"left": position.x - 1, "top": position.y + size.y - dHeight,
				"width": size.x - 10, "height": 0,
				"zIndex": 20000,
				"opacity": 0.8
			});

			information.set("html", "now loading....");
		},
		'onChange': function(image) {
			var fx = information.get("morph", {
				"link": "chain",
				"transition": "expo:in:out",
				"onComplete": function() {
					information.set("html", image.title + " : " + image.alt);
				}
			});

			fx.start({ "height": [dHeight, 0], "top": [position.y + size.y - dHeight, position.y + size.y] })
			  .start({ "height": [0, dHeight], "top": [position.y + size.y, position.y + size.y - dHeight] });
		}
	};

	new Gradually(container, sources, options);

});