function dlnaAccept(listenSid, s){

  console.log(s);

  chrome.socket.read(listenSid, 65535, function(readInfo){

    if(readInfo.resultCode < 0) {
      return;
    }

    var req = s.ab2t(readInfo.data);
    var headers = s.extractHeader(req);
    var params = s.extractParams(req);
    if(!params['url']) return;

    var method = headers['requestLine'].split(" ")[0];
    var proxyURL = 'http://' + headers['Host'] + ':8080';
    var AVURL = proxyURL + headers['requestLine'].split(" ")[1];
    console.log(AVURL);

    var newHeader = 'HTTP/1.1 200 OK' + CRLF;
    var respAb = s.t2ab(newHeader);
    chrome.socket.write(listenSid, respAb, function(writeInfo){})
    chrome.socket.destroy(listenSid);

    chrome.socket.create('tcp', {}, function(createInfo) {
      var outSid = createInfo.socketId;
      console.log(params)
      var host = params['url'].split('/')[2];
      var port = 80;

      chrome.socket.connect(outSid, host, port, function(res) {

        chrome.socket.getInfo(outSid, function(res){
          console.log(outSid);
          if(headers['HOST']) headers['HOST'] = params['url'].split('/')[2];
          if(headers['Host']) headers['Host'] = params['url'].split('/')[2];
          var outPath = '/' + params['url'].split('/').slice(3).join('/');

          var newHeader = method + ' ' + outPath +  ' HTTP/1.1' + CRLF;
          newHeader += s.createHeader(headers);
          newHeader += CRLF;
          var respAb = s.t2ab(newHeader);

          chrome.socket.write(outSid, respAb, function(writeInfo){

            chrome.socket.read(outSid, 65535, function(readInfo){
              var outRes = s.ab2t(readInfo.data);

              chrome.socket.getInfo(listenSid, function(res){
                console.log(listenSid);

                var targetDevices = manager.searchByDeviceType('MediaRenderer');
                console.log(targetDevices);
                targetDevices.forEach(function(d){

                  var service = d.searchServiceByServiceType('AVTransport');
                  var inputList = {};

                  var id = d.searchIDByAction('Stop');
                  console.log(id);
                  inputList = {};

                  inputList['InstanceID'] = 0;

                  var callback = function(xml, output){
                    console.log(xml);
                    console.log(output);

                    var id = d.searchIDByAction('SetAVTransportURI');
                    console.log(id)

                    var inputList = {};
                    inputList['InstanceID'] = 0;
                    inputList['CurrentURI'] = AVURL;
                    var callback = function(xml, output){


                      var id = d.searchIDByAction('Play');
                      console.log(id);
                      var inputListd= {};
                      inputList['InstanceID'] = 0;
                      inputList['Speed'] = 1;
                      var callback = function(xml, output){
                        console.log(xml);
                        console.log(output);
                      }

                      messenger.messageToDevice(id, inputList, callback);


                    }
                    messenger.messageToDevice(id, inputList, callback);


                  }
                  console.log("send message")
                  messenger.messageToDevice(id, inputList, callback);


                })

              })

            })

          });
        })
      })
    })
    
  });

}


var DLNAServer = function(port) {

  this.server = new Server(port, dlnaAccept);
  
}

var dlnaServer = new DLNAServer(9090);

