<style scoped>
.expand-row {
  margin-bottom: 16px;
}
</style>
<template>
    <div>
        <Row class="expand-row">
            <!-- <Col span="6">
                <span>分类描述: </span>
                <span>{{ row.description }}</span>
            </Col> -->
            <!-- <Col span="7">
                <span>更新时间: </span>
                <span>{{ row.updateTime }}</span>
            </Col> -->
            <Col span="5">
                <span>更新者: </span>
                <span>{{ row.updateBy }}</span>
            </Col>
            <Col span="6">
                <span>创建者: </span>
                <span>{{ row.createBy }}</span>
            </Col>
            <Col span="6">
                <span>编号: </span>
                 <span>{{ row.id }}</span>
            </Col>

        </Row>
        <!-- <Row>
            <Col span="6">
                <span>创建时间: </span>
                 <span>{{ row.createBy }}</span>
            </Col>
            <Col span="6">
                <span>Id: </span>
                 <span>{{ row.id }}</span>
            </Col>
        </Row> -->
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