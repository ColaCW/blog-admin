<script>
import _ from 'lodash';
import moment from 'moment';
import pinyin, { STYLE_FIRST_LETTER } from '@/components/Pinyin/index';
import Cascader from '@/components/FormPanel/Cascader.vue';
import Quarter from './Quarter';
import ColorPicker from '@/components/FormPanel/ColorPicker';

export default {
  name: 'TopFilter',
  props: {
    list: {
      type: Array,
      required: true
    },
    rows: {
      type: Number,
      default: 1
    },
    cols: {
      type: Number,
      default: 4
    },
    btnPaddingTop: {
      type: [Number, String],
      default: '30px'
    },
    labelWidth: {
      type: [Number, String],
      default: 80
    },
    disabled: {
      type: Boolean,
      default: false
    },
    collapse: {
      type: Boolean,
      default: true
    },
    isSubmitBtn: {
      type: Boolean,
      default: true
    },
    isResetChange: {
      type: Boolean,
      default: false
    }
  },
  data() {
    this.treeProps = { children: 'children', label: 'text' };
    this.prevForm = null;
    this.arrayTypes = ['RANGE_DATE', 'RANGE_INPUT_NUMBER', 'MULTIPLE_SELECT', 'MULTIPLE_CHECKBOX'];
    return {
      form: {},
      expand: false, // 展开收起状态
      visible: {},
      aa: ''
    };
  },
  computed: {
    fieldNames() {
      return this.list
        .filter(x => !x.hidden)
        .map(x => x.fieldName)
        .filter(x => !!x);
    },
    formItemList() {
      const res = [];
      this.list
        .filter(x => !x.hidden && x.fieldName)
        .forEach(x => {
          if (_.isObject(x.labelOptions) && x.labelOptions.fieldName) {
            res.push(x.labelOptions);
          }
          res.push(x);
        });
      return res;
    },
    rules() {
      const target = {};
      this.list
        .filter(x => !x.hidden)
        .forEach(x => {
          if (!(x.fieldName && x.rules)) return;
          target[x.fieldName] = x.rules;
        });
      return target;
    }
  },
  watch: {
    formItemList: {
      handler(nextProps, prevProps) {
        if (nextProps.length !== prevProps.length) {
          this.initialHandle();
        }
        this.debounce(this.resetFormData, 10)(nextProps);
      },
      deep: true
    },
    form: {
      handler(nextProps) {
        const res = this.difference(nextProps, this.prevForm);
        if (!Object.keys(res).length) return;
        for (let key in res) {
          let target = this.formItemList.find(x => x.fieldName === key);
          if (!target) continue;
          // 同步 initialValue 的值
          target.initialValue = res[key];
        }
        this.prevForm = { ...nextProps };
      },
      deep: true
    },
    fieldNames(nextProps, prevProps) {
      if (!_.isEqual(nextProps, prevProps)) {
        this.initialHandle();
      }
      this.$nextTick(() => this.doClearValidate(this.$refs.form));
    },
    expand(val) {
      if (!this.collapse) return;
      this.$emit('onCollapse', val);
    }
  },
  created() {
    this.initialHandle();
  },
  methods: {
    ss(val) {
      console.log(val);
    },
    initialHandle() {
      this.form = this.createFormData();
      this.prevForm = { ...this.form };
    },
    getInitialValue(item) {
      let { initialValue, type = '', fieldName } = item;
      if (this.arrayTypes.includes(type)) {
        initialValue = initialValue || [];
      }
      // 树选择器
      if (type === 'INPUT_TREE' && _.isUndefined(this[`${fieldName}TreeFilterTexts`])) {
        this[`${fieldName}TreeFilterTexts`] = '';
      }
      // 级联选择器
      if (type === 'INPUT_CASCADER' && _.isUndefined(this[`${fieldName}CascaderTexts`])) {
        this[`${fieldName}CascaderTexts`] = '';
      }
      return initialValue;
    },
    createFormData() {
      const target = {};
      this.formItemList.forEach(x => {
        const val = this.getInitialValue(x);
        // 设置 initialValue 为响应式数据
        this.$set(x, 'initialValue', val);
        // 初始值
        target[x.fieldName] = val;
      });
      return target;
    },
    resetFormData(list) {
      list.forEach(x => {
        if (_.isEqual(x.initialValue, this.form[x.fieldName])) return;
        this.form[x.fieldName] = this.getInitialValue(x);
        // 对组件外 js 动态赋值的表单元素进行校验
        this.doFormItemValidate(x.fieldName);
      });
    },
    createFormItemLabel(option) {
      const { form } = this;
      const {
        label,
        type,
        fieldName,
        itemList,
        options = {},
        style = {},
        disabled,
        change = () => {},
        effect = 'light',
        placementTooltip = 'top',
        popoverSlot,
        popoverWidth,
        placementPopover = 'left',
        contentSlot
      } = option;
      const { trueValue = '1', falseValue = '0' } = options;
      return (
        <div class="label-wrap" style={{ ...style }}>
          {type === 'SELECT' && (
            <el-select v-model={form[fieldName]} placeholder={''} disabled={disabled} onChange={change}>
              {itemList.map(x => (
                <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />
              ))}
            </el-select>
          )}
          {type === 'CHECKBOX' && (
            <span style="vertical-align: middle">
              <span class="desc-text" style={{ paddingRight: '10px' }}>
                {label}
              </span>
              <el-checkbox v-model={form[fieldName]} trueLabel={trueValue} falseLabel={falseValue} disabled={disabled} onChange={change} />
            </span>
          )}
          {type === 'TIPS' && (
            <span style="vertical-align: middle">
              <span class="desc-text" style={{ paddingRight: '10px' }}>
                {label}
              </span>
              <span>
                <el-popover placement={placementPopover} width={popoverWidth} trigger="click">
                  {popoverSlot}
                  <el-tooltip slot="reference" placement={placementTooltip} effect={effect}>
                    <div slot="content" class="desc-text">
                      {contentSlot}
                    </div>
                    <i class="bmwIcon iconbmw_apps_info_def_b" />
                  </el-tooltip>
                </el-popover>
              </span>
            </span>
          )}
        </div>
      );
    },
    createSelectIconButton(option) {
      if (!option) return null;
      const { style = {}, contentSlot } = option;
      return (
        <span class="desc-text" style={{ flex: '1 0 auto', ...style }}>
          {contentSlot}
        </span>
      );
    },
    createFormItemDesc(option) {
      if (!option) return null;
      const { isTooltip, style = {}, content = '描述信息...' } = option;
      if (isTooltip) {
        return (
          <el-tooltip effect="dark" style={{ ...style }} content={content} placement="right">
            <i class="desc-icon bmwIcon iconbmw_apps_info_def_b" />
          </el-tooltip>
        );
      }
      return (
        <span class="desc-text" style={{ paddingLeft: '10px', ...style }}>
          {content}
        </span>
      );
    },
    RENDER_FORM_ITEM(option) {
      const { label, fieldName, labelWidth, labelOptions, style = {}, render = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <div class="desc-text" style={{ ...style }}>
            {render()}
          </div>
        </el-form-item>
      );
    },
    VIN(option) {
      const { form } = this;
      const {
        label,
        fieldName,
        labelWidth,
        labelOptions,
        descOptions,
        style = {},
        placeholder = '请输入...',
        unitRender,
        numberFormat,
        readonly,
        disabled,
        unitRenderDisabled,
        change = () => {},
        onInput = () => {},
        onFocus = () => {}
      } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-input
            v-model={form[fieldName]}
            placeholder={placeholder}
            readonly={readonly}
            disabled={disabled}
            style={{ ...style }}
            maxlength="20"
            onChange={val => {
              form[fieldName] = val.trim();
              change(form[fieldName]);
            }}
            onInput={val => {
              val = val.replace(/[^[\d|a-zA-Z|-]/g, '');
              var arr = val.replace(/-/g, '').split('');
              for (var i = 0; i < arr.length; i++) {
                if (i === 2 || i === 6 || i === 9) {
                  arr[i] += '-';
                }
              }
              form[fieldName] = arr
                .join('')
                .toUpperCase()
                .trim();
              onInput(val);
            }}
            onFocus={onFocus}
            nativeOnKeydown={this.enterEventHandle}
          >
            {unitRender && <template slot="append">{<div style={unitRenderDisabled === false ? null : disabled && { pointerEvents: 'none' }}>{unitRender()}</div>}</template>}
          </el-input>
          {this.createFormItemDesc(descOptions)}
        </el-form-item>
      );
    },
    MONEY(option) {
      return this.INPUT({ ...option, numberFormat: true });
    },
    INPUT(option) {
      const { form } = this;
      const {
        label,
        fieldName,
        labelWidth,
        labelOptions,
        descOptions,
        style = {},
        placeholder = '请输入...',
        unitRender,
        numberFormat,
        readonly,
        maxlength,
        disabled,
        unitRenderDisabled,
        change = () => {},
        onInput = () => {},
        onBlur = () => {},
        onFocus = () => {}
      } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-input
            v-model={form[fieldName]}
            value={form[fieldName]}
            placeholder={placeholder}
            readonly={readonly}
            disabled={disabled}
            style={{ ...style }}
            maxlength={maxlength}
            clearable
            onChange={val => {
              form[fieldName] = val.trim();
              change(form[fieldName]);
            }}
            onInput={val => {
              if (numberFormat) {
                val = val.replace(/[^\d.]/g, '');
                form[fieldName] = this.formatNumber(val).trim();
              } else {
                form[fieldName] = val.trim();
              }
              onInput(val);
            }}
            onBlur={val => {
              onBlur(form[fieldName]);
            }}
            onFocus={onFocus}
            nativeOnKeydown={this.enterEventHandle}
          >
            {unitRender && <template slot="append">{<div style={unitRenderDisabled === false ? null : disabled && { pointerEvents: 'none' }}>{unitRender()}</div>}</template>}
          </el-input>
          {this.createFormItemDesc(descOptions)}
        </el-form-item>
      );
    },
    INPUT_NUMBER(option) {
      const { form } = this;
      const {
        label,
        fieldName,
        labelWidth,
        labelOptions,
        unitRender,
        descOptions,
        style = {},
        placeholder = '请输入...',
        disabled,
        unitRenderDisabled,
        min = 0,
        max = 99999999,
        step = 1,
        precision,
        change = () => {}
      } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <div class="diyComplete">
            <el-input-number
              v-model={form[fieldName]}
              placeholder={placeholder}
              disabled={disabled}
              style={{ ...style }}
              controls-position="right"
              min={min}
              max={max}
              step={step}
              precision={precision}
              clearable
              onChange={change}
              nativeOnKeydown={this.enterEventHandle}
            />
            {unitRender && <template class="diyCompleteBtn">{<div style={unitRenderDisabled === false ? null : disabled && { pointerEvents: 'none' }}>{unitRender()}</div>}</template>}
          </div>
          {this.createFormItemDesc(descOptions)}
        </el-form-item>
      );
    },
    RANGE_INPUT_NUMBER(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, min = 0, max = 99999999, step = 1, precision, readonly, disabled, change = () => {} } = option;
      const [startVal, endVal] = form[fieldName];
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-input-number
            v-model={form[fieldName][0]}
            controls-position="right"
            min={min}
            max={endVal}
            step={step}
            precision={precision}
            readonly={readonly}
            disabled={disabled}
            style={{ width: `calc(50% - 7px)` }}
            clearable
            onChange={() => change(form[fieldName])}
          />
          <span style="display: inline-block; text-align: center; width: 14px;">-</span>
          <el-input-number
            v-model={form[fieldName][1]}
            controls-position="right"
            min={startVal}
            max={max}
            step={step}
            precision={precision}
            readonly={readonly}
            disabled={disabled}
            style={{ width: `calc(50% - 7px)` }}
            clearable
            onChange={() => change(form[fieldName])}
          />
        </el-form-item>
      );
    },
    INPUT_TREE(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, itemList, style = {}, placeholder = '请输入...', readonly, disabled, defaultExpandAll, change = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-popover
            v-model={this.visible[fieldName]}
            popper-class="input-tree"
            transition="el-zoom-in-top"
            placement="bottom-start"
            trigger="click"
            on-after-leave={() => {
              this[`${fieldName}TreeFilterTexts`] = '';
              this.treeFilterTextHandle(fieldName);
            }}
          >
            <div class="el-input--small input-tree-wrap" style={{ maxHeight: '250px', overflowY: 'auto', ...style }}>
              <input
                value={this[`${fieldName}TreeFilterTexts`]}
                class="el-input__inner"
                placeholder="树节点过滤"
                onInput={ev => {
                  this[`${fieldName}TreeFilterTexts`] = ev.target.value;
                  this.treeFilterTextHandle(fieldName);
                }}
              />
              <el-tree
                ref={`tree-${fieldName}`}
                style={{ marginTop: '4px' }}
                data={itemList}
                props={this.treeProps}
                defaultExpandAll={!defaultExpandAll}
                expandOnClickNode={false}
                filterNodeMethod={this.filterNodeHandle}
                on-node-click={data => {
                  this.treeNodeClickHandle(fieldName, data);
                  change(this.form[fieldName]);
                }}
              />
            </div>
            <el-input
              slot="reference"
              value={this.createInputTreeValue(fieldName, itemList)}
              placeholder={placeholder}
              readonly={readonly}
              disabled={disabled}
              clearable
              style={disabled && { pointerEvents: 'none' }}
              onClear={() => {
                this.treeNodeClickHandle(fieldName, {});
                change(this.form[fieldName]);
              }}
              nativeOnKeydown={this.enterEventHandle}
            />
          </el-popover>
        </el-form-item>
      );
    },
    INPUT_CASCADER(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, itemList = [], options = {}, style = {}, placeholder = '请选择...', readonly, disabled, change = () => {} } = option;
      const { titles = [] } = options;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-popover v-model={this.visible[fieldName]} transition="el-zoom-in-top" placement="bottom-start" trigger="click">
            <div id={'elPop' + fieldName} style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'hidden', ...style }}>
              <Cascader
                value={form[fieldName]}
                onInput={val => {
                  this.cascaderChangeHandle(fieldName, val);
                }}
                list={itemList}
                labels={titles}
                style={style}
                onChange={data => {
                  this.cascaderChangeHandle(fieldName, data);
                  change(form[fieldName], this[`${fieldName}CascaderTexts`], data);
                  this.checkWidth('elPop' + fieldName);
                }}
                onClose={() => (this.visible[fieldName] = false)}
              />
            </div>
            <el-input
              slot="reference"
              value={this[`${fieldName}CascaderTexts`]}
              placeholder={placeholder}
              readonly={readonly}
              disabled={disabled}
              clearable
              style={disabled && { pointerEvents: 'none' }}
              onClear={() => {
                this.cascaderChangeHandle(fieldName, []);
                change(form[fieldName], this[`${fieldName}CascaderTexts`]);
              }}
            />
          </el-popover>
        </el-form-item>
      );
    },
    SEARCH_HELPER(option) {
      const { form } = this;
      const {
        label,
        fieldName,
        labelWidth,
        unitRender,
        triggerOnFocus = false,
        labelOptions,
        request = {},
        style = {},
        placeholder = '请输入...',
        disabled,
        unitRenderDisabled,
        change = () => {},
        select = () => {}
      } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          <div class="diyComplete">
            {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
            <el-autocomplete
              v-model={form[fieldName]}
              placeholder={placeholder}
              disabled={disabled}
              style={{ ...style }}
              valueKey={fieldName}
              clearable
              triggerOnFocus={triggerOnFocus}
              onChange={change}
              onSelect={select}
              nativeOnKeydown={this.enterEventHandle}
              fetchSuggestions={(queryString, cb) => this.querySearchAsync(request, fieldName, queryString, cb)}
              scopedSlots={{
                default: props => {
                  const { item } = props;
                  if (request.slots === 'value') {
                    return <span style="font-size:12px">{item[request.valueKey]}</span>;
                  } else if (request.slots === 'valueText') {
                    return (
                      <span style="font-size:12px">
                        {item[request.valueKey]}
                        <i style="padding-left:10px">{item[request.textKey]}</i>
                      </span>
                    );
                  } else {
                    return <span style="font-size:12px">{item[request.textKey]}</span>;
                  }
                }
              }}
            />
            {unitRender && <template class="diyCompleteBtn">{<div style={unitRenderDisabled === false ? null : disabled && { pointerEvents: 'none' }}>{unitRender()}</div>}</template>}
          </div>
        </el-form-item>
      );
    },
    Color_Picker(option) {
      const { form } = this;
      const { label, fieldName, defaultColor, labelWidth, labelOptions, placeholder = '请输入...', disabled, change = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <ColorPicker v-model={form[fieldName]} defaultColor={defaultColor} disabled={disabled} onChange={change} />
        </el-form-item>
      );
    },
    SEARCH_HELPER_WEB(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, itemList, labelOptions, style = {}, placeholder = '请输入...', disabled, change = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-autocomplete
            v-model={form[fieldName]}
            valueKey="text"
            placeholder={placeholder}
            disabled={disabled}
            style={{ ...style }}
            clearable
            onChange={change}
            nativeOnKeydown={this.enterEventHandle}
            fetchSuggestions={(queryString, cb) => this.querySearchHandle(fieldName, queryString, cb)}
            scopedSlots={{
              default: props => {
                const { item } = props;
                return <span>{item.text}</span>;
              }
            }}
          />
        </el-form-item>
      );
    },
    SELECT(option) {
      return this.createSelectHandle(option);
    },
    MULTIPLE_SELECT(option) {
      return this.createSelectHandle(option, true);
    },
    SELECT_INPUT(option) {
      return this.createSelectinputHandle(option);
    },
    DATE(option) {
      const { form } = this;
      const conf = {
        date: {
          placeholder: '选择日期',
          valueFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        datetime: {
          placeholder: '选择时间',
          valueFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        exactdate: {
          placeholder: '选择日期',
          valueFormat: 'yyyy-MM-dd'
        },
        week: {
          placeholder: '选择周',
          valueFormat: 'yyyy 年 MM 月 第 WW 周'
        },
        quarter: {
          placeholder: '选择季度',
          valueFormat: 'yyyy 年 QQ 季度'
        },
        month: {
          placeholder: '选择月份',
          valueFormat: 'yyyy-MM'
        },
        year: {
          placeholder: '选择年份',
          valueFormat: 'yyyy'
        }
      };
      const { label, fieldName, labelWidth, labelOptions, dateType = 'date', minDateTime, maxDateTime, style = {}, disabled, firstDayOfWeek, change = () => {} } = option;
      if (dateType === 'quarter') {
        let computedDisabled = [];
        if (typeof disabled === 'boolean') {
          computedDisabled = [disabled, disabled, disabled, disabled];
        } else if (typeof disabled === 'array') {
          computedDisabled = disabled;
        }
        return (
          <Quarter
            ref={fieldName + 'Quarter'}
            key={fieldName}
            label={label}
            labelWidth={labelWidth}
            prop={fieldName}
            format={conf[dateType].valueFormat}
            disabled={computedDisabled}
            defaultValue={form[fieldName]}
            getValue={(str, arr) => {
              form[fieldName] = str;
              change(arr, form[fieldName]);
            }}
          />
        );
      } else if (dateType === 'week') {
        return (
          <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
            {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
            <el-date-picker
              type={dateType.replace('exact', '')}
              v-model={form[fieldName]}
              format={conf[dateType].valueFormat}
              placeholder={conf[dateType].placeholder}
              disabled={disabled}
              style={{ ...style }}
              picker-options={{
                firstDayOfWeek: firstDayOfWeek || 7
              }}
              onChange={m => {
                form[fieldName] = m;
                change(
                  [
                    moment(m)
                      .startOf('week')
                      .format('YYYY-MM-DD HH:mm:ss'),
                    moment(m)
                      .endOf('week')
                      .format('YYYY-MM-DD HH:mm:ss')
                  ],
                  form[fieldName]
                );
              }}
            />
          </el-form-item>
        );
      }
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-date-picker
            type={dateType.replace('exact', '')}
            value={this.formatDate(form[fieldName], conf[dateType].valueFormat)}
            onInput={val => {
              val = val === null ? undefined : val;
              form[fieldName] = val;
            }}
            value-format={conf[dateType].valueFormat}
            placeholder={conf[dateType].placeholder}
            disabled={disabled}
            style={{ ...style }}
            picker-options={{
              disabledDate: time => {
                return this.setDisabledDate(time, [minDateTime, maxDateTime]);
              },
              firstDayOfWeek: firstDayOfWeek || 7
            }}
            onChange={() => change(form[fieldName])}
          />
        </el-form-item>
      );
    },
    // DATE_TIME -> 为了兼容旧版控件类型参数
    DATE_TIME(option) {
      return this.DATE({ ...option, dateType: 'datetime' });
    },
    RANGE_DATE(option) {
      const { form } = this;
      const conf = {
        daterange: {
          placeholder: ['开始日期', '结束日期'],
          valueFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        datetimerange: {
          placeholder: ['开始时间', '结束时间'],
          valueFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        exactdaterange: {
          placeholder: ['开始日期', '结束日期'],
          valueFormat: 'yyyy-MM-dd'
        },
        monthrange: {
          placeholder: ['开始月份', '结束月份'],
          valueFormat: 'yyyy-MM'
        }
      };
      const { label, fieldName, labelWidth, labelOptions, dateType = 'daterange', minDateTime, maxDateTime, style = {}, disabled, change = () => {} } = option;
      const [startDate, endDate] = form[fieldName];
      // 日期区间快捷键方法
      const createPicker = (picker, num, key) => {
        const end = new Date();
        const start = moment().subtract(num, key);
        form[fieldName] = this.formatDate([start, end], conf[dateType].valueFormat);
        picker.$emit('pick', start);
      };
      const pickers = [
        {
          text: '最近一周',
          onClick(picker) {
            createPicker(picker, 1, 'w');
          }
        },
        {
          text: '最近一个月',
          onClick(picker) {
            createPicker(picker, 1, 'M');
          }
        },
        {
          text: '最近三个月',
          onClick(picker) {
            createPicker(picker, 3, 'M');
          }
        },
        {
          text: '最近六个月',
          onClick(picker) {
            createPicker(picker, 6, 'M');
          }
        }
      ];
      return (
        <el-form-item key={fieldName} ref={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <div class="range-date" style={{ ...style, width: '100%' }}>
            <el-date-picker
              type={dateType.replace('exact', '').slice(0, -5)}
              value={this.formatDate(form[fieldName][0], conf[dateType].valueFormat)}
              onInput={val => {
                val = val === null ? undefined : moment(val).format(conf[dateType].valueFormat.replace('yyyy', 'YYYY').replace('dd', 'DD'));
                form[fieldName] = [val, form[fieldName][1]];
              }}
              pickerOptions={{
                disabledDate: time => {
                  return this.setDisabledDate(time, [minDateTime, endDate]);
                },
                shortcuts: dateType.includes('date') ? pickers : pickers.slice(1)
              }}
              value-format={conf[dateType].valueFormat}
              style={{ width: `calc(50% - 7px)` }}
              placeholder={conf[dateType].placeholder[0]}
              disabled={disabled}
              onChange={() => change(form[fieldName])}
            />
            <span class={disabled ? 'is-disabled' : ''} style="display: inline-block; line-height: 26px; text-align: center; width: 14px; font-size:12px">
              至
            </span>
            <el-date-picker
              type={dateType.replace('exact', '').slice(0, -5)}
              value={this.formatDate(form[fieldName][1], conf[dateType].valueFormat)}
              onInput={val => {
                val = val === null ? undefined : moment(val).format(conf[dateType].valueFormat.replace('yyyy', 'YYYY').replace('dd', 'DD'));
                form[fieldName] = [form[fieldName][0], val];
              }}
              pickerOptions={{
                disabledDate: time => {
                  return this.setDisabledDate(time, [moment(startDate).format('YYYY-MM-DD HH:mm:ss'), maxDateTime]);
                }
              }}
              value-format={conf[dateType].valueFormat}
              style={{ width: `calc(50% - 7px)` }}
              placeholder={conf[dateType].placeholder[1]}
              disabled={disabled}
              onChange={() => change(form[fieldName])}
            />
          </div>
        </el-form-item>
      );
    },
    CHECKBOX(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, descOptions, options = {}, style = {}, disabled, change = () => {} } = option;
      const { trueValue = '1', falseValue = '0' } = options;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-checkbox v-model={form[fieldName]} disabled={disabled} style={{ ...style }} trueLabel={trueValue} falseLabel={falseValue} onChange={change} />
          {this.createFormItemDesc(descOptions)}
        </el-form-item>
      );
    },
    MULTIPLE_CHECKBOX(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, descOptions, itemList, style = {}, disabled, change = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-checkbox-group v-model={form[fieldName]} style={{ ...style }} onChange={change}>
            {itemList.map(x => {
              return (
                <el-checkbox key={x.value} label={x.value} disabled={disabled}>
                  {x.text}
                </el-checkbox>
              );
            })}
          </el-checkbox-group>
          {this.createFormItemDesc(descOptions)}
        </el-form-item>
      );
    },
    RADIO(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, descOptions, itemList, style = {}, disabled, change = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-radio-group v-model={form[fieldName]} style={{ ...style }} onChange={change}>
            {itemList.map(x => (
              <el-radio key={x.value} label={x.value} disabled={disabled}>
                {x.text}
              </el-radio>
            ))}
          </el-radio-group>
          {this.createFormItemDesc(descOptions)}
        </el-form-item>
      );
    },
    TEXT_AREA(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, style = {}, placeholder = '请输入...', disabled, rows = 2, maxlength = 200, change = () => {}, onInput = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-input
            type="textarea"
            v-model={form[fieldName]}
            placeholder={placeholder}
            disabled={disabled}
            style={{ ...style }}
            clearable
            onChange={val => {
              form[fieldName] = val.trim(); //去空格
              change(form[fieldName]);
            }}
            autosize={{ minRows: rows }}
            maxlength={maxlength}
            showWordLimit
          />
        </el-form-item>
      );
    },
    // 数字格式化
    formatNumber(value = '') {
      value += '';
      if (value.slice(-1) === '.') return value;
      value = value.replace(/,\s+/g, '');
      const list = value.split('.');
      const prefix = list[0].charAt(0) === '-' ? '-' : '';
      let num = prefix ? list[0].slice(1) : list[0];
      let result = '';
      while (num.length > 3) {
        result = `, ${num.slice(-3)}${result}`;
        num = num.slice(0, num.length - 3);
      }
      if (num) {
        result = num + result;
      }
      return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
    },
    createSelectHandle(option, multiple = false) {
      const { form } = this;
      const {
        label,
        fieldName,
        labelWidth,
        labelOptions,
        descOptions,
        filterable,
        isremoval,
        request = {},
        style = {},
        SelectIconButton,
        placeholder = '请选择...',
        disabled,
        clearable = !0,
        change = () => {}
      } = option;
      const { fetchApi, params = {} } = request;
      let { itemList } = option;
      if (!option.itemList && fetchApi) {
        itemList = this[`${fieldName}ItemList`] || [];
        if (!_.isEqual(this[`${fieldName}PrevParams`], params)) {
          this[`${fieldName}PrevParams`] = params;
          this.querySelectOptions(request, fieldName);
        }
      }
      if (isremoval) {
        var obj = {};
        itemList = itemList.reduce(function(item, next) {
          obj[next.value] ? '' : (obj[next.value] = true && item.push(next));
          return item;
        }, []);
      }
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <div style={{ display: 'flex' }}>
            <el-select
              multiple={multiple}
              collapseTags={!disabled}
              filterable={filterable}
              v-model={form[fieldName]}
              placeholder={placeholder}
              disabled={disabled}
              style={{ ...style }}
              clearable={clearable}
              onChange={change}
              nativeOnKeydown={this.enterEventHandle}
              filterMethod={queryString => {
                if (!filterable) return;
                this.filterMethodHandle(fieldName, queryString);
              }}
              on-visible-change={val => {
                if (filterable && !val) {
                  setTimeout(() => this.filterMethodHandle(fieldName, ''), 300);
                }
              }}
            >
              {itemList.map(x => (
                <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />
              ))}
            </el-select>
            {this.createFormItemDesc(descOptions)}
            {this.createSelectIconButton(SelectIconButton)}
          </div>
        </el-form-item>
      );
    },
    createSelectinputHandle(option, multiple = false) {
      let { form } = this;
      const { label, fieldName, labelWidth, labelOptions, descOptions, filterable, request = {}, style = {}, placeholder = '请选择...', clearable = !0, change = () => {} } = option;
      const { fetchApi, params = {} } = request;
      let { itemList, selectWidth, disabled } = option;
      if (!selectWidth) {
        selectWidth = '100px';
      }
      if (option.itemList.length == 0) {
        //  当组件无数据的时候
        option.itemList = [{ value: 'value', text: '无数据', key: 'key' }];
        option.disabled = true;
      }
      if (form[fieldName][fieldName] == '') {
        // 如果没有选项的时候默认选中第一项
        form[fieldName][fieldName] = option.itemList[0].value;
      }
      let a = '10px';
      return (
        <el-form-item key={fieldName} label=" " labelWidth={a} prop={fieldName}>
          <el-select
            collapseTags={!disabled}
            v-model={form[fieldName][fieldName]}
            placeholder={placeholder}
            disabled={option.disabled}
            style={{ ...style, width: selectWidth }}
            onChange={val => {
              let a = { [fieldName]: form[fieldName][fieldName] };
              form[fieldName] = a;
            }}
            nativeOnKeydown={this.enterEventHandle}
          >
            {itemList.map(x => (
              <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />
            ))}
          </el-select>
          <el-input
            style={{ marginLeft: '5px', width: `calc(100% - ${selectWidth} - 5px` }}
            v-model={form[fieldName][option.itemList.find(x => x.value == form[fieldName][fieldName]).key]}
            disabled={option.disabled}
          />
          {this.createFormItemDesc(descOptions)}
        </el-form-item>
      );
    },
    // 设置日期控件的禁用状态
    setDisabledDate(time, [minDateTime, maxDateTime]) {
      const min = new Date(minDateTime).getTime();
      const max = new Date(maxDateTime).getTime();
      if (min && max) {
        return !(time.getTime() > min && time.getTime() < max);
      }
      if (!!min) {
        return time.getTime() < min - 1;
      }
      if (!!max) {
        return time.getTime() > max;
      }
      return false;
    },
    // 下拉框的筛选方法
    filterMethodHandle(fieldName, queryString = '') {
      const { itemList = [] } = this.formItemList.find(x => x.fieldName === fieldName) || {};
      if (!this[`${fieldName}OriginItemList`] && !_.isEqual(this[`${fieldName}OriginItemList`], itemList)) {
        this[`${fieldName}OriginItemList`] = itemList;
      }
      const res = queryString ? this[`${fieldName}OriginItemList`].filter(this.createSearchHelpFilter(queryString)) : this[`${fieldName}OriginItemList`];
      this.formItemList.find(x => x.fieldName === fieldName).itemList = res;
    },
    // 获取下拉框数据
    async querySelectOptions({ fetchApi, params = {}, datakey = '', valueKey = 'value', textKey = 'text' }, fieldName) {
      const res = await fetchApi(params);
      if (res.resultCode === 200) {
        const dataList = !datakey ? res.data : _.get(res.data, datakey, []);
        this[`${fieldName}ItemList`] = dataList.map(x => ({ value: x[valueKey], text: x[textKey] }));
      }
      this.$forceUpdate();
    },
    // 获取搜索帮助数据
    async querySearchAsync(request, fieldName, queryString = '', cb) {
      const { fetchApi, params = {}, datakey = '', valueKey, textKey } = request;
      const res = await fetchApi({ ...{ [fieldName]: queryString }, ...params });
      if (res.resultCode === 200) {
        const dataList = !datakey ? res.data : _.get(res.data, datakey, []);
        cb(dataList);
      }
    },
    // 创建搜索帮助数据列表
    // createSerachHelperList (list, valueKey, textKey) {
    //   return list.map(x => ({ value: x[valueKey], id: x[textKey] }));
    // },
    querySearchHandle(fieldName, queryString = '', cb) {
      const { itemList = [] } = this.formItemList.find(x => x.fieldName === fieldName) || {};
      const res = queryString ? itemList.filter(this.createSearchHelpFilter(queryString)) : itemList;
      cb(res);
    },
    createSearchHelpFilter(queryString) {
      return state => {
        const pyt = pinyin(state.text, { style: STYLE_FIRST_LETTER })
          .flat()
          .join('');
        const str = `${state.text}|${pyt}`;
        return str.toLowerCase().includes(queryString.toLowerCase());
      };
    },
    // 创建树节点的值
    createInputTreeValue(fieldName, itemList) {
      let { text = '' } = this.deepFind(itemList, this.form[fieldName]) || {};
      return text;
    },
    treeFilterTextHandle(key) {
      this.$refs[`tree-${key}`].filter(this[`${key}TreeFilterTexts`]);
    },
    // 树结构的筛选方法
    filterNodeHandle(value, data) {
      if (!value) return true;
      return data.text.indexOf(value) !== -1;
    },
    // 树节点单机事件
    treeNodeClickHandle(fieldName, { value, disabled }) {
      if (disabled) return;
      this.form[fieldName] = value;
      this.visible[fieldName] = false;
    },
    // 级联选择器值变化处理方法
    cascaderChangeHandle(fieldName, data) {
      this.form[fieldName] = data.map(x => x.value).join(',') || undefined;
      this[`${fieldName}CascaderTexts`] = data.map(x => x.text).join('/');
      // 强制重新渲染组件
      this.$forceUpdate();
    },
    createFormItem() {
      return this.list
        .filter(x => !x.hidden)
        .map(item => {
          const VNode = !this[item.type] ? null : item.render ? this.RENDER_FORM_ITEM(item) : this[item.type](item);
          VNode['type'] = item.type;
          return VNode;
        });
    },
    enterEventHandle(ev) {
      if (ev.keyCode !== 13) return;
      this.submitForm(ev);
    },
    isValidateValue(val) {
      return Array.isArray(val) ? val.length : !!val;
    },
    // 表单数据是否通过非空校验
    isPassValidate(form) {
      for (let key in this.rules) {
        if (this.rules[key].some(x => x.required) && !this.isValidateValue(form[key])) {
          return false;
        }
      }
      return true;
    },
    doClearValidate($compRef) {
      $compRef && $compRef.clearValidate();
    },
    doFormItemValidate(fieldName) {
      this.$refs.form.validateField(fieldName);
    },
    excuteFormData(form) {
      this.formItemList
        .filter(x => ['RANGE_DATE', 'RANGE_INPUT_NUMBER'].includes(x.type))
        .map(x => x.fieldName)
        .forEach(fieldName => {
          if (form[fieldName].length > 0) {
            // 处理可能出现的风险 bug
            form[fieldName] = Object.assign([], [undefined, undefined], form[fieldName]);
            if (form[fieldName].every(x => _.isUndefined(x))) {
              form[fieldName] = [];
            }
            if (form[fieldName].some(x => _.isUndefined(x))) {
              let val = form[fieldName].find(x => !_.isUndefined(x));
              form[fieldName] = [val, val];
            }
          }
        });
      for (let attr in form) {
        if (attr.includes('|') && Array.isArray(form[attr])) {
          let [start, end] = attr.split('|');
          form[start] = form[attr][0];
          form[end] = form[attr][1];
        }
      }
    },
    submitForm(ev) {
      ev && ev.preventDefault();
      let isErr;
      this.excuteFormData(this.form);
      this.$refs.form.validate(valid => {
        isErr = !valid;
        if (valid) {
          var obj = {};
          //重新封装带labelOptions的数据
          this.formItemList.map((item, i) => {
            if (item.isChilden === undefined) {
              if (item.labelOptions && item.labelOptions.type === 'SELECT') {
                obj[item.labelOptions.initialValue] = item.initialValue;
              } else {
                obj[item.fieldName] = item.type === 'VIN' ? item.initialValue.replace(/-/g, '') : item.initialValue;
              }
            }
          });
          return this.$emit('filterChange', Object.assign({}, obj, this.form));
        }
        // 校验没通过，展开
        this.expand = true;
      });
      return isErr;
    },
    /*
     * modify by: mgy
     * 原架构逻辑没有async/await
     * 原顺序先代码1，后代码2
     */
    async resetForm() {
      // 重置表单项
      this.$refs.form.resetFields();
      this.excuteFormData(this.form);
      for (let k in this.form) this.$refs[k + 'Quarter'] && this.$refs[k + 'Quarter'].reset();
      await this.$emit('resetChange', this.form); // mgy-代码2
      if (this.isPassValidate(this.form)) {
        this.isResetChange ? this.$emit('filterChange', this.form) : null; // 重置是否掉接口
      }
      // 解决日期区间(拆分后)重复校验的 bug
      this.$nextTick(() => {
        this.formItemList.forEach(x => {
          if (x.type === 'RANGE_DATE') {
            this.doClearValidate(this.$refs[x.fieldName]);
          }
        });
      });
    },
    toggleHandler() {
      this.expand = !this.expand;
    },
    createButton(rows, total) {
      const { cols, expand, collapse, disabled } = this;
      let top = '23px';
      if (!collapse) {
        top = total % cols === 0 ? '0px' : '23px';
      } else {
        top = total >= cols ? '0px' : '23px';
      }
      const colSpan = 24 / cols;
      // 默认收起
      let offset = rows * cols - total > 0 ? rows * cols - total : 0;
      // 展开
      if (!collapse || expand) {
        offset = cols - (total % cols) - 2;
      }
      return this.isSubmitBtn ? (
        <el-col key="-" span={colSpan} offset={offset * colSpan} class="filterBtn" style={this.list.length < cols ? { position: 'absolute', top: '23px', right: '0px' } : { 'padding-top': top }}>
          <el-button type="primary" disabled={disabled} onClick={this.submitForm}>
            搜索
          </el-button>
          <el-button type="info" disabled={disabled} onClick={this.resetForm}>
            重置
          </el-button>
        </el-col>
      ) : null;
    },
    createOpenButton() {
      let { expand, collapse, disabled } = this;
      return (
        <el-col style={{ height: '10px', minHeight: '10px', margin: '0px 0px 5px 0px' }}>
          <div class="breakSpaceLine">
            {!this.expand ? (
              <div class="iconUp" onClick={this.toggleHandler}>
                <div class="line" />
                <div class="center">
                  <i class="el-icon-arrow-down" />
                </div>
                <div class="line" />
              </div>
            ) : (
              <div class="iconDown" onClick={this.toggleHandler}>
                <div class="line" />
                <div class="center">
                  <i class="el-icon-arrow-up" />
                </div>
                <div class="line" />
              </div>
            )}
          </div>
        </el-col>
      );
    },
    createFormLayout() {
      const { cols, rows, expand, collapse } = this;
      const colSpan = 24 / cols;
      let colsWidth = this.list.length < cols ? 100 / (cols - 1) + '% !important' : '';
      const formItems = this.createFormItem().filter(item => item !== null);
      const defaultPlayRows = rows > Math.ceil(formItems.length / cols) ? Math.ceil(formItems.length / cols) : rows;
      const count = expand ? formItems.length : defaultPlayRows * cols;
      const colFormItems = formItems.map((Node, i) => {
        return (
          <el-col key={i} span={colSpan} style={{ display: !collapse || i < count ? 'block' : 'none', width: colsWidth }}>
            {Node}
          </el-col>
        );
      });
      if (collapse && this.list.length > cols) {
        return [...colFormItems, this.createOpenButton(), this.createButton(defaultPlayRows, formItems.length)];
      } else {
        return [...colFormItems, this.createButton(defaultPlayRows, formItems.length)];
      }
    },
    // 日期格式化
    formatDate(val, vf) {
      const arr = Array.isArray(val) ? val : [val];
      const res = arr.map(x => {
        return !x ? x : moment(x).format(vf.replace('yyyy', 'YYYY').replace('dd', 'DD'));
      });
      return Array.isArray(val) ? res : res[0];
    },
    // 函数防抖
    debounce(fn, delay) {
      return function(...args) {
        fn.timer && clearTimeout(fn.timer);
        fn.timer = setTimeout(() => fn.apply(this, args), delay);
      };
    },
    difference(newVal, oldVal) {
      const res = {};
      for (let key in newVal) {
        if (!_.isEqual(newVal[key], oldVal[key])) {
          res[key] = newVal[key];
        }
      }
      return res;
    },
    deepFind(arr, mark) {
      let res = null;
      for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i].children)) {
          res = this.deepFind(arr[i].children, mark);
        }
        if (res !== null) {
          return res;
        }
        if (arr[i].value === mark) {
          res = arr[i];
          break;
        }
      }
      return res;
    },
    checkWidth(id) {
      const dom = document.getElementById(id);
      if (!dom) return;
      const prt = dom.parentNode;
      const left = prt.style.left.replace('px', '') * 1;
      if (document.body.clientWidth - (prt.clientWidth + left) < 100) {
        prt.style.left = 'auto';
        prt.style.right = '10px';
      }
    },
    // 外部通过组件实例调用的方法
    SUBMIT_FORM() {
      const err = this.submitForm();
      return !err ? this.form : null;
    },
    RESET_FORM() {
      this.resetForm();
    },
    async GET_FORM_DATA() {
      try {
        this.excuteFormData(this.form);
        await this.$refs.form.validate();
        return [false, this.form];
      } catch (err) {
        return [true, null];
      }
    }
  },
  render() {
    const { cols, form, rules, labelWidth } = this;
    let styleRight = {};
    if (this.list.length < cols) {
      styleRight = { paddingRight: '290px' };
    }
    return (
      <div class="top-filter">
        <el-form ref="form" size="mini" model={form} rules={rules} nativeOnSubmit={ev => ev.preventDefault()}>
          <el-row gutter={10} style={styleRight}>
            {this.createFormLayout()}
          </el-row>
        </el-form>
      </div>
    );
  }
};
</script>

<style lang="less" scoped>
.top-filter {
  width: 100%;
  background-color: #ffffff;
  margin: 0;
  padding: 0px;
  .unitRenderClass {
    .el-form-item__label {
      margin-bottom: 1px !important;
    }
  }
  .filterBtn {
    text-align: right;
    min-height: 30px !important;
    margin-bottom: 5px !important;
    float: right;
    width: 290px;
    .el-button {
      width: 132px;
      height: 30px;
    }
  }
  .el-input__inner {
    padding-left: 5px;
  }
  .el-col {
    min-height: 62px;
    .el-form-item {
      margin-bottom: 0;
      .el-form-item__label {
        position: relative;
        display: block;
        width: 100%;
        height: 23px;
        line-height: 23px;
        text-align: left;
        font-size: @textSizeSecondary;
        padding-right: 0px;
        .label-wrap {
          display: block;
          width: 99%;
          position: absolute;
          top: 0px;
          left: 0px;
          .el-input--mini .el-input__inner {
            border-color: #fff;
            height: 18px;
            line-height: 18px !important;
            padding: 0px;
            & + span.el-input__suffix {
              right: 0;
            }
          }
        }
      }
      .el-form-item__content {
        line-height: 30px;
        float: left;
        width: 100%;
        display: block;
        .el-input__inner {
          line-height: 30px;
          height: 30px;
          line-height: 28px\0;
        }
        .el-form-item__error {
          margin-top: -2px;
          transform-origin: 0 50%;
          -webkit-transform: scale(0.9);
          transform: scale(0.9);
        }
      }
      .el-select {
        width: 100%;
      }
      .el-autocomplete {
        width: 100%;
      }
      .el-date-editor {
        width: 100%;
      }
      .range-date {
        display: flex;
        margin-top: 1px;
        border-radius: @borderRadius;
        .el-date-editor {
          height: 28px;
          line-height: 28px;
          input {
            border: 0 !important;
            height: 25px;
            line-height: 25px;
            padding-right: 0;
          }
          &:nth-of-type(1) {
            input {
              padding-left: 30px;
            }
            .el-input__suffix {
              right: -5px;
            }
          }
          &:nth-of-type(2) {
            input {
              padding-left: 25px;
            }
            .el-input__prefix {
              left: 0;
            }
            .el-input__suffix {
              right: 0;
            }
          }
        }
        .is-disabled {
          background-color: @backgroundColor;
          color: @disabledColor;
          cursor: not-allowed;
        }
      }
      .el-textarea {
        display: block;
        .el-textarea__inner {
          font-family: inherit;
          overflow-y: auto;
        }
        .el-input__count {
          line-height: 1;
          right: 6px;
        }
      }
      .el-input-number {
        width: 100%;
        .el-input__inner {
          text-align: left !important;
        }
        .el-input__inner {
          padding-left: 5px;
        }
        .el-input-number__increase:hover ~ .el-input .el-input__inner:not(.is-disabled),
        .el-input-number__decrease:hover ~ .el-input .el-input__inner:not(.is-disabled) {
          border-color: @borderColor;
        }
      }
      .el-range-editor {
        padding-right: 5px;
        .el-range-separator {
          padding-left: 0;
          padding-right: 0;
        }
        .el-range__close-icon {
          width: 20px;
        }
      }
      .desc-icon {
        padding: 6px;
        font-size: 18px;
        vertical-align: middle;
      }
      .desc-text {
        font-size: @textSizeSecondary;
      }
      &.is-error {
        .range-date {
          border-color: #f5222d;
        }
      }
    }
    .is-required {
      .label-wrap {
        left: 7px !important;
      }
    }
  }
  .el-col-4d8 {
    width: 20%;
  }
}
.diyComplete {
  .diyCompleteBtn {
    background-color: #f2f2f2;
    color: #4d4d4d;
    display: table-cell;
    position: absolute;
    top: 2px;
    border-left: #dbdbdb solid 1px;
    height: 28px;
    right: 1px;
    width: 27px;
    .el-button {
      padding: 7px;
      border: none;
      background: none;
      i {
        font-size: 14px;
      }
    }
  }
}

.upDownOpen {
  background: #f2f7fd;
  text-align: center;
  min-height: 10px;
  line-height: 10px;
  height: 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  i {
    margin: 0px 1px;
    height: 3px;
    width: 3px;
    display: block;
    overflow: hidden;
    background: @primaryColor;
  }
}
.input-tree {
  .input-tree-wrap {
    padding-right: 10px;
    margin-right: -10px;
  }
  .el-tree {
    .el-tree-node[aria-disabled='true'] > .el-tree-node__content {
      color: @disabledColor;
      background: none;
      cursor: not-allowed;
      .is-leaf {
        pointer-events: none;
      }
    }
  }
}
.breakSpaceLine {
  .iconUp,
  .iconDown {
    cursor: pointer;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    .line {
      flex: 1;
      height: 1px;
      background: #bad2f2;
    }
    .center {
      padding: 0px 30px;
    }
  }
}
.el-button {
  padding: 0;
}
</style>
