function Mode(gameLoop,launchFn,launchInterval){
	var _interval;
	return {
		start: function(){
			launchFn();
			_interval = setInterval(function(){
				if(gameLoop.isRunning()){
					launchFn();
				}
			}, launchInterval);
		},
		stop: function(){
			clearInterval(_interval);
		}
	};
}
