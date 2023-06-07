"use strict";
import http from "http";
import express from "express";
import serveIndex from "serve-index";
import { Server as IO } from "socket.io";
let app = express();
// 解决跨域
app.use(serveIndex("./dist"));
app.use(express.static("./dist"));
let http_server = http.createServer(app);
http_server.on("request", (req, res) => {
    console.log(req.headers);
    res.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" });
    res.write("Hello World");
    res.end();
});
http_server.listen(3003);
let io = new IO(http_server, {
    path: "/rtc",
    // 允许跨域访问
    cors: {
        origin: "*",
    },
});
http_server.on("listening", onListening);
function onListening() {
    let addr = http_server.address();
    if (addr) {
        let port = typeof addr === "string" ? addr : addr.port;
        console.log(`Listening on ${port}`);
    }
}
// 存储连接用户
let clients = [];
io.on("connection", function (socket) {
    let query = socket.handshake.query;
    // 用户名
    let username = query.username;
    // 房间
    let room = query.room;
    if (!room || !username) {
        console.log("未找到用户或房间");
        return;
    }
    // 重新连接
    if (clients.some((v) => v.username === username)) {
        console.log(`${username} 重新连接`);
        clients = clients.filter((c) => username !== username);
    }
    clients.push({ userId: socket.id, username });
    console.log(username + "连接了", clients);
    // 房间管理
    socket.join(room);
    if (clients.length >= 2) {
        io.sockets.in(room).emit("ready");
    }
    socket.emit("joined");
    socket.broadcast.to(room).emit("join", { username });
    io.sockets.in(room).emit("clients", clients);
    // 收到对等连接创建的消息
    socket.on("pc candidate", function (data) {
        let user = clients.find((c) => c.username === data.username);
        if (!user) {
            console.log("用户已经失联");
            return;
        }
        console.log(data.username, "--测试candidate", user);
        socket.to(user.userId).emit("pc candidate", { user: user.username, data: data.data });
    });
    socket.on("pc offer", function (data) {
        let user = clients.find((c) => c.username === data.username);
        console.log(data.username, "--测试offer", user);
        if (!user) {
            console.log("用户已经失联");
            return;
        }
        socket.to(user.userId).emit("pc offer", { user: username, data: data.data });
    });
    socket.on("pc answer", function (data) {
        let user = clients.find((c) => c.username === data.username);
        console.log(data.username, "--测试answer", user);
        if (!user) {
            console.log("用户已经失联");
            return;
        }
        socket.to(user.userId).emit("pc answer", { user: user.username, data: data.data });
    });
    // 断开连接了
    socket.on("disconnect", function () {
        console.log(username + "断开连接了");
        // clients = clients.filter((c) => username !== username);
    });
});
