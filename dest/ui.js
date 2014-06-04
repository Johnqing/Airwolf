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
			return $.extend({}, old, n);
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
		}
	}

	window.af = window.Airwolf = Airwolf;

})(jQuery, window, document);

// document.body
(function(af, document){
	af.doc = {
		el: $(document.body)
	}
	af.doc.w = af.doc.el.width()
	af.doc.h = af.doc.el.height()
})(af, document);



(function(af){
	/**
	 * @namespace
	 * @desc 类控制器
	 */
	af.Class = (function(){
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
				if(af.type(arg) == 'object'){
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
	af.Class.extend = function(className, staticProperty){
		for(var key in staticProperty){
			className[key] = staticProperty[key];
		}
		return className;
	};
})(af);

;(function(af){
var Emitter = af.Class.create({
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
		cb = cb || [];

		cb.push(fn);

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

af.ui.Emitter = Emitter;

})(af);
;(function(af, html){
var defaultConfig = {}

/**
 * Dialog Class
 * @type {*}
 */
var Dialog = af.ui.Dialog = af.Class.create({
	// init new Dialog
	init: function(config){
		config = af.extend(defaultConfig, config);

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
		this._overlay = af.ui.overlay();
		return this;
	},
	/**
	 * 带遮罩
	 * @returns {Dialog}
	 */
	overlay: function(isClose){
		var self = this;
		var overlay = af.ui.overlay({
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
}, af.ui.Emitter);

af.ui.dialog = {
	init: function(config){
		return new Dialog(config);
	}
}
})(af, "<div class=\"ui-dialog-box\">\r\n\t<div class=\"content\">\r\n\t\t<h1>Title</h1>\r\n\t\t<a href=\"#\" class=\"close\">×</a>\r\n\t\t<p>Message</p>\r\n\t</div>\r\n</div>");
;(function(af, html){

var Overlay = af.Class.create({
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
}, af.ui.Emitter);


af.ui.overlay = function(config){
	return new Overlay(config);
}
})(af, "<div class=\"ui-overlay hide\"></div>");
;(function(af, html){
var Confirm = af.Class.create({
	cancel: function(text){
		this.el.find('.cancel').text(text)
		return this;
	},
	ok: function(text){
		this.el.find('.ok').text(text);
		return this;
	},
	show: function(fn){
		af.ui.Dialog.prototype.show.call(this);

		this.el.find('.ok').focus();
		this.callback = fn || af.noop;
		return this;
	},
	render: function(config){
		af.ui.Dialog.prototype.render.call(this, config);

		var self = this;
		var action = $(html)

		this.el.addClass('ui-confirm');
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

}, af.ui.Dialog, af.ui.Emitter);

af.ui.confirm = {
	init: function(config){
		return new Confirm(config);
	}
}
})(af, "<div class=\"ui-confirm-box\">\r\n    <button class=\"cancel\">Cancel</button>\r\n    <button class=\"ok\">Ok</button>\r\n</div>");