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
    const userId = this.getLoginUserId();
    await this.model('selection').where({user_id: userId}).update({status: 1});
    for (const cart of cartArr) {
      if (think.isEmpty(cart.id)) {
        return this.fail('选择商品不能为空！');
      }
      const res = await this.model('selection').add({
        user_id: userId,
        dish_id: cart.id,
        cnt_dish: cart.num,
        add_time: new Date().getTime(),
        status: 0
      });
    }
    return this.success();
  }

  /**
     * 支付页面初始化
     * @returns {Promise<*>}
     */
  async indexAction() {
    const userId = this.getLoginUserId();
    const restaurantId = this.get('restaurantId');
    const addressId = this.get('addressId');
    const cartArr = await this.model('selection').where({user_id: userId, status: 0}).select();
    if (cartArr.length == 0) {
      return this.fail();
    }
    // 获取每日特价信息
    const meduIds = await this.model('discount').where({
      restaurant_id: restaurantId,
      is_show: 0,
      status: 0,
      type_id: 2,
      start_time: ['<', new Date().getTime()],
      end_time: ['>', new Date().getTime()]
    }).select();
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
      const original_price = f.original_price;
      const old_price = f.old_price;
      let totalPrice = 0;
      if (meduIds.length > 0) {
        for (const discountId of meduIds) {
          const status = await think.cache(`wx-u${userId}r${restaurantId}m${discountId.medu_id}`);
          if (discountId.medu_id == food.dish_id && status != 1) {
            totalPrice = original_price + old_price * (num - 1);
          // 将用户消费购买特价商品信息保存
          // await think.cache(`wx-u${userId}r${restaurantId}m${food.dish_id}`, 1);
          } else {
            totalPrice = old_price * num;
          }
        }
      } else {
        totalPrice = old_price * num;
      }
      totalPrice = Math.round(totalPrice * 100) / 100;
      f = {
        id: f.id,
        name: f.dish_name,
        num: num,
        image: f.dish_picture,
        unit_price: old_price,
        total_price: totalPrice
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
      if (address.school_id) {
        let sc = {pid: address.school_id};
        let b = '';
        do {
          sc.id = sc.pid;
          sc = await this.model('school').find(sc.id);
          b = sc.name + b;
        } while (sc.pid != 0);
        address.addr = b + address.addr;
      }
      console.log(address.addr);
      console.log(location);
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
        if (f.num != null) {
          await this.model('medu').where({id: f.id}).update({
            num: f.num - orderFood.num
          });
        }
        // 获取每日特价信息
        const meduIds = await this.model('discount').where({
          restaurant_id: order.restaurant_id,
          is_show: 0,
          status: 0,
          type_id: 2,
          start_time: ['<', new Date().getTime()],
          end_time: ['>', new Date().getTime()]
        }).select();
        for (const discountId of meduIds) {
          const status = await think.cache(`wx-u${userId}r${order.restaurant_id}m${discountId.medu_id}`);
          if (discountId.medu_id == f.id && status != 1) {
            // 将用户消费购买特价商品信息保存
            await think.cache(`wx-u${userId}r${order.restaurant_id}m${discountId.medu_id}`, 1);
          }
        }

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
        this.model('discount').useCount(orderFood.id, order.restaurant_id, orderFood.num);
      }
      return this.success(res);
    } else {
      return this.fail();
    }
  }

  /**
     * 获取订单
     * @returns {Promise<*>}
     */
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
    let a = '';
    if (order.province) {
      a = await this.model('area').field(['name']).find(order.province);
      addressMsg += a.name;
    }
    if (order.city) {
      a = await this.model('area').field(['name']).find(order.city);
      addressMsg += a.name;
    }
    if (order.county) {
      a = await this.model('area').field(['name']).find(order.county);
      addressMsg += a.name;
    }
    if (order.addr) {
      addressMsg += order.addr;
    }
    order.addressMsg = addressMsg;
    order.orderList = orderList;
    order.restaurantName = restaurant.name;
    order.restaurantId = restaurant.id;
    return this.success(order);
  }

  /**
     * 提交订单
     * @returns {Promise<*>}
     */
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

  /**
     * 支付异步回调接口
     * @returns {Promise<string>}
     */
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

  /**
     * 支付完成后进行回调函数
     * @returns {Promise<*>}
     */
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
      await this.model('order').del({id: orderId});
      return this.fail();
    }
  }

  async statuAction() {
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
      await await this.model('order').updataStatu(orderId);
      return this.success();
    } else {
      await await this.model('order').where({id: ['IN', orderId]}).delete();
      return this.fail();
    }
  }

  /**
     * 不需要配送的页面初始化
     * @returns {*}
     */
  async nosendAction() {
    const userId = this.getLoginUserId();
    const restaurantId = this.get('restaurantId');
    const cartArr = await this.model('selection').where({user_id: userId}).select();
    if (cartArr.length == 0) {
      return this.fail();
    }
    // 获取每日特价信息
    const meduIds = await this.model('discount').where({
      restaurant_id: restaurantId,
      is_show: 0,
      status: 0,
      type_id: 2,
      start_time: ['<', new Date().getTime()],
      end_time: ['>', new Date().getTime()]
    }).select();
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
      const original_price = f.original_price;
      const old_price = f.old_price;
      let totalPrice = 0;
      if (meduIds.length > 0) {
        for (const discountId of meduIds) {
          const status = await think.cache(`wx-u${userId}r${restaurantId}m${discountId.medu_id}`);
          if (discountId.medu_id == food.dish_id && status != 1) {
            totalPrice = original_price + old_price * (num - 1);
            // 将用户消费购买特价商品信息保存
            // await think.cache(`wx-u${userId}r${restaurantId}m${food.dish_id}`, 1);
          } else {
            totalPrice = old_price * num;
          }
        }
      } else {
        totalPrice = old_price * num;
      }
      totalPrice = Math.round(totalPrice * 100) / 100;
      f = {
        id: f.id,
        name: f.dish_name,
        num: num,
        image: f.dish_picture,
        unit_price: old_price,
        total_price: totalPrice
      };
      orderList.push(f);
    }
    const restaurant = await this.model('restaurant').find(restaurantId);

    return this.success({
      cartArr: orderList,
      restaurant: restaurant
    });
  }

  /**
     * 不需要配送保存
     * @returns {Promise<*>}
     */
  async nosendsaveAction() {
    const order = this.post('order');
    const orderList = this.post('orderList');
    const userId = this.getLoginUserId();
    const m = new Date().getTime().toString();
    order.order_no = think._.padEnd(userId, 10, '0') + m.substr(8);
    order.create_time = new Date().getTime();
    const restaurant = await this.model('restaurant').find(order.restaurant_id);
    order.patable_freight = restaurant.send_money;
    order.real_freight = order.sendMoney;
    order.user_id = userId;
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
        if (f.num != null) {
          await this.model('medu').where({id: f.id}).update({
            num: f.num - orderFood.num
          });
        }
        // 获取每日特价信息
        const meduIds = await this.model('discount').where({
          restaurant_id: order.restaurant_id,
          is_show: 0,
          status: 0,
          type_id: 2,
          start_time: ['<', new Date().getTime()],
          end_time: ['>', new Date().getTime()]
        }).select();
        for (const discountId of meduIds) {
          const status = await think.cache(`wx-u${userId}r${order.restaurant_id}m${discountId.medu_id}`);
          if (discountId.medu_id == f.id && status != 1) {
            // 将用户消费购买特价商品信息保存
            await think.cache(`wx-u${userId}r${order.restaurant_id}m${discountId.medu_id}`, 1);
          }
        }

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
        this.model('discount').useCount(orderFood.id, order.restaurant_id, orderFood.num);
      }
      return this.success(res);
    } else {
      return this.fail();
    }
    return this.success();
  }

  async rechargeAction() {
    const contentid = this.get('contentid');
    const map = {};
    let order_id = '';
    const rechargeList = await this.model('recharge_amount').find(contentid);
    const user_id = this.getLoginUserId();
    const m = new Date().getTime().toString();
    const order_no = think._.padEnd(user_id, 10, '0') + m.substr(8);
    const accept_name = await this.model('wx_user').where({id: user_id}).getField('nickname', true);
    const mobile = await this.model('wx_user').where({id: user_id}).getField('tel', true);
    const real_amount = rechargeList.recharge_amount;
    const create_time = Date.parse(new Date());
    const order_amount = rechargeList.recharge_amount;
    map.user_id = user_id;
    map.order_no = order_no;
    map.status = 0;
    map.accept_name = accept_name;
    map.mobile = mobile;
    map.real_amount = real_amount;
    map.create_time = create_time;
    map.user_remark = rechargeList.commodity_details;
    map.order_amount = order_amount;
    map.type = 1;
    const res = await this.model('order').add(map);
    if (res) {
      order_id = await this.model('order').where({order_no: order_no}).getField('id', true);
    }
    const orderInfo = await this.model('order').where({id: order_id}).find();
    if (think.isEmpty(orderInfo)) {
      return this.fail(400, '订单已取消');
    }
    if (parseInt(orderInfo.pay_status) !== 0) {
      return this.fail(400, '订单已支付，请不要重复操作');
    }
    const openid = await this.model('wx_user').where({id: orderInfo.user_id}).getField('openid', true);
    if (think.isEmpty(openid)) {
      return this.fail('微信支付失败');
    }
    let clientIp = this.service('express', 'api').check_document_position(this.ctx.req); // 暂时不记录 ip
    const arr = clientIp.split(':');
    clientIp = arr[arr.length - 1];
    const WeixinSerivce = this.service('weixin', 'api');
    const amount = parseInt(orderInfo.order_amount * 100);
    // try {
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
    const data = {
      returnParams: returnParams,
      orderId: order_id
    };
    return this.success(data);
    // } catch (err) {
    //   return this.fail('微信支付失败');
    // }
  }
};
