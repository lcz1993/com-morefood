// 菜单列表
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
    const restaurant_id = this.get('restaurant_id');
    const restautantId = this.user.restaurant_id;
    const id = this.get('id');
    let restaurantArr = [];
    const map = {};
    let dishArr = [];
    if (!think.isEmpty(id)) {
      map.dish_class = id;
    }
    if (this.get('keyword')) {
      map.name = ['like', '%' + this.get('keyword') + '%'];
    }
    if (!think.isEmpty(restaurant_id)) {
      map.restaurant_id = restaurant_id;
    }
    if (restautantId != 0) {
      map.restaurant_id = restautantId;
      restaurantArr = await this.model('restaurant').where({id: restautantId}).select();
      dishArr = await this.model('dish_class').where({restaurant_id: restautantId}).select();
    } else {
      restaurantArr = await this.model('restaurant').select();
      dishArr = await this.model('dish_class').select();
    }
    try {
      if (parseInt(this.user.restaurant_id) !== 0) {
        map.restaurant_id = this.user.restaurant_id;
      }
    } catch (e) {
      console.log(e);
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
    this.assign('restaurantArr', restaurantArr);
    this.assign('dishArr', dishArr);
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
      const restaurantId = this.user.restaurant_id;
      this.assign('restaurantId', restaurantId);
      if (restaurantId == 0) {
        const restaurantList = await this.model('restaurant').select();
        this.assign('restaurantList', restaurantList);
      } else {
        const restaurant = await this.model('restaurant').field(['id', 'name']).find(restaurantId);
        this.assign('restaurant', restaurant);
        // 类别
        const dishClassList = await this.model('dish_class').where({restaurant_id: restaurant.id}).select();
        this.assign('dishClassList', dishClassList);
      }
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
      const restaurantId = this.user.restaurant_id;
      this.assign('restaurantId', restaurantId);
      if (restaurantId == 0) {
        const restaurantList = await this.model('restaurant').select();
        this.assign('restaurantList', restaurantList);
      } else {
        const restaurant = await this.model('restaurant').field(['id', 'name']).find(restaurantId);
        this.assign('restaurant', restaurant);
      }
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

  /**
     * 暂停销售
     * @returns {Promise<*>}
     */
  async upStopAction() {
    const id = this.post('id');
    let is_stop = this.post('is_stop');
    is_stop = is_stop == 0 ? 1 : 0;
    const res = await this.model('medu').where({id: id}).update({is_stop: is_stop});
    if (res) {
      return this.success();
    } else {
      return this.fail();
    }
  }

  /**
     * 获取当前商户下所有的商品分类
     * @returns {Promise<*>}
     */
  async listAction() {
    const dishClassId = this.get('dishClassId');
    const list = await this.model('medu').where({dish_class: dishClassId}).select();
    return this.success(list);
  }
};
