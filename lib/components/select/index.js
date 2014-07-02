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
			divNode.addClass(self.config.cls || '');
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