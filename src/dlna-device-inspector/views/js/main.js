var appWindow;

chrome.app.runtime.onLaunched.addListener(function(data){
  chrome.app.window.create('/views/main.html', {
    width: 1000,
    height: 600,
    type: 'panel'
  });
});
