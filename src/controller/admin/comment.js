// 菜单列表
module.exports = class extends think.cmswing.admin {
  constructor(ctx) {
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    this.tactive = 'wxuser';
  }

  /**
     * __before action
     * @private
     */
  async __before() {
    await super.__before();
  }

  /**
     * index action
     * @return {Promise} []
     */
  async indexAction() {
    // 搜索
    const map = {};
    if (this.get('keyword')) {
      map.dish_name = ['like', '%' + this.get('keyword') + '%'];
    }
    const list = await this.model('comment').where(map).order('id DESC').page(this.get('page') || 1, 20).countSelect();
    const html = this.pagination(list);
    for (const i in list.data) {
      const comment = list.data[i];
      const restaurantName = await this.model('restaurant').where({id: comment.value_id}).getField('name', true);
      const nickname = await this.model('wx_user').where({id: comment.user_id}).getField('nickname', true);
      comment.content = Buffer.from(comment.content, 'base64').toString();
      comment.restaurantName = restaurantName;
      comment.nickname = nickname;
      if (comment.status == 1) {
        const imgList = [];
        const imgArr = await this.model('comment_picture').where({comment_id: comment.id}).select();
        for (const j in imgArr) {
          const item = imgArr[j];
          imgList.push(item.pic_url);
        }
        comment.imgList = imgList;
      }
    }
    this.assign('list', list);
    this.assign('pagerData', html); // 分页展示使用
    this.meta_title = '评论列表';
    return this.display();
  }
  /**
     * 删除评论
     */
  async delAction() {
    const ids = this.para('ids');
    if (think.isEmpty(ids)) {
      return this.fail('参数不能为空!');
    }
    // 删除话题
    await this.model('comment').where({id: ['IN', ids]}).delete();
    return this.success({name: '删除成功!'});
  }
};
