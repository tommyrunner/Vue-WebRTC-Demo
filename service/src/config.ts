import { Express } from "express";
import http from "http";
import { Server as IO } from "socket.io";
export default function initApp(app: Express) {
  let http_server = http.createServer(app);
//   http_server.on("request", (req, res) => {
//     console.log(req.headers);
//     res.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" });
//     res.write("Hello World");
//     res.end();
//   });
  http_server.listen(3003);
  let io = new IO(http_server, {
    path: "/rtc",
    // 允许跨域访问
    cors: {
      origin: "*",
    },
  });
  http_server.on("listening", () => {
    let addr = http_server.address();
    if (addr) {
      let port = typeof addr === "string" ? addr : addr.port;
      console.log(`Listening on ${port}`);
    }
  });
  return io;
}
