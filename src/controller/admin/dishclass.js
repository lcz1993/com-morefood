// 分类列表
module.exports = class extends think.cmswing.admin {
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    this.tactive = 'manager';
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
    const list = await this.model('dish_class').where(map).order('id DESC').page(this.get('page') || 1, 20).countSelect();
    const html = this.pagination(list);
    this.assign('list', list);
    this.assign('pagerData', html); // 分页展示使用
    this.meta_title = '分类列表';
    return this.display();
  }

  async addAction() {
    // auto render template file ad_page.htm
    // 搜索
    if (this.isPost) {
      const data = this.post();
      const user = await this.session('userInfo');
      data.restaurant_id = user.restaurant_id;
      const restaurant = await this.model('restaurant').find(user.restaurant_id);
      data.restaurant_name = restaurant.name;
      const res = await this.model('dish_class').add(data);
      if (res) {
        return this.success({name: '添加成功！'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      this.active = '/admin/dishclass/index';
      this.meta_title = '新增分类';
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
      const restaurant = await this.model('restaurant').find(user.restaurant_id);
      data.restaurant_name = restaurant.name;
      const res = await this.model('dish_class').update(data);
      if (res) {
        return this.success({name: '修改成功！'});
      } else {
        return this.fail('修改失败!');
      }
    } else {
      const id = await this.get('id');
      const dishclass = await this.model('dish_class').find(id);
      this.assign('data', dishclass);
      this.active = '/admin/dishclass/index';
      this.meta_title = '编辑分类';
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
    await this.model('dish_class').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
