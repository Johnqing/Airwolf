aw.ajax = {
	json: function(config){
		config = config || {};
		// 同步异步
		if(aw.type(config.async) == 'undefined')
			config.async = true;

		// 未定义url 直接报错
		if(!config.url)
			throw new Error('请求地址未定义!');

		// qid添加
		if(typeof config.data == 'string'){
			config.data = aw.query2obj(config.data);
			config.data.qid = aw.config.qid;
		}

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
				data.result_code && (data.errno = data.result_code);
				data.result_msg && (data.error = data.result_msg);
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
		if(!config.isNotCheckLogin){
			// 1007: 超时
			// 1008: 未登录
			if(data.errno == '1007' || data.errno == '1008')
				return aw.login.exitLogin();
		}
		// 2005 => lock
		if(data.errno == '2005'){
			aw.ui.dialog.lock();
			return
		}

		config.error && config.error(data);

		if(config.isNotPop) return;

		aw.ui.dialog.error(data.error);

	},
	netBad: function(data, config){
		config.netBad && config.netBad(data)
	}
}