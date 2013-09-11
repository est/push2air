
function t2ab(str /* String */) {
  var buffer = new ArrayBuffer(str.length);
  var view = new DataView(buffer);
  for(var i = 0, l = str.length; i < l; i++) {
    view.setInt8(i, str.charAt(i).charCodeAt());
  }
  return buffer;
}

// translate Arrayed buffer to text string
//
function ab2t(buffer /* ArrayBuffer */) {
  var arr = new Int8Array(buffer);
  var str = "";
  for(var i = 0, l = arr.length; i < l; i++) {
    str += String.fromCharCode.call(this, arr[i]);
  }
  //console.log(str);
  return str;
}
  
function getFullURL(former, latter){

  if(latter.substring(0,4) == 'http'){
    domain_f = former.split('/').slice(0,3).join('/');
    domain_l = latter.split('/').slice(0,3).join('/');
    if(domain_f != domain_l){
      return latter;
    }
    else{
      latter = latter.split('/').slice(3).join('/')
    }
  }

  return connectURL(former, latter)

}

function connectURL(former, latter){

  if(former[former.length-1] == '/' && latter[0] == '/'){
    var url = former + latter.slice(1,latter.length);
  }
  else{
    var url = former + latter;
  }

	return url;

}

function formatURL(url){

    var checked_url = url.substring(0,8) + url.substring(8).replace(/\u002f\u002f/g, "/")

    checked_url = checked_url.replace(" ", "")

    return checked_url
}



function escapeHTML(code){

  return $('<div>').text(code).html()

}
