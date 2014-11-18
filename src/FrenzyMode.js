function FrenzyMode(gameLoop, launcher, totalDuration, bgImg){
	var _interval;
	var unitDuration = 2000;
	function launchSide(launchFnKey,timeLeft){
		var veggies = VeggieFactory.randomSet(Random.range(6,10));
		launcher[launchFnKey](veggies);
		var _timeLeft = timeLeft == null
			? (totalDuration || unitDuration)
			: timeLeft;
		if(_timeLeft <= 0){
			return;
		}
		setTimeout(function(){
			launchSide(launchFnKey, _timeLeft - unitDuration);
		}, unitDuration);
	}

	return new Mode(gameLoop,function(){
		//set things in motion, one side lagging slightly behind the other
		var keys = Random.shuffle(['frenzyLeft','frenzyRight']);
		launchSide(keys[0]);
		setTimeout(function(){
			launchSide(keys[1]);
		},500);
	}, 6000, bgImg);
}
