<template>
  <div class="contentContainer">
    <div class="info">
      <h2 class="center">{{contentForm.title}}</h2>
      <p class="userinfo"><span class="author">{{contentForm.author}} </span> <span class="time">{{contentForm.createTime|dateFormat}}</span></p>
    </div>
    <div v-html="contentForm.content" class="content"></div>
  </div>
</template>

<script>
import { getContentByContentType } from "@/api/publishContent";
import { getDictDataByType } from "@/api/index";
export default {
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
    };
  },
  methods: {
    init() {
      // this.getDictContenTypeData();
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
      var param = this.$route.query.id ? this.$route.query.id :this.$route.query.contentType
      getContentByContentType(param).then(res => {
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
  },
  mounted() {
    document.querySelector(".app-main").style.overflow="auto"
    document.querySelector(".content").style.padding="0 10px"
    this.init();
  },
  watch:{
    'dictContentType':{
      handler(){
        this.dictContentType.forEach(e => {
            if (Number(e.value) === this.contentForm.contentType) {
              this.contentForm.contentType = e.title;
            }
          });
      }
    }
  }
};
</script>
<style scoped>
    *{
      font-family:-apple-system-font,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei UI","Microsoft YaHei",Arial,sans-serif;
    }
    .info p{
      font-size: 16px;
      font-weight: bold;
      color: rgb(37, 37, 37);
      line-height: 20px;
      padding: 2px;
      letter-spacing: 1px;
      text-align: justify
    }


    .info .center{
      text-align: justify;
      font-size: 22px;
      line-height: 1.4;
      margin-bottom: 14px;
      color: #333;
    }

    .contentContainer{
      padding: 20px
    }
     >>> img{
      max-width: 100%;
    }

    .author{
      color: #5B6184;
      margin-right: 10px
    }

    .time{
      color: #BABABA
    }

    .userinfo{
      margin-bottom: 22px;
    }

    >>>p{
      text-align: justify;
      line-height: 1.8;
    }
</style>
