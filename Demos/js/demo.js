window.addEvent("domready", function(){
	var container = null, sources = null;
	var options = {
		'panelHeight': 55,
		'panelWidth': 65,
		'interval': 3000,
		'duration': 800,
		'zIndex': 9000
	};
	
	var container	= $("container");
	var sources		= $("source").getElements("li img");
	new Gradually(container, sources, options);
	
});
