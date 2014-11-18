# bone-build
>bone build 

### 安装

```sh
$ npm install bone-build
```

在`bonefile.js`文件内载入bone-build

```js
var bone = require('bone');
require('bone-build')(bone);
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
