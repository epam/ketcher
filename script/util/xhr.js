/*global ActiveXObject, global:false, util:false*/

// use window as it's polyfill (not intended for browserify processing)
if (window.XMLHttpRequest === undefined) {
    // based on https://gist.github.com/Contra/2709462
    // see: http://msdn.microsoft.com/en-us/library/ie/ms535874%28v=vs.85%29.aspx
    //      https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest_in_IE6
    //      http://en.wikipedia.org/wiki/XMLHttpRequest#Support_in_Internet_Explorer_versions_5.2C_5.5.2C_and_6
    var ids = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0',
               'Microsoft.XMLHTTP'];
    for (var i = 0; i < ids.length; i++) {
        try {
            var _ = new ActiveXObject(ids[i]);
            window.XMLHttpRequest = function() {
                return new ActiveXObject(ids[i]);
            };
            break;
        } catch (e) {}
    }
}
