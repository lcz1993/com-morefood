module.exports = class extends think.cmswing.admin {
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    // 其他额外的操作
    this.tactive = 'wxuser';
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
    const list = await this.model('wx_user').order('id DESC').page(this.get('page') || 1, 20).countSelect();
    const html = this.pagination(list);
    this.assign('list', list);
    this.assign('pagerData', html); // 分页展示使用
    this.meta_title = '微信用户';
    return this.display();
  }
  /**
     * index action
     * @return {Promise} []
     */
  async seeAction() {
    const id = this.get('id');
    const data = await this.model('wx_user').find(id);
    if (!data.province) {
      data.province = global.get_location(data.province);
    }
    if (!data.city) {
      data.city = global.get_location(data.city);
    }
    this.assign('data', data);
    return this.display();
  }
};
