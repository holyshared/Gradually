window.addEvent("load", function() {
	new Gradually(
		$("container"),
		$("source").getElements("li img"), {
			'panelHeight': 55,
			'panelWidth': 65,
			'interval': 5000,
			'duration': 800,
			'zIndex': 9000
		}
	);

});
