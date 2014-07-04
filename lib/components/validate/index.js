var MESSAGES = {};
var method = {};
var defaultConfig = {
	ignore: 'data-validate-ignore',
	// 表单容器
	box: 'form',
	errorWrap: html,
	// 错误样式写入节点，并且会把错误信息，append到该节点
	errorParent: null,
	// 单项验证时的事件绑定
	eventType: 'blur',
	// 尽在点击submit时，验证
	isOnlySubmitCheck: false,
	// 单项验证时，不验证空白项
	isSkipNull: false,
	// 聚焦时message的样式
	focusCls: null,
	successCls: 'ui-validate-success',
	errorCls: 'ui-validate-error',
	// 手动触发提交
	handle: null,
	// 回调
	beforeCheck: null,
	checkMoreAll: null,
	// 验证成功，提交之前执行
	transitBefore: null,
	checkSingle: null,
	/**
	 * ajax 提交时的具体传值，可以覆盖
	 */
	submitAjax: function(st, fn){
		var self = this,
			config = self.config,
			box = self.box;

		var nodeChilds = box.find(':input:not(:button)')

		var conf = {
			isNotPop: config.isNotPop,
			url: box.attr("action"),
			type: box.attr("method"),
			data: aw.util.form.serialize(nodeChilds, config.prefix),
			success: function(data){
				config.success && config.success(data);
			},
			error: function(data){
				config.error && config.error(data);
			},
			done: function(){
				fn && fn();
			}
		}

		if(!config.handle){
			aw.ajax.json(conf);
			return;
		}
		config.handle.call(self, conf);

	}
}
/**
 * Validate Class
 * @type {*}
 */
var Validate = aw.Class.create({
	init: function(el, config){
		var self = this;
		self.el = el;
		config = self.config = aw.extend(defaultConfig, config);

		MESSAGES = aw.extend(MESSAGES, config.messages);

		var box = el.parents(config.box);
		box = box.length ? box : el.parents('form');
		// form/box都不存在 不执行
		if(!box.length) return;
		self.box = box;
		// 缓存nodes
		self.nodes_cache = {};
		//  阻止连续点击的阀门
		self.continuous = 0;
		// 错误列表
		self.errorList = [];
		self.pending = {};
		self.pendingRequest = 0;
		self.formSubmitted = null;

		self.reset();

		self.getItems(self.nodesEvent);

		self.submitEvent();

	},
	previousValue: function(el) {
		return $.data(el, "previousValue") || $.data(el, "previousValue", {
			old: null,
			valid: true
		});
	},
	startRequest: function(key) {
		if (!this.pending[key]) {
			this.pendingRequest++;
			this.pending[key] = true;
		}
	},
	stopRequest: function(key, valid) {
		var self = this;
		self.pendingRequest--;

		if (self.pendingRequest < 0) {
			self.pendingRequest = 0;
		}
		delete self.pending[key];
		if (valid && self.pendingRequest === 0 && self.formSubmitted) {
			self.el.trigger('click');
			self.formSubmitted = false;
		} else if (!valid && self.pendingRequest === 0 && self.formSubmitted) {
			self.formSubmitted = false;
		}
	},
	// 获取错误量
	size: function(){
		return this.errorList.length;
	},
	// 验证
	valid: function(){
		return this.size() === 0;
	},
	// 重置
	reset: function(){
		this.errorList = [];
		this.successList = [];
		this.errorMap = {};
	},
	checkAll: function(){
		var self = this;

		self.reset();

		var _caches = self.nodes_cache;

		for(var key in _caches){
			self.check(key, null);
		}

		return self.valid();
	},
	check: function(key, isSkipNull){
		var self = this;
		var config = self.config;
		var item = self.nodes_cache[key];
		var value = aw.util.form.elValue(item);
		var rules = config.rules[key];
		var result;

		if(!item.length){
			return true;
		}

		// 如果是非必填项，而且value是空 直接返回真并且删除log
		if(!rules['required'] && value == '') {
			return true;
		}

		// 如果元素上存在不需要验证的项，默认验证通过
		// 或者支持单项不验证空
		if(item.attr(config.ignore)
			|| (value == '' && isSkipNull)) return true;


		for (var mt in rules) {
			var rule = {
				key: key,
				method: method[mt],
				message: MESSAGES[key] ? MESSAGES[key][mt] : key + ' is not required!',
				parameters: rules[mt]
			};

			// 没有该方法直接跳过
			if(!rule.method)
				continue;

			result = rule.method.call(self, value, item, rule);
			// 异步等待
			if (result === "pending") {
				self.pause(key);
				return;
			}
			// error
			if (!result) {
				self.formatAndAdd(item, rule);
				self.showError();
				return false;
			}
			// success
			self.successList.push(key);
			self.showSuccess();
		}
	},
	// 格式化错误
	formatAndAdd: function(el, rule){
		var msg = rule.message;
		var theregex = /\$?\{(\d+)\}/g;

		if (typeof msg === "function") {
			msg = msg.call(this, rule.parameters, el);
		} else if (theregex.test(msg)) {
			msg = aw.util.string.format(msg.replace(theregex, "{$1}"), rule.parameters);
		}

		this.errorMap[rule.key] = msg;
		this.errorList.push(rule);
	},
	/**
	 * 提交
	 */
	submitEvent: function(){
		var self = this;
		var config = self.config;
		var el = self.el;
		var box = self.box;

		var defaultBtnText = el.text();

		function benPending(){
			if(config.loadText){
				el.html('<b></b><em>'+(config.loadText || 'Loading')+'</em>');
			}
			el.addClass('ui-btn-loading ui-btn-disabled');
		}

		function stopPending(){
			el.text(defaultBtnText);
			el.removeClass('ui-btn-loading ui-btn-disabled');
		}

		if(!config.submitAjax){
			el.on('click', function(){
				if(config.beforeCheck && config.beforeCheck()){
					return false;
				}

				if(self.pendingRequest){
					self.formSubmitted = true;
					return false;
				}
				// 验证所有
				var st = self.checkAll();
				if(!st) return false;
				config.transitBefore && config.transitBefore.call(self);
				// 验证成功后 提交
				if(!config.handle){
					box.submit();
					return false
				}
				config.handle.call(self, box);
				return false;
			});
			return;
		}

		el.on('click', function(){
			benPending();
			if((config.beforeCheck && config.beforeCheck()) || self.continuous)
				return false

			if(self.pendingRequest){
				self.formSubmitted = true;
				return false;
			}

			var st = self.checkAll();

			// 全部检查 出现错误时，提示
			(config.checkMoreAll && !st) && config.checkMoreAll.call(self);

			(config.continuous && st) && config.continuous.call(self);

			if(st){
				config.transitBefore && config.transitBefore.call(self);
				config.submitAjax && config.submitAjax.call(self, st, function(){
					stopPending();
				});
			} else {
				stopPending();
			}
			return false;

		});

	},
	/**
	 * 表单元素事件绑定
	 * @param key
	 * @param rules
	 */
	nodesEvent: function(key, rules){
		var self = this;
		var config = self.config;
		var _cache = self.nodes_cache;
		var item = _cache[key];
		var evtType = config.eventType;

		if(item[0].nodeName.toLowerCase() === 'select' || aw.util.form.checkable(item)){
			evtType = 'change blur';
		}

		if(!config.isOnlySubmitCheck){
			item.on(evtType, function() {
				self.reset();
				self.check(key, config.isSkipNull);
			});
		}

		if(config.focusCls){
			item.on('focus', function(){
				self.showFocus(key);
			});
		}

	},
	/**
	 * 获取每一个表单元素的相关信息
	 * @param callback
	 */
	getItems: function(callback){
		var self = this;
		var box = self.box;
		var rules = self.config.rules;
		var _nodes = self.nodes_cache;

		for(var key in rules){
			var item = box.find('[data-validate='+key+']');
			if(!_nodes[key] && item.length){
				_nodes[key] = item;
			}

			if(item.length){
				callback && callback.call(self, key, rules[key]);
			}

		}

	},
	/**
	 * 日志
	 * @param list
	 * @param type
	 */
	logs: function(list, type){
		var self = this;
		var config = self.config;
		var len = list.length-1;

		for(var i=len; i>=0; i--){
			var rule = list[i];
			var key = rule.key || rule;
			// 取到当前缓存的节点
			var item = self.nodes_cache[key];
			var itemParent = config.errorParent ? item.parents(config.errorParent) : item.parent();
			// 获取日志写入节点
			var errMessage = itemParent.find('[data-validate=message]');
			if(!errMessage.length){
				errMessage = $(config.errorWrap);
				errMessage.attr('data-validate', 'message');
				itemParent.append(errMessage);
			}
			var message = type == 'error' ? (self.errorMap[key] || rule.message) : MESSAGES[key][type];
			errMessage.text(message || '\n');
			itemParent.removeClass(config.successCls + ' ' +config.focusCls + ' '+config.errorCls).addClass(config[type+'Cls']);
		}

	},
	pause: function(key){
		this.logs([key], 'pause');
	},
	showFocus: function(key){
		this.logs([key], 'focus');
	},
	showSuccess: function(){
		var self = this;
		self.logs(self.successList, 'success');
	},
	showError: function(errList){
		var self = this;
		self.logs(errList ? [errList] : self.errorList, 'error');
	}

}, aw.ui.Emitter);

aw.ui.validate = {
	init: function(els, config){
		els = $(els);
		if(!els.length) return;

		return els.each(function(){
			new Validate($(this), config);
		});

	},
	/**
	 * 写入方法
	 * @param name
	 * @param fn
	 */
	setMethod: function(name, fn, text){
		if(arguments.length < 2)
			return;
		method[name] = fn;
		if(!text) return;
		MESSAGES[name] = text;
	},
	message: MESSAGES
}

// 添加方法

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

	var data = param.data;

	// 可以通过data传入一个函数
	// data: function(el, value){
	//      return {
	//          a: 123,
	//          b: 456,
	//          c: el.attr('name'),
	//			d: value
	//      }
	// }
	if(typeof data == 'function'){
		data = data(el, value);
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
			self.showError(rule);
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
	if(!target) return true;
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
	var len = value.length
	return len >= param[0] && len <= param[1];
});


