<style lang="less">
@import "./recycleGoodsManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="商品名称" prop="name">
                <Input
                  type="text"
                  v-model="searchForm.name"
                  clearable
                  placeholder="请输入商品名称"
                  style="width: 200px"
                />
              </Form-item>
              <Form-item label="商品描述" prop="description">
                <Input
                  type="text"
                  v-model="searchForm.description"
                  clearable
                  placeholder="请输入商品描述"
                  style="width: 200px"
                  />
              </Form-item>
              <!-- <Form-item label="所属分类" prop="classifyName">
                <Input
                  type="text"
                  v-model="searchForm.classifyName"
                  clearable
                  placeholder="请输入所属分类"
                  style="width: 200px"
                  />
              </Form-item> -->
              <Form-item label="所属分类" prop="classifyName">
                <i-select v-model="searchForm.classifyName" clearable style="width:200px">
                  <i-option v-for="item in secondClassify" :value="item.name" :label="item.name" :key="item.value"></i-option>
                </i-select>
              </Form-item>
              <span v-if="drop">
                              <Form-item label="分类描述" prop="classifyDescription">
                <Input
                  type="text"
                  v-model="searchForm.classifyDescription"
                  clearable
                  placeholder="请输入分类描述"
                  style="width: 200px"
                  />
              </Form-item>
                <Form-item label="状态" prop="status">
                  <Select
                    v-model="searchForm.status"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option value="0">正常启用</Option>
                    <Option value="-1">禁用</Option>
                  </Select>
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
              </span>
              <Form-item style="margin-left:-35px;" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
                <a class="drop-down" @click="dropDown">
                  {{dropDownContent}}
                  <Icon :type="dropDownIcon"></Icon>
                </a>
              </Form-item>
            </Form>
          </Row>
          <Row class="operation">
            <Button @click="add" type="primary" icon="md-add">添加商品</Button>
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
      :width="520"
      :styles="{top: '30px'}"
    >
      <Form ref="userForm" :model="userForm" :label-width="100" :rules="userFormValidate">
        <FormItem label="商品名称" prop="name">
          <Input v-model="userForm.name" autocomplete="off"/>
        </FormItem>
        <FormItem label="商品描述" prop="description">
          <Input v-model="userForm.description" autocomplete="off"/>
        </FormItem>
        <FormItem label="所属分类">
          <!-- <Input v-model="userForm.classifyId" autocomplnete="off"/> -->
          <classify-tree-choose width="285px" @on-change="handleSelectClassifyTree" ref="classifyTree"></classify-tree-choose>
        </FormItem>
        <FormItem label="规格分类" prop="specificationClassifyId">
          <i-select v-model="userForm.specificationClassifyId" style="width:200px" clearable>
            <i-option v-for="item in speClassify" :value="item.id" :label="item.name" :key="item.value"></i-option>
          </i-select>
        </FormItem>
        <Form-item label="图片" prop="imgUrl">
          <upload-pic-input @on-change="handleUpload" width="285px" ref="upload"></upload-pic-input>
        </Form-item>
        <FormItem label="预估最小价格" prop="minPrice">
          <Input v-model="userForm.minPrice" autocomplete="off"/>
        </FormItem>
        <FormItem label="预估最大价格" prop="maxPrice">
          <Input v-model="userForm.maxPrice" autocomplete="off"/>
        </FormItem>
        <FormItem label="排序" prop="sortOrder">
          <InputNumber :max="100" :min="0" v-model="userForm.sortOrder"></InputNumber>
          <span style="margin-left:5px">值越小越靠前</span>
          <!-- <Input v-model="userForm.sortOrder" autocomplete="off"/> -->
        </FormItem>
        <FormItem label="状态" prop="status">
          <!-- <Input v-model="userForm.status" autocomplete="off"/> -->
          <Select
          v-model="userForm.status"
          placeholde="请选择"
          clearable
          style="width:200px"
          >
          <Option value="0">正常启用</Option>
          <Option value="-1">禁用</Option>
          </Select>
        </FormItem>
        <!-- <el-form-item label="规格分类" prop="specificationClassifyId">
          <el-select class="filter-item" v-model="userForm.specificationClassifyId" placeholder="请输入">
            <el-option v-for="list in speClassify" :key="list.name" : label="list.id"
                                                    :value="list.id"></el-option>
          </el-select>
        </el-form-item> -->

        <!-- <FormItem label="密码" prop="password" v-if="modalType===0" :error="errorPass">
          <Input type="password" v-model="userForm.password" autocomplete="off"/>
        </FormItem> -->
        <!-- <FormItem label="邮箱" prop="email">
          <Input v-model="userForm.email"/>
        </FormItem>
        <FormItem label="手机号" prop="mobile">
          <Input v-model="userForm.mobile"/>
        </FormItem>
        <FormItem label="性别" prop="sex">
          <RadioGroup v-model="userForm.sex">
            <Radio v-for="(item, i) in dictSex" :key="i" :label="Number(item.value)">{{item.title}}</Radio>
          </RadioGroup>
        </FormItem>
        <Form-item label="头像" prop="avatar">
          <upload-pic-input @on-change="handleUpload" width="285px" ref="upload"></upload-pic-input>
        </Form-item>
        <Form-item label="所属部门">
          <department-tree-choose width="285px" @on-change="handleSelectDepTree" ref="depTree"></department-tree-choose>
        </Form-item>
        <FormItem label="用户类型" prop="type">
          <Select v-model="userForm.type" placeholder="请选择">
            <Option :value="0">普通用户</Option>
            <Option :value="1">管理员</Option>
          </Select>
        </FormItem>
        <FormItem label="角色分配" prop="roles">
          <Select v-model="userForm.roles" multiple>
            <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name">
              <!-- <div style="display:flex;flex-direction:column"> -->
              <!-- <span style="margin-right:10px;">{{ item.name }}</span>
              <span style="color:#ccc;">{{ item.description }}</span>
              <!-- </div>
            </Option>
          </Select>
        </FormItem> -->
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
  getSecondClassify,
  getAllSpeClassify,
  getByClassifyId,
  disableGoods,
  enableGoods,
  getGoodsList,
  addGoods,
  editGoods,
  deleteGoods

}from "@/api/recycle";
import {
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
import uploadPicInput from "@/views/components/custom/upload-pic-input";
import circleLoading from "@/views/components/custom/circle-loading.vue";
export default {
  name: "user-manage",
  components: {
    circleLoading,
    expandRow,
    departmentChoose,
    departmentTreeChoose,
    classifyTreeChoose,
    uploadPicInput
  },
  data() {
    const isDecimal = (rule, value, callback) =>{
      //价格正则表达式
      var reg=  /^([+-]?)((\d{1,3}(,\d{3})*)|(\d+))(\.\d{2})?$/;
      if(!reg.test(value)){
        callback(new Error("价格格式不正确，（格式如1234.12）"));
      }else{
        callback();
      }
    };
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
      loading: true,
      operationLoading: false,
      loadingExport: true,
      modalExportAll: false,
      drop: false,
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      selectCount: 0,
      secondClassify:[],//二级分类信息
      speClassify:[],//规格信息
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
        specificationClassifyId:"",
        name: "",
        description:"",
        classifyId:"",
        sortOrder:0,
        status:"",
        minPrice:"",
        maxPrice:"",
        imgUrl:"",
        classifyDescription:"",
        classifyName:"",
        classifyParentId:""
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
        maxPrice:[
          { required:true, message:"请填写价格", trigger : "blur"},
          { validator:isDecimal,trigger : "blur"}
        ],
        minPrice:[
          { required: true, message:"请填写价格",trigger :"blur"},
          { validator:isDecimal,trigger:"blur"}
        ],
        name: [
          { required: true, message: "分类名称不能为空", trigger: "blur" }
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
          {required: true,message:"状态不能为空"},
           {validator:isEmpty,trigger:'change'}
        ]
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
          width: 70,
          align: "center",
          fixed: "left",
          title:'序号'
        },
        {
          title:"商品名称",
          key:"name",
          minWidth: 100,
          tooltip: true,
        },
        {
          title:"商品描述",
          key:"description",
          minWidth: 90,
          tooltip: true,
        },
        {
          title:"商品图片",
          key:"imgUrl",
          minWidth:120,
          align: "center",
          render: (h,params) =>{
            return h("img",{
              attrs:{
                src:params.row.imgUrl,
                width:'100px'
              }
            });
          }
        },
        {
          title:"预估最小价格",
          key:"minPrice",
          minWidth:110
        },
        {
          title:"预估最大价格",
          key:"maxPrice",
          minWidth:110
        },
        {
          title:"所属分类名称",
          key:"classifyName",
          minWidth:110,
          tooltip: true,
        },
        {
          title:"所属分类描述",
          key:"classifyDescription",
          minWidth:110,
          tooltip: true,
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          minWidth: 150
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          minWidth: 140,
          fixed: "right",
          render: (h, params) => {
            let re = "";
            if (params.row.status === 0) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "success"
                    }
                  },
                  "正常启用"
                )
              ]);
            } else if (params.row.status === -1) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "error"
                    }
                  },
                  "禁用"
                )
              ]);
            }
          },
          filters: [
            {
              label: "正常启用",
              value: 0
            },
            {
              label: "禁用",
              value: -1
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === 0) {
              return row.status === 0;
            } else if (value === -1) {
              return row.status === -1;
            }
          }
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
              enableOrDisable,
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
      this.getDictSexData();
      this.getSpeClassify();
      this.getSecond();
    },
    getSpeClassify(){
      getAllSpeClassify().then(response=> {
      this.speClassify = response.result;
      });
    },
    getSecond(){
      getSecondClassify().then(response=> {
        this.secondClassify = response.result;
      });
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
      this.userForm.classifyId = v[0];
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
      getGoodsList(this.searchForm).then(res => {
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
            this.userForm.classifyId!==''?addGoods(this.userForm).then(res => {
              this.submitLoading = false;
              if (res.success === true) {
                this.$Message.success("操作成功");
                this.getUserList();
                this.userModalVisible = false;
              }
            }):(this.$Message.error("所属分类不能为空"),this.submitLoading=false);
          } else {
            // 编辑
            this.submitLoading = true;
            editGoods(this.userForm).then(res => {
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
      //decimal转换为String
      data.minPrice = String(data.minPrice)
      data.maxPrice =String(data.maxPrice)
      data.status = String(data.status)
      this.userForm = data;

      getByClassifyId(data.classifyId).then(res=>{
        this.title=res.result.name
        this.$refs.classifyTree.setSelectDep([data.classifyId],this.title);
      })
      
      // this.$refs.classifyTree.setSelectDep([data.id], data.name);
       this.$refs.upload.setPicUrl(data.imgUrl);
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
        content: "您确认要删除该商品吗 " + v.name + " ?",
        onOk: () => {
          this.operationLoading = true;
          deleteGoods(v.id).then(res => {
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
          deleteGoods(ids).then(res => {
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