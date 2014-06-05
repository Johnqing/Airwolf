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
					return;
				}
				aw.ajax.error(data, config);
			}
		});
	},
	error: function(data, config){
		if(!config.isNotCheckLogin){
			// 1007: 超时
			// 1008: 未登录
			if(data.errno == '1007' || data.errno == '1008')
				return QHPass.logout(QHPAY.Login.go);
		}
		// 2005 => lock
		if(data.errno == '2005'){
			aw.ui.confirm.lock();
			return
		}

		config.error && config.error(data);

		if(config.isNotPop) return;

		aw.ui.confirm.error(data.error);

	}
}
})(aw);
;(function(aw, html){
var defaultConfig = {}

/**
 * Dialog Class
 * @type {*}
 */
var Dialog = aw.ui.Dialog = aw.Class.create({
	// init new Dialog
	init: function(config){
		config = aw.extend(defaultConfig, config);

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

// 内容变化
function _onchange(event){
	var node = $('[data-select-box='+event.data.ref+']');
	if(!node.length) return false;
	// ajax

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