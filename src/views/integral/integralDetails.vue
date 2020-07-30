<style lang="less">
@import "./integralManage.less";
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
          <Row type="flex" justify="center">
            <Col>
              <h1>积分明细</h1>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <h2>用户名：{{showName}}&nbsp;&nbsp;&nbsp;&nbsp;总积分：{{totalIntegral}}</h2>
          </Row>
          <br />
          <!-- 搜索框 -->
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="80" class="search-form">
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
import { getIntegralDetailsList } from "@/api/integral";
export default {
  name: "integralDetails",
  data() {
    return {
      loading: false,
      searchForm: {
        userId: this.$route.params.userId,

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
          title: "序号",
          type: "index",
          width: 70,
          align: "center",
          fixed: "left"
        },
        {
          title: "积分",
          key: "integral",
          minWidth: 145,
          sortable: true,
          fixed: "left"
        },
        {
          title: "说明",
          key: "description",
          minWidth: 145,
          fixed: "left"
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          width: 150
        }
      ],
      wxUserData: [],
      // 分页-总记录数
      total: 0
    };
  },
  methods: {
    back() {
      window.history.back();
    },
    init() {
      this.getIntegraDetailslListData();
    },
    getIntegraDetailslListData() {
      this.loading = true;
      getIntegralDetailsList(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.wxUserData = res.result.content;
          this.total = res.result.totalElements;
        }
      });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getIntegraDetailslListData();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getIntegraDetailslListData();
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
      this.getIntegraDetailslListData();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.selectDate = null;
      this.searchForm.startDate = "";
      this.searchForm.endDate = "";
      this.getIntegraDetailslListData();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getIntegraDetailslListData();
    }
  },
  computed: {
    showName: function() {
      return this.$route.params.nickName;
    },
    totalIntegral: function() {
      return this.$route.params.totalIntegral;
    }
  },
  watch: {
    "$route.name"(toC, fromC) {
      if (fromC === "integral-manage" && toC === "integralDetails") {
        console.log("diaoyongl")
      } else {
        this.init();
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>