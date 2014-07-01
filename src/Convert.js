var Convert = (function(){
	var radsPerDegree = Math.PI/180;
	return {
		degToRad: function(deg){
			return deg * radsPerDegree;
		}
	};
})();
