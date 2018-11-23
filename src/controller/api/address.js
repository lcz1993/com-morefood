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
    const schoolList = await this.model('school').where({display: 0}).order('sort ASC').select();
    const idArr = [];
    const nameArr = [];
    for (const item in schoolList) {
      const school = schoolList[item];
      idArr.push(school.id);
      nameArr.push(school.name);
    }
    const schoolArr = {
      id: idArr,
      name: nameArr
    };
    address.schoolArr = schoolArr;
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
    const schoolList = await this.model('school').where({display: 0}).order('sort ASC').select();
    const idArr = [];
    const nameArr = [];
    for (const item in schoolList) {
      const school = schoolList[item];
      idArr.push(school.id);
      nameArr.push(school.name);
    }
    const data = {
      id: idArr,
      name: nameArr
    };
    return this.success(data);
  }
};
