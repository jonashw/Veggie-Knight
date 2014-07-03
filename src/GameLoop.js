var GameLoop = function(stage){
	var _interval;
	var _loop = function(){
		stage.update();
		stage.draw();
	};
	var _obs = {
		start:[],
		stop:[]
	};
	function notify(evnt){
		_obs[evnt].forEach(function(fn){
			fn();
		});
	}
	return {
		isRunning: function(){
			return !!_interval;
		},
		start: function(){
			_loop();
			_interval = setInterval(_loop,20);
			notify('start');
		},
		stop: function(){
			clearInterval(_interval);
			_interval = null;
			notify('stop');
		},
		playPause: function(){
			if(this.isRunning()){
				this.stop();
			} else {
				this.start();
			}
		},
		on: function(evnt,fn){
			_obs[evnt].push(fn);
		}
	};
};
