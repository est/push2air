function proxyAccept(inSid, s){

  //console.log(s);

  chrome.socket.read(inSid, 65535, function(readInfo){

    if(readInfo.resultCode < 0) {
      return;
    }

    var req = s.ab2t(readInfo.data);
    //console.log(req);
    var headers = s.extractHeader(req);
    var params = s.extractParams(req);
    var method = headers['requestLine'].split(" ")[0];
    var path = headers['requestLine'].split(" ")[1];

    chrome.socket.create('tcp', {}, function(createInfo) {
      var outSid = createInfo.socketId;
      var host = params['url'].split('/')[2];
      var port = 80;

      chrome.socket.connect(outSid, host, port, function(res) {
        //console.dir(res);

        chrome.socket.getInfo(outSid, function(res){
          //console.log(res);
          if(headers['HOST']) headers['HOST'] = params['url'].split('/')[2];
          if(headers['Host']) headers['Host'] = params['url'].split('/')[2];
          var outPath = '/' + params['url'].split('/').slice(3).join('/');

          var newHeader = method + ' ' + outPath +  ' HTTP/1.1' + CRLF;
          newHeader += s.createHeader(headers);
          newHeader += CRLF;
          //console.log(newHeader);
          var respAb = s.t2ab(newHeader);

          chrome.socket.write(outSid, respAb, function(writeInfo){

            chrome.socket.read(outSid, 65535, function(readInfo){
              var outRes = s.ab2t(readInfo.data);

              chrome.socket.getInfo(inSid, function(res){

                var read_ = function() {
                  chrome.socket.read(outSid, 65535, function(readInfo) {
                    if(readInfo.resultCode > 0) {
                      chrome.socket.write(inSid, readInfo.data, function(writeInfo){
                        if(writeInfo.bytesWritten > 0) {
                          read_();
                        } else {
                          chrome.socket.destroy(inSid);
                          chrome.socket.destroy(outSid);
                        }
                      });
                    } else {
                      //console.log("resultCode <= 0 : " + readInfo.resultCode);
                      chrome.socket.destroy(inSid);
                      chrome.socket.destroy(outSid);
                    }
                  });
                }

                chrome.socket.write(inSid, s.t2ab(outRes), function(writeInfo){
                  //rtw(inSid);
                  if(writeInfo.bytesWritten > 0) {
                    read_();
                  } else {
                    chrome.socket.destroy(inSid);
                    chrome.socket.destroy(outSid);
                  }
                })

              })

            })

          });
        })
      })
    })
    
  });

}


var Proxy = function(port) {

  this.server = new Server(port, proxyAccept);
  
}

var proxy = new Proxy(8080);

