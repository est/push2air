var NetworkService;

(function(){

	NetworkService = function(service){
		this.id = "";
		this.name = "";
		this.type = "";
		this.url = "";      //control URL
		this.config = "";
		this.online = "";

	};

  NetworkService.prototype.onnotify = function(callback){

  };

  NetworkService.prototype.onserviceonline = function(callback){

  };

  NetworkService.prototype.onserviceoffline = function(callback){

  };
  
})();