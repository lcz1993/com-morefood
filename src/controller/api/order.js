module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
  async listAction() {
    const userId = this.getLoginUserId();
    const currentPage = this.get('currentPage');
    const orderList = await this.model('order').getOrderList(userId, currentPage);
    return this.success(orderList);
  }
  async cancelAction() {
    const userId = this.getLoginUserId();
    const id = this.get('id');
    await this.model('order').update({
      id: id,
      status: 6
    });
    const orderList = await this.model('order').getOrderList(userId);
    return this.success(orderList);
  }
  async deleteAction() {
    const userId = this.getLoginUserId();
    const id = this.get('id');
    await this.model('order').where({id: id}).delete();
    const orderList = await this.model('order').getOrderList(userId);
    return this.success(orderList);
  }
  async deliveryAction() {
    const userId = this.getLoginUserId();
    const id = this.get('id');
    await this.model('order').update({
      id: id,
      status: 4
    });
    const orderList = await this.model('order').getOrderList(userId);
    return this.success(orderList);
  }
  async detailAction() {
    const id = this.get('id');
    const order = await this.model('order').find(id);
    const order_status_text = await this.model('order').getOrderStatusText(id);
    const handleOption = await this.model('order').getOrderHandleOption(id);
    const restaurant = await this.model('restaurant').find(order.restaurant_id);
    let restaurantLogo = '';
    if (restaurant.image) {
      const c = await this.model('ext_attachment_pic').field(['path']).find(restaurant.image);
      restaurantLogo = c.path;
    }
    const sendTime = global.dateformat('Y-m-d H:i:s', order.send_time);
    const payTime = global.dateformat('Y-m-d H:i:s', order.pay_time);
    let addressMsg = '';
    let a = await this.model('area').field(['name']).find(order.province);
    addressMsg += a.name;
    a = await this.model('area').field(['name']).find(order.city);
    addressMsg += a.name;
    a = await this.model('area').field(['name']).find(order.county);
    addressMsg += a.name;
    addressMsg += order.addr;
    let discount = {};
    if (order.discount_id) {
      discount = await this.model('discount').find(order.discount_id);
    }
    const foodList = await this.model('order_goods').where({order_id: id}).select();
    const foodArr = [];
    for (const a of foodList) {
      const prom = JSON.parse(a.prom_goods);
      const d = {
        id: prom.id,
        name: prom.title,
        num: prom.qty,
        price: prom.price
      };
      foodArr.push(d);
    }
    const data = {
      restaurantName: restaurant.name,
      restaurantId: order.restaurant_id,
      restaurantTel: restaurant.contect_tel,
      restaurantLogo: restaurantLogo,
      restaurantSend: restaurant.is_send,
      order_status_text: order_status_text,
      admin_remark: order.admin_remark,
      handleOption: handleOption,
      foodList: foodArr,
      real_freight: order.real_freight,
      discount: {
        id: discount.id,
        name: discount.name,
        cut_price: discount.cut_price,
        percent: discount.percent,
        type: discount.type
      },
      order_amount: order.order_amount,
      sendTime: sendTime,
      accept_name: order.accept_name,
      mobile: order.mobile,
      addr: addressMsg,
      order_no: order.order_no,
      payTime: payTime,
      user_remark: order.user_remark
    };
    return this.success(data);
  }
    /**
     * 小程序待使用的订单
     * status: 订单的状态 0：未使用（2：待审核，3：已审核） 1：使用（4：已完成）
     * currentPage: 当前页数
     * @returns {Promise<*>}
     */
  async uselistAction() {
    const ststus = this.get('status');
    const currentPage = this.get('currentPage');
    const list = await this.model('order').uselistAction(ststus, currentPage);
    return this.success(list);
  }
};
