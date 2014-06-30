aw.ajax = {
	json: function(config){
		config = config || {};
		config.data = config.data || {};
		// 同步异步
		if(aw.type(config.async) == 'undefined')
			config.async = true;

		// 未定义url 直接报错
		if(!config.url)
			throw new Error('请求地址未定义!');

		$.ajax({
			type: config.type || 'get',
			url: config.url,
			data: config.data,
			async: config.async,
			dataType: "json",
			error: function(data){
				aw.ajax.netBad(data, config);
				config.done && config.done(false);
			},
			/**
			 * data必须包含：
			 *
			 * errno: 0000 => success other => error
			 *
			 * @param data
			 */
			success: function(data){
				if(data.errno === '0000'){
					config.success && config.success(data);
					config.done && config.done(true);
					return;
				}
				aw.ajax.error(data, config);
				config.done && config.done(false);
			}
		});
	},
	error: function(data, config){
		config.error && config.error(data);

		if(config.isNotPop) return;

	},
	netBad: function(data, config){
		config.netBad && config.netBad(data)
	}
}