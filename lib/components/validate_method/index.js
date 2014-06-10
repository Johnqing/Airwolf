var setMethod = aw.ui.validate.setMethod;
var fm = aw.util.form;
/**
 * 异步验证
 *
 * {
	 * remote: {
	 *      url: 'xxx',
	 *      data: {
	 *          qid: 123
	 *      }
	 *  }
	 * }
 *
 * @param value
 * @param el
 * @param rule
 * @returns {*}
 */
setMethod('remote', function(value, el, rule){
	var self = this;

	var previous = self.previousValue(el);

	if (previous.old === value) {
		return previous.valid;
	}
	previous.old = value;

	var param = rule.parameters;
	param = typeof param === "string" && {url: param} || param;

	self.startRequest(rule.key);

	var data = {};

	if(param.data){
		for(var key in param.data){
			var item = param.data[key];
			data[key] = typeof item == 'function' ? item() : item;
		}
	}

	aw.ajax.json({
		isNotPop: true,
		url: param.url,
		dataType: "json",
		data: data,
		success: function(res){
			var submitted = self.formSubmitted;
			self.formSubmitted = submitted;
			self.successList.push(rule.key);
			self.showSuccess();
			previous.valid = true;
		},
		error: function(){
			var error = message[rule.key]['remote'];
			self.showErrors(error);
			previous.valid = false;
		},
		done: function(valid){
			self.stopRequest(rule.key, valid);
		}
	});

	return 'pending';
});
/**
 * 空
 */
setMethod('required', function(value, el){
	if (el[0].nodeName.toLowerCase() === 'select') {
		var v = el[0].value;
		if(v === '0') return true;
		return !!v;
	}
	if (fm.checkable(el)) {
		return fm.getLength(value, el) > 0;
	}
	return $.trim(value).length > 0;
});
/**
 * 确认xx(例如：确认密码)
 */
setMethod('equalTo', function(value, el, rule){
	var self = this;
	var target = self.nodes_cache[rule.parameters];

	return value === aw.util.form.elValue(target);
});
/**
 * 范围:
 *
 * [5, 8]
 *
 */
setMethod('range', function(value, el, rule){
	var param = rule.parameters;
	return value >= param[0] && value <= param[1];
});
