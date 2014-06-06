var Slider = aw.Class.create({
	init: function(el, config){
		var self = this;
		self.el = el;
		self.config = config;
		el.addClass('ui-slider-box')
		var nodes = self.nodes = el.find(config.child);
		nodes.addClass('slider')
		self.total = nodes.length;

		if(self.total <= 1)
			return
		// ms * 1000 = s
		self.time = config.time * 1000;
		self.current = 1;
		self.timer = null;

		var cNodes = self.childNode = nodes.children();

		// fixed: default not have animate
		cNodes.css('opacity', 0);

		self.createBtn();
		self.bindEvent();
		self._style(1);
		self.timer = setInterval(function(){
			self.setTime();
		}, self.time);

		//

		this.on('click_tab', config.clickTab);

	},
	createBtn: function(){
		var self = this;
		var template = $(html);
		template.addClass(self.config.btnClass);
		var btn = '';
		for(var i=0; i<self.total; i++){
				btn += '<a href="javascript:;" class="'+(!i ? self.config.cls : '')+'">'+(i+1)+'</a>'
		}
		template.html(btn);
		self.btnBox = template;
		self.el.after(template);
	},
	bindEvent: function(){
		var self = this;

		self.btnBox.on('click', 'a', function(){
			var $this = $(this);
			var n = $this.index() + 1;
			this.emit('click_tab', n);

			self.toASpecificPage(n);
			clearInterval(self.timer);

			self.timer = setInterval(function(){
				self.setTime()
			}, self.time)

		});
	},
	_style: function(n){
		var zIndex = n ? 11 : 10;
		var pElem = this.nodes.eq(this.current-1);
		var elem = pElem.children();
		pElem.css("zIndex", zIndex);
		elem.stop(true).animate({'opacity': n}, 'slow');
	},
	toASpecificPage: function(index){
		var self = this;
		self._style(0);
		self.current = index;
		self.changePage();
		self._style(1);
	},
	changePage: function(){
		var self = this;
		self.childNode.removeClass("current");
		self.nodes.eq(self.current - 1).children().addClass("current");
		self.btnBox.children("a").removeClass("active");
		self.btnBox.children("a:nth-child(" + self.current + ")").addClass("active");
	},
	setTime: function(){
		var self = this;
		self._style(0);
		self.toNextPage();
		self._style(1);
	},
	toNextPage: function(){
		var self = this;
		self.current == self.total ? self.current = 1 : self.current++;

		self.changePage();
	}
}, aw.ui.Emitter);

aw.ui.slider = {
	init: function(els, config){
		els = $(els);
		if(!els.length) return;

		config = aw.extend({
			cls: 'active',
			eventType: 'click',
			btnClass: 'slider-number-box',
			child: 'li',
			//此处为秒
			time: 5,
			clickTab: aw.noop
		},config);

		return els.each(function(){
			new Slider($(this), config);
		});

	}
}