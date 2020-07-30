<template>
  <Row>
    <Col>
      <Card>
        <Row>
          <Col>
            <Button type="primary" shape="circle" icon="ios-arrow-back" @click="back">返回</Button>
          </Col>
        </Row>
        <br />
        <Row>
          <Form ref="contentForm" :label-width="70" :model="contentForm" :rules="ruleValidate">
            <Row>
              <Col>
                <!-- prop属性指向验单验证绑定数据里面的属性名 -->
                <Form-item label="标题" prop="title">
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
                <Form-item label="作者" prop="author">
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
                <Form-item label="内容类别" prop="contentType">
                  <Select
                    v-model="contentForm.contentType"
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
              </Col>
            </Row>
            <Row>
              <Col>
                <Form-item>
                  <Checkbox v-model.number="contentForm.isPublication">立即发布</Checkbox>
                  <Checkbox v-model.number="contentForm.isTop" prop="isTop">置顶内容</Checkbox>
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
                <Form-item label="摘要" prop="seoDescription">
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
                <Form-item label="正文" prop="content">
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
            <Button type="primary" :loading="submitLoading" @click="submitContent">发布</Button>
          </Col>
          <Col offset="1">
            <Button type="primary" @click="handleReset">重置</Button>
          </Col>
        </Row>
        <Modal v-model="validModal" width="80%">
          <h2>不能为空白：“标题”、“作者”、“内容类别”、“摘要”、“内容”</h2>
        </Modal>
      </Card>
    </Col>
  </Row>
</template>

<script>
import {
  getContentTypeListData,
  // 批量删除
  saveContent
} from "@/api/publishContent";
import { getDictDataByType } from "@/api/index";
import uploadPicInput from "@/views/components/custom/upload-pic-input";
import VueUeditorWrap from "vue-ueditor-wrap";
let base = process.env.VUE_APP_BASE_API;
let URL = process.env.NODE_ENV === "production" ? "/rcms-pc-web/" : "/";
export default {
  name: "publishContent",
  components: {
    VueUeditorWrap,
    uploadPicInput
  },
  data() {
    return {
      validModal: false,
      // 表单验证
      ruleValidate: {
        title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
        author: [{ required: true, message: "作者不能为空", trigger: "blur" }],
        contentType: [
          { required: true, message: "内容类别不能为空", trigger: "blur" }
        ],
        seoDescription: [
          { required: true, message: "摘要不能为空", trigger: "blur" }
        ],
        content: [{ required: true, message: "正文不能为空", trigger: "blur" }]
      },
      // 内容表单
      contentForm: {
        title: "",
        author: "",
        isPublication: 0,
        isTop: 0,
        seoDescription: "",
        seoKeywords: "",
        seoTitle: "",
        content: "",
        url: "",
        contentType: "",
        introductionImg: "",
      },
      // 发布内容类别
      dictContentType: [],
      // 发布按钮加载进度
      submitLoading: false,
      myConfig: {
        //   如果需要上传功能,找后端小伙伴要服务器接口地址
        serverUrl: base + "/content/uploadToQiniu",
        // 你的UEditor资源存放的路径,相对于打包后的index.html
        // UEDITOR_HOME_URL: "/rcms-pc-web/ueditor/",
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
    };
  },
  methods: {
    handleUpload(v) {
      this.contentForm.introductionImg = v;
    },
    init() {
      this.getDictContenTypeData();
    },
    // 重置按钮
    handleReset() {
      this.$refs.contentForm.resetFields();
      this.$Message.success("内容已重置");
    },
    // 获取发布内容类别字典数据
    getDictContenTypeData() {
      getDictDataByType("contentType").then(res => {
        if (res.success === true) {
          this.dictContentType = res.result;
        }
      });
    },
    back() {
      window.history.back();
    },
    submitContent() {
      this.$refs.contentForm.validate(valid => {
        if (valid) {
          if (
            this.contentForm.title == "" ||
            this.contentForm.title == undefined
          ) {
            return;
          }
          if (
            this.contentForm.author == "" ||
            this.contentForm.author == undefined
          ) {
            return;
          }
          if (
            this.contentForm.contentType == "" ||
            this.contentForm.contentType == undefined
          ) {
            return;
          }
          if (
            this.contentForm.content == "" ||
            this.contentForm.content == undefined
          ) {
            return;
          }
          this.submitLoading = true;
          this.contentForm.isPublication = Number(
            this.contentForm.isPublication
          );
          this.contentForm.isTop = Number(this.contentForm.isTop);
          saveContent(this.contentForm).then(res => {
            this.submitLoading = false;
            if (res.success === true) {
              this.$Message.success("操作成功");
              this.$refs.contentForm.resetFields();
              this.$router.push({ name: "contentManage" });
            }
          });
        } else {
          this.validModal = true;
        }
      });
    }
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    // $route: "init"
    "$route.name"(toC, fromC) {
      if (fromC === "contentManage" && toC === "publishContent") {
        // this.fetchData();
        // this.getDictContenTypeData();
        this.init();
        // console.log("发布页URL:"+URL);
      }
    }
  },
  mounted() {
    this.init();
    // console.log("URL:"+URL)
  }
};
</script>

<style scoped>
</style>

