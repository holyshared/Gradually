Gradually
===========

Gradually offers API, a slide show, and a thumbnail gallery using ImageDrawer.

![Screenshot](http://holyshared.github.com/Gradually/snapshot.png)

ImageDrawer is needed to use this library.
Please download it from the following site.

ImageDrawer Library
[http://mootools.net/forge/p/imagedrawer](http://mootools.net/forge/p/imagedrawer)



How to use
----------

### Gradually.js


#### Step1 Reading of library.

Please confirm whether imagedrawer is read in the beginning.
The script element is added in the head element, and the library is read.

	#HTML
	<script type="text/javascript" src="../Demos/js/libraries/image-drawer/ImageDrawer.js"></script>
	<script type="text/javascript" src="../Demos/js/libraries/image-drawer/ImageDrawer.Grid.js"></script>
	<script type="text/javascript" src="../Demos/js/libraries/image-drawer/ImageDrawer.Expand.js"></script>



#### Step2 HTML description of main.

HTML to use Gradually becomes as follows.

	#HTML
	<div id="gallery" class="gradually">
		<ul class="graduallyImages">
			<li><img title="image1 title" alt="image1 discription" src="../Demos/images/img_demo1.jpg" width="650" height="275" /></li>
			<li><img title="image2 title" alt="image2 discription" src="../Demos/images/img_demo2.jpg" width="650" height="275" /></li>
			<li><img title="image3 title" alt="image3 discription" src="../Demos/images/img_demo3.jpg" width="650" height="275" /></li>
			<li><img title="image4 title" alt="image4 discription" src="../Demos/images/img_demo4.jpg" width="650" height="275" /></li>
			<li><img title="image5 title" alt="image5 discription" src="../Demos/images/img_demo5.jpg" width="650" height="275" /></li>
			<li><img title="image6 title" alt="image6 discription" src="../Demos/images/img_demo6.jpg" width="650" height="275" /></li>
		</ul>
	</div>



#### Step3 Description of javascript.

When the description of HTML ends, the following describe javascript. 
ImageDrawer is made an instance, and it specifies it for the option of Gradually.

	#JS
	var drawer = new ImageDrawer.Grid({
		'gridHeight': 55,
		'gridWidth': 65,
		'interval': 70,
		'duration': 600,
		'transition': 'expo:in'
	});

	var container = document.id("gradually");
	var images = container.getElements(".graduallyImages li img");

	var gradually = new Gradually(container, {
		'images': images,
		'drawer': drawer, //Instance of ImageDrawer
		'onDrawStart': function(panel, drawer) {
			$("message").set("html", "drawStart");
		},
		'onDrawComplete': function(panel, drawer) {
			$("message").set("html", "drawComplete");
		}
	});
	gradually.start();

To switch the image, the set method is executed.

	#JS
	gradually.set(5); //It switches to the fifth image.



#### Options

* **drawer**: (object) - Instance of ImageDrawer.
* **images**: (array) - Image element to display.
* **zIndex**: (number) - The hierarchy and the default of the layer are 9000.
* **defaultIndex**: (number) - Image displayed first.
* **onPreload**: (function) - When preload of the image is completed, this event is generated.
* **onSelect**: (function) - When the image changes, it is generated. In the first argument, the number and the second argument in the selected image are the panel object.
* **onDrawStart**: (function) - When drawing of the image begins, it is generated. The first argument is a panel object, and the second argument is an instance of ImageDrawer.
* **onDrawComplete**: (function) - When drawing of the image is completed, it is generated. The first argument is a panel object, and the second argument is an instance of ImageDrawer.

##### Panel Object

* **width**: (number) - Width of image.
* **height**: (number) - Height of image.
* **title**: (string) - Title of image.
* **alt**: (string) - Additional information in image.
* **src**: (string) - Url of image.
* **image**: (element) - Image element.
* **canvas**: (element) - Canvas element.










### Gradually.Slideshow.js

#### Step1 Reading of library.

Please confirm whether imagedrawer is read in the beginning.
The script element is added in the head element, and the library is read.

	#HTML
	<script type="text/javascript" src="../Demos/js/libraries/image-drawer/ImageDrawer.js"></script>
	<script type="text/javascript" src="../Demos/js/libraries/image-drawer/ImageDrawer.Grid.js"></script>
	<script type="text/javascript" src="../Demos/js/libraries/image-drawer/ImageDrawer.Expand.js"></script>



#### Step2 HTML description of main.

HTML to use Gradually.Slideshow becomes as follows.

	#HTML
	<div id="gallery" class="gradually">
		<ul class="graduallyImages">
			<li><img title="image1 title" alt="image1 discription" src="../Demos/images/img_demo1.jpg" width="650" height="275" /></li>
			<li><img title="image2 title" alt="image2 discription" src="../Demos/images/img_demo2.jpg" width="650" height="275" /></li>
			<li><img title="image3 title" alt="image3 discription" src="../Demos/images/img_demo3.jpg" width="650" height="275" /></li>
			<li><img title="image4 title" alt="image4 discription" src="../Demos/images/img_demo4.jpg" width="650" height="275" /></li>
			<li><img title="image5 title" alt="image5 discription" src="../Demos/images/img_demo5.jpg" width="650" height="275" /></li>
			<li><img title="image6 title" alt="image6 discription" src="../Demos/images/img_demo6.jpg" width="650" height="275" /></li>
		</ul>
		<p class="titlebar">
			<strong class="title"></strong>
			<span class="current"></span>&nbsp;/&nbsp;<span class="total"></span>
		</p>
	</div>



#### Step3 Description of javascript.

When the description of HTML ends, the following describe javascript. 
ImageDrawer is made an instance, and it specifies it for the option of Gradually.Slideshow.

	#JS
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



#### Options

* **drawer**: (object) - Instance of ImageDrawer.
* **images**: (array) - Image element to display.
* **zIndex**: (number) - The hierarchy and the default of the layer are 9000.
* **interval**: (number) - Interval when image is switched.
* **titleClass**: (string) - Class of element that sets title of present image.
* **currentClass**: (string) - Class of element that sets present image number.
* **totalClass**: (string) - Class of element that sets the number of sheets of image.
* **onPreload**: (function) - When preload of the image is completed, this event is generated.
* **onSelect**: (function) - When the image changes, it is generated. In the first argument, the number and the second argument in the selected image are the panel object.
* **onDrawStart**: (function) - When drawing of the image begins, it is generated. The first argument is a panel object, and the second argument is an instance of ImageDrawer.
* **onDrawComplete**: (function) - When drawing of the image is completed, it is generated. The first argument is a panel object, and the second argument is an instance of ImageDrawer.










### Gradually.Gallery.js


#### Step1 Reading of library.

Please confirm whether imagedrawer is read in the beginning.
The script element is added in the head element, and the library is read.

	#HTML
	<script type="text/javascript" src="../Demos/js/libraries/image-drawer/ImageDrawer.js"></script>
	<script type="text/javascript" src="../Demos/js/libraries/image-drawer/ImageDrawer.Grid.js"></script>
	<script type="text/javascript" src="../Demos/js/libraries/image-drawer/ImageDrawer.Expand.js"></script>



#### Step2 HTML description of main.

HTML to use Gradually.Gallery.js becomes as follows.

	#HTML
	<div id="gallery" class="gradually">

		<div class="graduallyView">
			<ul class="graduallyImages">
				<li><img title="image1 title" alt="image1 discription" src="../Demos/images/img_demo1.jpg" width="650" height="275" /></li>
				<li><img title="image2 title" alt="image2 discription" src="../Demos/images/img_demo2.jpg" width="650" height="275" /></li>
				<li><img title="image3 title" alt="image3 discription" src="../Demos/images/img_demo3.jpg" width="650" height="275" /></li>
				<li><img title="image4 title" alt="image4 discription" src="../Demos/images/img_demo4.jpg" width="650" height="275" /></li>
				<li><img title="image5 title" alt="image5 discription" src="../Demos/images/img_demo5.jpg" width="650" height="275" /></li>
				<li><img title="image6 title" alt="image6 discription" src="../Demos/images/img_demo6.jpg" width="650" height="275" /></li>
				<li><img title="image7 title" alt="image7 discription" src="../Demos/images/img_demo7.jpg" width="650" height="275" /></li>
				<li><img title="image8 title" alt="image8 discription" src="../Demos/images/img_demo8.jpg" width="650" height="275" /></li>
				<li><img title="image9 title" alt="image9 discription" src="../Demos/images/img_demo9.jpg" width="650" height="275" /></li>
				<li><img title="image10 title" alt="image10 discription" src="../Demos/images/img_demo10.jpg" width="650" height="275" /></li>
				<li><img title="image11 title" alt="image11 discription" src="../Demos/images/img_demo11.jpg" width="650" height="275" /></li>
				<li><img title="image12 title" alt="image12 discription" src="../Demos/images/img_demo12.jpg" width="650" height="275" /></li>
			</ul>
			<p class="titlebar">
				<strong class="title"></strong>
				<span class="current"></span>&nbsp;/&nbsp;<span class="total"></span>
			</p>
		</div>


		<ul class="graduallyController">
			<li class="prev"><a title="prev" href="#">prev</a></li>
			<li>
				<ul class="graduallyThumbnails">
					<li><a href=""><img title="image1 title" alt="image1 discription" src="../Demos/images/img_demo1_thumb.jpg" /></a></li>
					<li><a href=""><img title="image2 title" alt="image2 discription" src="../Demos/images/img_demo2_thumb.jpg" /></a></li>
					<li><a href=""><img title="image3 title" alt="image3 discription" src="../Demos/images/img_demo3_thumb.jpg" /></a></li>
					<li><a href=""><img title="image4 title" alt="image4 discription" src="../Demos/images/img_demo4_thumb.jpg" /></a></li>
					<li><a href=""><img title="image5 title" alt="image5 discription" src="../Demos/images/img_demo5_thumb.jpg" /></a></li>
					<li><a href=""><img title="image6 title" alt="image6 discription" src="../Demos/images/img_demo6_thumb.jpg" /></a></li>
					<li><a href=""><img title="image7 title" alt="image7 discription" src="../Demos/images/img_demo7_thumb.jpg" /></a></li>
					<li><a href=""><img title="image8 title" alt="image8 discription" src="../Demos/images/img_demo8_thumb.jpg" /></a></li>
					<li><a href=""><img title="image9 title" alt="image9 discription" src="../Demos/images/img_demo9_thumb.jpg" /></a></li>
					<li><a href=""><img title="image10 title" alt="image10 discription" src="../Demos/images/img_demo10_thumb.jpg" /></a></li>
					<li><a href=""><img title="image11 title" alt="image11 discription" src="../Demos/images/img_demo11_thumb.jpg" /></a></li>
					<li><a href=""><img title="image12 title" alt="image12 discription" src="../Demos/images/img_demo12_thumb.jpg" /></a></li>
				</ul>
			</li>
			<li class="next"><a title="next" href="#">next</a></li>
		</ul>
	</div>



#### Step3 Description of javascript.

When the description of HTML ends, the following describe javascript. 
ImageDrawer is made an instance, and it specifies it for the option of Gradually.Gallery.

	#JS
	var drawer = new ImageDrawer.Expand({
		'slideWidth': 65,
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



#### Options

* **drawer**: (object) - Instance of ImageDrawer.
* **images**: (array) - Image element to display.
* **zIndex**: (number) - The hierarchy and the default of the layer are 9000.
* **titleClass**: (string) - Class of element that sets title of present image.
* **currentClass**: (string) - Class of element that sets present image number.
* **totalClass**: (string) - Class of element that sets the number of sheets of image.
* **controller**: (object) - Thumbnail controller's options.
* **onPreload**: (function) - When preload of the image is completed, this event is generated.
* **onSelect**: (function) - When the image changes, it is generated. In the first argument, the number and the second argument in the selected image are the panel object.
* **onDrawStart**: (function) - When drawing of the image begins, it is generated. The first argument is a panel object, and the second argument is an instance of ImageDrawer.
* **onDrawComplete**: (function) - When drawing of the image is completed, it is generated. The first argument is a panel object, and the second argument is an instance of ImageDrawer.



##### Thumbnail controller options

* **defaultIndex**: (number) - Image displayed first. Default is 0.
* **prepage**: (number) - Number of displayed thumbnail images. Default is 5.
* **controllerClass**: (string) - Thumbnail controller's class. Default is 'graduallyController'.
* **containerClass**: (string) - Class of thumbnail image. Default is 'graduallyThumbnails'.
* **prevClass**: (string) - Class of previous button. Default is 'prev'.
* **nextClass**: (string) - Class of previous button. Default is 'next'.
* **disableOpacity**: (number) - Transparencys other than current image. Default is 0.4.
