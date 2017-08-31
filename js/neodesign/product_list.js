/**
 * �ɼǹ̸����� ��ũ��Ʈ
 * ���� html/js/product_list.js�� ����������3���� ����ϱ� ���� jqueryȭ ��Ŵ.
 * @auther duellist
 * @date 2011-06-16
 **/
var __option_preview_obj = {}; // �ɼ� �̸������ ��������
function mk_prd_option_preview(uid, e) {
    jQuery.ajax({
        type: 'POST',
        url: '/shop/product_data.ajax.html',
        dataType: 'html',
        data: {
            'branduid': uid,
            'type': 'option'
        },
        success: function(req) {
            jQuery('#MK_opt_preview').html(req);
            return false;
        },
        errer: function() {
            alert('�ɼ����� �������� ����');
        }
    });

    var _evt = e.currentTarget ? e.currentTarget : window.event.srcElement;
    var offset = ObjectPosition(_evt);
    __option_preview_obj = _evt;

    jQuery('#MK_opt_preview').css({
        'visibility': 'visible',
        'left': offset[0] + 'px',
        'top': offset[1] + 'px'
    });

    // window resize �̺�Ʈ �߻��� �ɼ� �̸����� ��ġ�� �ٽ� ����
    jQuery(window).resize(function() {
        var _offset = ObjectPosition(__option_preview_obj);
        jQuery('#MK_opt_preview').css({
            'left': _offset[0] + 'px',
            'top': _offset[1] + 'px'
        });
    });
}
function ObjectPosition(obj) {
    var curleft = 0;
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }

    // ��� ���Ķ����� �߰���
    if (jQuery('#wrap').css('marginLeft') == 'auto') {
        curleft -= jQuery('#wrap').offset().left;
    }

    return [curleft,curtop];
}

