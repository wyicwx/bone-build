# bone-cli-build
>bone生成文件

### 安装

```sh
$ npm install bone-cli-build
```

在`bonefile.js`文件内通过`bone.cli()`载入bone-cli-build

```js
var bone = require('bone');
var build = require('bone-cli-build')();

bone.cli(build);
```

### 使用

通过下面的命令查看帮助
```sh
$ bone build --help
```

生成一个文件
```sh
$ bone build ./dist/file.js
```

生成项目文件

```sh
$ bone build -p project
```
