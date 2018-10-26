// 菜单列表
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
    const list = await this.model('medu').where(map).order('id DESC').page(this.get('page') || 1, 20).countSelect();
    for (const medu of list.data) {
      if (medu.dish_picture) {
        const img = await this.model('ext_attachment_pic').find(medu.dish_picture);
        medu.dish_picture = img.path;
      }
      if (medu.restaurant_id) {
        medu.restaurant = await this.model('restaurant').find(medu.restaurant_id);
      }
      if (medu.discount_id) {
        medu.discount = await this.model('discount').find(medu.discount_id);
      }
      if (medu.dish_class) {
        medu.dish_class = await this.model('dish_class').find(medu.dish_class);
      }
    }
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
      const res = await this.model('medu').add(data);
      if (res) {
        return this.success({name: '添加成功！', url: '/admin/medu/index'});
      } else {
        return this.fail('添加失败！');
      }
    } else {
      // 餐厅
      const restaurant = await this.model('restaurant').select();
      this.assign('restaurant', restaurant);
      // 优惠券
      const discount = await this.model('discount').select();
      this.assign('discount', discount);
      this.active = '/admin/medu/index';
      this.meta_title = '新增菜单';
      await this.hook('adminUpPic', 'dish_picture', '', {$hook_key: 'dish_picture'});
      await this.hook('adminUpPic', 'image', '', {$hook_key: 'image'});
      return this.display();
    }
  }
  async editAction() {
    // auto render template file ad_page.htm
    // 搜索
    if (this.isPost) {
      const data = this.post();
      const res = await this.model('medu').update(data);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/medu/index'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const id = await this.get('id');
      const medu = await this.model('medu').find(id);
      // 餐厅
      const restaurant = await this.model('restaurant').select();
      this.assign('restaurant', restaurant);
      // 优惠券
      const discount = await this.model('discount').select();
      this.assign('discount', discount);
      // 分类
      const dishs = await this.model('dish_class').where({restaurant_id: medu.restaurant_id}).select();
      this.assign('dishs', dishs);
      this.assign('data', medu);
      this.active = '/admin/medu/index';
      this.meta_title = '编辑菜单';
      await this.hook('adminUpPic', 'dish_picture', medu.dish_picture, {$hook_key: 'dish_picture'});
      await this.hook('adminUpPic', 'image', medu.image, {$hook_key: 'image'});
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
    await this.model('medu').where({id: ['IN', ids]}).delete();
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
};
