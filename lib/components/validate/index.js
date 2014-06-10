var message = {};
var method = {};
var defaultConfig = {
	ignore: 'data-validate-ignore',
	// 表单容器
	box: 'form',
	errorWrap: html,
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
	// 回调
	beforeCheck: null,
	checkMoreAll: null,
	transitBefore: null,
	checkSingle: null,
	/**
	 * ajax 提交时的具体传值，可以覆盖
	 */
	submitAjax: function(){
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
				config.success(data);
			},
			error: function(data){
				config.error(data);
			}
		}
		aw.ajax.json(conf)
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

		self.valid();
	},
	check: function(key, isSkipNull){
		var self = this;
		var config = self.config;
		var item = self.nodes_cache[key];
		var value = aw.util.form.elValue(item);
		var rules = config.rules[key];
		var result;

		// 如果是非必填项，而且value是空 直接返回真并且删除log
		if(!rules['required'] && value == '') {
			self.hideLogs(item);
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
				message: message[key] ? message[key][mt] : key + ' is not required!',
				parameters: rules[mt]
			};

			// 没有该方法直接跳过
			if(!rule.method)
				continue;

			result = rule.method.call(self, value, item, rule);
			// 异步等待
			if (result === "pending") {
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
			return true;
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

		if(!config.submitAjax){
			el.on('click', function(){
				if(config.beforeCheck && config.beforeCheck()){
					return false;
				}
				box.trigger('submit');
				return false;
			});
			box.on('submit', function(){

				if(self.pendingRequest){
					self.formSubmitted = true;
					return false;
				}

				var st = self.checkAll();
				return st;
			});
			return;
		}

		el.on('click', function(){
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
				config.submitAjax && config.submitAjax.call(self, st);
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
			var item = _nodes[key];
			if(!_nodes[key]){
				item = _nodes[key] = box.find('[data-validate='+key+']');
			}

			if(item.length){
				callback && callback.call(self, key, rules[key]);
			}

		}

	},
	hideLogs: function(item){
		var self = this;
		var config = self.config;
		item.text('');
		item.parent().removeClass(config.successCls + ' ' +config.errorCls + ' '+config.focusCls);
	},
	showFocus: function(key){
		var self = this;
		var config = self.config;
		var item = self.nodes_cache[key];
		item.text(message[key]['focus'] || '');
		item.parent().removeClass(config.successCls + ' ' +config.errorCls).addClass(config.focusCls);
	},
	showSuccess: function(){
		var self = this;
		var config = self.config;

		var list = self.successList;
		var len = list.length-1;

		for(var i=len; i>=0; i--){
			var key = list[i];
			var item = self.nodes_cache[key];
			item.text('');
			item.parent().removeClass(config.errorCls + ' ' +config.focusCls).addClass(config.successCls);
		}

	},
	showError: function(){
		var self = this;
		var config = self.config;
		var errorWrap = $(config.errorWrap);
		var nodename = errorWrap[0].nodeName;
		var list = self.errorList;
		var len = list.length-1;

		for(var i=len; i>=0; i--){
			var rule = list[i];
			var item = self.nodes_cache[rule.key];
			var node = item.siblings(nodename);
			if(!node.length){
				node = $(config.errorWrap);
				item.after(node);
			}
			node.text(self.errorMap[rule.key]);
			item.parent().removeClass(config.successCls + ' ' +config.focusCls).addClass(config.errorCls);
		}


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
		message[name] = text;
	},
	message: message
}

