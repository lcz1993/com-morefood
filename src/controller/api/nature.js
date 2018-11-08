module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
  // 小程序首页初始化
  async indexAction() {
    const natureList = await this.model('nature').select();
    const natureArr = [];
    for (const i in natureList) {
      const nature = natureList[i];
      nature.imgUrl = global.get_pic(nature.icon);
      const n = {
        id: nature.id,
        name: nature.name,
        imgUrl: nature.imgUrl
      };
      natureArr.push(n);
    }
    return this.success(natureArr);
  }
};
