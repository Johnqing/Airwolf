Airwolf
=======

> ui控件

## 构建工具
```
node build.js
```

```
lib => modules
dist => build after
```

## 代码结构

aw.config 是配置的集合，可以把所有相关的配置写到这里进行统一管理

aw.Class 是aw的类构造器

aw.util 是aw工具集的命名空间，所有工具方法都在util之内

aw.ui 是ui模块的命名空间

aw.ajax 是ajax的二次封装


##  目录结构

```
lib
	components
		...           各模块
	base.js           aw基本模块（定义了结构和相关配置）
	class.js          aw的类工厂
	nt.js             NT模板引擎
```

## 类工厂

接口：

### 构建类
```
aw.Class.create({
	init: function(){
		// 构造器
	},
	.... //这里是写入方法
}, 需要继承的父类，可多个);
```

### 静态方法拓展

```
aw.Class.extend(className, {});

// 类似
className.xxx = 1;
className.xxx2 = function(){}
```

### 单例

```
aw.Class.instance(className);
```