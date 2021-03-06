aw.util.form = {
	/**
	 * 获取元素的 value
	 * @param el
	 * @returns {*}
	 */
	elValue: function(el){
		el = $(el);
		var type = el.attr("type"),
			val = $.trim(el.val()).replace(/\s/g, '');

		if (type === "radio" || type === "checkbox") {
			return $("input[name='" + el.attr("name") + "']:checked").val();
		}
		if (typeof val === "string") {
			return val.replace(/\r/g, "");
		}
		return val;
	},
	/**
	 * 检查是否为checkbox/radio
	 * @param el
	 * @returns {boolean}
	 */
	checkable: function(el){
		return /radio|checkbox/i.test(el[0].type);
	},
	/**
	 * 获取length
	 * @param el
	 * @returns {Number|jQuery}
	 */
	getLength: function(el){
		return $(el).filter(":checked").length;
	},
	/**
	 * 表单数据提取
	 * @param nodeChilds
	 * @param prefix 加密前缀
	 * @returns {string}
	 */
	serialize: function(nodeChilds, prefix){
		var data = [];
		var fm = aw.util.form;
		$.each(nodeChilds, function(){
			var $this = $(this),
				Md5 = $this.data('m'),
				encode = $this.data('encode'),
				ignore = $this.data('validate-ignore'),
				name = $this.attr('name'),
				value = fm.elValue($this)

			if(!name || ignore) return;

			// 防止选取所有checkbox
			if(!$this.is(':checked') && fm.checkable($this)) return;

			if(encode){
				value = encodeURIComponent(value);
			}

			/**
			 * 加密规则为：
			 * 0： 直接对value加密
			 * 1： 加密前缀 + value
			 * 2： 加密前缀 + value 和 复制一份name+'_md5' 并且value加密的
			 */
			if(Md5){

				if(typeof prefix === 'undefined')
					throw new Error('md5时需要的前缀没有设置！');

				if(Md5 == '0'){
					value = hex_md5(value);
				} else {
					if(Md5 == '2'){
						data.push(name+'_md5='+hex_md5(value));
					}
					value = hex_md5(prefix + value);
				}
			}

			data.push(name+'='+value);


		});

		return data.join('&');
	}
}