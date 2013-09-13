
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
    this.hasRsp = false;

    var self = this;
    socket.create('udp', {}, function(socketInfo){
      self.sid = socketInfo.socketId;
      socket.bind(self.sid, "0.0.0.0", 0, function(res){
        if(res!==0){
          console.info(res)
          throw('Failed to bind socket');
        }
        console.info('Broadcast socket Ready. ' + self.sid)
        self.onready();
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
    var self=this;
    console.info('start M-SEARCH scanning... ' + self.sid)

    // send twice
    var i = 0
    var c = setInterval(function(){
      (function(){
        socket.sendTo(self.sid, buffer, self.IP, self.PORT, function(e){
          if(e.bytesWritten < 0) {
            throw('M-SEARCH failed. '+ e.bytesWritten)
          }
          console.info('M-SEARCH sent. ' + e.bytesWritten+' bytes, retry '+i)
          if (typeof(callback) === 'function'){
            callback()
          }
        })
        if (i<5&&!self.hasRsp){ i++ } else { clearInterval(c) }
      })()
    }, 1000)

  };
  UpnpManager.prototype.listen = function(callback) {
    if(!!this.sid === false){
      throw('Socket ID not available '+ this.sid)
    }
    var self = this;
    setTimeout(function(){
      (function(){
        socket.recvFrom(self.sid, function(recv){
          self.hasRsp = true;
          recv.data = b2s(recv.data);
          if(typeof(callback) === 'function') {
            callback(recv);
          }
          // console.info('here?', self.listen)
          
            self.listen(callback)  
          
        })
      })()
    }, 200)
  };
  UpnpManager.prototype.destroy = function() {
    socket.destroy(this.sid);
    this.sid = null;
  };
})()


function parseHttpResponse(data){
  var arr = data.split("\n"), ret = {};
  for(var i = 0, l = arr.length; i < l; i++ ) {
    var a = arr[i].split(":");
    var k = a[0].toLowerCase();
    var v = a.slice(1).join(":");

    if(!!v) {
      ret[k] = v;
    }
  }
  return ret;
}

// upnp.start();

/* @ToDO:
  1. bind button to scan
  2. implement passive new device detection
  3. save cached device list to local storage
  4. hide non DMR devices
*/