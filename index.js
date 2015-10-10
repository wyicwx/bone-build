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
		} else {
			if(bone.log.warn.count > 0) {
				bone.log.info('bone-build', ('status: unknown, warn: ('+bone.log.warn.count+')').yellow);
			} else {
				bone.log.info('bone-build', ('status: success, warn: ('+bone.log.warn.count+')').green);
			}
		}
	}
	build();
}

function buildSingleFile(file, bone, callback) {
	file = path.resolve(file);
	if(bone.fs.existFile(file, {notFs: true})) {
		var readStream = bone.fs.createReadStream(file);
		var writeStream = bone.fs.createWriteStream(file, {focus: true});
		var cwd = process.cwd();

		readStream.pipe(writeStream, {end: false});
		readStream.on('end', function() {
			bone.log.info('bone-build', path.relative(cwd, file));
			callback();
		});
	} else {
		callback();
	}
}

function setup() {
	return function(command, bone) {
		var builder = command('build');
		builder.description('build all file')
			.version(pkg.version)
			.action(function() {
				var files = bone.fs.fileStack;

				buildFileArray(files, bone);
			});
	};
}

module.exports = setup;