function DeviceCtrl($scope) {

  $scope.devices = []


  var upnp = new UpnpManager();
  upnp.onready = function(){
    this.listen(function(recv){
      var str = recv.data;
      console.info('Found ' + str.length + ' bytes.')
      $scope.devices.push( parseHttpResponse(str) );
    })
    
  }
  upnp.start();

  $scope.scan = function() {
    upnp.search('upnp:rootdevice');
  }

}
