module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 获取初始化页面
     * @returns {Promise<*>}
     */
  async indexAction() {
    const id = this.getLoginUserId();
    const userArr = await this.model('wx_user').where({id: id}).select();
    const userList = [];
    for (const u of userArr) {
      const user = {
        id: u.id,
        real_name: u.real_name,
        sex: u.sex,
        nation: u.nation,
        age: u.age,
        birthday: u.birthday,
        politics: u.politics,
        tel: u.tel,
        index: [0, 0, 0, 0]
      };
      userList.push(user);
    }
    return this.success(userList);
  }

  /**
     * 根据ID获取
     * @returns {Promise<*>}
     */
  async getAction() {
    const id = this.get('id');
    const data = await this.model('wx_user').find(id);
    return this.success(data);
  }
};
