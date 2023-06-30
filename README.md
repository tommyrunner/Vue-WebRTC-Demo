# WebRtc

## 简述

> 本项目采用了以下技术栈来实现一个`WebRTC`视频通话的`DEMO`，结构简单，主要是体现`WebRtc`之间的协议传输。
>
> 前端: `typescript`、`Vue3`、`Vite`
>
> 后端: `nodejs`
>
> 信令交互: `socket.io`
>
>  **`WebRTC`**使用的信令服务器主要是用于建立和维护端到端通信的会话控制信息的传输。一旦会话建立成功，信令服务器就**不再需要参与实时通信过程**中的音视频数据传输。因此，在信令服务器关闭后，已经建立的通话仍然可以继续进行，但无法再开始新的通话或重新连接已关闭的通话。
>
>  在建立`WebRTC`连接时，浏览器会自动处理STUN和TURN协议，以确保可靠的通信。因此，即使信令服务器关闭，已经建立的`WebRTC`连接仍然可以继续运行。这种设计使得`WebRTC`成为一种高效可靠的实时通讯技术。

## 启动

### 前端

+ 下载依赖

```shell
npm i
```

+ 启动

```shell
# 启动端口为 3003
npm run dev
```

### 信令服务器

+ 进入服务器目录

```shell
cd .\service\
```

+ 下载依赖

```shell
npm i
```

+ 启动

```shell
npm run serve
```

## 效果

![1](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65aba46c3b0b4574a7c40afb3be8fd63~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

> 因为需要信令服务器支持，这里就不开放线上预览链接了，可以直接 `clone` 下来尝试哦！

## 问题解决

> 看看你有没有出现如下问题:

### 浏览器不支持

+ 报错

> 一般会出现`getDisplayMedia`或`getUserMedia`未找到，具体错误根据浏览器。

+ 暂时支持的浏览器

>  手机浏览器：
>
> Google Chrome for Android：版本号 52 及以上
>
> Firefox for Android：版本号 53 及以上
>
> Opera for Android：版本号 39 及以上
>
> UC Browser for Android：版本号 10.8 及以上
>
> Maxthon for Android：版本号 4.2.8.2000 及以上
>
> Safari：版本11及以上
>
> 电脑浏览器：
>
> Google Chrome：版本号 52 及以上
>
> Firefox：版本号 53 及以上
>
> Opera：版本号 39 及以上
>
> Microsoft Edge：版本号 79 及以上
>
> Safari：版本号 10.1 及以上
>
> Microsoft Edge：从版本12及以上
>
> 经过测试，电脑的`Chrome`与`Microsoft Edge`，手机的`Safari`浏览器支持度高。

### 不同浏览器时不显示视频

+ 报错

```shell
DOMException: Could not start video source
```

+ 这是媒体冲突问题，在同一台电脑，某个浏览器可能**已经占用**了您的摄像头或麦克风设备。

### 使用IP时不显示视频

> `WebR	TC`在大多数现代浏览器中要求使用`HTTPS`连接。这是出于**安全考虑**，确保音视频流和数据传输的隐私和完整性。使用`HTTPS`协议可以加密通信，并防止恶意第三方窃听或篡改数据。因此，在使用`WebRTC`时，需要将网页部署在使用有效的`SSL`证书的`https`服务器上。

报错: `TypeError: Cannot read properties of undefined (reading 'getUserMedia')`

+ 解决方法1:

  + 直接修改浏览器安全策略(只对pc浏览器管用)
  + 浏览器输入 chrome://flags/#unsafely-treat-insecure-origin-as-secure
  + 找到 Insecure origins treated as secure 配置输入对于的地址，例如:http://192.168.0.23:5500 (多个可以以,逗号隔开)
  + 选择Enabled，最后重新进入浏览器。

+ 解决方法2:

  + 在本地使用`nginx`映射`https`路径。

    > 该方式同样是需要`SSL`证书的。

  + 本地nginx配置
  
  ```yml
  # ...
  http {
      include       mime.types;
      default_type  application/octet-stream;
      sendfile        on;
      keepalive_timeout  65;
  
     server {
        listen       443 ssl;
        server_name  localhost;
  	  # 配置自己的SSL证书
        ssl_certificate C://Users//w//Desktop//xxx//xxx.crt;  
        ssl_certificate_key C://Users//w//Desktop//xxxx//xxx.key;  
  	
  
         ssl_session_cache    shared:SSL:1m;
         ssl_session_timeout  5m;
  
         ssl_ciphers  HIGH:!aNULL:!MD5;
         ssl_prefer_server_ciphers  on;
         # 映射前端
         location / {
           proxy_pass http://localhost:5173;
           
          }
          # 映射信令服务器
         location /rtc {
             proxy_pass  http://127.0.0.1:3003;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection "upgrade";
          }
      }
  
  }
  ```
  
  
  
    + 信令服务器链接修改后，我们前端请求头也得修改，路径在`src->config->index.ts`中
  
  ```ts
  - export const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3003/" : "https://xxxx.com/";
  + export const baseUrl = process.env.NODE_ENV === "development" ? "https://ip/" : "https://xxxx.com/";
  ```
  
  > 如果你需要部署在线上服务器，pro环境下的域名需要替换。
  
    + 配置完成后，启动`nginx`，并浏览器访问 https://ip 即可（可能浏览器会警告提示，点击继续访问）
  
    + 此时 `getUserMedia` 就可以正常使用，并且可以见链接发至手机，以及其他同一局域网设备，都是可以访问的。
  
  > 当然这种方式是不合格的，但开发阶段可以暂时这样解决问题，后续可以直接部署到线上服务器然后通过`nginx`映射`https`就可以了。
  >
  > 通过此方案已经可以实现**局域网视频通话**了，同理远程视频通话，可以部署再线上服务器即可。

## 兼容问题

### win10与win11兼容问题

+ `win11`发送的协议给`win10`时能正常接受，但最终回调的`streams`无法播放！

> 这个问题比较神奇，没有任何错误显示，并`win10`发送协议给`win11`是没问题的，测试了很久，最终使用`electron`测试出来，原来`win10`与`win11`也有兼容问题，哪怕使用同一个版本的浏览器同样也会有这个问题。

+ 使用`electron`解决(亲测有效)

> `Electron`是一个用于构建跨平台桌面应用程序的开源框架，它结合了`Chromium`浏览器内核和`Node.js`运行时环境。通过将`Chromium`嵌入到`Electron`中，开发人员可以使用Web`技术`（`HTML`、`CSS`和`JavaScript`）来构建桌面应用程序，并且能够调用底层操作系统的功能。因此，`Electron`可以看作是一个将浏览器内核和`JavaScript`应用程序封装在一起的运行时环境，这样就**不会有兼容问题**。

### 手机浏览器兼容问题

> 这里支持度比较好的浏览器是Safari，其他浏览器基本上都是在权限这一块难通过。

+ 手机浏览器无法显示本地视频，但可以接受以及发送！

+ 这个问题主要是涉及到了浏览器的**自动播放策略**。

> + 在以下情况刚进入界面才允许播放:
>
>   - 静音状态允许播放 `muted`属性。
>
>   - 用户已经对界面进行了交互。
>
>   - 用户主屏幕或桌面上安装了PWA...(不现实)
>
>   - 站点网站的媒体参与度值已经超过了信用度(这个不能通过代码手动更改，需要浏览器算法评估，通过`chrome://media-engagement/` 查看)。
>
>
> - 解决办法:
>   - 先尝试进入界面就**play()自动播放**，如果**抛出异常**，**显示播放按钮**，让用户主动点击播放。(如果站点媒体参与值已经超过，就会主动播放)。
>   - 进入站点静音播放，判断或延迟开启声音。
>
>
> 注意：不同浏览器策略可能不一样。

## 轮子

+ 框架
  + ZEGO
  + ...
+ 插件
  + Adapter.js
  + SimpleWebRTC
  + PeerJS
  + Twilio Vide
  + ...
