function TodoCtrl($scope) {
  $scope.todos = [
    {text:'learn angular', done:true},
    {text:'build an angular Chrome packaged app', done:false}];

$scope.addTodo = function() {
    $scope.todos.push({text:$scope.todoText, done:false});
    $scope.todoText = '';
  };

$scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };

$scope.archive = function() {
    var oldTodos = $scope.todos;
    $scope.todos = [];
    angular.forEach(oldTodos, function(todo) {
      if (!todo.done) $scope.todos.push(todo);
    });
  };
}

var UpnpManager;
(function(){
  var socket = chrome.socket;

  var M_SEARCH_REQUEST = "M-SEARCH * HTTP/1.1\r\n" +
    "MX: 3\r\n" +
    "HOST: 239.255.255.250:1900\r\n" +
    "MAN: \"ssdp:discover\"\r\n" +
    "ST: {{st}}\r\n\r\n";
  UpnpManager = function(){};
  UpnpManager.prototype.start = function() {
    this.sid = null;
    this.IP = "239.255.255.250";
    this.PORT = 1900;

    var self = this;
    socket.create('udp', {}. function(socketInfo){
      self.sid = socketInfo.socketId;
      socket.bind(self.sid, "0.0.0.0", 0, function(res){
        if(res!==0){
          throw('Failed to bind socket');
        }
        self.onready;
      })
    })
  };
  UpnpManager.prototype.onready = function() { };
  UpnpManager.prototype.search = function(st, callback) {
    // body...
  };
})