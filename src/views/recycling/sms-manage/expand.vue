<style scoped>
.expand-row {
  margin-bottom: 16px;
}
</style>
<template>
  <div>
    <Row class="expand-row">
      <Col span="3">
        <span>短信内容：</span>
        <span>{{ row.content }}</span>
      </Col>
    </Row>
    
    <Row class="expand-row" v-if="isError"> 
      <Col span="3">
        <span>错误编码：</span>
        <span>{{ row.errorCode }}</span>
      </Col>

       <Col span="3">
        <span>错误消息：</span>
        <span>{{ row.errorMsg }}</span>
      </Col>
    </Row>
  </div>
</template>
<script>
export default {
  name: "expandRow",
  props: {
    row: Object
  },
  computed: {

    isError: function(){
      if(this.row.status===2){
        return true;
      }else return false;
    }
    
  }
};

</script>