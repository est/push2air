var DeviceManager;

(function(){

  var upnpResponse = [];
  var allRootList = [];

  DeviceManager = function(){
    this.devices = [];
    this.upnp = new UpnpManager();
  };


  DeviceManager.prototype.getDeviceByID = function(id){
    return this.devices[id.device];
  };

  DeviceManager.prototype.getServiceByID = function(id){
    return this.devices[id.device].services[id.service];
  };

  DeviceManager.prototype.getActionByID = function(id){
    return this.devices[id.device].services[id.service].actions[id.action];
  };

  DeviceManager.prototype.searchByDeviceType = function(deviceTypeShort){
    var matched = [];
    this.devices.forEach(function(device){
      if(device.deviceTypeShort == deviceTypeShort) matched.push(device);
    })
    return matched;
  };

  var checkOverlappedDevice_ = function(o, list){
    for(var i=0; i<list.length; i++){
      if (o.location == list[i].location){
        return true;
      }
    }
    return false;
  };

  var insertUpnpReponse_ = function(recv){
    var str = recv.data;
    var rawServerData = parseResponse_(str);
    if(checkOverlappedDevice_(rawServerData, upnpResponse)) return;
    upnpResponse.push(rawServerData);
    console.log(rawServerData)
  };

  var parseResponse_ = function(data) {
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
  };


  var getInformation_ = function(devices, beginRn, callback){

    for(var rn=beginRn; rn<upnpResponse.length; rn++){
      var deviceDescURL = upnpResponse[rn].location;
      var originURL = upnpResponse[rn].location.split("/").slice(0,3).join("/")+ "/";
      console.log(originURL)

      var root = new Root(upnpResponse[rn]);
      root.rootNum = rn;
      root.originURL = originURL;
      root.devices = [];
      allRootList.push(root);
      getDeviceDesc_(devices, rn, callback)

    }
  };


  var getDeviceDesc_ = function(devices, rn, callback){

    var root = allRootList[rn];
    var deviceDescURL = root.location;
    var originURL = root.originURL;

    $.ajax({
      type: "GET",
      url: deviceDescURL,
      dataType: "xml",
      success : function(deviceDescXML){
      
        if($(deviceDescXML)[2] == undefined){
          var deviceDesc = new Xml($(deviceDescXML).find("root")[0]);
        }else{
          var deviceDesc = new Xml($(deviceDescXML)[2]);
        }

        var localDevices = deviceDesc.data.search("device");

        for(var ldn=0; ldn<localDevices.length; ldn++){
          var device = new Device(localDevices[ldn]);
          device.deviceDescURL = deviceDescURL;
          device.deviceNum = devices.length;
          devices.push(device);
          var dn = device.deviceNum;

          device.services = [];
          if(device.serviceList){
            var services = device.serviceList.service;
          }else{
            var services = device.servicelist.service;
          }
          if(services.length == 0){
            var s = services;
            services = [];
            services[0] = s;
          } 

          devices[dn].serviceCount = services.length;
          devices[dn].gotServiceCount = 0;

          for(var sn=0; sn<services.length; sn++){

            var service = new Service(services[sn]);

            //add attributions to service
            service.deviceNum = dn;
            service.serviceNum = sn;
            if (service.SCPDURL){
              service.SCPDURLFull = getFullURL(originURL, service.SCPDURL);
            }else{
              service.SCPDURLFull = getFullURL(originURL, service.scpdurl);
            }
            if(service.controlURL){
              service.controlURLFull = getFullURL(originURL, service.controlURL);
            }else{
              service.controlURLFull = getFullURL(originURL, service.controlurl);
            }

            //add service to service list
            device.services.push(service);

            service.actions = [];

            getSCPD_(devices, service, rn, dn, sn, callback);

          }

        }

      }

    })

  }

  var getSCPD_ = function(devices, service, rn, dn, sn, callback){

    $.ajax({
      type: "GET",
      url: service.SCPDURLFull,
      dataType: "xml",
      success: function(scpdXML, status, xhr){

        var scpd = new Xml($(scpdXML).find("scpd")[0]);
        var actions = scpd.data.search("action")
        var stateVariables = scpd.data.search("stateVariable")

        for(var an=0; an<actions.length; an++){
          var action = new Action(actions[an]);
          action.deviceNum = dn;
          action.serviceNum = sn;
          action.actionNum = an;
          var arguments = actions[an].search('argument')
          for(var argn=0; argn<arguments.length; argn++){
            var argType = arguments[argn]['relatedStateVariable']
            var dataType = searchInStateVariables_(stateVariables, argType)
            if(action.argumentList.argument.length == 0){
              var s = action.argumentList.argument
              action.argumentList.argument[0] = []
              action.argumentList.argument[0] = s;
            }
            action.argumentList.argument[argn]['dataType'] = dataType;
            if(action.argumentList.argument[argn]['direction'] == 'IN') action.argumentList.argument[argn]['direction'] = 'in'
            if(action.argumentList.argument[argn]['direction'] == 'OUT') action.argumentList.argument[argn]['direction'] = 'out'

          }
          service.actions.push(action);

        }

        devices[dn].gotServiceCount += 1;
        if (devices[dn].serviceCount == devices[dn].gotServiceCount){
          callback(devices[dn]);
        }
      }
    });
  };


  DeviceManager.prototype.deleteAll = function(){

    upnpResponse = [];
    allRootList = [];
    this.devices = [];

  };

  var searchInStateVariables_ = function(stateVariables, argType){

    for(var svn=0; svn<stateVariables.length; svn++){
      if(stateVariables[svn].name == argType){
        return stateVariables[svn].dataType
      }
    }
    return null;
  };

  DeviceManager.prototype.search = function(callback){
    var beginRn = upnpResponse.length;
    var self = this;
    var dm = self;
    this.upnp.onready = function(){
      this.listen(insertUpnpReponse_);
      this.search("upnp:rootdevice");
      setTimeout(function(){getInformation_(dm.devices, beginRn, callback)}, 2000);
    }
    this.upnp.start();
  }

})();

