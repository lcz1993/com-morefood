module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 存储用户选择，购物车
     * @returns {Promise<*>}
     */
  async cartAction() {
    const cartArr = this.post('carArray');
    const userId = this.post('userId');
    await this.model('selection').where({user_id: userId}).delete();
    for (const cart of cartArr) {
      const res = await this.model('selection').add({
        user_id: userId,
        dish_id: cart.id,
        cnt_dish: cart.num,
        add_time: new Date().getTime()
      });
    }
    return this.success();
  }

  /**
     * 支付页面初始化
     * @returns {Promise<*>}
     */
  async indexAction() {
    const userId = this.get('userId');
    const restaurantId = this.get('restaurantId');
    const addressId = this.get('addressId');
    const cartArr = await this.model('selection').where({user_id: userId}).select();
    const orderList = [];
    for (const food of cartArr) {
      const num = food.cnt_dish;
      let f = await this.model('medu').find(food.dish_id);
      if (f.restaurant_id != restaurantId) {
        global.removeByValue(cartArr, food);
        break;
      }
      if (f.dish_picture) {
        const b = await this.model('ext_attachment_pic').find(f.dish_picture);
        f.dish_picture = b.path;
      }
      if (f.image) {
        const b = await this.model('ext_attachment_pic').find(f.image);
        f.image = b.path;
      }
      f = {
        id: f.id,
        name: f.dish_name,
        num: num,
        image: f.dish_picture,
        unit_price: f.original_price,
        total_price: f.original_price * num
      };
      orderList.push(f);
    }
    const restaurant = await this.model('restaurant').find(restaurantId);
    let address = {};
    if (addressId) {
      address = await this.model('address').find(addressId);
    } else {
      const addressArr = await this.model('address').where({user_id: userId, is_default: '1'}).select();
      if (addressArr.length != 0) {
        address = addressArr[0];
      }
    }

    if (JSON.stringify(address) != '{}') {
      let location = '';
      let a = await this.model('area').find(address.province);
      location += a.name;
      a = await this.model('area').find(address.city);
      location += a.name;
      a = await this.model('area').find(address.county);
      location += a.name;
      location += address.addr;
      address = {
        id: address.id,
        name: address.accept_name,
        gender: address.gender,
        tel: address.mobile,
        sign: address.sign,
        province: address.province,
        city: address.city,
        county: address.county,
        addr: address.addr,
        msg: location,
        is_default: address.is_default
      };
    }
    return this.success({
      cartArr: orderList,
      address: address,
      restaurant: restaurant
    });
  }
  /**
     * 再次购买
     * @returns {Promise<*>}
     */
  async buyAction() {
    const orderId = this.get('orderId');
    const userId = this.getLoginUserId();
    const order = await this.model('order').find(orderId);
    const restaurantId = order.restaurant_id;
    const cartArr = await this.model('order_goods').where({order_id: orderId}).select();
    const orderList = [];
    for (const food of cartArr) {
      const num = food.goods_nums;
      let f = await this.model('medu').find(food.goods_id);
      if (!f) {
        return this.fail('商品已下架！');
      }
      if (f.restaurant_id != restaurantId) {
        global.removeByValue(cartArr, food);
        break;
      }
      if (f.dish_picture) {
        const b = await this.model('ext_attachment_pic').find(f.dish_picture);
        f.dish_picture = b.path;
      }
      if (f.image) {
        const b = await this.model('ext_attachment_pic').find(f.image);
        f.image = b.path;
      }
      f = {
        id: f.id,
        name: f.dish_name,
        num: num,
        image: f.dish_picture,
        unit_price: f.original_price,
        total_price: f.original_price * num
      };
      orderList.push(f);
    }
    const restaurant = await this.model('restaurant').find(restaurantId);
    const addressArr = await this.model('address').where({user_id: userId, is_default: '1'}).select();
    let address = {};
    if (addressArr.length != 0) {
      address = addressArr[0];
    }
    if (JSON.stringify(address) != '{}') {
      let location = '';
      let a = await this.model('area').find(address.province);
      location += a.name;
      a = await this.model('area').find(address.city);
      location += a.name;
      a = await this.model('area').find(address.county);
      location += a.name;
      location += address.addr;
      address = {
        id: address.id,
        name: address.accept_name,
        gender: address.gender,
        tel: address.mobile,
        sign: address.sign,
        province: address.province,
        city: address.city,
        county: address.county,
        addr: address.addr,
        msg: location,
        is_default: address.is_default
      };
    }
    if (order.pay_status != 0) {
      order.id = '';
    }
    return this.success({
      order: order,
      cartArr: orderList,
      address: address,
      restaurant: restaurant
    });
  }

  /**
     * 保存订单
     * @returns {Promise<*>}
     */
  async saveAction() {
    const order = this.post('order');
    const sendTime = order.send_time;
    const date = new Date();
    const time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + sendTime + ':00';
    const t = new Date(time);
    order.send_time = t.getTime();
    const orderList = this.post('orderList');
    const userId = order.user_id;
    const m = new Date().getTime().toString();
    order.order_no = think._.padEnd(userId, 10, '0') + m.substr(8);
    order.create_time = new Date().getTime();
    const restaurant = await this.model('restaurant').find(order.restaurant_id);
    order.patable_freight = restaurant.send_money;
    order.real_freight = order.sendMoney;
    // 此处判断用户第一次下单，第一次下单赠送果盘一份
    const count = await this.model('order').where({user_id: userId, create_time: ['>', 1541433600000]}).count();

    let res = '';
    if (!order.id) {
      order.id = null;
      res = await this.model('order').add(order);
    } else {
      res = await this.model('order').update(order);
    }
    if (res) {
      for (const orderFood of orderList) {
        const f = await this.model('medu').find(orderFood.id);
        let prom_goods = {
          id: orderFood.id,
          uid: userId,
          product_id: '',
          qty: orderFood.num,
          type: '',
          price: orderFood.total_price,
          title: f.dish_name,
          unit_price: f.original_price,
          pic: orderFood.image
        };
        prom_goods = JSON.stringify(prom_goods);
        const food = {
          order_id: res,
          goods_id: orderFood.id,
          goods_price: orderFood.unit_price,
          goods_nums: orderFood.num,
          prom_goods: prom_goods
        };
        await this.model('order_goods').add(food);
      }
      if (count == 0) {
        let send_prom_goods = {
          id: 0,
          uid: userId,
          product_id: '',
          qty: 1,
          type: '',
          price: 0,
          title: '水果拼盘(首单)',
          unit_price: 0,
          pic: 'http://jishiyu.sxtssc.com.cn/upload/picture/2018-10-20/upload_22e62fb4fc0e1ac470f85df4f5833276.png'
        };
        send_prom_goods = JSON.stringify(send_prom_goods);
        const send_food = {
          order_id: res,
          goods_id: 0,
          goods_price: 0,
          goods_nums: 1,
          prom_goods: send_prom_goods
        };
        await this.model('order_goods').add(send_food);
      }
      return this.success(res);
    } else {
      return this.fail();
    }
  }
  async getAction() {
    const id = this.get('id');
    const order = await this.model('order').field(['id', 'restaurant_id', 'accept_name', 'mobile', 'province', 'city', 'county', 'addr', 'order_amount']).find(id);
    const restaurant = await this.model('restaurant').field(['name']).find(order.restaurant_id);
    const orderArr = await this.model('order_goods').where({order_id: id}).select();
    const orderList = [];
    for (const food of orderArr) {
      let a = food.prom_goods;
      a = JSON.parse(a);
      orderList.push({
        name: a.title,
        num: a.qty
      });
    }
    let addressMsg = '';
    let a = await this.model('area').field(['name']).find(order.province);
    addressMsg += a.name;
    a = await this.model('area').field(['name']).find(order.city);
    addressMsg += a.name;
    a = await this.model('area').field(['name']).find(order.county);
    addressMsg += a.name;
    addressMsg += order.addr;
    order.addressMsg = addressMsg;
    order.orderList = orderList;
    order.restaurantName = restaurant.name;
    order.restaurantId = restaurant.id;
    return this.success(order);
  }
  async submitAction() {
    const orderId = this.get('orderId');
    const orderInfo = await this.model('order').where({ id: orderId }).find();
    const restaurant = await this.model('restaurant').field('is_close').find(orderInfo.restaurant_id);
    const is_close = restaurant.is_close;
    if (is_close == 1) {
      return this.fail(1, '商家已打烊，逛逛其他店吧~');
    }
    const orderGoodsList = await this.model('order_goods').where({order_id: orderId}).field('goods_id').select();
    for (const i in orderGoodsList) {
      const meduId = orderGoodsList[i].goods_id;
      const medu = await this.model('medu').field('is_stop,dish_name').find(meduId);
      if (medu.is_stop == 1) {
        return this.fail(1, medu.dish_name + '商品已售罄,请重新选择！');
      }
    }
    if (think.isEmpty(orderInfo)) {
      return this.fail(400, '订单已取消');
    }
    if (parseInt(orderInfo.pay_status) !== 0) {
      return this.fail(400, '订单已支付，请不要重复操作');
    }
    const openid = await this.model('wx_user').where({ id: orderInfo.user_id }).getField('openid', true);
    if (think.isEmpty(openid)) {
      return this.fail('微信支付失败');
    }
    let clientIp = this.service('express', 'api').check_document_position(this.ctx.req); // 暂时不记录 ip
    const arr = clientIp.split(':');
    clientIp = arr[arr.length - 1];
    const WeixinSerivce = this.service('weixin', 'api');
    const amount = parseInt(orderInfo.order_amount * 100);
    try {
      const returnParams = await WeixinSerivce.createUnifiedOrder({
        openid: openid,
        body: '订单编号：' + orderInfo.order_no,
        out_trade_no: orderInfo.order_no,
        total_fee: amount,
        restaurant_id: orderInfo.restaurant_id,
        spbill_create_ip: clientIp
      });
      // console.log(returnParams);
      // const res = await this.model('order').updataStatus(orderId);
      // if (res) {
      //   return this.success(returnParams);
      // } else {
      //   return this.fail();
      // }
      return this.success(returnParams);
    } catch (err) {
      return this.fail('微信支付失败');
    }
  }
  async notifyAction() {
    const WeixinSerivce = this.service('weixin', 'api');
    const result = WeixinSerivce.payNotify(this.post('xml'));
    if (!result) {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付失败]]></return_msg></xml>`;
    }

    const orderModel = this.model('order');
    const orderInfo = await orderModel.getOrderByOrderSn(result.out_trade_no);
    if (think.isEmpty(orderInfo)) {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
    }

    if (orderModel.updatePayStatus(orderInfo.id, 2)) {
    } else {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
    }

    return `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
  }
  async statusAction() {
    const orderId = this.post('orderId');
    const WeixinSerivce = this.service('weixin', 'api');
    const orderInfo = await this.model('order').find(orderId);
    const openid = await this.model('wx_user').where({ id: orderInfo.user_id }).getField('openid', true);

    const payInfo = {
      openid: openid,
      out_trade_no: orderInfo.order_no
    };

    const result = await WeixinSerivce.queryOrder(payInfo);
    if (result.trade_state == 'SUCCESS') {
      await await this.model('order').updataStatus(orderId);
      return this.success();
    } else {
      return this.fail();
    }

    // const order = {
    //   id: orderId,
    //   pay_status: 1,
    //   status: 2,
    //   pay_time: new Date().getTime()
    // };
    // const orderInfo = await this.model('order').find(orderId);
    // const foodList = await this.model('order_goods').where({order_id: orderId}).field('prom_goods').select();
    // const foodArr = [];
    // for (const item in foodList) {
    //   const a = JSON.parse(foodList[item].prom_goods);
    //   foodArr.push(a);
    // }
    // const node = {
    //   orderId: orderId,
    //   foodList: foodArr
    // };
    // // 生成财务日志
    // const balance = {
    //   restaurant_id: orderInfo.restaurant_id,
    //   user_id: orderInfo.user_id,
    //   time: new Date().getTime(),
    //   amount: orderInfo.order_amount,
    //   amount_log: '',
    //   note: JSON.stringify(node)
    // };
    // await this.model('balance_log').add(balance);
    // const res = await this.model('order').update(order);
  }
};
