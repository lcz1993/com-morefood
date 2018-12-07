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
  async indexAction() {
    const map = {};
    map.activity_name = '大转盘';
    const keyword = this.get('keyword');
    if (!think.isEmpty(keyword)) {
      map.activity_name = ['like', '%' + keyword + '%'];
    }
    const id = await this.model('activity').where({ activity_name: '大转盘' }).getField('id', true);
    const data = await this.model('activity').find(id);
    const prize = await this.model('activity_prize').where({ activity_id: id }).page(this.get('page') || 1, 5).order('id ASC').countSelect();
    console.log(prize);
    this.assign('prize', prize);
    const html = this.pagination(prize);
    this.assign('pagerData', html); // 分页展示使用
    this.assign('data', data);
    this.meta_title = '抽奖设置管理';
    await this.hook('adminEdit', 'activity_rules', data.activity_rules, {$hook_key: 'activity_rules', $hook_type: '1'});
    return this.display();
  }

  async addAction() {
    if (this.isPost) {
      const map = {};
      const data = this.post();
      map.type = data.type;
      map.activity_id = data.activity_id;
      map.prize_name = data.prize_name;
      map.prize_counts = data.prize_counts;
      map.prize_level = data.prize_level;
      map.percentage = data.percentage;
      map.create_time = Date.parse(new Date());
      map.member_id = this.user.uid;
      map.prize_pic = data.prize_pic;
      const res = await this.model('activity_prize').add(map);
      if (res) {
        return this.success({name: '添加成功！'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      this.meta_title = '积分商品添加';
      const id = await this.model('activity').where({ activity_name: '大转盘' }).getField('id', true);
      const data = await this.model('activity').find(id);
      this.assign('data', data);
      await this.hook('adminUpPic', 'prize_pic', '', {$hook_key: 'prize_pic'});
      return this.display();
    }
  }

  async editAction() {
    if (this.isPost) {
      const data = this.post();
      const res = await this.model('activity_prize').update(data);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/slyder_adventures/index'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const id = this.get('id');
      const data = await this.model('activity_prize').find(id);
      this.assign('data', data);
      this.meta_title = '活动商品编辑';
      await this.hook('adminUpPic', 'prize_pic', data.prize_pic, {$hook_key: 'prize_pic'});
      return this.display();
    }
  }

  async editActivityAction() {
    if (this.isPost) {
      const data = this.post();
      console.log(data);
      const a = data.start_time;
      const b = data.end_time;
      data.start_time = new Date(a.replace(/-/g, '/')).getTime();
      data.end_time = new Date(b.replace(/-/g, '/')).getTime();
      const res = await this.model('activity').update(data);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/slyder_adventures/index'});
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
    await this.model('activity_prize').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};