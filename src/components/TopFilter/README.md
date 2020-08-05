<h1 align="center">
  A Vue TopFilter Component by jzy
</h1>

#### TopFilter 组件调用

`组件的引用`

bashbashbashbash
# main.js
import TopFilter from '@/components/TopFilter';
Vue.use(TopFilter);
bashbashbash

`组件参数API`

- list{Array|头部筛选条件数组，支持动态赋值(数据数组必须是新的引用)}
- cols{Number|每行显示多小列，默认是 3，注意：只能是被 24 整除的值}
- rows{Number|收起状态显示行数，默认是 1}
- labelWidth{Number|label 标签的宽度，默认是 80}
- disabled{Boolean|是否禁用搜索按钮}
- collapse{Boolean|是否显示展开/收起按钮，默认是 true}
- isSubmitBtn{Boolean|是否显示搜索/重置按钮，默认是 true}
- isResetChange{Boolean|重置之后是否掉接口查询列表，默认是不查询 false}
- filterChange{Function|点击搜索按钮触发的事件，参数是搜索条件对象}
- resetChange{Function|点击搜索按钮触发的事件，参数是搜索条件对象}
- onCollapse{Function|展开-收起时的回调函数，状态变化时处罚，参数是当前状态}

`list 字段配置项`

- type{String|类型，支持 INPUT/INPUT_NUMBER/RANGE_INPUT_NUMBER/INPUT_TREE/SELECT/MULTIPLE_SELECT/CHECKBOX/MULTIPLE_CHECKBOX/DATE/RANGE_DATE/SEARCH_HELPER/SEARCH_HELPER_WEB/TEXT_AREA/INPUT_CASCADER/RADIO/SELECT_INPUT/VIN/MONEY/Color_Picker}
- label{String|标题，最好不超过 6 个字}
- labelWidth{String|表单域标签的的宽度，字符串类型，需要加单位(px),该参数对SELECT_INPUT无效}
- fieldName{String|字段名称 key}
- placeholder{String|提示文字}
- initialValue{String/Array|默认值   类型SELECT_INPUT中initialValue:{fieldName:''} 参考下面模板代码}
- style{Object|表单元素的 style}
- hidden{Boolean|是否隐藏该表单项}
- filterable{Boolean|是否开启下拉框的拼音头快速检索功能，默认 false}
- unitRender{Function|输入框的后置单位的渲染方法, 返回值是 JSX 节点，只对 INPUT 有效}
- readonly{Boolean|是否只读}
- disabled{Boolean|禁用}
- unitRenderDisabled{Boolean|unitRender自定义按钮是否可点击,unitRenderDisabled:false可点击}
- defaultColor{String|Color_Picker设置默认颜色，插件里默认颜色'#1C69D4'}
- defaultExpandAll{Boolean|是否默认展开所有节点，默认 true}
- clearable{Boolean|是否启用右侧清除按钮，只对 SELECT/MULTIPLE_SELECT 有效，默认开启}
- onFocus{Function|输入框获得焦点的事件}
- rows{Number|输入框行数，默认是 2，只对 TEXT_AREA 有效}
- maxlength{Number|最大输入长度，默认是 100，只对 TEXT_AREA 有效}
- dateType{String|日期控件的类型，只对 DATE 和 RANGE_DATE 生效，可选值为 date/datetime/exactdate/week/quarter/month/daterange/datetimerange/exactdaterange/monthrange}
- minDateTime{String|最小日期，小于该时间的日期段将被禁用}
- maxDateTime{String|最大日期，大于该时间的日期段将被禁用}
- triggerOnFocus{Boolean|获取光标不搜索，只对SEARCH_HELPER有效}
- options{Object|有些表单控件所需要的配置}
- change{Function|checkbox 或 select 值变化的回调}
- onInput{Function|INPUT 类型的对应的 input 事件}
- itemList{Array|下拉框(SELECT/MULTIPLE_SELECT)的数据，[{text: '', value: ''}]   SELECT_INPUT中结构为[{text: '', value: '',key:''}}
- rules{Array|表单验证规则，用法请参考 Element-Ui，支持自定义表单校验}
- render{Function|表单元素的渲染函数，返回值是 JSX 类型节点}
- selectWidth{String|只对SELECT_INPUT生效  控制下拉框的宽度 可以使用百分比和px 例’50%‘,'120px', 默认’100px‘}

`list -> options 配置项`

- options: {
  - &emsp;trueValue: {String/Number|CHECKBOX 选中后的值，默认是 '1'}
  - &emsp;falseValue: {String/Number|CHECKBOX 取消选中后的值，默认是 '0'}
  - &emsp;titles: {Array|级联选择器的标题，数组元素为字符串类型}
- }

`list -> labelOptions 配置项`

- labelOptions: {
  - &emsp;fieldName: {String|字段名称 key}
  - &emsp;initialValue: initialValue{String/Array|默认值}
  - &emsp;itemList: {Array|下拉框(SELECT)的数据，[{text: '', value: ''}]}
  - &emsp;style: {Object|表单元素的 style}
  - &emsp;disabled: {Boolean|禁用}
  - &emsp;change: {Function|checkbox 或 select 值变化的回调}
  - &emsp;type: {String| 可选值’TIPS‘,'SELECT','CHECKBOX'}
  - &emsp;label: {String| 该form表单对应的lable}
  - &emsp;contentSlot: {支持jsx语法或者String,使用方法看下面demo｜hover提示的参数:hover提示内容的自定义操作,只在type: 'TIPS'时生效}
  - &emsp;effect:{String|hover提示的参数:hover提示的亮度,可选值dark/light,默认light,只在type: 'TIPS'时生效}
  - &emsp;placementTooltip: {String|hover提示的参数:hover文字提示位置,默认top,可选值top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end,只在type: 'TIPS'时生效}
  - &emsp;popoverSlot: {支持jsx语法或者String,使用方法看下面demo｜click的弹框的内容,只在type: 'TIPS'时生效},
  - &emsp;popoverWidth: {String|click提示框的参数:最小值为150,默认300,只在type: 'TIPS'时生效}
  - &emsp;placementPopover: {String|click提示框的参数,出现位置:默认right,可选值为top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end,只在type: 'TIPS'时生效}   
- }

`list -> descOptions 配置项`

- descOptions: {
  - &emsp;isTooltip: {Boolean|是否以 Tooltip 形式显示描述信息}
  - &emsp;content: {String|描述信息内容}
  - &emsp;style: {Object|描述信息容器的 style}
- }
- 注意：描述信息会占据原有表单元素的部分空间，因此需要通过 list 配置项中的 style 来控制表单元素的宽度

`list -> SelectIconButton 配置项`
- SelectIconButton: {
  - &emsp;contentSlot: {支持jsx语法|自定义select旁边的按钮样式}
  - &emsp;style: {Object|描述信息容器的 style}
- }

`SEARCH_HELPER|SELECT|MULTIPLE_SELECT 配置项`

- request: {
  - &emsp;fetchApi: {Function|搜索帮助的接口函数}
  - &emsp;params: {Object|接口的默认参数}
  - &emsp;datakey: {String|服务端响应数据的数组列表的 key，支持路径操作('step1.step2.items')，不指定表示 res.data 就是数组数据}
  - &emsp;valueKey: {String|数据值的字段名}
  - &emsp;textKey: {String|数据文本的字段名}
  - &emsp;slots: {String|下拉选展示内容仅用SEARCH_HELPER，支持 value|text|valueText }
- }

`组件暴露的方法`

- SUBMIT_FORM{Function|获取所有表单控件数据的集合，返回值为表单数据}
- RESET_FORM{Function|重置表单控件}
- GET_FORM_DATA{Function|异步函数，获取表单数据，返回值为数组 [err, formData]}

`示例代码`

bashbashbashbash
# template
<template>
  <TopFilter :list="topFilterList" :cols="3" @filterChange="changeHandle"></TopFilter>
</template>

# js
import { selectInput } from '@/utils/validate'
export default {
  data() {
    return {
      topFilterList: this.createTopFilters()
    };
  },
  methods: {
    createTopFilters() {
      return [
        {
          type: 'INPUT',
          label: '搜索',
          fieldName: 'title',
          placeholder: '请输入标题名称...',
          initialValue: '',
          style: { width: '200px' },
          rules: [{ required: true, message: '请输入标题名称', trigger: 'blur' }, { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }]
        },
        {
          type: 'SELECT',
          label: '所属分类',
          fieldName: 'cid',
          placeholder: '所属分类',
          itemList: [{ text: '热点', value: '1' }, { text: '资讯', value: '2' }],
          rules: [{ required: true, message: '请选择所属分类', trigger: 'change' }]
        },
         {
          type: 'SELECT_INPUT',
          label: '发布状态',
          fieldName: 'status',
          placeholder: '请选择',
          initialValue:{   
            status:'',
          },
          selectWidth:'150px',  
          itemList: [
             {value: 'ceshi', text: '测试',key:'input'},  
            ],
            rules:[{ required: true,validator: selectInput, message: '请填写内容', trigger: 'change' }]
        },
        {
          label: '选择框+任意性搭配',
          type: 'INPUT',
          fieldName: 'arbitrary',
          rules: [{ required: true, message: '必填用户名', trigger: 'blur' }],
          labelOptions: { //此为上部分配置
            isChilden: true, //必须 
            type: 'SELECT', //必须
            fieldName: 'arbitrary1', //必须 名字同外围一样+1即可
            initialValue: 'name', //必须 默认选项
            itemList: [{ value: 'name', text: '用户名' }, { value: 'tel', text: '号码' }] //必须 静态数据即可 
          },
        },
         {
          type: 'INPUT',
          fieldName: 'employeeNo',
          labelOptions: {
            type: 'TIPS',
            label: '商业险',
            contentSlot:‘我是自定义内容1’, // 或this.suiyi()   //  内容的自定义操作
            effect: 'light', // dark/light  hover提示的亮度  默认light
            placementTooltip: 'top',
            popoverSlot:‘我是自定义内容2’, //或this.suiyi() 内容的自定义操作
            popoverWidth: '300',
            placementPopover: 'right',
          }
        },
      ];
    },
    suiyi () {
     let gridData = [{  // gridData 可以是后台获取的值
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }]
      return (
         <el-table data={gridData}>
          <el-table-column width="150" property="date" label="日期"></el-table-column>
          <el-table-column width="100" property="name" label="姓名"></el-table-column>
          <el-table-column width="300" property="address" label="地址"></el-table-column>
        </el-table>
      );
    },
    changeHandle(val){
      console.log('搜索的参数：', val)
    }
  }
};
bashbashbash
