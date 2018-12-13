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
  async indexAction() {
    const map = {};
    const keyword = this.get('keyword');
    if (!think.isEmpty(keyword)) {
      map.recharge_amount = ['like', '%' + keyword + '%'];
    }
    const list = await this.model('recharge_amount').where(map).page(this.get('page') || 1, 20).order('id ASC').countSelect();
    for (const item in list.data) {
      const i = list.data[item];
      const member_id = i.member_id;
      const member_name = await this.model('member').where({ id: member_id }).getField('username', true);
      const d = {
        id: i.id,
        recharge_amount: i.recharge_amount,
        donation_amount: i.donation_amount,
        member_name: member_name,
        modification_time: i.modification_time,
        create_time: i.create_time,
        commodity_details: i.commodity_details
      };
      list.data[item] = d;
    }
    const html = this.pagination(list);
    this.assign('pagerData', html); // 分页展示使用
    this.assign('list', list);
    this.meta_title = '充值金额设置管理';
    return this.display();
  }

  async addAction() {
    if (this.isPost) {
      const map = {};
      const data = this.post();
      map.recharge_amount = data.recharge_amount;
      map.donation_amount = data.donation_amount;
      map.member_id = this.user.uid;
      map.create_time = Date.parse(new Date());
      map.commodity_details = data.commodity_details;
      const res = await this.model('recharge_amount').add(map);
      if (res) {
        return this.success({name: '添加成功！'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      this.meta_title = '充值金额添加';
      await this.hook('adminEdit', 'commodity_details', '', {$hook_key: 'commodity_details', $hook_type: '1'});
      return this.display();
    }
  }

  async editAction() {
    if (this.isPost) {
      const map = {};
      const data = this.post();
      map.recharge_amount = data.recharge_amount;
      map.donation_amount = data.donation_amount;
      map.update_time = Date.parse(new Date());
      map.commodity_details = data.commodity_details;
      const res = await this.model('recharge_amount').update(map);
      if (res) {
        return this.success({name: '修改成功！'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const id = this.get('id');
      const data = await this.model('recharge_amount').find(id);
      await this.hook('adminEdit', 'commodity_details', data.commodity_details, {$hook_key: 'commodity_details', $hook_type: '1'});
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
    await this.model('recharge_amount').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
