var RawDevices

function DeviceCtrl($scope) {

  $scope.devices = {}
  RawDevices = $scope.devices;

  $scope.addDevice = function(o) {
    return $scope.devices[ o.location ] = o;
  }
  $scope.deviceNum = function() {
    return Object.keys($scope.devices).length
  }

  var upnp = new UpnpManager();
  upnp.onready = function(){
    this.listen(function(recv){
      if (recv.resultCode<=0) {
        throw('error')
      }
      var str = recv.data;
      console.info('Recv '+str.length+' bytes from '+recv.address+':'+recv.port+'. Code: '+recv.resultCode)
      $scope.addDevice( parseHttpResponse(str) )
    })
    upnp.search('upnp:rootdevice');
  }
  
  $scope.scan = function() {
    upnp.start();
  }
  // for(var i=0;i<200;i++){chrome.socket.destroy(i)}
  // chrome.socket.getInfo(52, function(s){console.info(s)} ) 
  // chrome.socket.recvFrom(21, function(r){console.info(r)})
}
