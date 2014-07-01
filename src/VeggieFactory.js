var VeggieFactory = (function(){
	var sprites = {
		onion: {
			x: 0,
			y: 0,
			w: 155,
			h: 200
		},
		bellpepper: {
			x: 355,
			y: 13,
			w: 150,
			h: 250
		},
		broccoli: {
			x: 730,
			y: 3,
			w: 170,
			h: 250
		},
		squash: {
			x: 1155,
			y: 3,
			w: 85,
			h: 280
		},
		celery: {
			x: 1435,
			y: 10,
			w: 170,
			h: 400
		}
	};
	var spriteKeys = (function(){
		var _keys = [];
		for(var k in sprites){
			_keys.push(k);
		}
		return _keys;
	})();
	return {
		fullSet: function(){
			var veggies = [];
			spriteKeys.forEach(function(k){
				veggies.push(
					new Veggie(sprites[k]));
			});
			return veggies;
		},
		random: function(){
			var i = Math.floor(Math.random() * spriteKeys.length);
			var k = spriteKeys[i];
			return new Veggie(sprites[k]);
		},
		randomSet: function(){
			var veggies = [];
			var n = Math.floor(Math.random() * 5) + 1; //no more than 6 at once
			for(var i=0; i<n; i++){
				veggies.push(this.random());
			}
			return veggies;
		}
	};
})();
