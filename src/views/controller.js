var RawDevices

function DeviceCtrl($scope) {

  $scope.devices = []
  RawDevices = $scope.devices;

  $scope.addDevice = function(o) {
    return $scope.devices.push( o );
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
}
