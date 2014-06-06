var reNoWord = /\W/;
/**
 * 日期格式化
 * @param  {Date} text   需要格式化的日期
 * @param  {String} fmt 日期格式。如：yyyy-MM-dd
 * @return {String}        格式化后的日期
 */
function formatDate(text, fmt){
	fmt = fmt || 'yyyy-MM-dd'
	var format;
	var y = text.getFullYear().toString(),
		o = {
			M: text.getMonth()+1, //month
			d: text.getDate(), //day
			h: text.getHours(), //hour
			m: text.getMinutes(), //minute
			s: text.getSeconds() //second
		};
	format = fmt.replace(/(y+)/ig, function(a, b) {
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
 * @param  {String} fmt 解析格式
 * @return {Date}        新日期
 */
function parseDate(text, fmt){
	fmt = fmt || 'yyyy-MM-dd'
	//格式化日期
	var textArr = text.split(reNoWord);
	return setDate(textArr);
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
function setDate(year, month, _date){
	var date = new Date();
	if(year){
		var time = year;
		if(arguments.length == 1 && aw.type(time) == 'year'){
			time = year.split(/[^\d]/g);
		}
		if(aw.type(year) == 'array'){
			year = time[0];
			month = time[1] || 1;
			_date = time[2] || 0
		}
		date.setUTCFullYear(year, month - 1, _date);
	}
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
	setDate: setDate,
	compareDates: compareDates
};