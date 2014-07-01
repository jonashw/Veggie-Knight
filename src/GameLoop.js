var GameLoop = (function(){
	var _interval;
	var _loop = function(){
		Stage.update();
	};
	return {
		start: function(){
			_loop();
			_interval = setInterval(_loop,20);
		},
		stop: function(){
			clearInterval(_interval);
			_interval = null;
		},
		playPause: function(){
			if(!!_interval){
				this.stop();
			} else {
				this.start();
			}
		}
	};
})();
