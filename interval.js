function interval(func, wait, times) {
	var interv = (function(w, t) {
		function i() {
			if (typeof t === 'undefined' || t === '*' || t-- > 0) {
				setTimeout(interv, w);
				
				try {
					func.call(null);
				} catch(e) {
					t = 0;
					
					throw e.toString();
				}
			}
		}
		
		i.clear = function() { t = 0; return null; }
		
		return i;
	})(wait, times);
	
	setTimeout(interv, wait);
	
	return { clear : interv.clear }
}
