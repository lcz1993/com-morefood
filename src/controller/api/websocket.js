module.exports = class extends think.Controller {
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

  async sendMsgAction() {
    const orderId = this.wsData.orderId;
    const order = await this.model('order').find(orderId);
    // 审核提示
    const notifications = {};
    notifications.count = 0;
    notifications.data = [];
    const a = await this.model('order').where({status: 2, restaurant_id: order.restaurant_id}).countSelect();
    const approval = a.count + 1;
    if (approval > 0) {
      notifications.count = notifications.count + Number(approval);
      notifications.data = {type: 'approval', info: `有 ${approval} 条订单待审核`, url: '/admin/order/list/?status=2', ico: 'fa-umbrella'};
    }

    const goodsList = await this.model('order_goods').where({order_id: orderId}).select();
    const foodList = [];
    let amount = 0;
    for (const goods of goodsList) {
      const prom_goods = JSON.parse(goods.prom_goods);
      const b = {
        title: prom_goods.title,
        num: prom_goods.qty,
        unit_price: prom_goods.unit_price,
        total_price: prom_goods.price
      };
      amount += prom_goods.price;
      foodList.push(b);
    }
    const restaurant = await this.model('restaurant').find(order.restaurant_id);
    let location = '';
    const area = await this.model('area').find(order.county);
    location += area.name;
    location += order.addr;
    // 获取当日print_no最大值
    const start = new Date();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const todayStartTime = Date.parse(start) / 1;
    const max_no = await this.model('order').where({
      restaurant_id: order.restaurant_id,
      create_time: ['>', todayStartTime]
    }).max('print_no');
    order.print_no = max_no ? parseInt(max_no) + 1 : 0;
    console.log(order);
    const d = {
      id: order.id,
      title: '及时雨校园餐饮',
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      order_time: global.dateformat('Y-m-d H:i:s', order.create_time),
      send_time: global.dateformat('Y-m-d H:i:s', order.send_time),
      goodsList: foodList,
      sendPrice: global.formatCurrency(restaurant.send_money),
      amount_price: global.formatCurrency(order.order_amount),
      address: location,
      user_name: order.accept_name,
      user_tel: order.mobile,
      original_amount: global.formatCurrency(parseFloat(amount) + parseFloat(restaurant.send_money)),
      restaurant_tel: restaurant.contect_tel,
      is_print: order.is_print,
      print_no: order.print_no
    };
    const data = {
      notifications: notifications,
      order: d
    };
    await this.model('order').where({id: orderId}).update({
      is_print: 1
    });
    this.broadcast('print', data);
  }

  closeAction() {
    console.log('关闭连接');
  }
};
