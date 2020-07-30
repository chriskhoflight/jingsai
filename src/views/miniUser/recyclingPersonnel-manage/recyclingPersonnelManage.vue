<style lang="less">
@import "./recyclingPersonnelManage.less";
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
                    <Option value="1">审核通过</Option>
                    <Option value="2">已激活</Option>
                    <Option value="8">工作中</Option>
                    <Option value="9">休息中</Option>
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
            <Button @click="add" type="primary" icon="md-add">添加回收人员</Button>
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
          <Input v-model="userForm.name" autocomplete="off" v-bind:readonly="modalType==1"/>
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
        <FormItem label="状态" prop="status" >
          <Poptip trigger="hover" v-bind:disabled="modalType==0" title="提示" content="只有登录过回收端小程序的人员才能修改为工作状态或者休息状态">
            <Select v-model="userForm.status" placeholder="请选择" width="200px">
              <Option value="1">审核通过</Option>
              <Option value="3">已激活</Option>
              <Option value="8" v-bind:hidden="modalType==0||this.openId==null">工作中</Option>
              <Option value="9" v-bind:hidden="modalType==0||this.openId==null">休息中</Option>
            </Select>
          </Poptip>
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
    <Drawer :closable="false" width="600" v-model="drawer">
        <Modal v-model="imgModal" :width="600" :style="{top: '30px'}">
          <div width="100%">
            <img :src="bigImgUrl" @click="watchBigImg(null)" width="100%" height="100%"/>
          </div>
        </Modal>
      <p style="font-size:22px;font-weight:bold"><Icon type="ios-contact" size="25"/>&nbsp;用户详情</p>
            <div class="demo-drawer-profile">
              <Divider style="font-size:17px;font-family:Pingfang SC" >基本信息</Divider>
                <Row>
                    <Col span="12" style="font-size:15px;font-weight:bold">
                        <Icon type="md-man" size="25"/>&nbsp;姓名: {{showInfo.name}}
                    </Col>
                </Row>
                <Row>
                    <Col span="12" style="font-size:15px;font-weight:bold">
                        <Icon type="ios-call" size="25"/>&nbsp;手机号: {{showInfo.phone}}
                    </Col>
                </Row>
                 <Row>
                    <Col span="12" style="font-size:15px;font-weight:bold">
                        <Icon type="md-contacts" size="25"/>&nbsp;用户类型: {{type}}
                    </Col>
                </Row>
                <Row>
                    <Col span="12" style="font-size:15px;font-weight:bold">
                        <Icon type="ios-book" size="25"/>&nbsp;身份证号码: {{showInfo.idCard}}
                    </Col>
                </Row>
                <Row>
                    <Col span="50" style="font-size:15px;font-weight:bold">
                        <Icon type="ios-home" size="25"/>&nbsp;地址: {{showInfo.address}}
                    </Col>
                </Row>
                <Row>
                    <Col span="12" style="font-size:15px;font-weight:bold">
                        <Icon type="ios-switch" size="25"/>&nbsp;用户状态: {{status}}
                        </Col>
                </Row>
                <Row>
                  <Divider style="font-size:17px">身份证照片</Divider>
                </Row>
                <Poptip trigger="hover" title="提示" content="点击可查看大图">
                <img 
                  :src="showInfo.positiveImgUrl"
                  width="180px"
                  height="180px"
                  @click="watchBigImg(showInfo.positiveImgUrl)"
                />
                </Poptip>
                <Poptip trigger="hover" title="提示" content="点击可查看大图">
                <img
                  :src="showInfo.reverseImgUrl"
                  width="180px"
                  height="180px"
                  @click="watchBigImg(showInfo.reverseImgUrl)"
                />
                </Poptip>
                
            </div>
    </Drawer>
    <Modal title="查看大图" v-model="visible">
      <img :src="imgUrl" v-if="visible" style="width: 100%">
    </Modal>
  </div>
</template>

<script>
import{
  getAllRecyclingPerson,
  addPerson,
  editPerson,
  selectByPhone,
  deletePerson,
  getVerifyPersonById
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
      // console.log("----"+this.modalType)
      if(this.modalType===0||(this.modalType===1&&this.oldPhone!=this.userForm.phone)){
           selectByPhone({phone:this.userForm.phone}).then(res=>{
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
      // selectByPhone({phone:this.userForm.phone}).then(res=>{
      //   if(res.success===true){
      //     callback(new Error('该号码已被注册'))
      //     console.log(res.result)
      //   }else if(res.success===false){
      //     callback();
      //   }else{
      //     callback(new Error('手机号不能为空'))
      //   }
      // })
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
      var reg = /^$|^(0|\+?[1-9][0-9]*)$/;
      if(!reg.test(value)) {
        callback(new Error("请输入整数金额"));
      } else {
        callback();
      }
      // if(!(Number(value)&&(value)%1 === 0)){
      //   callback(new Error("请输入整数金额"));
      // }else{
      //   callback();
      // }
    };
    return {
      openId:"",
      imgUrl:"",
      visible:false,
      imgModal:false,
      bigImgUrl:null,
      showInfo:[],
      drawer:false,
      pStyle: {
                    fontSize: '16px',
                    color: 'rgba(0,0,0,0.85)',
                    lineHeight: '24px',
                    display: 'block',
                    marginBottom: '16px'
                },
      modalMap:false,
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
      modalBoolean:false,
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
        type:[
          {required:true,message:"人员类型不能为空"},
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
          minWidth: 100,
          fixed: "left"
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          minWidth: 140,
          render: (h, params) => {
            let re = "";
            if (params.row.status === 1) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "warning"
                    }
                  },
                  "审核通过"
                )
              ]);
            }else if(params.row.status === 3){
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "info"
                    }
                  },
                  "已激活"
                )
              ]);
            }else if (params.row.status === 8) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "success"
                    }
                  },
                  "工作中"
                )
              ]);
            }else if(params.row.status === 9){
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "primary"
                    }
                  },
                  "休息中"
                )
              ]);
             }
          },
          filters: [
            {
              label: "审核通过",
              value: 1
            },
            {
              label: "已激活",
              value: 3
            },
            {
              label: "工作中",
              value: 8
            },
            {
              label: "休息",
              value: 9
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === 1) {
              return row.status === 1;
            } else if (value === 3) {
              return row.status === 3;
            } else if(value === 8){
              return row.status === 8;
            } else if(value === 9){
              return row.status === 9;
            }
          }
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
                title:'点击可查看大图',
                alt:'图片不存在'
              },
              on:{
                click:(e) =>{
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
                title:'点击可查看大图',
                alt:'图片不存在'
              },
              on:{
                click:(e) =>{
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
                      this.findOpenId(params.row);
                      this.oldPhone = params.row.phone;
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
  computed:{
    type:function(){
      if(this.showInfo.type == 0){
        return "社会回收人员";
      }else if(this.showInfo.type == 1){
        return "公司员工";
      }
    },
    status:function(){
      if(this.showInfo.status == 1){
        return "审核通过";
      }else if(this.showInfo.status == 3){
        return "已激活";
      }else if(this.showInfo.status == 8){
        return "工作中";
      }else if(this.showInfo.status == 9){
        return "休息中";
      }
    }
  },
  methods: {
    watchBigImg(v){
      this.imgModal = !this.imgModal;
      this.bigImgUrl = v;
    },
    init() {
      this.getUserList();
      this.getDictSexData();
    },
    handlerMap(){
      this.modalMap = true
    },
    handleView(url){
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
      getAllRecyclingPerson(this.searchForm).then(res => {
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
                // console.log(this.userForm)
                this.$Message.success("操作成功");
                this.getUserList();
                this.userModalVisible = false;
              }
            });
          }
        }
      });
    },
    //正面照片
    handleUpload(v) {
      this.userForm.positiveImgUrl = v;
    },
    //反面照片
    handleUploadTwo(v) {
      this.userForm.reverseImgUrl=v;
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加回收人员";
      this.$refs.userForm.resetFields();
      this.userModalVisible = true;
    },
    findOpenId(v){
      getVerifyPersonById(v.id).then(res =>{
        if(res.success === true){
          this.openId=res.result.openId;
        }
      })
    },
    edit(v) {
      this.modalType = 1;
      this.modalBoolean = true;
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
    show(v){
      this.drawer=true;
      this.showInfo=v;
      // console.log(this.showInfo)
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
          // let types= "";
          // this.selectList.forEach(function(e){
          //   types +=e.type +",";
          // });
          // types =types.substring(0,ids.length - 1);
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
      this.userForm.latitude = String(v.latitude)
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