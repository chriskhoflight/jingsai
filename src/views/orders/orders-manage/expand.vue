<style scoped>
.expand-row {
  margin-bottom: 16px;
}
</style>
<template>
  <div>
    <Row>
      <Col span="6">
        <span>下单人信息:</span>
      </Col>
    </Row>
    <Br />
    <Row class="expand-row">
      <Col span="3">
        <span>姓名：</span>
        <span>{{ row.contactsName }}</span>
      </Col>
      <Col span="4">
        <span>手机号码：</span>
        <span>{{ row.contactsPhone }}</span>
      </Col>
      <Col span="4">
        <span>是否电梯房：</span>
        <span>{{ isElevatorRoom }}</span>
      </Col>
      <Col span="2">
        <span>楼层：</span>
        <span>{{ row.contactsFloor }}</span>
      </Col>
    </Row>
    
    <Row>
      <Col span="6">
        <span>地址：</span>
        <span>{{row.contactsAdderss}}</span>
      </Col>
    </Row>
    <br/>
    <Row>
      <Col span="6">
        <span>回收人员信息:</span>
      </Col>
    </Row>
    <br/>

    <Row>
      <Col span="3">
        <span>名字：</span>
        <span>{{ row.name }}</span>
      </Col>
      <Col span="4">
        <span>手机号码：</span>
        <span>{{ row.phone }}</span>
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
    isElevatorRoom: function() {
      if (this.row.isElevatorRoom == 0) {
        return "是";
      } else if (this.row.isElevatorRoom == 1) {
        return "否";
      }
    }
  }
};

// var vm = new Vue({
//   el: '#example',
//   data: {
//     message: 'Hello'
//   },
//   computed: {
//     // 计算属性的 getter
//     contactsAdderss: function () {
//       // `this` 指向 vm 实例
//       return this.message.split('').reverse().join('')
//     }
//   }
// })
</script>