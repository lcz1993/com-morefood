module.exports = class extends think.cmswing.admin {
  /**
     * index action
     * @return {Promise} []
     */
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    // 其他额外的操作
    this.tactive = 'activity';
  }
  // eslint-disable-next-line semi
  async indexAction() {
    const map = {};
    const keyword = this.get('keyword');
    if (!think.isEmpty(keyword)) {
      map.name = ['like', '%' + keyword + '%'];
    }
    const list = await this.model('information').where(map).page(this.get('page') || 1, 20).order('id ASC').countSelect();
    for (const i in list.data) {
      const item = list.data[i];
      const a = item.account_id;
      map.is_add = 0;
      map.id = a;
      const data = await this.model('record').where(map).countSelect();
      let num = '';
      let remark = '';
      for (const i of data.data) {
        num = i.num;
        remark = i.remark;
      }
      const d = {
        num: num,
        remark: remark,
        id: item.id,
        prize_id: item.prize_id,
        prize_name: item.prize_name,
        user_id: item.user_id,
        user_name: item.user_name,
        user_mobile: item.user_mobile,
        user_address: item.user_address,
        create_time: item.create_time,
        status: item.status
      };
      list.data[i] = d;
    }
    const html = this.pagination(list);
    this.assign('pagerData', html); // 分页展示使用
    this.assign('list', list);
    this.meta_title = '会员领奖管理';
    return this.display();
  }

  async editAction() {
    if (this.isPost) {
      const data = this.post();
      const res = await this.model('information').update(data);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/information/index'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const map = {};
      const id = this.get('id');
      map.is_add = 0;
      const data = await this.model('information').find(id);
      const a = data.account_id;
      map.id = a;
      const list = await this.model('record').find(map);
      this.assign('list', list);
      this.assign('data', data);
      this.meta_title = '编辑';
      return this.display();
    }
  }
};
