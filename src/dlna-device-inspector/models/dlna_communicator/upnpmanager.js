var UpnpManager;

(function(){ 

  var socket = chrome.socket;

  // SSDP definitions
  var M_SEARCH_REQUEST = "M-SEARCH * HTTP/1.1\r\n" +
    "MX: 3\r\n" +
    "HOST: 239.255.255.250:1900\r\n" +
    "MAN: \"ssdp:discover\"\r\n" +
    "ST: {{st}}\r\n\r\n";

  // UPnP classes
  UpnpManager = function(){};

  UpnpManager.prototype.start = function() {
    this.sid = null;
    this.MIP_ = "239.255.255.250";
    this.PORT_ = 1900;

    var self = this;
    socket.create('udp', {}, function(socketInfo) {
      self.sid = socketInfo.socketId;
      socket.bind(self.sid, "0.0.0.0", 0, function(res) {
        if(res !== 0) {
          throw('cannot bind socket');
        }
        self.onready();
      });
    });
  }

  // interface to onready
  UpnpManager.prototype.onready = function() {
  }

  // do M-SEARCH
  UpnpManager.prototype.search = function(st /* search type */, callback /* function */) {
    if(!!this.sid === false) {
      throw('socket id is not allocated');
    }

    var ssdp = M_SEARCH_REQUEST.replace("{{st}}", st);
    var buffer = t2ab(ssdp);

    var closure_ = function(e){
      if(e.bytesWritten < 0) {
        throw("an Error occured while sending M-SEARCH : "+e.bytesWritten);
      }

      if(typeof(callback) === "function")
        callback();
    }

    // send M-SEARCH twice times
    for(var i = 0; i < 2; i++) {
      socket.sendTo(this.sid, buffer, this.MIP_, this.PORT_, function(e) {
        closure_(e);
      });
    }
  }

  // listen response to M-SEARCH
  UpnpManager.prototype.listen = function(callback) {
    if(!!this.sid === false) {
      throw('socket id is not allocated');
    }

    var self = this;
    var closure_ = function(recv){
      recv.data = ab2t(recv.data);
      if(typeof(callback) === "function") {
        callback(recv);
      }
      self.listen(callback);
    }

    socket.recvFrom(this.sid, function(recv) {
      closure_(recv);
    });
  }

  // destroy socket
  UpnpManager.prototype.destroy = function() {
    socket.destroy(this.sid);
    this.sid = null;
  }

}());
