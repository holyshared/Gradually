Gradually
===========

Gradually is an experimental slide show plug-in using the canvas element.

![Screenshot](http://url_to_project_screenshot)

It tells it in the beginning.

Please note that the explanation of this plug-in usage might be a strange content because I am not confident of English though it apologizes very much.

How to use
----------

A description necessary to use Gradually is as follows.

* First of all, the markup of the container element that applies Gradually and the image used is done.
   In the following cases, "gradually-container" becomes an image that around and "source" use for the container.

### HTML
	<div id="gradually-container" class="gradually">
	</div>

	<ul id="source" style="display: none;">
		<li><img title="image1 title" alt="image1 discription" src="images/demo1.jpg" width="650" height="275" /></li>
		<li><img title="image2 title" alt="image2 discription" src="images/demo2.jpg" width="650" height="275" /></li>
		<li><img title="image3 title" alt="image3 discription" src="images/demo1.jpg" width="650" height="275" /></li>
		<li><img title="image4 title" alt="image4 discription" src="images/demo2.jpg" width="650" height="275" /></li>
		<li><img title="image5 title" alt="image5 discription" src="images/demo1.jpg" width="650" height="275" /></li>
		<li><img title="image6 title" alt="image6 discription" src="images/demo2.jpg" width="650" height="275" /></li>
	</ul>

* Javascript is this time described when injuring with the mark with html and ending.
   "gradually-container", "source", and the option that was marked and put up ahead are specified for an argument.

### JavaScript
	var container = null, sources = null;
	var options = {
		'panelHeight': 55,
		'panelWidth': 65,
		'interval': 3000,
		'duration': 800,
		'zIndex': 9000
	};

	var container	= $("gradually-container");
	var sources		= $("source").getElements("li img");

	new Gradually(container, sources, options);


Options
-------

All options have default values assigned, hence are optional.

### Version 1.0

* **panelHeight**: (int) Height of divided panel.
* **panelWidth**: (int) Width of divided panel.
* **interval**: (int) Interval when image is switched.
* **duration**: (int) duration of animation.
* **zIndex**: (int) starting position of layer.
* **onStart**: When the slide show is begun, it is generated.
* **onPreload**: When reading the image is completed, it is generated.
* **onChange**: when the image changes, it is generated.
