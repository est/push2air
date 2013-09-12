
function s2b(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function b2s(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

var UpnpManager;
(function(){
  var socket = chrome.socket;

  var M_SEARCH_REQUEST = "M-SEARCH * HTTP/1.1\r\n" +
    "MX: 3\r\n" +
    "HOST: 239.255.255.250:1900\r\n" +
    "MAN: \"ssdp:discover\"\r\n" +
    "ST: {{st}}\r\n\r\n";

  UpnpManager = function(){};
  UpnpManager.prototype.start = function() {
    this.sid = null;
    this.IP = "239.255.255.250";
    this.PORT = 1900;

    var self = this;
    socket.create('udp', {}, function(socketInfo){
      self.sid = socketInfo.socketId;
      console.info(self.sid)
      socket.bind(self.sid, "0.0.0.0", 0, function(res){
        if(res!==0){
          console.info(res)
          throw('Failed to bind socket');
        }
        self.onready;
      })
    })
  };
  UpnpManager.prototype.onready = function() { };
  UpnpManager.prototype.search = function(st, callback) {
    if(!!this === false){
      throw('Socket is not allocated');
    }

    var ssdp = M_SEARCH_REQUEST.replace("{{st}}", st);
    var buffer = s2b(ssdp);

    socket.sendTo(this.sid, buffer, this.IP, this.PORT, function(e){
      if(e.bytesWritten < 0) {
        throw('M-SEARCH failed. '+ e.bytesWritten)
      }
      if (typeof(callback) === 'function'){
        callback()
      }
    })
  };
  UpnpManager.prototype.listen = function(callback) {
    if(!!this.sid === false){
      throw('Socket ID not available '+ this.sid)
    }
    var self = this;
    socket.recvFrom(this.sid, function(recv){
      recv.data = b2s(recv.data);
      if(typeof(callback) === 'function') {
        callback(recv);
      }
      self.listen(callback)
    })
  };
  UpnpManager.prototype.destroy = function() {
    socket.destroy(this.sid);
    this.sid = null;
  };
})()


console.info(UpnpManager)
var upnp = new UpnpManager();

upnp.onready = function(){
  this.listen(function(recv){
    var str = recv.data;
    console.info('wat', str)
  })
  this.search('upnp:rootdevice');
}
upnp.start();
