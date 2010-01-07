SyntaxHighlighter.config.clipboardSwf = 'js/libraries/highlighter/clipboard.swf';
SyntaxHighlighter.all();

window.addEvent("domready", function(){

	var container = null, sources = null;

	var options = {
		'panelHeight': 55,
		'panelWidth': 65,
		'interval': 3000,
		'duration': 800,
		'zIndex': 9000,
		'onStart': function() {
			$("container").getElement("p.information").set("html", "now loading....");
		},
		'onPreload': function(images) {
			$("container").getElement("p.information").set("html", images.length.toString() + "loaded");
		},
		'onChange': function(image) {
			$("container").getElement("p.information").set("html", image.title + " : " + image.alt);
		}
	};
	
	var container	= $("gradually-container");
	var sources		= $("gradually-container").getElements("li img");

	new Gradually(container, sources, options);
	
});
