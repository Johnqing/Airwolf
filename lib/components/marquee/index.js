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