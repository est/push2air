
var Spinner;

(function(){


  Spinner = function(){};


  var opts = {
   lines:   12,    // 回転する線の本数
   length:  7,     // 線の長さ
   width:   4,     // 線の太さ
   radius:  10,    // 線の丸み
   color: ' #000', // 線の色　#rgb or #rrggbb
   speed:   1,     // 1回転に要する時間 秒
   trail:   60,    // Afterglow percentage
   shadow:  false, // 線に影を付ける場合、true
   hwaccel: false  // Whether to use hardware acceleration
  };

  Spinner.prototype.start(target){

    var spinner = new Spinner(opts)
    spinner.spin(target);

  }

  Spinner.prototype.stop(target){

  }

})();