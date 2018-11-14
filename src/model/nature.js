module.exports = class extends think.Model {
  async get_name(id) {
    const name = await this.where({id: id}).getField('name', true);
    return name;
  }
};
