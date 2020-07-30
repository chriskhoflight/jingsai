<style lang="less">
@import "./menuManage.less";
</style>
<template>
  <div class="search">
    <Card>
      <Row class="operation">
        <Button @click="addRootMenu" icon="md-add">添加导航栏</Button>
        <Button @click="addMenu" type="primary" icon="md-add">添加菜单</Button>
        <Button @click="addButton" type="success" icon="md-add">添加按钮</Button>
        <Button @click="delAll" icon="md-trash">批量删除</Button>
        <Dropdown @on-click="handleDropdown">
          <Button>更多操作
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="refresh">刷新</DropdownItem>
            <DropdownItem name="expandOne">仅显示一级</DropdownItem>
            <DropdownItem name="expandTwo">仅展开两级</DropdownItem>
            <DropdownItem name="expandAll">展开所有</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <i-switch v-model="strict" size="large" style="margin-left:5px">
          <span slot="open">级联</span>
          <span slot="close">单选</span>
        </i-switch>
      </Row>
      <Row type="flex" justify="start" class="code-row-bg">
        <Col span="6">
          <Alert show-icon>
            当前选择编辑：
            <span class="select-title">{{editTitle}}</span>
            <a class="select-clear" v-if="menuForm.id" @click="cancelEdit">取消选择</a>
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
              show-checkbox
              @on-check-change="changeSelect"
              @on-select-change="selectTree"
              :check-strictly="!strict"></Tree>
          </div>
          <Spin size="large" fix v-if="loading"></Spin>
        </Col>
        <Col span="9">
          <!--编辑页面-->
          <Form ref="menuForm" :model="menuForm" :label-width="100" :rules="menuFormValidate">
            <FormItem label="类型" prop="type">
              <div v-if="menuForm.type===0">
                <Icon type="ios-navigate-outline" size="16" style="margin-bottom:3px;"></Icon>
                <span>导航</span>
              </div>
              <div v-else-if="menuForm.type===1">
                <Icon type="ios-list-box-outline" size="16" style="margin-bottom:3px;"></Icon>
                <span>菜单页面</span>
              </div>
              <div v-else>
                <Icon type="md-log-in" size="16" style="margin-bottom:3px;"></Icon>
                <span>操作按钮</span>
              </div>
            </FormItem>
            <FormItem label="名称" prop="title" v-if="menuForm.type===0 || menuForm.type===1">
              <Input v-model="menuForm.title" style="width:400px"/>
            </FormItem>
            <FormItem label="名称" prop="title" v-if="menuForm.type===2">
              <Tooltip placement="right" content="操作按钮名称不得重复">
                <Input v-model="menuForm.title" style="width:400px"/>
              </Tooltip>
            </FormItem>
            <div v-if="menuForm.type===0 || menuForm.type===1" >
              <FormItem label="路由英文名" prop="name">
                <Tooltip trigger="focus" placement="right" content="需唯一">
                  <Input v-model="menuForm.name" style="width:400px"/>
                </Tooltip>
              </FormItem>
              <FormItem label="路径" prop="path">
                <Input v-model="menuForm.path" style="width:400px"/>
              </FormItem>
              <FormItem label="图标" prop="icon">
                <Input
                  :icon="menuForm.icon"
                  placeholder="点击选择图标"
                  v-model="menuForm.icon"
                  @on-focus="showEditIcon(0)"
                  style="width:400px"/>
              </FormItem>
              <FormItem label="前端组件" prop="component">
                <Input v-model="menuForm.component" style="width:400px"/> 
              </FormItem>
            
              <div v-if="menuForm.type===1">
                <FormItem label="第三方网页链接" prop="url">
                  <Tooltip placement="right" content="前端组件需为 sys/monitor/monitor 时生效">
                    <Input v-model="menuForm.url" placeholder="http://" style="width:400px"/>
                  </Tooltip>
                </FormItem>
              </div>
            </div>
           
            <FormItem label="请求路径" prop="path" v-if="menuForm.type===2">
              <Tooltip
                placement="right"
                :max-width="230"
                transfer
                content="填写后台请求URL，后台将作权限拦截，若无可填写'无'或其他">
                <Input v-model="menuForm.path" style="width:400px"/>
              </Tooltip>
            </FormItem>
            <FormItem label="按钮权限类型" prop="buttonType" v-if="menuForm.type===2">
              <Select
                v-model="menuForm.buttonType"
                placeholder="请选择或输入搜索"
                filterable
                clearable
                style="width:400px">
                <Option
                  v-for="(item, i) in dictPermissions"
                  :key="i"
                  :value="item.value"
                >{{item.title}}</Option>
              </Select>
            </FormItem>
            <FormItem label="是否隐藏" prop="isHidden" v-if="menuForm.type===1">
              <i-switch size="large" v-model="menuForm.isHidden" :true-value="0" :false-value="-1">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
            <FormItem label="排序值" prop="sortOrder">
              <InputNumber :max="1000" :min="0" v-model="menuForm.sortOrder"></InputNumber>
              <span style="margin-left:5px">值越小越靠前，支持小数</span>
            </FormItem>
            <FormItem label="是否启用" prop="status">
              <i-switch size="large" v-model="menuForm.status" :true-value="0" :false-value="-1">
                <span slot="open">启用</span>
                <span slot="close">禁用</span>
              </i-switch>
            </FormItem>
            <Form-item>
              <Button
                style="margin-right:5px"
                @click="submitEdit"
                :loading="submitLoading"
                type="primary"
                icon="ios-create-outline"
              >修改并保存</Button>
              <Button @click="handleReset">重置</Button>
            </Form-item>
          </Form>
        </Col>
      </Row>
    </Card>
    <!------窗口----------->
    <Modal
      draggable
      :title="modalTitle"
      v-model="menuModalVisible"
      :mask-closable="false"
      :width="500"
      :styles="{top: '30px'}"
    >
      <Form ref="menuFormAdd" :model="menuFormAdd" :label-width="100" :rules="menuFormValidate">
        <div v-if="showParent">
          <FormItem label="上级节点：">{{parentTitle}}</FormItem>
        </div>
        <FormItem label="类型" prop="type">
          <!--  0-导航 1-菜单页面 2-按钮 -->
          <div v-if="menuFormAdd.type===0">
            <Icon type="ios-navigate-outline" size="16" style="margin-bottom:3px;"></Icon>
            <span>导航</span>
          </div>
          <div v-else-if="menuFormAdd.type===1">
            <Icon type="ios-list-box-outline" size="16" style="margin-bottom:3px;"></Icon>
            <span>菜单页面</span>
          </div>
          <div v-else>
            <Icon type="md-log-in" size="16" style="margin-bottom:3px;"></Icon>
            <span>操作按钮</span>
          </div>
        </FormItem>
        <!--名称 -->
        <FormItem label="名称" prop="title" v-if="menuFormAdd.type===2">
          <Tooltip trigger="focus" placement="right" content="操作按钮名称不得重复">
            <Input v-model="menuFormAdd.title" style="width:380px"/>
          </Tooltip>
        </FormItem>
        <FormItem label="名称" prop="title" v-else>
          <Input v-model="menuFormAdd.title"/>
        </FormItem>
        <div v-if="menuFormAdd.type===0 || menuFormAdd.type===1">
          <FormItem label="路由英文名" prop="name">
            <Tooltip trigger="focus" placement="right" content="需唯一">
              <Input v-model="menuFormAdd.name" style="width:380px"/>
            </Tooltip>
          </FormItem>
          <FormItem label="路径" prop="path">
            <Input v-model="menuFormAdd.path"/>
          </FormItem>
          <FormItem label="图标" prop="icon">
            <Input
              :icon="menuFormAdd.icon"
              placeholder="点击选择图标"
              v-model="menuFormAdd.icon"
              @on-focus="showEditIcon(1)"
            />
          </FormItem>
          <FormItem label="前端组件" prop="component">
            <Input v-if="menuFormAdd.type===1" v-model="menuFormAdd.component"/>
            <Tooltip v-else trigger="focus" placement="right" content="管理端组件为：左边菜单,右边主内容布局">
              <Select v-model="menuFormAdd.component" style="width:365px"  placeholder="请选择前端组件">
                  <Option v-for="(item, i) in dictComponent" :key="i" :value="item.value">{{item.title}}</Option>
              </Select>
            </Tooltip>
          </FormItem>
          <FormItem v-if=" menuFormAdd.type===1" label="第三方网页链接" prop="url">
            <Tooltip placement="right" content="前端组件需为 sys/monitor/monitor 时生效">
              <Input v-model="menuFormAdd.url" placeholder="http://" style="width:380px"/>
            </Tooltip>
          </FormItem>
        </div>
        <FormItem label="请求路径" prop="path" v-if="menuFormAdd.type===2">
          <Tooltip
            placement="right"
            :max-width="230"
            transfer
            content="填写后台请求URL，后台将作权限拦截，若无可填写'无'或其他">
            <Input v-model="menuFormAdd.path" style="width:380px"/>
          </Tooltip>
        </FormItem>
        <FormItem label="按钮权限类型" prop="buttonType" v-if="menuFormAdd.type===2">
          <Select v-model="menuFormAdd.buttonType" placeholder="请选择或输入搜索" filterable clearable>
            <Option v-for="(item, i) in dictPermissions" :key="i" :value="item.value">{{item.title}}</Option>
          </Select>
        </FormItem>
        <FormItem label="排序值" prop="sortOrder">
          <InputNumber :max="1000" :min="0" v-model="menuFormAdd.sortOrder"></InputNumber>
          <span style="margin-left:5px">值越小越靠前，支持小数</span>
        </FormItem>
        <FormItem label="是否隐藏" prop="isHidden" v-if="menuFormAdd.type ===1">
          <i-switch size="large" v-model="menuFormAdd.isHidden" :true-value="0" :false-value="-1">
            <span slot="open">是</span>
            <span slot="close">否</span>
          </i-switch>
        </FormItem>
        <FormItem label="是否启用" prop="status">
          <i-switch size="large" v-model="menuFormAdd.status" :true-value="0" :false-value="-1">
            <span slot="open">启用</span>
            <span slot="close">禁用</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelAdd">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitAdd">提交</Button>
      </div>
    </Modal>
    <Modal title="选择图标" v-model="iconModalVisible" :width="800" :styles="{top: '30px'}" footer-hide>
      <icon-choose @on-select="handleSelectIcon"></icon-choose>
    </Modal>
  </div>
</template>

<script>
import {
  getAllPermissionList,
  addPermission,
  editPermission,
  deletePermission,
  searchPermission,
  getDictDataByType
} from "@/api/index";
import IconChoose from "@/views/components/custom/icon-choose";
import util from "@/libs/util.js";
export default {
  name: "menu-manage",
  components: {
    IconChoose
  },
  data() {
    return {
      loading: true,
      strict: true,
      maxHeight: "500px",
      expandLevel: 1,
      menuModalVisible: false,
      iconModalVisible: false,
      selectList: [],
      selectCount: 0,
      showParent: false,
      searchKey: "",
      parentTitle: "",
      // isMenu: false,
      // isButton: false,
      editTitle: "",
      modalTitle: "",
      menuForm: {
        id: "",
        title: "",
        name: "",
        icon: "",
        path: "",
        component: "",
        parentId: "",
        buttonType: "",
        type: 0,
        sortOrder: 0,
        level: null,
        status: 0,
        url: ""
      },
      menuFormAdd:{
        buttonType: ""
      },
      menuFormValidate: {
        title: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        name: [{ required: true, message: "路由英文名不能为空", trigger: "blur" }],
        icon: [{ required: true, message: "图标不能为空", trigger: "click" }],
        path: [{ required: true, message: "路径不能为空", trigger: "blur" }],
        component: [
          { required: true, message: "前端组件不能为空", trigger: "blur" }
        ]
      },
      submitLoading: false,
      data: [],
      dictPermissions: [],
      iconType: 0,
      dictComponent: [],
    };
  },
  methods: {
    init() {
      this.getAllList();
      this.getDictPermissions();
      this.getDictComponent();
    },
    getDictPermissions() {
      getDictDataByType("permission_type").then(res => {
        if (res.success) {
          this.dictPermissions = res.result;
        }
      });
    },
    //加载组件类型
    getDictComponent() {
      getDictDataByType("component").then(res => {
        if (res.success) {
          this.dictComponent = res.result;
        }
      });
    },
    showEditIcon(v) {
      this.iconType = v;
      this.iconModalVisible = true;
    },
    handleSelectIcon(v) {
      if (this.iconType == 0) {
        this.menuForm.icon = v;
      } else {
        this.menuFormAdd.icon = v;
      }
      this.iconModalVisible = false;
    },
    handleDropdown(name) {
      if (name === "expandOne") {
        this.expandLevel = 1;
        this.getAllList();
      } else if (name === "expandTwo") {
        this.expandLevel = 2;
        this.getAllList();
      } else if (name === "expandAll") {
        this.expandLevel = 3;
        this.getAllList();
      } else if (name === "refresh") {
        this.getAllList();
      }
    },
    getAllList() {
      this.loading = true;
      this.getRequest("/permission/getAllList").then(res => {
        this.loading = false;
        if (res.success === true) {
          // 仅展开指定级数 默认一级
          let expandLevel = this.expandLevel;
          res.result.forEach(function(e) {
            if (expandLevel === 1) {
              if (e.level === 1) {
                e.expand = false;
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function(c) {
                  if (c.level === 2) {
                    c.expand = false;
                  }
                });
              }
            } else {
              if (e.children && e.children.length > 0) {
                e.children.forEach(function(c) {
                  if (expandLevel === 2) {
                    if (c.level === 2) {
                      c.expand = false;
                    }
                  }
                });
              }
            }
          });
          this.data = res.result;
        }
      });
    },
    search() {
      if (this.searchKey) {
        this.loading = true;
        searchPermission({ title: this.searchKey }).then(res => {
          this.loading = false;
          if (res.success) {
            this.data = res.result;
          }
        });
      } else {
        this.getAllList();
      }
    },
    selectTree(v) {
      if (v.length > 0) {
        // if (Number(v[0].level) === 1 || Number(v[0].level) === 2) {
        //   this.isButton = false;
        //   this.isMenu = true;
        // } else {
        //   this.isButton = true;
        //   this.isMenu = false;
        // }
        if (Number(v[0].status) === 0) {
          this.editStatus = true;
        } else {
          this.editStatus = false;
        }
        // 转换null为""
        for (let attr in v[0]) {
          if (v[0][attr] === null) {
            v[0][attr] = "";
          }
        }
        let str = JSON.stringify(v[0]);
        let menu = JSON.parse(str);
        this.menuForm = menu;
        this.editTitle = menu.title;
      } else {
        this.cancelEdit();
      }
    },
    cancelEdit() {
      let data = this.$refs.tree.getSelectedNodes()[0];
      if (data) {
        data.selected = false;
      }
      // this.isMenu = false;
      // this.isButton = false;
      this.$refs.menuForm.resetFields();
      delete this.menuForm.id;
      this.editTitle = "";
    },
    cancelAdd() {
      this.menuModalVisible = false;
    },
    handleReset() {
      let type = this.menuForm.type;
      this.$refs.menuForm.resetFields();
      this.editStatus = true;
      this.menuForm.type = type;
    },
    submitEdit() {
      this.$refs.menuForm.validate(valid => {
        if (valid) {
          if (!this.menuForm.id) {
            this.$Message.warning("请先点击选择要修改的菜单节点");
            return;
          }
          this.submitLoading = true;
          if (this.menuForm.sortOrder === null) {
            this.menuForm.sortOrder = "";
          }
          if (this.menuForm.buttonType === null) {
            this.menuForm.buttonType = "";
          }
          if (this.menuForm.type == 2) {
            this.menuForm.name = "";
            this.menuForm.icon = "";
            this.menuForm.component = "";
          }
          editPermission(this.menuForm).then(res => {
            this.submitLoading = false;
            if (res.success === true) {
              this.$Message.success("编辑成功");
              util.initRouter(this);
              this.init();
              this.menuModalVisible = false;
            }
          });
        }
      });
    },
    submitAdd() {
      this.$refs.menuFormAdd.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.menuFormAdd.type == 2) {
            this.menuFormAdd.name = "";
            this.menuFormAdd.icon = "";
            this.menuFormAdd.component = "";
          }
          addPermission(this.menuFormAdd).then(res => {
            this.submitLoading = false;
            if (res.success === true) {
              this.$Message.success("添加成功");
              util.initRouter(this);
              this.init();
              this.menuModalVisible = false;
            }
          });
        }
      });
    },

    //添加菜单
    addMenu() {
      if (this.menuForm.id == "" || this.menuForm.id == null) {
        this.$Message.warning("请先点击选择一个菜单权限节点");
        return;
      }
      if (!(this.menuForm.type === 0 || this.menuForm.component == 'ParentView')) {
        this.$Message.warning("请选择导航节点或父菜单节点");
        return;
      }

      this.parentTitle = this.menuForm.title;
      this.modalTitle = "添加菜单权限(可拖动)";
      this.showParent = true;
      let type = 1;
      
      this.menuFormAdd = {
        icon: "",
        type: type,
        parentId: this.menuForm.id,
        level: Number(this.menuForm.level) + 1,
        sortOrder: 0,
        buttonType: "",
        status: 0
      };
      this.menuModalVisible = true;
    },
    addRootMenu() {
      this.modalTitle = "添加导航栏(可拖动)";
      this.showParent = false;
      this.menuFormAdd = {
        component: "Main",
        type: 0,  //0-导航  1-菜单页面 2-按钮 
        level: 1, //
        sortOrder: 0,
        status: 0
      };
      this.menuModalVisible = true;
    },
    addButton(){
      if (this.menuForm.id == "" || this.menuForm.id == null || this.menuForm.type != 1 || this.menuForm.component === 'ParentView') {
        this.$Message.warning("请先点击选择一个菜单页面节点");
        return;
      }
      this.parentTitle = this.menuForm.title;
      this.modalTitle = "添加按钮(可拖动)";
      this.showParent = true;
      let type = 2;
      this.menuFormAdd = {
        icon: "",
        type: type,
        parentId: this.menuForm.id,
        level: Number(this.menuForm.level) + 1,
        sortOrder: 0,
        buttonType: "",
        status: 0
      };
      this.menuModalVisible = true;
    },
    changeSelect(v) {
      this.selectCount = v.length;
      this.selectList = v;
    },
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
          deletePermission(ids).then(res => {
            if (res.success === true) {
              this.$Message.success("删除成功");
              util.initRouter(this);
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
    this.init();
  }
};
</script>