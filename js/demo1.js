window.addEvent("domready", function(){

	var container = null, sources = null;
	var container = $("gradually-container");
	var sources	  = $("gradually-container").getElements("li img");
	var loadingbar		  = $("container").getElement("p.progressbar");
	var info	= $("container").getElement("p.information");

	info.setStyle("display", "none");

	var progressBar = new MoogressBar({
		bgImage: 'images/progressbar/blue.gif',
		parent_el: loadingbar,
		percentage: 0
	});

	var options = {
		'panelHeight': 55,
		'panelWidth': 65,
		'interval': 3000,
		'duration': 800,
		'zIndex': 9000,
		'onStart': function() {
			progressBar.setPercentage(0);
		},
		'onPreload': function(images) {
				info.setStyle("display", "");
				info.set("html", images.length.toString() + "loaded");
		},
		'onProgress': function(counter, index) {
			var loaded = counter + 1;
			progressBar.setPercentage((loaded / sources.length) * 100);
		},
		'onChange': function(image) {
			info.set("html", image.title + " : " + image.alt);
		}
	};

	new Gradually(container, sources, options);
});
