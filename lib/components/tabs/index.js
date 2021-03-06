
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