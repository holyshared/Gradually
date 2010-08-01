SyntaxHighlighter.config.clipboardSwf = 'js/libraries/highlighter/clipboard.swf';
SyntaxHighlighter.all();

window.addEvent("domready", function() {

	var expand = new ImageDrawer.Expand({
		'slideWidth': 65,
		'interval': 70,
		'duration': 600,
		'transition': 'expo:in:out'
	});

	var gallery = document.id("gallery");
	var images = gallery.getElements(".graduallyImages li img");

	new Gradually.Slideshow(gallery, {
		'drawer': expand,  //Instance of ImageDrawer
		'images': images,
		'interval': 3000
	});
	
});
