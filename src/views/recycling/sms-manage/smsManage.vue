<style lang="less">
@import "./smsManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form  ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="手机号：" prop="phoneNum" >
                <Input
                  type="text"
                  v-model="searchForm.phoneNum"
                  clearable
                  placeholder="请输入手机号"
                  style="width: 200px"
                />
              </Form-item>

              <Form-item label="短信状态" prop="status">
                <Select
                  v-model="searchForm.status"
                  placeholder="请选择"
                  clearable
                  style="width: 200px"
                >
                  <Option value="-1">全部</Option>
                  <Option value="0">待发送</Option>
                  <Option value="1">发送成功</Option>
                  <Option value="2">发送失败</Option>
                </Select>
              </Form-item>

              <Form-item label="短信类型" prop="type">
                <Select v-model="searchForm.type" placeholder="请选择" clearable style="width: 200px">
                  <Option value="-1">全部</Option>
                  <Option value="1">回收人员注册</Option>
                  <Option value="2">接单提醒</Option>
                  <Option value="3">验证码</Option>
                  <Option value="4">回收人员登陆</Option>
                  <Option value="5">手动派单提醒</Option>
                </Select>
              </Form-item>
              <Form-item label="发送时间">
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
                <!-- <a class="drop-down" @click="dropDown">
                  {{dropDownContent}}
                  <Icon :type="dropDownIcon"></Icon>
                </a>-->
              </Form-item>
            </Form>
          </Row>
          <!-- <Row class="operation"> -->
            <!-- <Button @click="add" type="primary" icon="md-add">发送短信</Button> -->
            <!-- <Button @click="delAll" icon="md-trash">批量删除</Button> -->
            <!-- <Dropdown @on-click="handleDropdown">
              <Button>
                更多操作
                <Icon type="md-arrow-dropdown" />
              </Button>

              <DropdownMenu slot="list">
                <DropdownItem name="refresh">刷新</DropdownItem>
                <DropdownItem name="exportData">导出所选数据</DropdownItem>
            <!-- <DropdownItem name="exportAll">导出全部数据</DropdownItem>-->
            <!-- <DropdownItem name="importData">导入数据</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <circleLoading v-if="operationLoading" />-->
          <!-- </Row> -->
          <!-- <Row>
            <Alert show-icon>
              已选择
              <span class="select-count">{{selectCount}}</span> 项
              <a class="select-clear" @click="clearSelectAll">清空</a>
            </Alert>
          </Row>-->
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
      <Form :rules="FormRules" ref="userForm" :model="userForm" :label-width="70" >
        <FormItem label="手机号" prop="phoneNum">
          <Input v-model="userForm.phoneNum" placeholder="请输入手机号码" type="number" />
        </FormItem>
        <FormItem label="短信内容" prop="contactsAdderss">
          <Input type="textarea" :rows="4" v-model="userForm.content" placeholder="请输入短信内容" />
        </FormItem>
        <FormItem label="短信类型" prop="type">
          <Select v-model="userForm.type" placeholder="请选择">
            <Option :value="0">测试</Option>
            <Option :value="1">回收人员注册</Option>
            <Option :value="2">接单提醒</Option>
            <Option :value="3">验证码</Option>
            <Option :value="4">回收人员登陆</Option>
             <Option :value="5">手动派单提醒

             </Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelUser">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitMsg">确认发送</Button>
      </div>
    </Modal>
    <Modal v-model="modalExportAll" title="确认导出" :loading="loadingExport" @on-ok="exportAll">
      <p>您确认要导出全部 {{total}} 条数据？</p>
    </Modal>
  </div>
</template>

<script>
import { sendOneSms, delSms, getAllSms } from "@/api/sms";
import {
  getUserListData,
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
      FormRules: {
        phoneNum: [{validator: validateMobile,trigger:'blur'}]},
      loading: true,
      operationLoading: false,
      loadingExport: true,
      modalExportAll: false,
      drop: false,
      // dropDownContent: "展开",
      // dropDownIcon: "ios-arrow-down",
      selectCount: 0,
      selectList: [],
      dataDep: [],
      searchKey: "",
      searchForm: {
        type: -1,  //通过判断是否-1  防止用户乱发送，0-默认类型 1-回收人员注册  2-接单通知
        phoneNum: "", //接收短信的手机号码
        status: -1, //查询状态，"状态：0-待发送 1-发送成功 2-发送失败"   传入-1代表全部
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
        // appointmentDay: "",
        // appointmentStartTime: "",
        // appointmentEndTime: "",
        // userId: "",
        type: -1,
        delFlag: 1,
        // recyclingPersonId: "",
        // contactsName: "",
        // contactsPhone: "",
        // contactsAdderss: "",
        // contactsFloor: 0,
        // isElevatorRoom: -1,
        // longitude: 0,
        // latitude: 0,
        // mileage: 0,
        // orderId: "",
        // estimatedPrice: 0,
        // paidPrice: 0,
        // status: -1,
        // isManual: -1
        phoneNum: "", //接收的手机号码
        content: "" //发送的内容
      },
      userRoles: [],
      roleList: [],
      errorPass: "",
      userFormValidate: {
        username: [
          { required: true, message: "账号不能为空", trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          { validator: validateMobile, trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱地址" },
          { type: "email", message: "邮箱格式不正确" }
        ]
      },
      submitLoading: false,
      columns: [
        // {
        //   type: "selection",
        //   width: 60,
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
          title: "序号"
        },
        {
          title: "手机号",
          align: "center",
          key: "phoneNum",
          minWidth: 145,
          sortable: true,
          fixed: "left"
        },
        {
          title: "短信状态",
          align: "center",
          key: "status",
          minWidth: 145,
          sortable: true,
          fixed: "left",
          render: (h, params) => {
            let re = "";
            if (params.row.status === 0) {
              re = "待发送";
            } else if (params.row.status === 1) {
              re = "发送成功";
            } else if (params.row.status === 2) {
              re = "发送失败";
            }
            return h("div", re);
          }
        },
        {
          title: "短信类型",
          align: "center",
          key: "type",
          minWidth: 145,
          sortable: true,
          fixed: "left",
          render: (h, params) => {
            let re = "";
            if (params.row.type === 0) {
              re = "测试";
            } else if (params.row.type === 1) {
              re = "回收人员注册";
            }else if (params.row.type === 2) {
              re = "接单提醒";
            }else if (params.row.type === 3) {
              re = "验证码";
            }else if (params.row.type === 4) {
              re = "回收人员登陆";
            }else if (params.row.type === 5) {
              re = "手动派单提醒";
            }
            return h("div", re);
          }
        },
        {
          title: "发送时间",
          align: "center",
          key: "sendTime",
          minWidth: 145,
          sortable: true,
          fixed: "left"
        },
        {
          title: "操作",
          align: "center",
          key: "action",
          width: 200,
          fixed: "right",
          render: (h, params) => {
            let enableOrDisable = "";
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.delOneMsg(params.row); //改成了取消订单的逻辑
                    }
                  }
                },
                "删除短信"
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
      if (!this.searchForm.type) {
        this.searchForm.type = -1; //后台通过判断值是否小于0决定是否进行条件查询，小于0则查询所有type
      }
      if (!this.searchForm.status) {
        this.searchForm.status = -1; //后台通过判断值是否小于0决定是否进行条件查询，小于0则查询所有type
      }
      getAllSms(this.searchForm).then(res => {
        this.loading = false;
        if (res.success === true) {
          this.data = res.result.records;
          this.total = res.result.total;
        } else if (res.success === false) {
          this.$Message.error(res.message + ",错误代码:" + res.code);
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
      getAllSms.then(res => {
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
    submitMsg() {
      this.$refs.userForm.validate(valid => {
        if (valid) {
          if (this.modalType === 0) {
            // 添加记录 避免编辑后传入id
            delete this.userForm.id;
            delete this.userForm.status;
            // var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
          //  if (!reg.test(this.userForm.phoneNum)) {
          //    this.$message.error("请输入正确的手机号码");
          //    } else 
             if (this.userForm.type != -1) {
              this.submitLoading = true;
              sendOneSms(this.userForm).then(res => {
                this.submitLoading = false;
                if (res.success === true) {
                  this.$Message.success("操作成功");
                  this.userForm.phoneNum="";
                  this.userForm.content="";
                  this.userForm.type=-1;//发送成功  参数复位
                  this.getUserList();
                  this.userModalVisible = false;
                }else{
                  this.$Message.error(res.message+",错误代码:"+res.code);
                }
              });
            } else {
              this.$Message.warning("请选择短信类型");
            }
          } else {
            // 编辑
            this.submitLoading = true;
            editUser(this.userForm).then(res => {
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
      this.userForm.avatar = v;
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "发送短信";
      this.$refs.userForm.resetFields();
      this.userModalVisible = true;
    },

    delOneMsg(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除发送给" + v.phoneNum + "的短信?",
        onOk: () => {
          delSms(v).then(res => {
            this.operationLoading = true;
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.operationLoading = false;
              this.getUserList();
            } else if (res.success === false) {
              this.$Message.error(res.message) + ",错误码:" + res.code;
            }
          });
        }
      });
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
          delOneOrder(ids).then(res => {
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