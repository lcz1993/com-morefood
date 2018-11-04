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
      }
      const createTime = order.create_time;
      if ((createTime + 3600000) < (new Date().getTime())) {
        await this.model('order').update({
          id: order.id,
          status: 6,
          admin_remark: '系统取消了订单，理由是“超时未支付”'
        });
      }
    }
    // think.logger.debug(new Date(), '订单作废任务执行时间');
    // this.end();
    return this.body = '';
  }
};
