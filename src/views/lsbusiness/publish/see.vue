<template>
  <Row>
    <Col>
      <Card>
        <Row>
          <Col>
            <Button type="primary" icon="ios-arrow-back" @click="back">返回</Button>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <h1>{{contentForm.title}}</h1>
          </Col>
        </Row>
        <br />
        <hr />
        <br />
        <Row>
          <Col span="4">
            <label>
              <strong>作者:</strong>
            </label>
            <span>{{contentForm.author}}</span>
          </Col>
          <Col span="6">
            <label>
              <strong>发布时间:</strong>
            </label>
            <span>{{contentForm.createTime}}</span>
          </Col>
          <Col span="4">
            <label>
              <strong>类别:</strong>
            </label>
            <span>{{contentForm.contentType}}</span>
          </Col>
        </Row>
        <br />
        <br />
        <Row>
          <Col>
            <label>
              <strong>摘要:</strong>
            </label>
            <p>{{contentForm.seoDescription}}</p>
          </Col>
        </Row>
        <br />
        <br />
        <Row>
          <Col>
            <p v-html="contentForm.content"></p>
          </Col>
        </Row>
      </Card>
    </Col>
  </Row>
</template>

<script>
import { getWechatContent } from "@/api/publishContent";
import { getDictDataByType } from "@/api/index";
import { types } from "util";
export default {
  name: "seeContent",
  data() {
    return {
      // 内容表单
      contentForm: {
        title: "",
        author: "",
        isPublicatin: "",
        isTop: "",
        seoDescription: "",
        content: "",
        contentType: "",
        createTime: ""
      },
      dictContentType: []
      // 发布内容类别
    };
  },
  /* created() {
    //导航完成后通过内容id获取全文,发送http请求
    // this.fetchData();
  }, */
  methods: {
    init() {
      this.getDictContenTypeData();
      this.fetchData();
    },
    // 获取内容类别
    getDictContenTypeData() {
      getDictDataByType("contentType").then(res => {
        if (res.success) {
          this.dictContentType = res.result;
        }
      });
    },
    // 获取内容全文
    fetchData() {
      getWechatContent(this.$route.params.id).then(res => {
        if (res.success) {
          this.contentForm = res.result;
          this.dictContentType.forEach(e => {
            if (Number(e.value) === this.contentForm.contentType) {
              this.contentForm.contentType = e.title;
            }
          });
        }
      });
    },
    // 返回按钮
    back() {
      window.history.back();
    }
  },
  /* computed: {
    showContentType: function() {
      this.dictContentType.forEach(e => {
        if (Number(e.value) === this.contentForm.contentType) {
          return e.title;
        }
      });
    },
  }, */
  // 导航完成后获取数据
  watch: {
    "$route.name"(toC, fromC) {
      if (fromC === "contentManage" && toC === "seeContent") {
        this.init();
      }
    }
  },
  // 导航完成前获取数据
  /* beforeRouteUpdate (to, from, next) {
    getWechatContent(to.params.id, (contentForm) => {
      this.setData(contentForm)
      console.log(this.contentForm)
      next()
    })
  }, */
  mounted() {
    this.init();
  }
};
</script>

<style scoped>
</style>
