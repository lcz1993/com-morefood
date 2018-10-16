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

    // 查询未付款，未作废的订单的订单
    const orderList = await this.model('order').where({status: 0}).select();
    for (const order of orderList) {
      const createTime = order.create_time;
      if ((createTime + 3600000) < (new Date().getTime())) {
        await this.model('order').delete(order);
      }
    }

    // think.logger.debug(new Date(), '订单作废任务执行时间');
    // this.end();
    return this.body = '';
  }
};
