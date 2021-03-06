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