var Controls = (function(){
	return {
		init: function(){
			document.addEventListener('keyup',function(e){
				if(e.which == 32){//spacebar
					VeggieLauncher.launch(VeggieFactory.randomSet());
				}
				if(e.which == 17){//Ctrl
					GameLoop.playPause();
				}
				//console.log(e.which);
			});
		}
	};
})();
