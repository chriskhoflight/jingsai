<style lang="less">
@import "./withdrawalDetails.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Col>
              <Button type="primary" icon="ios-arrow-back" @click="back">返回</Button>
            </Col>
          </Row>
          <br />
          <!-- 搜索框 -->
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="80" class="search-form">
              <Form-item label="提现进度" prop="status">
                <Select v-model="searchForm.status" style="width:200px" placeholder="请选择" clearable>
                  <Option :value="0">待审核</Option>
                  <Option :value="1">已通过</Option>
                  <Option :value="2">不通过</Option>
                  <Option :value="3">已系统转账</Option>
                  <Option :value="4">系统转账失败</Option>
                  <Option :value="5">已人工转账</Option>
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
              <Form-item style="margin-left:-35px;" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
              </Form-item>
            </Form>
          </Row>
          <Row class="operation">
            <!-- <Button type="text"><strong>批量审核:</strong></Button> -->
            <Button type="success" @click="batchPassedData" icon="md-checkmark">批量通过</Button>
            <Button type="error" @click="batchNotPassedData" icon="md-close">批量不通过</Button>
          </Row>
           <Row>
            <Alert show-icon>
              已选择
              <span class="select-count">{{selectCount}}</span> 项
              <a class="select-clear" @click="clearSelectAll">清空</a>
            </Alert>
          </Row>
          <!-- 表格 -->
          <Row>
            <Table
              :loading="loading"
              border
              :columns="wxUserColumns"
              :data="wxUserData"
              sortable="custom"
              @on-sort-change="changeSort"
              @on-selection-change="showSelect"
              ref="table"
            ></Table>
          </Row>

          <!-- 分页 -->
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
  </div>
</template>

<script>
import {
  getIntegralWithdrawalDetailsList,
  batchNotPassed,
  batchPassed,
  integralWithdrawalVeryfyNotPassed,
  integralWithdrawalVeryfyPassed,
  integralDetailVeryfyPassed,
  integralDetailVeryfyNotPassed,
  detailbatchPassed,
  detailbatchNotPassed,
  handPaied
} from "@/api/integral";
export default {
  name: "withdrawalDetails",
  data() {
    return {
      who:this.$route.params.who,
      des:"",
      verifyForm: {
        description: "",
        who:2,
      },
      selectCount: 0,
      loading: false,
      searchForm: {
        userId: this.$route.params.userId,
        status: [],
        // 分页
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        // 时间
        startDate: "",
        endDate: ""
      },
      // 时间选择器
      selectDate: null,
      wxUserColumns: [
         {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left"
        },
        {
          title:"序号",
          type: "index",
          width: 70,
          align: "center",
          fixed: "left"
        },
        {
          title: "提现金额",
          key: "amount",
          width: 110,
          sortable: true,
          fixed: "left"
        },
        {
          title: "消费积分",
          key: "integral",
          width: 110,
          sortable: true,
          fixed: "left"
        },
        {
          title: "提现进度",
          key: "status",
          width: 135,
          sortable: true,
          fixed: "right",
          render: (h, params) => {
            let re = "";
            if (params.row.status === 0 || params.row.status === null) {
              return h("div", [
                h(
                  "tag",
                  {
                    props: {
                      type: "border",
                      color: "default"
                    }
                  },
                  "待审核"
                )
              ]);
            }
            if (params.row.status === 1) {
              return h("div", [
                h(
                  "tag",
                  {
                    props: {
                      type: "border",
                      color: "success"
                    }
                  },
                  "已通过"
                )
              ]);
            }
            if (params.row.status === 2) {
              return h("div", [
                h(
                  "tag",
                  {
                    props: {
                      type: "border",
                      color: "error"
                    }
                  },
                  "不通过"
                )
              ]);
            }
            if (params.row.status === 3) {
              return h("div", [
                h(
                  "tag",
                  {
                    props: {
                      type: "border",
                      color: "success"
                    }
                  },
                  "已系统转账"
                )
              ]);
            }
            if (params.row.status === 4) {
              return h("div", [
                h(
                  "tag",
                  {
                    props: {
                      type: "border",
                      color: "error"
                    }
                  },
                  "系统转账失败"
                )
              ]);
            }
            if (params.row.status === 5) {
              return h("div", [
                h(
                  "tag",
                  {
                    props: {
                      type: "border",
                      color: "success"
                    }
                  },
                  "已人工转账"
                )
              ]);
            }
          }
        },
        {
          title: "用户申请提现备注",
          key: "remark",
          minWidth: 145,
          tooltip: true
        },
        {
          title: "提现申请审核备注",
          key: "description",
          minWidth: 145,
          tooltip: true
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          width: 150
        },
        {
          title: "提现审核",
          key: "action",
          minWidth: 300,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            if (params.row.status === 2) {
              return h("div", [h("tag", "审核不通过")]);
            } else if (params.row.status === 3) {
              return h("div", [h("tag", "已系统转账")]);
            } else if (params.row.status === 5) {
              return h("div", [h("tag", "已人工转账")]);
            } else if (params.row.status === 1 || params.row.status === 4) {
              return h("div", [h(
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
                        this.handPaiedData(params.row.id);
                      }
                    }
                  },
                  "人工转账"
                ),]);
            } else {
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
                        this.veryfyPassed(params.row);
                      }
                    }
                  },
                  "通过"
                ),
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
                        this.veryfyNotPassed(params.row);
                      }
                    }
                  },
                  "不通过"
                )
              ]);
            }
          }
        }
      ],
      wxUserData: [],
      // 分页-总记录数
      total: 0
    };
  },
  methods: {
    handPaiedData(ids) {
      this.$Modal.confirm({
        title: "确认人工转账",
        onOk: () => {
          handPaied(ids).then(res => {
            if (res.success) {
              this.$Message.success("操作成功");
              this.getIntegralWithdrawalDetailsListData();
            } else {
              this.$Message.warning("操作失败");
              this.getIntegralWithdrawalDetailsListData();
            }
          });
        }
      });
    },
    showSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    batchPassedData() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要审核的数据");
        return;
      }
      let reVerify = false;
      this.selectList.forEach(function(e) {
        if (e.status !== 0) {
          reVerify = true;
          return false;
        }
      });
      if (reVerify) {
        this.$Message.warning("您选择了已被审核的数据，不能重复审核");
        return;
      }
      this.$Modal.confirm({
        title: "确认审核",
        // content: "您确认要审核所选的 " + this.selectCount + " 条数据?",
        render: h => {
          return h("Input", {
            props: {
              value: "",
              autofocus: true,
              placeholder: "请输入审核备注..."
            },
            on: {
              input: val => {
                this.verifyForm.description = val;
              }
            }
          });
        },
        onOk: () => {
          if (
            this.verifyForm.description === "" ||
            this.verifyForm.description === undefined ||
            this.verifyForm.description === null
          ) {
            this.$Message.warning("审核失败，备注不能为空");
            return;
          }
          let ids = "";
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          this.verifyForm.who = this.who;
          ids = ids.substring(0, ids.length - 1);
          detailbatchPassed(ids, this.verifyForm).then(res => {
            if (res.success) {
              this.$Message.success("审核成功");
              this.clearSelectAll();
              this.getIntegralWithdrawalDetailsListData();
            } else {
              this.$Message.success("审核失败");
              this.clearSelectAll();
              this.getIntegralWithdrawalDetailsListData();
            }
          });
        }
      });
    },
    batchNotPassedData() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要审核的数据");
        return;
      }
      let reVerify = false;
      this.selectList.forEach(function(e) {
        if (e.status !== 0) {
          reVerify = true;
          return false;
        }
      });
      if (reVerify) {
        this.$Message.warning("您选择了已被审核的数据，不能重复审核");
        return;
      }
      this.$Modal.confirm({
        title: "确认审核",
        render: h => {
          return h("Input", {
            props: {
              value: "",
              autofocus: true,
              placeholder: "请输入审核备注..."
            },
            on: {
              input: val => {
                this.verifyForm.description = val;
              }
            }
          });
        },
        onOk: () => {
          if (
            this.verifyForm.description === "" ||
            this.verifyForm.description === undefined ||
            this.verifyForm.description === null
          ) {
            this.$Message.warning("审核失败，备注不能为空");
            return;
          }
          this.verifyForm.who = this.searchForm.who;
          let ids = "";
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          this.verifyForm.who = this.who;
          ids = ids.substring(0, ids.length - 1);
          detailbatchNotPassed(ids, this.verifyForm).then(res => {
            if (res.success) {
              this.$Message.success("审核成功");
              this.clearSelectAll();
              this.getIntegralWithdrawalDetailsListData();
            } else {
              this.$Message.success("审核失败");
              this.clearSelectAll();
              this.getIntegralWithdrawalDetailsListData();
            }
          });
        }
      });
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    veryfyPassed(v) {
      this.$Modal.confirm({
        title: "确认审核",
        render: h => {
          return h("Input", {
            props: {
              value: "",
              autofocus: true,
              placeholder: "请输入审核备注..."
            },
            on: {
              input: val => {
                this.des = val;
              }
            }
          });
        },
        onOk: () => {
          if (
            this.des === "" ||
            this.des === undefined ||
            this.des === null
          ) {
            this.$Message.warning("审核失败，备注不能为空");
            return;
          }
          v.description = this.des;
          v.who = this.who
          integralDetailVeryfyPassed(v).then(res => {
            if (res.success) {
              this.$Message.success("审核已完成");
              this.getIntegralWithdrawalDetailsListData();
            } else {
              this.$Message.warning("审核失败");
              this.getIntegralWithdrawalDetailsListData();
            }
            this.des = "";
          });
        }
      });
    },
    veryfyNotPassed(v) {
      this.$Modal.confirm({
        title: "确认审核",
        render: h => {
          return h("Input", {
            props: {
              value: "",
              autofocus: true,
              placeholder: "请输入审核备注..."
            },
            on: {
              input: val => {
                this.des = val;
              }
            }
          });
        },
        onOk: () => {
          if (
            this.des === "" ||
            this.des === undefined ||
            this.des === null
          ) {
            this.$Message.warning("审核失败，备注不能为空");
            return;
          }
          v.description = this.des;
          v.who = this.who
          integralDetailVeryfyNotPassed(v).then(res => {
            if (res.success) {
              this.$Message.success("审核已完成");
              this.getIntegralWithdrawalDetailsListData();
            } else {
              this.$Message.warning("审核失败");
              this.getIntegralWithdrawalDetailsListData();
            }
            this.des = "";
          });
        }
      });
    },
    back() {
      window.history.back();
    },
    getIntegralWithdrawalDetailsListData() {
      this.loading = false;
      getIntegralWithdrawalDetailsList(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.wxUserData = res.result.content;
          this.total = res.result.totalElements;
        }
      });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getIntegralWithdrawalDetailsListData();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getIntegralWithdrawalDetailsListData();
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getIntegralWithdrawalDetailsListData();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.selectDate = null;
      this.searchForm.startDate = "";
      this.searchForm.endDate = "";
      this.getIntegralWithdrawalDetailsListData();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
    }
  },
  watch: {
    "$route.name"(toC, fromC) {
      if (fromC === "integral-manage" && toC === "withdrawalDetails") {

      } else {
        this.getIntegralWithdrawalDetailsListData();
      }
    }
  },
  mounted() {
    this.getIntegralWithdrawalDetailsListData();
  }
};
</script>