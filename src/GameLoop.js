var GameLoop = function(stage){
	var _interval;
	var _loop = function(){
		stage.update();
		stage.draw();
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
};
