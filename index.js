var fs = require('fs');
var path = require('path');
var pkg = require('./package.json');
var bonefs;

function buildFileArray(files, bone) {
	var total = files.length;
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
				bone.log.info('bone-build', ('status: unknown, total: '+total+' file, warn: ('+bone.log.warn.count+')').yellow);
			} else {
				bone.log.info('bone-build', ('status: success, total: '+total+' file, warn: ('+bone.log.warn.count+')').green);
			}
		}
	}
	build();
}

function buildSingleFile(file, bone, callback) {
	file = path.resolve(file);
	if(bonefs.existFile(file, {notFs: true})) {
		var readStream = bonefs.createReadStream(file);
		var writeStream = bonefs.createWriteStream(file, {focus: true});
		var cwd = process.cwd();

		readStream.pipe(writeStream, {end: false});
		readStream.on('end', function() {
			bone.log.info('bone-build', path.relative(cwd, file));
			callback();
		});
		readStream.on('error', function(error) {
			throw error;
		});
	} else {
		callback();
	}
}

function setup() {
	return function(command, bone, fs) {
		var builder = command('build');
		builder.description('build all file')
			.version(pkg.version)
			.action(function() {
				bonefs = fs;
				if(bone.fs) {
					var files = bone.utils.keys(bone.fs.files);
				} else {
					var files = bone.utils.fs.getAllVirtualFiles();
				}

				buildFileArray(files, bone);
			});
	};
}

module.exports = setup;