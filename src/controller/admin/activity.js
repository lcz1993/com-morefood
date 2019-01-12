module.exports = class extends think.cmswing.admin {
  /**
     * index action
     * @return {Promise} []
     */
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    // 其他额外的操作
    this.tactive = 'setup';
  }
  // eslint-disable-next-line semi
  async indexAction() {
    const map = {};
    const keyword = this.get('keyword');
    if (!think.isEmpty(keyword)) {
      map.activity_name = ['like', '%' + keyword + '%'];
    }
    const list = await this.model('activity').where(map).page(this.get('page') || 1, 20).order('id ASC').countSelect();
    for (const item in list.data) {
      const i = list.data[item];
      console.log(i.id);
      const id = i.id;
      const member_id = i.member_id;
      const member_name = await this.model('member').where({ id: member_id }).getField('username', true);
      const prize = await this.model('activity_prize').where({ activity_id: id }).countSelect();
      console.log(prize.data.RowDataPacket);
      let str = '';
      for (const a of prize.data) {
        str += a.prize_name + '(' + a.prize_counts + '件 ,' + a.prize_level + ',' + '概率 ：' + a.percentage + '),';
      }
      const b = {
        id: i.id,
        activity_name: i.activity_name,
        start_time: i.start_time,
        end_time: i.end_time,
        status: i.status,
        times: i.times,
        member_name: member_name,
        prize: str
      };
      list.data[item] = b;
    }
    const html = this.pagination(list);
    this.assign('pagerData', html); // 分页展示使用
    this.assign('list', list);
    this.meta_title = '抽奖设置管理';
    return this.display();
  }

  async addAction() {
    if (this.isPost) {
      const map = {};
      const data = this.post();
      const start_time = new Date(data.start_time.replace(/-/g, '/')).getTime();
      const end_time = new Date(data.end_time.replace(/-/g, '/')).getTime();
      map.activity_name = data.name;
      map.start_time = start_time;
      map.end_time = end_time;
      map.create_time = Date.parse(new Date());
      console.log(Date.parse(new Date()));
      map.times = data.times;
      map.member_id = this.user.uid;
      map.activity_rules = data.activity_rules;
      if (start_time < Date.parse(new Date()) > end_time) {
        map.status = 0;
      } else if (new Date(data.end_time.replace(/-/g, '/')).getTime() < Date.parse(new Date())) {
        map.status = 1;
      } else {
        map.status = 2;
      }
      const res = await this.model('activity').add(map);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/activity/index'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      this.meta_title = '抽奖设置管理';
      await this.hook('adminEdit', 'activity_rules', '', {$hook_key: 'activity_rules'});
      return this.display();
    }
  }

  async editAction() {
    if (this.isPost) {
      const data = this.post();
      console.log(data);
      const a = data.start_time;
      const b = data.end_time;
      data.start_time = new Date(a.replace(/-/g, '/')).getTime();
      data.end_time = new Date(b.replace(/-/g, '/')).getTime();
      const res = await this.model('activity').update(data);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/activity/index'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const id = this.get('id');
      const data = await this.model('activity').find(id);
      this.assign('data', data);
      this.meta_title = '编辑';
      await this.hook('adminEdit', 'activity_rules', data.activity_rules, {$hook_key: 'activity_rules'});
      return this.display();
    }
  }
  async delAction() {
    const ids = this.para('ids');
    if (think.isEmpty(ids)) {
      return this.fail('参数不能为空!');
    }
    // 删除话题
    await this.model('activity').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
