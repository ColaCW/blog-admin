/**
 * @Author: 焦质晔
 * @Date: 2019/6/20
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-05-08 17:46:50
 */
export default {
  systemName: '宝马DMS管理系统',
  maxCacheNum: 999, // 路由组件最大缓存数量
  notifyDuration: 3000, // 通知消息组件显示时间
  table: {
    pageNum: 1,
    pageSize: 20,
    serverSort: true,
    serverFilter: false
  },
  charts: {
    // 图例文字
    chartLegendSize: 14,
    // 饼状图文字
    chartSeriesSize: 14,
    // 柱状图 x/y 轴的文字
    chartXAxisSize: 14,
    chartYAxisSize: 14,
    // tooltip 的文字
    chartTooltipSize: 14
  }
};
