var fs = require('fs');
var path = require('path');
var pkg = require('./package.json');
var bonefs;
var options;

function buildFileArray(files, bone, callback) {
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
			var data = require('bone/lib/data.js');
			if(options.showDependentTrace) {
				console.log('data.virtualFileTraceTree');
				console.log(data.virtualFileTraceTree);
			}
			if(bone.log.warn.count > 0) {
				bone.log.info('bone-build', ('status: unknown, total: '+total+' file, warn: ('+bone.log.warn.count+')').yellow);
			} else {
				bone.log.info('bone-build', ('status: success, total: '+total+' file, warn: ('+bone.log.warn.count+')').green);
			}

			callback && callback();
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
			callback && callback();
		});
		readStream.on('error', function(error) {
			throw error;
		});
	} else {
		callback && callback();
	}
}

function setupFs(fs) {
	bonefs = fs; 
}

function setup(opts) {
	options = opts || {};

	return function(command, bone, fs) {
		var builder = command('build');
		builder.description('build all file')
			.version(pkg.version)
			.option('--watch, -w', 'watch file to build.')
			.action(function(argv) {
				setupFs(fs);
				if(bone.fs) {
					var files = bone.utils.keys(bone.fs.files);
				} else {
					var files = bone.utils.fs.getAllVirtualFiles();
				}

				if (argv.W) { // watch
					var watcher = bone.watch();
				}

				buildFileArray(files, bone, function() {
					if (argv.W) {
						bone.log.info('bone-build', 'start watch file...');
						watcher.on('changed', function(file) {
							var dependenics = bone.utils.fs.getByDependentFile(file);

							dependenics.forEach(function(f) {
								buildSingleFile(f, bone);
							});
						});
					}
				});
			});
	};
}

module.exports = setup;
module.exports.setupFs = setupFs;
module.exports.buildSingleFile = buildSingleFile;
module.exports.buildFileArray = buildFileArray;