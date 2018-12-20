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
    let user = await this.model('wx_user').find(id);
    user = {
      id: user.id,
      real_name: user.real_name,
      sex: user.sex,
      nation: user.nation,
      age: user.age,
      birthday: global.dateformat('Y-m-d', user.birthday),
      politics: user.politics,
      tel: user.tel,
      school_id: user.school_id,
      major_id: user.major_id,
      grade_id: user.grade_id,
      class_id: user.class_id
    };
    const arr = [];
    let index = [];
    const schoolList = await this.model('school').where({display: 0, pid: 0}).field('id, name').order('sort ASC').select();
    arr.push(schoolList);
    for (const i in schoolList) {
      const item = schoolList[i];
      if (item.id == user.school_id) {
        index.push(i);
      }
    }
    const zyList = await this.model('school').where({display: 0, pid: user.school_id || schoolList[0].id}).field('id, name').order('sort ASC').select();
    arr.push(zyList);
    for (const i in zyList) {
      const item = zyList[i];
      if (item.id == user.major_id) {
        index.push(i);
      }
    }
    const njList = await this.model('school').where({display: 0, pid: user.major_id || zyList[0].id}).field('id, name').order('sort ASC').select();
    arr.push(njList);
    for (const i in njList) {
      const item = njList[i];
      if (item.id == user.grade_id) {
        index.push(i);
      }
    }
    const bjList = await this.model('school').where({display: 0, pid: user.grade_id || njList[0].id}).field('id, name').order('sort ASC').select();
    arr.push(bjList);
    for (const i in bjList) {
      const item = bjList[i];
      if (item.id == user.class_id) {
        index.push(i);
      }
    }
    const schoolNameList = [];
    const schoolIdList = [];
    for (const i in arr) {
      const item = arr[i];
      const nameArr = [];
      const idArr = [];
      for (const j in item) {
        const jtem = item[j];
        nameArr.push(jtem.name);
        idArr.push(jtem.id);
      }
      schoolNameList.push(nameArr);
      schoolIdList.push(idArr);
    }
    if (index.length == 0) {
      index = [0, 0, 0, 0];
    }
    const data = {
      user: user,
      schoolNameList: schoolNameList,
      schoolIdList: schoolIdList,
      index: index
    };
    return this.success(data);
  }

  /**
     * 修改用户信息
     * @returns {Promise<*>}
     */
  async updateAction() {
    const user = this.post('user');
    console.log(user);
    const res = await this.model('wx_user').where({id: user.id}).update(user);
    if (res) {
      return this.success(res);
    }
    return this.success(res);
  }
};
