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