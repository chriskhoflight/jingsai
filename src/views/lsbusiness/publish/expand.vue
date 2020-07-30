<style scoped>
.expand-row {
  margin-bottom: 16px;
}
</style>
<template>
  <div>
    <Row class="expand-row">
      <Col span="6"><span style='font-size:16px;font-weight:bold;'>标题</span></Col>
      <Col span="6">{{row.title}}</Col>
    </Row>
    <Row>
        <Col span="6"><span style='font-size:16px;font-weight:bold;'>作者</span></Col>
      <Col span="6">{{row.author}}</Col>
    </Row>
    <br />
    <Row>
        <Col span="6"><span style='font-size:16px;font-weight:bold;'>已发布</span></Col>
      <Col span="6">{{row.isPublication?"是":"否"}}</Col>
    </Row>
    <br />
    <Row>
        <Col span="6"><span style='font-size:16px;font-weight:bold;'>已置顶</span></Col>
      <Col span="6">{{row.isTop?"是":"否"}}</Col>
    </Row>
    <br />
    <Row>
        <Col span="6"><span style='font-size:16px;font-weight:bold;'>内容类别</span></Col>
      <Col span="6">{{contentType}}</Col>
    </Row>
    <br />
    <Row>
        <Col span="6"><span style='font-size:16px;font-weight:bold;'>摘要</span></Col>
      <Col span="6">{{row.seoDescription}}</Col>
    </Row>
    <br />
    <Row>
        <Col span="6"><span style='font-size:16px;font-weight:bold;'>内容</span></Col>
      <Col span="6"><span v-html="content"></span></Col>
    </Row>
  </div>
</template>
<script>
export default {
  name: "expandRow",
  props: {
    row: Object
  },
  data() {
      return {
          r:this.row,
      };
  },
  computed:{
      contentType:function() {
          if (this.row.contentType == 0) {
              return "再生资源回收";
          } else if(this.row.contentType == 1) {
              return "市政工程";
          }else if(this.row.contentType == 2) {
              return "环卫保洁";
          }else if(this.row.contentType == 3) {
              return  "绿化工程";
          }else if(this.row.contentType == 4) {
              return  "装修装饰";
          } else{return "其它";}
      },  
      content:function() {
          return this.row.content;
      },

  },
};
</script>