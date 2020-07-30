<style lang="less">
@import "./estateScheduleManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="星期" prop="week">
                  <Select
                    v-model="searchForm.week"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option value="星期一">星期一</Option>
                    <Option value="星期二">星期二</Option>
                    <Option value="星期三">星期三</Option>
                    <Option value="星期四">星期四</Option>
                    <Option value="星期五">星期五</Option>
                    <Option value="星期六">星期六</Option>
                    <Option value="星期日">星期日</Option>
    
                  </Select>
              </Form-item>
              <span v-if="drop">
                <Form-item label="回收物品描述" prop="recoveryDesc">
                  <Input
                    type="text"
                    v-model="searchForm.recoveryDesc"
                    clearable
                    placeholder="请输入回收物品描述"
                    style="width: 200px"
                  />
                </Form-item>
                <Form-item label="小区编码">
                  <Select 
                    v-model="searchForm.estateCodes"
                    placeholder="请选择小区"
                    clearable
                    style="width:200px"
                    >
                    <Option v-for="item in estateCodeAndName" :value="item.code" :label="item.code+item.name" :key="item.value"></Option>
                  </Select>
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
            <Button @click="add" type="primary" icon="md-add">添加排班信息</Button>
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
        <FormItem label="星期" prop="weekNum">
          <!-- <Input v-model="userForm.week" autocomplete="off"/> -->
          <Select v-model="userForm.weekNum" placeholder="请选择" :label-in-value="true" @on-change="addWeek">
            <Option value="1">星期一</Option>
            <Option value="2">星期二</Option>
            <Option value="3">星期三</Option>
            <Option value="4">星期四</Option>
            <Option value="5">星期五</Option>
            <Option value="6">星期六</Option>
            <Option value="7">星期日</Option>
          </Select>
        </FormItem>
        <FormItem label="回收车辆" prop="recoveryCar">
          <Input v-model="userForm.recoveryCar"/>
        </FormItem>
        <FormItem label="回收物品描述" prop="recoveryDesc">
          <Input v-model="userForm.recoveryDesc"/>
        </FormItem>
        
         <FormItem label="状态" prop="status">
          <Select v-model="userForm.status" placeholder="请选择">
            <Option value="0">正常启用</Option>
            <Option value="-1">禁用</Option>
          </Select>
        </FormItem>

        <FormItem label="上门收运时间" prop="recoveryTime">
          <i-col span="12">
              <Time-picker  format="HH:mm" type="timerange" placement="bottom-end"  placeholder="选择时间" style="width: 168px" v-model="userForm.recoveryTime"></Time-picker>
          </i-col>
        </FormItem>

        <dynamic-form :selectOptions="estateCodeAndName" ref="dynamicForm" :data="initData"></dynamic-form>
        <!-- <FormItem label="收运小区" prop="estateCodes">
          <Poptip trigger="hover" title="提示" content="选择的顺序既是路线">
            <Select v-model="userForm.estateCodes" multiple style="width:260px" >
              <Option v-for="item in estateCodeAndName" :value="item.code" :label="item.name" :key="item.value"></Option>
            </Select>
          </Poptip>
        </FormItem> -->
        <!-- <FormItem label="星期值" prop="weekNum">
          <InputNumber :max="100" :min="0" v-model="userForm.weekNum"></InputNumber>
          <span style="margin-left:5px">值越小越靠前</span>
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
    <Modal v-model="timeLine" title="途经小区" width="400" footer-hide>
      <Timeline>
          <TimelineItem v-for="item in estateInfo" :value="item.code" :label="item.name" :key="item.value">
            <p class="time">时间: {{item.time}}</p>
            <p class="content">小区名称: {{item.name}}</p>
            <p class="content">地址: {{item.address}}</p>
          </TimelineItem>
      </Timeline>
    </Modal>
  </div>
</template>

<script>
import{
  getScheduleList,
  getEstateCode,
  addSchedule,
  enableSchedule,
  disableSchedule,
  editSchedule,
  deleteSchedule,
  findByCodesArray
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
import dynamicForm from "@/views/components/dynamic-form/dynamicForm.vue";
export default {
  name: "user-manage",
  components: {
    circleLoading,
    expandRow,
    departmentChoose,
    departmentTreeChoose,
    uploadPicInput,
    dynamicForm
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
      if(!(Number(value)&&(value)%1 === 0)){
        callback(new Error("请输入整数金额"));
      }else{
        callback();
      }
    };
    return {
      estateInfo:"",
      showEstate:[],
      timeLine:false,
      loading: true,
      operationLoading: false,
      loadingExport: true,
      modalExportAll: false,
      drop: false,
      oldPhone:"",
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      selectCount: 0,
      estateCodeAndName:[],
      selectList: [],
      dataDep: [],
      searchKey: "",
      searchForm: {
        // weekNum:"",
        estateCodes:"",
        week: "",
        recoveryDesc:"",
        recoveryTime:"",
        status:"",
        pageNumber: 1,
        pageSize: 10,
        sort: "weekNum",
        order: "desc",
        startDate: "",
        endDate: ""
      },
      selectDate: null,
      modalType: 0,
      userModalVisible: false,
      modalTitle: "",
      userForm: {
        // id:"",
        week: "",
        recoveryCar:"",
        recoveryDesc: "",
        recoveryTime:'',
        estateCodes:"",
        weekNum:"",
        status:"",
        arriveTimesSlot:''
      },
      initData:[],
      userRoles: [],
      roleList: [],
      errorPass: "",
      userFormValidate: {
        recoveryCar:[
          {required :true,message:"回收车辆不能为空",trigger:"blur"}
        ],
        recoveryDesc:[
          {required : true,message:"回收物品描述不能为空",trigger:"blur"}
        ],
        name: [
          { required: true, message: "姓名不能为空", trigger: "blur" }
        ],
        weekNum:[
          { required :true,message:"星期不能为空",trigger:"blur"},
          { validator :isEmpty,trigger:'blur'}
        ],
        recoveryTime:[
          { validator:isEmpty,trigger:"blur"}
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
        estateCodes:[
          {validator:isEmpty,trigger:'blur'}
        ],
        address: [
          { required: true, message: "地址不能为空", trigger: "blur" }
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
          title: "星期",
          key: "week",
          minWidth: 145,
          fixed: "left"
        },
        {
          title: "回收物品描述",
          key: "recoveryDesc",
          minWidth: 115,
        },
        {
          title: "上门收运时间",
          key: "recoveryTime",
          minWidth: 180,
          sortable: true
        },
        {
          title:"小区编码",
          key:"estateCodes",
          minWidth:150,
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
          title:"回收车辆",
          key:"recoveryCar",
          minWidth:115
        },
        {
          title: "星期数值",
          key: "weekNum",
          minWidth: 120,
          fixed: "left",
          sortable: true,
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
                  style:{
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
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
                  on:{
                    click:() =>{
                      this.show(params.row);
                    }
                  }
                },
                "途经小区"
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
      this.getEstate();
    },
    getEstate(){
      getEstateCode().then(response=>{
        this.estateCodeAndName = response.result;
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
    time(v) {
    //  console.log(v)
      //拼接成字符串，保存到数据库
      this.userForm.recoveryTime=v[0]+"-"+v[1]
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
      getScheduleList(this.searchForm).then(res => {
        this.loading = false;
        if (res.success === true) {
          // console.log(res.result.content)
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
        // console.log(this.$refs.dynamicForm.formDynamic.items)
        if (valid) {
            let data = JSON.stringify(this.userForm)
            let postData = JSON.parse(data)
            postData.recoveryTime = this.userForm.recoveryTime.join("-")
            let estateCodes = ''
            let times = ''
            let flag = false
            this.$refs.dynamicForm.formDynamic.items.forEach((item,index,arr)=>{
              if(item.status!==0){
                  if(item.value!==''&&item.time[0]!==''&&item.time[1]!==''){
                    let separator = index ===arr.length-1 ? '':","
                    estateCodes += item.value + separator
                    times += item.time.join("-")+separator
                  }else{
                      flag = true
                  }
              }    
            })
            if(flag){
              this.$Message.error("时间段输入错误,请重新输入")
              return
            }
            let index = estateCodes.lastIndexOf(",")
            if(index===estateCodes.length-1){
                estateCodes = estateCodes.substring(0,index)
                times = times.substring(0,times.lastIndexOf(","))
            }
            postData.estateCodes = estateCodes
            postData.arriveTimesSlot = times
          if (this.modalType === 0) {
            // 添加用户 避免编辑后传入id
            delete this.userForm.id;
            addSchedule(postData).then(res => {
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
            editSchedule(postData).then(res => {
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
    add() {
      this.modalType = 0;
      this.modalTitle = "添加排班信息";
      this.$refs.userForm.resetFields();
      this.$refs.dynamicForm.handleReset("formDynamic")
      this.userModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑排班信息";
      this.$refs.userForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      // console.log(data)
      data.estateCodes = data.estateCodes.split(",")
      let initData = []
      let times = data.arriveTimesSlot.split(",") 
      data.estateCodes.forEach((item,index,arr)=>{
        let time = times[index].split("-")
          initData.push({
            index,
            status:1,
            value:item,
            time
          })
      })
      this.initData = initData
      // console.log(this.initData)
      // console.log("estateCodes is:"+data.estateCodes)
      data.status = String(data.status)
      data.recoveryTime = data.recoveryTime.split("-")
      // console.log(data.recoveryTime)
      // console.log(data.weekNum)
      data.weekNum = String(data.weekNum)
      this.userForm = data;
      
      //this.$refs.depTree.setSelectDep([data.departmentId], data.departmentTitle);
      this.userModalVisible = true;
    },
    enable(v) {
      this.$Modal.confirm({
        title: "确认启用",
        content: "您确认该排班信息吗",
        onOk: () => {
          this.operationLoading = true;
          enableSchedule(v.id).then(res => {
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
        content: "您确认要禁用该排班信息吗",
        onOk: () => {
          this.operationLoading = true;
          disableSchedule(v.id).then(res => {
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
        content: "您确认要删除该排班信息吗？",
        onOk: () => {
          this.operationLoading = true;
          deleteSchedule(v.id).then(res => {
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
      // console.log(v)
      this.timeLine=true;
      this.showEstate=v.estateCodes.toString();
      findByCodesArray({code :this.showEstate}).then(res =>{
        // console.log(this.showEstate)
        this.loading = false;
        if(res.success === true){
          // console.log(this.showEstate)
          res.result.forEach((item,index)=>{
              item.time = v.arriveTimesSlot.split(",")[index]
          })
          this.estateInfo = res.result;

          // console.log("----")
          // console.log(this.estateInfo)
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
          deleteSchedule(ids).then(res => {
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
    addWeek(val){
      // console.log("---"+this.userForm.weekNum)
      // console.log(val)
      if(val!==undefined){
          this.userForm.week = val.label
          this.userForm.weekNum = val.value
      }
        
    }
  },
  mounted() {
    this.init();
    this.getRoleList();
  }
};
</script>
<style scoped>
    .time{
        font-size: 14px;
        font-weight: bold;
    }
    .content{
        padding-left: 5px;
    }
</style>