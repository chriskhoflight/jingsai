<style lang="less">
@import "./builderCode.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="表名称" prop="tableName">
                <Input
                  type="text"
                  v-model="searchForm.tableName"
                  clearable
                  placeholder="请输入表名称"
                  style="width: 200px"
                />
              </Form-item>
             
              <Form-item style="margin-left:-35px;" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
              </Form-item>
            </Form>
          </Row>
          <Row class="operation">
            <Button @click="add" type="primary" icon="md-add">生成代码</Button>
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
      v-model="buildModalVisible"
      :mask-closable="false"
      :width="500"
      :styles="{top: '30px'}"
    >
      <Form ref="buildForm" :model="buildForm" :label-width="100" :rules="buildFormValidate">
        <FormItem label="作者" prop="author">
            <Input type="text" v-model="buildForm.author" clearable placeholder="请输入作者" style="width: 200px"/>
        </FormItem>

        <FormItem label="包路径" prop="basePackage">
            <Input type="text" v-model="buildForm.basePackage" clearable placeholder="请输入包路径,例如:com.js.server" />
        </FormItem>

         <FormItem label="表前缀" prop="tablePre">
            <Input type="text" v-model="buildForm.tablePre" clearable placeholder="请输入表前缀" />
        </FormItem>

        <FormItem label="表是否已创建" prop="author">
          <RadioGroup v-model="buildForm.tableType">
              <Radio label="未创建"></Radio>
              <Radio label="已创建"></Radio>
          </RadioGroup>
        </FormItem>

         <FormItem label="表英文名" prop="tableName" v-show="'未创建' == buildForm.tableType">
            <Input type="text" v-model="buildForm.tableName" clearable placeholder="请输入表英文名" />
        </FormItem>

         <FormItem label="表注解" prop="comment"  v-show="'未创建' == buildForm.tableType">
            <Input type="text" v-model="buildForm.comment" clearable placeholder="请输入表注解" />
        </FormItem>

       

        <FormItem label="表名" prop="tables" v-show="'已创建' == buildForm.tableType">
          <Select v-model="buildForm.tables" filterable multiple @on-change="tableChange" :label-in-value="true">
            <Option v-for="item in tableList" :value="item.tableName" :key="item.tableName" :label="item.comments">
              <span style="margin-right:10px;">{{ item.tableName }}</span>
              <span style="color:#ccc;">{{ item.comments }}</span>
            </Option>
          </Select>
        </FormItem> 
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelBt">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitBt">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getBuilderLog,
  queryTableList,
  builderCode,
} from "@/api/index";
import { debug } from 'util';
 

export default {
  name: "builder-code",
  components: {
 
  },
  data() {
    return {
      loading: true,
      operationLoading: false,
      selectCount: 0,
      selectList: [],
      searchKey: "",
      searchForm: {
        tableName: "",
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: ""
      },
      //窗口
      modalType: 0,
      buildModalVisible: false,
      modalTitle: "",
      tableSelValues:[],
      tableList: [],
   
      buildForm: {
        author:'',
        basePackage:'',
        tablePre:'',
        tableName:'',
        comment:'',
        tableType:'未创建',
        tables:[],
        comments:[]
      },
      buildFormValidate: {
        basePackage: [
          { required: true, message: "包路径不能为空", trigger: "blur" }
        ],
      },
      submitLoading: false,
      //table 列表字段
      columns: [
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          title: "表英文",
          key: "tableName",
          minWidth: 80,
          sortable: true,
        },
        {
          title: "表中文名",
          key: "comment",
          align: "center",
        },
        {
          title: "表类型",
          key: "tableType",
          minWidth: 80,
          sortable: true,
        },
        {
          title: "表前缀",
          key: "tablePre",
          minWidth: 80,
          sortable: true,
        },
        {
          title: "包路径",
          key: "basePackage",
          width: 150
        },
        {
          title: "作者",
          key: "author",
          width: 115,
          sortable: true
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          width: 150
        },
      ],
      data: [],
      total: 0
    };
  },
  methods: {
    init() {
      this.getBuilderLogList();
    },
 
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getBuilderLogList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getBuilderLogList();
    },
 
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getBuilderLogList();
    },

    showSelect(e) {
      this.exportData = e;
      this.selectList = e;
      this.selectCount = e.length;
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },

    getBuilderLogList() {
      // 多条件搜索用户列表
      this.loading = true;
      getBuilderLog(this.searchForm).then(res => {
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
      this.getBuilderLogList();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      // 重新加载数据
      this.getBuilderLogList();
    },

 
    queryTableList() {
      queryTableList().then(res => {
        if (res.success === true) {
          //console.log(res.result);
          this.tableList = res.result;
        }
      });
    },
     
    tableChange(selArray){
      var comments = [];
      for(var i=0;i<selArray.length;i++){
        var option = selArray[i];
        comments.push(option.label);
      }
      this.buildForm.comments = comments;
    },

    //生成代码按钮操作
    add() {
      this.modalType = 0;
      this.modalTitle = "生成代码";
      this.$refs.buildForm.resetFields();
      this.buildModalVisible = true;
    },
    cancelBt() {
      this.buildModalVisible = false;
    },
    submitBt() {
      this.$refs.buildForm.validate(valid => {
        if (valid) {
          if('未创建' ==this.buildForm.tableType){
            if('' == this.buildForm.tableName){
              this.$Message.warning('请输入表英文名');
              return;
            }
            if('' == this.buildForm.comment){
              this.$Message.warning('请输入表注解');
              return;
            }
          }else{
            if(null == this.buildForm.tables || this.buildForm.tables.length == 0){
              this.$Message.warning('请输入先选择表');
              return;
            }
          }

          if (this.modalType === 0) {
            // 添加用户 避免编辑后传入id
            this.submitLoading = true;
            builderCode(this.buildForm).then(res => {
              this.submitLoading = false;
              if (res.success === true) {
                this.$Message.success(res.message);
                this.getBuilderLogList();
                this.buildModalVisible = false;
              }
            });
          }  
        }
      });
    },

  
    
  },
  mounted() {
    this.init();
    this.queryTableList();
  }
};
</script>