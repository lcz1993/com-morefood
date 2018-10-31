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
      const user = await this.session('userInfo');
      data.restaurant_id = user.restaurant_id;
      let time = data.start_time;
      data.start_time = new Date(time.replace(/-/g, '/')).getTime();
      time = data.end_time;
      data.end_time = new Date(time.replace(/-/g, '/')).getTime();
      if (data.is_show == 0) {
        const discountArr = await this.model('discount').where({restaurant_id: user.restaurant_id, is_show: 0}).select();
        for (const i in discountArr) {
          await this.model('discount').where({id: discountArr[i].id}).update({is_show: 1});
        }
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
      const user = await this.session('userInfo');
      data.restaurant_id = user.restaurant_id;
      let time = data.start_time;
      data.start_time = new Date(time.replace(/-/g, '/')).getTime();
      time = data.end_time;
      data.end_time = new Date(time.replace(/-/g, '/')).getTime();
      if (data.is_show == 0) {
        const discountArr = await this.model('discount').where({restaurant_id: user.restaurant_id, is_show: 0}).select();
        for (const i in discountArr) {
          await this.model('discount').where({id: discountArr[i].id}).update({is_show: 1});
        }
      }
      const res = await this.model('discount').update(data);
      if (res) {
        return this.success({name: '修改成功！'});
      } else {
        return this.fail('修改失败!');
      }
    } else {
      const id = await this.get('id');
      const discount = await this.model('discount').find(id);
      discount.start_time = global.dateformat('Y-m-d H:i:s', discount.start_time);
      discount.end_time = global.dateformat('Y-m-d H:i:s', discount.start_time);
      this.assign('data', discount);
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
