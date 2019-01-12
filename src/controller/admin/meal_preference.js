module.exports = class extends think.cmswing.admin {
  /**
     * index action
     * @return {Promise} []
     */
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    // 其他额外的操作
    this.tactive = 'order';
  }
  // eslint-disable-next-line semi

  async indexAction() {
    const list = await this.model('meal_preference').page(this.get('page') || 1, 20).order('id ASC').countSelect();
    for (const item in list.data) {
      const i = list.data[item];
      const restaurant_name = await this.model('restaurant').where({ id: i.restaurant_id }).getField('name', true);
      const d = {
        id: i.id,
        discount: i.discount,
        restaurant_name: restaurant_name,
        advance_days: i.advance_days
      };
      list.data[item] = d;
    }
    const html = this.pagination(list);
    this.assign('pagerData', html); // 分页展示使用
    this.assign('list', list.data);
    this.meta_title = '提前报饭优惠管理';
    return this.display();
  }

  async addAction() {
    if (this.isPost) {
      const restaurant_id = this.user.restaurant_id;
      const data = this.post();
      const map = {};
      map.restaurant_id = restaurant_id;
      map.discount = data.discount;
      map.advance_days = data.advance_days;
      const res = await this.model('meal_preference').add(map);
      if (res) {
        return this.success({name: '添加成功！', url: '/admin/meal_preference/index'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      this.active = '/admin/meal_preference/index';
      this.meta_title = '添加';
      return this.display();
    }
  }

  async editAction() {
    if (this.isPost) {
      const data = this.post();
      const res = await this.model('meal_preference').update(data);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/meal_preference/index'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const id = this.get('id');
      const data = await this.model('meal_preference').find(id);
      this.assign('data', data);
      this.active = '/admin/meal_preference/index';
      this.meta_title = '编辑';
      return this.display();
    }
  }
  async delAction() {
    const ids = this.para('ids');
    if (think.isEmpty(ids)) {
      return this.fail('参数不能为空!');
    }
    // 删除话题
    await this.model('meal_preference').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
