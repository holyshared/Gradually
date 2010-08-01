SyntaxHighlighter.config.clipboardSwf = 'js/libraries/highlighter/clipboard.swf';
SyntaxHighlighter.all();

window.addEvent("load", function(){

	var drawer = new ImageDrawer.Grid({
		'gridHeight': 55,
		'gridWidth': 65,
		'interval': 70,
		'duration': 300,
		'transition': 'expo:out'
	});

	var container = document.id("gallery");
	var images = $$(".graduallyImages li img");

	var gallery = new Gradually.Gallery(container, {
		'images': images,
		'drawer': drawer,  //Instance of ImageDrawer
		'controller': {
			'disableOpacity': 0.2
		}
	});

});