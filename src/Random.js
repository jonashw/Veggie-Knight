var Random = (function(){
	return {
		range: function(minN,maxN){
			return Math.floor(Math.random() * maxN) + minN;
		},
		shuffle: function(array){ //v1.0: http://dzone.com/snippets/array-shuffle-javascript 
			for(var j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
			return array;
		}
	};
})();
