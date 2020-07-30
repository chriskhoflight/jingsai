<style lang="less">
@import "./recyclingVerifyManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="用户姓名" prop="name">
                <Input
                  type="text"
                  v-model="searchForm.name"
                  clearable
                  placeholder="请输入姓名"
                  style="width: 200px"
                />
              </Form-item>
              <span v-if="drop">
                <Form-item label="手机号" prop="phone">
                  <Input
                    type="text"
                    v-model="searchForm.phone"
                    clearable
                    placeholder="请输入手机号"
                    style="width: 200px"
                  />
                </Form-item>
                <Form-item label="用户类型" prop="type">
                  <Select
                    v-model="searchForm.type"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option value="0">社会回收人员</Option>
                    <Option value="1">公司员工</Option>
                  </Select>
                </Form-item>
                <Form-item label="用户状态" prop="status">
                  <Select
                    v-model="searchForm.status"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option value="0">待审核</Option>
                    <Option value="1">审核通过</Option>
                    <Option value="2">审核未通过</Option>
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
            <!-- <Button @click="add" type="primary" icon="md-add">添加回收人员</Button> -->
            <Button @click="delAll" icon="md-trash">批量删除</Button>
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
        <FormItem label="姓名" prop="name">
          <Input v-model="userForm.name" autocomplete="off"/>
        </FormItem>
        <FormItem label="手机号" prop="phone">
          <Input v-model="userForm.phone"/>
        </FormItem>
        <FormItem label="身份证号" prop="idCard">
          <Input v-model="userForm.idCard"/>
        </FormItem>
        <FormItem label="地址" prop="address">
          <Poptip trigger="focus" title="提示" >
            <Input v-model="userForm.address"/>
            <div slot="content">
            <Button type="primary" @click="handlerMap">选择地址</Button>
        </div>
        </Poptip>
          
        </FormItem>
        <FormItem label="经度" prop="longitude">
          <Input v-model="userForm.longitude"/>
        </FormItem>
        <FormItem label="纬度" prop="latitude">
          <Input v-model="userForm.latitude"/>
        </FormItem>
        <FormItem label="押金" prop="deposit">
          <Input v-model="userForm.deposit"/>
        </FormItem>
        <Form-item label="身份证正面照" prop="positiveImgUrl">
          <upload-pic-input @on-change="handleUpload" width="285px" ref="upload"></upload-pic-input>
        </Form-item>
        <Form-item label="身份证反面照" prop="reverseImgUrl">
          <upload-pic-input @on-change="handleUploadTwo" width="285px" ref="upload1"></upload-pic-input>
        </Form-item>
        <FormItem label="用户类型" prop="type">
          <Select v-model="userForm.type" placeholder="请选择">
            <Option value="0">社会回收人员</Option>
            <Option value="1">公司员工</Option>
          </Select>
        </FormItem>
        <FormItem label="状态" prop="status">
          <Select v-model="userForm.status" placeholder="请选择">
            <Option value="0">待审核</Option>
            <Option value="1">审核通过</Option>
          </Select>
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
    <Modal v-model="modalMap" fullscreen title="地理位置" footer-hide :loading="true">
      <vue-map @selected="getCoordinate" v-if="modalMap"></vue-map>
    </Modal>
    <Modal title="查看大图" v-model="visible">
      <img :src="imgUrl" v-if="visible" style="width:100%">
    </Modal>
  </div>
</template>

<script>
import{
  getVerifyPerson, 
  getAllRecyclingPerson,
  addPerson,
  editPerson,
  selectByPhone,
  deletePerson
}from "@/api/miniUser";
import {
  getUserListData,
  getAllRoleList,
  addUser,
  editUser,
  enableUser,
  disableUser,
  deleteUser,
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
      selectByPhone({phone:this.userForm.phone}).then(res=>{
        if(res.success===true){
          callback(new Error('该号码已被注册'))
          // console.log(res.result)
        }else if(res.success===false){
          callback();
        }else{
          callback(new Error('手机号不能为空'))
        }
      })
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
      var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (!reg.test(value)) {
        callback(new Error("手机号格式错误"));
      } else {
        callback();
      }
    };
    const checkInt =(rule, value, callback) =>{
      var reg= /^$|^(0|\+?[1-9][0-9]*)$/;
      if(!reg.test(value)){
        callback(new Error("请输入整数金额"));
      }else{
        callback();
      }
      // if(!(Number(value)&&(value)%1 === 0)){
      //   callback(new Error("请输入整数金额"));
      // }else{
      //   callback();
      // }
    };
    return {
      imgUrl:"",
      visible:false,
      modalMap:false,
      loading: true,
      operationLoading: false,
      loadingExport: true,
      modalExportAll: false,
      drop: false,
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      selectCount: 0,
      selectList: [],
      dataDep: [],
      searchKey: "",
      searchForm: {
        name: "",
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
        longitude:"",
        latitude:"",
        name: "",
        phone: "",
        idCard:"",
        positiveImgUrl:"",
        reverseImgUrl:"",
        address:"",
        deposit:"",
        type: "",
        status:""
      },
      userRoles: [],
      roleList: [],
      errorPass: "",
      userFormValidate: {
        type: [
          {required : true,message:"人员类型不能为空"},
          {validator:isEmpty,trigger:"change"}
        ],
        name: [
          { required: true, message: "姓名不能为空", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          { validator: validateMobile, trigger: "blur" },
          { validator: isHave,trigger: "blur"}
        ],
        idCard:[
          { required : true, message:"身份证号码不能为空", trigger: "blur"},
          {validator:idCard,trigger:'blur'}
        ],
        deposit:[
          { required : false},
          { validator:checkInt}
        ],
        status:[
          {required:true,message:"状态不能为空"},
          {validator:isEmpty,trigger:'change'}
        ],
        address: [
          { required: true, message: "地址不能为空", trigger: "change" }
        ],
        longitude: [
          { required: true, message: "经度不能为空", trigger: "blur" },
          { validator:checkLongitude,trigger:'blur'}
        ],
        latitude: [
          { required: true, message: "纬度不能为空", trigger: "blur" },
          { validator:checkLatitude, trigger: 'blur'} 
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
          width: 80,
          align: "center",
          fixed: "left",
          title:'序号'
        },
        {
          title: "姓名",
          key: "name",
          minWidth: 110,
          fixed: "left"
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          minWidth: 140,
          render: (h, params) => {
            let re = "";
            if (params.row.status === 0) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "warning"
                    }
                  },
                  "待审核"
                )
              ]);
            }else if(params.row.status === 2){
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "error"
                    }
                  },
                  "审核未通过"
                )
              ]);
            }else if (params.row.status === 1) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "success"
                    }
                  },
                  "审核通过"
                )
              ]);
            }
          },
          filters: [
            {
              label: "待审核",
              value: 0
            },
            {
              label: "审核未通过",
              value: 2
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === 0) {
              return row.status === 0;
            } else if(value === 2){
              return row.status === 2;
            }
          }
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          minWidth: 150
        },
        {
          title: "身份证正面照片",
          key: "positiveImgUrl",
          minWidth: 150,
          align: "center",
          render: (h, params) => {
            let url = params.row.positiveImgUrl ? params.row.positiveImgUrl : require('../../../assets/default.png')
            return h("img", {
              attrs: {
                src: url,
                width:'100px',
                height:'100px',
                alt:"图片不存在",
                title:'点击可查看大图'
              },
              on:{
                click:(e)=>{
                  this.handleView(e.srcElement.currentSrc)
                }
              }
            });
          }
        },
        {
          title: "身份证反面照片",
          key: "reverseImgUrl",
          minWidth: 150,
          align: "center",
          render: (h, params) => {
            let url = params.row.reverseImgUrl ? params.row.reverseImgUrl : require('../../../assets/default.png')
            return h("img", {
              attrs: {
                src: url,
                width:'100px',
                height:'100px',
                alt:"图片不存在",
                title:'点击可查看大图'
              },
              on:{
                click:(e)=>{
                  this.handleView(e.srcElement.currentSrc)
              }
              }
            });
          }
        },
        {
          title: "手机",
          key: "phone",
          minWidth: 115,
          sortable: true
        },
        {
          title: "身份证号",
          key: "idCard",
          minWidth: 180,
          sortable: true
        },
        {
          title:"地址",
          key:"address",
          minWidth:180,
        },
        {
          title: "押金",
          key:"deposit",
          minWidth:100,
          sortable:true
        },
        {
          title: "用户类型",
          key: "type",
          align: "center",
          minWidth: 100,
          render: (h, params) => {
            let re = "";
            if (params.row.type === 1) {
              re = "公司员工";
            } else if (params.row.type === 0) {
              re = "社会回收人员";
            }
            return h("div", re);
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
            // if (params.row.status == 0) {
            //   enableOrDisable = h(
            //     "Button",
            //     {
            //       props: {
            //         size: "small"
            //       },
            //       style: {
            //         marginRight: "5px"
            //       },
            //       on: {
            //         click: () => {
            //           this.disable(params.row);
            //         }
            //       }
            //     },
            //     "禁用"
            //   );
            // } else {
            //   enableOrDisable = h(
            //     "Button",
            //     {
            //       props: {
            //         type: "success",
            //         size: "small"
            //       },
            //       style: {
            //         marginRight: "5px"
            //       },
            //       on: {
            //         click: () => {
            //           this.enable(params.row);
            //         }
            //       }
            //     },
            //     "启用"
            //   );
            // }
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
                      // this.edit(params.row);
                      this.verify(params.row);
                      // console.log(params.row)
                    }
                  }
                },
                "审核"
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
                      if(params.row.status===0||params.row.status===2){//用户待审核和审核不通过可以删除该条记录
                        this.remove(params.row);
                      }else if(params.row.status===1){//用户通过了审核，需要删除得到管理页面
                        this.$Message.error("该用户通过审核，不能随意删除，请到管理页面操作")
                      }
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
    },
    handlerMap(){
      this.modalMap = true;
    },
    handleView(url) {
      this.imgUrl = url;
      this.visible = true;

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
      getVerifyPerson(this.searchForm).then(res => {
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
            editPerson(this.userForm).then(res => {
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
      this.userForm.positiveImgUrl = v;
    },
    handleUploadTwo(v){
      this.userForm.reverseImgUrl = v;
    },
    //打开新的页面查看信息详细并且进行审核
    verify(v){
      this.$router.push({
        name:"recyclingVerifyPage",
        query:{ verifyData : v}

      });
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
      data.longitude = String(data.longitude)
      data.latitude = String(data.latitude)
      data.type =String(data.type)
      data.status = String(data.status)
      this.userForm = data;
      //this.$refs.depTree.setSelectDep([data.departmentId], data.departmentTitle);
      this.$refs.upload.setPicUrl(data.positiveImgUrl);
      this.$refs.upload1.setPicUrl(data.reverseImgUrl);
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
      let ids = "";
      let num = 0
      this.selectList.forEach(function(e) {
        if(e.status!==1){
            ids += e.id + ",";
        }else{
          num++
        } 
      });
      if(ids===""){
         this.$Message.warning("已选择的数据中没有可删除的数据");
         return
      }
      let title = num===0 ? "您确认要删除所选的 " + this.selectCount + " 条数据?" : "您已选择"+ this.selectCount + " 条数据,只能删除"+(this.selectCount-num)+"条数据,其中有"+num+"条数据已审核通过不能进行删除"
      ids = ids.substring(0, ids.length - 1);
      this.$Modal.confirm({
        title: "确认删除",
        content: title,
        onOk: () => {
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
    },
    getCoordinate(v){
      this.userForm.longitude = String(v.longitude)
      this.userForm.latitude =String(v.latitude)
      this.userForm.address = v.address
      this.modalMap = false
    }
  },
  mounted() {
    this.init();
    this.getRoleList();
  }
};
</script>