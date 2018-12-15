const _ = require('lodash');

module.exports = class extends think.Model {
  /**
     * 生成订单的编号order_sn
     * @returns {string}
     */
  generateOrderNumber() {
    const date = new Date();
    return date.getFullYear() + _.padStart(date.getMonth(), 2, '0') + _.padStart(date.getDay(), 2, '0') + _.padStart(date.getHours(), 2, '0') + _.padStart(date.getMinutes(), 2, '0') + _.padStart(date.getSeconds(), 2, '0') + _.random(100000, 999999);
  }

  /**
     * 获取订单可操作的选项
     * @param orderId
     * @returns {Promise.<{cancel: boolean, delete: boolean, pay: boolean, comment: boolean, delivery: boolean, confirm: boolean, return: boolean}>}
     */
  async getOrderHandleOption(orderId) {
    const handleOption = {
      cancel: false, // 取消操作
      delete: false, // 删除操作
      pay: false, // 支付操作
      comment: false, // 评论操作
      delivery: false, // 确认收货操作
      confirm: false, // 完成订单操作
      return: false, // 退换货操作
      buy: false // 再次购买
    };

    const orderInfo = await this.where({id: orderId}).find();

    // 订单流程：下单成功－》支付订单－》发货－》收货－》评论
    // 订单相关状态字段设计，采用单个字段表示全部的订单状态
    // 1xx表示订单取消和删除等状态 0订单创建成功等待付款，101订单已取消，102订单已删除
    // 2xx表示订单支付状态,201订单已付款，等待发货
    // 3xx表示订单物流相关状态,300订单已发货，301用户确认收货
    // 4xx表示订单退换货相关的状态,401没有发货，退款402,已收货，退款退货
    // 如果订单已经取消或是已完成，则可删除和再次购买
    if (orderInfo.status === 6) {
      handleOption.delete = true;
      handleOption.buy = true;
    }

    // 如果订单没有被取消，且没有支付，则可支付，可取消
    if (orderInfo.status === 0) {
      handleOption.cancel = true;
      handleOption.pay = true;
    }

    // 如果订单已付款，没有发货，则可退款操作
    if (orderInfo.status === 2) {
      // handleOption.return = true;
      handleOption.buy = true;
    }

    // 如果订单已经发货，没有收货，则可收货操作和退款、退货操作
    if (orderInfo.status === 3) {
      // handleOption.cancel = true;
      // handleOption.pay = true;
      // handleOption.return = true;
      handleOption.buy = true;
      handleOption.delivery = true;
    }

    // 如果订单已经支付，且已经收货，则可完成交易、评论和再次购买
    if (orderInfo.status === 4) {
      handleOption.delete = true;
      handleOption.comment = true;
      handleOption.buy = true;
    }

    // 如果订单已经评论，且已经收货，则可完成交易和再次购买
    if (orderInfo.status === 5) {
      handleOption.delete = true;
      handleOption.buy = true;
    }

    return handleOption;
  }

  async getOrderStatusText(orderId) {
    const orderInfo = await this.where({id: orderId}).find();
    let statusText = '未付款';
    switch (orderInfo.status) {
      case 0:
        statusText = '未付款';
        break;
      case 2:
        statusText = '待发货';
        break;
      case 3:
        statusText = '待收货';
        break;
      case 4 :
        statusText = '已完成';
        break;
      case 5:
        statusText = '待收货';
        break;
      case 6:
        statusText = '已取消';
        break;
    }

    return statusText;
  }

  /**
     * 更改订单支付状态
     * @param orderId
     * @param payStatus
     * @returns {Promise.<boolean>}
     */
  async updatePayStatus(orderId, payStatus = 0) {
    return this.where({id: orderId}).limit(1).update({pay_status: parseInt(payStatus)});
  }

  /**
     * 根据订单编号查找订单信息
     * @param orderSn
     * @returns {Promise.<Promise|Promise<any>|T|*>}
     */
  async getOrderByOrderSn(orderSn) {
    if (think.isEmpty(orderSn)) {
      return {};
    }
    return this.where({order_sn: orderSn}).find();
  }

  /**
     * 获取订单List
     * @returns {Promise<Object>}
     */
  async getOrderList(userId, currentPage) {
    if (!currentPage) {
      currentPage = 1;
    }
    const orderList = await this.where({ user_id: userId }).page(currentPage, 5).order('create_time DESC').countSelect();
    const newOrderList = [];
    const t = new Date(new Date(new Date().toLocaleDateString()).getTime()).getTime();
    for (const item of orderList.data) {
      // 订单的商品
      item.goodsList = await this.model('order_goods').where({ order_id: item.id }).select();
      item.goodsCount = 0;
      item.goodsList.forEach(v => {
        item.goodsCount += v.goods_nums;
        const a = JSON.parse(v.prom_goods);
        v.id = a.id;
        v.list_pic_url = a.pic;
        v.goods_name = a.title;
        v.number = a.qty;
      });
      item.order_sn = item.order_no;
      if (item.payment == '1') {
        item.actual_price = item.order_amount + '积分';
      } else {
        item.actual_price = '￥' + item.order_amount;
      }
      const time = item.create_time;
      if (time > t) {
        item.create_time = '今天';
      } else {
        item.create_time = global.dateformat('Y-m-d', item.create_time);
      }
      // 订单状态的处理
      item.order_status_text = await this.getOrderStatusText(item.id);
      // 可操作的选项
      item.handleOption = await this.getOrderHandleOption(item.id);
      const restaurant = await this.model('restaurant').find(item.restaurant_id);
      item.restaurantName = restaurant.name;
      if (restaurant.image) {
        const c = await this.model('ext_attachment_pic').field(['path']).find(restaurant.image);
        item.restaurantLogo = c.path;
      }
      newOrderList.push(item);
    }
    orderList.data = newOrderList;
    return orderList;
  }
  async updataStatus(orderId) {
    const order = {
      id: orderId,
      pay_status: 1,
      status: 2,
      pay_time: new Date().getTime()
    };
    const orderInfo = await this.find(orderId);
    const foodList = await this.model('order_goods').where({order_id: orderId}).select();
    // 计算总销量
    let count = 0;
    const foodArr = [];
    for (const item in foodList) {
      const food = foodList[item];
      const a = JSON.parse(food.prom_goods);
      count += a.qty;
      await this.model('medu').where({id: food.goods_id}).increment({sell_count: a.qty});
      foodArr.push(a);
    }
    await this.model('restaurant').where({id: orderInfo.restaurant_id}).increment({sales: count});
    const node = {
      orderId: orderId,
      foodList: foodArr
    };
      // 生成财务日志
    const balance = {
      restaurant_id: orderInfo.restaurant_id,
      user_id: orderInfo.user_id,
      time: new Date().getTime(),
      amount: orderInfo.order_amount,
      amount_log: '',
      note: JSON.stringify(node)
    };
    await this.model('balance_log').add(balance);
    // 获取用户的积分
    const record = await this.model('order').find(orderId);
    const user_id = record.user_id;
    const amount = orderInfo.order_amount;
    const integral = Math.round(amount * 100) / 100;
    await this.model('wx_user').where({id: user_id}).increment('integral', integral);
    if (amount != 0) {
      await this.model('record').add({
        order_id: orderId,
        is_integral: 0,
        num: amount,
        is_add: 0,
        remark: '交易折合',
        create_time: new Date().getTime(),
        user_id: user_id,
        status: 0
      });
    }
    // 获取当日print_no最大值
    const start = new Date();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const todayStartTime = Date.parse(start) / 1;
    const max_no = await this.where({
      restaurant_id: orderInfo.restaurant_id,
      create_time: ['>', todayStartTime]
    }).max('print_no');
    order.print_no = max_no + 1;
    const res = await this.update(order);
    return res;
  }

  async updataStatu(orderId) {
    const order = {
      id: orderId,
      pay_status: 1,
      status: 4,
      pay_time: new Date().getTime()
    };
    const orderInfo = await this.find(orderId);
    const foodList = await this.model('order_goods').where({order_id: orderId}).select();
    // 计算总销量
    let count = 0;
    const foodArr = [];
    for (const item in foodList) {
      const food = foodList[item];
      const a = JSON.parse(food.prom_goods);
      count += a.qty;
      await this.model('medu').where({id: food.goods_id}).increment({sell_count: a.qty});
      foodArr.push(a);
    }
    await this.model('restaurant').where({id: orderInfo.restaurant_id}).increment({sales: count});
    const node = {
      orderId: orderId,
      foodList: foodArr
    };
    // 生成财务日志
    const balance = {
      restaurant_id: orderInfo.restaurant_id,
      user_id: orderInfo.user_id,
      time: new Date().getTime(),
      amount: orderInfo.order_amount,
      amount_log: '',
      note: JSON.stringify(node)
    };
    await this.model('balance_log').add(balance);
    // 获取用户的积分
    const record = await this.model('order').find(orderId);
    const user_id = record.user_id;
    const amount = orderInfo.order_amount;
    const integral = Math.round(amount * 100) / 100;
    await this.model('wx_user').where({id: user_id}).increment('integral', integral);
    if (amount != 0) {
      await this.model('record').add({
        order_id: orderId,
        is_integral: 0,
        num: amount,
        is_add: 0,
        remark: '交易折合',
        create_time: new Date().getTime(),
        user_id: user_id,
        status: 0
      });
    }
    // 获取当日print_no最大值
    const start = new Date();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const todayStartTime = Date.parse(start) / 1;
    const max_no = await this.where({
      restaurant_id: orderInfo.restaurant_id,
      create_time: ['>', todayStartTime]
    }).max('print_no');
    order.print_no = max_no + 1;
    const res = await this.update(order);
    return res;
  }

  /**
     * 小程序待使用的订单
     * status: 订单的状态 0：未使用（2：待审核，3：已审核） 1：使用（4：已完成）
     * currentPage: 当前页数
     * @returns {Promise<*>}
     */
  async getuselist(status, currentPage) {
    const restaurantArr = await this.model('restaurant').where({is_send: 1}).getField('id');
    const map = {};
    if (status == 0) {
      map.pay_status = 1;
      map.status = ['in', [2, 3]];
    } else {
      map.pay_status = 1;
      map.status = 4;
    }
    map.restaurant_id = ['in', restaurantArr];
    const list = await this.where(map).page(currentPage, 5).order('create_time DESC').countSelect();
    for (const item in list.data) {
      const i = list.data[item];
      var num = 0;
      let price = '';
      let str = '';
      let imgurl = '';
      const id = i.id;
      const order_no = i.order_no;
      const b = await this.model('order_goods').where({order_id: id}).select();
      for (const a of b) {
        const prom = JSON.parse(a.prom_goods);
        str += prom.title + '*' + prom.qty + '份 ,';
        num = num + prom.qty;
        imgurl = prom.pic;
        price += prom.price;
      }
      const d = {
        id: id,
        num: num,
        price: price,
        desc: str,
        order_no: order_no,
        imgurl: imgurl
      };
      list.data[item] = d;
    }
    return list;
  }
};
