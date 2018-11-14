module.exports = class extends think.Model {
  async get_name(id) {
    const name = await this.getField('name', true);
    console.log(name);
    return name;
  }
};
