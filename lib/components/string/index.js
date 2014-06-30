aw.util.string = {
	/**
	 * 格式化字符串
	 * @param source
	 * @param params
	 * @returns {*}
	 */
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

	},
	/**
	 * 获取字符串字节数
	 * @param value
	 * @returns {Number|number}
	 */
	getByte: function(value){
		var len = value.length;
		var byte = len;
		for(var i=0; i<len; i++){
			var item = value[i];
			if(value.charCodeAt(item) > 277){
				byte++;
			}
		}
		return byte;
	}
}