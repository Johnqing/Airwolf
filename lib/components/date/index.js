/**
 * 日期格式化
 * @param  {Date} text   需要格式化的日期
 * @param  {String} fs 日期格式。如：yyyy-MM-dd
 * @return {String}        格式化后的日期
 */
function formatDate(text, fs){
	var format;
	var y = text.getFullYear().toString(),
		o = {
			M: text.getMonth()+1, //month
			d: text.getDate(), //day
			h: text.getHours(), //hour
			m: text.getMinutes(), //minute
			s: text.getSeconds() //second
		};
	format = fs.replace(/(y+)/ig, function(a, b) {
		return y.substr(4 - Math.min(4, b.length));
	});
	for (var i in o) {
		format = format.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
			return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
		});
	}
	return format;
}

/**
 * 字符串解析为日期
 * @param  {String} text   日期字符串
 * @param  {String} format 解析格式
 * @return {Date}        新日期
 */
function parseDate(text){
	//格式化日期
	var textArr = text.split(reNoWord);
	var formatArr = formatString.split(reNoWord)
	// 初始化日期
	var _date = new Date(0);

	for (var i = 0; i < formatArr.length; i++) {
		var fm = formatArr[i],
			t = textArr[i];

		if (/y{4}/.test(fm)){
			_date.setFullYear(parseInt(t));
		}else if(/y{2}/.test(fm)){
			_date.setYear(parseInt(t, 10));
		}else if (/M{1,2}/.test(fm)) {
			_date.setMonth(parseInt(t, 10) - 1);
		} else if (/d{1,2}/.test(fm)) {
			_date.setDate(parseInt(t, 10));
		} else if (/H{1,2}/.test(fm)) {
			_date.setHours(parseInt(t, 10));
		} else if (/m{1,2}/.test(fm)) {
			_date.setMinutes(parseInt(t, 10));
		} else if (/s{1,2}/.test(fm)) {
			_date.setSeconds(parseInt(t, 10));
		} else {
			continue;
		}

	}
	return _date;
}

//闰月年计算
function isLeapYear(year){
	// http://stackoverflow.com/a/4881951
	return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}

function getDaysInMonth(year, month){
	return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}
// 判断日期是否相等
function compareDates(a, b){
	return a.getTime() === b.getTime();
}
/**
 * 设置日期
 * @param time
 * @returns {*}
 */
function setDate(time){
	if(!time) return '';
	time = time.split(/[^\d]/g);
	var date = new Date();
	date.setUTCFullYear(time[0], time[1] - 1, time[2]);
	date.setUTCHours(0, 0, 0, 0);
	return date;
}

/**
 * 日期对外接口
 * @type {{format: formatDate, getDaysInMonth: getDaysInMonth, isLeapYear: isLeapYear, parse: parseDate, setDate: setDate}}
 */
aw.util.date = {
	format: formatDate,
	getDaysInMonth: getDaysInMonth,
	isLeapYear: isLeapYear,
	parse: parseDate,
	setDate: setDate
};