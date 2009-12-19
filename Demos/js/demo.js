window.addEvent("domready", function() {

	new Gradually(
		$("container"),
		$("source").getElements("li img"), {
			'panelHeight': 55,
			'panelWidth': 65,
			'interval': 3000,
			'duration': 30,
			'zIndex': 9000
		}
	);

});
