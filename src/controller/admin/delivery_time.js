module.exports = class extends think.cmswing.admin {
  /**
     * index action
     * @return {Promise} []
     */
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    // 其他额外的操作
    this.tactive = 'order';
  }

  // eslint-disable-next-line semi

  // 配送时间段管理的数据查询
  async indexAction() {
    let str = '';
    let str1 = '';
    const list = await this.model('delivery_time').page(this.get('page') || 1, 20).order('id ASC').countSelect();
    for (const item in list.data) {
      const i = list.data[item];
      const s = i.goods_id.split(',');
      for (const b in s) {
        const c = s[b];
        const goods = await this.model('medu').where({id: c}).select();
        for (const g of goods) {
          str += g.dish_name + ',';
          str1 += g.image + ',';
          const d = {
            id: i.id,
            delivery_time: i.delivery_time,
            percent: i.percent,
            goods_name: str,
            goods_image: str1
          };
          list.data[item] = d;
        }
      }
    }
    const html = this.pagination(list);
    this.assign('pagerData', html); // 分页展示使用
    this.assign('list', list.data);
    this.meta_title = '配送时间管理';
    return this.display();
  }

  async addAction() {
    const restaurant_id = this.user.restaurant_id;
    if (this.isPost) {
      const data = this.post();
      console.log(data);
      const b = data.goods_id;
      const a = b.toString();
      console.log(a);
      const map = {};
      map.delivery_time = data.delivery_time;
      map.goods_id = a;
      map.restaurant_id = restaurant_id;
      const res = await this.model('delivery_time').add(map);
      if (res) {
        return this.success({name: '添加成功！', url: '/admin/delivery_time/index'});
      } else {
        return this.fail('添加失败!');
      }
    } else {
      const dishclass = await this.model('dish_class').where({ restaurant_id: restaurant_id }).order('sort ASC').select();
      for (const i of dishclass) {
        const medu = await this.model('medu').where({restaurant_id: restaurant_id, dish_class: i.id}).select();
        let goods = [];
        for (const a of medu) {
          goods.push({
            medu_id: i.id,
            medu_name: i.name,
            goods_id: a.id,
            goods_name: a.dish_name,
            goods_image: a.image
          });
        }
        i.goods = goods;
        goods = [];
      }
      this.assign('list', dishclass);
      this.meta_title = '新增配送时间';
      return this.display();
    }
  }

  async editAction() {
    const restaurant_id = this.user.restaurant_id;
    if (this.isPost) {
      const data = this.post();
      console.log(data);
      const b = data.goods_id;
      const a = b.toString();
      console.log(a);
      const map = {};
      map.delivery_time = data.delivery_time;
      map.goods_id = a;
      map.restaurant_id = restaurant_id;
      const res = await this.model('school').update(map);
      if (res) {
        return this.success({name: '修改成功！', url: '/admin/delivery_time/index'});
      } else {
        return this.fail('修改失败！');
      }
    } else {
      const dishclass = await this.model('dish_class').where({ restaurant_id: restaurant_id }).order('sort ASC').select();
      const id = this.get('id');
      const data = await this.model('delivery_time').find(id);
      const arr = data.goods_id.split(',');
      for (const i of dishclass) {
        const medu = await this.model('medu').where({restaurant_id: restaurant_id, dish_class: i.id}).select();
        let goods = [];
        for (const a of medu) {
          let flag = false;
          for (const s of arr) {
            if (s == a.id) {
              flag = true;
            }
          }
          if (flag) {
            goods.push({
              medu_id: i.id,
              medu_name: i.name,
              goods_id: a.id,
              goods_name: a.dish_name,
              goods_image: a.image,
              check: 1
            });
          } else {
            goods.push({
              medu_id: i.id,
              medu_name: i.name,
              goods_id: a.id,
              goods_name: a.dish_name,
              goods_image: a.image,
              check: 0
            });
          }
          // goods.push({
          //   medu_id: i.id,
          //   medu_name: i.name,
          //   goods_id: a.id,
          //   goods_name: a.dish_name,
          //   goods_image: a.image
          // });
        }
        i.goods = goods;
        goods = [];
      }
      data.dishclass = dishclass;
      this.assign('data', data);
      this.meta_title = '编辑';
      return this.display();
    }
  }
  async delAction() {
    const ids = this.para('ids');
    if (think.isEmpty(ids)) {
      return this.fail('参数不能为空!');
    }
    // 删除话题
    await this.model('delivery_time').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
