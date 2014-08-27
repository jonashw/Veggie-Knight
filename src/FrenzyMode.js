function FrenzyMode(launcher, totalDuration){
	var unitDuration = 2000;
	function launch(launchFnKey,timeLeft){
		var veggies = VeggieFactory.randomSet(Random.range(6,10));
		launcher[launchFnKey](veggies);
		var _timeLeft = timeLeft == null
			? (totalDuration || 10000)
			: timeLeft;
		if(_timeLeft <= 0) return;
		setTimeout(function(){
			launch(launchFnKey, _timeLeft - unitDuration - unitDuration);
		}, unitDuration);
	}
	//set things in motion, one side lagging slightly behind the other
	var keys = Random.shuffle(['frenzyLeft','frenzyRight']);
	launch(keys[0]);
	setTimeout(function(){
		launch(keys[1]);
	},500);
}
