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
				className = eval(className);
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
		* //parentClass-<1>
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
		if(arguments.length == 1 && aw.type(time) == 'string'){
			time = year.split(/[^\d]/g);
		}
		if(aw.type(time) == 'array'){
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
			val = $.trim(el.val()).replace(/\s/g, '');

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
				Md5 = $this.data('m'),
				encode = $this.data('encode'),
				ignore = $this.data('validate-ignore'),
				name = $this.attr('name'),
				value = fm.elValue($this)

			if(!name || ignore) return;

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

				if(typeof prefix === 'undefined')
					throw new Error('md5时需要的前缀没有设置！');

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
	animate: false,
	handoff: aw.noop
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
		// 切换时的回调
		this.on('handoff', config.handoff);
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
				n = self.menu.index($this);

			clearInterval(self.defterTimer);
			self.defterTimer = setTimeout(function(){
				self.toASpecificPage.call(self, n);
				if(!config.autoPlay) return;
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
		self.emit('handoff', index);
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
		if(!self.box) return;
		self.box.addClass('ui-tabs-cont');
	},
	changePage: function(){
		var self = this;
		var config = self.config;
		var n = self.currIndex;

		self.menu.removeClass(config.cls).eq(n).addClass(config.cls);

		if(!self.box) return;
		var box = self.box.eq(n);
		box.addClass('ui-tabs-cont-'+config.cls).siblings(config.box).removeClass('ui-tabs-cont-'+config.cls);
		if(!config.animate){
			box.show().siblings(config.box).hide();
			return;
		}
		box.stop(true, true).fadeIn(500).siblings(config.box).fadeOut(500);

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
		this.onclose = config.close;
		this.time = config.time || 0;
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
		var subTitle = config.subTitle;
		var msg = config.message;
		var self = this;

		el.find('.close').on('click', function(){
			self.hide(self.time * 1000);
			return false;
		});

		//add class

		this.el_p.addClass(config.cls);

		// title
		el.find('h1').text(title);
		if(!title) el.find('h1').remove();
		// subtitle
		el.find('h2').text(subTitle);
		if(!subTitle){
			el.find('h2').remove();
		}

		// msg
		if ('string' == typeof msg) {
			el.find('p').html(msg);
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
		var top = this.getTopPostion(this.el_p);
		this.el_p.css({
			top: top<0 ? 0 : top,
			marginLeft: -(this.el_p.width() / 2) + 'px'
		});

		this.emit('show');
		return this;
	},
	getTopPostion: function(node){
		var winPostion = $(window).height() - node.height();
		return (winPostion/2) + $(document).scrollTop();
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
		this.onclose.call(this);
		this.el_p.remove();
		return this;

	}
}, aw.ui.Emitter);

aw.ui.dialog = {
	init: function(config){
		return new Dialog(config);
	}
}
})(aw, "<div class=\"ui-dialog-box\">\r\n\t<div class=\"content\">\r\n\t\t<div class=\"title\">\r\n\t\t\t<h1>Title</h1>\r\n\t\t\t<h2>subtitle</h2>\r\n\t\t\t<span class=\"close-box\">\r\n\t\t\t\t<a href=\"#\" class=\"close\">×</a>\r\n\t\t\t</span>\r\n\t\t</div>\r\n\t\t<p>Message</p>\r\n\t</div>\r\n</div>");
;(function(aw, html){
var body = $('body');
var wh = $(window).height();
var bdh = body.innerHeight();


var Overlay = aw.Class.create({
	init: function(config){
		var self = this;

		config = config || {};

		this.closeable = config.closeable;

		this.el = $(html);
		this.el.css({
			height: bdh > wh ? bdh : wh
		});
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
})(aw, "<div class=\"ui-confirm-box\">\r\n    <a href=\"javascript:;\" class=\"cancel\">Cancel</a>\r\n    <a href=\"javascript:;\" class=\"ok\">Ok</a>\r\n</div>");
;(function(aw, html){
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

		this.on('select', config.select);
	},
	clear: function(){
		var _box = [];
		this.emit('clear');
		$('.ui-select-options').hide();
	},
	render: function(){
		this.clear();
		var self = this;
		var $this = this.el;
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
		divNode.addClass(self.config.cls || '');
		if(ref){
			divNode.attr('data-select-ref', ref);
		}
		var aNode = select.find('a');
		aNode.attr({
			'data-select-box': cid,
			'class': $this.attr('class'),
			'name': name,
			'value': val
		});
		aNode.text(label);

		//options
		var options = self.options = $('<ul class="ui-select-options"></ul>');
		options.attr('data-select-pop', cid);
		var cls = self.config.cls ? self.config.cls +'-options' : '';
		options.addClass(cls);
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
	},
	bindEvent: function(els, config){
		var option = aw.extend({selector: '>a'}, config);
		var self = this;

		var $this = els;
		var selector = $(option.selector, $this);
		var id = self.uuid = $this.attr('data-select-box');


		selector.click(function(){
			var options = self.options;
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

			}
		});
		// 点击空白处关闭
		$(document).on('click', function(ev) {
			var target;
			target = ev.srcElement || ev.target;
			if (!target) {
				return;
			}
			do{
				if ($(target).attr('data-select-box') == self.uuid){
					return
				}
			}
			while(target = target.parentNode);
			// fixed target 冒泡为null的bug
			// fixed 当前select list 已经是隐藏的状况 也会触发 close
			if (!target && !self.options.is(':hidden')) {
				self.close();
			}
		});
		self._option(self.options.find(">li"), selector, $this);
		return els;
	},
	_option: function(els, selector, box){
		var self = this;
		$(">span", els).click(function(){
			var $this = $(this);
			$this.parents('ul').find(".selected").removeClass("selected");
			$this.parents('li').addClass("selected");

			var text = $this.text();
			var v = $this.attr("value");


			selector.text(text).attr('value', v);
			// 更新select的值
			var $input = $("select", box);
			if ($input.val() != v) {
				$("select", box).val(v).trigger("change");
			}
			//事件绑定
			self.emit('select', text, v);
		});
	},
	close: function(){
		this.emit('close');
		this.options.hide();
	}
}, aw.ui.Emitter);

aw.ui.select = {
	init: function(els, config){
		els = $(els);
		if(!els.length) return;

		config = aw.extend({
			html: '<li class="{{selected}}"><span value="{{value}}">{{message}}</span></li>',
			select: aw.noop
		}, config)

		return els.each(function(){
			new Select($(this), config)
		});
	}
}
})(aw, "<div class=\"ui-select-box\">\r\n\t<div class=\"select\">\r\n\t\t<a href=\"javascript:;\"></a>\r\n\t</div>\r\n</div>");
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
	select: aw.noop,
	// 打开回调
	open: aw.noop,
	// 关闭回调
	close: aw.noop
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
		var v = $.trim(el.val() || el.text());
		v = v ? aw.util.date.parse(v) : aw.util.date.setDate();
		self.valueTime = v;
		self.setTimes(v);

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
			// 选中是也需要设置时间
			self.valueTime = aw.util.date.parse(value);
			self.el.val(value);
			self.emit('select', value);
			closeCalendar();
		});
		var closeFlag = 0;
		function closeCalendar(){
			if(!closeFlag)
				return closeFlag = 1;
			closeFlag = 0;
			self.emit('close');
			self.node.off('click');
			self.node.remove();
			$(document).off('click', closeCalendar);
		}
		self.el.on(config.eventType, function(ev){
			if(self.node){
				self.node.remove()
				self.node = null;
			}
			var node = $(ev.target);
			var value = node.val() || node.text();
			value = value ? aw.util.date.parse(value) : aw.util.date.setDate();
			self.reRender(value);
			//
			$(document).on('click', closeCalendar);
		});
		// 回调
		self.on('select', config.select);
		self.on('open', config.open);
		self.on('close', config.close);
	},
	setTimes: function(value){
		var year = value.getFullYear();
		var month = value.getMonth();
		var _date = value.getDate();

		this.times = aw.util.date.setDate(year, month+1, _date);

	},
	render: function(){
		var self = this;
		self.emit('open');
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
			var month = n <4 ? value : self.times.getMonth() + 1;
			var year = n < 4 ? self.times.getFullYear() : value;
			var v = aw.util.date.parse([year, month, _date].join('-'));
			self.reRender(v);
			return false;
		});
		self.node.click(function(event){
			event.stopPropagation();
		});
		// 选择日期
		self.node.on('click', '.day', function(evt){
			self.emit('chose_date', $(evt.target))
		});
		// 月份翻页
		self.node.on('click', '[data-calendar-btn=prev]', function(){
			var _date = self.times;
			_date.setMonth(_date.getMonth() - 1);
			self.reRender(_date);
		});
		// 月份翻页
		self.node.on('click', '[data-calendar-btn=next]', function(){
			var _date = self.times;
			_date.setMonth(_date.getMonth() + 1);
			self.reRender(_date);
		})

	},
	/**
	 * 重新渲染
	 * @param year
	 * @param month
	 * @param _date
	 */
	reRender: function(_date){
		if(this.node){
			this.node.remove();
			this.node.off();
			this.node = null;
		}
		// 渲染
		this.setTimes(_date);
		this.render();
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
			_date =  self.valueTime;

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
		var days = util.getDaysInMonth(year, month);
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
})(aw, "<div class=\"ui-calendar-box\" data-calendar-box=\"\">\r\n\t<div class=\"title\" data-cal=\"title\">\r\n\t\t<div class=\"label label-year\" data-calendar-time=\"year\">\r\n\t\t\t<select class=\"select select-year\">\r\n\t\t\t\t<% for (var i = 0; i < years.length; i++) { %>\r\n\t\t\t\t<option value=\"<%= years[i] %>\" <% if(years[i] == currYear) { %> selected <% } %>><%= years[i] %>年</option>\r\n\t\t\t\t<% } %>\r\n\t\t\t</select>\r\n\t\t</div>\r\n\t\t<div class=\"label label-month\" data-calendar-time=\"month\">\r\n\t\t\t<select class=\"select select-month\">\r\n\t\t\t\t<% for (var i = 1; i <= 12; i++) { %>\r\n\t\t\t\t\t<option value=\"<%= i %>\" <% if(i == currMonth) { %>selected<% } %>><%= i %>月</option>\r\n\t\t\t\t<% } %>\r\n\t\t\t</select>\r\n\t\t</div>\r\n\t\t<a href=\"javascript:;\" data-calendar-btn=\"prev\" class=\"prev\">&lt;</a>\r\n\t\t<a href=\"javascript:;\" data-calendar-btn=\"next\" class=\"next\">&gt;</a>\r\n\t</div>\r\n\t<table cellpadding=\"0\" cellspacing=\"0\" class=\"table\" data-calendar=\"main\">\r\n\t\t<tr>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"日\">\r\n\t                日\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"一\">\r\n\t                一\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"二\">\r\n\t                二\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"三\">\r\n\t                三\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"四\">\r\n\t                四\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"五\">\r\n\t                五\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t\t<th scope=\"col\">\r\n\t            <span class=\"week\" title=\"六\">\r\n\t                六\r\n\t            </span>\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t\t<% for (var i = 0; i < dates.length; i++) { %>\r\n\t\t<tr>\r\n\t\t\t<% for (var k = 0; k < dates[i].length; k++) { %>\r\n\t\t\t\t<td class=\"<%= dates[i][k].cls %>\"><span data-calendar-day=\"<%= dates[i][k].fullDate %>\"><%= dates[i][k].date %></span></td>\r\n\t\t\t<% } %>\r\n\t\t</tr>\r\n\t\t<% } %>\r\n\t</table>\r\n\t<div class=\"footer\">\r\n\t\t<button class=\"day\" data-calendar-day=\"<%= now %>\">今天</button>\r\n\t</div>\r\n</div>");
;(function(aw, html){
var defaultConf = {
	cls: 'active',
	eventType: 'click',
	btnClass: 'slider-number-box',
	menu: 'a',
	child: 'li',
	autoPlay: true,
	animate: true,
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
	isSkipNull: true,
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
	// remote可通过该项进行相关的配置
	remoteCallback: null,
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
		}
		// success
		self.successList.push(key);
		self.showSuccess();
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

		self.benPending = function(){
			if(config.loadText){
				el.html('<b></b><em>'+(config.loadText || 'Loading')+'</em>');
			}
			el.addClass('ui-btn-loading ui-btn-disabled');
		}

		self.stopPending = function(){
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
			self.benPending();
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
					self.stopPending();
				});
			} else {
				self.stopPending();
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
	var self = this,
		config = self.config,
		fn = config.remoteCallback;

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
		success: function(json){
			var submitted = self.formSubmitted;
			self.formSubmitted = submitted;
			self.successList.push(rule.key);
			self.showSuccess();
			fn && fn(json);
			previous.valid = true;
		},
		error: function(json){
			var msg = json.error || rule.message;
			MESSAGES[rule.key]['remote'] = msg
			rule.message = msg;
			fn && fn(json);
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
		return fm.getLength(el) > 0;
	}
	return $.trim(value).length > 0;
});

/**
 * 相等
 */
setMethod('equalTo', function(value, el, rule){
	var self = this;
	var target = self.nodes_cache[rule.parameters];
	if(!target) return true;
	return value === aw.util.form.elValue(target);
});

/**
 * 不等
 */
setMethod('unequal', function(value, el, rule){
	var self = this;
	var target = self.nodes_cache[rule.parameters];
	if(!target) return true;
	return value !== aw.util.form.elValue(target);
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



})(aw, "<cite class=\"ui-validate-message\"></cite>");
;(function(aw){
var defaultConf = {
	childs: 'li',
	scroll: 'top',
	paused: false,
	defter: 0.85,
	time: 5,
	effectShow: 'swing',
	effectScroll: 'linear',
	onShow: aw.noop
}

var Marquee = aw.Class.create({
	init: function(el, config){
		config = this.config = aw.extend(defaultConf, config);
		config.time = config.time * 1000;
		config.defter = config.defter * 1000;

		this.el = el;
		this.childs = el.find(config.childs);

		this.total = this.childs.length - 1;
		this.currIndex = 0;

		this.on('show', config.onShow);
	},
	start: function(){
		var self = this;
		// 防止没有内容时，报错
		if(self.total<0) return;

		self.show();
	},
	show: function(){
		var self = this;
		var config = self.config;
		var index = self.currIndex;
		var child = self.childs.eq(index);

		child.addClass(config.cls);

		child.css({
			top: (config.scroll == 'top' ? '-' : '+') + child.outerHeight() + 'px',
			left: 0
		}).animate({top: 0}, config.defter, config.effectShow, function(){
			self.emit('show');
			self.scroll.call(self, child);
		});

	},
	showNext: function(){
		var self = this;
		self.currIndex += 1;

		if(self.currIndex > self.total){
			self.currIndex = 0;
		}
		self.show();
	},
	scroll: function(el){
		var self = this;
		var config = self.config;
		var paused = config.paused;

		if(paused) return;

		var time = config.time;

		if(el.outerWidth() > self.el.innerWidth()){

			setTimeout(function(){
				if(paused) return;

				var width = el.outerWidth(),
					endPos = width * -1,
					curPos = parseInt(el.css("left"), 10);

				el.animate({
					left: endPos + "px"
				},((width + curPos) * 12), config.effectScroll, function (){
					self.finish(el);
				});

			}, time);
			return;
		}

		if(self.total>0){
			setTimeout(function (){
				if(paused ) return;
				el.animate({
					top: (config.scroll == 'top' ? '+' : '-') + self.el.innerHeight() + "px"
				}, config.defter, config.effectScroll);

				self.finish(el);
			}, time);
		}

	},
	finish: function(el){
		el.removeClass(this.config.cls);
		this.showNext();
	}

}, aw.ui.Emitter);

aw.ui.marquee = {
	init: function(els, config){
		els = $(els);
		if(!els.length) return;

		return els.each(function(){
			new Marquee($(this), config).start();
		});
	}
}
})(aw);