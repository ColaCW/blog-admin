<script>
/**
 * @Author: 焦质晔
 * @Date: 2019-06-20 10:00:00
 * @Last Modified by: xuliang
 * @Last Modified time: 2020-06-12 19:28:09
 **/
import _ from 'lodash';
import moment from 'moment';
import pinyin, { STYLE_FIRST_LETTER } from '@/components/Pinyin/index';
import Cascader from './Cascader.vue';
import Calculator from './Calculator.vue';
import ColorPicker from './ColorPicker';

export default {
  name: 'FormPanel',
  props: {
    list: {
      type: Array,
      required: true
    },
    formType: {
      type: String,
      default: 'add'
    },
    cols: {
      type: Number,
      default: 4
    },
    labelWidth: {
      type: [Number, String],
      default: 80
    },
    isSubmitBtn: {
      type: Boolean,
      default: true
    }
  },
  data() {
    this.treeProps = { children: 'children', label: 'text' };
    this.prevForm = null;
    this.arrayTypes = ['RANGE_DATE', 'RANGE_TIME', 'RANGE_TIME_SELECT', 'RANGE_INPUT_NUMBER', 'MULTIPLE_SELECT', 'MULTIPLE_CHECKBOX', 'UPLOAD_IMG', 'UPLOAD_FILE', 'INPUT_CASCADER_GROUP'];
    return {
      form: {},
      visible: {},
      curIndex: 0
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
          if (x.type === 'BREAK_SPACE') return;
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
    formType(val) {
      this.initialHandle();
    },
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
    }
  },
  created() {
    this.initialHandle();
  },
  methods: {
    initialHandle() {
      this.form = this.createFormData();
      this.prevForm = { ...this.form };
    },
    getInitialValue(item) {
      let { initialValue, type = '', fieldName } = item;
      if (this.formType === 'show') {
        item.disabled = true;
      }
      if (this.arrayTypes.includes(type)) {
        // 级联选择器组
        if (type === 'INPUT_CASCADER_GROUP' && _.isUndefined(this[`${fieldName}CascaderGroupTexts`])) {
          this[`${fieldName}0CascaderGroupTexts`] = '';
          initialValue = initialValue || [''];
        } else {
          initialValue = initialValue || [];
        }
      }
      if (type === 'INPUT' && item.numberFormat) {
        initialValue = this.formatNumber(initialValue);
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
            <span style="vertical-align: middle; width:100%">
              <span class="desc-text" style={{ paddingRight: '10px' }}>
                {label}
              </span>
              <span style="float:right">
                {popoverSlot ? (
                  <el-popover placement={placementPopover} width={popoverWidth} trigger="click">
                    {popoverSlot}
                    <el-tooltip slot="reference" placement={placementTooltip} effect={effect}>
                      <div slot="content" class="desc-text">
                        {contentSlot}
                      </div>
                      <i class="bmwIcon iconbmw_apps_info_def_b"></i>
                    </el-tooltip>
                  </el-popover>
                ) : (
                  <el-tooltip effect={effect} content={contentSlot} placement={placementTooltip}>
                    <i class="bmwIcon iconbmw_apps_info_def_b"></i>
                  </el-tooltip>
                )}
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
          <el-tooltip effect="light" content={content} placement="top">
            <i class="desc-icon bmwIcon iconbmw_apps_info_def_b" style={{ ...style }}></i>
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
        showPassword,
        numberFormat,
        style = {},
        placeholder = '请输入...',
        unitRender,
        unitRenderDisabled,
        minlength = 20,
        maxlength = 20,
        pattern,
        readonly,
        disabled,
        change = () => {},
        onInput = () => {},
        onFocus = () => {},
        onEnter = () => {}
      } = option;
      const prevValue = form[fieldName];
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-input
            value={prevValue}
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
            maxlength="20"
            minlength={minlength}
            maxlength={maxlength}
            placeholder={placeholder}
            readonly={readonly}
            disabled={disabled}
            showPassword={showPassword}
            style={{ ...style }}
            onChange={val => {
              form[fieldName] = val.trim(); //去空格
              change(form[fieldName]);
            }}
            onFocus={onFocus}
            nativeOnKeydown={e => {
              if (e.keyCode !== 13) return;
              onEnter(e.target.value);
              this.doFormItemValidate(fieldName);
            }}
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
        showPassword,
        numberFormat,
        style = {},
        placeholder = '请输入...',
        unitRender,
        minlength = 0,
        maxlength = 999,
        pattern,
        readonly,
        disabled,
        unitRenderDisabled,
        change = () => {},
        onInput = () => {},
        onFocus = () => {},
        onBlur = () => {},
        onEnter = () => {}
      } = option;
      const prevValue = form[fieldName];
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-input
            value={prevValue}
            onInput={val => {
              if (_.isRegExp(pattern)) {
                // 是否为删除动作
                const isRemoveHandle = val.length < (prevValue && prevValue.length);
                // 单元格正则校验
                if (!isRemoveHandle && !pattern.test(val)) return;
              }
              if (numberFormat) {
                val = val.replace(/[^\d.]/g, '');
                form[fieldName] = this.formatNumber(val).trim();
              } else {
                form[fieldName] = val;
              }
              onInput(val);
            }}
            minlength={minlength}
            maxlength={maxlength}
            placeholder={placeholder}
            readonly={readonly}
            disabled={disabled}
            showPassword={showPassword}
            style={{ ...style }}
            clearable
            onChange={val => {
              form[fieldName] = val.trim(); //去空格
              change(form[fieldName]);
            }}
            onBlur={val => {
              onBlur(form[fieldName]);
            }}
            onFocus={onFocus}
            nativeOnKeydown={e => {
              if (e.keyCode !== 13) return;
              onEnter(e.target.value);
              this.doFormItemValidate(fieldName);
            }}
          >
            {unitRender && <template slot="append">{<div style={unitRenderDisabled === false ? null : disabled && { pointerEvents: 'none' }}>{unitRender()}</div>}</template>}
          </el-input>
          {this.createFormItemDesc(descOptions)}
        </el-form-item>
      );
    },
    // style={disabled && { pointerEvents: 'none' }}
    INPUT_NUMBER(option) {
      const { form } = this;
      const {
        label,
        fieldName,
        labelWidth,
        labelOptions,
        unitRender,
        unitRenderDisabled,
        descOptions,
        calculateOption,
        style = {},
        placeholder = '请输入...',
        disabled,
        min = 0,
        max = 99999999,
        step = 1,
        precision,
        change = () => {}
      } = option;
      if (precision && !form[fieldName + 'Format']) {
        form[fieldName + 'Format'] = option.initialValue;
      }
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          {!calculateOption && (
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
                onFocus={() => (this.visible[fieldName] = true)}
              />
              {unitRender && <template class="diyCompleteBtn">{<div style={unitRenderDisabled === false ? null : disabled && { pointerEvents: 'none' }}>{unitRender()}</div>}</template>}
            </div>
          )}
          {calculateOption && (
            <el-popover ref="popover" v-model={this.visible[fieldName]} placement="right">
              <el-input-number
                slot="reference"
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
              />
              <Calculator
                option={calculateOption}
                onChange={data => {
                  form[fieldName] = data;
                  change(data);
                }}
                onClose={() => (this.visible[fieldName] = false)}
              />
            </el-popover>
          )}
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
      const { label, fieldName, labelWidth, labelOptions, itemList, style = {}, placeholder = '请输入...', readonly, disabled, lastNode, defaultExpandAll, change = () => {} } = option;
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
                on-node-click={(data, node) => {
                  this.treeNodeClickHandle(fieldName, data, node, lastNode);
                  if (lastNode && node.childNodes.length) return;
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
              style={{ ...style, pointerEvents: disabled ? 'none' : 'auto' }}
              onClear={() => {
                this.treeNodeClickHandle(fieldName, {});
                change(this.form[fieldName]);
              }}
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
            <div style={{ maxHeight: '250px', overflowY: 'auto', ...style }}>
              <Cascader
                value={form[fieldName]}
                onInput={val => {
                  this.cascaderChangeHandle(fieldName, val);
                }}
                list={itemList}
                labels={titles}
                style={style}
                onChange={data => {
                  change(form[fieldName], this[`${fieldName}CascaderTexts`]);
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
    INPUT_CASCADER_GROUP(option) {
      const { form, curIndex } = this;
      const { label, fieldName, labelWidth, labelOptions, itemList = [], options = {}, style = {}, placeholder = '请选择...', readonly, disabled, change = () => {} } = option;
      const { titles = [] } = options;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-popover v-model={this.visible[fieldName]} transition="el-zoom-in-top" placement="bottom-start" trigger="click">
            <div style={{ maxHeight: '250px', overflowY: 'auto', ...style }}>
              <Cascader
                initialValue={form[fieldName][curIndex]}
                list={itemList}
                labels={titles}
                style={style}
                onChange={data => {
                  this.cascaderGroupChangeHandle(fieldName, curIndex, data);
                  change(
                    form[fieldName],
                    form[fieldName].map((x, i) => this[`${fieldName + i}CascaderGroupTexts`])
                  );
                }}
                onClose={() => (this.visible[fieldName] = false)}
              />
            </div>
            <div slot="reference">
              {form[fieldName] &&
                form[fieldName].map((x, i) => (
                  <div style={{ marginBottom: '8px' }}>
                    <el-input
                      value={this[`${fieldName + i}CascaderGroupTexts`]}
                      placeholder={placeholder}
                      readonly={readonly}
                      disabled={disabled}
                      clearable
                      style={{ pointerEvents: disabled ? 'none' : 'auto', width: '90%', marginRight: '10px' }}
                      onFocus={() => (this.curIndex = i)}
                      onClear={() => this.cascaderGroupChangeHandle(fieldName, i, [])}
                    />
                    <span onClick={e => e.stopPropagation()}>
                      {!i && <el-button icon="el-icon-close" size="mini" disabled={disabled} circle onClick={() => {}} />}
                      <el-button icon="el-icon-plus" size="mini" disabled={disabled} circle onClick={this.cascaderGroupHandle.bind(this, fieldName, i, 'add')} />
                      {!!i && <el-button icon="el-icon-minus" size="mini" disabled={disabled} circle onClick={this.cascaderGroupHandle.bind(this, fieldName, i, 'remove')} />}
                    </span>
                  </div>
                ))}
            </div>
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
        unitRenderDisabled,
        triggerOnFocus = false,
        labelOptions,
        request = {},
        style = {},
        placeholder = '请输入...',
        disabled,
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
            ></el-autocomplete>
            {unitRender && <template class="diyCompleteBtn">{<div style={unitRenderDisabled === false ? null : disabled && { pointerEvents: 'none' }}>{unitRender()}</div>}</template>}
          </div>
        </el-form-item>
      );
    },
    Color_Picker(option) {
      const { form } = this;
      const { label, fieldName, defaultColor, position, labelWidth, labelOptions, placeholder = '请输入...', disabled, change = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <ColorPicker v-model={form[fieldName]} position={position} defaultColor={defaultColor} disabled={disabled} onChange={change} />
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
        month: {
          placeholder: '选择月份',
          valueFormat: 'yyyy-MM'
        },
        year: {
          placeholder: '选择年份',
          valueFormat: 'yyyy'
        }
      };
      const { label, fieldName, labelWidth, labelOptions, dateType = 'date', minDateTime, maxDateTime, format, style = {}, disabled, change = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-date-picker
            type={dateType.replace('exact', '')}
            value={form[fieldName]}
            onInput={val => {
              val = val === null ? undefined : val;
              form[fieldName] = val;
            }}
            value-format={format || conf[dateType].valueFormat}
            format={format || conf[dateType].valueFormat}
            placeholder={conf[dateType].placeholder}
            disabled={disabled}
            style={{ ...style }}
            picker-options={{
              disabledDate: time => {
                return this.setDisabledDate(time, [minDateTime, maxDateTime]);
              }
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
      const { label, fieldName, labelWidth, labelOptions, dateType = 'daterange', style = {}, disabled, isAfter, change = () => {} } = option;
      // 日期区间快捷键方法
      const createPicker = (picker, num, key) => {
        let end = new Date();
        let start = new Date();
        isAfter ? (end = moment().add(num, key)) : (start = moment().subtract(num, key));
        picker.$emit('pick', [start, end]);
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
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-date-picker
            type={dateType.replace('exact', '')}
            value={this.formatDate(form[fieldName], conf[dateType].valueFormat)}
            onInput={val => {
              val =
                val === null
                  ? []
                  : [
                      moment(val[0]).format(conf[dateType].valueFormat.replace('yyyy', 'YYYY').replace('dd', 'DD')),
                      moment(val[1]).format(conf[dateType].valueFormat.replace('yyyy', 'YYYY').replace('dd', 'DD'))
                    ];
              form[fieldName] = val;
            }}
            value-format={conf[dateType].valueFormat}
            range-separator="至"
            start-placeholder={conf[dateType].placeholder[0]}
            end-placeholder={conf[dateType].placeholder[1]}
            unlink-panels={true}
            disabled={disabled}
            style={{ width: '100%', ...style }}
            onChange={() => change(form[fieldName])}
            pickerOptions={{
              shortcuts: dateType.includes('date') ? pickers : pickers.slice(1)
            }}
          />
        </el-form-item>
      );
    },
    TIME(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, valueFormat = 'HH:mm:ss', style = {}, placeholder = '选择时间', disabled, change = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-time-picker
            v-model={form[fieldName]}
            pickerOptions={{
              format: valueFormat
            }}
            value-format={valueFormat}
            placeholder={placeholder}
            disabled={disabled}
            style={{ ...style }}
            onChange={change}
          />
        </el-form-item>
      );
    },
    RANGE_TIME(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, valueFormat = 'HH:mm:ss', style = {}, disabled, change = () => {} } = option;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-time-picker
            isRange={true}
            value={form[fieldName].length ? form[fieldName] : undefined}
            onInput={val => {
              val = val === null ? [] : val;
              form[fieldName] = val;
            }}
            value-format={valueFormat}
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            disabled={disabled}
            style={{ ...style }}
            onChange={() => change(form[fieldName])}
          />
        </el-form-item>
      );
    },
    TIME_SELECT(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, valueFormat = 'HH:mm', options = {}, style = {}, placeholder = '选择时间', disabled, change = () => {} } = option;
      const { startTime = '00:00', endTime = '23:45', stepTime = '00:15' } = options;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-time-select
            v-model={form[fieldName]}
            pickerOptions={{
              start: startTime,
              end: endTime,
              step: stepTime
            }}
            value-format={valueFormat}
            placeholder={placeholder}
            disabled={disabled}
            style={{ ...style }}
            onChange={change}
          />
        </el-form-item>
      );
    },
    RANGE_TIME_SELECT(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, valueFormat = 'HH:mm', options = {}, style = {}, disabled, change = () => {} } = option;
      const { startTime = '00:00', endTime = '23:45', stepTime = '00:15' } = options;
      const stepMinute = moment(stepTime, valueFormat).minute();
      const [startVal, endVal] = form[fieldName];
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-time-select
            value={form[fieldName][0]}
            onInput={val => {
              val = val === null ? undefined : val;
              form[fieldName] = [val, endVal];
            }}
            pickerOptions={{
              start: startTime,
              end: endTime,
              step: stepTime,
              maxTime:
                endVal &&
                moment(endVal, valueFormat)
                  .add(stepMinute, 'minutes')
                  .format(valueFormat)
            }}
            value-format={valueFormat}
            placeholder={'开始时间'}
            disabled={disabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={() => change(form[fieldName])}
          />
          <span style="display: inline-block; text-align: center; width: 14px;">-</span>
          <el-time-select
            value={form[fieldName][1]}
            onInput={val => {
              val = val === null ? undefined : val;
              form[fieldName] = [startVal, val];
            }}
            pickerOptions={{
              start: startTime,
              end: endTime,
              step: stepTime,
              minTime:
                startVal &&
                moment(startVal, valueFormat)
                  .subtract(stepMinute, 'minutes')
                  .format(valueFormat)
            }}
            value-format={valueFormat}
            placeholder={'结束时间'}
            disabled={disabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={() => change(form[fieldName])}
          />
        </el-form-item>
      );
    },
    CHECKBOX(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, descOptions, options = {}, style = {}, disabled, change = () => {} } = option;
      const { trueValue = '1', falseValue = '0' } = options;
      return (
        <el-form-item key={fieldName} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <el-checkbox v-model={form[fieldName]} disabled={disabled} style={{ ...style }} trueLabel={trueValue} falseLabel={falseValue} onChange={change}>
            {label}
          </el-checkbox>
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
                <el-checkbox key={x.value} label={x.value} disabled={x.disabled || disabled}>
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
    UPLOAD_ALIOSS(option) {
      const { form } = this;
      const { label, fieldName, labelWidth, labelOptions, upload = {}, style = {}, initialValue = [], disabled, change = () => {}, error = () => {} } = option;
      form[fieldName] = form[fieldName] || initialValue;
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <ossUpload
            value={form[fieldName]}
            init={{ ...upload, root: 'UPLOAD_ALIOSS/' + new Date().getTime() + '/' }}
            onGetUrl={val => {
              this.form[fieldName] = val;
              change(val);
            }}
          />
        </el-form-item>
      );
    },
    BREAK_SPACE(option) {
      const { label = '标题', icon = 'bmwIcon iconbmw_media_explore_def_b', style = {} } = option;
      return (
        <div id={label} style={style} class="BREAK_SPACECss">
          <i class={icon}></i>
          <span>{label}</span>
        </div>
      );
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
        request = {},
        style = {},
        SelectIconButton,
        placeholder = '请选择...',
        disabled,
        clearable = !0,
        change = () => {},
        collapseTags
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
      return (
        <el-form-item key={fieldName} label={label} labelWidth={labelWidth} prop={fieldName}>
          {labelOptions && <span slot="label">{this.createFormItemLabel(labelOptions)}</span>}
          <div style={{ display: 'flex' }}>
            <el-select
              multiple={multiple}
              collapseTags={!disabled && !collapseTags}
              filterable={filterable}
              v-model={form[fieldName]}
              placeholder={placeholder}
              disabled={disabled}
              style={{ ...style }}
              clearable={clearable}
              onChange={change}
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
        return time.getTime() < min;
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
    // 创建搜索帮助数据列表
    createSerachHelperList(list, valueKey) {
      return list.map(x => ({ value: x[valueKey] }));
    },
    // 创建树节点的值
    createInputTreeValue(fieldName, itemList) {
      let { text = '' } = this.deepFind(itemList, this.form[fieldName]) || {};
      return text;
    },
    // 树控件顶部文本帅选方法
    treeFilterTextHandle(key) {
      this.$refs[`tree-${key}`].filter(this[`${key}TreeFilterTexts`]);
    },
    // 树结构的筛选方法
    filterNodeHandle(value, data) {
      if (!value) return true;
      return data.text.indexOf(value) !== -1;
    },
    // 树节点单机事件
    treeNodeClickHandle(fieldName, { value, disabled }, node = {}, lastNode) {
      if (disabled) return;
      if (lastNode && node.childNodes.length) {
        node.expanded = !node.expanded;
      } else {
        this.form[fieldName] = value;
        this.visible[fieldName] = false;
      }
    },
    // 级联选择器值变化处理方法
    cascaderChangeHandle(fieldName, data) {
      this.form[fieldName] = data.map(x => x.value).join(',') || undefined;
      this[`${fieldName}CascaderTexts`] = data.map(x => x.text).join('/');
      // 强制重新渲染组件
      this.$forceUpdate();
    },
    // 级联选择器值变化处理方法
    cascaderGroupChangeHandle(fieldName, i, data) {
      this.form[fieldName][i] = data.map(x => x.value).join(',') || '';
      this[`${fieldName + i}CascaderGroupTexts`] = data.map(x => x.text).join('/');
      // 强制重新渲染组件
      this.$forceUpdate();
    },
    cascaderGroupHandle(fieldName, i, type) {
      type === 'add' ? this.form[fieldName].splice(i + 1, 0, ['']) : this.form[fieldName].splice(i, 1);
      this.form[fieldName].map((x, n) => {
        this[`${fieldName + n}CascaderGroupTexts`] = x;
      });
      this.$forceUpdate();
    },

    // 文件上传的 change 事件
    fileChangeHandle(fieldName, val) {
      this.form[fieldName] = val;
      this.doFormItemValidate(fieldName);
    },
    createFormItem() {
      return this.list
        .filter(x => !x.hidden)
        .map(item => {
          const VNode = !this[item.type] ? null : item.render ? this.RENDER_FORM_ITEM(item) : this[item.type](item);
          VNode['type'] = item.type;
          VNode['cols'] = item.selfCols;
          VNode['offsetLeft'] = item.offsetLeftCols;
          VNode['offsetRight'] = item.offsetRightCols;
          return VNode;
        });
    },
    doClearValidate($compRef) {
      $compRef && $compRef.clearValidate();
    },
    doFormItemValidate(fieldName) {
      this.$refs.form.validateField(fieldName);
    },
    excuteFormData(form) {
      this.formItemList
        .filter(x => ['RANGE_INPUT_NUMBER', 'RANGE_TIME_SELECT'].includes(x.type) || (x.type === 'INPUT' && x.numberFormat))
        .forEach(item => {
          const fieldName = item.fieldName;
          if (form[fieldName].length > 0) {
            if (item.numberFormat) {
              form[fieldName] = form[fieldName].replace(/,\s+/g, '');
            } else {
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
    enterEventHandle(ev) {
      if (ev.keyCode !== 13) return;
      this.submitForm(ev);
    },
    submitForm(ev) {
      ev && ev.preventDefault();
      let isErr;
      this.excuteFormData(this.form);
      this.$refs.form.validate(valid => {
        isErr = !valid;
        if (!valid) {
          this.$message({ title: '错误信息', message: `验证有误，请检查数据格式和必填项!`, type: 'error' });
          return null;
        }
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
          // 价格默认值4位 显示2位数
          if (item.precision) {
            if ((this.form[item.fieldName + 'Format'] * 1).toFixed(item.precision) * 1 === obj[item.fieldName]) {
              obj[item.fieldName] = Number(this.form[item.fieldName + 'Format']);
            }
          }
        });
        this.$emit('formChange', Object.assign({}, obj));
      });
      return isErr;
    },

    clearValidateForm() {
      this.$nextTick(() => this.$refs.form.resetFields());
    },
    resetForm() {
      this.$refs.form.resetFields();
      this.excuteFormData(this.form);
    },
    createFormLayout() {
      const colSpan = 24 / this.cols;
      const formItems = this.createFormItem().filter(item => item !== null);
      const colFormItems = formItems.map((Node, i) => {
        const spans = _.isUndefined(Node.cols) ? colSpan : Node.cols * colSpan;
        const offsetLeft = _.isUndefined(Node.offsetLeft) ? 0 : Node.offsetLeft * colSpan;
        const offsetRight = _.isUndefined(Node.offsetRight) ? 0 : this.toPercent(Node.offsetRight / this.cols);
        return (
          <el-col
            key={i}
            offset={offsetLeft}
            span={Node.type !== 'BREAK_SPACE' ? spans : 24}
            style={{ marginRight: offsetRight, minHeight: Node.type !== 'BREAK_SPACE' && Node.type !== 'CHECKBOX' ? '63px' : '20px' }}
          >
            {Node}
          </el-col>
        );
      });
      return colFormItems;
    },
    createFormButton() {
      const colSpan = 24 / this.cols;
      return this.list.length && this.isSubmitBtn && this.formType !== 'show' ? (
        <el-row gutter={10}>
          <el-col key="-" style={{ minHeight: '30px' }} span={colSpan}>
            <el-form-item label={''}>
              <el-button size="mini" type="primary" onClick={this.submitForm}>
                {this.formType === 'add' ? '保 存' : '修 改'}
              </el-button>
              <el-button size="mini" onClick={this.resetForm}>
                重 置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      ) : null;
    },
    // 日期格式化
    formatDate(val, vf) {
      const arr = Array.isArray(val) ? val : [val];
      const res = arr.map(x => {
        return !x ? x : moment(x).format(vf.replace('yyyy', 'YYYY').replace('dd', 'DD'));
      });
      return Array.isArray(val) ? res : res[0];
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
    // 函数防抖
    debounce(fn, delay) {
      return function(...args) {
        fn.timer && clearTimeout(fn.timer);
        fn.timer = setTimeout(() => fn.apply(this, args), delay);
      };
    },
    // 转百分比
    toPercent(num) {
      return Number(num * 100).toFixed(5) + '%';
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
    const { form, rules, labelWidth } = this;
    // label-width={`${labelWidth}px`}
    return (
      <div class="form-panel">
        <el-form ref="form" size="mini" model={form} rules={rules} nativeOnSubmit={ev => ev.preventDefault()}>
          <el-row gutter={10}>{this.createFormLayout()}</el-row>
          {this.createFormButton()}
        </el-form>
      </div>
    );
  }
};
</script>

<style lang="less">
.form-panel {
  background: #fff;
  .el-checkbox-group {
    font-size: 12px;
  }
  .el-input__inner {
    padding-left: 5px;
  }
  .el-input {
    input[type='password']::-ms-clear {
      display: none;
    }
    input[type='password']::-ms-reveal {
      display: none;
    }
  }

  .el-col {
    min-height: 62px;
    .el-form-item {
      margin-bottom: 0;
      .el-form-item__label {
        height: 23px;
        line-height: 23px;
        font-size: @textSizeSecondary;
        padding-right: @modulePadding;
        .label-wrap {
          display: inline-block;
          // max-width: calc(100% - 10px);
          .el-input__inner {
            border-color: @borderColor;
            padding: 0 8px;
            & + span.el-input__suffix {
              right: 0;
            }
          }
          .bmwIcon {
            font-size: 12px;
          }
        }
      }
      .el-form-item__content {
        line-height: 28px;
        float: left;
        width: 100%;
        display: block;
        .el-input__inner {
          line-height: 30px;
          height: 30px;
          line-height: 30px\0;
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
          width: 10%;
          padding-left: 0;
          padding-right: 0;
        }
        .el-range__close-icon {
          width: 20px;
        }
      }
      .desc-icon {
        padding: 0px 6px;
        font-size: 12px;
        vertical-align: middle;
      }
      .desc-text {
        font-size: @textSizeSecondary;
      }
    }
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
.BREAK_SPACECss {
  margin-bottom: 5px;
  font-size: 14px;
  i {
    font-size: 14px;
  }
  span {
    font-weight: bold;
    padding-left: 5px;
    color: #4d4d4d;
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
</style>
