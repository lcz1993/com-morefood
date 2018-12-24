module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
  /**
     * 发表评论
     * @returns {Promise.<*|PreventPromise|void|Promise>}
     */
  async postAction() {
    let typeId = this.post('type_id');
    if (!typeId) {
      typeId = 0;
    }
    const orderGoodsId = this.post('orderGoodsId');
    // const valueId = this.post('valueId');
    const order = await this.model('order').find(orderGoodsId);
    const valueId = order.restaurant_id;
    const imgList = this.post('imgList');
    let status = '';
    if (imgList.length > 1) {
      status = 1;
    }
    const content = this.post('content');
    const buffer = Buffer.from(content);
    const insertId = await this.model('comment').add({
      type_id: typeId,
      value_id: valueId,
      content: buffer.toString('base64'),
      add_time: this.getTime(),
      status: status,
      user_id: this.getLoginUserId()
    });
    imgList.pop();
    for (let i = 0; i < imgList.length; i++) {
      const img = imgList[i].src;
      await this.model('comment_picture').add({
        comment_id: insertId,
        pic_url: img,
        sort_order: i
      });
    }
    await this.model('order').where({id: orderGoodsId}).update({
      status: 5
    });
    const yes = await this.model('comment').where({value_id: valueId, type_id: 0}).count();
    const count = await this.model('comment').where({value_id: valueId}).count();
    const score = yes / count / 2 * 10;
    await this.model('restaurant').where({id: valueId}).update({
      score: score.toFixed(1)
    });
    if (insertId) {
      return this.success('评论添加成功');
    } else {
      return this.fail('评论保存失败');
    }
  }
  async indexAction() {
    const id = this.get('id');
    const typeId = this.get('type_id');
    let currentPage = this.get('currentPage');
    let pageSize = this.get('pageSize');
    if (!pageSize) {
      pageSize = 10;
    }
    if (!currentPage) {
      currentPage = 1;
    } else {
      currentPage++;
    }
    const map = {};
    map.value_id = id;
    if (parseInt(typeId) === 3) {
      // 有图
      map.status = 1;
    } else if (parseInt(typeId) === 0 || parseInt(typeId) === 1) {
      map.type_id = typeId;
    }
    const commentList = await this.model('comment').where(map).order('id DESC').page(currentPage, pageSize).countSelect();
    const commList = [];
    for (const comment of commentList.data) {
      const comm = {};
      if (parseInt(comment.status) === 1) {
        const imgList = await this.model('comment_picture').where({comment_id: comment.id}).select();
        comm.picList = imgList;
      }
      const user = await this.model('wx_user').find(comment.user_id);
      comm.nickname = user.nickname;
      comm.headimgurl = user.headimgurl;
      comm.add_time = global.dateformat('Y-m-d H:i:s', comment.add_time * 1000);
      comm.content = Buffer.from(comment.content, 'base64').toString();
      commList.push(comm);
    }
    commentList.data = commList;
    const manyi = await this.model('comment').where({value_id: id, type_id: 0}).count('id');
    commentList.manyi = manyi;
    const bumanyi = await this.model('comment').where({value_id: id, type_id: 1}).count('id');
    commentList.bumanyi = bumanyi;
    const youtu = await this.model('comment').where({value_id: id, status: 1}).count('id');
    commentList.youtu = youtu;
    const quanbu = await this.model('comment').where({value_id: id}).count('id');
    commentList.quanbu = quanbu;
    return this.success(commentList);
  }
};
