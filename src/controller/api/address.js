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
  async indexAction() {
    const userId = this.get('userId');
    const addressArr = await this.model('address').where({user_id: userId}).select();
    const addressList = [];
    for (const address of addressArr) {
      let location = '';
      let a = await this.model('area').find(address.province);
      location += a.name;
      a = await this.model('area').find(address.city);
      location += a.name;
      a = await this.model('area').find(address.county);
      location += a.name;
      if (address.school_id) {
        a = await this.model('school').find(address.school_id);
        location += a.name;
      }
      location += address.addr;
      const b = {
        id: address.id,
        name: address.accept_name,
        gender: address.gender,
        tel: address.mobile,
        sign: address.sign,
        msg: location,
        is_default: address.is_default,
        province: address.province,
        city: address.city,
        county: address.county,
        school_id: address.school_id
      };
      addressList.push(b);
    }
    return this.success(addressList);
  }
  async saveAction() {
    const address = this.post('address');
    console.log(address);
    const userId = this.post('userId');
    const addressOld = await this.model('address').where({user_id: userId, is_default: 1}).select();
    if (addressOld.length > 0) {
      const a = addressOld[0];
      a.is_default = 0;
      const b = await this.model('address').update(a);
    }
    const data = {
      user_id: userId,
      accept_name: address.name,
      mobile: address.mobile,
      province: address.province,
      city: address.city,
      county: address.county,
      addr: address.address,
      is_default: address.is_default,
      gender: address.gender,
      school_id: address.school_id,
      sign: address.sign
    };
    const res = await this.model('address').add(data);
    if (res) {
      return this.success(res);
    } else {
      return this.fail();
    }
  }
  async delAction() {
    const addressId = this.post('addressId');
    const userId = this.post('userId');
    if (addressId) {
      const res = await this.model('address').where({id: addressId}).delete();
      const addressList = await this.model('address').where({user_id: userId}).select();
      if (res) {
        return this.success(addressList);
      } else {
        return this.fail();
      }
    } else {
      return this.fail();
    }
  }
  async getAction() {
    const id = this.get('id');
    if (!id) {
      return this.fail();
    }
    const address = await this.model('address').find(id);
    const region = [];
    let a = await this.model('area').find(address.province);
    region.push(a.name);
    a = await this.model('area').find(address.city);
    region.push(a.name);
    a = await this.model('area').find(address.county);
    region.push(a.name);
    address.region = region;
    let sc = {pid: address.school_id};
    do {
      sc.id = sc.pid;
      sc = await this.model('school').find(sc.id);
    } while (sc.pid != 0);
    const arr = [];
    const schoolList = await this.model('school').where({display: 0, pid: 0}).field('id, name').order('sort ASC').select();
    arr.push(schoolList);
    const zyList = await this.model('school').where({display: 0, pid: sc.id}).field('id, name').order('sort ASC').select();
    arr.push(zyList);
    const njList = await this.model('school').where({display: 0, pid: zyList[0].id}).field('id, name').order('sort ASC').select();
    arr.push(njList);
    const bjList = await this.model('school').where({display: 0, pid: njList[0].id}).field('id, name').order('sort ASC').select();
    arr.push(bjList);
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

    let schoolId = address.school_id;
    const index = [0, 0, 0, 0];
    let pid = 0;
    for (const i in schoolIdList[3]) {
      const item = schoolIdList[3][i];
      pid = await this.model('school').where({id: schoolId}).getField('pid', true);
      if (item == schoolId) {
        index[3] = i;
        schoolId = pid;
      }
    }
    for (const i in schoolIdList[2]) {
      const item = schoolIdList[2][i];
      pid = await this.model('school').where({id: schoolId}).getField('pid', true);
      if (item == schoolId) {
        index[2] = i;
        schoolId = pid;
      }
    }
    for (const i in schoolIdList[1]) {
      const item = schoolIdList[1][i];
      pid = await this.model('school').where({id: schoolId}).getField('pid', true);
      if (item == schoolId) {
        index[1] = i;
        schoolId = pid;
      }
    }
    for (const i in schoolIdList[0]) {
      const item = schoolIdList[0][i];
      if (item == schoolId) {
        index[0] = i;
        schoolId = pid;
      }
    }
    console.log(index);
    const school = {
      schoolNameList: schoolNameList,
      schoolIdList: schoolIdList,
      index: index
    };
    address.schoolArr = school;
    return this.success(address);
  }
  async editAction() {
    const address = this.post('address');
    const userId = this.post('userId');
    const addressOld = await this.model('address').where({user_id: userId, is_default: 1}).select();
    if (addressOld.length > 0) {
      const a = addressOld[0];
      a.is_default = 0;
      const b = await this.model('address').update(a);
    }
    const data = {
      id: address.id,
      user_id: userId,
      accept_name: address.name,
      mobile: address.mobile,
      province: address.province,
      city: address.city,
      county: address.county,
      addr: address.address,
      is_default: address.is_default,
      gender: address.gender,
      school_id: address.school_id,
      sign: address.sign
    };
    const res = await this.model('address').update(data);
    if (res) {
      return this.success(res);
    } else {
      return this.fail();
    }
  }

  /**
     * 获取学校数组集合
     * @returns {Promise<void>}
     */
  async schoolAction() {
    const id = this.get('id');
    const grade = parseInt(this.get('grade'));
    const arr = [];
    let zyList = [], njList = [], bjList = [], schoolList = [];
    switch (grade) {
      case 2:
        bjList = await this.model('school').where({display: 0, pid: id || njList[0].id}).field('id, name').order('sort ASC').select();
        arr.push(bjList);
        break;
      case 1:
        njList = await this.model('school').where({display: 0, pid: id || zyList[0].id}).field('id, name').order('sort ASC').select();
        arr.push(njList);
        bjList = await this.model('school').where({display: 0, pid: njList[0].id}).field('id, name').order('sort ASC').select();
        arr.push(bjList);
        break;
      case 0:
        zyList = await this.model('school').where({display: 0, pid: id || schoolList[0].id}).field('id, name').order('sort ASC').select();
        arr.push(zyList);
        njList = await this.model('school').where({display: 0, pid: zyList[0].id}).field('id, name').order('sort ASC').select();
        arr.push(njList);
        bjList = await this.model('school').where({display: 0, pid: njList[0].id}).field('id, name').order('sort ASC').select();
        arr.push(bjList);
        break;
      default:
        schoolList = await this.model('school').where({display: 0, pid: 0}).field('id, name').order('sort ASC').select();
        arr.push(schoolList);
        zyList = await this.model('school').where({display: 0, pid: schoolList[0].id}).field('id, name').order('sort ASC').select();
        arr.push(zyList);
        njList = await this.model('school').where({display: 0, pid: zyList[0].id}).field('id, name').order('sort ASC').select();
        arr.push(njList);
        bjList = await this.model('school').where({display: 0, pid: njList[0].id}).field('id, name').order('sort ASC').select();
        arr.push(bjList);
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
    const school = {
      schoolNameList: schoolNameList,
      schoolIdList: schoolIdList
    };
    console.log(school);
    return this.success(school);
  }
};
