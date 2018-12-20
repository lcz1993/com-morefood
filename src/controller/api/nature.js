module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
  // 小程序首页初始化
  async indexAction() {
    const natureList = await this.model('nature').select();
    const natureArr = [];
    for (const i in natureList) {
      const nature = natureList[i];
      nature.imgUrl = await global.get_pic(nature.icon);
      const n = {
        id: nature.id,
        name: nature.name,
        imgUrl: nature.imgUrl
      };
      natureArr.push(n);
    }
    // 获取首页的图片
    // 顶部轮播图
    const images = this.config('setupapp.APP_TOP_IMAGE');
    // 顶部优惠券图片
    const disImg = this.config('setupapp.APP_DISCOUNT_IMG');
    // 左右侧透明背景图
    const leftImg = this.config('setupapp.APP_LEFT_IMG');
    const rightImg = this.config('setupapp.APP_RIGHT_IMG');
    const imgList = images.split(',');
    const imgArr = [];
    for (const img of imgList) {
      const a = await global.get_pic(img);
      imgArr.push(a);
    }
    const disImgPath = await global.get_pic(disImg);
    const leftImgPath = await global.get_pic(leftImg);
    const rightImgPath = await global.get_pic(rightImg);
    const data = {
      imgArr: imgArr,
      disImgPath: disImgPath,
      leftImgPath: leftImgPath,
      rightImgPath: rightImgPath,
      natureArr: natureArr
    };
    return this.success(data);
  }
};
