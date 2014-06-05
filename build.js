var fs = require('fs')
	, path = require('path');

/**
 * 文件写入
 * @param file
 * @param content
 */
function writeFile(file, content, encode, fn){
	if(typeof encode == 'function'){
		fn = encode;
		encode = void 0;
	}

	fs.open(file, "w", 0666, function(e, fd){
		if(e) throw e;
		fs.write(fd, content, 0, (encode || 'utf-8'), function(e){
			if(e) throw e;
			fn && fn();
			fs.closeSync(fd);
		});
	});
}

// lib dir

var lib = 'lib/components';
var distjs = 'dist/ui.js';
var distcss = 'dist/ui.css';

// js
writeFile(distjs, '', 'utf-8');
writeFile(distcss, '', 'utf-8');
var js = fs.createWriteStream(distjs, {
	flags: 'a'
});

// components to build

var components = ['emitter', 'dialog', 'overlay', 'confirm'];

function next(i) {
	var name = components[i];
	if (!name) return;
	build(name, function(){
		next(++i);
	});
}

// build em!

console.log('START!\n');

var basejs = fs.readFileSync('lib/base.js', 'utf-8');
var classjs = fs.readFileSync('lib/class.js', 'utf-8');

js.write(basejs + '\n');
js.write(classjs + '\n');
next(0);
process.on('exit', function(){
	console.log();
});

/**
 * Build the given component.
 */

function build(name, fn) {
	// javascript
	var js = path.join(lib, name, 'index.js');
	read(js, function(js){

		// with template
		var html = path.join(lib, name, 'index.html');
		if (fs.existsSync(html)) {
			read(html, function(html){
				js = '\n;(function(aw, html){\n'
					+ js
					+ '\n})(aw, ' + JSON.stringify(html) + ');';
				append(distjs, js, function(){
					console.log('  \033[90mbuild \033[36m%s\033[m', name);
					fn();
				});
			});
			// without template
		} else {
			js = '\n;(function(aw){\n'
				+ js
				+ '\n})(aw);';
			append(distjs, js, function(){
				console.log('  \033[90mbuild \033[36m%s\033[m', name);
				fn();
			});
		}
	});

	// css
	var css = path.join(lib, name, 'index.css');
	if(fs.existsSync(css)){
		read(css, function(css){
			css = '/*\n* '+name+'\n======================*/\n'
				+ css
				+ '\n';
			append(distcss, css)
		})
	}


}

/**
 * Append to `file`.
 */

function append(file, str, fn) {
	fs.createWriteStream(file, { flags: 'a' })
		.write(str);
	fn && fn();
}

/**
 * Read the given `file`.
 */

function read(file, fn) {
	fs.readFile(file, 'utf8', function(err, str){
		if (err) throw err;
		fn(str);
	});
}