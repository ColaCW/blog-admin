<script>
import _ from 'lodash';
import moment from 'moment';
import Pagination from './Pagination';
import { mergeProps } from '@/utils/props-util';

export default {
  name: 'BaseTable',
  components: {
    Pagination
  },
  props: {
    columns: {
      type: Array,
      required: true,
      default: () => []
    },
    fetchapi: Function,
    params: {
      type: Object,
      default: () => ({})
    },
    tableName: {
      type: String,
      default: ''
    },
    // 表格是否分页
    isPagination: {
      type: Boolean,
      default: true
    },
    selectionType: {
      type: String,
      default: 'multiple'
    },
    dataSource: {
      type: [Array, Object],
      default: () => []
    },
    height: {
      type: [Number, String]
    },
    datakey: {
      type: String,
      default: 'items'
    },
    isSelectColumn: {
      type: Boolean,
      default: true
    },
    onRowSelectChange: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    this.minHeight = 500; // table 最小高度
    return {
      tableList: [], // 表格数据
      tableHeight: this.height || this.minHeight, // 高度
      selectionRows: [], // table 选中行
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      }, // 分页对象信息
      loading: false, // 表格加载
      // 对表格的操作记录
      actionsLog: {
        update: [],
        insert: [],
        remove: [],
        required: [],
        format: [],
        searchHelper: []
      }
    };
  },
  computed: {
    isShowPagination() {
      return this.isPagination && Boolean(this.fetchapi);
    },
    fetchParams() {
      const { currentPage, pageSize } = this.pagination;
      const pagination = this.isShowPagination ? { currentPage: currentPage, pageSize: pageSize } : {};
      const queries = {
        ...this.params,
        ...pagination
      };
      // 移除 noJumper 属性
      delete queries.noJumper;
      return queries;
    }
  },
  watch: {
    height(nextProps) {
      this.tableHeight = nextProps || this.minHeight;
    },
    fetchParams(nextProps, prevProps) {
      this.clearSelectionHandle(); // 清空多选的数据
      const onlyPageChange = this.isOnlyPaginationChange(nextProps, prevProps);
      if (!onlyPageChange) {
        // 如果搜索条件发生改变，页码重置为1
        this.pagination.currentPage = 1;
      }
      this.getTableData();
    }
  },
  created() {},
  mounted() {
    this.clearSelectionHandle(); // 清空多选的数据
    this.getTableData();
  },
  methods: {
    // ajax 获取服务端列表数据
    async getTableData() {
      // 没有 api 接口，xhrAbort: true，取消本次请求
      if (!this.fetchapi || this.fetchParams.xhrAbort) return;
      const params = { ...this.fetchParams };
      // 移除 xhrAbort 属性
      delete params.xhrAbort;
      this.loading = true;
      try {
        const res = await this.fetchapi(params);
        if (res.resultCode === 200) {
          this.pagination.total = res.data.total;
          this.tableList = !this.datakey ? res.data : _.get(res.data, this.datakey, []);
        }
      } catch (e) {
        this.tableList = [];
      }
      this.loading = false;
    },
    handleSelect(selectionRows) {
      for (let i = 0; i < selectionRows.length; i++) {
        for (let j = i + 1; j < selectionRows.length; j++) {
          if (selectionRows[i].index == selectionRows[j].index) {
            selectionRows.splice(i, 1);
          }
        }
      }
      for (let i = 0; i < selectionRows.length; i++) {
        for (let j = i + 1; j < selectionRows.length; j++) {
          if (selectionRows[i].index == selectionRows[j].index) {
            selectionRows.splice(i, 1);
          }
        }
      }
      return JSON.parse(JSON.stringify(selectionRows));
    },
    // 是否仅有分页参数产生变化
    isOnlyPaginationChange(nextProps, prevProps) {
      const diff = Object.keys(this.difference(nextProps, prevProps));
      return diff.length === 1 && (diff.includes('currentPage') || diff.includes('pageSize'));
    },
    // 比对两个对象的差异
    difference(newVal, oldVal) {
      const res = {};
      for (let key in newVal) {
        if (!_.isEqual(newVal[key], oldVal[key])) {
          res[key] = newVal[key];
        }
      }
      return res;
    },
    // 清空 table row 的选中
    clearSelectionHandle() {
      this.$refs.appTable.clearSelection();
      if (this.selectionType === 'single') {
        this.handleSelectionChange([]);
      }
    },
    // 创建表格列字段
    createColumns(columns) {
      let target = this.createTableColumns(columns);
      if (this.isSelectColumn) {
        target = [this.selectionColumnRender(), ...target];
      }
      return target;
    },
    // 单元格编辑后的渲染方法
    editedScopedRender(column, props) {
      const { editType } = column;
      let res = _.get(props.row, column.dataIndex);
      if (editType === 'select' || editType === 'select-multiple' || editType === 'checkbox') {
        if (Array.isArray(column.editItems) && column.editItems.length) {
          const editItems = editType === 'checkbox' ? column.editItems.map(x => ({ value: x['trueValue'] || x['falseValue'], ...x })) : column.editItems;
          res = Array.isArray(res) ? res : [res];
          res = editItems
            .filter(x => res.includes(x.value))
            .map(x => x.text)
            .join(', ');
        }
      }
      res = this.numberFormat(column, res);
      res = this.dateFormat(column, res);
      return res;
    },
    // 金融格式数字的格式化方法
    numberFormat(column, input) {
      const { precision } = column;
      if (precision >= 0 && !isNaN(Number(input))) {
        input = Number(input).toFixed(precision);
      }
      if (column.numberFormat) {
        input = this.formatNumber(input);
      }
      return input;
    },
    // 数字格式化
    formatNumber(value) {
      if (value === null || value === undefined) return value;
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
    // 日期的格式化方法
    dateFormat(column, input) {
      if (column.dateFormat) {
        const dateFormat = column.dateFormat.replace('yyyy', 'YYYY').replace('dd', 'DD');
        const dateVal = moment(input).format(dateFormat);
        input = dateVal === 'Invalid date' ? input : dateVal;
      }
      return input;
    },
    // 创建单元格渲染节点
    createCellNode(JSXNode, msgs = [], isTooltip) {
      const cls = {
        [`el-form-item`]: true,
        [`is-error`]: !!msgs.length
      };
      const domStyle = isTooltip ? { whiteSpace: 'pre' } : null;
      return (
        <span class={cls} style={domStyle}>
          {JSXNode}
          {msgs.map(msg => (
            <div class="form-item-error">{msg}</div>
          ))}
        </span>
      );
    },
    // 创建表格列字段
    createTableColumns(columns) {
      const tableColumns = columns
        .filter(x => !x.hidden)
        .map((x, i) => {
          const defaultRender = !x.render
            ? {
                scopedSlots: {
                  default: props => {
                    return this.createCellNode(this.editedScopedRender(x, props), [], x.showOverflowTooltip);
                  }
                }
              }
            : {};
          const render = x.render
            ? {
                scopedSlots: {
                  default: props => {
                    const errMessages = [];
                    // 单元格格式校验
                    if (this.actionsLog.format.some(x => x.xUid === props.row._uid && x.yDataIndex === columns[i].dataIndex)) {
                      errMessages.push(`格式不正确`);
                    }
                    return this.createCellNode(x.render(props, h), errMessages, x.showOverflowTooltip);
                  }
                }
              }
            : {};
          const wrapProps = mergeProps(defaultRender, render);
          return (
            <el-table-column
              key={`${x.dataIndex}-${i}`}
              prop={x.dataIndex}
              label={x.title}
              width={x.width}
              fixed={x.fixed}
              align={x.dataIndex === 'column-action' ? 'center' : x.align}
              className={x.className}
              showOverflowTooltip={x.showOverflowTooltip}
              {...wrapProps}
            ></el-table-column>
          );
        });
      return tableColumns;
    },
    // 可选择列渲染方法
    selectionColumnRender() {
      return this.selectionType === 'single' ? (
        <el-table-column
          key="-"
          prop="-"
          label={this.$t('common.tableSelect')}
          fixed="left"
          width={this.$t('common.tableSelect') === 'Select' ? '60' : '50'}
          scopedSlots={{
            default: props => {
              return (
                <el-radio
                  value={_.get(this.selectionRows[0], '_uid')}
                  onInput={val => {
                    const row = this.list.find(x => x._uid === val);
                    if (!row) return;
                    this.handleSelectionChange(row);
                  }}
                  label={props.row._uid}
                  disabled={this.canRowSelected(props.row)}
                  nativeOnClick={e => e.stopPropagation()}
                />
              );
            }
          }}
        />
      ) : (
        <el-table-column key="-" prop="-" type="selection" fixed="left" align="center" reserveSelection={true} width="50" />
      );
    },
    // 根据表头字数自动计算列宽度
    calcHeaderWidth(text = '') {
      let l = 0;
      let f = 14;
      if (text.charCodeAt(0) > 255) {
        //汉字
        l = text.length || 1;
      } else {
        //英文
        l = text.length / 2 || 1;
      }
      // 每个字大小，其实是每个字的比例值，大概会比字体大小差不多大一点
      return f * l + 65;
    },
    // 分页信息改变回调
    onPageChange(val) {},
    // table row 选中状态变化时
    handleSelectionChange(rows) {
      rows = Array.isArray(rows) ? rows : [rows];
      if (_.isEqual(rows, this.selectionRows)) return;
      this.selectionRows = rows;
      this.debounce(this.onRowSelectChange, 0)(rows);
    },
    // 函数防抖
    debounce(fn, delay) {
      return function(...args) {
        fn.timer && clearTimeout(fn.timer);
        fn.timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }
  },
  render() {
    const { columns, tableName, isShowPagination, pagination, tableList, selectionRows } = this;
    const controls = this.$slots.controls;
    const paginationProps = {
      props: { pagination, onPageChange: this.onPageChange }
    };
    let height = this.height !== 'auto' ? { height: this.tableHeight } : null;
    const tableParams = {
      ref: 'appTable',
      props: {
        size: 'mini',
        border: false,
        ...height,
        rowKey: record => record._uid,
        data: tableList,
        stripe: true
      },
      on: {
        'selection-change': this.handleSelectionChange
      },
      style: { width: '100%' }
    };
    return (
      <div class="table-wrapper">
        <div class="toper-card">
          <section style="font-size: 14px;">
            <i class="el-icon-s-help"></i>
            <span class="tableName">
              {tableName} <i> - </i>
            </span>
            <span>
              {pagination.total}/{selectionRows.length}
            </span>
            <el-button type="text" onClick={() => this.clearSelectionHandle()}>
              清空
            </el-button>
          </section>
          <section>{controls}</section>
        </div>
        <el-table {...tableParams}>{this.createColumns(columns)}</el-table>
        {isShowPagination && <Pagination {...paginationProps} />}
      </div>
    );
  }
};
</script>

<style lang="less" scoped>
@tableBgColor: #f2f2f2;
@tableHoverColor: #e6f7ff;
@dangerColor: #f5222d;

.table-wrapper {
  background: #ffffff;
  overflow-x: hidden;
  .toper-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    font-size: 0;
  }
  .toper-card .tableName {
    color: #4d4d4d;
    font-size: 14px;
    font-weight: 700;
  }
}
/deep/ .el-table th,
.el-table tr {
  background: #deeaf8 !important;
}
</style>
