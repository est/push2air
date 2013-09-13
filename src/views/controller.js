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
      var pdata = parseHttpResponse(recv.data);
      pdata['addr'] = recv.address+':'+recv.port
      console.info('Recv '+recv.resultCode+' bytes from '+pdata.addr+',\tURL:'+pdata.location)
      $scope.addDevice( pdata )
    })
    upnp.search('upnp:rootdevice');
  }
  
  $scope.scan = function() {
    chrome.socket.destroy(upnp.sid||0);
    upnp.start();
  }
  // for(var i=0;i<200;i++){chrome.socket.destroy(i)}
  // chrome.socket.getInfo(52, function(s){console.info(s)} ) 
  // chrome.socket.recvFrom(21, function(r){console.info(r)})
}
