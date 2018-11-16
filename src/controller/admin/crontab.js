// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015-2115 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------

module.exports = class extends think.Controller {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction() {
    // auto render template file index_index.html
    return this.display();
  }
  async cloaAction() {
    // 订单在规定时间为付款自动作废执行方法
    // 禁止 URL 访问该 Action
    if (!this.isCli) {
      const error = this.controller('cmswing/error');
      return error.noAction('only invoked in cli mode！');
    }

    // 定期清空购物车
    const cartArr = await this.model('selection').select();
    for (const cart of cartArr) {
      const addTime = cart.add_time;
      if ((addTime + 3600000) < (new Date().getTime())) {
        await this.model('selection').where({id: cart.id}).delete();
      }
    }

    // 查询未付款，未作废的订单的订单
    const orderList = await this.model('order').where({status: 0}).select();
    const WeixinSerivce = this.service('weixin', 'api');

    for (const order of orderList) {
      const openid = await this.model('wx_user').where({ id: order.user_id }).getField('openid', true);

      const payInfo = {
        openid: openid,
        out_trade_no: order.order_no
      };
      const result = await WeixinSerivce.queryOrder(payInfo);
      if (result.trade_state == 'SUCCESS') {
        await await this.model('order').updataStatus(order.id);
      } else {
        const createTime = order.create_time;
        if ((createTime + 3600000) < (new Date().getTime())) {
          await this.model('order').update({
            id: order.id,
            status: 6,
            admin_remark: '系统取消了订单，理由是“超时未支付”'
          });
        }
      }
    }
    // think.logger.debug(new Date(), '订单作废任务执行时间');
    // this.end();
    return this.body = '';
  }

  /**
     * 定时清除月销量
     * @returns {Promise<*>}
     */
  async scoreAction() {
    // 订单在规定时间为付款自动作废执行方法
    // 禁止 URL 访问该 Action
    if (!this.isCli) {
      const error = this.controller('cmswing/error');
      return error.noAction('only invoked in cli mode！');
    }
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() - 1;
    console.log(year + '年' + month + '月');
    const restaurantList = await this.model('restaurant').select();
    for (const item in restaurantList) {
      const restaurant = restaurantList[item];
      await this.model('restaurant_history').add({
        restaurant_id: restaurant.id,
        year: year,
        sales: restaurant.sales,
        month: month
      });
      await this.model('restaurant').where({id: restaurant.id}).update({
        sales: 0
      });
    }

    const meduList = await this.model('medu').select();
    for (const item in meduList) {
      const medu = meduList[item];
      await this.model('medu_history').add({
        medu_id: medu.id,
        year: year,
        sales: medu.sell_count,
        month: month
      });
      await this.model('medu').where({id: medu.id}).update({
        sell_count: 0
      });
    }

    // think.logger.debug(new Date(), '订单作废任务执行时间');
    // this.end();
    return this.body = '';
  }
};
