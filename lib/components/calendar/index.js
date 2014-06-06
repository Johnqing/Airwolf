function getPos(el){
	var p = el.offset(),
		borderWidth = parseInt(el.css('border-top-width')) * 2;
	return {
		top: p.top + el.innerHeight() + borderWidth,
		left: p.left
	};
}

var defaultConf = {
	isOpenShow: false,
	eventType: 'click',
	pattern: 'yyyy-MM-dd',
	// 皮肤
	theme: 0,
	//默认日期
	defaultDate: null,
	//禁用xx日期日期前，xx日期后，数组['2012-12-19', '2013-12-19']
	disableDate: null,
	// 日期间隔
	range: {
		max: 2050,
		min: 1980
	},
	// 选中回调
	select: null,
	// 打开回调
	open: null,
	// 关闭回调
	close: null
}

var Calendar = aw.Class.create({
	init: function(el, config){
		var self = this;

		self.el = el;
		self.config = aw.extend(defaultConf, config);

		this.data = {
			years: [],
			dates: [],
			currYear: '',
			currMonth: '',
			now: ''
		};

		self.setTimes(el.val());

		var config = self.config;
		// 默认打开就渲染
		if(config.isOpenShow){
			self.render();
		}
		self.bindEvent();
	},
	bindEvent: function(){
		var self = this,
			config = self.config;
		// 事件绑定

		self.on('chose_date', function(el){
			if(el.hasClass('.disabled'))
				return;
			var value = el.attr('data-calendar-day');
			self.el.val(value);
			closeCalendar();
		});

		function closeCalendar(){
			self.node.off('click');
			self.node.remove();
			$(document).off('click', closeCalendar);
		}
		self.el.on(config.eventType, function(ev){
			if(self.node){
				self.node.remove()
				self.node = null;
			}
			var value = ev.target.value;
			self.setTimes(value);
			self.render();

			self.node.on('click', '.day', function(evt){
				self.emit('chose_date', $(evt.target))
			});
			//
			$(document).on('click', closeCalendar);
			return false;
		});
		// 回调
		self.on('select', config.select);
		self.on('open', config.open);
		self.on('close', config.close);
	},
	setTimes: function(value){
		var util = aw.util.date;
		value = $.trim(value);
		value = value ? util.parse(value) : util.setDate();

		var year = value.getFullYear();
		var month = value.getMonth();
		var _date = value.getDate();

		this.times = aw.util.date.setDate(year, month+1, _date);

	},
	render: function(){
		var self = this;

		nowId = aw.uniqueId();

		self.groupQuery();

		var template = NT.tpl(html, self.data);
		var node = self.node = $(template);
		node.attr('data-calendar-box', nowId);

		var obj = getPos(self.el);
		node.css({
			position: 'absolute',
			left: obj.left,
			top: obj.top
		});

		node.appendTo('body');
	},
	groupQuery: function(){
		var self = this,
			config = self.config,
			util = aw.util.date;

		var maxYear = config.range.max,
			minYear = config.range.min;

		// maxYear 必须大于 minYear
		if(maxYear - minYear < 0)
			throw new Error('incorrect time interval!');

		var year = self.times.getFullYear(),
			month = self.times.getMonth(),
			_date_ = self.times.getDate(),
			_date = util.setDate(year, month+1, _date_)

		// 大于范围
		if(year > maxYear){
			self.times = util.setDate(maxYear, 1, 1);
			return;
		}
		// 小于范围
		if(year < minYear){
			self.times = util.setDate(minYear, 1, 1);
			return;
		}

		self.clearGroup();
		self.setYM();

		var now = util.setDate();
		var days = util.getDaysInMonth(year, month + 1);
		// 获取当前是周几
		var week = util.setDate(year, month+1, 1).getDay();
		var r = 0;

		var cells = days + week,
			after = cells;

		while(after > 7){
			after -= 7;
		}

		for(var i=0; i<7; i++){
			self.data.dates[i] = [];
		}

		cells += 7 - after;

		var index = 0;

		for(var i=0; i<cells; i++){
			var _dy = 1 + (i - week);
			// 索引 ++
			if(i%7 == 0 && i){
				index++;
			}
			// 对应日期
			var day = util.setDate(year, month+1, _dy);
			self.setDays(_dy, {
				index: index,
				fullDate: util.format(day),
				isWeek: (r == 0 || r == 6),
				isSelected: util.compareDates(day, _date),
				isToday: util.compareDates(day, now),
				isEmpty: i < week || i >= (days + week),
				isDisabled: (function(){
					var disable = config.disableDate;
					if (!disable){
						return false;
					}
					var b = util.parse(disable[0]),
						a = util.parse(disable[1]);

					b.setHours(0,0,0,0);
					a.setHours(0,0,0,0);

					if (b.getTime() <= day.getTime() && a.getTime() >= day.getTime()) {
						return false;
					};

					return true;
				})()
			});

		}
	},
	clearGroup: function(){
		this.data.dates = [];
	},
	/**
	 * 组织当前日期
	 * @param curr
	 * @param opts
	 */
	setDays: function(curr, opts){
		var self = this;
		var cls = 'day';
		if (opts.isDisabled){
			cls = 'disable'
		}

		if (opts.isToday){
			cls += ' today'
		}

		if (opts.isSelected){
			cls += ' select'
		}

		if (opts.isWeek){
			cls += ' week'
		}

		if (opts.isEmpty){
			curr = '';
			cls = 'empty'
		}

		self.data.dates[opts.index].push({
			fullDate: opts.fullDate,
			cls: cls,
			date: curr
		})

	},
	setYM: function(){
		var self = this
		var range = self.config.range

		// 年份
		var maxYear = range.max,
			minYear = range.min;

		for (; minYear <= maxYear; minYear++) {
			self.data.years.push(minYear);
		};
		self.data.currYear = self.times.getFullYear();

		// 月份
		self.data.currMonth = self.times.getMonth() + 1

		// now
		self.data.now = aw.util.date.format(new Date())
	}
}, aw.ui.Emitter);

aw.ui.calendar = {
	init: function(els, config){
		els = $(els);
		if(!els.length)
			return;

		return els.each(function(){
			new Calendar($(this), config);
		});
	}
}