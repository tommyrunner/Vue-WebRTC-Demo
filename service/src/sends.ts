import { Socket } from "socket.io";
import { DATA_CODE } from "./enum";
import { toData } from "./utils";

// 发送用户列表
export function sendUserList(socket: Socket, data: any) {
  socket.emit("pc user list", toData({ code: DATA_CODE.OK, msg: "获取成功", data }));
}
