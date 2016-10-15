var job = require('./job');
var Qcloud = require('./qcloudeapi');
var DICT = {
  '新浪': 'http://www.sina.com.cn',
  '苹果': 'http://www.apple.com',
  'b站': 'http://www.bilibili.com',
  'b占': 'http://www.bilibili.com',
  '饿了么': 'http://www.ele.me',
  '饿了': 'http://www.ele.me',
  '淘宝': 'http://taobao.com',
  '知乎': 'http://www.zhihu.com',
  '膜拜': 'http://mobike.com',
  '微博': 'http://weibo.com'
};

module.exports = {
  analysis: function(content, cb) {
    Qcloud.lexicalAnalysis(content, cb);
  }
};