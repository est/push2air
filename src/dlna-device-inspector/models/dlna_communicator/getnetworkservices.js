var availableServiceRecords = availableServiceRecords || [];
var activeServiceManagers = [];


navigator.getNetworkServices = function(type, successCallback, errorCallback){

	//1
	var requestedControlTypes = [];

	//2,3
	if(type instanceof Array){
		for(var i in type){
			if(isValidServiceType(type[i])){
				requestedControlTypes.push(type[i]);
			}
		}
	}
	else if(typeof type == 'string'){
		if(isValidServiceType(type)){
			requestedControlTypes.push(type);
		}
	}

	console.log(requestedControlTypes.length);

	//4
	if(requestedControlTypes.length == 0) {
		if(typeof errorCallback == errorCallback) errorCallback(new NavigatorNetworkServiceError(2));
		return;
	}

	//5
	var servicesFound = [];

	//6
	for(var as in availableServiceRecords){
		var availableService = availableServiceRecords[as];

		for(var rct in requestedControlTypes){
			var requestedControlType = requestedControlTypes[rct];
			var matchedService = null;
			if(requestedControlType == availableService.type){
				matchedService = availableService;
				var service = new NetworkService(matchedService);
				servicesFound.push(service);
			}
		}
	}


	//10
	var services = [];

	//11
	if(servicesFound.length > 0){
		services = servicesFound; //user-authorized services
	}

	//12
	var entryScriptOriginsURL = [];

	//13
	for(var i in services){
		var service = services[i];
		entryScriptOriginsURL.push(service.url);
		if(service.type.substring(0,5) == 'upnp:' && !!service.eventsUrl){
			// setup a UPnP Events Subscription
		}
	}

	//14. Let services manager be a new NetworkServices object.
	var servicesManager = new NetworkServices();

	//15. Store requested control types against services manager as an internal variable.
	servicesManager.requestedControlTypes = requestedControlTypes;

	//16
	servicesManager.serviceAvailable = availableServiceRecords.length;

	//17
	if(services.length > 0) servicesManager.push(services);

	//18
	//servicesManager.length = services.length;

	//19
	activeServiceManagers.push(servicesManager);

	//20
	successCallback(servicesManager);

};


	var NavigatorNetworkServiceError = function(errorCode){
		this.code = errorCode;
	};

	var isValidServiceType = function(type){

		console.log(type)
		if(type.substring(0,5) == 'upnp:') return true;

		return false;

	};

(function(){

	function showServices( services ) {
		// Show a list of all the services provided to the web page
		for(var i = 0, l = services.length; i < l; i++) console.log( services[i].name );

	}

	function error( e ) {
  		console.log( "Error occurred: " + e.code );
	}

});
