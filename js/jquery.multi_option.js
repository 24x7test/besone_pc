var StringBuffer = function() {
    this.buffer = new Array();
};

StringBuffer.prototype.append = function(str) {
    this.buffer[this.buffer.length] = str;
};

StringBuffer.prototype.toString = function() {
    return this.buffer.join('');
};

StringBuffer.prototype.shift = function() {
    return this.buffer.shift();
};

// ���ڰ� �ƴ� ���ڴ� ��� ����
String.prototype.numeric = function() {
    return parseInt(this.replace(/[^-0-9]/g, '') || 0, 10);
};
Number.prototype.numeric = function() {
    return this.toString().numeric();
};

// õ���� �޸� ���̱�
String.prototype.number_format = function() {
    return this.numeric().toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
};
Number.prototype.number_format = function() {
    return this.toString().number_format();
};

function object_count(obj) {
    var cnt = 0;
    for (var i in obj) {
        cnt++;
    }
    return cnt;
}

;(function($) {
    window.option_manager = {
        info: {
            min_amount: parseInt(min_amount), // �ּ� �ֹ� ����
            min_add_amount: parseInt(min_add_amount), // �ֹ� ���� ����
            max_amount : parseInt(max_amount), // �ִ� �ֹ� ����
            product_uid: product_uid, // ��ǰ uid
            product_name: product_name, // ��ǰ��
            product_price: product_price, // ��ǰ����
            option_type: option_type, // �ɼ� ����
            option_display_type: option_display_type, // �ɼ� ��� Ÿ��
            option_insert_mode: option_insert_mode, // ���� ������ ����� JSON ���
            json: optionJsonData, // ���� ������ ����� JSON ���
            type: null, // ���� ���õ� �ɼ��� Ÿ��
            is_mobile_use: is_mobile_use, // ����� ��� ����
            template_m_setid: template_m_setid, // ����� basic ��� ����
            display_addi_opt_name: display_addi_opt_name,    // ��ǰ�� �����ɼǸ� ǥ�� ����
            view_member_only_price : view_member_only_price // ȸ�����ݳ��� ����
        },
        data: {
            basic: [],
            addition: []
        },
        keys: {
            basic: [],
            addition: []
        },
        // return min amount
        get_min_amount: function(mode) {
            return mode.toLowerCase() == 'addition' ? 1 : this.info.min_amount;
        },
        // return min add amount
        get_min_add_amount: function(mode) {
            return mode.toLowerCase() == 'addition' ? 1 : this.info.min_add_amount;
        },

        // return max amount
        get_max_amount: function(mode) {
            return mode.toLowerCase() == 'addition' ? 2147483647 : this.info.max_amount;
        },
        // return useragent ios
        get_user_agent_ios: function() {
            var uagent = navigator.userAgent.toLocaleLowerCase();
            return (uagent.search("iphone") > -1 || uagent.search("ipod") > -1 || uagent.search("ipad") > -1);
        },
        // input box focus in action
        input_focus: function(obj) {
            if ($(obj).attr('title') == $(obj).val()) {
                $(obj).val('');
            }
            $(obj).blur(function() {
                if ($(obj).val().replace(/[\s]/g, '').length == 0) {
                    $(obj).val($(obj).attr('title'));
                }
            });
            return false;
        },
        // �ɼǰ� ���� ó��
        change_option: function(obj, option_mode, target) {
            var _this = this;
            var _info = this.info;
            var _json = this.info.json.basic;

            if (typeof shop_language == 'undefined') {
                var shop_language = 'kor';
            }
            if (option_manager.info.view_member_only_price == 'Y' && IS_LOGIN === 'false') {
                alert(((shop_language == 'eng') ? 'Member login required to buy.' : 'ȸ�� �α����� �Ͻø� �����Ͻ� �� �ֽ��ϴ�.'));    
                return;
            }
            // ���� ���õ� �ɼ��� Ÿ���� ������
            _info.type = $(obj).get(0).tagName.toLowerCase();

            // �ʼ� �ɼ� üũ
            if (obj.length > 1 && _this.check_mandatory(obj, $(obj).attr('label')) === false) {
                return false;
            } else if (obj.length == 1) {
                if (obj.selectedIndex == -1 ) {
                    obj.selectedIndex = 0;
                }
                return false;
            }

            // �ɼ� ���� ������� ó��
            if ($(obj).val().replace(/[\s]/g, '').length == 0) {
                return false;
            }

            var _option = $('[name="optionlist[]"].' + option_mode + '_option');
            var _idx = _option.index($(obj));
            var _last = _option.index(_option.filter(':last'));

            switch (option_mode) {
                case 'basic':
                    // ���� �ɼǵ��� �ɼǰ��� ������ �� �ɼ� ���� �߰���
                    _this.remove_option(_idx);
                    _this.append_option(_option, _idx + 1);

                    // �ɼ� ���� üũ
                    if (_this.check_quantity(obj, option_mode, 1) === false) {
                        return false;
                    }

                    if (this.info.option_insert_mode == 'auto' && _idx == _last) {
                        // �̹� �߰��� �ɼ��� ��� �ش� �ɼ� ���� ���� ��Ŀ�� �̵�
                        if (_this.set_data(_option, option_mode) === false) {
                            _this.this_option_reset(obj);
                        }
                    }
                    break;
                case 'addition':
                    // �ɼ� ���� üũ
                    if (_this.check_quantity(obj, option_mode, 1) === false) {
                        return false;
                    }

                    // �̹� �߰��� �ɼ��� ��� �ش� �ɼ� ���� ���� ��Ŀ�� �̵�
                    if (_this.set_data($(obj), option_mode) === false) {
                        _this.this_option_reset(obj);
                    }
                    break;
            }
            return false;
        },
        manual_option_insert: function() {
            this.set_data($('[name="optionlist[]"].basic_option'), 'basic');
            return false;
        },
        // ���� �ɼ� ���� Ȯ��
        use_child_option: function(idx, _opt_ids, _opt_values) {
            var _info = this.info;
            var _json = this.info.json.basic;
            var _count = 0;
            var _hcount = 0;
            $.each(_json[idx], function(_i, _d) {
                if (_d.opt_mix == 'Y' && _opt_ids == _d.opt_ids.substring(0, _opt_ids.length) && $.trim(_opt_values) + ',' == $.trim(_d.opt_values).substring(0, $.trim(_opt_values).length + 1)) {
                    if (_d.sto_state == 'HIDE') {
                        _hcount++;
                    }
                    _count++;
                }
            })
            return _count == _hcount ?  false : true;

        },
        // �ɼǰ� �߰�
        append_option: function(options, idx) {
            var _this = this;
            var _info = this.info;
            var _json = this.info.json.basic;
            var _option = new StringBuffer();
            if (_json[idx] !== undefined) {
                // ���� �ɼ��� �Է����̶�� option�� �߰��� �ʿ䰡 ����
                if (options.eq(idx).get(0).tagName.toLowerCase() == 'input') {
                    return false;
                }
                var _num = 0;
                var _add_price = '';
                $.each(_json[idx], function(_i, _d) {
                    if (_i == 0 && _d.opt_mandatory == 'N') {
                        _option.append('<option sto_id="0" price="0" title="' + get_lang('non_option_txt') + '" value="' + _num + '" style="color: #ff0000;">' + get_lang('non_option_txt') + '</option>');
                        _num++;
                    }
                    if (_info.option_display_type == 'EACH' && _d.opt_mix == 'Y') {
                        _add_price = '';
                        // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                        if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                            _add_price = '';
                        } else {
                            if (_d.sto_price > 0) {
                                _add_price = '(+' + (Math.abs(_d.sto_price)).number_format() + ')';
                            } else if (_d.sto_price < 0) {
                                _add_price = '(-' + (Math.abs(_d.sto_price)).number_format() + ')';
                            }
                        }
                        _option.append('<option matrix="" sto_id="' + _d.sto_id + '" price="' + _d.sto_price + '" title="' + _d.opt_values + '" value="' + _num + '">' + _d.opt_values + _add_price + '</option>\n');
                    } else {
                        var _value = _d.opt_value.split(',');
                        var _price = _d.opt_price.split(',');
                        var _matrix = _d.opt_matrix.split(',');
                        $.map(_value, function(_v, _k) {
                            if (_d.opt_mix == 'Y') {
                                _option.append('<option matrix="' + _matrix[_k] + '" sto_id="0" price="0" title="' + _v + '" value="' + _num + '">' + _v + '</option>\n');
                            } else {
                                chk = true;
                                if (_price[_k] == 0 && _v == get_lang('non_option_txt')) {
                                    chk = false;
                                } else if (parseInt(_price[_k]) != 0 && _v == get_lang('non_option_txt') && _d.opt_mandatory == 'N' && _d.opt_type != 'ADDITION') {
                                    _option.shift();
                                }

                                if (chk == true) {
                                    _add_price = '';
                                    // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                                    if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                                        _add_price = '';
                                    } else {
                                        if (_price[_k] > 0) {
                                            _add_price = '(+' + (Math.abs(_price[_k])).number_format() + ')';
                                        } else if (_price[_k] < 0) {
                                            _add_price = '(-' + (Math.abs(_price[_k])).number_format() + ')';
                                        }
                                    }
                                    _option.append('<option matrix="' + _matrix[_k] + '" sto_id="0" price="' + _price[_k] + '" title="' + _v + '" value="' + _num + '">' + _v + _add_price + '</option>\n');
                                }
                            }
                            _num++;
                        });
                    }
                    _num++;
                    // �ɼ� ��� ���°� �и����϶� ���յ� �ɼ��� ���
                    if (_info.option_display_type == 'EVERY' && _json[idx][0].opt_mix == 'Y') {
                        return false;
                    }
                });
                // �ϼ��� �ɼ��� �߰���
                $(options).eq(idx).children('option').not(':first').remove().end().end().append(_option.toString());

                // �ɼ��� ���¿� ���� �ؽ�Ʈ �߰�
                if (idx == options.index(options.filter('[opt_mix="Y"]:last'))) {
                    var _opt_id = [];
                    var _opt_value = [];
                    // ���� �ɼǵ��� ���õ� �ɼ��� opt_id, opt_value ���� ��Ƶ�
                    $.each(options, function(_i, _d) {
                        var _opt = $(this).children('option:selected');
                        if ($(this).attr('opt_mix') == 'Y' && _opt.text() != get_lang('non_option_txt') && _opt.val().length > 0) {
                            _opt_id.push($(this).attr('opt_id'));
                            _opt_value.push($(this).children('option:selected').attr('title'));
                        }
                    });

                    var _opt = null;
                    var _in_opt = false;
                    var _opt_ids = null;
                    $(options).eq(idx).children('option').not(':first').not('option:contains("' + get_lang('non_option_txt') + '")').each(function() {
                        _in_opt = false;
                        _opt = $(this); // ���� �ɼǰ�
                        // opt_id, opt_value ���� ���ս�Ŵ
                        _opt_ids = _opt_id.length > 0 ? _opt_id.join(',') + ',' + $(this).parents('select:first').attr('opt_id') : $(this).parents('select:first').attr('opt_id');
                        _opt_values = _opt_value.length > 0 ? _opt_value.join(',') + ',' + $(this).attr('title') : $(this).attr('title');
                        // json������ �ش� opt_ids, opt_value���� ã��
                        $.each(_json[idx], function(_i, _d) {
                            if (_opt_ids == _d.opt_ids && $.trim(_opt_values) == $.trim(_d.opt_values)) {
                                var _add_text = '';
                                var _add_price = '';
                                var _text = _opt.text();
                                var _is_unlimit = _d.sto_unlimit == 'Y' ? true : false;
                                 //�и����϶� ���� ���� �ɼ� ����
                                if (_d.sto_state == 'HIDE') {
                                    _opt.remove();
                                    return true;
                                }

                                // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                                if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                                    _add_price = '';
                                } else {
                                    // �и����� ��� �߰��ݾ��� �߰�����
                                    if (_d.sto_price > 0) {
                                        _add_price = '(+' + Math.abs(parseInt(_d.sto_price, 10)).number_format() + ')';
                                        _opt.attr('price', parseInt(_opt.attr('price')) + Math.abs(parseInt(_d.sto_price, 10)));
                                    } else if (_d.sto_price < 0) {
                                        _add_price = '(-' + Math.abs(parseInt(_d.sto_price, 10)).number_format() + ')';
                                        _opt.attr('price', parseInt(_opt.attr('price')) - Math.abs(parseInt(_d.sto_price, 10)));
                                    }
                                }
                                switch (_d.sto_state) {
                                    case 'HIDE': _add_text = ' - ' + get_lang('soldout_txt'); break;
                                    case 'SOLDOUT': _add_text = ' - ' + get_lang('soldout_txt'); break;
                                    case 'TEMPOUT': _add_text = ' - ' + get_lang('tempsoldout_txt'); break;
                                    case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                                    case 'SALE':
                                        if (_is_unlimit === true) {
                                            _add_text = '';
                                        } else if (_d.sto_stop_use == 'Y' && (_d.sto_real_stock - _d.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                            _add_text = ' - ' + get_lang('soldout_txt');
                                        }

                                        if (option_stock_display != 'NO' && _add_text.length == 0) {
                                            if (_d.sto_stop_use == 'Y') {
                                                _add_text = ' - (' + get_lang('stock_title') + ' : ' + Math.max(0, _d.sto_real_stock - _d.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                            } else {
                                                /*
                                                if (_d.sto_real_stock < 0) {
                                                    _is_unlimit = true;
                                                } else {
                                                    _add_text = ' - (' + get_lang('stock_title') + ' : ' + _d.sto_real_stock + ' ' + get_lang('stock_unit') + ')';
                                                }
                                                */
                                                _is_unlimit = true;
                                            }
                                            if (_is_unlimit === true) {
                                                if (option_stock_display == 'DISPLAY') {
                                                    _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                                }
                                                if (option_stock_display == 'LIMIT') {
                                                    _add_text = '';
                                                }
                                            }
                                        }
                                        break;
                                }
                                if (typeof option_note_display != 'undefined' && option_note_display == 'DISPLAY' && _d.sto_note.length > 0) {
                                    _add_text += '(' + _d.sto_note.substr(0, 20) + ')';
                                }
                                _in_opt = true;
                                _opt.text(_text + _add_price + _add_text);
                            }
                        })
                        // �и����� ��� ���յ��� ���� �ɼ��� �����Ҽ� ���� �ش� �ɼ��� ǰ�� ó��
                        if (_in_opt === false) { _opt.remove(); }
                    });
                    //�и����϶� ������� �ɼ� ���Ž� ���õǾ��� �ɼǰ��� �ʱ�ȭ
                    if ($(options).eq(idx).children('option').not('[value=""]').length <= 0) {
                        alert(get_lang('empty_option'));
                        $('[name="optionlist[]"]').val('');
                        $(options).eq(0).focus();
                        return false;

                    }
                } else {
                    var _opt_id = [];
                    var _opt_value = [];
                    // ���� �ɼǵ��� ���õ� �ɼ��� opt_id, opt_value ���� ��Ƶ�
                    $.each(options, function(_i, _d) {
                        var _opt = $(this).children('option:selected');
                        if ($(this).attr('opt_mix') == 'Y' && _opt.text() != get_lang('non_option_txt') && _opt.val().length > 0) {
                            _opt_id.push($(this).attr('opt_id'));
                            _opt_value.push($(this).children('option:selected').attr('title'));
                        }
                    });

                    var _opt = null;
                    var _opt_ids = null;
                    $(options).eq(idx).children('option').not(':first').not('option:contains("' + get_lang('non_option_txt') + '")').each(function() {
                        _opt = $(this); // ���� �ɼǰ�
                        // opt_id, opt_value ���� ���ս�Ŵ
                        _opt_ids = _opt_id.length > 0 ? _opt_id.join(',') + ',' + $(this).parents('select:first').attr('opt_id') : $(this).parents('select:first').attr('opt_id');
                        _opt_values = _opt_value.length > 0 ? _opt_value.join(',') + ',' + $(this).attr('title') : $(this).attr('title');
                        if ($(this).parents('select:first').attr('opt_mix') == 'Y' && _this.use_child_option(idx, _opt_ids, _opt_values) === false) {
                            _opt.remove();
                        }
                    });
                }
            }
            return false;
        },
        // �ɼǰ� ����
        remove_option: function(idx) {
            $.each($('[name="optionlist[]"].basic_option'), function(_i, _d) {
                if (idx < _i) {
                    $(this).children('option').not(':first').remove();
                }
            });
        },
        // �ɼǰ� ����
        reset_option: function(option_mode) {
            var _option = $('[name="optionlist[]"].' + option_mode + '_option');
            $.each(_option, function(_i, _d) {
                if ($(this).get(0).tagName.toLowerCase() == 'input') {
                    $(this).val($(this).attr('title'));
                } else {
                    $(this).val('');
                    if (_i > 0 && option_mode == 'basic') {
                        $(this).children('option').not(':first').remove();
                    }
                }
            });
            return false;
        },
        // �ɼ� �ʼ� �Է�/���� üũ
        check_mandatory: function(obj, label) {
            var _text = $(obj).get(0).tagName.toLowerCase() == 'input' ? get_lang('enter') : get_lang('select');
            var _label = label !== undefined ? get_lang('option_label', label) : '';
            if ($(obj).attr('require') == 'Y' && ($(obj).val().replace(/[\s]/g, '').length == 0 || $(obj).attr('title') == $(obj).val())) {
                alert(get_lang('require_option', _label, _text));
                return false;
            }
            return true;
        },
        // �ɼ� ���� üũ
        check_quantity: function(obj, option_mode, stock, keys) {
            var _this = this;
            var _info = this.info;
            var _option = $('[name="optionlist[]"].' + option_mode + '_option');
            var _idx = _option.index($(obj));
            var _sto_id = null;
            var _sto_state = null;
            var _sto_unlimit = null;
            var _sto_real_stock = 0;
            var _sto_stop_use = null;
            var _sto_stop_stock = null;
            var _quantity_state = true; // �ɼ� ���� ���� ��
            var _quantity_mode = (obj.tagName !== undefined);

            if (_quantity_mode === true) {
                if (option_mode == 'basic') {
                    switch (_info.option_display_type) {
                        case 'EACH':
                            if (_info.json[option_mode][_idx][0].opt_mix == 'Y') {
                                _sto_id = _info.json[option_mode][_idx][$(obj).val()].sto_id;
                                _sto_state = _info.json[option_mode][_idx][$(obj).val()].sto_state;
                                _sto_unlimit = _info.json[option_mode][_idx][$(obj).val()].sto_unlimit;
                                _sto_real_stock = _info.json[option_mode][_idx][$(obj).val()].sto_real_stock;
                                _sto_stop_use = _info.json[option_mode][_idx][$(obj).val()].sto_stop_use;
                                _sto_stop_stock = _info.json[option_mode][_idx][$(obj).val()].sto_stop_stock;
                            }
                            break;
                        case 'EVERY':
                            var _opt_id = [];
                            var _value = [];
                            $.each(_option, function(_i, _d) {
                                var _key = $(this).children('option:selected').val();
                                if (_info.json[option_mode][_i][0].opt_mix == 'Y' && _key !== undefined && _key.length > 0) {
                                    if (_info.json[option_mode][_i][_key] === undefined) {
                                        _opt_id.push(0);
                                    } else {
                                        _opt_id.push(_info.json[option_mode][_i][_key].opt_id);
                                    }
                                    _value.push(_info.json[option_mode][_i][0].opt_value.split(',')[_key]);
                                }
                            });

                            $.each(_info.json[option_mode][_idx], function(_i, _d) {
                                if (_d.opt_ids == _opt_id.join(',') && _d.opt_values == _value.join(',')) {
                                    _sto_id = _d.sto_id;
                                    _sto_state = _d.sto_state;
                                    _sto_unlimit = _d.sto_unlimit;
                                    _sto_real_stock = _d.sto_real_stock;
                                    _sto_stop_use = _d.sto_stop_use;
                                    _sto_stop_stock = _d.sto_stop_stock;
                                }
                            });
                            break;
                    }
                } else {
                    if ($.isEmptyObject(_info.json[option_mode][_idx]) === false) {
                        _sto_id = _info.json[option_mode][_idx][$(obj).val()].sto_id;
                        _sto_state = _info.json[option_mode][_idx][$(obj).val()].sto_state;
                        _sto_unlimit = _info.json[option_mode][_idx][$(obj).val()].sto_unlimit;
                        _sto_real_stock = _info.json[option_mode][_idx][$(obj).val()].sto_real_stock;
                        _sto_stop_use = _info.json[option_mode][_idx][$(obj).val()].sto_stop_use;
                        _sto_stop_stock = _info.json[option_mode][_idx][$(obj).val()].sto_stop_stock;
                    }
                }
            } else {
                switch (_info.option_display_type) {
                    case 'EACH':
                        $.each(_info.json[option_mode], function(idx, data) {
                            if (_sto_real_stock > 0) {return false;}
                            $.each(data, function(key, value) {
                                if (obj.opt_id == value.opt_ids && obj.opt_value == value.opt_values) {
                                    _sto_unlimit = value.sto_unlimit;
                                    _sto_real_stock = value.sto_real_stock;
                                    _sto_stop_use = value.sto_stop_use;
                                    _sto_stop_stock = value.sto_stop_stock;
                                    return false;
                                }
                            });
                        });
                        _sto_id = obj.sto_id;
                        _sto_state = obj.sto_state;
                        break;
                    case 'EVERY':
                        var _opt_id = [];
                        var _value = [];
                        var _k = this.keys[option_mode][keys].split(':');
                        $.each(this.data[option_mode][keys], function(_i, _d) {
                            var _key = $.inArray(_d.opt_value, _info.json[option_mode][_k[0]][0].opt_value.split(','));
                            if (_info.json[option_mode][_k[0]][0].opt_mix == 'Y' && _key >= 0) {
                                _opt_id.push(_info.json[option_mode][_k[0]][_key].opt_id);
                                _value.push(_info.json[option_mode][_k[0]][0].opt_value.split(',')[_key]);
                            }
                        });

                        var _break = null;
                        $.each(_info.json[option_mode], function(idx, data) {
                            $.each(data, function(_i, _d) {
                                if (_d.opt_ids == _opt_id.join(',') && _d.opt_values == _value.join(',')) {
                                    _sto_id = _d.sto_id;
                                    _sto_state = _d.sto_state;
                                    _sto_unlimit = _d.sto_unlimit;
                                    _sto_real_stock = _d.sto_real_stock;
                                    _sto_stop_use = _d.sto_stop_use;
                                    _sto_stop_stock = _d.sto_stop_stock;
                                    _break = false;
                                    return false;
                                }
                            });
                            if (_break === false) {
                                return false;
                            }
                        });
                        break;
                }
            }

            if (_info.option_type == 'NO') {
                var _json = _info.json.basic[0][0];
                _sto_id = _json.sto_id;
                _sto_state = _json.sto_state;
                _sto_unlimit = _json.sto_unlimit;
                _sto_real_stock = _json.sto_real_stock;
                _sto_stop_use = _json.sto_stop_use;
                _sto_stop_stock = _json.sto_stop_stock;
            }

            if (_sto_id !== null && _sto_id > 0) {
                // ���� ���õ� �ɼ��� ����
                var _select_stock = 0;
                var _select_reset = false;
                $.each(this.data[option_mode], function(idx, data) {
                    // ���� ������ �����ϰ� �ִ� Ű�� ��� �հ迡 ���Ե��� ����
                    if (data === undefined || idx == keys) {return true;}
                    $.each(data, function(key, value) {
                        if (_sto_id == value.sto_id) {
                            _select_stock += value.opt_stock.numeric();
                            return false;
                        }
                    });
                });
                _select_stock += stock.numeric();

                switch (_sto_state) {
                    case 'SOLDOUT':
                    case 'TEMPOUT':
                    case 'HIDE':
                        var _txt = '';
                        if (_sto_state == 'TEMPOUT') { _txt = get_lang('temporary'); } // �Ͻ� ǰ���� ��� '�Ͻ�' �޽��� �߰�
                        if (_info.option_type == 'NO') {
                            alert(get_lang('selected_product_soldout', _txt));
                        } else {
                            alert(get_lang('selected_option_soldout', _txt));
                        }
                        _select_reset = true;
                        $(obj).val('').focus();
                        this.remove_option(_idx);
                        _quantity_state = false;
                        break;
                    default:
                        if (_sto_unlimit == 'N') {
                            if (_sto_stop_use == 'Y') {
                                if ((_sto_real_stock - _sto_stop_stock) <= 0) {
                                    alert(get_lang('selected_option_soldout', ''));
                                    _select_reset = true;
                                    $(obj).val('').focus();
                                    this.remove_option(_idx);
                                    _quantity_state = false;
                                } else if ((_sto_real_stock - _sto_stop_stock) < _select_stock) {
                                    alert(get_lang('selected_option_lower_quantity'));
                                    if (_quantity_mode === true) {
                                        $(obj).val('').focus();
                                        _select_reset = true;
                                    }
                                    _quantity_state = false;
                                }
                            } else {
                                /*
                                if (_sto_real_stock < _select_stock) {
                                    alert(get_lang('selected_option_lower_quantity'));
                                    if (_quantity_mode === true) {
                                        $(obj).val('').focus();
                                    }
                                    _quantity_state = false;
                                }
                                */
                            }
                        }
                        break;
                }
            }
            if (this.get_user_agent_ios() == true && _select_reset == true) {
                _this.this_option_reset(obj);
            }

            return _quantity_state;
        },
        // �ɼ� ������ üũ
        check_data: function() {
            var _this = this;
            var _state = true;
            var _basic_mandatory = [];
            var _addition_mandatory = [];
            var _basic_option = $('[name="optionlist[]"].basic_option');
            var _addition_option = $('[name="optionlist[]"].addition_option');

            // �⺻ �ɼ� ���� ���� üũ
            $.each(_basic_option, function(_i, _d) {
                if ($(this).attr('require') == 'Y' && ($(this).val().length == 0 || $(this).val() == $(this).attr('title'))) {
                    var _in_key = false;
                    $.map(_this.keys.basic, function(_v, _k) {
                        if (_v === undefined) {return true;}
                        $.map(_v.split('|'), function(_value) {
                            if (_value.split(':')[0] == _i) {
                                _in_key = true;
                            }
                        });
                    });

                    if (_in_key === false) {
                        var _text = $(this).get(0).tagName.toLowerCase() == 'input' ? get_lang('enter') : get_lang('select');
                        alert(get_lang('require_option2', $(this).attr('label'),  _text));
                        $(this).focus();
                        _state = false;
                        return false;
                    }
                }
            });

            // �⺻ �ɼǺ��� ���õ��� �ʾҴٸ� ������
            if (_state === false) {
                return _state;
            }

            // ���� �ɼ� ���� ���� üũ
            $.each(_addition_option, function(_i, _d) {
                if ($(this).attr('require') == 'Y' && $(this).val().length == 0) {
                    var _in_key = false;
                    $.map(_this.keys.addition, function(_v, _k) {
                        if (_v.split(':')[0] == _i) {
                            _in_key = true;
                        }
                    });

                    if (_in_key === false) {
                        alert(get_lang('require_option2', $(this).attr('label'), get_lang('select')));
                        $(this).focus();
                        _state = false;
                        return false;
                    }
                }
            });
            return _state;
        },
        // �ɼ� ������ �߰�
        set_data: function(options, option_mode) {
            var _this = this;
            var _info = this.info;
            var _data = [];
            var _keys = [];

            // �ɼ� ������ ����
            var _check_mandatory = true;
            $.each(options, function(_i, _d) {
                if ($(this).attr('require') == 'Y') {
                    // �ʼ� �ɼ� üũ
                    if (_this.check_mandatory($(this), $(this).attr('label')) === false) {
                        _check_mandatory = false;
                        return false;
                    }
                } else {
                    // ���� �ɼ� üũ
                    // ���ÿɼ� �̼��ý� '���þ���' �ڵ� ����
                    // �Է¿ɼ� ���Է½� '�Է¾���' �ڵ� �Է�
                    if ($(this).get(0).tagName.toLowerCase() == 'select' && ($(this).children('option:selected').val().length == 0 || $(this).attr('title') == $(this).val())) {
                        if ($(this).children('option[title="���þ���"]').length > 0) {
                            $(this).children('option[title="���þ���"]').attr('selected', true).change();
                        } else {
                            $(this).children('option:eq(1)').attr('selected', true).change();
                        }
                    } else if ($(this).get(0).tagName.toLowerCase() == 'input' && ($(this).val().length == 0 || $(this).attr('title') == $(this).val())) {
                        $(this).val(get_lang('no_input_txt'));
                    }
                }

                _keys.push($('[name="optionlist[]"].' + option_mode + '_option').index($(this)) + ':' + $(_d).val());
                if ($(_d).get(0).tagName.toLowerCase() == 'input') {
                    _data.push({
                        opt_id: $(_d).attr('opt_id') || '0',
                        opt_type: $(_d).attr('opt_type') || '0',
                        opt_value: $(_d).val(),
                        opt_stock: _this.get_min_amount(option_mode),
                        opt_price: '0',
                        sto_id: $(_d).attr('sto_id') || '0'
                    });
                } else {
                    _data.push({
                        opt_id: $(_d).attr('opt_id') || '0',
                        opt_type: $(_d).attr('opt_type') || '0',
                        opt_name: $(_d).attr('label'),
                        opt_value: $(_d).children('option:selected').attr('title'),
                        opt_stock: _this.get_min_amount(option_mode),
                        opt_price: $(_d).children('option:selected').attr('price') || '0',
                        sto_id: $(_d).children('option:selected').attr('sto_id') || '0'
                    });
                }
            });
            _keys = _keys.join('|');

            // �ʼ� üũ�� ���õ��� �ʾ��� ��� ����
            if (_check_mandatory === false) {return false;}

            // �ɼ� �ߺ� üũ
            if ($.inArray(_keys, _this.keys[option_mode]) >= 0) {
                alert(get_lang('option_added'));
                return false;
            }

            // �ɼ� ������ �߰�
            _this.keys[option_mode].push(_keys);
            _this.data[option_mode].push(_data);

            _this.set_multi_option(_data, _keys, option_mode);
            if (this.get_user_agent_ios() == true) {
                setTimeout(function() { _this.reset_option(option_mode); }, 10);
            } else {
                _this.reset_option(option_mode);
            }
            return true;
        },
        // �ɼ� ������ ����
        unset_data: function(idx, option_mode) {
            delete this.keys[option_mode][idx];
            delete this.data[option_mode][idx];
            return false;
        },
        set_stock: function(obj, stock) {
            if (obj === undefined) {return false;}
            $.each(obj, function(_i, _d) {
                _d.opt_stock = stock;
            });
        },
        // �ɼ� ���� ���� ó��
        set_amount: function(obj, option_mode, mode) {
            var _this = this;
            var _obj = typeof obj === 'string' ? $('#' + obj) : $(obj);
            var _idx = typeof obj === 'string' ? obj.replace('MS_amount_' + option_mode + '_', '') : $(obj).attr('id').replace('MS_amount_' + option_mode + '_', '');
            var _option_amount = $(_obj).filter('input.' + option_mode + '_option');
            var _amount = _obj.val().numeric();
            var _keys = $.inArray($('#MS_keys_' + option_mode + '_' + _idx).val(), this.keys[option_mode]);

            if (_amount.length == 0) {
                alert(get_lang('quantity_numbers'));
                _this.set_stock(_this.data[option_mode][_keys], this.get_min_amount(option_mode));
                _obj.val(this.get_min_amount(option_mode));
                return false;
            }

            if(_amount == 0) {
               _amount = '';
            }

            // ��ǰ �ּҼ��� ������ �ּҼ����� ���� (�ּҼ�����������ŭ ����/����) ó��
            if (this.get_min_add_amount(option_mode) != 1 && (_amount % this.get_min_add_amount(option_mode)) != 0) {
                _amount = this.get_min_add_amount(option_mode) * Math.floor(_amount / this.get_min_add_amount(option_mode));
                if (_amount == 0) {
                    _amount = this.get_min_add_amount(option_mode);
                }
            }

            // ���������� �� ����
            switch (mode) {
                case 'up': _amount += this.get_min_add_amount(option_mode); break;
                case 'down': _amount -= this.get_min_add_amount(option_mode); break;
            }

            if (_amount < this.get_min_amount(option_mode)) {
                alert(get_lang('min_amount', this.get_min_amount(option_mode)));
                _this.set_stock(_this.data[option_mode][_keys], this.get_min_amount(option_mode));
                _obj.val(this.get_min_amount(option_mode));
                _this.sum_total_price();
                return false;
            }
            
            if (_amount.length != 0 && _amount < 1) {
                alert(get_lang('min_amount2', this.get_min_amount(option_mode)));
                _this.set_stock(_this.data[option_mode][_keys], this.get_min_amount(option_mode));
                _obj.val(this.get_min_amount(option_mode));
                _this.sum_total_price();
                return false;
            }

            if (_amount > this.get_max_amount(option_mode)) {
                alert(get_lang('max_amount', this.get_max_amount(option_mode)));
                _this.set_stock(_this.data[option_mode][_keys], this.get_max_amount(option_mode));
                _obj.val(this.get_max_amount(option_mode));
                _this.sum_total_price();
                return false;
            }
            

            var _stock_state = true;
            $.each(_this.data[option_mode][_keys], function(key, value) {
                if (_this.check_quantity(value, option_mode, _amount, _keys) === false) {
                    _stock_state = false;
                    return false;
                }
            });
            // ������ �����Ҽ� ���� ��쿣 ���⼭ ����
            if (_stock_state === false) {
                if (mode === undefined) {
                    _this.set_stock(_this.data[option_mode][_keys], this.get_min_amount(option_mode));
                    _obj.val(this.get_min_amount(option_mode));
                    _this.sum_price(_idx, option_mode, this.get_min_amount(option_mode));
                }
                return false;
            }

            _this.set_stock(_this.data[option_mode][_keys], _amount.toString());
            _obj.val(_amount);
            _this.sum_price(_idx, option_mode, _amount);
        },
        // �ɼ� ���� ���
        sum_price: function(idx, option_mode, amount) {
            var _price = option_mode == 'basic' ? this.info.product_price.numeric() : 0;
            var _single_price = 0;
            var _data = this.data[option_mode][idx];
            $.map(_data, function(_d, _i) {
                if (_d.opt_type == 'SINGLE') {
                    // ���Ϻΰ�
                    _single_price += _d.opt_price.numeric();
                } else {
                    // �ߺ��ΰ�
                    _price += _d.opt_price.numeric();
                }
            });

            // �ش� �ɼ��� ������ ����Ͽ� �߰��� �ɼǿ����� �����
            $('#MK_p_price_' + option_mode + '_' + idx).text(((_price * amount) + _single_price).number_format());
            this.sum_total_price();
        },
        // �ɼ� �Ѱ��� ���
        sum_total_price: function() {
            var _product_price = this.info.product_price.numeric();
            var _basic_price = 0;
            var _basic_single_price = 0;
            var _addition_price = 0;
            var _option_price = 0;
            var _stock = 1;
            // �⺻�ɼ� �Ѱ��� ���
            $.map(this.data.basic, function(data, idx) {
                if (data !== undefined) {
                    var _price = 0;
                    var _single_price = 0;
                    $.map(data, function(_d, _i) {
                        if (_i == 0) {
                            // ������ 0 �ε��� �迭�� ���� �ֱ� ������ ���� ���
                            _stock = _d.opt_stock.numeric();
                        }
                        if (_d.opt_type == 'SINGLE') {
                            // ���Ϻΰ�
                            _single_price += _d.opt_price.numeric();
                        } else {
                            // �ߺ��ΰ�
                            _price += _d.opt_price.numeric();
                        }
                    });
                    _basic_price += ((_product_price + _price) * _stock) + _single_price;
                }
            });

            // �����ɼ� �Ѱ��� ���
            $.map(this.data.addition, function(data, idx) {
                if (data !== undefined) {
                    $.map(data, function(_d, _i) {
                        _addition_price += _d.opt_price.numeric() * _d.opt_stock.numeric();
                    });
                }
            });
            // �⺻�ɼ�, �����ɼ� ������ ���� ����� ���ɼ��� �ֱ⿡ ���� �������
            // option_type == 'NO' �� ��� ������ ���� �ٸ�
            if (this.info.option_type == 'NO') {
                _option_price = (_product_price * _stock).numeric();
            } else {
                _option_price = _basic_price.numeric() + _addition_price.numeric();
            }
            $('#MK_p_total').text(_option_price.number_format());
        },
        // ��Ƽ�ɼ� ��� �߰�
        set_multi_option: function(data, keys, option_mode) {
            var _value = [];
            var _price = option_mode == 'basic' ? this.info.product_price.numeric() : 0;
            var _price_single = 0; // ���Ϻΰ� �ɼ� ����
            var _stock = this.get_min_amount(option_mode);
            var _opt_name = '';
            $.map(data, function(_d, _i) {
                _value.push(_d.opt_value);
                _stock = _d.opt_stock;
                if (_d.opt_name) { _opt_name = _d.opt_name; }
                if (_d.opt_type == 'SINGLE') {
                    _price_single += _d.opt_price.numeric();
                } else {
                    _price += _d.opt_price.numeric();
                }
            });

            // ���� (�ߺ��ΰ� �ɼǰ��� x ����) + ���Ϻΰ� �ɼǰ���
            _price = (_price * _stock) + _price_single;

            var _option = new StringBuffer();
            var _idx = this.data[option_mode].length - 1;
            var _option_id = option_mode + '_' + _idx;
            var _option_class = option_mode == 'basic' ? 'basic_option' : 'addition_option';
            _option.append('<li id="' + _option_id + '">');
            _option.append('<input type="hidden" id="MS_keys_' + _option_id + '" value="' + keys + '" class="' + _option_class + '" />');
            _option.append('<span class="MK_p-name">');
            if (display_addi_opt_name == 'Y' && option_mode != 'basic') { _option.append(_opt_name + ' : '); }
            _option.append(_value.join(',') + '</span>');

            _option.append('<div class="MK_qty-ctrl">');
            // ����� ��뿩�ο� ���� ���
            if (this.info.is_mobile_use === true) {
                _option.append('<input type="tel" id="MS_amount_' + _option_id + '" name="amount[]" value="' + _stock + '" onchange="set_amount(this, \'' + option_mode + '\');" size="4" style="text-align: right; float: left;" class="' + _option_class + '" />');
                if (this.info.template_m_setid > 0) {
                    _option.append('&nbsp;<a href="javascript:set_amount(\'MS_amount_' + _option_id + '\', \'' + option_mode + '\', \'up\');" class="btn-type-02 box-gradient-02 box-shadow-02">');
                    _option.append('<span>+1</span>');
                    _option.append('</a>');
                    _option.append('&nbsp;<a href="javascript:set_amount(\'MS_amount_' + _option_id + '\', \'' + option_mode + '\', \'down\');" class="btn-type-02 box-gradient-02 box-shadow-02">');
                    _option.append('<span>-1</span>');
                    _option.append('</a>');
                }
            } else {
                _option.append('<input type="text" id="MS_amount_' + _option_id + '" name="amount[]" value="' + _stock + '" onfocusout="set_amount(this, \'' + option_mode + '\');" size="4" style="text-align: right; float: left;" class="' + _option_class + '" />');
                _option.append('<a href="javascript:set_amount(\'MS_amount_' + _option_id + '\', \'' + option_mode + '\', \'up\');" class="MK_btn-up">');
                _option.append('<img src="images/basket_up.gif" alt="' + get_lang('increase_quantity') + '" border="0" />');
                _option.append('</a>');
                _option.append('<a href="javascript:set_amount(\'MS_amount_' + _option_id + '\', \'' + option_mode + '\', \'down\');" class="MK_btn-dw">');
                _option.append('<img src="images/basket_down.gif" alt="' + get_lang('decrease_quantity') + '" border="0" />');
                _option.append('</a>');
            }
            _option.append('</div>');
            _option.append('<strong class="MK_price"><span id="MK_p_price_' + _option_id + '">' + _price.number_format() + '</span>��</strong>');
            _option.append('<a class="MK_btn-del" href="javascript:delete_option(\'' + _option_id + '\', ' + _idx + ', \'' + option_mode + '\');" id="MK_btn_del_' + this.option_idx + '">');
            if (this.info.is_mobile_use === true) {
                _option.append('<img src="/m/skin/basic/images/icon/icon_option_remove.gif" alt="' + get_lang('remove') + '" border="0" />');
            } else {
                _option.append('<img src="/board/images/btn_comment_del.gif" alt="' + get_lang('remove') + '" border="0" />');
            }
            _option.append('</a>');
            _option.append('</li>');

            if (option_mode == 'basic') {
                $('#MK_innerOpt_01').append(_option.toString());
            } else {
                $('#MK_innerOpt_02').append(_option.toString());
            }
            // �ɼ��� �� ������ ���
            this.sum_total_price();
        },
        // ��Ƽ�ɼ� ��� ����
        unset_multi_option: function(id, idx, option_mode) {
            $('#' + id).remove();
            this.unset_data(idx, option_mode);
            // �ɼ��� �� ������ ���
            this.sum_total_price();
            return false;
        },
        print_option: function(form_name, mode) {
            var _this = this;
            var _info = this.info;
            var _options = [];

            // �ʼ� �ɼǵ��� �����ߴ��� üũ
            // ���ø���Ʈ�϶� üũ ����
            if (mode != 'wish' && this.check_data() === false) {
                return false;
            }

            $.each(this.data, function(option_mode, value) {
                $.map(value, function(data, idx) {
                    if (data === undefined) {return true;}
                    // ��ǰ �����ʵ� �߰�
                    _options.push('<input type="hidden" name="amount[]" value="' + data[0].opt_stock + '" class="MS_option_values" />');

                    var _dummy = [];
                    if (_info.option_display_type == 'EACH') {
                        var _opt_stock = 0;
                        if (data === undefined) {return true;}
                        $.map(data, function(_d, _i) {
                            var _option_name = 'option[' + option_mode + '][' + idx + ']';
                            if (option_mode == 'basic') _option_name += '[' + _i + ']';
                            var _opt_stock = option_mode == 'basic' ? data[0].opt_stock : _d.opt_stock;
                            _options.push('<input type="hidden" name="' + _option_name + '[opt_id]" value="' + _d.opt_id + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[opt_value]" value="' + _d.opt_value + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[opt_stock]" value="' + _opt_stock + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[sto_id]" value="' + _d.sto_id + '" class="MS_option_values" />');
                        });
                    } else {
                        var _opt_stock = 0;
                        for (var i = 0, no = 0; i < data.length; i++) {
                            // ���տɼǰ� ������ ������ �����͸� �����ϱ� ���� �ӽ� ������ ��� �д�
                            // �⺻ �ɼ��̸鼭 ���յ� �ɼ��ϰ�쿡�� ����
                            if (option_mode == 'basic' && _info.json[option_mode][i][0].opt_mix == 'Y') {
                                data[i].stock_key = i; // ���� �������� Ű���� ��� ��
                                data[i].opt_stock = data[0].opt_stock;
                                _dummy.push(data[i]);
                                continue;
                            }
                            var _option_name = 'option[' + option_mode + '][' + idx + ']';
                            if (option_mode == 'basic') _option_name += '[' + no + ']';
                            _options.push('<input type="hidden" name="' + _option_name + '[opt_id]" value="' + data[i].opt_id + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[opt_value]" value="' + data[i].opt_value + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[opt_stock]" value="' + data[i].opt_stock + '" class="MS_option_values" />');
                            _options.push('<input type="hidden" name="' + _option_name + '[sto_id]" value="' + data[i].sto_id + '" class="MS_option_values" />');
                            no++;
                        }
                    }

                    // �ɼ� ��� ���°� �и� ���̰� �ӽ� ������ ���� �ִٸ� ����
                    if (_info.option_display_type == 'EVERY' && _dummy.length > 0) {
                        var _opt_id = [];
                        var _opt_value = [];
                        var _sto_id = null;
                        var _opt_stock = null;
                        var _stock_key = null;

                        // �ӽ� �����ͷ� ���յ� ������ �����
                        $.map(_dummy, function(_d, _i) {
                            _opt_id.push(_d.opt_id);
                            _opt_value.push(_d.opt_value);
                            if (_i == 0) {
                                _opt_stock = _d.opt_stock;
                                _stock_key = _d.stock_key;
                            }
                        });

                        // ���յ� �����͸� �������� �ش� ���� ã�Ƽ� sto_id���� �޾ƿ�
                        $.each(_info.json[option_mode][_stock_key], function(_i, _d) {
                            if (_d.opt_ids == _opt_id.join(',') && _d.opt_values == _opt_value.join(',')) {
                                _sto_id = _d.sto_id;
                                return false;
                            }
                        });

                        // ������ ���Ȱ� ������ no���� �״�� ���
                        _options.push('<input type="hidden" name="option[' + option_mode + '][' + idx + '][' + no + '][opt_id]" value="' + _opt_id.join(',') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[' + option_mode + '][' + idx + '][' + no + '][opt_value]" value="' + _opt_value.join(',') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[' + option_mode + '][' + idx + '][' + no + '][opt_stock]" value="' + _opt_stock + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[' + option_mode + '][' + idx + '][' + no + '][sto_id]" value="' + _sto_id + '" class="MS_option_values" />');
                    }
                });
            });

            // ���ÿϷ�� �ɼ��� �߰����� �ʾ�����
            if (this.info.option_insert_mode == 'manual' && _options.length == 0) {
                alert(get_lang('not_selected'));
                return false;
            }

            // �߰��� �ɼ��� ���� ��� ����
            $('input.MS_option_values').remove();
            // ���õ� �ɼ��� �ϳ��� ���� ��� ó��
            if (_options.length == 0) {
                $.each($('[name="optionlist[]"].basic_option'), function(_i, _d) {
                    if ($(this).get(0).tagName.toLowerCase() == 'input') {
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_id]" value="' + $(this).attr('opt_id') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_value]" value="' + get_lang('no_input_txt') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_stock]" value="1" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][sto_id]" value="0" class="MS_option_values" />');
                    } else {
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_id]" value="' + $(this).attr('opt_id') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_value]" value="' + get_lang('non_option_txt') + '" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][opt_stock]" value="1" class="MS_option_values" />');
                        _options.push('<input type="hidden" name="option[basic][0][' + _i + '][sto_id]" value="0" class="MS_option_values" />');
                    }
                });

                $.each($('[name="optionlist[]"].addition_option'), function(_i, _d) {
                    _options.push('<input type="hidden" name="option[addition][' + _i + '][opt_id]" value="' + $(this).attr('opt_id') + '" class="MS_option_values" />');
                    _options.push('<input type="hidden" name="option[addition][' + _i + '][opt_value]" value="' + get_lang('non_option_txt') + '" class="MS_option_values" />');
                    _options.push('<input type="hidden" name="option[addition][' + _i + '][opt_stock]" value="1" class="MS_option_values" />');
                    _options.push('<input type="hidden" name="option[addition][' + _i + '][sto_id]" value="0" class="MS_option_values" />');
                });
            }
            // ������ �ɼ� input ������ append��
            $('form[name="' + form_name + '"]').append(_options.join('\n'));
            if ($('#MK_innerOpt_01').length > 0) {
                if ($('#MK_innerOpt_01').find('li').length == 0) {
                    alert(get_lang('not_selected'));
                    return false;
                }
            }
        },
        // ios�ϰ�쿡�� �ش� ����Ʈ �ڽ� �ʱ�ȭ�Ҷ� setTimeout�� �ɾ��ش�.
        this_option_reset: function(obj) {
            if (this.get_user_agent_ios() == true) {
                setTimeout(function() { $(obj).val('').focus(); }, 10);
            } else {
                $(obj).val('').focus();
            }
        }
    };

    // ���� ��ǰ ���� ��ũ��Ʈ
    window.related_product_manager = {
        // �ʼ� �ɼ� ���� ���� üũ
        check_mandatory: function() {
            var _state = true;
            try {
                $('input[name="collbasket"]').each(function(_i, _v) {
                    // option�� idx���� �˾Ƴ��� ���� :checked ��� ����.
                    if ($(this).is(':checked') === true) {
                        $('[name="optionlist' + _i + '[]"]').each(function() {
                            if ($(this).attr('require') == 'Y' && $(this).val().replace(/[\s]/g, '').length == 0) {
                                throw($(this));
                            }
                        });
                    }
                });
            } catch (obj) {
                var _text = $(obj).get(0).tagName.toLowerCase() == 'input' ? get_lang('enter') : get_lang('select');
                alert(get_lang('require_option3', _text));
                $(obj).focus();
                _state = false;
            }
            return _state;
        },
        print_option: function(form_name) {
            if (this.check_mandatory() === false) {
                return false;
            }
            var _options = [];
            $('input[name="collbasket"]').each(function(idx, _v) {
                // option�� idx���� �˾Ƴ��� ���� :checked ��� ����.
                if ($(this).is(':checked') === true) {
                    var _related_uid = eval('related_uid' + idx);
                    var _related_brandcode = eval('related_brandcode' + idx);
                    var _related_amount = $('[name="quantity"].MS_related_quantity:eq(' + idx + ')').val();
                    var _option_data = eval('related_option_json_data' + idx);
                    var _option_type = eval('related_option_type' + idx);
                    var _option_display_type = eval('related_option_display_type' + idx);

                    _options.push('<input type="hidden" name="add_product[' + idx + '][uid]" value="' + _related_uid + '" class="MS_related_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + idx + '][brandcode]" value="' + _related_brandcode + '" class="MS_related_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + idx + '][option_type]" value="' + _option_type + '" class="MS_related_option_values" />');
                    _options.push('<input type="hidden" name="add_product[' + idx + '][amount]" value="' + _related_amount + '" class="MS_related_option_values" />');

                    // NO �ɼ��� ��� ������ ���� ���� ����
                    if (_option_type == 'NO' || ($.inArray(_option_data, Array(undefined, null)) === -1 && object_count(_option_data.basic) == 1 && _option_data.basic[0][0].opt_value === undefined)) {
                        _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][0][opt_id]" value="0" class="MS_related_option_values" />');
                        _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][0][opt_value]" value="" class="MS_related_option_values" />');
                        _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][0][opt_stock]" value="' + _related_amount + '" class="MS_related_option_values" />');
                        _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][0][sto_id]" value="1" class="MS_related_option_values" />');
                    } else {
                        var _dummy = [];
                        var _select = [];
                        $.each($('[name="optionlist' + idx + '[]"]'), function(_i, _d) {
                            // ���տɼǰ� ������ ������ �����͸� �����ϱ� ���� �ӽ� ������ ��� �д�
                            if (_option_data.basic[_i][0].opt_mix == 'Y') {
                                var _t = {};
                                _t.stock_key = _i; // ���� �������� Ű���� ��� ��
                                _t.opt_stock = _related_amount.numeric();
                                _t.opt_id = $(this).attr('opt_id');
                                _t.opt_value = $(this).children('option:selected').attr('title');
                                _dummy.push(_t);
                            } else {
                                _select.push($(this));
                            }
                        });

                        var _opt_num = 0;
                        $.each(_select, function(_i, _d) {
                            var _opt_id = $(_d).attr('opt_id') || 0;
                            if ($(_d).get(0).tagName.toLowerCase() == 'input') {
                                var _opt_value = ($(_d).attr('title') == $(_d).val()) ? '' : $(_d).val();
                            } else {
                                var _opt_value = $(_d).children('option:selected').attr('title') || '';
                            }
                            var _sto_id = $(_d).children('option:selected').attr('sto_id') || 0;

                            _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][' + _opt_num + '][opt_id]" value="' + _opt_id + '" class="MS_related_option_values" />');
                            _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][' + _opt_num + '][opt_value]" value="' + _opt_value + '" class="MS_related_option_values" />');
                            _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][' + _opt_num + '][opt_stock]" value="' + _related_amount + '" class="MS_related_option_values" />');
                            _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][' + _opt_num + '][sto_id]" value="' + _sto_id + '" class="MS_related_option_values" />');
                            _opt_num++;
                        });

                        if (_dummy.length > 0) {
                            var _data = {};
                            var _opt_ids = [];
                            var _opt_values = [];
                            var _amount = 0;
                            $.each(_dummy, function(_i, _d) {
                                _data = _option_data.basic[_d.stock_key];
                                _opt_ids.push(_d.opt_id);
                                _opt_values.push(_d.opt_value);
                                _amount = _d.opt_stock;
                            });

                            $.each(_data, function(_i, _d) {
                                if (_d.opt_ids == _opt_ids.join(',') && _d.opt_values == _opt_values.join(',')) {
                                    _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][' + _opt_num + '][opt_id]" value="' + _d.opt_ids + '" class="MS_related_option_values" />');
                                    _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][' + _opt_num + '][opt_value]" value="' + _d.opt_values + '" class="MS_related_option_values" />');
                                    _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][' + _opt_num + '][opt_stock]" value="' + _amount + '" class="MS_related_option_values" />');
                                    _options.push('<input type="hidden" name="add_product[' + idx + '][option][basic][0][' + _opt_num + '][sto_id]" value="' + _d.sto_id + '" class="MS_related_option_values" />');
                                }
                            });
                        }
                    }
                }
            });

            // �߰��� �ɼ��� ���� ��� ����
            $('input.MS_related_option_values').remove();
            // ������ �ɼ� input ������ append��
            $('form[name="' + form_name + '"]').append(_options.join('\n'));
        }
    };

    // �ɼ� �� ����
    window.option_value_replace = function() {
        // �⺻ �ɼ��� ��� �ֻ��� �ɼ��� ������ ���� �ɼ��� ���� ����д�.
        // ���������� �ɼ��� �����ϸ� ���� �ɼ��� append ��
        var _option_list = $('[name="optionlist[]"].basic_option');
        var _mix_option_num = 0;
        var _mix_option_count = _option_list.filter('[opt_mix="Y"]').length;
        $.each(_option_list, function(key, data) {
            if (key > 0) {
                $(this).children('option').not(':first').remove();
            }
            if (key == 0 && $(this).attr('opt_mix') == 'Y' && _mix_option_count > 1) {
                
                var _opt_ids = '';
                var _opt_values = '';
                $.each($(this).children('option').not(':first').not('option:contains("' + get_lang('non_option_txt') + '")'), function(_i, _d) {
                    _opt_ids = $(this).parents('select:first').attr('opt_id');
                    _opt_values = $(this).attr('title');
                    if ($(this).parents('select:first').attr('opt_mix') == 'Y' && option_manager.use_child_option(key, _opt_ids, _opt_values) === false) {
                        $(this).remove();
                    }
                });
                
            }
            // �ɼǵ��� ������ ù��°, ���þ��� �ɼ��� ����
            if ($(this).attr('opt_mix') == 'Y' && _mix_option_count == 1) {
                $.each($(this).children('option').not(':first').not('option:contains("' + get_lang('non_option_txt') + '")'), function(_i, _d) {
                    if ($(this).text() != get_lang('non_option_txt')) { // �ѹ��� �˻�
                        try {
                            var _opt = $(this);
                            var _add_text = '';
                            var _add_price = '';
                            var _text = _opt.text();
                            var _data = option_manager.info.json.basic[0][_i];

                            // view_member_only_price, IS_LOGIN �ɼ��� �߰� �ݾ� ó���� ���� ��ǰ �󼼿��� ���� ��
                            if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === 'false') {
                                _add_price = '';
                            } else {
                                // �и����� ��� �߰��ݾ��� �߰�����
                                if (option_manager.info.option_display_type == 'EVERY') {
                                    if (_data.sto_price > 0) {
                                        _add_price = '(+' + (Math.abs(parseInt(_data.sto_price, 10))).number_format() + ')';
                                        _opt.attr('price', parseInt(_opt.attr('price'), 10) + Math.abs(parseInt(_data.sto_price, 10)));
                                    } else if (_data.sto_price < 0) {
                                        _add_price = '(-' + (Math.abs(parseInt(_data.sto_price, 10))).number_format() + ')';
                                        _opt.attr('price', parseInt(_opt.attr('price'), 10) - Math.abs(parseInt(_data.sto_price, 10)));
                                    }
                                }
                            }

                            switch (_data.sto_state) {
                                case 'HIDE': _opt.remove(); break;
                                case 'SOLDOUT': _add_text = ' - ' + get_lang('soldout_txt'); break;
                                case 'TEMPOUT': _add_text = ' - ' + get_lang('tempsoldout_txt'); break;
                                case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                                case 'SALE':
                                    var _is_unlimit = _data.sto_unlimit == 'Y' ? true : false;
                                    if (_is_unlimit === true) {
                                        _add_text = '';
                                    } else if (_data.sto_stop_use == 'Y' && (_data.sto_real_stock - _data.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                        _add_text = ' - ' + get_lang('soldout_txt');
                                    }

                                    if (option_stock_display != 'NO' && _add_text.length == 0) {
                                        if (_data.sto_stop_use == 'Y') {
                                            _add_text = ' - (' + get_lang('stock_title') + ' : ' + Math.max(0, _data.sto_real_stock - _data.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                        } else {
                                            /*
                                            if (_data.sto_real_stock < 0) {
                                                _is_unlimit = true;
                                            } else {
                                                _add_text = ' - (' + get_lang('stock_title') + ' : ' + _data.sto_real_stock + ' ' + get_lang('stock_unit') + ')';
                                            }
                                            */
                                            _is_unlimit = true;
                                        }
                                        if (_is_unlimit === true) {
                                            if (option_stock_display == 'DISPLAY') {
                                                _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                            }
                                            if (option_stock_display == 'LIMIT') {
                                                _add_text = '';
                                            }
                                        }
                                    }
                                    break;
                            }
                            if (typeof option_note_display != 'undefined' && option_note_display == 'DISPLAY' && _data.sto_note.length > 0) {
                            _add_text += '(' + _data.sto_note.substr(0, 20) + ')';
                            }
                            _opt.text(_text + _add_price + _add_text);
                        } catch (e) {
                            return true;
                        }
                    }
                });
            } else if ($(this).attr('opt_mix') == 'Y' && _mix_option_count > 1) {
                if (_mix_option_num > 0 && $(this).attr('opt_mix') == 'Y') {
                    $(this).children('option').not(':first').not('option:contains("' + get_lang('non_option_txt') + '")').remove();
                }
                _mix_option_num++;
            }
        });

        // ���� �ɼ��� ���� ���� ���� �ؽ�Ʈ�� ��� ����
        $.each($('[name="optionlist[]"].addition_option'), function(key, data) {
            // �ɼǵ��� ������ ù��°, ���þ��� �ɼ��� ����
            $.each($(this).children('option').not(':first'), function(_i, _d) {
                try {
                    var _add_text = '';
                    var _text = $(this).text();

                    switch (option_manager.info.json.addition[key][_i].sto_state) {
                        case 'HIDE': $(this).remove(); break;
                        case 'SOLDOUT': _add_text = ' - ' + get_lang('soldout_txt'); break;
                        case 'TEMPOUT': _add_text = ' - ' + get_lang('tempsoldout_txt'); break;
                        case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                        case 'SALE':
                            var _t = option_manager.info.json.addition[key][_i];
                            var _is_unlimit = _t.sto_unlimit == 'Y' ? true : false;
                            if (_is_unlimit === true) {
                                _add_text = '';
                            } else if (_t.sto_stop_use == 'Y' && (_t.sto_real_stock - _t.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                _add_text = ' - ' + get_lang('soldout_txt');
                            }
                            if (option_stock_display != 'NO' && _add_text.length == 0) {
                                if (_is_unlimit === true) {
                                    if (option_stock_display == 'DISPLAY') {
                                        _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                    }
                                    if (option_stock_display == 'LIMIT') {
                                        _add_text = '';
                                    }
                                } else {
                                    _add_text = ' - (' + get_lang('stock_title') + ' : ' + Math.max(0, _t.sto_real_stock - _t.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                }
                            }
                            break;
                    }
                    $(this).text(_text + _add_text);
                } catch (e) {
                    return true;
                }
            });
        });
    };

    // ���� ��ǰ �ɼǰ� �����
    window.related_option_value_replace = function (related_key) {

        // �߰� ����, ��� ���� ����
        var get_opt_text = function (opt, stock) {
            var _text = $(opt).attr('title');
            var _add_price = '';
            var _add_text = '';


            // ��� �κ�
            if (Object.keys(stock).length > 0) {
                $.each(stock.data, function () {
                    if (this.opt_values == stock.opt_values) {
                        // ���� �κ�
                        if (typeof view_member_only_price != 'undefined' && view_member_only_price == 'Y' && typeof IS_LOGIN != 'undefined' && IS_LOGIN === false) {
                            _add_price = '';
                        } else {
                            if (this.sto_price > 0) {
                                _add_price = '(+' + (Math.abs(parseInt(this.sto_price, 10))).number_format() + ')';
                            } else if (this.sto_price < 0) {
                                _add_price = '(-' + (Math.abs(parseInt(this.sto_price, 10))).number_format() + ')';
                            }
                        }
                        $(opt).show()
                        switch (this.sto_state) {
                            case 'HIDE': $(opt).remove(); break;          // �� remove�� �ƴ϶� hide �ؾ� �ٸ� �ɼ� �����Ҷ� ���´�
                            case 'SOLDOUT': _add_text = ' - ' + get_lang('soldout_txt'); break;
                            case 'TEMPOUT': _add_text = ' - ' + get_lang('tempsoldout_txt'); break;
                            case 'DELAY': _add_text = ' - ' + get_lang('shipping_txt'); break;
                            case 'SALE':
                                var _is_unlimit = this.sto_unlimit == 'Y' ? true : false;
                                if (_is_unlimit === true) {
                                    _add_text = '';
                                } else if (this.sto_stop_use == 'Y' && (this.sto_real_stock - this.sto_stop_stock) <= 0 && _add_text.length == 0) {
                                    _add_text = ' - ' + get_lang('soldout_txt');
                                }
                                if (option_stock_display != 'NO' && _add_text.length == 0) {
                                    if (this.sto_stop_use == 'Y') {
                                        _add_text = ' - (' + get_lang('stock_title') + ' : ' +  Math.max(0, this.sto_real_stock - this.sto_stop_stock) + ' ' + get_lang('stock_unit') + ')';
                                    } else {
                                        /*
                                        if (this.sto_real_stock < 0) {
                                            _is_unlimit = true;
                                        } else {
                                            _add_text = ' - (' + get_lang('stock_title') + ' : ' +  this.sto_real_stock + ' ' + get_lang('stock_unit') + ')';
                                        }
                                        */
                                        _is_unlimit = true;
                                    }
                                    if (_is_unlimit === true) {
                                        if (option_stock_display == 'DISPLAY') {
                                            _add_text = ' - (' + get_lang('stock_title') + ' : ' + get_lang('stock_unlimit') + ')';
                                        }
                                        if (option_stock_display == 'LIMIT') {
                                            _add_text = '';
                                        }
                                    }
                                }
                                break;
                        }

                        if (typeof option_note_display != 'undefined' && option_note_display == 'DISPLAY' && this.sto_note.length > 0) {
                            _add_text += '(' + this.sto_note.substr(0, 20) + ')';
                        }
                    }
                });
            }
            _text += _add_price + _add_text;
            return _text;
        };


        return function () {
            var _option_list = $('select[name="optionlist' + related_key + '[]"]');
            var _json_data = window['related_option_json_data' + related_key];

            if (_option_list.length > 0) {
                if (window['related_option_display_type' + related_key] == 'EACH') {            // ��ü��
                    var _idx = $('select[name="optionlist' + related_key + '[]"]').index(_option_list.filter('[opt_mix="Y"]'));
                    var _option_stock_data = _json_data.basic[_idx];
                    $.each($('option[value!=""]', _option_list.filter('[opt_mix="Y"]')), function (_i, _o) {
                        $(this).text(get_opt_text(this, { data: _option_stock_data, opt_values: $(this).attr('title') }));
                    });

                } else {
                    // 1. ���� ã�� ���� opt_ids�� ��������.
                    var _opt_values = [];
                    var _idx = [];

                    // ������ �ɼ� �ٷ� �������� �̴´�
                    $.each(_option_list.filter('[opt_mix="Y"]'), function (_i, _o) {
                        if (_i < (_option_list.filter('[opt_mix="Y"]').length - 1)) {
                            _idx.push(_option_list.index(this));
                        }
                    });

                    $.each($(_idx), function (_i, _o_idx) {
                        if ($(_option_list[_o_idx]).val().length > 0) {
                            _opt_values.push($('option:selected', _option_list[_o_idx]).attr('title'));
                        }
                    });

                    // ������� �ɼ� ó�� ���� �ɼ� �⺻�� ���� ����
                    if (!related_option_mix_list[related_key]) {
                        related_option_mix_list[related_key] = $(_option_list.filter('[opt_mix="Y"]:last')).html();
                    } else {
                        var sel_val = _option_list.filter('[opt_mix="Y"]:last').val();
                        $(_option_list.filter('[opt_mix="Y"]:last')).html(related_option_mix_list[related_key])
                        $(_option_list.filter('[opt_mix="Y"]:last')).val(sel_val);
                    }

                    var _option_stock_data = _json_data.basic[_option_list.index(_option_list.filter('[opt_mix="Y"]:last'))];
                    $.each($(_option_list.filter('[opt_mix="Y"]:last').children('option').not(':first')), function () {
                        var _v = '';
                        if (_option_list.filter('[opt_mix="Y"]').length > 1) {
                            _v = _opt_values.join(',') + ',';
                        }
                        _v += $(this).attr('title');
                        if (_option_list.filter('[opt_mix="Y"]').length == 1 || _opt_values.length > 0) {
                            $(this).text(get_opt_text(this, { data: _option_stock_data, opt_values: _v }));
                        } else {
                            $(this).text(get_opt_text(this, {  }));
                        }
                    });
                }
            }
        }();
    };

    $(function() {
        // �ɼ� �� ����
        option_value_replace();

        // ���� �Ǿ� �������� ������
        if (typeof cart_option_json != 'undefined') {
            // ������ �⺻ �ɼ� ���� ���·� ���
            var _basic_key = 0;
            var _basic_data = [];
            $.each(cart_option_json.basic, function(_idx, _data) {
                var _basic_keys = [];
                var _opt_mix_count = 0;
                $.each(_data, function(_i, _d) {
                    if ((_d.sto_type == null || _d.sto_type.length == 0) && _d.opt_value == 0) {return true;}
                    var _is_exist_non_option_txt = false;
                    var _opt_idx = $.inArray(_d.opt_value, optionJsonData.basic[_i][0].opt_value.split(','));
                    if (_d.opt_value == get_lang('non_option_txt')) { opt_idx = 0;} 

                    // �ɼ������� �ƴѰ�� ���þ��԰��� �߰��Ǹ鼭 �ɼ����վƴ� ���� üũ��
                    if ($('[name="optionlist[]"].basic_option').eq(_i).attr('opt_mandatory') == 'N') {
                        _is_exist_non_option_txt = true;
                    }
                    
                    if ($('[name="optionlist[]"].basic_option').eq(_i).get(0).tagName.toLowerCase() == 'input') {_opt_idx = _d.opt_value;}
                    if (option_display_type == 'EVERY') {
                        var _opt_price = 0;
                        if (optionJsonData.basic[_i][0].opt_mix == 'Y') {
                            if (_opt_mix_count == 0) {
                                $.each(optionJsonData.basic[_i], function(key, val) {
                                    if (_d.sto_id == val.sto_id) {
                                        _opt_price = val.sto_price || 0;
                                        _opt_mix_count++;
                                        return false;
                                    }
                                });
                            }
                        } else {
                            _opt_price = optionJsonData.basic[_i][0].opt_price.split(',')[_opt_idx] || 0;
                        }
                        var _opt_type = optionJsonData.basic[_i][0].opt_type;
                    } else {
                        if (optionJsonData.basic[_i][0].opt_values === undefined) {
                            var _opt_price = optionJsonData.basic[_i][0].opt_price.split(',')[_opt_idx] || 0;
                        } else {
                            var _opt_price = 0;
                            $.each(optionJsonData.basic, function(key, value) {
                                if (_opt_price > 0) {return false;}
                                $.each(value, function(_k, _v) {
                                    if (_d.opt_id == _v.opt_ids && _d.opt_value == _v.opt_values) {
                                        _opt_idx = _k;
                                        _opt_price = _v.sto_price;
                                        return false;
                                    }
                                });
                            });
                        }
                        var _opt_type = optionJsonData.basic[_i][0].opt_type;
                    }
                    _basic_data.push({
                        opt_id: _d.opt_id,
                        opt_type: _opt_type,
                        opt_value: _d.opt_value,
                        opt_stock: _d.opt_stock,
                        opt_price: _opt_price,
                        sto_id: _d.sto_id
                    });
                    // �ɼ���������������� ���þ��� �������� ��� +1 ���ش�. 
                    if (_is_exist_non_option_txt === true) {
                        _opt_idx = _opt_idx + 1;
                    }
                    _basic_keys.push(_i + ':' + _opt_idx);
                });
                if (_basic_data.length > 0) {
                    option_manager.data.basic.push(_basic_data);
                    option_manager.keys.basic.push(_basic_keys.join('|'));
                    option_manager.set_multi_option(option_manager.data.basic[_basic_key], option_manager.keys.basic[_basic_key], 'basic')
                    option_manager.set_amount('MS_amount_basic_' + _basic_key, 'basic');
                    _basic_key++;
                }
            });

            // ������ ���� �ɼ� ���� ���·� ���
            var _addition_key = 0;
            $.each(cart_option_json.addition, function(_idx, _data) {
                var _addition_data = [];
                var _addition_keys = [];
                $.each(_data, function(_i, _d) {
                    var _opt_idx = 0;
                    var _return = null;
                    var _key = 0;
                    $.each(optionJsonData.addition, function(key, value) {
                        $.each(value, function(k, v) {
                            if (_d.opt_id == v.opt_id) {
                                _key = key;
                                _opt_idx = $.inArray(_d.opt_value, v.opt_value.split(','));
                                return false;
                            }
                        });
                        if (_return === false) {
                            return false;
                        }
                    });
                    var _opt_price = 0;
                    $.each(optionJsonData.addition, function(key, value) {
                        if (_opt_price > 0) {return false;}
                        $.each(value, function(_k, _v) {
                            if (_d.opt_id == _v.opt_ids && _d.opt_value == _v.opt_values) {
                                _opt_price = _v.sto_price;
                                _opt_name = _v.opt_name;
                                return false;
                            }
                        });
                    });
                    _addition_keys.push(_key + ':' + _opt_idx);
                    _addition_data.push({
                        opt_id: _d.opt_id,
                        opt_type: 'ADDITION',
                        opt_value: _d.opt_value,
                        opt_stock: _d.opt_stock,
                        opt_price: _opt_price,
                        opt_name : _opt_name,
                        sto_id: _d.sto_id
                    });
                });
                option_manager.data.addition.push(_addition_data);
                option_manager.keys.addition.push(_addition_keys.join('|'));
                option_manager.set_multi_option(option_manager.data.addition[_addition_key], option_manager.keys.addition[_addition_key], 'addition')
                _addition_key++;
            });
        }

        // option_type == 'NO' �� ��� �⺻ �ɼ� ���� �߰���
        // �����ɼǸ� ��ϵ� ��ǰ�� ���
        if (option_type == 'NO' || (object_count(option_manager.info.json.basic) == 1 && option_manager.info.json.basic[0][0].opt_value === undefined)) {
            option_manager.data.basic.push([{
                opt_id: option_manager.info.json.basic[0][0].opt_ids || '0',
                opt_value: product_name,
                opt_stock: option_manager.get_min_amount('basic'),
                opt_price: 0,
                sto_id: option_manager.info.json.basic[0][0].sto_id || '0'
            }]);
            option_manager.info.json.basic[0][0].opt_value = product_name;
            option_manager.keys.basic.push('0:0');

            var _temp_product_price = (option_manager.get_min_amount('basic') > 1) ? product_price * option_manager.get_min_amount('basic') : product_price; // �ּ��ֹ����� ���� �ݾ׿� ����.
            var _option = new StringBuffer();
            _option.append('<li id="basic_0">');
            _option.append('<input type="hidden" id="MS_keys_basic_0" value="0:0" class="basic_option" />');
            _option.append('<span class="MK_p-name">' + product_name + '</span>');
            _option.append('<div class="MK_qty-ctrl">');
            // ����� ��뿩�ο� ���� ���
            if (option_manager.info.is_mobile_use === true) {
                _option.append('<input type="tel" id="MS_amount_basic_0" name="amount[]" value="' + option_manager.get_min_amount('basic') + '" onchange="set_amount(this, \'basic\');" size="4" style="text-align: right; float: left;" class="basic_option" />');
                if (option_manager.info.template_m_setid > 0) {
                    _option.append('&nbsp;<a href="javascript:set_amount(\'MS_amount_basic_0\', \'basic\', \'up\');" class="btn-type-02 box-gradient-02 box-shadow-02">');
                    _option.append('<span>+1</span>');
                    _option.append('</a>');
                    _option.append('&nbsp;<a href="javascript:set_amount(\'MS_amount_basic_0\', \'basic\', \'down\');" class="btn-type-02 box-gradient-02 box-shadow-02">');
                    _option.append('<span>-1</span>');
                    _option.append('</a>');
                }
            } else {
                _option.append('<input type="text" id="MS_amount_basic_0" name="amount[]" value="' + option_manager.get_min_amount('basic') + '" onfocusout="set_amount(this, \'basic\');" size="4" style="text-align: right; float: left;" class="basic_option" />');
                _option.append('<a href="javascript:set_amount(\'MS_amount_basic_0\', \'basic\', \'up\');" class="MK_btn-up">');
                _option.append('<img src="images/basket_up.gif" alt="' + get_lang('increase_quantity') + '" border="0" />');
                _option.append('</a>');
                _option.append('<a href="javascript:set_amount(\'MS_amount_basic_0\', \'basic\', \'down\');" class="MK_btn-dw">');
                _option.append('<img src="images/basket_down.gif" alt="' + get_lang('decrease_quantity') + '" border="0" />');
                _option.append('</a>');
            }
            _option.append('</div>');
            _option.append('<strong class="MK_price"><span id="MK_p_price_basic_0">' + _temp_product_price.number_format() + '</span>원</strong>');
            _option.append('</li>');
            if (view_member_only_price != 'Y' || (view_member_only_price == 'Y' && IS_LOGIN === 'true')) {
                $('#MK_innerOpt_01').append(_option.toString());
            }
        }

        // ���� ��ǰ �� ���� ���
        if (view_member_only_price != 'Y' || (view_member_only_price == 'Y' && IS_LOGIN === 'true')) {
            option_manager.sum_total_price();
        }
    });
})(jQuery);

// insert multi option
function option_select_complete(e) {
    // ����� �������� �ɼ� ���ÿϷ� ��ư Ŭ���� form submit�� ���� ����
    if (is_mobile_use === true && template_m_setid == 0) {
        e = e || window.event;
        e.preventDefault();
    }
    option_manager.manual_option_insert();
    return;
}

// input box focus in action
function option_focus(obj) {
    option_manager.input_focus(obj);
    return false;
}

// option change action
function change_option(obj, option_mode, target) {
    option_manager.change_option(obj, option_mode, target);
    return false;
}

// amount input box change action
function set_amount(obj, option_mode, mode) {
    option_manager.set_amount(obj, option_mode, mode);
}

// option change action
function sum_total_price() {
    option_manager.sum_total_price();
    return false;
}

// delete multi option value
function delete_option(id, idx, option_mode) {
    option_manager.unset_multi_option(id, idx, option_mode);
}

// create option value input hidden box
function create_option_input(form_name, relation, mode) {
    return option_manager.print_option(form_name, mode);
}

// multiselect_option.js�� �ִ� method ������
// ��ٱ��� ���
function send_multi(cnt, mode, relation, noproduct) {

    //������� ���޼��� ����
    if(document.getElementById('logrecom')) {
        logrecom_cart_log(logreco_id, 2, log_url);
    }

    if (noproduct != 'YES' && create_option_input('allbasket') === false) {
        return;
    }

    // ���� ��ǰ�� �Բ� ��ٱ��� ��� ��� ����
    if (relation == 'relation') {
        if (noproduct == 'YES') {
            if ($('input[name="collbasket"]') && $('input[name="collbasket"]:checked').length == 0) {       // ���û�ǰ�� ����ε�, üũ�� ��ǰ�� ������ ó��
                alert(get_lang('not_select_product'));
                return;
            }
        }
        if (related_product_manager.print_option('allbasket') === false) {
            return;
        }
    }

    if (mode == 'baro') {
		var Naverpay_Btn_W	 =  document.getElementsByName('navercheckout');
		var Naverpay_Btn_Chk = false;
		if(Naverpay_Btn_W.length > 0) {			
			for (var np=0 ; np < Naverpay_Btn_W.length ; np++) {
				if(Naverpay_Btn_W[np].value) {
					Naverpay_Btn_Chk = true;
				} else {
					Naverpay_Btn_Chk = false;
				}
			}
		}

        // ��ٱ��� �ٷα��ſɼ� ��ٱ��� ��ǰ ���� ���� �����Ȱ�� ��ٱ��Ͽ� ��ǰ�������� ���â ����
        if (baro_opt == 'N' && basketcnt > 0 && Naverpay_Btn_Chk === false && (!document.getElementById('direct_order') || (document.getElementById('direct_order') && document.getElementById('direct_order').value != 'payco_checkout'))) {
            alert('��ٱ��Ͽ� ��� �ִ�, ��ǰ�� �Բ� �ֹ��˴ϴ�.\n��ġ ������ ��� ��ٱ��ϸ� ����ּ���.');
        }
        document.allbasket.ordertype.value ='baro';
        document.allbasket.ordertype.value += '|parent.|layer';
        document.allbasket.target = 'loginiframe';
    }else {
        document.allbasket.ordertype.value ='';
        document.allbasket.target = '';
    }

    if (ORBAS == 'A') {
        document.allbasket.ordertype.value += '|parent.|layer';
        document.allbasket.target = 'loginiframe';
    } else if (ORBAS == 'Y') {
        document.allbasket.ordertype.value += '|parent.';
        document.allbasket.target = 'loginiframe';
    }

    // ������ �������
    if (document.getElementById('direct_order') && document.getElementById('direct_order').value == 'payco_checkout') {
        if (typeof MOBILE_USE != 'undefined' && MOBILE_USE == 1) {
            document.allbasket.target = "";
        }
        else {
            window.open('', 'payco_win', 'width=692');
            document.allbasket.target = "payco_win";
        }
    }

    document.allbasket.submit();
}



















