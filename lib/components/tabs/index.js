
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