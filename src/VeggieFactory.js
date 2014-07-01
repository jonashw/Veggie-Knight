var VeggieFactory = (function(){
	var sprites = {
		onion: {
			x: 0,
			y: 0,
			w: 155,
			h: 200,
	        splits: [
				{
					x: 173,
					y: 4,
					w: 151,
					h: 159
				},
				{
					x: 171,
					y: 171,
					w: 158,
					h: 134
				}
			],
			splitsAlongX:true,
			splitSeparation: 44
		},
		bellpepper: {
			x: 355,
			y: 13,
			w: 150,
			h: 250,
	        splits: [
				{
					x: 555,
					y: 15,
					w: 145,
					h: 213
				},
				{
					x: 538,
					y: 228,
					w: 144,
					h: 174
				}
			],
			splitsAlongX:true,
			splitSeparation: 55
		},
		broccoli: {
			x: 730,
			y: 3,
			w: 170,
			h: 250,
	        splits: [
				{
					x: 924,
					y: 20,
					w: 100,
					h: 246
				},
				{
					x: 1042,
					y: 10,
					w: 88,
					h: 257
				}
			],
			splitsAlongX:false,
			splitSeparation: 32
		},
		squash: {
			x: 1155,
			y: 3,
			w: 85,
			h: 280,
	        splits: [
				{
					x: 1255,
					y: 8,
					w: 74,
					h: 176
				},
				{
					x: 1258,
					y: 191,
					w: 71,
					h: 151
				}
			],
			splitsAlongX:true,
			splitSeparation: 50
		},
		celery: {
			x: 1435,
			y: 10,
			w: 170,
			h: 400,
	        splits: [
				{
					x: 1627,
					y: 19,
					w: 101,
					h: 189
				},
				{
					x: 1628,
					y: 241,
					w: 96,
					h: 130
				}
			],
			splitsAlongX:true,
			splitSeparation: 48
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
					new Veggie(k,sprites[k],true));
			});
			return veggies;
		},
		random: function(){
			var i = Math.floor(Math.random() * spriteKeys.length);
			var k = spriteKeys[i];
			return new Veggie(k,sprites[k],true);
		},
		randomSet: function(){
			var veggies = [];
			var n = Math.floor(Math.random() * 5) + 1; //no more than 6 at once
			for(var i=0; i<n; i++){
				veggies.push(this.random());
			}
			return veggies;
		},
		fullSplitSet: function(){
			var veggies = [];
			spriteKeys.forEach(function(k){
				sprites[k].splits.forEach(function(sprite){
					veggies.push(
						new Veggie(k,sprite,false));
				});
			});
			return veggies;
		}
	};
})();
