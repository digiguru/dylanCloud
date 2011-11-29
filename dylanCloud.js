/*
* dylanCloud Plugin for jQuery
*
* Version 1.0.1.0
*
* Copyright 2011, Adam Hall
* Licensed under the MIT license.
* Heavily inspired by jqCloud from Luca Ongaro
*
* Requires "overlaps.js"
*
* Date: Wed Nov 23 16:00:00 +0000 2011
*/

(function( $ ) {
  "use strict";
  $.fn.dylanCloud = function(word_array, options) {
    var $this = this,   
        defaults = {
          animationSpeed: 250,    //How fast the words move when they change size
          keyFaderSpeed: 100,      //How fast the words fade in on the key
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
          hitTest: function(elem, other_elems){
            // Overlap detection provided by "Overlaps". Feel free to write your own and pass it in!
            return $(elem).overlaps(other_elems);
          }
        },
        options = $.extend(defaults, options || {}),
        $key;
        
    //Setup the Key object if it exists.
    if (options.keySelector) {
      $key = $(options.keySelector);
    }
    
    // Add the "dylanCloud" class to the container for easy CSS styling
    $this.addClass("dylanCloud");
    
    //What happens when we draw?
    var draw = function() {

      var step = 2.0,
          already_placed_words = [],
          aspect_ratio = options.width / options.height,
          // Make sure every weight is a scaled number before sorting,
          // and find any existing elements for the words.
          // Store the selectors in a list to find anything that may have dropped out the cloud
          prepareWords = function() {
          //This will be a list of all the valid selectors on the stage
            var allSelectors = [];
            var tmpArray = [];
            for (var i = 0; i < word_array.length; i++) {
                //Need to check if this never duplicates another word
              //check to see if the selector already exists.
              //If it does merge the two array items, otherwise
              //add it to the list
              var tmpItem = word_array[i];
              var alreadyAdded = false;
              for (var j = 0; j < tmpArray.length; j++) {
                if(tmpArray[j].text === word_array[i].text) {
                  alreadyAdded = true;
                  tmpArray[j].weight += parseFloat(tmpItem.weight, 10)
                }
              }
              if(!alreadyAdded) {
                var mySelector = "li.dylanCloud" + encodeURI(word_array[i].text);
                tmpItem.weight = parseFloat(tmpItem.weight, 10);
                tmpItem.element = $this.find(mySelector);
                tmpArray.push(word_array[i]);
                allSelectors.push(mySelector);
              }
              
            }
            word_array = tmpArray;
            //Destroy all the words that no longer appear.
            $this.find(":not("+allSelectors.join(",")+")").remove();        

          }();//auto run prepareWords.
     
      // Sort word_array from the word with the highest weight to the one with the lowest
      word_array.sort(function(a, b) {
          if (a.weight < b.weight) {return 1;}
          else if (a.weight > b.weight) {return -1;}
          else {return 0;}
      });
       
        
      // Function to draw a word, by moving it in spiral until it finds a suitable empty place. This will be iterated on each word.
      var drawOneWord = function(index, word, nextCall) {
        var inner_html;
        
        // Linearly map the original weight to a discrete scale from 1 to 10
        word.scaledWeight =
          Math.round(
            (word.weight - word_array[word_array.length - 1].weight)
            /(word_array[0].weight - word_array[word_array.length - 1].weight)
            * (0.0 + options.weightFont.length - 1)
           ) + 1;
        word.scaledOpacity =
        (word.scaledWeight) / options.weightFont.length ;
        
        //Does the word already exist? If not create it            
        if (!(word.element && word.element[0])) {
           word.element = $('<li>').attr("class","dylanCloud" + encodeURI(word.text));//.attr('title', word.title || word.text || '');
          // Append link if word.url attribute was set
          if (!!word.url) {
            inner_html = $('<a>').attr('href', encodeURI(word.url).replace(/'/g, "%27")).text(word.text);
            // If nofollow: true set rel='nofollow'
            if (!!options.nofollow) {
              inner_html.attr("rel", "nofollow");
            }
          } else {
            inner_html = word.text;
          }
          word.element.append(inner_html);
          word.element.css("fontSize",options.weightFont[0] + options.weightFontType);
          $this.append(word.element);
        }
        //word.element.css("opacity",word.scaledOpacity);
        //word.element.addClass('w' + word.scaledWeight);
        
        word.element.data("opacity",word.scaledOpacity);
        updateWordPlacement(word, index, nextCall);
      };
      var updateWordPlacement = function(word, index, nextCall) {
        //cache variables for performance
        var width = word.element.width(),
            height = word.element.height(),
            absoluteCenterLeft = options.center.x - width / 2.0,
            absoluteCenterTop = options.center.y - height / 2.0,
            startLeft = absoluteCenterLeft,
            startTop = absoluteCenterTop,
            startFontSize = options.weightFont[0] + options.weightFontType,
            //angle = 6.28 * Math.random(),
            //radius = 0.0,
            startOpacity = word.element.css("opacity");
      if(!index == 0) {
        if(word.element[0].offsetLeft !== 0) {
         
            startLeft = word.element[0].offsetLeft;
            startTop = word.element[0].offsetTop;
          
        }
        }
        if(word.element.css("fontSize") !== 0 && word.element.css("fontSize") !== options.weightFont[0] + options.weightFontType) {
            startFontSize = word.element.css("fontSize");
        }
          
        word.element.css({
          position:"absolute",
          left : startLeft + "px",
          top : startTop + "px",
          fontSize : options.weightFont[word.scaledWeight - 1] + options.weightFontType
        });

        var placeWord = function() {
          var width = word.element.width(),
            height = word.element.height(),
            angle = 6.28 * Math.random(),
            radius = 0.0;
            
          while(options.hitTest(word.element[0], already_placed_words)) {
            radius += step;
            angle += (index % 2 === 0 ? 1 : -1)*step;
  
            word.animateLeft = options.center.x - (width / 2.0) + (radius*Math.cos(angle)) * aspect_ratio;
            word.animateTop = options.center.y + radius*Math.sin(angle) - (height / 2.0);
            
            word.element.css({
              left : Math.round(word.animateLeft) + "px",
              top : Math.round(word.animateTop) + "px"
            });
          }
        }(); //automatic call
        
        word.animateFont = options.weightFont[word.scaledWeight - 1] + options.weightFontType;
        word.animateOpacity = word.element.data("opacity");
        word.startLeft = startLeft;
        word.startTop = startTop;
        word.startFontSize = startFontSize;
        word.startOpacity = startOpacity;
        
        already_placed_words.push(word.element[0]);
        
        // Invoke callback if existing
        if ($.isFunction(word.callback)) {
          word.callback.call(word.element);
        }
        nextCall();
      }
      
      var drawOneWordDelayed = function(index) {
        index = index || 0;
        if (index < word_array.length) {
          drawOneWord(index, word_array[index], function(){drawOneWordDelayed(index + 1);});
        } else {
          
          var
              autoChange = true,
              prevWeight = 0,
              prevScaledWeight,
              clearKey = function() {
                $key.find("li").remove();//html("");
              }(),
              drawKeyAndAnimateWords = function() {
                for (var i = 0, l=word_array.length; i < l; i++) {
                  var word = word_array[i];
                  
                  word.element.css({
                    left : word.startLeft + "px",
                    top : word.startTop + "px",
                    fontSize : word.startFontSize,
                    opacity : word.startOpacity
                  });
                  if(prevScaledWeight !== word.scaledWeight) {
                    var myElement = word.element
                                    .clone()
                                    .css({left:"",top:"",position:"", fontSize:word.animateFont, opacity: word.animateOpacity});
                    if(prevWeight == 0) {
                      $key.append(myElement.html(word.weight + "+"));
                    } else {
                      $key.append(myElement
                        .html(word.weight + " to " + (prevWeight-1)));  
                    }
                    prevWeight = word.weight;
                    prevScaledWeight = word.scaledWeight;
                  }
                  
                  word.element.animate({
                    left: word.animateLeft,
                    top: word.animateTop,
                    fontSize: word.animateFont,
                    opacity: word.animateOpacity
                  }, options.animationSpeed);
                  
                }
              }(),
              
              bindEventsToKey= function() {
              
                $key.find("li").hover(
                  function(e){
                    if (autoChange) {
                      var myClass = $(this).attr("class");
                      $("#wordcloud li:not(." + myClass + ")").animate({"opacity": 0.2}, { queue: false, duration: options.keyFaderSpeed });
                      $("#wordcloud li." + myClass).animate({"opacity": 1},{ queue: false, duration:options.keyFaderSpeed  });
                    }
                  }
                ).click(
                  function(e){
                    autoChange = false;
                    var myClass = $(this).attr("class");
                    $("#wordcloud li:not(." + myClass + ")").animate({"opacity": 0.2},{ queue: false, duration:options.keyFaderSpeed  });
                    $("#wordcloud li." + myClass).animate({"opacity": 1},{ queue: false, duration:options.keyFaderSpeed  });
                  }
                );
              
                $key.mouseleave(
                  function(e){
                    if (autoChange) {
                      $("#wordcloud li").each(function(e){
                          $(this).animate({"opacity":$(this).data("opacity")},{ queue: false, duration: options.keyFaderSpeed  });
                      });
                    }
                  }
                );
              }();
              
          if ($.isFunction(options.callback)) {
            options.callback.call(this);
          }
          
          
        }
      };
      
      // Iterate drawOneWord on every word.
      //The way the iteration is done depends on the drawing mode
      //(delayedMode is true or false)
      if (options.delayedMode || options.delayed_mode){
        drawOneWordDelayed();
      } else {
        $.each(word_array, drawOneWord);
        if ($.isFunction(options.callback)) {
          options.callback.call(this);
        }
      }
    }();//Automatically run "Draw"
    return this;
  
  };
 
})(jQuery);