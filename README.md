# rcms-pc-web
### 项目简介
- 项目名称：绿森管理平台
- 项目基于jsfw-front v0.9版本构建

### 截图预览
 

### 本地开发构建运行
- 启动后端项目后，在 `vue.config.js` 中修改你的后端接口地址代理配置
- 在项目根文件夹下先后执行命令
 `npm install`   
 `npm run dev`
- 前台端口默认9528 http://localhost:9528

### 部署
- 执行过命令 
`npm install` 后，执行 
`npm run build`
 将打包生成的 `dist` 静态文件放置Nginx服务器中，并配置反向代理。当然还可放置Spring Web等其他项目resources静态资源文件夹下可避免跨域(不推荐)。
- Nginx配置提醒 由于路由默认已使用history模式 需加入以下配置 完整配置参考见下方开发指南
```
location / {
	if (!-e $request_filename) {
        rewrite ^(.*)$ /index.html?s=$1 last;
        break;
    }
    ...
}
```