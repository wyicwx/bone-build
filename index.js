var fs = require('fs');
var path = require('path');
var pkg = require('./package.json');

function buildFileArray(files, bone) {
	var build = function() {
		var file = files.shift();
		if(file) {
			/**
			 * 受操作系统的限制一次性打开太多文件会报错，这里修改成生成构建好一个再构建下一个
			 */
			buildSingleFile(file, bone, function() {
				build();
			});
		}
	}
	build();
}

function buildSingleFile(file, bone, callback) {
	file = path.resolve(file);
	if(bone.fs.existFile(file, {notFs: true})) {
		var readStream = bone.fs.createReadStream(file);
		var writeStream = bone.fs.createWriteStream(file, {focus: true});

		readStream.pipe(writeStream, {end: false});
		readStream.on('end', function() {
			callback();
			bone.log.log('build', file);
		});
	} else {
		bone.log.warn('build', 'not exist: '+file);
		callback();
	}
}

function setup() {
	return function(command, bone) {
		var builder = command('build');
		builder.description('build file/project')
			.version(pkg.version)
			.option('-p, --project <project>', 'build project', function(project) {
				var files = bone.project(project);
				if(files) {
					buildFileArray(files, bone);
				} else {
					bone.log.warn('build', 'not exist project: '+project);
				}
			})
			.option('-l, --list <project>', 'list project contents', function(project) {
				var files = bone.project(project);
				if(files) {
					files.forEach(function(file) {
						bone.log.log('build', 'file: '+file.replace(bone.fs.base, '~'));
					});
				} else {
					bone.log.warn('build', 'not exist project: '+project);
				}
			})
			.action(function() {
				var files = Array.prototype.slice.call(arguments).slice(0, -1);

				if(files.length) {
					buildFileArray(files, bone);
				}
			});
	};
}

module.exports = setup;