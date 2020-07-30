<style lang="less">
@import "./menuTemplate.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="100" class="search-form">
              <Form-item label="模版名称" prop="name">
                <Input
                  type="text"
                  v-model="searchForm.name"
                  clearable
                  placeholder="请输入模版名称"
                  style="width: 200px"
                />
              </Form-item>
     
              <Form-item style="margin-left:-35px;" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
              </Form-item>
            </Form>
          </Row>
          <Row class="operation">
            <Button @click="add" type="primary" icon="md-add">新增</Button>
            <Button @click="delAll" icon="md-trash">删除</Button>
            <circleLoading v-if="operationLoading"/>
          </Row>
          <Row>
            <Alert show-icon>
              已选择
              <span class="select-count">{{selectCount}}</span> 项
              <a class="select-clear" @click="clearSelectAll">清空</a>
            </Alert>
          </Row>
          <Row>
            <Table
              :loading="loading"
              border
              :columns="columns"
              :data="data"
              sortable="custom"
              @on-sort-change="changeSort"
              @on-selection-change="showSelect"
              ref="table"
            ></Table>
          </Row>
          <Row type="flex" justify="end" class="page">
            <Page
              :current="searchForm.pageNumber"
              :total="total"
              :page-size="searchForm.pageSize"
              @on-change="changePage"
              @on-page-size-change="changePageSize"
              :page-size-opts="[10,20,50]"
              size="small"
              show-total
              show-elevator
              show-sizer
            ></Page>
          </Row>
        </Card>
      </Col>
    </Row>
    <Modal
      :title="modalTitle"
      v-model="modalVisible"
      :mask-closable="false"
      :width="600"
      :styles="{top: '30px'}">
      <Form ref="formItem" :model="formItem" :label-width="120" :rules="formItemValidate">
        <FormItem label="模版名称" prop="name">
            <Input type="text" v-model="formItem.name" clearable placeholder="请输入模版名称" style="width: 200px"/>
        </FormItem>

        <FormItem label="自定义Json" prop="menuJson">
            <Input v-model="formItem.menuJson" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入自定义Json"/>
        </FormItem>
      
        <FormItem label="描述" prop="description">
            <Input v-model="formItem.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入描述"/>
        </FormItem>

      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelBt">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitBt">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getMenuTemplatePage,
  addMenuTemplate,
  editMenuTemplate,
  delMenuTemplate
} from "@/api/wechat";
import {
  getDictDataByType
} from "@/api/index";
import { debug } from 'util';
 

export default {
  name: "builder-code",
  components: {
 
  },
  data() {
    return {
      loading: true,
      operationLoading: false,
      selectCount: 0,
      selectList: [],
      searchKey: "",
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        name: ""
      },
      //窗口
      modalType: 0,
      modalVisible: false,
      modalTitle: "",
      formItem: {
        name:'',
        menuJson:'',
        description:'',
      },
      formItemValidate: {
        name: [
          { required: true, message: "模版名称不能为空", trigger: "blur" }
        ]
      },
      submitLoading: false,
      //table 列表字段
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left"
        },
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          title: "模版名称",
          key: "name",
          minWidth: 120,
          sortable: true,
        },
        {
          title: "描述",
          key: "description",
          minWidth: 100
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          width: 150
        },
        {
          title: "操作",
          key: "action",
          width: 220,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h("div", [
               h(
                "Button",
                {
                  props: {
                    type: "success",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.editMenu(params.row);
                    }
                  }
                },
                "自定义菜单"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      data: [],
      total: 0,
      dictAccountType: []
    };
  },
  methods: {
    init() {
      this.getList();
      this.getDictAccountTypeData();
    },
    //加载数字字典
    getDictAccountTypeData() {
      // 获取性别字典数据
      getDictDataByType("wx_account_type").then(res => {
        if (res.success) {
          this.dictAccountType = res.result;
        }
      });
    },

    //翻页
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getList();
      this.clearSelectAll();
    },
    //每页条数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getList();
    },
    //排序
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getList();
    },

    showSelect(e) {
      this.exportData = e;
      this.selectList = e;
      this.selectCount = e.length;
    },
    //清空
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },

    //搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getList();
    },
    //重置
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      // 重新加载数据
      this.getList();
    },
    //查询列表
    getList() {
      // 多条件搜索用户列表
      this.loading = true;
      getMenuTemplatePage(this.searchForm).then(res => {
        this.loading = false;
        if (res.success === true) {
          this.data = res.result.content;
          this.total = res.result.totalElements;
        }
      });
    },

    //编辑
    editMenu(v) {
      this.$router.push({name:'customMenu',query: {id: v.id, name: v.name}})
    },
   
    //新增按钮操作
    add() {
      this.modalType = 0;
      this.modalTitle = "新增";
      this.$refs.formItem.resetFields();
      this.modalVisible = true;
    },
    //编辑
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      this.$refs.formItem.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      this.formItem = data;
      this.modalVisible = true;
    },
    //取消
    cancelBt() {
      this.modalVisible = false;
    },
    //提交
    submitBt() {
      this.$refs.formItem.validate(valid => {
        if (valid) {
          //添加
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id
            delete this.formItem.id;
            this.submitLoading = true;
            addMenuTemplate(this.formItem).then(res => {
              this.submitLoading = false;
              if (res.success === true) {
                this.$Message.success(res.message);
                this.getList();
                this.modalVisible = false;
              }
            });
          } else {
            // 编辑
            this.submitLoading = true;
            editMenuTemplate(this.formItem).then(res => {
              this.submitLoading = false;
              if (res.success === true) {
                this.$Message.success("操作成功");
                this.getList();
                this.modalVisible = false;
              }
            });
          } 
        }
      });
    },
    //批量删除
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          this.operationLoading = true;
          delMenuTemplate(ids).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getList();
            }
          });
        }
      });
    },
    //单个删除
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除【" + v.name + "】?",
        onOk: () => {
          this.operationLoading = true;
          delMenuTemplate(v.id).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.getList();
            }
          });
        }
      });
    },
  
    
  },
  mounted() {
    this.init();
  }
};
</script>