/* eslint-disable indent,no-unused-vars,camelcase,keyword-spacing,eqeqeq,space-before-blocks,key-spacing,no-undef,standard/object-curly-even-spacing,brace-style,no-eval,no-multi-spaces,quotes,no-trailing-spaces,no-multiple-empty-lines,space-infix-ops,no-irregular-whitespace */
module.exports = class extends think.cmswing.admin {
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    // 其他额外的操作
    this.tactive = 'order';
  }
  /**
     * index action
     * @return {Promise} []
     */
  indexAction() {
    // auto render template file index_index.html
    return this.display();
  }
  // 订单列表
  async listAction() {
      const status = this.get('status');
      const restaurant_id = this.get('restaurant_id');
      const restautantId = this.user.restaurant_id;
      const map = {};
      let restaurantArr = [];
      if (!think.isEmpty(restaurant_id)) {
          map.restaurant_id = restaurant_id;
      }
      if (restautantId != 0) {
          map.restaurant_id = restautantId;
          restaurantArr = await this.model('restaurant').where({id: restautantId}).select();
      } else {
          restaurantArr = await this.model('restaurant').select();
      }
      if (!think.isEmpty(status)) {
          map.status = status;
          this.assign('status', status);
      }
      const q = this.get('q');
      if (!think.isEmpty(q)) {
          map['order_no|user_id|accept_name|mobile'] = ['like', q];
      }
      map.is_del = 0;
      map.type = 0;
      const user = await this.session('userInfo');
      if (parseInt(user.restaurant_id) !== 0) {
          map.restaurant_id = user.restaurant_id;
      }
      // this.config("db.nums_per_page",20)
      const list = await this.model('order').where(map).page(this.get('page') || 1, 20).order('create_time DESC').countSelect();
      for (const item of list.data) {
          const  id = item.id;
          const a = await this.model('order_goods').where({order_id:id}).countSelect();
          let str = '';
          console.log(a.data);
          for (const b of a.data){
              const data = JSON.parse(b.prom_goods);
                  str += data.title + '(' + data.qty + '份￥' + '),';
              item.prom_goods = str;
              console.log(str);
             }
      }
      const html = this.pagination(list);
      this.assign('pagerData', html); // 分页展示使用

          this.active = 'admin/order/list';
          this.assign('list', list.data);
      this.assign('restaurantArr', restaurantArr);
          this.meta_title = '订单管理';
          return this.display();
      }

 // // 订单列表
 //    async listAction() {
 //        const status = this.get('status');
 //            const restaurant_id = this.get('restaurant_id');
 //            const restautantId = this.user.restaurant_id;
 //        const map = {};
 //        let restaurantArr = [];
 //            if (!think.isEmpty(restaurant_id)) {
 //                map.restaurant_id = restaurant_id;
 //            }
 //            if (restautantId != 0) {
 //                map.restaurant_id = restautantId;
 //                restaurantArr = await this.model('restaurant').where({id: restautantId}).select();
 //            } else {
 //                restaurantArr = await this.model('restaurant').select();
 //            }
 //        if (!think.isEmpty(status)) {
 //            map.status = status;
 //            this.assign('status', status);
 //        }
 //        const q = this.get('q');
 //        if (!think.isEmpty(q)) {
 //            map['order_no|user_id|accept_name|mobile'] = ['like', q];
 //        }
 //        map.is_del = 0;
 //        map.type = 0;
 //        const user = await this.session('userInfo');
 //        if (parseInt(user.restaurant_id) !== 0) {
 //            map.restaurant_id = user.restaurant_id;
 //        }
 //        // this.config("db.nums_per_page",20)
 //        const list = await this.model('order').where(map).page(this.get('page') || 1, 20).order('create_time DESC').countSelect();
 //        for (const item in list.data) {
 //            const  id = item.id;
 //            const a = await this.model('order_goods').where({order_id:id}).countSelect();
 //            for (const b of a.data){
 //                const foodArr = JSON.parse(b.prom_goods);
 //                let str = '';
 //                for (const i in foodArr) {
 //                    str += foodArr[i].title + '(' + foodArr[i].qty + '份￥' + '),';
 //                }
 //                b.prom_goods = str;
 //            }
 //        }
 //
 //        const html = this.pagination(list);
 //        this.assign('pagerData', html); // 分页展示使用const a = await this.model('order_goods').where({order_id:id}).countSelect();
 //        this.active = 'admin/order/list';
 //        this.assign('list', list.data);
 //        this.meta_title = '订单管理';
 //        return this.display();
 //    }
      /**
       * 审核订单
       */
      async auditAction()
      {
          if (this.isPost) {
              const id = this.post('id');
              const admin_remark = this.post('admin_remark');
              const audit = await this.model('order').where({id: id}).update({status: 3, admin_remark: admin_remark});
              if (audit) {
                  return this.success({name: '审核成功！'});
              } else {
                  return this.fail('审核失败！');
              }
          } else {
              const id = this.get('id');
              this.assign('id', id);
              this.meta_title = '审核订单';
              return this.display();
          }
      }

      /**
       * 删除订单
       */
      async delAction()
      {
          const id = this.get('id');
          // 作废的订单才能删除
          const res = await this.model('order').where({id: id, status: 6}).delete();
          if (res) {
              return this.success({name: '删除成功！'});
          } else {
              return this.fail('删除失败！');
          }
      }
      /**
       * 作废订单
       */
      async voidAction()
      {
          if (this.isPost) {
              const id = this.post('id');
              // let voids =await this.model("order").where({id:id}).update({status:6,admin_remark:admin_remark});
              const voids = true;
              if (voids) {
                  // 释放库存
                  await this.model('order').where({id: id}).update({status: 6});
                  return this.success({name: '操作成功！'});
              } else {
                  return this.fail('操作失败！');
              }
          } else {
              const id = this.get('id');
              this.assign('id', id);
              this.meta_title = '审核订单';
              return this.display();
          }
      }
      /**
       * 完成订单
       */
      async finishAction()
      {
          if (this.isPost) {
              const id = this.post('id');
              const admin_remark = this.post('admin_remark');
              const finish = await this.model('order').where({id: id}).update({status: 4, admin_remark: admin_remark});
              if (finish) {
                  return this.success({name: '操作成功！'});
              } else {
                  return this.fail('操作失败！');
              }
          } else {
              const id = this.get('id');
              this.assign('id', id);
              this.meta_title = '完成订单';
              return this.display();
          }
      }

      /**
       * 备注订单
       */
      async remarkAction()
      {
          if (this.isPost) {
              const id = this.post('id');
              const admin_remark = this.post('admin_remark');
              const remark = await this.model('order').where({id: id}).update({admin_remark: admin_remark});
              if (remark) {
                  return this.success({name: '操作成功！'});
              } else {
                  return this.fail('操作失败！');
              }
          } else {
              const id = this.get('id');
              this.assign('id', id);
              this.meta_title = '备注订单';
              return this.display();
          }
      }
      /**
       * 查看订单
       * @returns {*}
       */
      async seeAction()
      {
          const id = this.get('id');
          // console.log(id);
          this.meta_title = '查看订单';
          // 获取订单信息
          const order = await this.model('order').find(id);
          // 购物清单
          const goods = await this.model('order_goods').where({order_id: id}).select();
          let sum = [];
          for (const val of goods) {
              val.title = JSON.parse(val.prom_goods).title;
              val.pic = JSON.parse(val.prom_goods).pic;
              val.type = JSON.parse(val.prom_goods).type;
              val.goods_price = JSON.parse(val.prom_goods).unit_price;
              val.sum = JSON.parse(val.prom_goods).price;
              sum.push(val.goods_nums);
          }
          sum = eval(sum.join('+'));
          this.assign('sum', sum);
          this.assign('goods', goods);
          // 获取购买人信息
          // 购买人信息
          const user = await this.model('wx_user').find(order.user_id);
          this.assign('user', user);
          this.assign('order', order);
          /**
           * 订单原价 = 商品真实价格 + 真实运费
           */
          const olde_order_amount = order.real_amount + order.real_freight;
          const province = await this.model('area').where({parent_id: 0}).select();
          const city = await this.model('area').where({parent_id: order.province}).select();
          const county = await this.model('area').where({parent_id: order.city}).select();
          this.assign('province', province);
          this.assign('city', city);
          this.assign('county', county);
          this.assign('olde_order_amount', olde_order_amount);
          return this.display();
      }
      /**
       * 编辑订单
       */
      async editAction()
      {
          if (this.isPost) {
              const data = this.post();

              const order = await this.model('order').find(data.id);
              /**
               * 订单原价 = 商品真实价格 + 真实运费
               */
              const olde_order_amount = order.real_amount + order.real_freight;
              data.order_amount = Number(olde_order_amount) + Number(data.adjust_amount);
              // 更新订单信息
              const res = await this.model('order').update(data);
              if (res) {
                  // 记录日志
                  let log;
                  if (data.adjust_amount == 0) {
                      log = `修改了订单，订单编号：${order.order_no}`;
                  } else {
                      log = `修改了订单，订单编号：${order.order_no}，并调整订单金额 ${data.adjust_amount} 元，原订单金额：${olde_order_amount} 元，调整后订单金额：${data.order_amount} 元`;
                  }

                  await this.model('cmswing/action').log('order', 'order', log, this.user.uid, this.ip, this.ctx.url);
                  return this.success({name: '编辑成功！'});
              } else {
                  return this.fail('编辑失败！');
              }
          } else {
              const id = this.get('id');
              // console.log(id);
              this.meta_title = '编辑订单';
              // 获取订单信息
              const order = await this.model('order').find(id);
              // 在订单同时没有付款，没有审核，没有完成的情况下才能编辑
              if (order.pay_status == 1 && item.status == 3 && item.delivery_status == 1) {
                  return this.fail('订单已经付款，无法编辑！');
              }

              // 购物清单
              const goods = await this.model('order_goods').where({order_id: id}).select();
              let sum = [];
              for (const val of goods) {
                  val.title = JSON.parse(val.prom_goods).title;
                  val.pic = JSON.parse(val.prom_goods).pic;
                  val.type = JSON.parse(val.prom_goods).type;
                  val.goods_price = JSON.parse(val.prom_goods).unit_price;
                  val.sum = JSON.parse(val.prom_goods).price;
                  sum.push(val.goods_nums);
              }
              sum = eval(sum.join('+'));
              this.assign('sum', sum);
              this.assign('goods', goods);
              // 获取购买人信息
              // 购买人信息
              const user = await this.model('wx_user').find(order.user_id);
              console.log(user);
              this.assign('user', user);
              this.assign('order', order);
              // 获取省份
              /**
               * 订单原价 = 商品真实价格 + 真实运费
               */
              const olde_order_amount = order.real_amount + order.real_freight;
              this.assign('olde_order_amount', olde_order_amount);
              const province = await this.model('area').where({parent_id: 0}).select();
              const city = await this.model('area').where({parent_id: order.province}).select();
              const county = await this.model('area').where({parent_id: order.city}).select();
              this.assign('province', province);
              this.assign('city', city);
              this.assign('county', county);
              return this.display();
          }
      }
      /**
       * 发货设置
       */
      async shipAction()
      {
          if (this.isPost) {
              const data = this.post();
              // data.admin = await get_nickname(this.user.uid);
              // 生成快递单编号
              // const kid = ['k', new Date().getTime()];
              // data.invoice_no = kid.join('');

              // data.create_time = new Date().getTime();
              // const res = await this.model('doc_invoice').add(data);
              // if (res) {
              const deliver = await this.model('deliver').find(data.deliver_id);
              data.deliver_name = deliver.deliver_name;
              data.deliver_tel = deliver.deliver_tel;
              data.delivery_status = 1;
              data.status = 5;
              await this.model('order').update(data);
              // }
              return this.success({'name': '发货成功！'});
          } else {
              const id = this.get('id');
              const order = await this.model('order').find(id);
              const date = new Date(order.send_time);
              order.sendTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00';
              if (order.status != 3) {
                  return this.fail('订单还没审核！，请先审核订单。');
              }
              // 购物清单
              const goods = await this.model('order_goods').where({order_id: id}).select();
              let sum = [];
              for (const val of goods) {
                  val.title = JSON.parse(val.prom_goods).title;
                  val.pic = JSON.parse(val.prom_goods).pic;
                  val.type = JSON.parse(val.prom_goods).type;
                  val.sum = JSON.parse(val.prom_goods).price;
                  sum.push(val.goods_nums);
              }

              // 购买人信息
              const user = await this.model('wx_user').find(order.user_id);
              // 获取送餐员信息
              const deliverArr = await this.model('deliver').where().select();
              // const deliverArr = await this.model('deliver').where({restaurant_id: order.restaurant_id}).select();
              this.assign('deliverList', deliverArr);

              // 获取省份
              const province = await this.model('area').where({parent_id: 0}).select();
              const city = await this.model('area').where({parent_id: order.province}).select();
              const county = await this.model('area').where({parent_id: order.city}).select();
              this.assign('province', province);
              this.assign('city', city);
              this.assign('county', county);
              this.assign('user', user);
              sum = eval(sum.join('+'));
              this.assign('sum', sum);
              this.assign('goods', goods);
              this.assign('order', order);
              this.meta_title = '发货';
              return this.display();
          }
      }
      /**
       * 查看订单
       */
     async vieworderAction()
      {
          const list = [1, 2, 3];
          this.assign('list', list);
          return this.display();
      }
  /**
     * 收款单
     */
  async receivingAction() {
    const data = await this.model('doc_receiving').page(this.get('page')).order('create_time DESC').countSelect();
    const html = this.pagination(data);
    this.assign('pagerData', html); // 分页展示使用
    // console.log(data.data);
    // this.active="admin/order/list"
    for (const val of data.data) {
      switch (val.payment_id) {
        case 100:
          val.channel = '预付款支付';
          break;
        case 1001:
          val.channel = '货到付款';
          break;
        default:
          val.channel = await this.model('pingxx').where({id: val.payment_id}).getField('title', true);
      }
      val.order_id = await this.model('order').where({id: val.order_id}).getField('order_no', true);
    }
    this.assign('list', data.data);
    // this.active="admin/order/receiving"
    this.meta_title = '收款单';
    return this.display();
  }

  /**
     * 发货单
     */
  async invoiceAction() {
    const data = await this.model('doc_invoice').page(this.get('page')).order('create_time DESC').countSelect();
    const html = this.pagination(data);
    this.assign('pagerData', html); // 分页展示使用
    for (const v of data.data) {
      v.express_company_id = await this.model('express_company').where({id: v.express_company_id}).getField('name', true);
    }
    this.assign('list', data.data);
    this.active = 'admin/order/receiving';
    this.meta_title = '发货单';
    return this.display();
  }

  /**
     * 退款单
     */

  refundAction() {
    this.active = 'admin/order/receiving';
    this.meta_title = '退款单';
    return this.display();
  }

  /**
     * 异步获取新增订单，在页面提示
     */
  async getorderAction() {
    // 审核提示
    const notifications = {};
    notifications.count = 0;
    notifications.data = [];
    const a = await this.model('order').where({status: 2, restaurant_id: this.user.restaurant_id}).countSelect();
    const approval = a.count;
    if (approval > 0) {
      notifications.count = notifications.count + Number(approval);
      notifications.data = {type: 'approval', info: `有 ${approval} 条订单待审核`, url: '/admin/order/list/?status=2', ico: 'fa-umbrella'};
    }
    const list = a.data;
    const orderArr = [];
    for (const i in list) {
      const b = list[i];
      const id = b.id;
      const order = await this.model('order').find(id);
      const goodsList = await this.model('order_goods').where({order_id: id}).select();
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
      const a = await this.model('area').find(order.county);
      location += a.name;
      location += order.addr;
      const d = {
        id: order.id,
        title: '及时雨校园餐饮',
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
        is_print: order.is_print
      };
      orderArr.push(d);
    }
    const data = {
      notifications: notifications,
      list: orderArr
    };
    return this.success(data);
  }

  async printAction() {
    const id = this.get('id');
    const order = await this.model('order').find(id);
    const goodsList = await this.model('order_goods').where({order_id: id}).select();
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
    const a = await this.model('area').find(order.county);
    location += a.name;
    location += order.addr;
    const data = {
      title: '及时雨校园餐饮',
      restaurant_name: restaurant.name,
      order_time: order.create_time,
      send_time: order.send_time,
      goodsList: foodList,
      sendPrice: restaurant.send_money,
      amount_price: order.order_amount,
      address: location,
      user_name: order.accept_name,
      user_tel: order.mobile,
      original_amount: parseFloat(amount) + parseFloat(restaurant.send_money),
      restaurant_tel: restaurant.contect_tel
    };
    this.assign('data', data);
    return this.display();
  };

  async printUpAction() {
    const id = this.get('id');
    if (id) {
      await this.model('order').where({id: id}).update({ is_print: 1 });
      return this.success();
    } else {
      return this.fail();
    }
  };

  /**
     * 批量审核
   *  逻辑为，更改状态为审核
     */
  async auditArrAction() {
    const ids = this.para('ids');
    if (think.isEmpty(ids)) {
      return this.fail('参数不能为空!');
    }
    const time = global.dateformat('Y-m-d H:i:s', new Date());
    await this.model('order').where({id: ['IN', ids]}).update({status: 3, admin_remark: '批量审核,时间' + time});
    return this.success({name: '审核成功!'});
  }
  /**
     * 批量发货
   *
     */
  async shipArrAction() {
    const ids = this.para('ids');
    if (think.isEmpty(ids)) {
      return this.fail('参数不能为空!');
    }
    const user = await this.session('userInfo');
    let restaurantId = 0;
    if (parseInt(user.restaurant_id) !== 0) {
      restaurantId = parseInt(user.restaurant_id);
    }
    const deliverArr = await this.model('deliver').where({restaurant_id: restaurantId, is_default: 0}).select();
    let deliver = {};
    if (deliverArr.length > 0) {
      deliver = deliverArr[0];
    }
    const time = global.dateformat('Y-m-d H:i:s', new Date());
    await this.model('order').where({id: ['IN', ids]}).update({
      deliver_name: deliver.deliver_name,
      deliver_tel: deliver.deliver_tel,
      delivery_status: 1,
      status: 5,
      admin_remark: '批量发货,发货时间' + time});
    return this.success({name: '发货成功!'});
  }
};
