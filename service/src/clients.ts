import { UserType } from "./main.d";
import { $log } from "./utils";

// 客户端管理类
export default class Clients {
  data: UserType[];
  constructor(initArray?: UserType[]) {
    this.data = initArray || [];
  }
  add(user: UserType) {
    if (!user || !user.username) return;
    if (this.data.some(v => v.username === user.username)) {
      this.remove(user.username);
    }
    this.data.push(user);
    $log(`---${user.username}---(连接)`);
  }
  remove(username: string) {
    this.data = this.data.filter(c => username !== c.username);
  }
  get(username: string) {
    return this.data.find(c => c.username === username);
  }
}
