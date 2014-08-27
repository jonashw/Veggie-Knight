function NormalMode(gameLoop,veggieLauncher){
	return new Mode(gameLoop,function(){
		veggieLauncher.randomLaunch(VeggieFactory.randomSet());
	},2500);
}
