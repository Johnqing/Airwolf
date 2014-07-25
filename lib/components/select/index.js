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