var ID = function(dn, sn, an, rn){
  this.device = dn+"";
  this.service = sn+"";
  this.action = an+"";
  this.arg = rn+"";
}


var RootList = function(){

  this.list = []
  this.count = 0;

}


RootList.prototype.add = function(root){

  root.rootSerialNum = this.count;
  this.list[this.count] = root;
  this.count += 1;

  return this.count-1;
}


var Root = function(data){

  keys = Object.keys(data)
  for(var k=0; k<keys.length; k++){
    this[keys[k]] = data[keys[k]]
  }

}


var DeviceList = function(){

  this.list = []
  this.count = 0;

}


DeviceList.prototype.add = function(device){

  this.list[this.count] = device;
  this.count += 1;

  return this.count-1;
}


var Device = function(data){

  keys = Object.keys(data)
  for(var k=0; k<keys.length; k++){
    this[keys[k]] = data[keys[k]]
  }

  if(data.deviceType){
    this["deviceTypeShort"] = data.deviceType.split(":")[3]
  }else{
    this["deviceTypeShort"] = data.devicetype.split(":")[3]
  }

}

Device.prototype.searchServiceByServiceType = function(serviceTypeShort){
  var matched;
  this.services.forEach(function(s){
    if(s.serviceTypeShort.toLowerCase() == serviceTypeShort.toLowerCase()) {
      matched = s;
    }
  })
  return matched;
}

Device.prototype.searchIDByAction = function(action){
  var matched = [];
  var id;
  var self = this;

  self.services.forEach(function(s){
    s.actions.forEach(function(a){
      if(a.name.toLowerCase() == action.toLowerCase()) {
        id = new ID(self.deviceNum, s.serviceNum, a.actionNum);
      }
    })
  })

  return id;

}


var ServiceList = function(data){

  this.list = []
  this.count = 0;

}


var Service = function(data){

  keys = Object.keys(data)
  for(var k=0; k<keys.length; k++){
    this[keys[k]] = data[keys[k]]
  }

  if(data.serviceType){
    this["serviceTypeShort"] = data.serviceType.split(":")[3];
  }else{
    this["serviceTypeShort"] = data.servicetype.split(":")[3];
  }
  //this["serviceTypeShort"] = data.serviceType.split(":")[3];

}


ServiceList.prototype.add = function(service){

  this.list[this.count] = service;
  this.count += 1;

  return this.count-1;
}


var Action = function(data){

  keys = Object.keys(data)
  for(var k=0; k<keys.length; k++){
    this[keys[k]] = data[keys[k]]
  }

}


var ActionList = function(action){
  this.list = []
  this.count = 0;
}


ActionList.prototype.add = function(action){

  this.list[this.count] = action;
  this.count += 1;

  return this.count-1;
}
