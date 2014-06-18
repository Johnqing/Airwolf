(function($, window, doc, undefined){
	var keyCodes = {
		tab: 9,
		enter: 13,
		escape: 27,
		arrowLeft: 37,
		arrowUp: 38,
		arrowRight: 39,
		arrowDown: 40
	}

	var then = $.now();

	var Airwolf = {
		config: {},
		/**
		 * 唯一id
		 * @returns {number}
		 */
		uniqueId: function(){
			return then++;
		},
		/**
		 * 按键
		 * @param event
		 * @param name
		 * @returns {boolean}
		 */
		isKey: function(event, name){
			return event.keyCode === keyCodes[name];
		},
		/**
		 * debug
		 * @param text
		 * @param style
		 */
		debug: function(text, style){
			if(console && console.log){
				console.log(text, style);
				return;
			}
		},
		// function null
		noop: function(){},
		ui: {},
		/**
		 * 类型
		 * @param o
		 * @returns {*}
		 */
		type: function(o){
			return $.type(o);
		},
		/**
		 * 继承
		 * @param old
		 * @param n
		 * @returns {*|void}
		 */
		extend: function(old, n){
			return $.extend(true, {}, old, n);
		},
		/**
		 * json字符串转json对象
		 * @param s
		 * @returns {*}
		 */
		str2obj: function(s){
			try{
				if(Airwolf.type(s) == 'string'){
					return eval('('+s+')');
				}
				return s;
			} catch (e){
				return {};
			}
		},
		/**
		 * a=1&b=2&c=3 => {a:1,b:2,c:3}
		 * @param query
		 * @returns {{}}
		 */
		query2obj: function(query){
			var queryArr = query.split('&');
			var obj = {};
			for(var i=0; i<queryArr.length; i++){
				var q = queryArr[i].split('=');
				obj[q[0]] = q[1];
			}
			return obj
		}
	}

	window.aw = window.Airwolf = Airwolf;
	window.aw.util = {};
	window.pageConfig = window.pageConfig || {};

})(jQuery, window, document);

// document.body
(function(aw, document){
	aw.doc = {
		el: $(document.body)
	}
	aw.doc.w = aw.doc.el.width()
	aw.doc.h = aw.doc.el.height()
})(aw, document);



(function(aw){
	/**
	 * @namespace
	 * @desc 类控制器
	 */
	aw.Class = (function(){
		var _slice = [].slice;

		function create(property){
			if(!property.init){
				property.init = function(){};
			}

			var _class = function(){
				if(typeof this.init == 'function'){
					this.init.apply(this, arguments);
				}
			};
			var args = [];

			args = _slice.call(arguments, 1);
			//inherit
			var key = null;
			//父类的构造函数
			var _super_init = null;
			if(typeof args[0] == 'function'){
				var parent = args[0];
				_super_init = parent.prototype.init;

				if(typeof _super_init == 'function'){
					//销毁父实例的init;
					parent.prototype.init = function(){};

					var _this_init = property.init;
					property.init=function(){
						_super_init.apply(this, arguments);
						_this_init.apply(this, arguments);
					};
				}

				var iparent = new parent();
				//复原
				parent.prototype.init = _super_init;
				//销毁父类
				iparent.init = function(){};
				//start为了防止父类函数执行的时候，this指针变化，特意把init拿出来执行
				//end
				_class.prototype = iparent;
				_class.prototype.parent = parent;
				_class.prototype._super = function(){
					if(this.parent && this.parent.prototype[arguments[0]]){
						return this.parent.prototype[arguments[0]].apply(this, _slice.call(arguments, 1));
					}
				};
				args = args.slice(1);
			}

			//mixin
			for ( var i = 0; i < args.length; i++) {
				var arg = args[i];
				if(aw.type(arg) == 'object'){
					for(key in arg){
						_class.prototype[key] = arg[key];
					}
				}
			}
			//self
			for(key in property){
				_class.prototype[key] = property[key];
			}
//		if(!_class.prototype.init){
//			_class.prototype.init=function(){};
//		}
			_class.prototype.constructor = _class;

			return _class;
		}

		/**
		 * 单例
		 */
		function instance(className){
			if(typeof className == 'string'){
				className =eval(className);
			}
			if(typeof className ==='undefined') throw 'illegal class name';

			if(typeof className._instance === 'undefined'){
				className._instance = new className();
			}

			return className._instance;
		}

		return {
		/**
		*创建新类，可继承
		*@param {object} property -类方法，包括init构造函数
		*@param {function} parent -父类，继承对象
		*@example
		*  //parentClass-<1>
		*var Persion = Class.create({
		*	init:function(name){
		*		this.name = name;
		*	},
		*	getName:function(){
		*		return this.name;
		*	}
		*});
			 *  //parentClass-<2>
			 *var Person = function(name){
		* this.name = name;
		*}
			 *Person.prototype.getName = function(){
		*	return this.name;
		*}
		*  //inherit<1> 继承构造类。
		*var Man=Class.create({
		*	init:function(name,age){
		*		this.parent();
		*		this.parentClass.init.call(this,arguments);
		*		this.age = age;
		*	},
		*	getAge:function(){
		*		return this.age;
		*	}
		*},Person);
		*  //inherit<2-1> 继承传统类第一种方式
		*var Man1 = Class.create({
		*	getAge:function(){
		*		return this.age;
		*	}
		*},Person);
		*  //inherit<2-2> 继承传统类第二种方式
		*var Man2 = Class.create({
		*	init:function(name,age){
		*		this.parent();
		*		this.age = age;
		*	},
		*	getAge:function(){
		*		return this.age;
		*	}
		*},Person);
			 *
			 *var Man3 = Class.create({
		*	init:function(){
		*
		*	}
		*},EventUtil,ENumberable);
			 */
			create: create,
			/**
			 * 单例
			 * @param {class}
			 * @example
			 * Class.instance(Service);
			 */
			instance: instance
		};
	})();

	/**
	* 扩展静态方法
	* @param {function/Class} -className/ModuleName/Object
	* @param {object} -staticProperty -静态属性
	* @example
	* Class.extend(Dom,{
	* 	create:function(nodeName){
	* 		reutrn document.createElement(nodeName);
	* }
	* })
	*/
	aw.Class.extend = function(className, staticProperty){
		for(var key in staticProperty){
			className[key] = staticProperty[key];
		}
		return className;
	};
})(aw);

;(function(aw){
var reNoWord = /\W/;
/**
 * 日期格式化
 * @param  {Date} text   需要格式化的日期
 * @param  {String} fmt 日期格式。如：yyyy-MM-dd
 * @return {String}        格式化后的日期
 */
function formatDate(text, fmt){
	fmt = fmt || 'yyyy-MM-dd'
	var format;
	var y = text.getFullYear().toString(),
		o = {
			M: text.getMonth()+1, //month
			d: text.getDate(), //day
			h: text.getHours(), //hour
			m: text.getMinutes(), //minute
			s: text.getSeconds() //second
		};
	format = fmt.replace(/(y+)/ig, function(a, b) {
		return y.substr(4 - Math.min(4, b.length));
	});
	for (var i in o) {
		format = format.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
			return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
		});
	}
	return format;
}

/**
 * 字符串解析为日期
 * @param  {String} text   日期字符串
 * @param  {String} fmt 解析格式
 * @return {Date}        新日期
 */
function parseDate(text, fmt){
	fmt = fmt || 'yyyy-MM-dd'
	//格式化日期
	var textArr = text.split(reNoWord);
	return setDate(textArr);
}

//闰月年计算
function isLeapYear(year){
	// http://stackoverflow.com/a/4881951
	return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}

function getDaysInMonth(year, month){
	return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}
// 判断日期是否相等
function compareDates(a, b){
	return a.getTime() === b.getTime();
}
/**
 * 设置日期
 * @param time
 * @returns {*}
 */
function setDate(year, month, _date){
	var date = new Date();
	if(year){
		var time = year;
		if(arguments.length == 1 && aw.type(time) == 'year'){
			time = year.split(/[^\d]/g);
		}
		if(aw.type(year) == 'array'){
			year = time[0];
			month = time[1] || 1;
			_date = time[2] || 0
		}
		date.setUTCFullYear(year, month - 1, _date);
	}
	date.setUTCHours(0, 0, 0, 0);
	return date;
}

/**
 * 日期对外接口
 * @type {{format: formatDate, getDaysInMonth: getDaysInMonth, isLeapYear: isLeapYear, parse: parseDate, setDate: setDate}}
 */
aw.util.date = {
	format: formatDate,
	getDaysInMonth: getDaysInMonth,
	isLeapYear: isLeapYear,
	parse: parseDate,
	setDate: setDate,
	compareDates: compareDates
};
})(aw);
;(function(aw){
aw.util.form = {
	/**
	 * 获取元素的 value
	 * @param el
	 * @returns {*}
	 */
	elValue: function(el){
		el = $(el);
		var type = el.attr("type"),
			val = $.trim(el.val());

		if (type === "radio" || type === "checkbox") {
			return $("input[name='" + el.attr("name") + "']:checked").val();
		}
		if (typeof val === "string") {
			return val.replace(/\r/g, "");
		}
		return val;
	},
	/**
	 * 检查是否为checkbox/radio
	 * @param el
	 * @returns {boolean}
	 */
	checkable: function(el){
		return /radio|checkbox/i.test(el[0].type);
	},
	/**
	 * 获取length
	 * @param el
	 * @returns {Number|jQuery}
	 */
	getLength: function(el){
		return $(el).filter(":checked").length;
	},
	/**
	 * 表单数据提取
	 * @param nodeChilds
	 * @param prefix 加密前缀
	 * @returns {string}
	 */
	serialize: function(nodeChilds, prefix){
		var data = [];
		var fm = aw.util.form;
		$.each(nodeChilds, function(){
			var $this = $(this),
				Md5 = $this.attr('data-m'),
				encode = $this.attr('data-encode'),
				name = $this.attr('name'),
				value = fm.elValue($this)

			if(!name) return;

			// 防止选取所有checkbox
			if(!$this.is(':checked') && fm.checkable($this)) return;

			if(encode){
				value = encodeURIComponent(value);
			}

			/**
			 * 加密规则为：
			 * 0： 直接对value加密
			 * 1： 加密前缀 + value
			 * 2： 加密前缀 + value 和 复制一份name+'_md5' 并且value加密的
			 */
			if(Md5){
				if(Md5 == '0'){
					value = hex_md5(value);
				} else {
					if(Md5 == '2'){
						data.push(name+'_md5='+hex_md5(value));
					}
					value = hex_md5(prefix + value);
				}
			}

			data.push(name+'='+value);


		});

		return data.join('&');
	}
}
})(aw);
;(function(aw){
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
})(aw);
;(function(aw){
var Emitter = aw.Class.create({
	// init new Emitter
	init: function(){
		this.callbacks = {}
	},
	/**
	 * 监听event的fn
	 * @param event
	 * @param fn
	 * @returns {Emitter}
	 */
	on: function(event, fn){
		var cb = this.callbacks[event];
		this.callbacks[event] = cb || [];
		this.callbacks[event].push(fn);

		return this;
	},
	/**
	 * 解绑
	 * @param event
	 * @param fn
	 * @returns {Emitter}
	 */
	off: function(event, fn){
		var cbs = this.callbacks[event];

		if(!cbs) return this;

		// 解除所有
		if(arguments.length === 1){
			delete this.callbacks[event];
			return this
		}

		var index = cbs.indexOf(fn);
		cbs.splice(index, 1);

		return this;
	},
	/**
	 * 绑定单次
	 * @param event
	 * @param fn
	 * @returns {Emitter}
	 */
	once: function(event, fn){
		var self = this;

		/**
		 * 解绑
		 */
		function on(){
			self.off(event, on);
			fn.apply(this, arguments);
		}

		this.on(event, on);
		return this;
	},
	/**
	 * 绑定一组
	 * @param event
	 * @returns {Emitter}
	 */
	emit: function(event){
		var args = [].slice.call(arguments, 1);
		var cbs = this.callbacks[event];

		if(cbs){
			for(var i = 0, len = cbs.length; i < len; i++)
				cbs[i].apply(this, args);
		}

		return this;
	}
});

aw.ui.Emitter = Emitter;

})(aw);
;(function(aw){
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
})(aw);
;(function(aw){

var defaultConf = {
	menu: 'li',
	box: null,
	// 动画切换的时间
	time: 3,
	// 延迟触发menu
	defter: 0,
	cls: 'active',
	eventType: 'click',
	autoPlay: false,
	after: aw.noop
}
/**
 * Tabs Class
 * @type {*}
 */
var Tabs = aw.ui.Tabs = aw.Class.create({
	init: function(el, config){
		this.el = el;

		config = this.config = aw.extend(defaultConf, config);

		this.menu = el.find(config.menu);
		this.box = $(config.box);

		this.total = this.menu.length - 1;
		this.currIndex = 0;
		this.time = config.time * 1000;
		this.defer = config.defter * 1000;
	},
	start: function(){
		var self = this;
		var config = self.config;

		self.setStyle(true);

		if(config.autoPlay){
			self.timer = setInterval(function(){
				self.setTime();
			}, self.time);
		}

		self.bindEvent();
	},
	bindEvent: function(){
		var self = this,
			config = self.config,
			menu = config.menu,
			defer = config.defer

		self.el.on(config.eventType, menu, function(){
			var $this = $(this),
				n = $this.index();

			clearInterval(self.defterTimer);
			self.defterTimer = setTimeout(function(){
				self.toASpecificPage.call(self, n);
				// 动画切换
				clearInterval(self.timer);
				self.timer = setInterval(function(){
					self.setTime()
				}, self.time)

			}, defer);

		});

		// 只有moseout的时候 清除延迟
		if(!defer) return
		self.el.on('mouseout', menu, function(){
			clearTimeout(self.defterTimer);
		})

	},
	toASpecificPage: function(index){
		var self = this;
		self.currIndex = index;
		self.changePage();
		self.setStyle(true);
	},
	/**
	 * 设置样式
	 */
	setStyle: function(){
		var self = this;
		var config = self.config;
		self.menu.eq(self.currIndex).addClass(config.cls);
		self.box.addClass('ui-tabs-cont');
	},
	changePage: function(){
		var self = this;
		var config = self.config;
		var n = self.currIndex;

		var box = self.box.eq(n);
		box.addClass('ui-tabs-cont-'+config.cls).siblings(config.box).removeClass('ui-tabs-cont-'+config.cls);
		box.stop(true).fadeIn(500).siblings(config.box).fadeOut(500);

		self.menu.removeClass(config.cls).eq(n).addClass(config.cls);;
	},
	setTime: function(){
		var self = this;
		self.toNextPage();
		self.setStyle();
	},
	toNextPage: function(){
		var self = this;
		self.currIndex == self.total ? self.currIndex = 0 : self.currIndex++;
		self.changePage();
	}
}, aw.ui.Emitter);

aw.ui.tabs = {
	init: function(els, config){
		els = $(els);
		if(!els.length) return;

		return els.each(function(){
			new Tabs($(this), config).start();
		});

	}
}
})(aw);
;(function(aw, html){
var defaultConfig = {
	close: aw.noop
}

/**
 * Dialog Class
 * @type {*}
 */
var Dialog = aw.ui.Dialog = aw.Class.create({
	// init new Dialog
	init: function(config){
		config = aw.extend(defaultConfig, config);
		this.on('close', config.close);
		this.template = html;
		this.el_p = $(this.template);
		this.el = this.el_p.find('.content');

		this.render(config);
	},
	/**
	 * 根据配置渲染
	 * @param config
	 */
	render: function(config){
		var el = this.el;
		var title = config.title;
		var msg = config.message;
		var self = this;


		el.find('.close').on('click', function(){
			self.emit('close');

			self.hide();
			return false;
		});
		// title
		el.find('h1').text(title);
		if(!title) el.find('h1').remove();

		// msg
		if ('string' == typeof msg) {
			el.find('p').text(msg);
		} else if (msg) {
			el.find('p').replaceWith(msg.el || msg);
		}

		setTimeout(function(){
			el.removeClass('hide');
		}, 0)

	},
	/**
	 * close
	 * @returns {Dialog}
	 */
	closeable: function(){
		this.el.addClass('closeable');
		return this;
	},
	/**
	 * 动画
	 * @param type
	 * @returns {Dialog}
	 */
	effect: function(type){
		this._effect = type;
		this.el.addClass(type);
		return this;
	},
	/**
	 * 模块
	 * @returns {Dialog}
	 */
	modal: function(){
		this._overlay = aw.ui.overlay();
		return this;
	},
	/**
	 * 带遮罩
	 * @returns {Dialog}
	 */
	overlay: function(isClose){
		var self = this;
		var overlay = aw.ui.overlay({
			closeable: isClose
		});

		overlay.on('hide', function(){
			self.closedOverlay = true;
			self.hide();
		})


		overlay.on('close', function(){
			self.emit('close');
		});

		this._overlay = overlay;
		return this;
	},
	/**
	 * 显示modal
	 * @returns {Dialog}
	 */
	show: function(){
		var overlay = this._overlay;

		this.emit('show');

		if(overlay){
			overlay.show();
			this.el.addClass('modal');
		}

		this.el_p.appendTo('body');

		this.el_p.css({
			marginLeft: -(this.el_p.width() / 2) + 'px'
		});

		this.emit('show');
		return this;
	},
	/**
	 * 隐藏modal
	 * @param s
	 * @returns {Dialog}
	 */
	hide: function(s){
		var self = this;

		this.hiding = true;

		if(s){
			s = s * 1000;
			setTimeout(function(){
				self.hide()
			}, s);
			return this;
		}

		this.el.addClass('hide');

		if(this._effect){
			setTimeout(function(){
				self.remove();
			}, 500);
		} else {
			self.remove();
		}

		if(this._overlay && !self.closedOverlay)
			this._overlay.hide();

		return this;
	},
	/**
	 * 删除modal
	 * @returns {Dialog}
	 */
	remove: function(){
		this.emit('hide');

		this.el_p.remove();

		return this;

	}
}, aw.ui.Emitter);

aw.ui.dialog = {
	init: function(config){
		return new Dialog(config);
	},
	/**
	 * 报错
	 * @param error
	 * @param config
	 */
	error: function(error, config){
		var title = config.title || '操作失败';
		var errStr = '<div class="validator-error '+(config.cls || '')+'">' +
			'<h3 class="tips-tips">' +
			'<s class="icons-terr"></s>'+title+'</h3>' +
			'<p>'+error+'</p>' +
			'</div>'
		var dialog = aw.ui.dialog.init({
			title: '温馨提示',
			message: {
				el: $(errStr)
			}
		});
		dialog.closeable().overlay().show();
	},
	/**
	 * 锁定
	 */
	lock: function(){
		if(pageConfig.source != 1) {
			location.href = '/error/depositExp?type=lock';
			return
		}
		if(pageConfig.pageType == 'error') return

		var error = '您的账户存在安全风险，暂时无法进行相关操作。<br>如有疑问请联系客服：<a href="mailto:payhelp@360.cn">payhelp@360.cn。</a>';

		var dialog = aw.ui.dialog.error(error, {
			title: '账户存在安全风险',
			cls: 'lock',
			close: function(){
				if(pageConfig.source != 1){
					aw.login.exitLogin();
					return;
				}
				aw.login.exitBack('/index');
			}
		});
		dialog.closeable().overlay().show();
	}

}
})(aw, "<div class=\"ui-dialog-box\">\r\n\t<div class=\"content\">\r\n\t\t<h1>Title</h1>\r\n\t\t<a href=\"#\" class=\"close\">×</a>\r\n\t\t<p>Message</p>\r\n\t</div>\r\n</div>");
;(function(aw, html){

var Overlay = aw.Class.create({
	init: function(config){
		var self = this;

		config = config || {};

		this.closeable = config.closeable;

		this.el = $(html);
		this.el.appendTo('body');

		if(this.closeable){
			this.el.click(function(){
				self.emit('close');
				self.hide();
			})
		}
	},
	show: function(){
		this.emit('show');
		this.el.removeClass('hide');
		return this;
	},
	hide: function(){
		var self = this;

		this.emit('hide');
		this.el.addClass('hide');

		setTimeout(function(){
			self.el.remove();
		}, 2000);
		return this;
	}
}, aw.ui.Emitter);


aw.ui.overlay = function(config){
	return new Overlay(config);
}
})(aw, "<div class=\"ui-overlay hide\"></div>");
;(function(aw, html){
var Confirm = aw.Class.create({
	cancel: function(text){
		this.el.find('.cancel').text(text)
		return this;
	},
	ok: function(text){
		this.el.find('.ok').text(text);
		return this;
	},
	show: function(fn){
		aw.ui.Dialog.prototype.show.call(this);

		this.el.find('.ok').focus();
		this.callback = fn || aw.noop;
		return this;
	},
	render: function(config){
		aw.ui.Dialog.prototype.render.call(this, config);

		var self = this;
		var action = $(html)

		this.el.addClass(config.cls || 'ui-confirm');
		config.isOk && (this.find('.ok').remove());
		config.isCancel && (this.find('.cancel').remove());

		this.el.append(action);

		this.on('close', function(){
			self.emit('close');
			self.callback(false);
		});

		action.find('.cancel').click(function(e){
			e.preventDefault();
			self.emit('cancel');
			self.callback(false);
			self.hide();
		});

		action.find('.ok').click(function(e){
			e.preventDefault();
			self.emit('ok');
			self.callback(true);
			self.hide();
		})

	}

}, aw.ui.Dialog, aw.ui.Emitter);

aw.ui.confirm = {
	init: function(config){
		return new Confirm(config);
	}
}
})(aw, "<div class=\"ui-confirm-box\">\r\n    <button class=\"cancel\">Cancel</button>\r\n    <button class=\"ok\">Ok</button>\r\n</div>");
;(function(aw, html){
var allBox = [];

function killAllBox(id){
	$.each(allBox, function(i){
		var item = allBox[i];
		if(item != id){
			if(!$('[data-select-box='+item+']').length){
				$('[data-select-pop='+item+']').remove();
			}else{
				$('[data-select-pop='+item+']').css({
					height: '',
					width: ''
				}).hide();
			}
			$(document).unbind("click", killAllBox);
		}
	});
}

/**
 * 级联菜单
 * @param event
 * @returns {boolean}
 * @private
 */
function _onchange(event){
	var node = $('[data-select-box='+event.data.ref+']');
	if(!node.length) return false;
	// ajax
	var url = event.data.refUrl.replace('{{value}}', encodeURIComponent(event.data.$this.attr("value")));
	aw.ajax.json({
		type: 'get',
		url: url,
		success: function(data){
			var html = '';

			$.each(data, function(i){
				if (data[i] && data[i].length > 1){
					html += '<option value="'+data[i][0]+'">' + data[i][1] + '</option>';
				}
			});

			var refNode = node.parents("div.ui-select-box:first");
			node.html(html).insertAfter(refNode);
			refNode.remove();
			node.trigger("change")
			aw.ui.select.init(node);
		}
	})

}

/**
 * 模板替换
 * @param  {String} tpl  模板
 * @param  {Object} data 数据
 * @return {String}      拼接后的模板
 */
function _tpl(tpl, data) {
	return tpl.replace(/{{(.*?)}}/g, function ($1, $2) {
		return data[$2] || '';
	});
}

/**
 * Select Class
 * @type {*}
 */
var Select = aw.Class.create({
	init: function(el, config){
		this.el = el;
		this.config = config;
		this.render();
	},
	clear: function(){
		var _box = [];
		this.emit('clear');

		$.each(allBox, function(i){
			var item = allBox[i];
			if($('[data-select-box='+item+']').length){
				_box.push(item);
				return
			}
			$('[data-select-pop='+item+']').remove();
		});

	},
	render: function(){
		this.clear();
		var self = this;

		return this.el.each(function(){
			var $this = $(this);
			var name = $this.attr('name');
			var val = $this.val();
			var label = $('option[value='+val+']', $this).text();
			var ref = $this.attr('data-select-ref');
			var refUrl = $this.attr('data-select-ref-url') || '';

			var cid = $this.attr('id') || aw.uniqueId();

			var template = $(html);

			var select = template.eq(0);

			var divNode = select.find('div');
			divNode.attr('data-select-box', cid);
			if(ref){
				divNode.attr('data-select-ref', ref);
			}
			var aNode = select.find('a');
			aNode.attr({
				'class': $this.attr('class'),
				'name': name,
				'value': val
			});
			aNode.text(label);

			//options
			var options = template.eq(2);
			options.attr('data-select-pop', cid);
			var ops = ''
			$("option", $this).each(function(){
				var option = $(this);
				var opts = aw.extend({
					selected: val == option[0].value ? "selected": "",
					value: option[0].value,
					message: option[0].text
				}, option.data());
				ops += _tpl(self.config.html, opts);
			});
			options.html(ops);
			options.appendTo('body');
			$this.before(select);
			self.bindEvent($("div.select", $this.prev())).append($this);

			if(ref && refUrl){
				$this.unbind("change", _onchange).bind("change", {ref:ref, refUrl:refUrl, $this:$this}, _onchange);
			}

		});
	},
	bindEvent: function(els, config){
		var option = aw.extend({selector: '>a'}, config);
		var self = this;

		return els.each(function(){
			var $this = $(this);
			var selector = $(option.selector, $this);
			var id = $this.attr('data-select-box');

			allBox.push(id);

			selector.click(function(){
				var options = $('[data-select-pop='+id+']');
				if(options.is(':hidden')){
					if(options.height() > 300){
						options.css({
							height: 300,
							overflowX: 'scroll'
						})
					}

					var top = $this.offset().top + $this.innerHeight();

					if(top + options.height() > $(window).height - 20){
						top = $(window).height() - 20 - options.height();
					}

					options.css({
						top: top,
						left: $this.offset().left
					}).show();

					killAllBox(id);
					$(document).click(killAllBox);
				}else{
					$(document).unbind("click", killAllBox);
					killAllBox();
				}
				return false;
			});
			self._option($('[data-select-pop='+id+']').find(">li"), selector, $this);
		});
	},
	_option: function(els, selector, box){
		return els.each(function(){
			$(">a", this).click(function(){
				var $this = $(this);
				$this.parent().parent().find(".selected").removeClass("selected");
				$this.addClass("selected");
				selector.text($this.text());

				var $input = $("select", box);
				if ($input.val() != $this.attr("value")) {
					$("select", box).val($this.attr("value")).trigger("change");
				}
			});
		});
	}
}, aw.ui.Emitter);

aw.ui.select = {
	init: function(els, config){
		els = $(els);
		if(!els.length) return;

		config = aw.extend({
			html: '<li><a class="{{selected}}" href="#" value="{{value}}">{{message}}</a></li>'
		},config)

		return new Select(els, config);
	}
}
})(aw, "<div class=\"ui-select-box\">\r\n\t<div class=\"select\">\r\n\t\t<a href=\"javascript:\"></a>\r\n\t</div>\r\n</div>\r\n<ul class=\"ui-select-options\"></ul>");
;(function(aw, html){
function getPos(el){
	var p = el.offset(),
		borderWidth = parseInt(el.css('border-top-width')) * 2;
	return {
		top: p.top + el.innerHeight() + borderWidth,
		left: p.left
	};
}

var defaultConf = {
	isOpenShow: false,
	eventType: 'click',
	pattern: 'yyyy-MM-dd',
	// 皮肤
	theme: 0,
	//默认日期
	defaultDate: null,
	//禁用xx日期日期前，xx日期后，数组['2012-12-19', '2013-12-19']
	disableDate: null,
	// 日期间隔
	range: {
		max: 2050,
		min: 1980
	},
	// 选中回调
	select: null,
	// 打开回调
	open: null,
	// 关闭回调
	close: null
}

var Calendar = aw.Class.create({
	init: function(el, config){
		var self = this;

		self.el = el;
		self.config = aw.extend(defaultConf, config);

		this.data = {
			years: [],
			dates: [],
			currYear: '',
			currMonth: '',
			now: ''
		};

		self.setTimes(el.val());

		var config = self.config;
		// 默认打开就渲染
		if(config.isOpenShow){
			self.render();
		}
		self.bindEvent();
	},
	bindEvent: function(){
		var self = this,
			config = self.config;
		// 事件绑定

		self.on('chose_date', function(el){
			if(el.hasClass('.disabled'))
				return;
			var value = el.attr('data-calendar-day');
			self.el.val(value);
			closeCalendar();
		});

		function closeCalendar(){
			self.node.off('click');
			self.node.remove();
			$(document).off('click', closeCalendar);
		}
		self.el.on(config.eventType, function(ev){
			if(self.node){
				self.node.remove()
				self.node = null;
			}
			var value = ev.target.value;
			self.setTimes(value);
			self.render();
			//
			$(document).on('click', closeCalendar);
			return false;
		});
		// 回调
		self.on('select', config.select);
		self.on('open', config.open);
		self.on('close', config.close);
	},
	setTimes: function(value){
		var util = aw.util.date;
		value = $.trim(value);
		value = value ? util.parse(value) : util.setDate();

		var year = value.getFullYear();
		var month = value.getMonth();
		var _date = value.getDate();

		this.times = aw.util.date.setDate(year, month+1, _date);

	},
	render: function(){
		var self = this;

		self.groupQuery();

		var template = NT.tpl(html, self.data);
		var node = self.node = $(template);

		var obj = getPos(self.el);
		node.css({
			position: 'absolute',
			left: obj.left,
			top: obj.top
		});
		self.renderBind();
		node.appendTo('body');

		self.node.on('click', '.day', function(evt){
			self.emit('chose_date', $(evt.target))
		});

	},
	renderBind: function(){
		var self = this;
		var selectNode = self.node.find('select');
		selectNode.off('change');
		//bind
		selectNode.change(function(){
			var value = $(this).val();
			var n = value.length;
			var _date = self.times.getDate();
			var month = n <4 ? value : self.times.getMonth();
			var year = n < 4 ? self.times.getFullYear() : value;;
			self.setTimes(year + '-' + month + '-' + _date);
			self.node.remove();
			self.render();

			return false;
		});
		self.node.click(function(event){
			event.stopPropagation();
		});
	},
	groupQuery: function(){
		var self = this,
			config = self.config,
			util = aw.util.date;

		var maxYear = config.range.max,
			minYear = config.range.min;

		// maxYear 必须大于 minYear
		if(maxYear - minYear < 0)
			throw new Error('incorrect time interval!');

		var year = self.times.getFullYear(),
			month = self.times.getMonth(),
			_date_ = self.times.getDate(),
			_date = util.setDate(year, month+1, _date_)

		// 大于范围
		if(year > maxYear){
			self.times = util.setDate(maxYear, 1, 1);
			return;
		}
		// 小于范围
		if(year < minYear){
			self.times = util.setDate(minYear, 1, 1);
			return;
		}

		self.clearGroup();
		self.setYM();

		var now = util.setDate();
		var days = util.getDaysInMonth(year, month + 1);
		// 获取当前是周几
		var week = util.setDate(year, month+1, 1).getDay();
		var r = 0;

		var cells = days + week,
			after = cells;

		while(after > 7){
			after -= 7;
		}

		for(var i=0; i<7; i++){
			self.data.dates[i] = [];
		}

		cells += 7 - after;

		var index = 0;

		for(var i=0; i<cells; i++){
			var _dy = 1 + (i - week);
			// 对应日期
			var day = util.setDate(year, month+1, _dy);
			self.setDays(_dy, {
				index: index,
				fullDate: util.format(day),
				isWeek: (r == 0 || r == 6),
				isSelected: util.compareDates(day, _date),
				isToday: util.compareDates(day, now),
				isEmpty: i < week || i >= (days + week),
				isDisabled: (function(){
					var disable = config.disableDate;
					if (!disable){
						return false;
					}
					var b = util.parse(disable[0]),
						a = util.parse(disable[1]);

					b.setHours(0,0,0,0);
					a.setHours(0,0,0,0);

					if (b.getTime() <= day.getTime() && a.getTime() >= day.getTime()) {
						return false;
					};

					return true;
				})()
			});

			if(++r == 7){
				r = 0;
				index++;
			}
		}
	},
	clearGroup: function(){
		this.data.dates = [];
		this.data.years = [];
	},
	/**
	 * 组织当前日期
	 * @param curr
	 * @param opts
	 */
	setDays: function(curr, opts){
		var self = this;
		var cls = 'day';
		if (opts.isDisabled){
			cls = 'disable'
		}

		if (opts.isToday){
			cls += ' today'
		}

		if (opts.isSelected){
			cls += ' select'
		}

		if (opts.isWeek){
			cls += ' week'
		}

		if (opts.isEmpty){
			curr = '';
			cls = 'empty'
		}

		self.data.dates[opts.index].push({
			fullDate: opts.fullDate,
			cls: cls,
			date: curr
		})

	},
	setYM: function(){
		var self = this
		var range = self.config.range

		// 年份
		var maxYear = range.max,
			minYear = range.min;

		for (; minYear <= maxYear; minYear++) {
			self.data.years.push(minYear);
		};
		self.data.currYear = self.times.getFullYear();

		// 月份
		self.data.currMonth = self.times.getMonth() + 1

		// now
		self.data.now = aw.util.date.format(new Date())
	}
}, aw.ui.Emitter);

aw.ui.calendar = {
	init: function(els, config){
		els = $(els);
		if(!els.length)
			return;

		return els.each(function(){
			new Calendar($(this), config);
		});
	}
}
})(aw, "<div class=\"ui-calendar-box\" data-calendar-box=\"\">\r\n\t<div class=\"title\" data-cal=\"title\">\r\n\t\t<div class=\"label label-year\" data-calendar-time=\"year\">\r\n\t\t\t<select class=\"select select-year\">\r\n\t\t\t\t<% for (var i = 0; i < years.length; i++) {%>\r\n\t\t\t\t<option value=\"<%= years[i] %>\" <% if(years[i] == currYear) { %> selected <% } %>><%= years[i] %>年</option>\r\n\t\t\t\t<% }%>\r\n\t\t\t</select>\r\n\t\t</div>\r\n\t\t<div class=\"label label-month\" data-calendar-time=\"month\">\r\n\t\t\t<select class=\"select select-month\">\r\n\t\t\t\t<% for (var i = 1; i <= 12; i++) {%>\r\n\t\t\t\t\t<option value=\"<%= i %>\" <% if(i == currMonth) {%>selected<% }%>><%= i %>月</option>\r\n\t\t\t\t<% }%>\r\n\t\t\t</select>\r\n\t\t</div>\r\n\t\t<a href=\"javascript:;\" data-calendar-btn=\"prev\" class=\"prev\">&lt;</a>\r\n\t\t<a href=\"javascript:;\" data-calendar-btn=\"next\" class=\"next\">&gt;</a>\r\n\t</div>\r\n\t<table cellpadding=\"0\" cellspacing=\"0\" class=\"table\" data-calendar=\"main\">\r\n\t\t<tr>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"日\">\r\n\t                日\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"一\">\r\n\t                一\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"二\">\r\n\t                二\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"三\">\r\n\t                三\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"四\">\r\n\t                四\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"五\">\r\n\t                五\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"六\">\r\n\t                六\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t\t<% for (var i = 0; i < dates.length; i++) {%>\r\n\t\t<tr>\r\n\t\t\t<% for (var k = 0; k < dates[i].length; k++) {%>\r\n\t\t\t\t<td class=\"<%= dates[i][k].cls %>\"><span data-calendar-day=\"<%= dates[i][k].fullDate %>\"><%= dates[i][k].date %></span></td>\r\n\t\t\t<% } %>\r\n\t\t</tr>\r\n\t\t<% } %>\r\n\t</table>\r\n\t<div class=\"footer\">\r\n\t\t<button class=\"back-now\" data-calendar-day=\"<%= now %>\">今天</button>\r\n\t</div>\r\n</div>");
;(function(aw, html){
var defaultConf = {
	cls: 'active',
	eventType: 'click',
	btnClass: 'slider-number-box',
	menu: 'a',
	child: 'li',
	autoPlay: true,
	//此处为秒
	time: 5,
	defter: 0,
	clickTab: aw.noop
}
/**
 * 依赖于Tabs
 *
 * Slider Class
 * @type {*}
 */
var Slider = aw.Class.create({
	init: function(el, config){
		var self = this;
		config = self.config = aw.extend(defaultConf, config);

		self.wrap = el;
		self.box = el.find(config.child);

		el.addClass('ui-slider-box');

		self.createMenu();

		this.total = this.menu.length - 1;
		this.currIndex = 0;

		this.time = config.time * 1000;
		this.defer = config.defter * 1000;

		self.start();
	},
	createMenu: function(){
		var self = this;
		var template = $(html);
		template.addClass(self.config.btnClass);
		var btn = '';
		for(var i=0; i<=self.total; i++){
				btn += '<a href="javascript:;" class="'+(!i ? self.config.cls : '')+'">'+(i+1)+'</a>'
		}
		template.html(btn);
		self.el = template;
		self.menu = template.find('a');
		self.wrap.after(template);
	}
}, aw.ui.Tabs, aw.ui.Emitter);

aw.ui.slider = {
	init: function(els, config){
		els = $(els);
		if(!els.length) return;
		return els.each(function(){
			new Slider($(this), config);
		});

	}
}
})(aw, "<div class=\"ui-slider-btn-box\"></div>");
;(function(aw, html){
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


})(aw, "<cite class=\"ui-validate-message\"></cite>");
;(function(aw){
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

})(aw);