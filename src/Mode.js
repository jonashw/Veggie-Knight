function Mode(gameLoop,launchFn,launchInterval,bgImg){
	var _interval;
	return {
		bgImg: bgImg,
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
