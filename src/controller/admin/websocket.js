module.exports = class extends think.cmswing.admin {
  constructor(...arg) {
    console.log('constructor');
    super(...arg);
  }

  openAction() {
    console.log('this.user=' + JSON.stringify(this.user));
    console.log('openAction');
    this.emit('opend', 'This client opened successfully!');
    this.broadcast('joined', 'There is a new client joined successfully!');
  }

  addUserAction() {
    console.log('获取客户端 addUser 事件发送的数据', this.wsData);
    console.log('获取当前 WebSocket 对象', this.websocket);
    console.log('判断当前请求是否是 WebSocket 请求', this.isWebsocket);
  }

  sendMsgAction() {
    console.log('获取客户端 addUser 事件发送的数据', this.wsData);
    // console.log('获取当前 WebSocket 对象', this.websocket);
    console.log('判断当前请求是否是 WebSocket 请求', this.isWebsocket);
    this.broadcast('add', this.wsData);
  }

  closeAction() {
    console.log('关闭连接');
  }
};
