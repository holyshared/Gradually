/*
---

script: moogressBar.js
version: 0.1
description: with moogressBar you can easily create a progress bar powered by mooTools
license: MIT-style
authors:
- Christopher Beloch

requires: 
  core:1.2.4: '*'

provides: [Moogressbar]

...
*/

var MoogressBar = new Class({
                     Implements: Options,
                     
                     options: {
                                 bgImage:     "/images/progressbar/blue.gif",  // What is the background-image?
                                 percentage:  0,  // Start at which percentage?
                                 height:      '10px',  // Height of the bar
                                 parent_el:   $('moogressBar'),  // Where to place?
                                 animation:   true,  // Want smooth animation filling the bar?
                                 animation_settings: {unit: '%', duration: 'normal'}
                              },
                     
                     initialize: function(options){
                         this.setOptions(options);
                         this.options.parent_el.setStyle('z-index','999');
                         
                         // Preload important Images
                         //var bgImageAsset = new Asset.image(this.options.bgImage);
                         
                         // Draw bar
                         this.theBar = new Element('div', {
                                                       'styles': {
                                                           'id': 'mcPercentage',
                                                           'display': 'block',
                                                           'width': this.options.percentage + '%',
                                                           'height': this.options.height,
                                                           'background-image': 'url(' + this.options.bgImage + ')'
                                                           // 'border-radius': '5px',
                                                           // '-webkit-border-radius': '5px',
                                                           // '-moz-border-radius': '5px'
                                                        }
                                                     });
                         // Will it be Animated?
                         if(this.options.animation)
                           this.animationFX = new Fx.Morph(this.theBar, this.options.animation_settings);
                         
                         // Place the bar element where it belongs to
                         this.options.parent_el.appendChild(this.theBar);
                     },
                     
                     // function to modify the percentage status
                     setPercentage: function(percentage){
                         if(this.options.animation)
                         {
                           this.animationFX.cancel();  // Somehow, MooTools is causing animation glitches while it is still in the previous animation so I cancel the last animation here
                           this.animationFX.start({'width': percentage});
                         }
                         else
                           this.theBar.setStyle('width', percentage + '%');
                         
                         // Fade out the parent element including the bar after the bar reaches 100%
                         if(percentage >= 100)
                         {
                           this.options.parent_el.fade('out');
                           this.options.parent_el.setStyle('display','none');
                         }
                     }
                 });