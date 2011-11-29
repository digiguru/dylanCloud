DylanCloud.js
=============

An animated tag cloud for jQuery
--------------------------------

Tag Clouds look awsome, but none of the best jquery plugins are animated!

If only I could have a cloud that changes in realtime as my data changes.
Currently you would write code like this.

### js
    $("#wordcloud").jqCloud(GetData());
    $("#wordcloud").jqCloud(GetData());

The effect will look like this....

[Insert animated gif of jqCloud]

It should be like this....

### js
    $("#wordcloud").dylanCloud(GetData());
    $("#wordcloud").dylanCloud(GetData());

[Insert animated gif of dylanCloud]

Goal
----

The goal of this project is to have a simple jquery plugin that allows animated data in a Tag Cloud.

Features
--------

We have alot of options to keep you happy.

animationSpeed - default 250. Allows you to set a how fast the words move when the data has changed.
width / height - defaults to the width / height of the selected jquery element. The Dimensions for the cloud.
center.x / center.x - defaults to the center of the selected jquery element. The Center from where the words are placed.
weightFont - defaults to [0.1, 0.2, 0.4, 0.8, 1.2, 1.6, 2.2, 2.8, 3.6, 4.4]. The fontsize that will be applied to the different key elements in the tag cloud. There will only be a maximum of this number of keys.
weightFontType - defaults to em. The fontSize type that will be applied. Valid values are pt, %, px and of course the best one, EM!
hitTest - defaults to the function below. It allows you to specify a function to be called to check the hittest, but overlaps we think is the best!
        function(elem, other_elems){return $(elem).overlaps(other_elems);}
        
    
        defaults = {
          animationSpeed: 250,    //How fast the words move when they change size
          width: $this.width(),   //width of the wordcloud
          height: $this.height(), //height of the word cloud
          center: {               //Position from where words are drawn
            x: $this.width() / 2.0,
            y: $this.height() / 2.0
          },
          delayedMode: true,     //I don't think this one works actually - sorry //word_array.length > 50,
          nofollow: false,        //Applys "Nofollow" to the links (google bot style)
          weightFont: [0.1, 0.2, 0.4, 0.8, 1.2, 1.6, 2.2, 2.8, 3.6, 4.4],
                                  // A list of font sizes that will recieve an even distribution from the control.
          weightFontType: "em",    // Of course you want EM because it's the best :-|
          //weightFont: [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
          //weightFontType: "px"
          keySelector: null,      //Pass in a selector and jQuery will apply a key to the tagCloud
          keyFaderSpeed: 100,      //How fast the words fade in on the key
          hitTest: function(elem, other_elems){
            // Overlap detection provided by "Overlaps". Feel free to write your own and pass it in!
            return $(elem).overlaps(other_elems);
          }
        },


Future Plans
------------

+ Add in settings to automatically get the data from an ajax
+ Add in settings to automatically get data from a websocket connection
+ Make the plugin use MVVM library like Backbone or Knockout

Release History
---------------

### Version 1.0.1.0

Enhancement - combines tags that use the same name, adding the weight together.
EG

    {text:"Duplicate", weight:5},
    {text:"Example", weight:20},
    {text:"Duplicate", weight:10};
    
now gets interpereted as

    {text:"Duplicate", weight:15},
    {text:"Example", weight:20};

### Version 1.0.0.0

Bugfix - people should be able to use partial text for a tag, eg "More" and "or" as 2 separate tags would cause an infinate loop.

### Version 0.1.0.0

Animates the jQCloud.