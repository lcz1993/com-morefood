// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015-2115 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------
// 关键字
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
    const list = await this.model('keywords').where(map).order('id DESC').page(this.get('page') || 1, 20).countSelect();
    const html = this.pagination(list);
    this.assign('list', list);
    this.assign('pagerData', html); // 分页展示使用
    this.meta_title = '搜索热词';
    // auto render template file index_index.html
    return this.display();
  }

  async addAction() {
    // auto render template file ad_page.htm
    // 搜索
    if (this.isPost) {
      const data = this.post();
      const res = this.model('keywords').add(data);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/keywords/index'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      this.active = 'admin/keywords/index';
      this.meta_title = '新增';
      return this.display();
    }
  }
  async editAction() {
    // auto render template file ad_page.htm
    // 搜索
    if (this.isPost) {
      const data = this.post();
      const res = this.model('keywords').update(data);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/keywords/index'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const id = await this.get('id');
      this.active = 'admin/keywords/index';
      const channel = await this.model('keywords').find(id);
      this.assign('data', channel);
      this.meta_title = '编辑';
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
    await this.model('keywords').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
