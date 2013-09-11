describe("Server", function(){

	var server;

	//beforeEach(funciton(){
		server = new Server();
	//});

	it("can return the Array Buffer", function(){
		expect(server.t2ab("aaaa")).toEqual("Hello World!");
	})
})