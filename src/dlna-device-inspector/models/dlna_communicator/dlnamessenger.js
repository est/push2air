var DLNAMessenger;

(function(){
  
  DLNAMessenger = function(){};

  var xmlHeader = '<?xml version="1.0" encoding="utf-8"?>'
    + '<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">'
    + '<s:Body>'

  var xmlFooter = '</s:Body>'
    + '</s:Envelope>'

  var defaultSettings = {
    InstanceID: 0,
    Speed: 1,
    Unit: 0,
    Target: "",
    NewPlayMode: 0,
    CurrentURI: "",
    CurrentURIMetaData: "" ,
    Channel: "Master",
    ConnectionID: 0, //ConnectionManager
    PresetName: "FactoryDefaults",
    DesiredVolume: 10,
    DesiredMute: 1,
    SetVolume: 10,
    ObjectID: 0,        //Content Directry
    BrowseFlag: 0,      //Content Directry - Browse
    Filter: 0,          //Content Directry
    StartingIndex: 0,   //Content Directry
    RequestedCount: 0,  //Content Directry
    SortCriteria: 0,    //Content Directry
    ContainerID: 0,     //Content Directry - Search
    SearchCriteria: 0,   //Content Directry - Search
    CurrentTagValue: 0,  //Content Directry - UpdateObject
    NewTagValue: 0,  //Content Directry - UpdateObject
    DeviceID: 0, //X_MS_MediaReceiverRegistrar
    RegistrationReqMsg: 0, //X_MS_MediaReceiverRegistrar - RegisterDevice
  };

  function setDefaultSettings(inputList){
    for(var key in inputList){
      if(inputList[key] == "" && defaultSettings[key] != undefined){
        inputList[key] = defaultSettings[key];
      }
    }
    return inputList;
  };

  DLNAMessenger.prototype.createXml = function(id, inputList){

    inputList = setDefaultSettings(inputList);
    this.inputList = inputList;

    var service = manager.getServiceByID(id);
    var serviceType = service['serviceType'];
    var actionName = service.actions[id.action]['name'];
    var args = [];
    var argCount = 0;

    if(service.actions[id.action]['argumentList'] && service.actions[id.action]['argumentList']['argument']){
      args = service.actions[id.action]['argumentList']['argument'];
      argCount = args.length;
    }

    var message = xmlHeader
    message += '<u:' + actionName + ' xmlns:u="' + serviceType + '">'

    for(argNum=0; argNum<argCount; argNum++){

      if(args[argNum].direction == "in"){
        var argName = args[argNum].name;
        message += '<' + args[argNum].name + '>' + inputList[args[argNum].name] + '</' + args[argNum].name + '>'
      }
    }
    message +='</u:'+ actionName +'>'
    message += xmlFooter
    return(message);
  }


  function getResponse(msg_obj, id){
    var args = [];
    var response = {};

    var action = manager.getActionByID(id);
    console.log(action);
    console.log(action['argumentList']);
    if(action['argumentList'] && action['argumentList']['argument']){
      args = action['argumentList']['argument'];
    }

    if(args){

      if(args.length == 0){
        s = args;
        args = []
        args[0] = s; 
      }

      var response = {}
      for(var argNum=0; argNum<args.length; argNum++){
        if(args[argNum].direction == "out"){
          var outTitle = args[argNum]['name']
          var argName = args[argNum]['name']

          var output = $(msg_obj).find(argName).text() || $(msg_obj).find(argName.toLowerCase()).text()

          response[outTitle] = output

        }
      }
    }

    return response;
  }

  DLNAMessenger.prototype.messageToDevice = function(id, inputList, callback){

    var service = manager.getServiceByID(id);
    var message = this.createXml(id, inputList);

    this.inputList = inputList;
    this.targetID = id;
    this.message = message;
    this.sendSoap(message, callback);

  }


  DLNAMessenger.prototype.sendSoap = function(message, callback){

    var self = this;
    var id = self.targetID;
    var service = manager.getServiceByID(id);
    console.log(service)
    var serviceType = service['serviceType'];
    var controlURL = service['controlURLFull'];
    var actionName = service.actions[id.action]['name'];

    if(service.actions[id.action]['argumentList'] && service.actions[id.action]['argumentList']['argument']){
      //var args = service.actions[id.action]['argumentList']['argument'];
    }

    console.log(message);

    $.ajax({
      type: "POST",
      url: controlURL,
      headers: {
        SOAPAction: serviceType + "#" + actionName
      },
      contentType: 'text/xml ; charset="utf-8"',
      dataType: "text",
      data: message,
      beforeSend: function(data){
        data.setRequestHeader("SOAPAction", '"' + serviceType + "#" + actionName + '"');
      },
      success: function(xml, status, xhr){
        console.log(self.inputList);
        var res = {};
        res.inList = self.inputList;
        res.outList = getResponse(xml, id);

        console.log(res)
        callback(id, xml, res);
      },
      error: function(xml, status, xhr) {
        var res = getResponse(xml, id);
        callback(id, xml, res);
      }
    })
  }

})();