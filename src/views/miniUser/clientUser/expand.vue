<style scoped>
.expand-row {
  margin-bottom: 16px;
}
</style>
<template>
    <div>
        <Row class="expand-row">
            <Col span="5">
                <span>编号: </span>
                <span>{{ row.id }}</span>
            </Col>
            <Col span="6">
                <span>openId: </span>
                <span>{{ row.openId }}</span>
            </Col>
            <Col span="6">
                <span>session: </span>
                <span>{{ row.sessionId }}</span>
            </Col>
        </Row>
    </div>
</template>
<script>
export default {
  name: "expandRow",
  props: {
    row: Object
  }
};
</script>