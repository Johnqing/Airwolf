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