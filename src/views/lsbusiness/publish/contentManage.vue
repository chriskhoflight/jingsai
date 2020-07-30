<style lang="less">
@import "./contentManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <!-- 搜索框表单 -->
          <Row>
            <Form
              ref="searchForm"
              :model="searchForm"
              inline
              :label-width="70"
              class="search-form"
            >
              <Form-item label="标题" prop="title">
                <Input
                  type="text"
                  v-model.trim="searchForm.title"
                  clearable
                  placeholder="请输入标题"
                  style="width: 200px"
                />
              </Form-item>
              <Form-item label="内容类别" prop="contentType">
                <Select
                  v-model.trim="searchForm.contentType"
                  placeholder="请选择"
                  clearable
                  style="width: 200px"
                >
                  <Option
                    v-for="(item, i) in dictContentType"
                    :key="i"
                    :value="item.value"
                  >{{item.title}}</Option>
                </Select>
              </Form-item>
              <span v-if="drop">
                <br />
                <Form-item label="作者" prop="author">
                  <Input
                    type="text"
                    v-model.trim="searchForm.author"
                    clearable
                    placeholder="请输入作者"
                    style="width: 200px"
                  />
                </Form-item>
                <Form-item label="发布时间">
                  <DatePicker
                    v-model="selectDate"
                    type="daterange"
                    format="yyyy-MM-dd"
                    clearable
                    @on-change="selectDateRange"
                    placeholder="选择发布起始时间"
                    style="width: 200px"
                  ></DatePicker>
                </Form-item>
                <br />
                <Form-item prop="isPublication" label="已发布">
                  <Select
                    v-model="searchForm.isPublication"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option :value="0">否</Option>
                    <Option :value="1">是</Option>
                  </Select>
                </Form-item>
                <Form-item prop="isTop" label="已置顶">
                  <Select
                    v-model="searchForm.isTop"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option :value="0">否</Option>
                    <Option :value="1">是</Option>
                  </Select>
                </Form-item>
              </span>
              <Form-item style="margin-left:-35px;" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
                <!-- 展开折叠其它搜索条件 -->
                <a class="drop-down" @click="dropDown">
                  {{dropDownContent}}
                  <Icon :type="dropDownIcon"></Icon>
                </a>
              </Form-item>
            </Form>
          </Row>

          <!-- 操作 -->
          <Row class="operation">
            <Button @click="add" type="primary" icon="md-add">发布内容</Button>
            <Button @click="delAll" icon="md-trash">批量删除</Button>
          </Row>

          <Row>
            <Alert show-icon>
              已选择
              <span class="select-count">{{selectCount}}</span> 项
              <a class="select-clear" @click="clearSelectAll">清空</a>
            </Alert>
          </Row>

          <!-- 内容表格 :columns-表头，:data-表内数据-->
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
  getWechatContentList,
  // 批量删除
  deleteContent,
} from "@/api/publishContent";
import {
  getDictDataByType
} from "@/api/index";
// import expandRow from "./expand.vue";
import "./see";
import Publish from "./publish.vue";
// 动态路由
import { otherRouter } from "@/router/router";
export default {
  name: "contentManage",
  components: {
    // expandRow,
  },
  data() {
    return {
      // 返回内容列表重载数据
      // 表格数据加载中
      loading: true,
      // 折叠搜索表单
      drop: false,
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      selectCount: 0,
      // 保存表格中复选框被选中的记录
      selectList: [],
      // 搜索表单
      searchForm: {
        //WechatContetn
        title: "",
        author: "",
        isPublicatin: "",
        isTop: "",
        seoDescription: "",
        seoKeywords: "",
        seoTitle: "",
        introductionImg: "",
        content: "",
        url: "",
        contentType: "",
        // PageVO
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        // searchVO=selectDate
        startDate: "",
        endDate: ""
      },
      selectDate: null,
      submitLoading: false,
      // 内容表格
      columns: [
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
          title: "标题",
          key: "title",
          minWidth: 100,
          fixed: "left",
          tooltip:true,
        },
        {
          title: "作者",
          key: "author",
          width: 120,
          tooltip:true,
        },
        {
          title: "发布时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          width: 150
        },
        {
          title: "内容类别",
          key: "contentType",
          width: 120,
          render: (h, params) => {
            let re = "";
            this.dictContentType.forEach(e => {
              if (e.value == params.row.contentType) {
                re = e.title;
              }
            });
            return h("div", re);
          }
        },
        {
          title: "已发布",
          width: 100,
          align: "center",
          render: (h, params) => {
            let re = "";
            if (1 == params.row.isPublication) {
              re = "是";
            }
            if (0 == params.row.isPublication) {
              re = "否";
            }
            return h("div", re);
          }
        },
        {
          title: "已置顶",
          key: "isTop",
          width: 100,
          align: "center",
          render: (h, params) => {
            let re = "";
            if (1 == params.row.isTop) {
              re = "是";
            }
            if (0 == params.row.isTop) {
              re = "否";
            }
            return h("div", re);
          }
        },
        {
          title: "操作",
          key: "action",
          width: 200,
          align: "center",
          fixed: "right",
          render: (h, params) => {
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
              h(
                "Button",
                {
                  props: {
                    size: "small",
                    type:"info"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.see(params.row);
                    }
                  }
                },
                "查看"
              ),
              h(
                "Button",
                {
                  props: {
                    size: "small",
                    type:"error"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.deleteOneContent(params.row);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      // 保存内容表数据
      data: [],
      total: 0,
      // 内容类别
      dictContentType: []
    };
  },
  methods: {
    init() {
      this.getContentList();
      this.getDictContentTypeData();
    },
    getDictContentTypeData() {
      // 获取性别字典数据
      getDictDataByType("contentType").then(res => {
        if (res.success) {
          this.dictContentType = res.result;
        }
      });
    },
    // 展开按钮用户事件
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
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getContentList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getContentList();
    },
    // 选择发布起始时间
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    // 发送http请求，多条件搜索用户列表
    getContentList() {
      this.loading = true;
      getWechatContentList(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.content;
          this.total = res.result.totalElements;
        }
      });
    },
    // 列表搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getContentList();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.selectDate = null;
      this.searchForm.startDate = "";
      this.searchForm.endDate = "";
      // 重新加载数据
      this.getContentList();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getContentList();
    },
    // 复选框点击事件
    showSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    // 批量删除
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
          deleteContent(ids).then(res => {
            if (res.success) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getContentList();
            }
          });
        }
      });
    },
    deleteOneContent(e) {
      this.$Modal.confirm({
        title: "确认删除标题是\""+e.title+"\"的文章？",
        onOk: () => {
          if(this.data.length===1&&this.searchForm.pageNumber>=2){
            this.searchForm.pageNumber-=1
          }
          let ids = "";
          ids = e.id;
          deleteContent(ids).then(res => {
            if (res.success) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getContentList();
            }
          });
        }
      });
    },
    add() {
      this.$router.push({ name: "publishContent" });
    },
    // 跳转到编辑页
    edit(v) {
      this.$router.push({name: "editContent", params: {id: v.id}});
    },
    // 跳转到查看页
    see(v) {
      this.$router.push({ name: "seeContent", params: { id: v.id } });
    }
  },
  // watch: {
  //   // 如果路由有变化，会再次执行该方法
  //   '$route.path'(toC,fromC){
  //       console.log("newVal is :"+toC)
  //       if(toC=='seeContent' && fromC=='contentManage'){
  //           this.init();
  //           console.log("执行")
  //       }

  //   }
  //     },
  watch: {
    "$route.name"(to, from) {
      if (to==='contentManage') {
        this.init();
      }
    }
  },
  created() {
    this.init();
  }
};
</script>