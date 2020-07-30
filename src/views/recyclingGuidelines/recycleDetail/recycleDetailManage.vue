<style lang="less">
@import "./recycleDetailManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="垃圾名称" prop="name">
                <Input
                  type="text"
                  v-model="searchForm.name"
                  clearable
                  placeholder="请输入垃圾名称"
                  style="width: 200px"
                />
              </Form-item>
                <Form-item label="创建时间">
                  <DatePicker
                    v-model="selectDate"
                    type="daterange"
                    format="yyyy-MM-dd"
                    clearable
                    @on-change="selectDateRange"
                    placeholder="选择起始时间"
                    style="width: 200px"
                  ></DatePicker>
                </Form-item>
              <Form-item style="margin-left:-35px;" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
               
              </Form-item>
            </Form>
          </Row>
          <Row class="operation">
            <Button @click="add" type="primary" icon="md-add">添加垃圾</Button>
            <Button @click="delAll" icon="md-trash">批量删除</Button>
            <!-- <Dropdown @on-click="handleDropdown">
              <Button>更多操作
                <Icon type="md-arrow-dropdown"/>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="refresh">刷新</DropdownItem>
                <DropdownItem name="exportData">导出所选数据</DropdownItem>
                <DropdownItem name="exportAll">导出全部数据</DropdownItem>
                <DropdownItem name="importData">导入数据</DropdownItem>
              </DropdownMenu>
            </Dropdown> -->
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
            <Table
              :columns="exportColumns"
              :data="exportData"
              ref="exportTable"
              style="display:none"
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
      v-model="userModalVisible"
      :mask-closable="false"
      :width="500"
      :styles="{top: '30px'}"
    >
      <Form ref="userForm" :model="userForm" :label-width="70" :rules="userFormValidate">
        <FormItem label="垃圾名称" prop="name">
          <Input v-model="userForm.name" autocomplete="off"/>
        </FormItem>
        <FormItem label="所属分类">
          <!-- <Input v-model="userForm.classifyId" autocomplete="off"/> -->
          <rubbishClassify-tree-choose width="285px" @on-change="handleSelectClassifyTree" @getEntity="getEntity"  ref="classifyTree"></rubbishClassify-tree-choose>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelUser">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitUser">提交</Button>
      </div>
    </Modal>
    <Modal v-model="modalExportAll" title="确认导出" :loading="loadingExport" @on-ok="exportAll">
      <p>您确认要导出全部 {{total}} 条数据？</p>
    </Modal>
  </div>
</template>

<script>
import{
  deleteRubbishDetail,
  editRubbishDetail,
  getRubbishDetail,
  addRubbishDetail,
  getAllSpeClassify,
  getByClassifyId,
  disableGoods,
  enableGoods,
  getGoodsList,
  addGoods,
  editGoods,
  deleteGoods
}from "@/api/recycleGuidelines";
import {
  //getUserListData,
  //disableGoods,
  //enableGoods,
  //getGoodsList,
  deleteClassify,
  getByCondition,
  addClassify,
  getTestListData,
  getAllRoleList,
  addUser,
  editClassify,
  editUser,
  enableClassify,
  enableUser,
  disableClassify,
  disableUser,
  deleteUser,
  getAllUserData,
  getDictDataByType
} from "@/api/index";
import expandRow from "./expand.vue";
import departmentChoose from "@/views/components/custom/department-choose";
import departmentTreeChoose from "@/views/components/custom/department-tree-choose";
import classifyTreeChoose from "@/views/components/recycle/classify-tree-choose";
import rubbishClassifyTreeChoose from"@/views/components/recycle/rubbishClassify-tree-choose"
import uploadPicInput from "@/views/components/custom/upload-pic-input";
import circleLoading from "@/views/components/custom/circle-loading.vue";
export default {
  name: "user-manage",
  components: {
    circleLoading,
    expandRow,
    departmentChoose,
    departmentTreeChoose,
    rubbishClassifyTreeChoose,
    classifyTreeChoose,
    uploadPicInput
  },
  data() {
    const isEmpty = (rule, value, callback) => {
      if (value == null || value == undefined || (value === "")) {
      callback(new Error('必填项不能为空'))
      } else {
      callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("密码长度不得小于6位"));
      } else {
        callback();
      }
    };
    const validateMobile = (rule, value, callback) => {
      var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (!reg.test(value)) {
        callback(new Error("手机号格式错误"));
      } else {
        callback();
      }
    };
    return {
      parentNum:"",
      loading: true,
      operationLoading: false,
      loadingExport: true,
      modalExportAll: false,
      drop: false,
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      selectCount: 0,
      speClassify:[],
      selectList: [],
      dataDep: [],
      searchKey: "",
      searchForm: {
        name: "",
        description:"",
        status:"",
        classifyDescription:"",
        classifyName:"",
        classifyParentId:"",
         pageNumber: 1,
         pageSize: 10,
         sort: "createTime",
         order: "desc",
         startDate: "",
         endDate: ""
      },
      selectDate: null,
      modalType: 0,
      userModalVisible: false,
      modalTitle: "",
      userForm: {
        name: "",
        classifyId:"",
        parentId:"",
        sortOrder:0,
        classifyDescription:"",
        rubbishClassifyName:"",
        // mobile: "",
        // email: "",
        // sex: 1,
        // type: 0,
        // avatar: "",
        // roles: [],
        // departmentId: "",
        // departmentTitle: ""
      },
      userRoles: [],
      roleList: [],
      errorPass: "",
      userFormValidate: {
        classify:[
          { validator:isEmpty,trigger: "blur"}
        ],
        name: [
          { required: true, message: "垃圾名称不能为空", trigger: "blur" }
        ],
        description: [
          {required: true, message: "分类描述不能为空", trigger: "blur"}
        ],
        parentId: [
          {required: true, message:"父ID不能为空", trigger: "blur"}
        ],
        classifyId:[
          {required: true,message:"所属分类不能为空",trigger: "blur"}
        ],
        sortOrder: [
           {validator:isEmpty,trigger:'blur'}
        ],
        status: [
          {required:true,message:"状态不能为空"},
           {validator:isEmpty,trigger:'blur'}
        ]
        // mobile: [
        //   { required: true, message: "手机号不能为空", trigger: "blur" },
        //   { validator: validateMobile, trigger: "blur" }
        // ],
        // email: [
        //   { required: true, message: "请输入邮箱地址" },
        //   { type: "email", message: "邮箱格式不正确" }
        // ]
      },
      submitLoading: false,
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left"
        },
        {
          type: "expand",
          width: 50,
          fixed: "left",
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row
              }
            });
          }
        },
        {
          type: "index",
          width: 80,
          align: "center",
          fixed: "left",
          title:'序号'
        },
        {
          title:"垃圾名称",
          key:"name",
          minWidth: 80
        },
        {
          title:"商品描述",
          key:"description",
          minWidth: 120
        },
        {
          title:"分类名称",
          key:"rubbishClassifyName",
          minWidth:120
        },
        {
          title:"分类描述",
          key:"classifyDescription",
          minWidth:130,
          tooltip: true
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          minWidth:150
        },
        {
          title: "操作",
          key: "action",
          minWidth: 200,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            let enableOrDisable = "";
            if (params.row.status == 0) {
              enableOrDisable = h(
                "Button",
                {
                  props: {
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.disable(params.row);
                    }
                  }
                },
                "禁用"
              );
            } else {
              enableOrDisable = h(
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
                      this.enable(params.row);
                    }
                  }
                },
                "启用"
              );
            }
            return h("div", [
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
              // enableOrDisable,
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
      exportColumns: [
        {
          title: "用户名",
          key: "username"
        },
        {
          title: "头像",
          key: "avatar"
        },
        {
          title: "所属部门ID",
          key: "departmentId"
        },
        {
          title: "所属部门",
          key: "departmentTitle"
        },
        {
          title: "手机",
          key: "mobile"
        },
        {
          title: "邮箱",
          key: "email"
        },
        {
          title: "性别",
          key: "sex"
        },
        {
          title: "用户类型",
          key: "type"
        },
        {
          title: "状态",
          key: "status"
        },
        {
          title: "删除标志",
          key: "delFlag"
        },
        {
          title: "创建时间",
          key: "createTime"
        },
        {
          title: "更新时间",
          key: "updateTime"
        }
      ],
      data: [],
      exportData: [],
      total: 0,
      dictSex: []
    };
  },
  methods: {
    init() {
      this.getUserList();
    },
    getEntity(v){
      // console.log(JSON.stringify(v))
      //该分来的父id
      this.userForm.classifyId=v.parentId;
      this.userForm.parentId=v.id;

    },
    getDictSexData() {
      // 获取性别字典数据
      getDictDataByType("sex").then(res => {
        if (res.success) {
          this.dictSex = res.result;
        }
      });
    },
    handleSelectClassifyTree(v) {
      getByClassifyId(v[0]).then(res=>{
        this.userForm.classifyId=res.result.parentId;
        //this.userForm.parentId=v[0];
      })
      //this.userForm.classifyId = v[0];
      this.userForm.parentId=v[0];
    },
    addParent(){
      this.userForm.parentId=this.parentNum;
    },
    handleSeleClassify(v) {
      this.searchForm.classifyId = v;
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getUserList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getUserList();
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    getUserList() {
      // 多条件搜索用户列表
      this.loading = true;
      // 避免后台默认值
      // if (!this.searchForm.type) {
      //   this.searchForm.type = "";
      // }
      // if (!this.searchForm.status) {
      //   this.searchForm.status = "";
      // }
      getRubbishDetail(this.searchForm).then(res => {
        this.loading = false;
        if (res.success === true) {
          //this.data = res.result;
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getUserList();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.selectDate = null;
      this.searchForm.startDate = "";
      this.searchForm.endDate = "";
      this.selectDep = [];
      this.searchForm.departmentId = "";
      // 重新加载数据
      this.getUserList();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getUserList();
    },
    getRoleList() {
      getAllRoleList().then(res => {
        if (res.success === true) {
          this.roleList = res.result;
        }
      });
    },
    handleDropdown(name) {
      if (name === "refresh") {
        this.getUserList();
      } else if (name === "exportData") {
        if (this.selectCount <= 0) {
          this.$Message.warning("您还未选择要导出的数据");
          return;
        }
        this.$Modal.confirm({
          title: "确认导出",
          content: "您确认要导出所选 " + this.selectCount + " 条数据?",
          onOk: () => {
            this.$refs.exportTable.exportCsv({
              filename: "用户数据"
            });
          }
        });
      } else if (name === "exportAll") {
        this.modalExportAll = true;
      } else if (name === "importData") {
        this.$Modal.info({
          title: "暂未开发",
          content: "请期待"
        });
      }
    },
    exportAll() {
      getTestListData().then(res => {
        this.modalExportAll = false;
        if (res.success) {
          this.exportData = res.result;
          setTimeout(() => {
            this.$refs.exportTable.exportCsv({
              filename: "用户全部数据"
            });
          }, 1000);
        }
      });
    },
    cancelUser() {
      this.userModalVisible = false;
    },
    submitUser() {
      // console.log(this.userForm)
      this.$refs.userForm.validate(valid => {
        if (valid) {
          if (this.modalType === 0) {
            // 添加用户 避免编辑后传入id
             delete this.userForm.id;
            // delete this.userForm.status;
            // if (
            //   this.userForm.password == "" ||
            //   this.userForm.password == undefined
            // ) {
            //   this.errorPass = "密码不能为空";
            //   return;
            // }
            // if (this.userForm.password.length < 6) {
            //   this.errorPass = "密码长度不得少于6位";
            //   return;
            // }
            this.submitLoading = true;
            this.userForm.classifyId!==''?addRubbishDetail(this.userForm).then(res => {
              this.submitLoading = false;
              if (res.success === true) {
                this.$Message.success("操作成功");
                this.getUserList();
                this.userModalVisible = false;
              }
            }):(this.$Message.error("所属分类不能为空",this.submitLoading=false));
          } else {
            // 编辑
            this.submitLoading = true;
            editRubbishDetail(this.userForm).then(res => {
              this.submitLoading = false;
              if (res.success === true) {
                this.$Message.success("操作成功");
                this.getUserList();
                this.userModalVisible = false;
              }
            });
          }
        }
      });
    },
    handleUpload(v) {
      this.userForm.imgUrl = v;
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加商品";
      this.$refs.userForm.resetFields();
      this.$refs.classifyTree.initClassifyData();
      this.userModalVisible = true;
    },
    edit(v) {
      // console.log(this);
      this.modalType = 1;
      this.modalTitle = "编辑商品信息";
      this.$refs.userForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      data.status = String(data.status)
      this.userForm = data;

      getByClassifyId(data.parentId).then(res=>{
        this.title=res.result.name
        this.$refs.classifyTree.setSelectDep([data.parentId],this.title);
      })
      
      // this.$refs.classifyTree.setSelectDep([data.id], data.name);
      //  this.$refs.upload.setPicUrl(data.imgUrl);
      // let selectRolesId = [];
      // this.userForm.roles.forEach(function(e) {
      //   selectRolesId.push(e.id);
      // });
      // this.userForm.roles = selectRolesId;
      this.userModalVisible = true;
    },
    enable(v) {
      this.$Modal.confirm({
        title: "确认启用",
        content: "您确认要启用该商品吗 " + v.name + " ?",
        onOk: () => {
          this.operationLoading = true;
          enableGoods(v.id).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("操作成功");
              this.getUserList();
            }
          });
        }
      });
    },
    disable(v) {
      this.$Modal.confirm({
        title: "确认禁用",
        content: "您确认要禁用该商品吗 " + v.name + " ?",
        onOk: () => {
          this.operationLoading = true;
          disableGoods(v.id).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("操作成功");
              this.getUserList();
            }
          });
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除该垃圾吗 " + v.name + " ?",
        onOk: () => {
          this.operationLoading = true;
          deleteRubbishDetail(v.id).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.getUserList();
            }
          });
        }
      });
    },
    dropDown() {
      if (this.drop) {
        this.dropDownContent = "展开";
        this.dropDownIcon = "ios-arrow-down";
      } else {
        this.dropDownContent = "收起";
        this.dropDownIcon = "ios-arrow-up";
      }
      this.drop = !this.drop;
    },
    showSelect(e) {
      this.exportData = e;
      this.selectList = e;
      this.selectCount = e.length;
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
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
          deleteRubbishDetail(ids).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getUserList();
            }
          });
        }
      });
    }
  },
  mounted() {
    this.init();
    this.getRoleList();
  }
};
</script>