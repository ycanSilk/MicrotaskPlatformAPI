一、下载项目发布版本：
访问：https://github.com/taoshihan1991/goflylivechat/tags

1.  下载最新版本的项目发布包，例如：goflylivechat-0.6.0.zip
2.  解压项目发布包到指定目录，例如：C:\goflylivechat
3.  进入项目发布目录，例如：C:\goflylivechat

二、安装go语言环境：
1. 下载并安装Go语言环境（推荐使用Go 1.16或更高版本）。
2. 配置Go语言环境变量：
   - 将Go语言的安装目录添加到系统的PATH环境变量中。
   - 设置GOPATH环境变量，指定Go语言项目的工作目录。
   - 设置GOROOT环境变量，指定Go语言的安装目录。
3. 以go version go1.21.0 windows/amd64版本为例，下列所有操作都依照这个版本的前提下执行：


三、数据库创建和配置：
1. 先安装和运行mysql >=5.5版本 , 创建gofly数据库.  下载MySQL安装包（推荐使用MySQL 8.0版本）
2. 运行mysql数据库并登陆mysql数据库
3. 创建gofly数据库
```sql
CREATE DATABASE gofly CHARACTER SET utf8 COLLATE utf8_general_ci;
```
4.修改项目的mysql.json配置文件，例如：
```shell
cd C:\goflylivechat\config
```
修改mysql.json配置文件.按实际数据库连接配置修改，例如：
```json
{
	"Server":"localhost",
	"Port":"3306",
	"Database":"gofly",
	"Username":"root",
	"Password":"123456"
}

```


四、安装和数据表
1. 进入项目发布目录，例如：cd C:\goflylivechat
2. 删除install.lock文件，例如：del install.lock
3. 设置国内的Go代理
```shell
go env -w GOPROXY=https://goproxy.cn,direct
```
4. 安装项目依赖
```shell
go mod tidy
```
5. 启动项目（开发环境测试）
```shell
go run go-fly.go server
```
6. 检查项目是否启动成功，访问http://localhost:8081/install ，如果能正常访问，说明项目启动成功。
7. 打开访问http://localhost:8081/install ，然后输入本地数据库的连接信息，例如：
```
数据库类型：MySQL
数据库主机：localhost
数据库端口：3306
数据库用户名：root
数据库密码：123456
数据库名称：gofly
```
点击安装，安装数据库，提示成功后继续执行下面操作


五、项目测试
1. 构建编译项目
```shell
go build -o go-fly.exe
```
2. 启动项目
```shell
.\go-fly.exe server
```
3. 检查项目是否启动成功，访问http://localhost:8081/login ，如果能正常访问，说明项目启动成功。

4. 输入默认的管理员账号和密码，例如：
```
用户名：kefu2
密码：123
```
5. 登录成功后，即可进入到客服端管理界面。


Ubuntu系统安装依赖构建项目并启动：

1. 下载发行版本，和windows的操作一样

2. 设置go代理：
```shell
go env -w GO111MODULE=on
   
go env -w GOPROXY=https://goproxy.cn,direct
```

3. 安装依赖：go mod tidy

4. 构建二进制文件运行：go build go-fly.go

5. 调试启动：go run go-fly.go server

6. 二进制文件运行
```shell
./go-fly server [可选 -p 8082 -d]
```
7. 关闭程序
```shell
./go-fly stop  
```
   linux下使用ps命令结合kill命令杀掉进程
   
   ps -ef|grep go-fly 看到父子进程id
   
   kill 进程父进程id ； kill 进程子进程id