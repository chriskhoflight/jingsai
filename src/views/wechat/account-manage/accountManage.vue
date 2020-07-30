<style lang="less">
@import "./accountManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="100" class="search-form">
              <Form-item label="公众号名称" prop="name">
                <Input
                  type="text"
                  v-model="searchForm.name"
                  clearable
                  placeholder="请输入公众号名称"
                  style="width: 200px"
                />
              </Form-item>
              <Form-item label="AppId" prop="appid">
                <Input
                  type="text"
                  v-model="searchForm.appid"
                  clearable
                  placeholder="请输入AppId"
                  style="width: 200px"
                />
              </Form-item>
              <FormItem label="公众号类型" prop="type">
                <Select v-model="searchForm.type" style="width: 200px" placeholder="请选择公众号类型" clearable>
                    <Option v-for="(item, i) in dictAccountType" :key="i" :value="Number(item.value)">{{item.title}}</Option>
                </Select>
              </FormItem>
             
              <Form-item style="margin-left:-35px;" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
              </Form-item>
            </Form>
          </Row>
          <Row class="operation">
            <Button @click="add" type="primary" icon="md-add">绑定公众号</Button>
            <Button @click="delAll" icon="md-trash">解绑公众号</Button>
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
    <!--编辑窗口-->
    <Modal
      :title="modalTitle"
      v-model="modalVisible"
      :mask-closable="false"
      :width="600"
      :styles="{top: '30px'}">
      <Form ref="formItem" :model="formItem" :label-width="120" :rules="formItemValidate">
        <FormItem label="公众号名称" prop="name">
            <Input type="text" v-model="formItem.name" clearable placeholder="请输入公众号名称" style="width: 200px"/>
        </FormItem>

        <FormItem label="公众号类型" prop="type">
            <Select v-model="formItem.type" style="width: 200px" placeholder="请选择公众号类型">
                <Option v-for="(item, i) in dictAccountType" :key="i" :value="Number(item.value)">{{item.title}}</Option>
            </Select>
        </FormItem>
 
        <FormItem label="AppID" prop="appid">
            <Input v-if="1 == modalType"  disabled type="text" v-model="formItem.appid" clearable placeholder="请输入AppID" />
            <Input v-else type="text" v-model="formItem.appid" clearable placeholder="请输入AppID" />
        </FormItem>

         <FormItem label="EncodingAESKey" prop="aeskey">
            <Input type="text" v-model="formItem.aeskey" clearable placeholder="请输入EncodingAESKey" />
        </FormItem>

         <FormItem label="AppSecret" prop="secret">
            <Input type="text" v-model="formItem.secret" clearable placeholder="请输入AppSecret" />
        </FormItem>

         <FormItem label="令牌(Token)" prop="token" >
            <Input type="text" v-model="formItem.token" clearable placeholder="请输入令牌(Token)" />
        </FormItem>

        <FormItem label="描述" prop="description">
            <Input v-model="formItem.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入描述"></Input>
        </FormItem>

      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelBt">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitBt">提交</Button>
      </div>
    </Modal>

    <!--查看菜单窗口-->
    <Modal
      :title="menuModalTitle"
      v-model="menuModalVisible"
      :mask-closable="false"
      :width="600"
      :higth="600"
      :styles="{top: '30px'}">
        <div style="text-align:center;min-height: 150px;">
            <Dropdown v-for="(item, i) in menuData" :key="i" style="margin-left: 20px">
              <a href="javascript:void(0)">
                  {{item.name}}
                  <Icon v-if="item.subButtons.length > 0" type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list" v-if="item.subButtons.length > 0">
                  <DropdownItem v-for="(subItem, j) in item.subButtons" :key="j" >{{subItem.name}}</DropdownItem>
              </DropdownMenu>
          </Dropdown>
          
        </div>
        <div slot="footer">
            <Button type="text" @click="menuCancelBt">取消</Button>
        </div>
    </Modal>

    <!--发布菜单窗口-->
    <Modal
      :title="createMenuModalTitle"
      v-model="createMenuModalVisible"
      :mask-closable="false"
      :width="600"
      :higth="600"
      :styles="{top: '30px'}">
        
          <Form ref="createMenuForm" :model="createMenuForm" :label-width="120" :rules="createMenuFormValidate">
            <FormItem label="公众号名称" prop="name">
                <Input type="text" v-model="createMenuForm.name" disabled placeholder="请输入公众号名称" style="width: 200px"/>
            </FormItem>

            <FormItem label="公众号AppId" prop="appid">
                <Input type="text" v-model="createMenuForm.appid" disabled placeholder="请输入公众号AppId" style="width: 200px"/>
            </FormItem>

            <FormItem label="菜单模版" prop="templateId">
            <Select v-model="createMenuForm.templateId" style="width: 200px" placeholder="请选择菜单模版" clearable>
                <Option v-for="(item, i) in templateData" :key="i" :value="item.id">{{item.name}}</Option>
            </Select>
            </FormItem>
          </Form>
         
        <div slot="footer">
            <Button type="text" @click="createMenuCancelBt">取消</Button>
            <Button type="primary" :loading="submitLoading" @click="createMenusubmitBt">发布</Button>
        </div>
    </Modal>
  </div>
</template>

<script>
import {
  getAccountPage,
  addAccount,
  editAccount,
  delAccount,
  getWxMenu,
  createWxMenu,
  getAllMenuTemplate
} from "@/api/wechat";
import {
  getDictDataByType
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
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        name: "",
        appid: "",
        type:null
      },
      //窗口
      modalType: 0,
      modalVisible: false,
      modalTitle: "",
      formItem: {
        name:'',
        description:'',
        type: 2,
        appid:'',
        aeskey:'',
        secret:'',
        token:''
      },
      formItemValidate: {
        name: [
          { required: true, message: "公众号名称不能为空", trigger: "blur" }
        ],
        appid: [
          { required: true, message: "AppID不能为空", trigger: "blur" }
        ],
        aeskey: [
          { required: true, message: "EncodingAESKey不能为空", trigger: "blur" }
        ],
        secret: [
          { required: true, message: "AppSecret不能为空", trigger: "blur" }
        ],
        token: [
          { required: true, message: "令牌(Token)不能为空", trigger: "blur" }
        ],
      },
      submitLoading: false,
      //table 列表字段
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left"
        },
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          title: "公众号名称",
          key: "name",
          minWidth: 120,
          sortable: true,
        },
        {
          title: "公众号类型",
          key: "type",
          width: 115,
          sortable: true,
          render: (h, params) => {
            let re = "";
            //公众号类型：1-订阅号 2-服务号 3-企业号
            if (params.row.type === 1) {
              re = "订阅号";
            } else if (params.row.type === 2) {
              re = "服务号";
            } else if (params.row.type === 3) {
              re = "企业号";
            }
            return h("div", re);
          }
        },
        {
          title: "AppID",
          key: "appid",
          align: "center",
          minWidth: 160
        },
        {
          title: "AppSecret",
          key: "secret",
          minWidth: 250
        },
        {
          title: "令牌(Token)",
          key: "token",
          minWidth: 120
        },
        {
          title: "EncodingAESKey",
          key: "aeskey",
          minWidth: 360
        },
        {
          title: "描述",
          key: "description",
          minWidth: 100
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
          width: 280,
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
                    type: "error",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    }
                  }
                },
                "解绑"
              ),
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
                      this.createMenu(params.row);
                    }
                  }
                },
                "发布菜单"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "success",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.getMenu(params.row);
                    }
                  }
                },
                "查看菜单"
              )
            ]);
          }
        }
      ],
      data: [],
      total: 0,
      dictAccountType: [],
      //查看公众号菜单窗口
      menuModalVisible: false,
      menuModalTitle: "",
      menuData:[],
      //发布公众号菜单窗口
      createMenuModalVisible: false,
      createMenuModalTitle: "",
      
      templateData: [],
      createMenuForm: {
        name: "",
        appid: "",
        templateId: ""
      },
      createMenuFormValidate:{
        templateId: [
          { required: true, message: "请选择菜单模版", trigger: "blur" }
        ],
      }
    };
  },
  methods: {
    init() {
      this.getList();
      this.getDictAccountTypeData();
      this.loadTemplates();
    },
    //加载数字字典
    getDictAccountTypeData() {
      // 获取性别字典数据
      getDictDataByType("wx_account_type").then(res => {
        if (res.success) {
          this.dictAccountType = res.result;
        }
      });
    },
    //加载模版
    loadTemplates(){
      getAllMenuTemplate().then(res => {
        if (res.success) {
          this.templateData = res.result;
        }
      });
    },
    
    //翻页
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getList();
      this.clearSelectAll();
    },
    //每页条数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getList();
    },
    //排序
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getList();
    },

    showSelect(e) {
      this.exportData = e;
      this.selectList = e;
      this.selectCount = e.length;
    },
    //清空
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },

    //搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getList();
    },
    //重置
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      // 重新加载数据
      this.getList();
    },
    //查询列表
    getList() {
      // 多条件搜索用户列表
      this.loading = true;
      getAccountPage(this.searchForm).then(res => {
        this.loading = false;
        if (res.success === true) {
          this.data = res.result.content;
          this.total = res.result.totalElements;
        }
      });
    },
   
    //新增按钮操作
    add() {
      this.modalType = 0;
      this.modalTitle = "绑定公众号";
      this.$refs.formItem.resetFields();
      this.modalVisible = true;
    },
    //编辑
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑公众号";
      this.$refs.formItem.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      this.formItem = data;
      this.modalVisible = true;
    },
    //取消
    cancelBt() {
      this.modalVisible = false;
    },
    //提交
    submitBt() {
      this.$refs.formItem.validate(valid => {
        if (valid) {
          //添加
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id
            delete this.formItem.id;
            this.submitLoading = true;
            addAccount(this.formItem).then(res => {
              this.submitLoading = false;
              if (res.success === true) {
                this.$Message.success(res.message);
                this.getList();
                this.modalVisible = false;
              }
            });
          } else {
            // 编辑
            this.submitLoading = true;
            editAccount(this.formItem).then(res => {
              this.submitLoading = false;
              if (res.success === true) {
                this.$Message.success("操作成功");
                this.getList();
                this.modalVisible = false;
              }
            });
          } 
        }
      });
    },
    //查看公众号菜单
    getMenu(v){
      let id = v.appid;
      this.loading = true;
      getWxMenu(id).then(res => {
        this.loading = false;
        if (res.success === true) {
          this.menuData = res.result.menu.buttons;
        }
      });
      this.menuModalTitle = "公众号菜单";
      this.menuModalVisible = true;
    },
    menuCancelBt(){
      this.menuModalVisible = false;
    },

    //发布公众号菜单
    createMenu(v){
      this.createMenuForm.appid = v.appid;
      this.createMenuForm.name = v.name;
      this.createMenuModalTitle = "发布菜单";
      this.createMenuModalVisible = true;
    },
    createMenuCancelBt(){
      this.createMenuModalVisible = false;
    },
    createMenusubmitBt() {
      this.$refs.createMenuForm.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          createWxMenu(this.createMenuForm).then(res => {
            this.submitLoading = false;
            if (res.success === true) {
              this.$Message.success(res.message);
              this.getList();
              this.createMenuModalVisible = false;
            }
          });
        }
      });
    },

    //批量删除
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要解绑的公众号");
        return;
      }
      this.$Modal.confirm({
        title: "确认解绑",
        content: "您确认要解绑所选的 " + this.selectCount + " 条数据?",
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          this.operationLoading = true;
          delAccount(ids).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("解绑成功");
              this.clearSelectAll();
              this.getList();
            }
          });
        }
      });
    },
    //单个删除
    remove(v) {
      this.$Modal.confirm({
        title: "确认解绑",
        content: "您确认要解绑公众号【" + v.name + "】?",
        onOk: () => {
          this.operationLoading = true;
          delAccount(v.id).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("解绑成功");
              this.getList();
            }
          });
        }
      });
    },
  
    
  },
  mounted() {
    this.init();
  }
};
</script>