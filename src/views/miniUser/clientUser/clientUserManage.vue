<style lang="less">
@import "./clientUserManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="用户昵称" prop="nickName">
                <Input
                  type="text"
                  v-model="searchForm.nickName"
                  clearable
                  placeholder="请输入昵称"
                  style="width: 200px"
                />
              </Form-item>
              <Form-item label="用户类型" prop="clientType">
                  <Select
                    type="text"
                    v-model="searchForm.clientType"
                    clearable
                    placeholder="请选择客户类型"
                    style="width: 200px"
                  >
                    <Option value="0">普通用户</Option>
                    <Option value="1">回收人员</Option>
                  </Select>
              </Form-item>
              <span v-if="drop">
                <Form-item label="手机号" prop="phoneNum">
                  <Input
                    type="text"
                    v-model="searchForm.phoneNum"
                    clearable
                    placeholder="请输入手机号"
                    style="width: 200px"
                  />
                </Form-item>
                <Form-item label="性别" prop="gender">
                  <Select
                    v-model="searchForm.gender"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option value="0">女</Option>
                    <Option value="1">男</Option>
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
            <!-- <Button @click="add" type="primary" icon="md-add">添加用户</Button> -->
            <!-- <Button @click="delAll" icon="md-trash">批量删除</Button> -->
            <circleLoading v-if="operationLoading"/>
          </Row>
          <!-- <Row>
            <Alert show-icon>
              已选择
              <span class="select-count">{{selectCount}}</span> 项
              <a class="select-clear" @click="clearSelectAll">清空</a>
            </Alert>
          </Row> -->
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
        <FormItem label="昵称" prop="nickName">
          <Input v-model="userForm.nickName" autocomplete="off"/>
        </FormItem>
        <FormItem label="手机号" prop="phoneNum">
          <Input v-model="userForm.phoneNum"/>
        </FormItem>
        <FormItem label="性别" prop="gender">
          <Select v-model="userForm.gender" placeholder="请选择">
            <Option value="0">女</Option>
            <Option value="1">男</Option>
          </Select>
        </FormItem>
        <Form-item label="头像" prop="avatar">
          <upload-pic-input @on-change="handleUpload" width="285px" ref="upload"></upload-pic-input>
        </Form-item>
        <Form-item label="省份" prop="province">
          <Input v-model="userForm.province"/>
        </Form-item>
        <Form-item label="城市" prop="city">
          <Input v-model="userForm.city"/>
        </Form-item>
        <Form-item label="县区" prop="country">
          <Input v-model="userForm.country"/>
        </Form-item>        

      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelUser">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitUser">提交</Button>
      </div>
    </Modal>
    <Drawer :closable="false" width="320" v-model="drawer">
      <p style="font-size:22px;font-weight:bold"><Icon type="ios-contact" size="25"/>&nbsp;用户基本信息</p>
            <Divider/>
            <div class="demo-drawer-profile">
                <Row>
                    <Col span="15" style="font-size:16px;font-weight:bold">
                        <Icon type="ios-chatbubbles" size="25"/>&nbsp;昵称: {{showInfo.nickName}}
                    </Col>
                </Row>
                <Row>
                    <Col span="15" style="font-size:16px;font-weight:bold">
                        <Icon type="md-clipboard" size="25"/>&nbsp;用户类型: {{clientType1}}
                    </Col>
                </Row>
                <Row>
                    <Col span="15"style="font-size:16px;font-weight:bold">
                        <Icon type="ios-contacts" size="25"/>&nbsp;用户性别: {{gender}}
                        </Col>
                </Row>
                <Row>
                    <Col span="15"style="font-size:16px;font-weight:bold">
                        <Icon type="ios-call" size="25"/>&nbsp;手机号: {{showInfo.phoneNum}}
                    </Col>
                </Row>
                <Row>
                    <Col span="15"style="font-size:16px;font-weight:bold">
                        <Icon type="ios-locate" size="25"/>&nbsp;省份: {{showInfo.province}}
                    </Col>
                </Row>
                <Row>
                    <Col span="15"style="font-size:16px;font-weight:bold">
                        <Icon type="ios-locate-outline" size="25"/>&nbsp;城市: {{showInfo.city}}
                    </Col>
                </Row>
                <Row>
                    <Col span="15"style="font-size:16px;font-weight:bold">
                        <Icon type="md-locate" size="25"/>&nbsp;国家: {{showInfo.country}}
                    </Col>
                </Row>
                <Row>
                    <Col span="15"style="font-size:16px;font-weight:bold">
                        <Icon type="ios-mic" size="25"/>&nbsp;语言: {{showInfo.language}}
                        </Col>
                </Row>
            </div>
    </Drawer>
  </div>
</template>

<script>
import{
  getAllWechatUser,
  editWechatUser,
  getByPhoneNum
}from "@/api/miniUser";
import {
  getAllRoleList,
  getAllUserData,
  getDictDataByType
} from "@/api/index";
import expandRow from "./expand.vue";
import departmentChoose from "@/views/components/custom/department-choose";
import departmentTreeChoose from "@/views/components/custom/department-tree-choose";
import uploadPicInput from "@/views/components/custom/upload-pic-input";
import circleLoading from "@/views/components/custom/circle-loading.vue";
export default {
  name: "user-manage",
  components: {
    circleLoading,
    expandRow,
    departmentChoose,
    departmentTreeChoose,
    uploadPicInput
  },
  data() {
    const isHave = (rule, value, callback)=>{
      // console.log("----"+this.modalType)
      if(this.modalType===0||(this.modalType===1&&this.oldPhone!=this.userForm.phoneNum&&this.userForm.phoneNum!==''&&this.userForm.phoneNum!==null&&this.userForm.phoneNum!==undefined)){
           getByPhoneNum({phoneNum:this.userForm.phoneNum,clientType:this.userForm.clientType}).then(res=>{
            if(res.success===true){
              callback(new Error('该号码已被注册'))
              // console.log("----"+res.result)
            }else if(res.success===false){
              callback();
            }else{
              callback(new Error('手机号不能为空'))
            }
          })
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
    const checkLongitude = (rule, value, callback) =>{
      let longrg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
      if(!longrg.test(value)){
      callback(new Error('经度整数部分为0-180,小数部分为0到6位!')) 
    } else {
      callback();
      }
    };
    const checkLatitude = (rule, value, callback) =>{
      let latrg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
      if(!latrg.test(value)){
      callback(new Error('纬度整数部分为0-90,小数部分为0到6位!')) 
    } else {
      callback();
    }
    };
    const idCard = (rule, value ,callback) =>{
      if(value && (!(/\d{17}[\d|x]|\d{15}/).test(value) || (value.length !== 15 && value.length !== 18))){
        callback(new Error("身份证号码不符合规范"))
      }else{
        callback()
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
      var reg = /^$|^[1][3,4,5,7,8][0-9]{9}$/;
      if (!reg.test(value)) {
        callback(new Error("手机号格式错误"));
      } else {
        callback();
      }
    };
    const checkInt =(rule, value, callback) =>{
      if(!(Number(value)&&(value)%1 === 0)){
        callback(new Error("请输入整数金额"));
      }else{
        callback();
      }
    };
    return {
      showInfo:[],
      drawer:false,
      pStyle: {
                    fontSize: '16px',
                    color: 'rgba(0,0,0,0.85)',
                    lineHeight: '24px',
                    display: 'block',
                    marginBottom: '16px'
                },
      loading: true,
      operationLoading: false,
      loadingExport: true,
      modalExportAll: false,
      drop: false,
      oldPhone:"",
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      selectCount: 0,
      selectList: [],
      dataDep: [],
      searchKey: "",
      searchForm: {
        name: "",
        clientType:"",
        phone: "",
        type: "",
        status:"",
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
        nickName: "",
        clientType:"",
        gender:"",
        phoneNum: "",
        province:"",
        city:"",
        country:"",
        language:"",
        avatarUrl:""
      },
      userRoles: [],
      roleList: [],
      errorPass: "",
      userFormValidate: {
        nickName: [
          { required: true, message: "昵称不能为空", trigger: "blur" }
        ],
        phoneNum: [
          { required:false,trigger:"blur"},
          { validator :validateMobile,trigger:"blur"},
          { validator :isHave,trigger:"blur"}
          //{ validator:validateMobile,trigger:"blur"}
          // { validator: validateMobile, trigger: "blur" },
          // { validator:isHave,trigger:"blur"}
        ],
        city:[
          { required:true,message: " 不能为空",trigger: "blur"}
        ],
        country:[
          { required:true,message :"不能为空",trigger: "blur"}
        ],
        province:[
          { required:true,message:"不能为空",trigger: "blur"}
        ],
        latitude: [
          { required: true, message: "纬度不能为空", trigger: "blur" },
          { validator:checkLatitude, trigger: 'blur'} 
        ]
      },
      submitLoading: false,
      columns: [
        // {
        //   type: "selection",
        //   width: 80,
        //   align: "center",
        //   fixed: "left"
        // },
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
          title: "昵称",
          key: "nickName",
          minWidth: 145,
          fixed: "left"
        },
        {
          title: "用户类型",
          key: "clientType",
          align: "center",
          fixed: "left",
          minWidth: 100,
          render: (h, params) => {
            let re = "";
            if (params.row.clientType == 1) {
              re = "回收人员";
            } else if (params.row.clientType == 0) {
              re = "普通用户";
            }
            return h("div", re);
          }
        },
        {
          title: "性别",
          key: "gender",
          align: "center",
          minWidth: 100,
          render: (h, params) => {
            let re = "";
            if (params.row.gender === 1) {
              re = "男";
            } else if (params.row.gender === 0) {
              re = "女";
            }
            return h("div", re);
          }
        },
        {
          title: "头像",
          key: "avatarUrl",
          minWidth: 80,
          align: "center",
          render: (h, params) => {
            return h("Avatar", {
              props: {
                src: params.row.avatarUrl
              }
            });
          }
        },
        {
          title: "手机",
          key: "phoneNum",
          minWidth: 115
        },
        {
          title:"省份",
          key:"province",
          minWidth:180
        },
        {
          title: "城市",
          key:"city",
          minWidth:150
        },
        {
          title:"县区",
          key:"country",
          minWidth:150
        },
        
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          minWidth: 150
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
                  props:{
                    type:"info",
                    size:"small"
                  },
                  style:{
                    marginRight: "5px"
                  },
                  on:{
                    click:()=>{
                      this.show(params.row);
                    }
                  }
                },
                "基本信息"
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
                      this.oldPhone = params.row.phoneNum;
                      this.edit(params.row);
                    }
                  }
                },
                "编辑"
              ),
              // enableOrDisable,
              // h(
              //   "Button",
              //   {
              //     props: {
              //       type: "error",
              //       size: "small"
              //     },
              //     on: {
              //       click: () => {
              //         this.remove(params.row);
              //       }
              //     }
              //   },
              //   "删除"
              // )
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
  computed:{
    gender:function(){
      if(this.showInfo.gender == 0){
        return "女";
      }else if(this.showInfo.gender == 1){
        return "男";
      }
    },
    clientType1:function(){
      if(this.showInfo.clientType == 0){
        return "普通用户";
      }else if(this.showInfo.clientType == 1){
        return "回收人员";  
      }
    }
  },
  methods: {
    init() {
      this.getUserList();
      this.getDictSexData();
    },
    getDictSexData() {
      // 获取性别字典数据
      getDictDataByType("sex").then(res => {
        if (res.success) {
          this.dictSex = res.result;
        }
      });
    },
    handleSelectDepTree(v) {
      this.userForm.departmentId = v[0];
    },
    handleSelectDep(v) {
      this.searchForm.departmentId = v;
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
      getAllWechatUser(this.searchForm).then(res => {
        this.loading = false;
        if (res.success === true) {
          this.data = res.result.content;
          this.total = res.result.totalElements;
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
      getAllUserData().then(res => {
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
      this.$refs.userForm.validate(valid => {
        if (valid) {
          if (this.modalType === 0) {
            // 添加用户 避免编辑后传入id
            delete this.userForm.id;
            //delete this.userForm.status;
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
            addPerson(this.userForm).then(res => {
              this.submitLoading = false;
              if (res.success === true) {
                this.$Message.success("操作成功");
                this.getUserList();
                this.userModalVisible = false;
              }
            });
          } else {
            // 编辑
            this.submitLoading = true;
            editWechatUser(this.userForm).then(res => {
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
      this.userForm.avatarUrl = v;
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加回收人员";
      this.$refs.userForm.resetFields();
      this.userModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑用户";
      this.$refs.userForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      data.gender = String(data.gender)
      this.userForm = data;
      //this.$refs.depTree.setSelectDep([data.departmentId], data.departmentTitle);
      this.$refs.upload.setPicUrl(data.avatarUrl);
      this.userModalVisible = true;
    },
    enable(v) {
      this.$Modal.confirm({
        title: "确认启用",
        content: "您确认要启用用户 " + v.name + " ?",
        onOk: () => {
          this.operationLoading = true;
          enableUser(v.id).then(res => {
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
        content: "您确认要禁用用户 " + v.name + " ?",
        onOk: () => {
          this.operationLoading = true;
          disableUser(v.id).then(res => {
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
        content: "您确认要删除用户 " + v.name + " ?",
        onOk: () => {
          this.operationLoading = true;
          deletePerson(v.id).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.getUserList();
            }
          });
        }
      });
    },
    show(v){
      this.drawer=true;
      this.showInfo=v;
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
          deletePerson(ids).then(res => {
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
<style>
    .demo-drawer-profile{
        font-size: 14px;
    }
    .demo-drawer-profile .ivu-col{
        margin-bottom: 12px;
    }
    .ivu-table .demo-table-info-row td{
        background-color: #2db7f5;
        color: #fff;
    }
    .ivu-table .demo-table-error-row td{
        background-color: #ff6600;
        color: #fff;
    }
    .ivu-table td.demo-table-info-column{
        background-color: #2db7f5;
        color: #fff;
    }
    .ivu-table .demo-table-info-cell-name {
        background-color: #2db7f5;
        color: #fff;
    }
    .ivu-table .demo-table-info-cell-age {
        background-color: #ff6600;
        color: #fff;
    }
    .ivu-table .demo-table-info-cell-address {
        background-color: #187;
        color: #fff;
    }
</style>