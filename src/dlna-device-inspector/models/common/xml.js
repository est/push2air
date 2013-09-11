var Xml;

(function(){

	Xml = function(xml){		
		this.xml = xml;
		this.data = [];
		this.parse();
	}

	Xml.prototype.parse = function(){
		var parsed = [];
		getDescendant(this.xml, parsed, 0);
		this.data = parsed;
	}

	Array.prototype.search = function(name){
		var o = this;
		var res = [];
		searchDescendant(o, res, name);
		return(res);
	}

	searchDescendant = function(o, res, name){

		if(typeof(o) == "object"){
			var keys = Object.keys(o);
			for(var k=0; k<keys.length; k++){
				var key = keys[k];
				if(key == name){
					if(o[key].length == 0){
						res.push(o[key]);
					}
					else {
						for(var i=0; i<o[key].length; i++){
							res.push(o[key][i]);
						}
					}
				}
				searchDescendant(o[key], res, name);
			}
		}
	}


	getDescendant = function(xml, o, num){

		if(num == 0){
			var parentName = getXmlTagName(xml);
		}
		else{
			var parentName = num;
		}

		var children = xml.childNodes;

		o[parentName] = [];

		for(var i=0; i<children.length; i++){
			var c = children[i];
			var childName = getXmlTagName(c);

			if(childName != null){
				if(o[parentName][childName] == undefined){
					o[parentName][childName] = [];
					getDescendant(c, o[parentName], 0);
				}
				else{
					if(typeof(o[parentName][childName]) != "object" || o[parentName][childName][1] == undefined){
						var swp = o[parentName][childName];
						o[parentName][childName] = [];
						o[parentName][childName][0] = swp;
					}

					var j = o[parentName][childName].length;
					o[parentName][childName].push([]);
					o[parentName][childName][j] = [];

					if(childName){
						getDescendant(c, o[parentName][childName], j);
					}
				}

			}
			else{
				if(c.nodeValue.trim() != ""){
					o[parentName] = c.nodeValue;
				}
			}
		}
	}


	getXmlTagName = function(o){

		$("body").append("<div id=test>");
		var text = $("div#test").append($(o).clone()).html();
		$("div#test").remove();

		var a = text.split("");

		var nameBegin=-1, nameEnd=-1;
		for(var i=0; i<a.length; i++){
			if (a[i] == '<'){
				nameBegin = i+1;
			}
			else if(a[i] == '>' || a[i] == ' '){
				nameEnd = i;
				break;
			}
		}

		if(0 < nameBegin && nameBegin < nameEnd){
			var name = a.slice(nameBegin, nameEnd).join("");
			return name;
		}

		return null;

	}


})();
