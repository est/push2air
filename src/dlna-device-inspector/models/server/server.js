var socket = chrome.socket;

var CRLF = "\r\n";

var Server = function(port, callback){

  var self = this;
  var address = "0.0.0.0"

  socket.create('tcp', {}, function(socketInfo){

    console.log(socketInfo);
    self.sid = socketInfo.socketId;

    socket.listen(self.sid, address, port, function(res){
      chrome.socket.getInfo(self.sid, function(e){
        console.log(e);
        this.localAddress = e.localAddress;
        this.localPort = e.localPort;
        self.socketInfo = e.socketInfo;
      });

      var accept_ = function(sid){
        chrome.socket.accept(sid, function(e){
          console.log(e)
          //if(e.resultCode > 0){
            callback(e.socketId, self);
          //}
          //else{
            accept_(sid);
          //}
        });
      }
      accept_(self.sid);

    });
  })
}


Server.prototype.t2ab = function(str /* String */) {
    var buffer = new ArrayBuffer(str.length);
    var view = new DataView(buffer);
    for(var i = 0, l = str.length; i < l; i++) {
      view.setInt8(i, str.charAt(i).charCodeAt());
    }
    return buffer;
}

Server.prototype.ab2t = function(buffer /* ArrayBuffer */) {
  var arr = new Int8Array(buffer);
  var str = "";
  for(var i = 0, l = arr.length; i < l; i++) {
    str += String.fromCharCode.call(this, arr[i]);
  }
  return str;
}

Server.prototype.extractParams = function(header){
  var escaped = escape(header);
  var pairs = unescape(escaped.substring(escaped.search(escape("?")))).substring(1).split(" ")[0].split('&');
  var params = {}
  pairs.map(function(pair){
    key = pair.split('=')[0]
    val = pair.split('=')[1]
    params[key] = val;
  })

  return params;
}

Server.prototype.extractHeader = function(request){
  headers = [];
  headers['requestLine'] = request.split(/\r\n/)[0];
  var splitted = request.split(/\r\n/).slice(1).map(function(v){
    var key = v.split(/: |:/)[0];
    var val = v.split(/: |:/)[1];
    headers[key] = val;
  });

  return headers;
}

Server.prototype.createHeader = function(headers){

  var headersKey = Object.keys(headers);
  var newHeaders = [];

  headersKey.map(function(key){
    if(key != 'requestLine' && key != ''){
      var val = headers[key];
      var h = key + ': ' + val;
      newHeaders.push(h);
    }
  })

  newHeader = newHeaders.join(CRLF) + CRLF;

  return newHeader;
}

