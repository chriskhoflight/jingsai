<style lang="less">
@import "./customMenu.less";
</style>
<template>
  <div class="search">
    <Card>
      <Row class="operation">
        <Button @click="add" type="primary" icon="md-add">添加子菜单</Button>
        <Button @click="addRoot" icon="md-add">添加一级菜单</Button>
        <Button @click="delAll" icon="md-trash">批量删除</Button>
        <Button @click="getParentList" icon="md-refresh">刷新</Button>
        <i-switch v-model="strict" size="large" style="margin-left:5px">
          <span slot="open">级联</span>
          <span slot="close">单选</span>
        </i-switch>
      </Row>
      <Row type="flex" justify="start" class="code-row-bg">
        <Col span="6">
          <Alert show-icon>当前模版名称：{{menuTemplate.name}}</Alert>
          <Alert show-icon>
            当前选择编辑：
            <span class="select-title">{{editTitle}}</span>
            <a class="select-clear" v-if="form.id" @click="cancelEdit">取消选择</a>
          </Alert>
          <Input
            v-model="searchKey"
            suffix="ios-search"
            @on-change="search"
            placeholder="输入菜单名搜索"
            clearable
          />
          <div class="tree-bar" :style="{maxHeight: maxHeight}">
            <Tree
              ref="tree"
              :data="data"
              :load-data="loadData"
              show-checkbox
              @on-check-change="changeSelect"
              @on-select-change="selectTree"
              :check-strictly="!strict"
            ></Tree>
          </div>
          <Spin size="large" fix v-if="loading"></Spin>
        </Col>
        <Col span="9">
          <Form ref="form" :model="form" :label-width="100" :rules="formValidate">
            <FormItem label="上级菜单" prop="parenttitle" v-if="form.parenttitle">
              <Input v-model="form.parenttitle" readonly style="width:400px"/>
            </FormItem>
            <FormItem label="菜单名称" prop="title">
              <Input v-model="form.title" style="width:400px"/>
            </FormItem>

             <FormItem label="菜单类型" prop="type">
                <Select v-model="form.type" style="width: 200px" placeholder="请选择菜单类型" filterable clearable>
                    <Option v-for="(item, i) in dictAccountMenuType" :key="i" :value="item.value">{{item.title}}</Option>
                </Select>
            </FormItem>

            <FormItem label="菜单KEY值" prop="menuKey" v-show= "'click' == form.type">
              <Input v-model="form.menuKey" clearable placeholder="请输入菜单KEY值"/>
            </FormItem>

            <FormItem label="网页链接" prop="url" v-show= "'view' == form.type || 'miniprogram' == form.type ">
              <Input v-model="form.url" clearable placeholder="请输入网页链接"/>
            </FormItem>

            <FormItem label="小程序AppId" prop="appId" v-show= "'miniprogram' == form.type ">
              <Input v-model="form.appId" clearable placeholder="请输入小程序AppId"/>
            </FormItem>

            <FormItem label="小程序页面路径" prop="pagePath" v-show= "'miniprogram' == form.type ">
              <Input v-model="form.pagePath" clearable placeholder="请输入小程序页面路径"/>
            </FormItem>

            <FormItem label="排序值" prop="sortOrder">
              <InputNumber :max="1000" :min="0" v-model="form.sortOrder"></InputNumber>
              <span style="margin-left:5px">值越小越靠前，支持小数</span>
            </FormItem>

            <FormItem label="是否启用" prop="status">
              <i-switch size="large" v-model="form.status" :true-value="0" :false-value="-1">
                <span slot="open">启用</span>
                <span slot="close">禁用</span>
              </i-switch>
            </FormItem>
            
            <Form-item>
              <Button
                @click="submitEdit"
                :loading="submitLoading"
                type="primary"
                icon="ios-create-outline"
                style="margin-right:5px"
              >修改并保存</Button>
              <Button @click="handleReset">重置</Button>
            </Form-item>
          </Form>
        </Col>
      </Row>
    </Card>

    <Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
      <Form ref="formAdd" :model="formAdd" :label-width="100" :rules="formValidate">
        <div v-if="showParent">
          <FormItem label="上级菜单：">{{form.title}}</FormItem>
        </div>
        <FormItem label="菜单名称" prop="title">
          <Input v-model="formAdd.title" clearable placeholder="请输入菜单名称"/>
        </FormItem>

        <FormItem label="菜单类型" prop="type">
            <Select v-model="formAdd.type" style="width: 200px" placeholder="请选择菜单类型" clearable>
                <Option v-for="(item, i) in dictAccountMenuType" :key="i" :value="item.value">{{item.title}}</Option>
            </Select>
        </FormItem>

        <FormItem label="菜单KEY值" prop="menuKey" v-show= "'click' == formAdd.type">
          <Input v-model="formAdd.menuKey" clearable placeholder="请输入菜单KEY值"/>
        </FormItem>

        <FormItem label="网页链接" prop="url" v-show= "'view' == formAdd.type || 'miniprogram' == formAdd.type ">
          <Input v-model="formAdd.url" clearable placeholder="请输入网页链接"/>
        </FormItem>

        <FormItem label="小程序AppId" prop="appId" v-show= "'miniprogram' == formAdd.type ">
          <Input v-model="formAdd.appId" clearable placeholder="请输入小程序AppId"/>
        </FormItem>

        <FormItem label="小程序页面路径" prop="pagePath" v-show= "'miniprogram' == formAdd.type ">
          <Input v-model="formAdd.pagePath" clearable placeholder="请输入小程序页面路径"/>
        </FormItem>

        <FormItem label="排序值" prop="sortOrder">
          <InputNumber :max="100" :min="0" v-model="formAdd.sortOrder"></InputNumber>
          <span style="margin-left:5px">值越小越靠前</span>
        </FormItem>

        <FormItem label="是否启用" prop="status">
          <i-switch size="large" v-model="formAdd.status" :true-value="0" :false-value="-1">
            <span slot="open">启用</span>
            <span slot="close">禁用</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible=false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitAdd">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>

import {
  getMenuTreeByTemplateId,
  addMenuTemplateDetail,
  editMenuTemplateDetail,
  delMenuTemplateDetail
} from "@/api/wechat";

import {
  getDictDataByType
} from "@/api/index";
import { debug } from 'util';

export default {
  data() {
    //类型验证
    const validateType = (rule, value, callback) => {
      var self = this;
      //二级菜单,类型必须填
      if(self.form.parentId != '0'){
        if(value == null || value == undefined || value == "") {
          callback(new Error('请选择菜单类型'));
        }else{
          callback();
        }
      }else {
        callback();
      }
    };
    //url验证
    const validateUrl = (rule, value, callback) => {
      var self = this;
      //类型为网页类型， url必须填
      if( 'view' == self.form.type){
        if(value == null || value == undefined || value == "") {
          callback(new Error('请输入网页链接'));
        }else{
          callback();
        }
      }else {
        callback();
      }
    };
    //menuKey验证
    const validateMenuKey = (rule, value, callback) => {
      var self = this;
      //类型为点击， menuKey必须填
      if( 'click' == self.form.type){
        if(value == null || value == undefined || value == "") {
          callback(new Error('请输入菜单KEY值'));
        }else{
          callback();
        }
      }else {
        callback();
      }
    };
    //AppId验证
    const validateAppId = (rule, value, callback) => {
      var self = this;
      //类型为小程序， menuKey必须填
      if( 'miniprogram' == self.form.type){
        if(value == null || value == undefined || value == "") {
          callback(new Error('请输入小程序AppId'));
        }else{
          callback();
        }
      }else {
        callback();
      }
    };
    //AppId验证
    const validatePagePath = (rule, value, callback) => {
      var self = this;
      //类型为小程序， menuKey必须填
      if( 'miniprogram' == self.form.type){
        if(value == null || value == undefined || value == "") {
          callback(new Error('请输入小程序页面路径'));
        }else{
          callback();
        }
      }else {
        callback();
      }
    };
    

    return {
      menuTemplate: {
        id: '',
        name: ''
      },
      loading: false, // 树加载状态
      maxHeight: "500px",
      strict: true,
      loadingEdit: false, // 编辑上级树加载状态
      modalVisible: false, // 添加显示
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      showParent: false, // 显示上级标识
      modalTitle: "", // 添加标题
      editTitle: "", // 编辑菜单名称
      searchKey: "", // 搜索树
      form: {
        templateId:"",
        // 编辑对象初始化数据
        id: "",
        title: "",
        parentId: "",
        parenttitle: "",
        type: "",
        url: "",
        menuKey: "",
        appId: "",
        pagePath: "",
        sortOrder: 0,
        status: 0
      },
      formAdd: {
        // 添加对象初始化数据
      },
      
      formValidate: {
        // 表单验证规则//2、一级菜单最多4个汉字，二级菜单最多7个汉字，多出来的部分将会以“...”代替。
        title: [
          { required: true, message: "菜单名称不能为空", trigger: "blur" },
          { type: 'string', max: 7, message: '菜单最多7个汉字', trigger: 'blur' }
        ],
        type: [
          { validator: validateType, trigger: 'blur', trigger: 'change' }
        ],
        url: [
          { validator: validateUrl, trigger: 'blur', trigger: 'change' }
        ],
        menuKey: [
          { validator: validateMenuKey, trigger: 'blur', trigger: 'change' }
        ],
        appId: [
          { validator: validateAppId, trigger: 'blur', trigger: 'change' }
        ],
        pagePath: [
          { validator: validatePagePath, trigger: 'blur', trigger: 'change' }
        ]

      },
      submitLoading: false,
      data: [],
      dataEdit: [],
      //数字字段
      dictAccountMenuType:[]
    };
  },
  methods: {
    init() {
      // 初始化菜单树
      this.getParentList();
      this.getDictAccountMenuTypeData();
    },

    //加载数字字典
    getDictAccountMenuTypeData() {
      // 获取性别字典数据
      getDictDataByType("wx_account_menu_type").then(res => {
        if (res.success) {
          this.dictAccountMenuType = res.result;
        }
      });
    },
    //获取菜单树
    getParentList() {
      getMenuTreeByTemplateId(this.menuTemplate.id).then(res => {
        if (res.success) {
          this.data = res.result;
        }
      });
    },
     
    loadData(item, callback) {
    },
    search() {
      // 搜索树
      if (this.searchKey) {
        // 模拟请求
        // this.loading = true;
        // this.getRequest("搜索请求路径", { title: this.searchKey }).then(res => {
        //   this.loading = false;
        //   if (res.success === true) {
        //     this.data = res.result;
        //   }
        // });
        // 模拟请求成功
        this.data = [
          {
            title: "这里需要请求后台接口",
            id: "1",
            parentId: "0",
            parentTitle: "一级菜单",
            status: 0
          },
          {
            title: "所以这里是假数据",
            id: "4",
            parentId: "0",
            parentTitle: "一级菜单",
            status: 0
          },
          {
            title: "我是被禁用的菜单",
            id: "5",
            parentId: "0",
            parentTitle: "一级菜单",
            status: -1
          }
        ];
      } else {
        // 为空重新加载
        this.getParentList();
      }
    },
    //选择树事件
    selectTree(v) {
      if (v.length > 0) {
        // 转换null为""
        for (let attr in v[0]) {
          if (v[0][attr] === null) {
            v[0][attr] = "";
          }
        }
        let str = JSON.stringify(v[0]);
        let data = JSON.parse(str);
        this.form = data;
        this.editTitle = data.title;
      } else {
        this.cancelEdit();
      }
    },
    //编辑取消按钮
    cancelEdit() {
      let data = this.$refs.tree.getSelectedNodes()[0];
      if (data) {
        data.selected = false;
      }
      this.$refs.form.resetFields();
      delete this.form.id;
      this.editTitle = "";
    },
    //选择编辑
    selectTreeEdit(v) {
      if (v.length > 0) {
        // 转换null为""
        for (let attr in v[0]) {
          if (v[0][attr] === null) {
            v[0][attr] = "";
          }
        }
        let str = JSON.stringify(v[0]);
        let data = JSON.parse(str);
        this.form.parentId = data.id;
        this.form.parentTitle = data.title;
      }
    },
    //重置
    handleReset() {
      this.$refs.form.resetFields();
      this.form.status = 0;
    },
    //编辑提交
    submitEdit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.form.id) {
            this.$Message.warning("请先点击选择要修改的菜单");
            return;
          }
          this.submitLoading = true;
          editMenuTemplateDetail(this.form).then(res => {
            this.submitLoading = false;
            if (res.success === true) {
              this.$Message.success(res.message);
              this.init();
              this.modalVisible = false;
            }
          });
          this.submitLoading = false;
        }
      });
    },
    //新增提交
    submitAdd() {
      this.$refs.formAdd.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          addMenuTemplateDetail(this.formAdd).then(res => {
            this.submitLoading = false;
            if (res.success === true) {
              this.$Message.success(res.message);
              this.init();
              this.modalVisible = false;
            }
          });
          this.submitLoading = false;
        }
      });
    },
    //新增
    add() {
      if (this.form.id == "" || this.form.id == null) {
        this.$Message.warning("请先点击选择一个菜单");
        return;
      }
      if((this.form.parentId != "" && this.form.parentId != null ) && this.form.parentId != "0"){
        this.$Message.warning("自定义菜单只支持到二级");
        return;
      }

      if(this.form.type != "" && this.form.type != null ){
        this.$Message.warning("已选择菜单类型的不能包含二级菜单");
        return;
      }

      if(this.validChildCount()){
        this.$Message.warning("每个一级菜单最多包含5个二级菜单");
        return;
      }
      this.modalTitle = "添加子菜单";
      this.showParent = true;
      this.formAdd = {
        templateId: this.menuTemplate.id,
        parentId: this.form.id,
        sortOrder: 0,
        status: 0
      };
      this.modalVisible = true;
    },
 
    
    //新增根节点
    addRoot() {
      if(this.validRootCount()){
        this.$Message.warning("自定义菜单最多包括3个一级菜单");
        return;
      }
      this.modalTitle = "添加一级菜单";
      this.showParent = false;
      this.formAdd = {
        templateId: this.menuTemplate.id,
        parentId: 0,
        sortOrder: 0,
        status: 0
      };
      this.modalVisible = true;
    },
    //验证一级菜单个数
    //1、自定义菜单最多包括3个一级菜单，每个一级菜单最多包含5个二级菜单。
    validRootCount(){
      if(null !=this.data && this.data.length >= 3){
        return true;
      }
    },
    //验证二级菜单个数
    //1、自定义菜单最多包括3个一级菜单，每个一级菜单最多包含5个二级菜单。
    validChildCount(parentId){
      if(null != this.form && this.form.children.length >= 5){
         return true;
      }
    },


    changeSelect(v) {
      this.selectCount = v.length;
      this.selectList = v;
    },
    //批量删除
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未勾选要删除的数据");
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
          
          delMenuTemplateDetail(ids).then(res => {
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.selectList = [];
              this.selectCount = 0;
              this.cancelEdit();
              this.init();
            }
          });
        }
      });
    }
  },
  mounted() {
    // 计算高度
    let height = document.documentElement.clientHeight;
    this.maxHeight = Number(height-287) + "px";
    this.menuTemplate.id = this.$route.query.id;
    this.menuTemplate.name = this.$route.query.name;
    this.init();
  }
};
</script>