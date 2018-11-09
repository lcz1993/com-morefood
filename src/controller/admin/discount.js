// 分类列表
module.exports = class extends think.cmswing.admin {
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    this.tactive = 'order';
  }

  /**
     * __before action
     * @private
     */
  async __before() {
    await super.__before();
  }

  /**
     * index action
     * @return {Promise} []
     */
  async indexAction() {
    // auto render template file ad_index.htm
    // 搜索
    const map = {};
    if (this.get('keyword')) {
      map.name = ['like', '%' + this.get('keyword') + '%'];
    }
    const user = await this.session('userInfo');
    if (parseInt(user.restaurant_id) !== 0) {
      map.restaurant_id = user.restaurant_id;
    }
    const list = await this.model('discount').where(map).order('id DESC').page(this.get('page') || 1, 20).countSelect();
    for (const discount of list.data) {
      const restaurant = await this.model('restaurant').find(discount.restaurant_id);
      discount.restaurant_name = restaurant.name;
    }
    const html = this.pagination(list);
    this.assign('list', list);
    this.assign('pagerData', html); // 分页展示使用
    this.meta_title = '优惠信息列表';
    return this.display();
  }

  async addAction() {
    // auto render template file ad_page.htm
    // 搜索
    if (this.isPost) {
      const data = this.post();
      data.restaurant_id = this.user.restaurant_id;
      let time = data.start_time;
      data.start_time = new Date(time.replace(/-/g, '/')).getTime();
      time = data.end_time;
      data.end_time = new Date(time.replace(/-/g, '/')).getTime();
      const type_id = parseInt(data.type_id);
      const resta = await this.model('restaurant').where({id: this.user.restaurant_id, discount_id: ['LIKE', '%' + data.type_id + '%']}).find(this.user.restaurant_id);
      if (!resta) {
        const v = await this.model('restaurant').field('discount_id', true).find(this.user.restaurant_id);
        await this.model('restaurant').where({id: this.user.restaurant_id}).update({
          discount_id: v + type_id
        });
      }
      switch (type_id) {
        // 新用户优惠
        case 1:
          data.min_price = data.min_price_1;
          data.cut_price = data.cut_price_1;
          break;
        // 特价商品
        case 2:
          const medu = {
            id: data.medu_id,
            original_price: data.medu_origin_price
          };
          await this.model('medu').update(medu);
          break;
        // 下单立减
        case 3:
          data.min_price = data.min_price_3;
          data.cut_price = data.cut_price_3;
          break;
        // 赠品优惠
        case 4:
          data.min_price = data.min_price_4;
          break;
        // 下单返红包
        case 5:
          data.min_price = data.min_price_5;
          data.cut_price = data.cut_price_5;
          break;
        // 进店领红包
        case 6:
          data.min_price = data.min_price_6;
          data.cut_price = data.cut_price_6;
          break;
        default:
          return this.fail('添加失败!');
      }
      const res = await this.model('discount').add(data);
      if (res) {
        return this.success({name: '添加成功！'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      this.active = '/admin/discount/index';
      this.meta_title = '新增优惠券';
      return this.display();
    }
  }
  async editAction() {
    // auto render template file ad_page.htm
    // 搜索
    if (this.isPost) {
      const data = this.post();
      let time = data.start_time;
      data.start_time = new Date(time.replace(/-/g, '/')).getTime();
      time = data.end_time;
      data.end_time = new Date(time.replace(/-/g, '/')).getTime();
      const type_id = parseInt(data.type_id);
      const resta = await this.model('restaurant').where({id: this.user.restaurant_id, discount_id: ['LIKE', '%' + data.type_id + '%']}).find(this.user.restaurant_id);
      if (!resta) {
        const v = await this.model('restaurant').field('discount_id', true).find(this.user.restaurant_id);
        await this.model('restaurant').where({id: this.user.restaurant_id}).update({
          discount_id: v + type_id
        });
      }
      switch (type_id) {
        // 新用户优惠
        case 1:
          data.min_price = data.min_price_1;
          data.cut_price = data.cut_price_1;
          break;
          // 特价商品
        case 2:
          const medu = {
            id: data.medu_id,
            original_price: data.medu_origin_price
          }; 0;
          await this.model('medu').update(medu);
          break;
          // 下单立减
        case 3:
          data.min_price = data.min_price_3;
          data.cut_price = data.cut_price_3;
          break;
          // 赠品优惠
        case 4:
          data.min_price = data.min_price_4;
          break;
          // 下单返红包
        case 5:
          data.min_price = data.min_price_5;
          data.cut_price = data.cut_price_5;
          break;
          // 进店领红包
        case 6:
          data.min_price = data.min_price_6;
          data.cut_price = data.cut_price_6;
          break;
        default:
          return this.fail('添加失败!');
      }
      const res = await this.model('discount').update(data);
      if (res) {
        return this.success({name: '修改成功！'});
      } else {
        return this.fail('修改失败!');
      }
    } else {
      const id = await this.get('id');
      const data = await this.model('discount').find(id);
      data.start_time = global.dateformat('Y-m-d H:i:s', data.start_time);
      data.end_time = global.dateformat('Y-m-d H:i:s', data.start_time);
      const type_id = parseInt(data.type_id);
      data.type_id = type_id;
      let meduId = '';
      switch (type_id) {
        // 新用户优惠
        case 1:
          data.min_price_1 = data.min_price;
          data.cut_price_1 = data.cut_price;
          break;
          // 特价商品
        case 2:
          meduId = data.medu_id;
          const a = await this.model('medu').field(['original_price', 'dish_class']).find(meduId);
          data.medu_origin_price = a.original_price;
          data.medu_dish_class = a.dish_class;
          break;
          // 下单立减
        case 3:
          data.min_price_3 = data.min_price;
          data.cut_price_3 = data.cut_price;
          break;
          // 赠品优惠
        case 4:
          meduId = data.medu_id;
          data.medu_dish_class = await this.model('medu').field('dish_class', true).find(meduId);
          data.min_price_4 = data.min_price;
          break;
          // 下单返红包
        case 5:
          data.min_price_5 = data.min_price;
          data.cut_price_5 = data.cut_price;
          break;
          // 进店领红包
        case 6:
          data.min_price_6 = data.min_price;
          data.cut_price_6 = data.cut_price;
          break;
        default:
          return this.fail('添加失败!');
      }
      this.assign('data', data);
      this.active = '/admin/discount/index';
      this.meta_title = '编辑优惠券';
      return this.display();
    }
  }
  /**
     * 删除话题
     */
  async delAction() {
    const ids = this.para('ids');
    if (think.isEmpty(ids)) {
      return this.fail('参数不能为空!');
    }
    // 删除话题
    await this.model('discount').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
