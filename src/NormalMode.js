function NormalMode(gameLoop,veggieLauncher,bgImg){
	return new Mode(gameLoop,function(){
		veggieLauncher.randomLaunch(VeggieFactory.randomSet());
	},2500,bgImg);
}
