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
   * 财务日志
   */
  async logAction() {
    const list = await this.model('balance_log').order('id DESC').page(this.get('page') || 1, 20).countSelect();
    const html = this.pagination(list);
    this.assign('pagerData', html);
    for (const item of list.data) {
      const restaurant = await this.model('restaurant').field('name').find(item.restaurant_id);
      item.restaurantName = restaurant.name;
      const user = await this.model('wx_user').field('nickname').find(item.user_id);
      item.username = user.nickname;
      const note = JSON.parse(item.note);
      const foodArr = note.foodList;
      let str = '';
      for (const i in foodArr) {
        str += foodArr[i].title + '(' + foodArr[i].qty + '份￥' + foodArr[i].price + '),';
      }
      item.note = str;
    }
    this.assign('list', list.data);
    this.meta_title = '财务日志';
    return this.display();
  }
};
