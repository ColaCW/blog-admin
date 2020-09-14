<template>
  <div>
    <TopFilter :list="topFilter" :cols="4" :collapse="true" @filterChange="changeHandle"></TopFilter>

    <BaseTable
      ref="table"
      :tableName="'博客分类'"
      :columns="columns"
      :fetchapi="fetchapi"
      :params="fetchParams"
      :datakey="'records'"
      :onRowSelectChange="arr => (this.chooseArr = arr)"
      columnsRef="blogCategory"
    >
      <template slot="controls">
        <div class="controlsCss">
          <el-button type="text" icon="el-icon-circle-plus-outline" @click="openDetail('')">添加</el-button>
          <el-button type="text" icon="el-icon-delete" @click="deleteBatch">批量删除</el-button>
        </div>
      </template>
    </BaseTable>

    <BaseDialog :title="title" :visible.sync="detailDialogVisible" :width="'700px'" :containerStyle="{ height: 'calc(100% - 60px)', 'text-align': 'center', overflow: 'auto', paddingBottom: '20px' }">
      <FormPanel ref="formPanel" :list="formList" :cols="2" :isSubmitBtn="false" @formChange="changeHandle1"></FormPanel>
      <div style="text-align: center; margin-top:15px">
        <el-button @click="detailDialogVisible = false" type="info">取 消</el-button>
        <el-button @click="save" type="primary">{{ title == '新增' ? '新建' : '保存' }}</el-button>
      </div>
    </BaseDialog>
  </div>
</template>

<script>
import { search, getById, add, alter, del, deleteBatch } from '@/api/blogManagement/blogCategory/index';

export default {
  name: 'blogCategory',
  components: {},
  data() {
    return {
      topFilter: this.createTopFilter(),
      columns: this.createTableColumns(),
      fetchapi: search,
      fetchParams: { xhrAbort: false },
      chooseArr: [], // 选中行
      formList: this.createFormList(), // 表单
      detailDialogVisible: false,
      title: '新增',
      saveData: {} // 保存对象
    };
  },
  created() {},
  methods: {
    // 头部搜索
    createTopFilter() {
      return [
        {
          type: 'INPUT',
          label: 'id',
          fieldName: 'id'
        },
        {
          type: 'INPUT',
          label: '分类名称',
          fieldName: 'name'
        },
        {
          type: 'INPUT',
          label: '状态',
          fieldName: 'status'
        },
        {
          type: 'INPUT',
          label: '备注',
          fieldName: 'remark'
        },
        {
          type: 'RANGE_DATE',
          label: '创建日期',
          fieldName: 'createdAtBegin|createdAtEnd',
          valueFormat: 'yyyy-MM-dd',
          placeholder: '请选择'
        },
        {
          type: 'INPUT',
          label: '创建人',
          fieldName: 'createdName'
        }
      ];
    },
    // 搜索
    changeHandle(val) {
      this.fetchParams = Object.assign({}, val, { xhrAbort: false });
    },
    // 表格
    createTableColumns() {
      return [
        {
          title: '操作',
          dataIndex: 'column-action',
          width: 80,
          render: props => {
            return (
              <div>
                <el-button size="mini" type="text" title="编辑" onClick={() => this.openDetail(props.row.id)}>
                  <i class="el-icon-edit-outline" />
                </el-button>
                <el-button size="mini" type="text" title="删除" onClick={() => this.del(props.row.id)}>
                  <i class="el-icon-delete" />
                </el-button>
              </div>
            );
          }
        },
        {
          title: 'Id',
          dataIndex: 'id',
          width: '100px'
        },
        {
          title: '分类名称',
          dataIndex: 'name'
        },
        {
          title: '是否有效',
          dataIndex: 'isValid'
        },
        {
          title: '备注',
          dataIndex: 'remark'
        },
        {
          title: '创建时间',
          dataIndex: 'createdAt'
        }
      ];
    },
    // 表单
    createFormList() {
      return [
        {
          type: 'INPUT',
          label: 'Id',
          fieldName: 'id',
          initialValue: ''
        },
        {
          type: 'INPUT',
          label: '分类名称',
          fieldName: 'name',
          initialValue: ''
        },
        {
          type: 'INPUT',
          label: '是否有效',
          fieldName: 'isValid',
          initialValue: ''
        },
        {
          type: 'INPUT',
          label: '备注',
          fieldName: 'remark',
          initialValue: ''
        },
        {
          type: 'INPUT',
          label: '创建人ID',
          fieldName: 'createdBy',
          disabled: true,
          initialValue: ''
        },
        {
          type: 'INPUT',
          label: '创建人姓名',
          fieldName: 'createdName',
          disabled: true,
          initialValue: ''
        },
        {
          type: 'DATE',
          label: '创建时间',
          fieldName: 'createdAt',
          disabled: true,
          initialValue: ''
        },
        {
          type: 'INPUT',
          label: '更新人ID',
          fieldName: 'updatedBy',
          disabled: true,
          initialValue: ''
        },
        {
          type: 'INPUT',
          label: '更新人姓名',
          fieldName: 'updatedName',
          disabled: true,
          initialValue: ''
        },
        {
          type: 'DATE',
          label: '更新时间',
          fieldName: 'updatedAt',
          disabled: true,
          initialValue: ''
        }
      ];
    },
    // 打开详情弹框
    async openDetail(id) {
      if (id) {
        this.title = '编辑';
        const res = await getById(id);
        this.saveData = res.data;
        this.detailDialogVisible = true;
        this.formList.map(x => {
          x.initialValue = this.saveData[x.fieldName];
        });
      } else {
        this.title = '新增';
        this.detailDialogVisible = true;
        this.saveData = {};
        this.formList.map(x => {
          x.initialValue = '';
        });
      }
    },
    // 删除
    del(id) {
      this.$confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        align: 'center'
      })
        .then(() => {
          del(id).then(res => {
            this.fetchParams = { ...this.fetchParams };
            this.$message.success('删除成功');
          });
        })
        .catch(() => {});
    },
    // 批量删除
    deleteBatch() {
      if (this.chooseArr.length == 0) {
        this.$message({
          message: '请选择要删除的行',
          type: 'warning'
        });
        return;
      }
      this.$confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        align: 'center'
      })
        .then(() => {
          let ids = '';
          for (let i = 0; i < this.chooseArr.length; i++) {
            if (i > 0) {
              ids += ',';
            }
            ids += this.chooseArr[i].id;
          }

          deleteBatch(ids).then(res => {
            this.fetchParams = { ...this.fetchParams };
            this.$message({
              message: '删除成功',
              type: 'success'
            });
          });
        })
        .catch(() => {
          this.$refs.table.clearSelectionHandle();
        });
    },
    // 保存
    save() {
      this.$refs.formPanel.SUBMIT_FORM();
    },
    // 表单提交回调
    async changeHandle1(val) {
      this.saveData = Object.assign(this.saveData, val);
      if (val.id) {
        const res = await alter(this.saveData);
        this.$message.success('修改成功');
      } else {
        const res = await add(this.saveData);
        this.$message.success('新增成功');
      }
      // 刷新表格
      this.fetchParams = Object.assign({}, this.fetchParams, { xhrAbort: false });
      // 关闭弹框
      this.detailDialogVisible = false;
    }
  }
};
</script>
<style scoped></style>
