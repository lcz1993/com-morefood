// 送餐员列表
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
    const list = await this.model('deliver').where(map).order('id DESC').page(this.get('page') || 1, 20).countSelect();
    for (const data of list.data) {
      data.restaurant_name = await this.model('restaurant').where({id: data.restaurant_id}).getField('name');
    }
    const html = this.pagination(list);
    this.assign('list', list);
    this.assign('pagerData', html); // 分页展示使用
    this.meta_title = '送餐员列表';
    return this.display();
  }

  async addAction() {
    // auto render template file ad_page.htm
    // 搜索
    if (this.isPost) {
      const data = this.post();
      const user = await this.session('userInfo');
      data.restaurant_id = user.restaurant_id;
      const res = await this.model('deliver').add(data);
      if (res) {
        return this.success({name: '添加成功！'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      this.active = '/admin/deliver/index';
      this.meta_title = '新增送餐员';
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
      const res = await this.model('deliver').update(data);
      if (res) {
        return this.success({name: '修改成功！'});
      } else {
        return this.fail('修改失败!');
      }
    } else {
      const id = await this.get('id');
      const deliver = await this.model('deliver').find(id);
      this.assign('data', deliver);
      this.active = '/admin/deliver/index';
      this.meta_title = '编辑菜单';
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
    await this.model('deliver').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
  async getAction() {
    const id = this.get('id');
    const data = await this.model('deliver').find(id);
    return this.success(data);
  }
};
