function _TIX(s,t){return s.indexOf(t)};
function _TGV(b,a,c,d){ var f = b.split(c);for(var i=0;i<f.length; i++){ if( _TIX(f[i],(a+d))==0) return f[i].substring(_TIX(f[i],(a+d))+(a.length+d.length),f[i].length); }    return ''; };
var _CKNVADID = _TGV(unescape(_TGV(document.cookie,'CTSCKURL','; ','=')),'NVADID','&','=');
if( _CKNVADID != "" ) document.cookie = "NVADID=" + _CKNVADID +"; path=/; domain="+document.domain+"; ";


















