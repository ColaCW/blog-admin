<script>
/**
 * @Author: maguangyuan
 * @Date: 2019-06-20 10:00:00
 * @Last Modified by: maguangyuan
 * @Last Modified time: 2020-03-26 17:15:27
 **/
import _ from 'lodash';

export default {
  name: 'Calculator',
  props: {
    option:{
      type: Object,
      default: function(){
        return {}
      }
    }
  },
  data() {
    return {
      preValue: 0,
      checked: false,
      numberReg: /^\-?\d+(\.\d+)?$/,
      timer: null
    };
  },
  watch: {
  },
  mounted() {
    let { initialValue = 0, checked = false, change = () => {}} = this.option;
    this.checked = checked;
    this.preValue = initialValue;
  },
  methods: {
    outputValue() {
      let { rawValue = 0 } = this.option;
      console.log(rawValue, this.preValue);
      let result = rawValue;
      if (this.checked) {
        // 百分比
        result = rawValue * (100 - Number(this.preValue)) / 100;
      } else {
        // 值减
        result = rawValue - Number(this.preValue);
      }
      this.preValue = 0;
      this.$emit('change', result);
      this.$emit('close', false);
    },
    validataNumber(val) {
      // step3的位置不可变动
      if (this.numberReg.test(val)) {
        // step1
        this.preValue = Number(val)
      } else if(/\-/.test(val)) {
        // step2.0
        this.preValue = `-${val.split('-')[1]}`;
      } else if(/\./.test(val)) {
        // step2.1
        this.preValue = `${val.split('.')[0]}.`;
      } else if (String(val).length > 0 && ![undefined,null,'','undefined','null'].includes(val)) {
        // step3
        return this.validataNumber(String(val).slice(0, -1))
      } else {
        // step4
        this.preValue = 0;
      }
    }
  },
  render() {
    return (
      <div class="cyx-caculator">
        <label>报价计算器</label>
        <div class="cyx-input">
          <span>减</span>
          <el-input value={this.preValue} onInput={val => {
            if (this.timer) {
              clearTimeout(this.timer);
              this.timer = null;
            }
            this.preValue = val;
            this.timer = setTimeout(()=>{
              this.validataNumber(val);
            },200)
          }}></el-input>
        </div>
        <el-checkbox v-model={this.checked}>百分比</el-checkbox>
        <el-button type="primary" class="cyx-button" onClick={()=>{this.outputValue()}}>计算</el-button>
      </div>
    );
  }
};
</script>

<style lang="less" scoped>
.cyx-caculator{
  position: absolute;
  background: #FFF;
  border: 1px solid;
  border-radius: 4px;
  top: 0;
  right: 0;
  min-width: 100px;
  min-height: 100px;
  transform: translate(0%, -50%);
  text-align: left;
  width: auto;
  height: auto;
  padding: 10px;
  z-index: 10;
  .cyx-input{
    display: inline-flex;
  }
  .cyx-button{
    display: block;
    transform: translate(-50% , 0);
    left: 50%;
    position: relative;
  }
}
</style>
