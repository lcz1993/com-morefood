module.exports = class extends think.Model {
  /**
     * 根据用户ID获取用户昵称
     * @param  integer $uid 用户ID
     * @return string       用户昵称
     */

  async get_wxname(id) {
    id = id || 0;
    // TODO 缓存处理后续
    let name;
    // 设置缓存 key 为 username，有效期为 2 个小时
    const info = await this.field('nickname').find(id);
    // console.log(info);
    name = info.nickname;
    console.log(name);
    return name;
  }
};
