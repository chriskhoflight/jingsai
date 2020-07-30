 <script src="//unpkg.com/iview@1.0.1/dist/iview.min.js"></script>
<style lang="less">
@import "./ordersManage.less";
</style>

<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="派单方式" prop="isManual">
                <Select
                  v-model="searchForm.isManual"
                  placeholder="请选择"
                  clearable
                  style="width: 200px"
                >
                  <Option value="-1">全部</Option>
                  <Option value="0">自动派单</Option>
                  <Option value="1">人工派单</Option>
                </Select>
              </Form-item>
                            <Form-item label="订单状态" prop="status">
                <Select
                  v-model="searchForm.status"
                  placeholder="请选择"
                  clearable
                  style="width: 200px"
                >
                  <Option value="-1">全部</Option>
                  <Option value="0">待分配</Option>
                  <Option value="1">系统派单中</Option>
                  <Option value="2">已接单</Option>
                  <Option value="3">拒绝接单</Option>
                  <Option value="4">待支付</Option>
                  <Option value="5">已取消</Option>
                  <Option value="6">已完成</Option>
                  <Option value="7">已支付</Option>
                </Select>
              </Form-item>
              <Form-item label="订单号：" prop="orderId">
                <Input
                  type="text"
                  v-model="searchForm.orderId"
                  clearable
                  placeholder="请输入订单号"
                  style="width: 200px"
                />
              </Form-item>
              <Form-item label="联系人：" prop="contactsPhone">
                <Input
                  type="text"
                  v-model="searchForm.contactsPhone"
                  clearable
                  placeholder="请输入联系人手机号"
                  style="width: 200px"
                />
              </Form-item>
              <Form-item label="回收人：" prop="phone">
                <Input
                  type="text"
                  v-model="searchForm.phone"
                  clearable
                  placeholder="请输入回收人员手机号"
                  style="width: 200px"
                />
              </Form-item>

              <Form-item label="订单类型" prop="type">
                <Select v-model="searchForm.type" placeholder="请选择" clearable style="width: 200px">
                  <Option value="-1">全部</Option>
                  <Option value="0">可再生回收</Option>
                  <Option value="1">付费回收</Option>
                  <Option value="2">运输服务</Option>
                </Select>
              </Form-item>
              <Form-item label="支付方式" prop="payType">
                <Select
                  v-model="searchForm.payType"
                  placeholder="请选择"
                  clearable
                  style="width: 200px"
                >
                  <Option value="-1">全部</Option>
                  <Option value="0">积分支付</Option>
                  <Option value="1">现金支付</Option>
                  <Option value="2">微信支付</Option>
                  <!-- <Option value="3">支付宝</Option> -->
                  <Option value="9">其他方式</Option>
                </Select>
              </Form-item>

              <Form-item label="预约时间">
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
                <Button @click="handleReset">重置</Button>&nbsp;&nbsp;&nbsp;
                <Badge dot :count="this.count">
                  <Button @click="getAlarmMethod" type="primary" icon="ios-alarm">待办事项</Button>
                </Badge>

                <!-- <a class="drop-down" @click="dropDown">
                  {{dropDownContent}}
                  <Icon :type="dropDownIcon"></Icon>
                </a>-->
              </Form-item>
            </Form>
          </Row>
          <!-- <Row class="operation"> -->
          <!-- <Button @click="add" type="primary" icon="md-add">添加订单</Button> -->
          <!-- <Button @click="delAll" icon="md-trash">批量删除</Button> -->
          <!-- <Dropdown @on-click="handleDropdown">
              <Button>
                更多操作
                <Icon type="md-arrow-dropdown" />
              </Button>

              <DropdownMenu slot="list">
                <DropdownItem name="refresh">刷新</DropdownItem>
                <DropdownItem name="exportData">导出所选数据</DropdownItem>
                <DropdownItem name="exportAll">导出全部数据</DropdownItem>
                <DropdownItem name="importData">导入数据</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <circleLoading v-if="operationLoading" />
          </Row>
          <Row>
            <Alert show-icon>
              已选择
              <span class="select-count">{{selectCount}}</span> 项
              <a class="select-clear" @click="clearSelectAll">清空</a>
          </Alert>-->
          <!-- </Row> -->
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
        <FormItem label="userId" prop="userId">
          <Input v-model="userForm.userId" autocomplete="off" />
        </FormItem>
        <FormItem label="type" prop="type">
          <Input v-model="userForm.type" autocomplete="off" />
        </FormItem>
        <FormItem
          label="recyclingPersonId"
          prop="recyclingPersonId"
          v-if="modalType===0"
          :error="errorPass"
        >
          <Input v-model="userForm.recyclingPersonId" autocomplete="off" />
        </FormItem>
        <FormItem label="联系名字" prop="contactsName">
          <Input v-model="userForm.contactsName" />
        </FormItem>
        <FormItem label="联系手机" prop="contactsPhone">
          <Input v-model="userForm.contactsPhone" />
        </FormItem>
        <FormItem label="联系地址" prop="contactsAdderss">
          <Input v-model="userForm.contactsAdderss" />
        </FormItem>
        <FormItem label="联系楼层" prop="contactsFloor">
          <Input v-model="userForm.contactsFloor" />
        </FormItem>
        <FormItem label="是否电梯" prop="isElevatorRoom">
          <Input v-model="userForm.isElevatorRoom" />
        </FormItem>
        <FormItem label="联系经度" prop="longitude">
          <Input v-model="userForm.longitude" />
        </FormItem>
        <FormItem label="联系维度" prop="latitude">
          <Input v-model="userForm.latitude" />
        </FormItem>
        <FormItem label="里程" prop="mileage">
          <Input v-model="userForm.mileage" />
        </FormItem>
        <FormItem label="预约时间" prop="appointmentTime">
          <Input v-model="userForm.appointmentTime" />
        </FormItem>
        <FormItem label="订单号" prop="orderId">
          <Input v-model="userForm.orderId" />
        </FormItem>
        <FormItem label="预估价格" prop="estimatedPrice">
          <Input v-model="userForm.estimatedPrice" />
        </FormItem>
        <FormItem label="实收价格" prop="paidPrice">
          <Input v-model="userForm.paidPrice" />
        </FormItem>
        <FormItem label="订单状态" prop="status">
          <Input v-model="userForm.status" />
        </FormItem>

        <FormItem label="人工派单" prop="isManual">
          <Input v-model="userForm.isManual" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelUser">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitUser">提交</Button>
      </div>
    </Modal>
    <!-- 待办事项 -->
    <Modal v-model="alarmModalVisible" title="待办事项" :width="500" class="modalClass">
      <i-circle
        :size="300"
        :trail-width="5"
        :stroke-width="5"
        :percent="(this.allCount/this.orderCount)*100"
        stroke-linecap="square"
        stroke-color="#43a3fb"
        trail-color="#E52912"
      >
        <div class="alarm">
          <h1>{{this.manualCount}}</h1>
          <p>个订单需要人工派单</p>
          <span>
            <b>{{this.allCount}}</b>个订单尚未接单
          </span>
          <span>
            总订单数:
            <b>{{this.orderCount}}</b>
          </span>
        </div>
      </i-circle>
    </Modal>
  </div>
</template>

<script>
import {
  addOneOrder,
  getAllOrders,
  delOneOrder,
  cancelOneOrder,
  getAlarm
} from "@/api/orders";
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
      orderCount: 0, //总订单数
      count: 0, //决定是否显示代办事项的红点
      manualCount: 0,
      allCount: 0,
      alarmModalVisible: false, //待办事项的显示

      //待办事项
      pStyle: {
        fontSize: "16px",
        color: "rgba(0,0,0,0.85)",
        lineHeight: "24px",
        display: "block",
        marginBottom: "16px"
      },
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
        isManual: -1, //派单方式  0 为自动派单  1为人工派单
        payType: -1,
        phone: "", //回收人员手机号码
        orderId: "",
        type: -1, //后台通过判断值是否小于0决定是否进行条件查询，小于0则查询所有type
        contactsPhone: "",
        status: -1, //后台通过判断值是否小于0决定是否进行条件查询，小于0则查询所有type
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
        appointmentDay: "",
        appointmentStartTime: "",
        appointmentEndTime: "",
        userId: "",
        type: -1,
        recyclingPersonId: "",
        contactsName: "",
        contactsPhone: "",
        contactsAdderss: "",
        contactsFloor: 0,
        isElevatorRoom: -1,
        longitude: 0,
        latitude: 0,
        mileage: 0,
        orderId: "",
        estimatedPrice: 0,
        paidPrice: 0,
        status: -1,
        payType: -1,
        isManual: -1
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
          title: "订单号",
          align: "center",
          key: "orderId",
          minWidth: 145,
          sortable: true,
          fixed: "left"
        },
        {
          title: "下单时间",
          align: "center",
          key: "createTime",
          minWidth: 145,
          sortable: true,
          fixed: "left"
        },

        {
          title: "订单类型",
          key: "type",
          minWidth: 145,
          sortable: true,
          align: "center",
          fixed: "left",
          render: (h, params) => {
            let re = "";
            if (params.row.type === 0) {
              re = "可再生回收";
            } else if (params.row.type === 1) {
              re = "付费回收";
            } else if (params.row.type === 2) {
              re = "运输服务";
            }
            return h("div", re);
          }
        },

        {
          title: "人工派单",
          key: "isManual",
          align: "center",
          minWidth: 145,
          sortable: true,
          fixed: "left",
          render: (h, params) => {
            let re = "";
            if (params.row.isManual === 0) {
              re = "否";
            } else if (params.row.isManual === 1) {
              re = "是";
            }
            return h("div", re);
          }
        },
        {
          title: "预约时间",
          key: "appointmentTimeStr",
          align: "center",
          minWidth: 145,
          sortable: true,
          fixed: "left"
        },
        {
          title: "支付方式",
          key: "payType",
          align: "center",
          minWidth: 145,
          sortable: true,
          fixed: "left",
          render: (h, params) => {
            let re = "";
            if (params.row.payType === 0) {
              re = "积分支付";
            } else if (params.row.payType === 1) {
              re = "现金支付";
            } else if (params.row.payType === 2) {
              re = "微信支付";
            }
            // else if (params.row.payType === 3) {
            //   re = "支付宝";
            // }
            else if (params.row.payType === 9) {
              re = "其他";
            } else if (params.row.payType == null) {
              re = "暂无";
            }
            return h("div", re);
          }
        },
        {
          title: "订单状态",
          align: "center",
          key: "status",
          minWidth: 145,
          sortable: true,
          fixed: "left",
          render: (h, params) => {
            let re = "";
            var color = "";
            if (params.row.status === 0) {
              re = "待分配";
              color = "#2575EC";
            } else if (params.row.status === 1) {
              re = "系统派单中";
              color = "	#DAA520";
            } else if (params.row.status === 2) {
              re = "已接单";
              color = "#DAA520";
            } else if (params.row.status === 3) {
              re = "拒绝接单";
              color = "#E52812";
            } else if (params.row.status === 4) {
              re = "待支付";
              color = "#3CB371";
            } else if (params.row.status === 5) {
              re = "已取消";
              color = "#D3D3D3";
            } else if (params.row.status === 6) {
              re = "已完成";
              color = "#77C955";
            } else if (params.row.status === 7) {
              re = "已支付";
              color = "#556B2F";
            }
            return h(
              "div",
              {
                style: {
                  color: color
                }
              },
              re
            );
          }
        },
        {
          title: "操作",
          key: "action",
          width: 200,
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
            // enableOrDisable = h(
            //   "Button",
            //   {
            //     props: {
            //       type: "success",
            //       size: "small"
            //     },
            //     style: {
            //       marginRight: "5px"
            //     },
            //     on: {
            //       click: () => {
            //         this.enable(params.row);
            //       }
            //     }
            //   },
            //   "启用"
            // );
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
                      this.orderDetail(params.row);
                    }
                  }
                },
                "订单详情"
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
                      if (params.row.status != 5 && params.row.status != 6) {
                        this.cancelOrder(params.row); //改成了取消订单的逻辑
                      } else if (params.row.status === 5) {
                        this.$Message.error("操作无效,该订单已经被取消!");
                      } else {
                        this.$Message.error("操作无效,该订单已经完成!");
                      }
                    }
                  }
                },
                "取消订单"
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
    isAlarm(data) {
      for (var i = 0; i < data.length; i++) {
        if (
          data[i].isManual == 1 &&
          (data[i].status == 0 || data[i].status == 0)
        ) {
          this.count = 1;
          break;
        }
      }
    },
    //获取待办事项
    getAlarmMethod() {
      this.alarmModalVisible = true;
      getAlarm().then(res => {
        if (res.success === true) {
          this.orderCount = res.result.orderCount;
          this.allCount = res.result.allCount;
          this.manualCount = res.result.manualCount;
        }
      });
    },
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
      if (!this.searchForm.payType) {
        this.searchForm.payType = -1; //后台通过判断值是否小于0决定是否进行条件查询，小于0则查询所有type
      }
      getAllOrders(this.searchForm).then(res => {
        this.loading = false;
        if (res.success === true) {
          this.data = res.result.records;
          this.isAlarm(res.result.records);
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
      getAllOrders.then(res => {
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
            delete this.userForm.status;
            this.submitLoading = true;
            addOneOrder(this.userForm).then(res => {
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
    // add() {
    //   this.modalType = 0;
    //   this.modalTitle = "添加订单";
    //   this.$refs.userForm.resetFields();
    //   this.userModalVisible = true;
    // },

    //打开新的页面显示订单详情并可以人工派单
    orderDetail(v) {
      // this.modalTitle = "订单详情";    别注释
      // this.$router.push({path:'/order-detail',query:{orderData:v}});
      this.$router.push({
        name: "order-detail-manage",
        query: { orderData: v }
      });
    },

    cancelOrder(v) {
      this.$Modal.confirm({
        title: "确认取消",
        content: "您确认要取消订单 " + v.orderId + " ?",
        onOk: () => {
          cancelOneOrder(v).then(res => {
            this.operationLoading = true;
            if (res.success === true) {
              this.operationLoading = false;
              this.$Message.success(res.message);
              this.getUserList();
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

<style lang="less">
.alarm {
  & h1 {
    color: #e52912;
    font-size: 28px;
    font-weight: normal;
  }
  & p {
    color: #657180;
    font-size: 14px;
    margin: 10px 0 15px;
  }
  & span {
    display: block;
    padding-top: 15px;
    color: #657180;
    font-size: 14px;
    &:before {
      content: "";
      display: block;
      width: 50px;
      height: 1px;
      margin: 0 auto;
      background: #e0e3e6;
      position: relative;
      top: -15px;
    }
  }
  & span i {
    font-style: normal;
    color: #3f414d;
  }
  text-align: center;
}
.modalClass {
  text-align: center;
}
.demo-drawer-profile {
  font-size: 14px;
}
.demo-drawer-profile .ivu-col {
  margin-bottom: 12px;
}
</style>