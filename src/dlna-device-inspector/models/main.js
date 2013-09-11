var manager = new DeviceManager();
var messenger = new DLNAMessenger();
var devices = devices || [];
var view = view || new MainView();
var spinner = spinner || new Wheel();



var showDevices = function(device){

  spinner.stop();

  devices.push(device);
  var dn = devices.length-1;

  var id = new ID(dn, null, null);

  view.showDevice(device, id);
  view.showDeviceDesc(device, id);

  for(var sn=0; sn<device.services.length; sn++){
    var service = device.services[sn];

    var id = new ID(dn, sn, null);
    view.showService(service, id);
    view.showServiceDesc(service, id);

    for(var an=0; an<service.actions.length; an++){
      var action = service.actions[an];

      var id = new ID(dn, sn, an);
      view.showAction(service.actions, id);

    }
  }
};


$(function() {

  $("#refresh").click(function(){

    console.log("refresh!")
    manager.deleteAll();
    view.clearDevices();
    devices = [];

    spinner.start();
    manager.searchUpnpDevice(showDevices);

  })

  function getInputArgs(action, id){

    var inputList = [];

    if(action['argumentList'] && action['argumentList']['argument']){
      var args = action['argumentList']['argument'];

      if(args.length == 0){
        var s = args;
        args = []
        args[0] = s; 
      }

      var argCount = args.length;
      var inputList = [];

      for(argNum=0; argNum<argCount; argNum++){
        if (args[argNum]['direction'] == 'in'){

          id.arg = argNum+"";
          var selector = view.getSelector(id, " input");
          console.log(selector);
          var input = $(selector).val();
          console.log(input);
          if(input == undefined) input = '';
          var argName = args[argNum]['name'];
          inputList[argName] = input;
        }
      }
    }
    return inputList;
  }


  $(".btn_send").live("click", function(e){

    var btn = e.srcElement;
    var id = new ID($(btn).attr("device_id"), $(btn).attr("service_id"), $(btn).attr("action_id"));
    var selector = view.getSelector(id);

    var action = manager.getActionByID(id);
    var service = manager.getServiceByID(id);

    console.log(id.device + id.service + id.action + action['name'] + ' was clicked!')

    var inputList = getInputArgs(action, id);

    var callback = function(id, xml, output){
      var message = messenger.createXml(id, inputList);
      view.showInputMessage(message);
      view.showOutputMessage(id, xml, output);
    };

    messenger.messageToDevice(id, inputList, callback);

  })

  
  $(".btn_show_input").live("click", function(e){

    var btn = e.srcElement;
    var id = new ID($(btn).attr("device_id"), $(btn).attr("service_id"), $(btn).attr("action_id"));
    console.log(id);

    var action = manager.getActionByID(id);
    console.log(action)
    var service = manager.getServiceByID(id);
    console.log(service)

    var selector = view.getSelector(id);

    var inputList = getInputArgs(action, id);
    console.log(inputList);
    var message = messenger.createXml(id, inputList);
    view.showInputMessage(message);

  })

})


spinner.start();
manager.search(showDevices);

setInterval(function(){manager.search(showDevices);}, 10000);






