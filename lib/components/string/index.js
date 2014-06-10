aw.util.string = {
	format: function(source, params){
		var self = this;
		if(arguments.length === 1){
			return function(){
				var args = [].slice.call(arguments, 0);
				args.unshift(source);
				return self.format.apply(this, args);
			}
		}

		if(arguments.length > 2 && params.constructor !== Array){
			params = [].slice.call(arguments, 1);
		}

		if (params.constructor !== Array) {
			params = [params];
		}

		$.each(params, function(i, n) {
			source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function() {
				return n;
			});
		});
		return source;

	}
}