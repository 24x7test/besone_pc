if (typeof shop_language == 'undefined') {
    var shop_language = 'kor';
}

function sizefilter(maxsize) {
    var obj = event.srcElement;

    if (obj.value.bytes() > maxsize) {
        if (shop_language == 'eng') {
            alert("You have exceeded the maximum length. Please check that you entered a maximum of " + maxsize/2 + " korean characters or " + maxsize + " english letters/numbers/signs.");
        } else {
            alert("��� ������ �ʰ��Ǿ����ϴ�.\n�ѹ� �� Ȯ�����ּ���\n" + "�ѱ۸�" + maxsize/2 + "�� �̳� Ȥ�� ����/����/��ȣ�� " + maxsize + "�� �̳����� �����մϴ�.");
        }
        obj.value = obj.value.cut(maxsize);
        obj.focus();
    }
}
function setCookieInfomation(name,value) {
    document.cookie = name + "=" + value + ";";
    //alert(document.cookie);
}
function getCookieInfomation(name) {
    var arg = name + "=";   //������ ��Ű ������ ��Ī
    var arg_len = arg.length;   //������ ��Ű ���� ��Ī�� ���� üũ
    var cookie_len = document.cookie.length;
    var cookie_size = document.cookie.bytes();  //���� ����� ��Ű�� ���� üũ (�ִ� 4096���� ���尡��)
    var i = 0;
    if(cookie_size > 4000) {
        alert(((shop_language == 'eng') ? "Please delete cookies in the options of your internet brower and try again" : "���ͳ� �ɼǿ��� ��Ű�� �����Ͻð� �ٽ� �õ����ּ���."));
        return overflow;
    }
    while(i < cookie_len) {
        var j = i + arg_len;    //�о�� �� ��Ī�� ���κ� ��ġ ����
        //�̸��� ��ġ�Ǵ� ��Ű ��Ī ã��
        if(document.cookie.substring(i, j) == arg) {
            return getCookieVal(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;    //����κ��� ��ġ�� ã�� +1�� �Ͽ� ���� �׸� ������ġ ����
        if(i == 0) break;
    }
    return null;
}
function getCookieVal(offset) {
    var endStr = document.cookie.indexOf (";", offset);     //offset(��Ī �� "=") ���� ���� ";" ǥ�ñ����� �� ��ġ ����
    if (endStr == -1)
        endStr = document.cookie.length;

    var val = document.cookie.substring(offset, endStr); 
    if (val == "") {
        val = null;
    }
    return val;
}
function delCookieInfomation(name, val) {
    if((val == null) || (val.length == 0)) {
        document.cookie = name + "=";
    } else {
        var next_val = "";
        var j = 0;      //ó�� �Է� ���� Ȯ���ϱ� ���� ���� �ʱ�ȭ
        var cookie_value = getCookieInfomation(name);
        var prdCode_len = 0;    //��ϵ� ��ǰ �ڵ� �迭 �μ� �ʱ�ȭ
        prdCode = new Array();  //�ĸ��� ���е� ��ǰ �ڵ带 �и��Ͽ� �����ϱ� ���� �迭 �ʱ�ȭ
        prdCode = cookie_value.split(","); 
        prdCode_len = prdCode.length;
        for(var i = 0; i < prdCode_len; i++) {
            if(prdCode[i] != val) {
                //�ߺ��Ǵ� �ڵ尡 �ƴ� ��� �ڵ� ���� 
                if(j == 0) {
                    next_val = prdCode[i];
                } else {
                    next_val = next_val + "," + prdCode[i];
                }
                j++;
            } else {
                //�ߺ��Ǵ� �ڵ尡 �´� ��� �ڵ� ó�� ���� j �� ó��
                //�Ʒ��� ��찡 ������ i �� 0 �� ���¿��� ó���� ��� �� ���� �� �տ� , �� ǥ�õȴ�.
                if(i == 0) {
                   j = 0;
                } 
            }
        }
        setCookieInfomation(name, next_val);
    }
    alert(((shop_language == 'eng') ? "Deleted." : "���� �Ǿ����ϴ�."));
}
function product_compare(productcd, max_prd) {
    //alert(document.cookie);
    var name = "prdComp";   //��Ű�� ����� �̸�
    if(!max_prd > 0) {
        max_prd = 4;    //�ִ� ����� �� ��ǰ ���� �Ѿ���� ���� ��� �⺻������ 4���� ����� �� �ִ�.
    }
    var cookie_value = getCookieInfomation(name);
    if(cookie_value == "overflow") {
        return;
    } else if(cookie_value == null) {
        setCookieInfomation(name, productcd);
        alert(((shop_language == 'eng') ? "You have selected the first product.\nPlease select a product to compare." : "ù��° ��ǰ�� �����ϼ̽��ϴ�.\n���� ��ǰ�� ������ �ּ���!"));
    } else {
        //��ϵ� ��ǰ�� ���� ��� ���� ��ǰ�ڵ尡 �ƴ� ��� �ڿ� �߰��Ѵ�.
        var prdCode_len = 0;    //��ϵ� ��ǰ �ڵ� �迭 �μ� �ʱ�ȭ
        var check = 0;      //��ϵǾ� �ִ� ��ǰ���� Ȯ���� ���� �� �ʱ�ȭ
        prdCode = new Array();  //�ĸ��� ���е� ��ǰ �ڵ带 �и��Ͽ� �����ϱ� ���� �迭 �ʱ�ȭ
        prdCode = cookie_value.split(",");
        prdCode_len = prdCode.length;
        for(var i = 0; i < prdCode_len; i++) {
            if(prdCode[i] == productcd) {
                //�̹� ����� �Ǿ� �ִ� ��ǰ�� ���

                // ��ǰ�� 2���̻� ����ִ� ��� - â�� �ѹ� �� ����?!
                if (prdCode_len > 1) {
                    var go_check = confirm(((shop_language == 'eng') ? 'This product code is already selected.\nPlease select a product to compare.' : '�̹� ��ϵǾ� �ִ� ��ǰ�ڵ� �Դϴ�.\n������ ��ǰ�� ���Ͻðڽ��ϱ�?'));
                    go_compare(go_check);
                } else {
                    alert(((shop_language == 'eng') ? "This product code is already selected." : "�̹� ��ϵǾ� �ִ� ��ǰ�ڵ� �Դϴ�."));
                    check = 0;
                }
                return;
            } else {
                //����� �Ǿ� ���� ���� ���
                check = 1;
            }
        }
        if(prdCode_len >= max_prd) {
            var over_code = confirm(((shop_language == 'eng') ? ("You can not compare more than " + max_prd + " products. Would you like to delete it?") : ("�񱳻�ǰ�� " + max_prd + "�� �̻� ����� �� �����ϴ�. ���� �����Ͻðڽ��ϱ�?")));
            if (over_code) {
                go_compare(over_code);
                return;
            } else {
                return;
            }
        }
        if(check) {
            productcd = cookie_value + "," + productcd;
            setCookieInfomation(name, productcd);
            var prdNum = prdCode_len + 1;
            var go_check = confirm(((shop_language == 'eng') ? ("You have selected the " + prdNum+ "th product.\nWould you like to compare products?") : (prdNum + "��° ��ǰ�� �����ϼ̽��ϴ�.\n������ ��ǰ�� ���Ͻðڽ��ϱ�?")));
            go_compare(go_check);
        }
    }
}
function delCompPrd(val) {
    var name = "prdComp";
    delCookieInfomation(name, val);
    location.reload();
}
function compare_imgcheck() {
    var obj = event.srcElement;
    var width = obj.width;
    if(width > 120) {
        obj.width="120";
    }
}
function go_compare(val) {
    if(val) {
        //location.href = "shopprdcompare.html";
        window.open("shopprdcompare.html","compare_prd","scrollbars=no,status=no,menubar=no,toolbar=no");
        return;
    } else {
        return;
    }
}
function go_url(url){
    opener.location.href=url;
}
String.prototype.cut = function(len) {
    var str = this;
    var l = 0;
    for (var i=0; i<str.length; i++) {
        l += (str.charCodeAt(i) > 128) ? 2 : 1;
        if (l > len) return str.substring(0,i);
    }
    return str;
}

String.prototype.bytes = function() {
    var str = this;
    var l = 0;
    for (var i=0; i<str.length; i++) l += (str.charCodeAt(i) > 128) ? 2 : 1;
    return l;
}





