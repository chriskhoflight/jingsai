<template>
  <div>
    <Poptip trigger="click" placement="right" title="选择分类" width="250">
      <div style="display:flex;">
        <Input
          v-model="name"
          readonly
          :style="{width: width}"
          style="margin-right:10px;"
          :placeholder="placeholder"
        />
        <!-- <Button icon="md-trash" @click="clearSelect">清空已选</Button> -->
      </div>
      <div slot="content" class="tree-bar">
        <!-- <Input
          v-model="searchKey"
          suffix="ios-search"
          @on-change="searchDep"
          placeholder="输入部门名搜索"
          clearable
        /> -->
        <Tree
          :data="dataDep"
          :load-data="loadData"
          @on-select-change="selectTree"
          :multiple="multiple"
        ></Tree>
        <Spin size="large" fix v-if="depLoading"></Spin>
      </div>
    </Poptip>
  </div>
</template>

<script>
import { initClassify,loadClassify,searchClassify }from "@/api/recycleGuidelines";
export default {
  name: "rubbishClassifyTreeChoose",
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: "200px"
    },
    placeholder: {
      type: String,
      default: "点击选分类"
    }
  },
  data() {
    return {
      depLoading: false,
      name: "",
      searchKey: "",
      dataDep: [],
      selectDep: [],
      classify: []
    };
  },
  methods: {
    initClassifyData() {
      initClassify().then(res => {
        if (res.success === true) {
          res.result.forEach(function(e) {
            if (e.parentId!==-1) {
              e.loading = false;
              e.children = [];
              e.title = e.name
            }
            if (e.status === -1) {
              e.title = "[已禁用] " + e.name;
              e.disabled = true;
            }
          });
          this.dataDep = res.result;
        }
      });
    },
    loadData(item, callback) {
      loadClassify(item.id).then(res => {
        if (res.success === true) {
          res.result.forEach(function(e) {
            if (e.parentId!==-1) {
              e.loading = false;
              e.children = [];
              e.title = e.name
            }
            if (e.status === -1) {
              e.title = "[已禁用] " + e.name;
              e.disabled = true;
            }
          });
          callback(res.result);
        }
      });
    },
    searchDep() {
      // 搜索部门
      if (this.searchKey) {
        this.depLoading = true;
        searchClassify({ title: this.searchKey }).then(res => {
          this.depLoading = false;
          if (res.success) {
            res.result.forEach(function(e) {
              if (e.status === -1) {
                e.name = "[已禁用] " + e.name;
                e.disabled = true;
              }
            });
            this.dataDep = res.result;
          }
        });
      } else {
        this.initClassifyData();
      }
    },
    selectTree(v) {
      // this.$emit("getEntity",v)
      if(v.length===0){
        return
      }
      let ids = [],
        title = "";
      v.forEach(e => {
        ids.push(e.id);
        if (title == "") {
          title = e.title;
        } else {
          title = title + "、" + e.title;
        }
      });
      this.id = ids;
      this.name = title;
      this.$emit("on-change", this.id);
    },
    clearSelect() {
      this.id = [];
      this.name = "";
      this.initClassifyData();
      this.$emit("on-change", this.id);
    },
    setSelectDep(ids, title){
      this.id = ids;
      console.log(title)
      this.name = title;
      this.$emit("on-change", this.id);
    }
  },
  created() {
    this.initClassifyData();
  }
};
</script>

<style lang="less">
.tree-bar {
    max-height: 500px;
    overflow: auto;
    margin-top: 5px;
}

.tree-bar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.tree-bar::-webkit-scrollbar-thumb {
    border-radius: 4px;
    -webkit-box-shadow: inset 0 0 2px #d1d1d1;
    background: #e4e4e4;
}

.ivu-tree .ivu-tree-empty {
    margin-top: 10px;
    font-size: 12px;
}
</style>

