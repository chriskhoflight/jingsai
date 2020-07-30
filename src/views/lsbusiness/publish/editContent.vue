<template>
  <Row>
    <Card>
      <Col>
        <Row>
          <Col>
            <Button
              type="primary"
              icon="ios-arrow-back"
              @click="back"
              style="margin-bottom:30px;"
            >返回</Button>
          </Col>
        </Row>
        <Row>
          <Form :label-width="70" class="search-form" v-model="contentForm">
            <Row>
              <Col>
                <Form-item label="标题">
                  <Input
                    v-model="contentForm.title"
                    type="text"
                    clearable
                    placeholder="请输入文章标题"
                    style="width: 200px"
                  />
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form-item label="作者">
                  <Input
                    v-model="contentForm.author"
                    type="text"
                    clearable
                    placeholder="请输入作者"
                    style="width: 200px"
                  />
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form-item label="内容类别">
                  <Select
                    v-model="contentForm.contentType"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option
                      v-for="(item, i) in dictContentType"
                      :key="i"
                      :value="Number(item.value)"
                    >{{item.title}}</Option>
                  </Select>
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form-item>
                  <Checkbox v-model="contentForm.isPublication">立即发布</Checkbox>
                </Form-item>
                <Form-item prop="isTop">
                  <Checkbox v-model="contentForm.isTop">置顶内容</Checkbox>
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form-item label="封面图" prop="introductionImg">
                  <upload-pic-input @on-change="handleUpload" width="285px" ref="upload"></upload-pic-input>
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form-item label="摘要">
                  <Input
                    v-model="contentForm.seoDescription"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入文章摘要"
                  />
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form-item label="正文">
                  <vue-ueditor-wrap
                    v-model="contentForm.content"
                    :config="myConfig"
                    style="z-index:0;"
                  ></vue-ueditor-wrap>
                </Form-item>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row type="flex" justify="center">
          <Col>
            <Button type="primary" :loading="submitLoading" @click="updateContentInfo">更新</Button>
          </Col>
        </Row>
      </Col>
    </Card>
  </Row>
</template>

<script>
import {
  getContentTypeListData,
  editContent,
  getWechatContent
} from "@/api/publishContent";
import { getDictDataByType } from "@/api/index";
import VueUeditorWrap from "vue-ueditor-wrap";
import uploadPicInput from "@/views/components/custom/upload-pic-input";
let base = process.env.VUE_APP_BASE_API;
let URL = process.env.NODE_ENV === "production" ? "/rcms-pc-web/" : "/";
export default {
  name: "editContent",
  components: {
    VueUeditorWrap,
    uploadPicInput,
  },
  data() {
    return {
      submitLoading: false,
      // 内容表单
      contentForm: {
        title: "",
        author: "",
        isPublication: "",
        isTop: "",
        seoDescription: "",
        content: "",
        contentType: "",
        introductionImg: "",
      },
      newContentForm: {
        title: "",
        author: "",
        isPublication: "",
        isTop: "",
        seoDescription: "",
        content: "",
        contentType: ""
      },
      // 发布内容类别
      dictContentType: [],
      // 以下为编辑器data//////////////
      myConfig: {
        //   如果需要上传功能,找后端小伙伴要服务器接口地址
        serverUrl: base + "/content/uploadToQiniu",
        // UEDITOR_HOME_URL设置加载/ueditor/ueditor.config.js配置文件
        // UEDITOR_HOME_URL: "/rcms-pc-web/ueditor/",//pro
        // UEDITOR_HOME_URL: "/ueditor/", //dev
        UEDITOR_HOME_URL: URL + "ueditor/",
        // 编辑器不自动被内容撑高
        autoHeightEnabled: false,
        // 工具栏是否可以浮动
        autoFloatEnabled: false,
        // 初始容器高度
        initialFrameHeight: 450,
        // 初始容器宽度
        initialFrameWidth: "100%",
        // 启动自动保存
        enableAutoSave: true
      }
      // 以上为编辑器data/////////
    };
  },
  methods: {
    handleUpload(v) {
      this.contentForm.introductionImg = v;
    },
    init() {
      this.fetchData();
      this.getDictContenTypeData();
    },
    fetchData() {
      getWechatContent(this.$route.params.id).then(res => {
        if (res.success) {
          this.contentForm = res.result;
          if (this.contentForm.isPublication == 1) {
            this.contentForm.isPublication = true;
          } else {
            this.contentForm.isPublication = false;
          }
          if (this.contentForm.isTop == 1) {
            this.contentForm.isTop = true;
          } else {
            this.contentForm.isTop = false;
          }
          this.$refs.upload.setPicUrl(this.contentForm.introductionImg);
        }
      });
    },
    // 获取发布内容类别字典数据
    getDictContenTypeData() {
      getDictDataByType("contentType").then(res => {
        if (res.success) {
          this.dictContentType = res.result;
        }
      });
    },
    back() {
      window.history.back();
    },
    updateContentInfo() {
      // let this.newContentForm.isPublication = Number(this.contentForm.isPublication);
      let con = JSON.stringify(this.contentForm);
      let conObj = JSON.parse(con);
      if (this.contentForm.isPublication) {
        conObj.isPublication = 1;
      } else {
        conObj.isPublication = 0;
      }
      if (this.contentForm.isTop) {
        conObj.isTop = 1;
      } else {
        conObj.isTop = 0;
      }

      editContent(conObj).then(res => {
        this.submitLoading = false;
        if (res.success) {
          this.$Message.success("修改成功");
          this.$router.push({ name: "contentManage" });
        }
      });
    }
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    // $route: "init"
    "$route.name"(toC, fromC) {
      if (fromC === "contentManage" && toC === "editContent") {
        this.init();
        console.log("wat");
      }
    }
  },
  mounted() {
    this.init();console.log("mou");
  }
};
</script>

<style scoped>
</style>

