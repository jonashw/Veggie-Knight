var Controls = function(gameLoop,veggieLauncher){
	return {
		init: function(){
			document.addEventListener('keyup',function(e){
				if(e.which == 32){//spacebar
					veggieLauncher.launch(VeggieFactory.randomSet());
				}
				if(e.which == 17){//Ctrl
					gameLoop.playPause();
				}
				//console.log(e.which);
			});
		}
	};
};
