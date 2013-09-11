chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('views/index.html', {
    bounds: {
      width: 500,
      height: 309
    }
  });
});
