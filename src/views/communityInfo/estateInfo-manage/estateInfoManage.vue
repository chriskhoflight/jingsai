<style lang="less">
@import "./estateInfoManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="小区名称" prop="name">
                <Input
                  type="text"
                  v-model="searchForm.name"
                  clearable
                  placeholder="请输入小区名称"
                  style="width: 200px"
                />
              </Form-item>
              <span v-if="drop">
                <Form-item label="城市" prop="city">
                  <Input
                    type="text"
                    v-model="searchForm.city"
                    clearable
                    placeholder="请输入城市"
                    style="width: 200px"
                  />
                </Form-item>
                <Form-item label="详细地址" prop="address">
                  <Input
                    type="text"
                    v-model="searchForm.address"
                    clearable
                    placeholder="请输入详细地址"
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
            <Button @click="add" type="primary" icon="md-add">添加小区信息</Button>
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
        <FormItem label="小区名称" prop="name">
          <Input v-model="userForm.name" autocomplete="off"/>
        </FormItem>
        <FormItem label="小区编码" prop="code">
          <Input v-model="userForm.code" autocomplete="off"/>
        </FormItem>
        <FormItem label="所在城市" prop="city">
          <Input v-model="userForm.city"/>
        </FormItem>
        <FormItem label="所在区域" prop="area">
          <Input v-model="userForm.area"/>
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
        <FormItem label="小区描述" prop="description">
          <Input v-model="userForm.description"/>
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
    <Modal v-model="modalMap" fullscreen title="地理位置" footer-hide >
        <vue-map @selected="getCoordinate" v-if="modalMap"></vue-map>
    </Modal>
    <Modal v-model="modalQrCode"  title="二维码" width="400" footer-hide	>
        <qr-code :code="qrCode" v-if="modalQrCode"></qr-code>
    </Modal>
    <!-- 抽屉展示该小区的排班信息 -->
    <Drawer :closable="false" width="640" v-model="drawer">
      <P :style="pStyle">小区排班信息</P>
      <p :style="pStyle">{{showName}}({{showCode}})</p>
      <Table
        highlight-row
        height="400"
        :columns="ScheduleList"
        :data="schedule"
      ></Table>
      <i-button type="primary" @click="go">前往排班信息维护</i-button>
    </Drawer>
  </div>
</template>

<script>
import{
  getEstateInfo,
  selectByCode,
  deleteEstate,
  editEstate,
  addEstate,
  findScheduleByCode,
  findByCodes
}from "@/api/community";
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
import qrCode from '@/views/components/qrCode/qrCode.vue'

export default {
  name: "user-manage",
  components: {
    circleLoading,
    expandRow,
    departmentChoose,
    departmentTreeChoose,
    uploadPicInput,
    qrCode
  },
  data() {
    const isHave = (rule, value, callback)=>{
      // console.log("----"+this.modalType)
      if(this.modalType===0||(this.modalType===1&&this.oldCode!=this.userForm.code)){
           selectByCode({code:this.userForm.code}).then(res=>{
            if(res.success===true){
              callback(new Error('该编码已被注册'))
              // console.log("----"+res.result)
            }else if(res.success===false){
              callback();
            }else{
              callback(new Error('小区编码不能为空'))
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
    const checkInt =(rule, value, callback) =>{
      if(!(Number(value)&&(value)%1 === 0)){
        callback(new Error("请输入整数编码"));
      }else{
        callback();
      }
    };
    return {
      qrCode:'',
      drawer:false,
      showCode:"",
      showName:"",
      pStyle: {
                    fontSize: '16px',
                    color: 'rgba(0,0,0,0.85)',
                    lineHeight: '24px',
                    display: 'block',
                    marginBottom: '16px'
                },
      modalQrCode:false,
      modalMap:false,
      loading: true,
      operationLoading: false,
      loadingExport: true,
      modalExportAll: false,
      drop: false,
      oldCode:"",
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      selectCount: 0,
      selectList: [],
      dataDep: [],
      searchKey: "",
      searchForm: {
        name: "",
        pageNumber: 1,
        city:"",
        address:"",
        area:"",
        code:"",
        description:"",
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
        id:"",
        longitude:"",
        latitude:"",
        qrCode:"",
        name: "",
        code:"",
        city:"",
        area:"",
        address:"",
        description: "",
      },
      userRoles: [],
      roleList: [],
      errorPass: "",
      userFormValidate: {
        city:[
          {required:true,message:"所属城市不能为空",trigger: "blur"}
        ],
        area:[
          {required:true,message:"所属区县不能为空",trigger:"blur"}
        ],
        name: [
          { required: true, message: "小区名称不能为空", trigger: "blur" }
        ],
        code: [
          { required: true, message: "小区编码不能为空", trigger: "blur" },
          { validator: isHave,trigger: "blur"},
          { validator: checkInt}
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
          title: "小区名称",
          key: "name",
          minWidth: 145,
          fixed: "left"
        },
        {
          title: "小区编码",
          key: "code",
          minWidth: 115,
          sortable: true
        },
        {
          title: "所在城市",
          key: "city",
          minWidth: 120,
        },
        {
          title:"所在区县",
          key:"area",
          minWidth:180,
        },
        {
          title: "详细地址",
          key:"address",
          minWidth:150,
        },
        {
          title:"小区描述",
          key:"description",
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
          minWidth: 300,
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
                      this.oldCode = params.row.code;
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
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      findScheduleByCode({code:params.row.code}).then(res =>{
                        this.loading = false;
                        if(res.result.length === 0){
                          this.remove(params.row);
                        }else{
                          this.$Message.error("该小区含有排班信息，不能删除")
                        }
                     });
                    }
                  }
                },
                "删除"
              ),
              h(
                "Button",
                {
                  props:{
                    type:"info",
                    size:"small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on:{
                    click:() =>{
                      this.show(params.row);
                    }
                  }
                },
                "排班信息"
              ),
              h(
                "Button",
                {
                  props:{
                    type:"success",
                    size:"small"
                  },
                  on:{
                    click:() =>{
                      this.generateQrCode(params.row);
                    }
                  }
                },
                "生成二维码"
              )
            ]);
          }
        }
      ],
      ScheduleList:[
        {
          title:"星期",
          key:"week"
        },
        {
          title:"回收车辆",
          key:"recoveryCar"
        },
        {
          title:"回收物品",
          key:"recoveryDesc",
          className: 'demo-table-info-column'

        },
        {
          title:"到达小区时间段",
          width:150,
          key:"time"
        },
        {
          title:"收运时间",
          key:"recoveryTime",
          className: 'demo-table-info-column'
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
      schedule:[],
      exportData: [],
      total: 0,
      dictSex: []
    };
  },
  methods: {
    go(){
      this.$router.push({path:'recyclingEstateSchedule'});

    },
    init() {
      this.getUserList();
      this.getDictSexData();
    },
    handlerMap(){
      this.modalMap = true
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
      getEstateInfo(this.searchForm).then(res => {
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
            this.submitLoading = true;
            addEstate(this.userForm).then(res => {
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
            editEstate(this.userForm).then(res => {
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
      this.userForm.reverseImgUrl = v;
    },
    generateQrCode(v){
        this.modalQrCode = true
        this.qrCode = v.code
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加小区信息";
      this.$refs.userForm.resetFields();
      this.userModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑小区信息";
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
      this.userForm = data;
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
        content: "您确认要删除改小区信息吗 " + v.name + " ?",
        onOk: () => {
          this.operationLoading = true;
          deleteEstate(v.id).then(res => {
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
      this.showName=v.name;
      this.showCode=v.code;
      findScheduleByCode({code:v.code}).then(res =>{
        this.loading = false;
        if(res.success === true){
          this.schedule = res.result;
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
      this.selectList.forEach(function(e) {
        ids += e.code + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      this.operationLoading = true;
      findByCodes(ids).then(res=>{
          this.operationLoading = false;
          if(res.result.length===0){
              this.$Modal.confirm({
              title: "确认删除",
              content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
              onOk: () => {
                this.operationLoading = true;
                let ids = "";
                this.selectList.forEach(function(e) {
                  ids += e.id + ",";
                });
                ids = ids.substring(0, ids.length - 1);
                deleteEstate(ids).then(res => {
                  this.operationLoading = false;
                  if (res.success === true) {
                    this.$Message.success("删除成功");
                    this.clearSelectAll();
                    this.getUserList();
                  }
                });
              }
            });
          }else{
            this.$Modal.error({
                title: '错误提示',
                content: '在您选择的小区中,其中小区编码为【'+res.result.toString()+"】的小区有排班信息,请重新选择或者先删除该小区下的所有排班信息！！！"
            });
          }
      })
      
    },
    getCoordinate(v){
      this.userForm.longitude= String(v.longitude)
      this.userForm.latitude = String(v.latitude)
      this.userForm.address =v.address
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