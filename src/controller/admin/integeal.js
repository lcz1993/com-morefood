module.exports = class extends think.cmswing.admin {
  /**
     * index action
     * @return {Promise} []
     */
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    // 其他额外的操作
    this.tactive = 'manager';
  }

    /**
     *
     * @returns {Promise<*>}
     */
  async indexAction() {
    const map = {};
    const keyword = this.get('keyword');
    if (!think.isEmpty(keyword)) {
      map.name = ['like', '%' + keyword + '%'];
    }
    const data = await this.model('goods').where(map).page(this.get('page') || 1, 20).order('id ASC').countSelect();
    const html = this.pagination(data);
    this.assign('pagerData', html); // 分页展示使用
    this.assign('data', data.data);
    this.meta_title = '积分商品管理';
    return this.display();
  }

    /**
     *
     * @returns {Promise<*>}
     */
  async addAction() {
    if (this.isPost) {
      const data = this.post();
      const res = await this.model('goods').add(data);
      if (res) {
        return this.success({name: '添加成功！'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      this.meta_title = '积分商品添加';
      await this.hook('adminUpPic', 'icon', '', {$hook_key: 'icon'});
      await this.hook('adminUpPic', 'image', '', {$hook_key: 'image'});
      return this.display();
    }
  }

    /**
     *
     * @returns {Promise<*>}
     */
  async editAction() {
    if (this.isPost) {
      const data = this.post();
      const res = await this.model('goods').update(data);
      if (res) {
        return this.success({name: '修改成功！'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const id = this.get('id');
      const data = await this.model('goods').find(id);
      this.assign('data', data);
      this.meta_title = '积分商品编辑';
      await this.hook('adminUpPic', 'icon', data.icon, {$hook_key: 'icon'});
      await this.hook('adminUpPic', 'image', data.image, {$hook_key: 'image'});
      await this.hook('adminEdit', 'image', data.image, {$hook_key: 'image'});
      return this.display();
    }
  }

    /**
     *
     * @returns {Promise<*>}
     */
  async delAction() {
    const ids = this.para('ids');
    if (think.isEmpty(ids)) {
      return this.fail('参数不能为空!');
    }
    // 删除话题
    await this.model('goods').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
