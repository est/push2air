var NetworkServices;

(function(){

	NetworkServices = function(service){

		this.length = 0;
		this.servicesAvailable = 0;

	};

	NetworkServices.prototype.push = function(vals){

		var offset = this.length;

		for(var i in vals){
			this[offset+i] = vals[i];
			this.length += 1;
		}
	}

	NetworkServices.prototype.getServiceById = function(id) {
		for(var i in this){
			if(this[i].id == id) return this[i];
		}
		return null;
	};

	NetworkServices.prototype.onserviceavailable = function(callback){

	};

	
	NetworkServices.prototype.onserviceunavailable = function(callback){

	};




})();