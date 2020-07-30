<style lang="less">
@import "./integralManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          
          <!-- 搜索框 -->
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="80" class="search-form">
              <Form-item label="人员类型" prop="who">
                <Select v-model="searchForm.who" style="width:200px" placeholder="请选择人员类型" @on-change="handleWho">
                  <Option :value="2">用户</Option>
                  <Option :value="0">回收人员</Option>
                </Select>
              </Form-item>
              <Form-item label="用户名" prop="username">
                <Input
                  type="text"
                  v-model.trim="searchForm.username"
                  clearable
                  style="width: 200px"
                  placeholder="请输入用户名"
                />
              </Form-item>
              <br />
              <Form-item label="手机号码" prop="phone">
                <Input
                  type="text"
                  v-model.trim="searchForm.phone"
                  clearable
                  style="width: 200px"
                  placeholder="请输入手机号"
                />
              </Form-item>
              <!-- 搜索条件折叠 -->
              <!-- <span v-if="drop"> -->
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
              <!-- </span> -->
              <Form-item style="margin-left:-35px;" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
              </Form-item>
            </Form>
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
              ref="table"
            ></Table>
            <!-- <Table v-else="this.searchForm.who === 0"
              :loading="loading"
              border
              :columns="persennolColumns"
              :data="personnelData"
              sortable="custom"
              @on-sort-change="changeSort"
              ref="table"
            ></Table> -->
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
import { getIntegralList } from "@/api/integral";
import expandRow from "./expand.vue";
// import WxUserIntegral from "./wxUserIntegral.vue";
export default {
  name: "integral-manage",
  components: {
    expandRow,
    // WxUserIntegral
  },
  data() {
    return {
      userType: 2,
      loading: false,
      searchForm: {
        // 默认显示回收人员
        who: 2,
        phone: "",
        username: "",
        // 回收人员表
        // name: "",
        // 微信用户表
        // nickName:"",
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
          title:"序号",
          type: "index",
          width: 70,
          align: "center",
          fixed: "left"
        },
        {
          title: "人员类型",
          key: "who",
          minWidth: 145,
          align: "center",
          fixed: "left",
          render: (h, params) => {
            let re = "";
            if (params.row.who === 2) {
              return h("div", "用户");
            } else {
              return h("div", "回收人员");
            }
          }
        },
        {
          title: "用户名",
          key: "username",
          minWidth: 145,
          fixed: "left",
          align: "center",
        },
        {
          title: "用户积分",
          key: "integral",
          minWidth: 145,
          sortable: true,
          align: "center",
        },
        {
          title: "手机号",
          key: "phone",
          minWidth: 145,
          tooltip: true,
          align: "center",
          render: (h, params) => {
            if (params.row.phone === null || params.row.phone === undefined || params.row.phone === "") {
              return h("div", "用户未填写手机号");
            } else {
              return h("div", params.row.phone);
            }
          }
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          width: 150
        },
        {
          title: "操作",
          key: "action",
          width: 300,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "info",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.seeIntegralDetails(params.row);
                    }
                  }
                },
                "积分明细"
              ),
              h(
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
                      this.seeRechargeDetails(params.row);
                    }
                  }
                },
                "充值明细"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.seeWithdrawalDetails(params.row, this.searchForm.who);
                    }
                  }
                },
                "提现明细"
              )
            ]);
          }
        }
      ],
      // 列表数据
      // data: [],
      wxUserData: [],
      personnelData: [],
      // 分页-总记录数
      total: 0
    };
  },
  methods: {
    handleWho() {
      this.getIntegralListData();
    },
    // 查看积分明细
    seeIntegralDetails(v) {
      this.$router.push({name: "integralDetails", params: {userId: v.userId, nickName: v.nickName, totalIntegral: v.integral}});
      // this.$router.routes.push({name: 'integralDetails', params: {userId: v.userId, nickName: v.nickName, totalIntegral: v.integral}, component: () => import('@/views/integral/integralDetails.vue')})
    },
     // 查看充值明细
    seeRechargeDetails(v) {
      this.$router.push({ name: "rechargeDetails", params: {userId: v.userId, nickName: v.nickName, totalIntegral: v.integral}});
    },
    // 查看提现明细
    seeWithdrawalDetails(v, who) {
      this.$router.push({ name: "withdrawalDetails", params: {userId: v.userId, nickName: v.nickName, totalIntegral: v.integral,who: who}});
    },
    getIntegralListData() {
      this.loading = true;
      getIntegralList(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          // if (this.searchForm.who === 2) {
            this.wxUserData = res.result.records;
            this.total = res.result.total;
        }
      });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getIntegralListData();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getIntegralListData();
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
      this.getIntegralListData();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.selectDate = null;
      this.searchForm.startDate = "";
      this.searchForm.endDate = "";
      this.getIntegralListData();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getIntegralListData();
    }
  },
  mounted() {
    this.getIntegralListData();
  }
};
</script>