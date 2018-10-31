const rp = require('request-promise');
const _ = require('lodash');

module.exports = class extends think.Service {
  async queryExpress(shipperCode, logisticCode, orderCode = '') {
    let expressInfo = {
      success: false,
      shipperCode: shipperCode,
      shipperName: '',
      logisticCode: logisticCode,
      isFinish: 0,
      traces: []
    };
    const fromData = this.generateFromData(shipperCode, logisticCode, orderCode);
    if (think.isEmpty(fromData)) {
      return expressInfo;
    }

    const sendOptions = {
      method: 'POST',
      url: think.config('express.request_url'),
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: fromData
    };

    try {
      const requestResult = await rp(sendOptions);
      if (think.isEmpty(requestResult)) {
        return expressInfo;
      }
      expressInfo = this.parseExpressResult(requestResult);
      expressInfo.shipperCode = shipperCode;
      expressInfo.logisticCode = logisticCode;
      return expressInfo;
    } catch (err) {
      return expressInfo;
    }
  }

  parseExpressResult(requestResult) {
    const expressInfo = {
      success: false,
      shipperCode: '',
      shipperName: '',
      logisticCode: '',
      isFinish: 0,
      traces: []
    };

    if (think.isEmpty(requestResult)) {
      return expressInfo;
    }

    try {
      if (_.isString(requestResult)) {
        requestResult = JSON.parse(requestResult);
      }
    } catch (err) {
      return expressInfo;
    }

    if (think.isEmpty(requestResult.Success)) {
      return expressInfo;
    }

    // 判断是否已签收
    if (Number.parseInt(requestResult.State) === 3) {
      expressInfo.isFinish = 1;
    }
    expressInfo.success = true;
    if (!think.isEmpty(requestResult.Traces) && Array.isArray(requestResult.Traces)) {
      expressInfo.traces = _.map(requestResult.Traces, item => {
        return { datetime: item.AcceptTime, content: item.AcceptStation };
      });
      _.reverse(expressInfo.traces);
    }
    return expressInfo;
  }

  generateFromData(shipperCode, logisticCode, orderCode) {
    const requestData = this.generateRequestData(shipperCode, logisticCode, orderCode);
    const fromData = {
      RequestData: encodeURI(requestData),
      EBusinessID: think.config('express.appid'),
      RequestType: '1002',
      DataSign: this.generateDataSign(requestData),
      DataType: '2'
    };
    return fromData;
  }

  generateRequestData(shipperCode, logisticCode, orderCode = '') {
    // 参数验证
    const requestData = {
      OrderCode: orderCode,
      ShipperCode: shipperCode,
      LogisticCode: logisticCode
    };
    return JSON.stringify(requestData);
  }

  generateDataSign(requestData) {
    return encodeURI(Buffer.from(think.md5(requestData + think.config('express.appkey'))).toString('base64'));
  }
  check_document_position(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
            req.connection.remoteAddress || // 判断 connection 的远程 IP
            req.socket.remoteAddress || // 判断后端的 socket 的 IP
            req.connection.socket.remoteAddress;
  }
  remove(array, value) {
    var len = array.length;
    for (var i = 0, n = 0; i < len; i++) { // 把出了要删除的元素赋值给新数组
      if (array[i].id != value.id) {
        array[n++] = array[i];
      }
    }
    array.length = n;
  };
};
