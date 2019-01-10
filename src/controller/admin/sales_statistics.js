// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015-2115 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------

module.exports = class extends think.cmswing.admin {
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    // 其他额外的操作
    this.tactive = 'finance';
  }
  /**
     * index action
     * @return {Promise} []
     */
  indexAction() {
    // auto render template file index_index.html
    return this.display();
  }

  /**
     * 销售统计管理数据查询
     */
  async indexAction() {
    let startTime = this.get('startTime');
    if (think.isEmpty(startTime)) {
      startTime = 0;
    } else {
      startTime = new Date(startTime.replace(/-/g, '/')).getTime();
    }
    let endTime = this.get('endTime');
    if (think.isEmpty(endTime)) {
      endTime = new Date().getTime();
    } else {
      endTime = new Date(endTime.replace(/-/g, '/')).getTime();
    }
    let where = 'create_time BETWEEN ' + startTime + ' AND ' + endTime +
        ' AND `status` = 4';
    const restaurantId = this.get('restaurant_id') || (this.user.restaurant_id == 0 ? '' : this.user.restaurant_id);
    if (!think.isEmpty(restaurantId)) {
      where += ' AND a.restaurant_id == ' + restaurantId;
    }
    let list = [];
    list = await this.model('order').alias('a')
      .join('cmswing_order_goods as b on a.id = b.order_id')
      .join('cmswing_restaurant as c on a.restaurant_id = c.id')
      .join('cmswing_medu as d on b.goods_id = d.id')
      .field('b.goods_id,sum(b.goods_nums) as goods_nums ,sum(b.goods_price) as goods_price ,a.restaurant_id,c.name AS restaurantName,d.dish_name AS title ')
      .where(where)
      .group('b.goods_id,a.restaurant_id').page(this.get('page') || 1, 20).countSelect();

    const map = {};
    let restaurantArr = [];
    if (!think.isEmpty(restaurantId)) {
      map.restaurant_id = restaurantId;
      restaurantArr = await this.model('restaurant').where({id: restaurantId}).select();
    } else {
      restaurantArr = await this.model('restaurant').select();
    }
    const html = this.pagination(list);
    this.assign('pagerData', html); // 分页展示使用
    this.assign('list', list);
    this.assign('restaurantArr', restaurantArr);
    this.meta_title = '销售统计';
    return this.display();
  }
};
