var VeggieLauncher = (function(){
	function randomRotation(){
		var rot = Math.floor(Math.random() * 8) - 4;
		if (rot == 0){
			return Math.round(Math.random) ? 0.5 : 0.5;
		} else {
			return rot;
		}
	}

	return {
		launch: function(veggies){
			var x = 6 / (veggies.length + 0.5);
			veggies.forEach(function(veggie,i){
				veggie.pos.x = 70 * (i + x);
				veggie.pos.y = Stage.getHeight();
				veggie.vel.y = 6.5;
				veggie.rotVel = randomRotation();
				Stage.veggies.push(veggie);
			});
		}
	};
})();
