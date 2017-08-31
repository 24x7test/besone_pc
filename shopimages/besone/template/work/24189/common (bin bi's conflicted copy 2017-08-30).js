/* �޴� ��� ��� */

 (function($) {
$(function(){

// �߸޴� ���
$(".position li").hover(function(){

$(this).find("> .submenu").show();

},function(){
$(this).find("> .submenu").hide();
});

// ���� �޴� ���
$("#menu_all").hover(function(){

$(this).find("> #drop_menu").show('fast');

},function(){
$(this).find("> #drop_menu").hide();
});

// ������ ���� �ؽ�Ʈ
$("#top_icon li").hover(function(){

$(this).find("> .sub_txt").show();

},function(){
$(this).find("> .sub_txt").hide();
});


});

 })(jQuery);










/*���ã��*/
function bookmark(){
window.external.AddFavorite('www.besone.com','�����(besone)')
}










/* ȸ������ ������ �����̱� */

(function($) {

    $(window).ready(function() {
        function loop() {
            $('#joinpoint').animate ({ top: '+=4' }, 200) 
                .animate({ top: '-=4' }, 200)
                .animate({ top: '+=4' }, 200)
                .animate({ top: '-=4' }, 200)
                .animate({top:30}, 1000, function() {
                loop();
            });
        }
        loop();
    });

})(jQuery);










/* ��ũ�� Ÿ�� �̵� */

jQuery(document).ready(function($) {
        $(".scroll").click(function(event){            
                event.preventDefault();
                $('html,body').animate({scrollTop:$(this.hash).offset().top}, 500);
        });
});









/* ��ũ��ž */
/*
$(function(){
	$("#pageTop").click(function(){
		$('html,body').animate({scrollTop:$("#wrap").offset().top -40 }, 700); return false;
	});

});
*/


(function($){
	$(document).ready(function(){
		$(window).scroll(function(){ // ��ũ���� ���۵Ǿ�����
			var position = $(window).scrollTop(); //���� ��ũ�� ��ġ���� ����
			if (position > 100){ //���� ��ũ�� ��ġ�� 100���� �� �����������
				$("#pageTop").fadeIn(); //ž��ư���� ���°� �����ش�.
			}else{
				$("#pageTop").fadeOut(); //ž��ư���� ���°� ��������Ѵ�.
			}//end if
		});
		$("#pageTop a").click(function(){  //ž��ư�� Ŭ���Ұ��
			$("html, body").animate({scrollTop:0}, "fast(200)"); //�������� �ֻ������ �̵��Ѵ�. 
			return false;
		})
	});//end

})(jQuery)













/* �ѿ��� */

function na_restore_img_src(name, nsdoc)
{
  var img = eval((navigator.appName.indexOf('Netscape', 0) != -1) ? nsdoc+'.'+name : 'document.all.'+name);
  if (name == '')
    return;
  if (img && img.altsrc) {
    img.src    = img.altsrc;
    img.altsrc = null;
  } 
}

function na_preload_img()
{ 
  var img_list = na_preload_img.arguments;
  if (document.preloadlist == null) 
    document.preloadlist = new Array();
  var top = document.preloadlist.length;
  for (var i=0; i < img_list.length-1; i++) {
    document.preloadlist[top+i] = new Image;
    document.preloadlist[top+i].src = img_list[i+1];
  } 
}

function na_change_img_src(name, nsdoc, rpath, preload)
{ 
  var img = eval((navigator.appName.indexOf('Netscape', 0) != -1) ? nsdoc+'.'+name : 'document.all.'+name);
  if (name == '')
    return;
  if (img) {
    img.altsrc = img.src;
    img.src    = rpath;
  } 
}








 /* �׵θ� */

function bluring(){
if(event.srcElement.tagName=="A"||event.srcElement.tagName=="IMG") document.body.focus();
}
document.onfocusin=bluring;









