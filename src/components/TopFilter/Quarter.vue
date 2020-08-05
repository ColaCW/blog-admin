<template>
  <el-form-item :key="key" :label="label" :labelWidth="labelWidth" :prop="prop">
    <mark
      style="position:fixed;top:0;bottom:0;left:0;right:0;background:rgba(0,0,0,0);z-index:999;"
      v-show="showSeason"
      @click.stop="showSeason=false"
    ></mark>
    <el-tooltip
    style="border-color:#f8f8f8!important"
     effect="light" :disabled="showSeason">
      <el-input
        :placeholder="placeholder"
        v-model="showValue"
        style="width:100%"
        @focus="showSeason=true"
        clearable
      >
        <i slot="prefix" class="el-input__icon el-icon-date"></i>
      </el-input>
      <div slot="content" style="width: 400px">
        <div class="clearfix" style="text-align:center;padding:0;margin: 5px 0 15px 0">
          <button
            type="button"
            aria-label="前一年"
            class="el-picker-panel__icon-btn el-date-picker__prev-btn el-icon-d-arrow-left"
            @click="prev"
          ></button>
          <span role="button" class="el-date-picker__header-label">{{year}}年</span>
          <button
            type="button"
            aria-label="后一年"
            @click="next"
            class="el-picker-panel__icon-btn el-date-picker__next-btn el-icon-d-arrow-right"
          ></button>
        </div>
        <div class="text item" style="text-align:center;">
          <el-button
            v-for="(x,i) in showName"
            :key="i"
            type="text"
            size="medium"
            :disabled="disabled[i]"
            :class="curIndex ===i?'activetBtn':'defaultBtn'"
            @click="selectSeason(i)"
          >{{x}}</el-button>
        </div>
      </div>
    </el-tooltip>
  </el-form-item>
</template>
<script>
/**
 * @file:  View 组件 季节选择控件
 * @author: yonyou
 * @description: UI组件  可选择季节
 * @api: valueArr : 季度value defalut['01-03', '04-06', '07-09', '10-12'] 默认值待设置
 */
import moment from 'moment';
export default {
  props: {
    valueArr: {
      default: () => {
        return ['01-03', '04-06', '07-09', '10-12'];
      },
      type: Array
    },
    key: {
      defalut: 'Q1' + Math.random(),
      type: String
    },
    prop: {
      defalut: '',
      type: String
    },
    label: {
      defalut: '',
      type: String
    },
    labelWidth: {
      defalut: '',
      type: String
    },
    showName: {
      default: () => {
        return ['第一季度', '第二季度', '第三季度', '第四季度'];
      },
      type: Array
    },
    getValue: {
      default: (str, arr) => {}, // 201901-201903, ["2019-01-01 00:00:00", "2019-03-31 23:59:59"]
      type: Function
    },
    defaultValue: {
      default: [], // 201901-201903, ["2019-01-01 00:00:00", "2019-03-31 23:59:59"]
      type: [Array, String]
    },
    format: {
      default: 'yyyy 年 QQ 季度',
      type: String
    },
    placeholder: {
      default: '选择季度',
      type: String
    },
    disabled: {
      default: [],
      type: Array
    }
  },
  data() {
    return {
      showSeason: false,
      year: new Date().getFullYear(),
      showValue: '',
      curIndex: -1
    };
  },
  // created() {
  //   if (this.defaultValue) {
  //     let value = this.defaultValue;
  //     let arr = value.split('-');
  //     this.year = arr[0].slice(0, 4);
  //     let str = arr[0].slice(4, 6) + '-' + arr[1].slice(4, 6);
  //     let arrAll = this.valueArr;
  //     let index = arrAll.indexOf(str);
  //     this.curIndex = index;
  //     index != -1 && (this.showValue = this.format.replace('yyyy', this.year).replace('QQ', index + 1));
  //   }
  // },
  watch: {
    defaultValue: function(value, oldValue) {
      if (!value.length) {
        this.curIndex = -1;
        this.showValue = '';
        return;
      }
      let arr = value;
      let quarter;
      if (typeof value === 'string') {
        arr = value.split('-')
        this.year = moment(arr[0],'YYYYMM').year();
        quarter = moment(arr[0],'YYYYMM').quarter();
      }else{
        this.year = moment(arr[0]).year();
        quarter = moment(arr[0]).quarter();
      }
      this.curIndex = quarter - 1;
      this.showValue = this.format.replace('yyyy', this.year).replace('QQ', quarter);
      // console.log(arr, this.year,quarter,this.showValue)
    },
    showValue: function(value, oldValue) {
      !value && !oldValue && this.reset();
    }
  },
  methods: {
    one() {
      this.showSeason = false;
    },
    prev() {
      this.year = this.year * 1 - 1;
    },
    next() {
      this.year = this.year * 1 + 1;
    },
    selectSeason(i) {
      let arr = this.valueArr[i].split('-');
      this.getValue(this.year + arr[0] + '-' + this.year + arr[1], [
        this.year + '-' + arr[0] + '-01 00:00:00',
        this.year + '-' + arr[1] + (['03', '12'].includes(arr[1]) ? '-31' : '-30') + ' 23:59:59'
      ]);
      this.showSeason = false;
      this.curIndex = i;
      this.showValue = this.format.replace('yyyy', this.year).replace('QQ', i + 1);
    },
    reset() {
      this.getValue('', []);
    }
  },
  mounted() {}
};
</script>

<style lang="less">
body .el-tooltip__popper.is-light{
  border-color: #d8d8d8!important;
}
body .el-tooltip__popper .popper__arrow{
  display: none;
}
.defaultBtn {
  width: 24%;
  color: #606266 !important;
  margin-left: 0 !important;
  background-color: white !important;
}
.activetBtn {
  width: 24%;
  color: white !important;
  margin-left: 0 !important;
  background-color: #1890ff !important;
}
</style>
