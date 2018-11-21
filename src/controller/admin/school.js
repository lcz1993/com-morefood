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
  // eslint-disable-next-line semi

  // 学校管理的数据查询
  async listAction() {
    const map = {};
    const keyword = this.get('keyword');
    if (!think.isEmpty(keyword)) {
      map.name = ['like', '%' + keyword + '%'];
    }
    const list = await this.model('school').where(map).page(this.get('page') || 1, 20).order('sort ASC').countSelect();
    const html = this.pagination(list);
    this.assign('pagerData', html); // 分页展示使用
    this.assign('list', list.data);
    this.meta_title = '学校区域管理';
    return this.display();
  }

  async addAction() {
    if (this.isPost) {
      const data = this.post();
      console.log(data);
      const res = await this.model('school').add(data);
      if (res) {
        return this.success({name: '添加成功！'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      this.meta_title = '学校区域管理';
      return this.display();
    }
  }

  async editAction() {
    if (this.isPost) {
      const data = this.post();
      const res = await this.model('school').update(data);
      if (res) {
        return this.success({name: '修改成功！'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const id = this.get('id');
      const data = await this.model('school').find(id);
      this.assign('data', data);
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
    await this.model('school').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
