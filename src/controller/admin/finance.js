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
    const startTime = this.get('startTime');
    const endTime = this.get('endTime');
    const restaurant_id = this.get('restaurant_id');
    const restautantId = this.user.restaurant_id;
    const start = new Date();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const todayStartTime = Date.parse(start) / 1;
    // console.log(todayStartTime); // Mon Dec 04 2017 00:00:00 GMT+0800 (中国标准时间)
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
    if (think.isEmpty(startTime) && !think.isEmpty(endTime)) {
      const t1 = new Date(endTime.replace(/-/g, '/')).getTime();
      map.time = ['BETWEEN', 0, t1];
    } else if (think.isEmpty(endTime) && !think.isEmpty(startTime)) {
      const t = new Date(startTime.replace(/-/g, '/')).getTime();
      map.time = ['BETWEEN', t, new Date().getTime()];
    } else if (think.isEmpty(endTime) && think.isEmpty(startTime)) {
      map.time = ['>=', todayStartTime];
    } else {
      const t = new Date(startTime.replace(/-/g, '/')).getTime();
      const t1 = new Date(endTime.replace(/-/g, '/')).getTime();
      map.time = ['BETWEEN', t, t1];
    }
    const list = await this.model('balance_log').where(map).order('id DESC').page(this.get('page') || 1, 20).countSelect();
    const html = this.pagination(list);
    this.assign('pagerData', html);
    for (const item of list.data) {
      const restaurant = await this.model('restaurant').field('name').find(item.restaurant_id);
      item.restaurantName = restaurant.name;
      const user = await this.model('wx_user').field('nickname').find(item.user_id);
      item.username = user.nickname;
      const note = JSON.parse(item.note);
      console.log(note);
      const foodArr = note.foodList;
      let str = '';
      for (const i in foodArr) {
        str += foodArr[i].title + '(' + foodArr[i].qty + '份￥' + foodArr[i].price + '),';
      }
      item.note = str;
    }
    this.assign('list', list);
    this.assign('restaurantArr', restaurantArr);
    this.meta_title = '财务日志';
    return this.display();
  }
  /**
     * 打印报表
     */
  async printAction() {
    const startTime = this.get('startTime');
    const endTime = this.get('endTime');
    const restaurant_id = this.get('restaurant_id');
    const start = new Date();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const todayStartTime = Date.parse(start) / 1;
    const map = {};
    if (!think.isEmpty(restaurant_id)) {
      map.restaurant_id = restaurant_id;
    }
    if (think.isEmpty(startTime) && !think.isEmpty(endTime)) {
      const t1 = new Date(endTime.replace(/-/g, '/')).getTime();
      map.time = ['BETWEEN', 0, t1];
    } else if (think.isEmpty(endTime) && !think.isEmpty(startTime)) {
      const t = new Date(startTime.replace(/-/g, '/')).getTime();
      map.time = ['BETWEEN', t, new Date().getTime()];
    } else if (think.isEmpty(endTime) && think.isEmpty(startTime)) {
      map.time = ['>=', todayStartTime];
    } else {
      const t = new Date(startTime.replace(/-/g, '/')).getTime();
      const t1 = new Date(endTime.replace(/-/g, '/')).getTime();
      map.time = ['BETWEEN', t, t1];
    }

    const list = await this.model('balance_log').where(map).order('id ASC').select();
    const foodList = [];
    let numsum = 0;
    let pricesum = 0;
    let amount = 0;
    for (const i in list) {
      const goods = list[i];
      const restaurant = await this.model('restaurant').field('name').find(goods.restaurant_id);
      goods.restaurantName = restaurant.name;
      const user = await this.model('wx_user').field('nickname').find(goods.user_id);
      goods.username = user.nickname;
      const note = JSON.parse(goods.note);
      for (const i in note.foodList) {
        const a = note.foodList[i];
        const title = a.title;
        const qty = a.qty;
        const price = a.price;
        const unit_price = a.unit_price;

        const b = {
          title: title,
          num: parseFloat(qty),
          total_price: parseFloat(price),
          restaurantName: goods.restaurantName,
          username: goods.username,
          time: goods.time,
          unit_price: unit_price
        };
        var num = parseInt(qty);
        console.log(num);
        var p = parseFloat(price);
        console.log(p);
        numsum = num + numsum;
        pricesum += p;
        amount += note.price;
        foodList.push(b);
      }
    }
    const data = {
      title: '报表统计',
      goodsList: foodList,
      countprice: amount,
      numsum: numsum,
      pricenum: pricesum.toFixed(2)
    };
    this.assign('data', data);
    return this.display();
  };
};
