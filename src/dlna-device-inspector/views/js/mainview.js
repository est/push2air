var MainView;

(function(){

  MainView = function(){
    
    this.messageSelector = "#inputModal .modal-body";
    this.responseSelector = "#outputModal .modal-body";

  };


  MainView.prototype.getSelector = function(id, opt){
    var selector = "";
    if(!!id.device)   selector += "#device" + id.device;
    if(!!id.service)  selector += " #service" + id.service;
    if(!!id.action)   selector += " #action" + id.action;
    if(!!id.arg)      selector += " #arg" + id.arg;
    if(!!opt)         selector += opt;

    return selector;

  }

  MainView.prototype.clearDevices = function(){
    $("#devices").html("");
  }

  MainView.prototype.showResButton = function(id){

    var classes = $("#btn_show_output_act" + id.device + "_" + id.service + "_" + id.action).attr("class").split(" ")

    //Set Class
    var new_classes = []
    for(var i=0; i<classes.length; i++){
      if(classes[i] != 'disabled')
      new_classes.push(classes[i])
    }
    new_classes = new_classes.join(" ")

    $("#btn_show_output_act" + id.device + "_" + id.service + "_" + id.action).attr("class", new_classes);
    //Set URL
    $("#btn_show_output_act" + id.device + "_" + id.service + "_" + id.action).attr("href", "#outputModal");

  }


  MainView.prototype.showDevice = function(deviceData, id){

    var label_class, bg_class;

    //set color of the badge
    if(deviceData['deviceTypeShort'] == 'MediaServer'){
      //blue
      label_class = "label label-info";
      bg_class = "alert alert-info";
    }else if(deviceData['deviceTypeShort'] == 'MediaRenderer'){
      //red
      label_class = "label label-important";
      bg_class = "alert alert-error";
    }else {
      label_class = "label";
      bg_class = "well well-small";
    }

    $("#devices").append(
      '<div class="accordion-group" class="device" id=device' + id.device + '>' 
      + '<div class="accordion-heading ' + bg_class + '">' 
        + '<a class="accordion-toggle" id=device_title data-toggle="collapse" data-parent="#accordion" href="#collapse'+ id.device + '">' 
          + '<h5>' 
            + id.device + ' ' 
            + '<span class="' + label_class + '">' + deviceData['deviceTypeShort'] + "</span>　" 
            + deviceData['friendlyName'] 
          + '</h5>' 
        + '</a>' 
      + '</div>' 
      + '<div id="collapse' + id.device + '" class="accordion-body collapse">' 
        + '<div class="accordion-inner device_desc">' 
        + '</div>' 
        + '<div class="accordion-inner' + ' ' + bg_class + ' ' + 'services' + '">' 
        + '</div>' 
      + '</div>' 
    + '</div>'
    )

  };


  MainView.prototype.showDeviceDesc = function(deviceData, id){

    $("#device" + id.device + " .device_desc").append(
        '<p>' + 'Device Type : ' +  deviceData['deviceType'] 
      + '<p>' + 'Device Description URL : '
        + '<a href=' + deviceData['deviceDescURL'] + 'target=_brank>' 
          + deviceData['deviceDescURL'] 
        + "</a>"
    );
  };


  MainView.prototype.showService = function(serviceData, id){

    $("#device" + id.device + " .services").append(
      '<div id=service' + id.service + '>' 
        + '<h5>Service Type : ' + serviceData['serviceTypeShort'] + '</h5>' 
        + '<ul class=service_desc>'
        + '</ul>' +
      '</div>' + 
      '<hr>');
  }


  MainView.prototype.showServiceDesc = function(serviceData, id){

    var selector = "#device" + id.device + " #service" + id.service + " .service_desc"
    $(selector).append(
      '<li>' + 'Control URL: ' + 
      "<a href=" + serviceData['controlURLFull'] + " target=_blank>" + serviceData['controlURLFull'] + "</a>" +
      "<li>" + 'SCPD URL: ' + 
      "<a href=" + serviceData['SCPDURLFull'] + " target=_blank>" + serviceData['SCPDURLFull'] + "</a>" +
      "<div class=actions></div>"
    )
  }


  MainView.prototype.appendActionDiv = function(selector, id, actionName){

    $(selector).append(
      '<div class=action id=action' + id.action + '>' 
      + '<ul>' 
        + '<li>' 
          + '<div class=action_name><h4>' + id.device + id.service + id.action + " " + actionName + '</h4></div>' 
          + '<ul class=arg_list>' 
            + '<table><tr>' 
              + '<td>' 
                + '<table class="table table-borderd arg_table"></table>' 
              + '</td>'
              + '<td class=arg_space>'
              + '</td>' 
              + '<td>'
                + '<table class="btn_table"></table>'
              + '</td>' 
            + '</tr></table>'
          + '</ul>'
        + '</li>' 
      + '</ul>'
    + '</div>'
    )

  }

  MainView.prototype.showAction = function(actionList, id){

    var selector = "#device" + id.device + " #service" + id.service + " .actions"
    this.appendActionDiv(selector, id, actionList[id.action]['name'])

    if(actionList[id.action]['argumentList'] && actionList[id.action]['argumentList']['argument']){
      var arguments = actionList[id.action]['argumentList']['argument'];
      var dir = 'in';

      if(arguments.length == 0){
        var s = arguments;
        arguments = [];
        arguments.push(s);

      }
      var numArgs = arguments.length;
      for(var argNum=0; argNum<numArgs; argNum++){
        id.arg = argNum;
        selector = "#device" + id.device + " #service" + id.service + " #action" + id.action + " .arg_table"
        var argName = arguments[argNum]['name']
        var dir = arguments[argNum]['direction']
        var argType = arguments[argNum]['relatedStateVariable']
        var dataType = arguments[argNum]['dataType']
        this.appendArg(selector, id, argName, dir, argType, dataType)
      }
    }
    else{

      selector = "#device" + id.device + " #service" + id.service + " #action" + id.action + " .arg_table"
      $(selector).append(
        '<tr class=arg id=arg' + id.arg + '>' +
          "<td class=no_params colspan=3>" + 
          "No parameters are needed for this action." + 
          '</td>' +
        '</tr>' 
      )
    }

    selector = "#device" + id.device + " #service" + id.service + " #action" + id.action + " .btn_table"
    this.appendMessageButton(selector, id)

  }


  MainView.prototype.appendArg = function(selector, id, argName, dir, argType, dataType){

    var badge_class;
    var input;

    if(dir == 'in'){
      color_class = "control-group warning arg"
      badge_class = "badge badge-warning"
      input = '<input type="text" class=arg_input id="arg' + id.arg + 
      '" device_id=' + id.device+ ' service_id=' + id.service + 
      ' action_id=' + id.action+ ' arg_id=' + id.arg + ' placeholder=' + '(' + dataType + ')' + argType + '>'
    }else{
      color_class = "control-group error arg"
      badge_class = "badge badge-important"
      input = '<input type="text" class=arg_input id="arg' + id.arg + '" device_id=' + id.device+ ' service_id=' + id.service+ ' action_id=' + id.action+ ' arg_id=' + id.arg + ' placeholder=' + '(' + dataType + ')' + argType + ' disabled>'

    }

    $(selector).append(
        '<tr class=arg id=arg' + id.arg + '>' +
          "<td class=dir>" + 
            '<label class="control-label dir" for=action' + id.action+ '_arg' + id.arg + '>' + 
              '<span class="' + badge_class + ' dir">' + dir + '</span>' +
            '</label>' +
          '</td>' +
          '<td class=arg_name>' +
            '<span class=arg_name>' + 
            //id.root + " " + id.device + " " + id.service + " " + id.action + " " + id.arg + " " + 
            argName + '</span>' + "  " +
          '</td>' +
          '<td class=arg_input>' +
            input +
          '</td>' +
        '</tr>'
    )

  }


  MainView.prototype.appendMessageButton = function(selector, id){

    $(selector).append(
      '<tr><td>' +
        '<table><tr><td>' +
          '<div class=input_msg>' +
          '<a href="#inputModal" role="button" class="btn btn-info btn_show_input" id="btn_show_input_act' + id.action + '" btn_id = ' + id.action + ' device_id=' + id.device + ' service_id=' + id.service + ' action_id=' + id.action + ' data-toggle="modal">Message</a>' +
          '</div>' +
          '<div class=send_btn>' +
            '<button class="btn btn-primary btn_send" id="btn_send' + id.action + '" btn_id = ' + id.action + ' device_id=' + id.device + ' service_id=' + id.service + ' action_id=' + id.action + ' type="button"> Send SOAP<br>Message </button>' +
          '</div>' +
          '<div class=output_msg>' +
          '<a href="" role="button" class="btn btn-info btn_show_output disabled" id="btn_show_output_act' + id.device + "_" + id.service + "_" + id.action + '" btn_id = ' + id.action + ' device_id=' + id.device + ' service_id=' + id.service + ' action_id=' + id.action + ' data-toggle="modal" >Response</a>' +
          '</div>' +
        '<td></tr></table>' +
      '</td></tr>' 
    )

  }


  MainView.prototype.insertResponse = function(id, res){

    var args = [];
    var action = manager.getActionByID(id);
    if(action.argumentList){
      var args = action.argumentList.argument;

      if(args.length == 0){
        s = args;
        args = []
        args[0] = s; 
      }

      console.log(args)

      for(var argNum=0; argNum<args.length; argNum++){
        id.arg = argNum;
        var dir = args[argNum]['direction'];
        if(dir == 'in'){
          var value = res.inList[args[argNum]['name']];
          var selector = this.getSelector(id, " input")
          $(selector).val(value);
        }else if(dir == 'out'){
          console.log(res)
          var value = res.outList[args[argNum]['name']];
          console.log(value)
          if(value == "") value = " ";
          var selector = this.getSelector(id, " input")
          $(selector).val(value);
        }
      }
    }
  }


  MainView.prototype.showMessage = function(msg_txt, selector){
    msg_txt = escapeHTML(msg_txt);
    $(selector).empty().append('<textarea>' + msg_txt + '</textarea>')
  }


  MainView.prototype.showInputMessage = function(inText){
    console.log(inText)
    this.showMessage(inText, this.messageSelector);
  }

  MainView.prototype.showOutputMessage = function(id, resText, resList){
    console.log(resList)
    this.insertResponse(id, resList);
    this.showResButton(id);
    this.showMessage(resText, this.responseSelector);
  }


  MainView.prototype.showURL = function(url){
    $('#server_url').append("<a href=" + url + " target=_blank>" + url + "</a>");
  }


})();

