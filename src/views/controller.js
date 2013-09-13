function DeviceCtrl($scope) {

  $scope.devices = []


  var upnp = new UpnpManager();
  upnp.onready = function(){
    this.listen(function(recv){
      var str = recv.data;
      console.info('Recv '+str.length+' bytes from '+recv.address+':'+recv.port+'. Code: '+recv.resultCode)
      $scope.devices.push( parseHttpResponse(str) );
    })
    upnp.search('upnp:rootdevice');
  }
  
  
  $scope.scan = function() {
    upnp.start();
  }
}
