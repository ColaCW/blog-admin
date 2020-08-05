<script>
export default {
  name: 'Pagination',
  props: {
    pagination: {
      type: Object,
      required: true
    },
    onPageChange: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {};
  },
  methods: {
    handleCurrentChange(val) {
      const { pageSize } = this.pagination;
      this.pagination.currentPage = val;
      this.onPageChange({ currentPage: val, pageSize });
    },
    handleSizeChange(val) {
      const { currentPage } = this.pagination;
      this.pagination.pageSize = val;
      this.onPageChange({ currentPage, pageSize: val });
    }
  },
  render() {
    const {
      pagination: { currentPage, pageSize, total }
    } = this;
    return (
      <el-pagination
        class="pagination"
        background
        layout="prev, pager, next, sizes, jumper"
        current-page={currentPage}
        page-size={pageSize}
        page-sizes={[10, 20, 30, 40]}
        total={total}
        pager-count={5}
        small
        on-size-change={this.handleSizeChange}
        on-current-change={this.handleCurrentChange}
      />
    );
  }
};
</script>

<style lang="less" scoped>
.pagination {
  padding: 20px 0 20px 0px;
  text-align: right;
  /deep/ .el-pagination__sizes {
    .el-input--mini {
      .el-input__inner {
        height: 22px !important;
        line-height: 22px !important;
      }
    }
  }
  /deep/ .el-pagination__jump {
    margin-left: 0;
  }
}
</style>
