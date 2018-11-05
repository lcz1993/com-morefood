// 店铺列表
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
      map.id = user.restaurant_id;
    }
    const list = await this.model('restaurant').where(map).order('id DESC').page(this.get('page') || 1, 20).countSelect();
    const html = this.pagination(list);
    this.assign('list', list);
    this.assign('pagerData', html); // 分页展示使用
    this.meta_title = '菜单列表';
    return this.display();
  }

  async addAction() {
    // auto render template file ad_page.htm
    // 搜索
    if (this.isPost) {
      const data = this.post();
      const res = await this.model('restaurant').add(data);
      if (res) {
        return this.success({name: '添加成功！', url: '/admin/restaurant/index'});
      } else {
        return this.fail('添加失败！');
      }
    } else {
      this.active = '/admin/restaurant/index';
      this.meta_title = '新增菜单';
      await this.hook('adminUpPic', 'image', '', {$hook_key: 'image'});
      await this.hook('adminUpPic', 'bg_image', '', {$hook_key: 'bg_image'});
      await this.hook('adminUpPics', 'shop_image', '', {$hook_key: 'shop_image'});
      return this.display();
    }
  }
  async editAction() {
    // auto render template file ad_page.htm
    // 搜索
    if (this.isPost) {
      const data = this.post();
      const res = await this.model('restaurant').update(data);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/restaurant/index'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const id = await this.get('id');
      const restaurant = await this.model('restaurant').find(id);
      this.assign('data', restaurant);
      this.active = '/admin/restaurant/index';
      this.meta_title = '编辑菜单';
      await this.hook('adminUpPic', 'image', restaurant.image, {$hook_key: 'image'});
      await this.hook('adminUpPic', 'bg_image', restaurant.bg_image, {$hook_key: 'bg_image'});
      await this.hook('adminUpPics', 'shop_image', restaurant.shop_image, {$hook_key: 'shop_image'});
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
    await this.model('restaurant').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }

  /**
     * 获取餐厅的菜品分类
     */
  async getClassAction() {
    const restaurant_id = this.get('id');
    if (restaurant_id) {
      const dishs = await this.model('dish_class').where({restaurant_id: restaurant_id}).select();
      return this.success({dishs: dishs});
    }
    return this.fail('参数错误');
  }

  async upCloseAction() {
    const id = this.post('id');
    let is_close = this.post('is_close');
    is_close = is_close == 0 ? 1 : 0;
    const res = await this.model('restaurant').where({id: id}).update({is_close: is_close});
    if (res) {
      return this.success();
    } else {
      return this.fail();
    }
  }
};
