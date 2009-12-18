window.addEvent("domready", function() {

dbug.enable();
	
	//	var images = $("base").getElements("li img");
	new Gradually($("container"),  $("source"));
});
