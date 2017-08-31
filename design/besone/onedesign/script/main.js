jQuery(function($){


 var imgbannereFfect = function(element, options){
   var settings = $.extend({}, $.fn.imgbannereffect.defaults, options); //�ʹ� ���ð� ��������
     var vars = {
            currentSlide: 0,
			oldSlide: 0,
			startSlide: 0,
            currentImage: '',
			totaltab: 0,	
			currenttab: 0,	
			arrawidth:0,
			arrawidth2:0,
            totalSlides: 0,
	        randAnim: '',
            running: false,
            paused: false,
            stop: false
        };

       var slider = $(element);		
	    //�̹���������
	   
 	    slider.find('.vi').each(function() {
	       	
			  vars.totalSlides++;
		});    

 /*
 �����κ�
	vars.currentSlide = Math.floor(Math.random() * vars.totalSlides);
    vars.oldSlide = vars.currentSlide;
	
 */

    $(".bull[rel=" + vars.currentSlide + "]",slider).addClass("active");
    $(".vi[rel=" + vars.currentSlide + "]",slider).css({'z-index':20,opacity:1});
     

   
	 var timer = 0;
	timer = setInterval(function(){ imgeffectRun2(slider, settings, false); }, settings.pauseTime);




	var imgeffectRun2 = function(slider, settings, nudge){
       //Trigger the lastSlide callback
	     
            if(vars && (vars.currentSlide == vars.totalSlides - 1)){ 
				settings.lastSlide.call(this);
			}
            if((!vars || vars.stop) && !nudge) return false;
			settings.beforeChange.call(this);
			vars.currentSlide++;		
			
			if(vars.currentSlide == vars.totalSlides){ 
				vars.currentSlide = 0;
				settings.slideshowEnd.call(this);
			}
			
                $(".bull", slider).removeClass("active");
				$(".bull[rel=" + vars.currentSlide + "]", slider).addClass("active");
			
                 $('.vi[rel=' + vars.oldSlide + ']', slider).css({'z-index':1}).animate({opacity: 0}, settings.animSpeed);
                 $('.vi[rel=' + vars.currentSlide + ']', slider).css({'z-index':20}).animate({opacity: 1}, settings.animSpeed);
			

          vars.oldSlide = vars.currentSlide;
	}
   
   $(".bull", slider).click(function(){
	      vars.currentSlide = $(this).index() -1;
		imgeffectRun2(slider,  settings, false);
           
   });
   
     //��������
    slider.hover(function(){
                vars.paused = true;
                clearInterval(timer);
                timer = '';              

            }, function(){
                vars.paused = false;
				
                //Restart the timer
				if(timer == '' && !settings.manualAdvance){
					timer = setInterval(function(){   imgeffectRun2(slider,  settings, false);	}, settings.pauseTime);
				}
      });


 }

  
 $.fn.imgbannereffect = function(options) {
    //������ �ε�����
        return this.each(function(key, value){
            var element = $(this);
			
			 imgbannereFfect($(element), options);
        });

	};

//Default settings
	$.fn.imgbannereffect.defaults = {
		animSpeed: 600, //�̺�Ʈ �ӵ�
		pauseTime: 4000, //���ð�
		moveType: "left", //�̵�����
		tailType: "number", //��ưŸ��
		pauseOnHover: true,
		beforeChange: function(){},
		afterChange: function(){},
		slideshowEnd: function(){},
        lastSlide: function(){},
        afterLoad: function(){}
	};
	
	$.fn._reverse = [].reverse;

});







jQuery(function($){
		$(window).ready(function() {
			          	 $('#slideshow').imgbannereffect();
                            //$('#imageScroller').shopeffect();

		
		});
});


jQuery(function($){
		$(window).ready(function() {
			          	 $('#slideshow2').imgbannereffect();
                            //$('#imageScroller3').shopeffect();

		
		});
});
