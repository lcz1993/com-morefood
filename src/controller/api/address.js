module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
  // 获取省市三级联动
  async getareaAction() {
    const pid = this.get('pid');
    const area = await this.model('area').where({parent_id: pid}).select();
    return this.json(area);
  }
};
