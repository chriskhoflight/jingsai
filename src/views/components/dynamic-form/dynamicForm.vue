<template>
    <Form ref="formDynamic" :model="formDynamic" :label-width="70" >
        <FormItem
                v-for="(item, index) in formDynamic.items"
                v-if="item.status"
                :key="index"
                :label="'时间段 ' + item.index"
                :prop="'items.' + index + '.value'"
                :rules="{required: true, message: 'Item ' + item.index +' can not be empty', trigger: 'blur'}">
            <Row>
                <Col span="9">
                    <Select v-model="item.value" >
                        <Option v-for="e in selectOptions" :value="e.code" :label="e.name" :key="e.value"></Option>
                    </Select>
                </Col>
                <Col span="9" offset="1">
                    <Time-picker  format="HH:mm" type="timerange" placement="bottom-end"  placeholder="选择时间"  v-model="item.time"></Time-picker>
                </Col>
                <Col span="4" offset="1">
                    <Button @click="handleRemove(index)">删 除</Button>
                </Col>
            </Row>
        </FormItem>
        <FormItem>
            <Row>
                <Col span="12">
                    <Button type="dashed" long @click="handleAdd" icon="md-add">添  加</Button>
                </Col>
            </Row>
        </FormItem>
        <!-- <FormItem>
            <Button type="primary" @click="handleSubmit('formDynamic')">Submit</Button>
            <Button @click="handleReset('formDynamic')" style="margin-left: 8px">Reset</Button>
        </FormItem> -->
    </Form>
</template>
<script>
    export default {
        data () {
            return {
                index: 1,
                formDynamic: {
                    items: [
                        {
                            value: '',
                            index: 1,
                            status: 1,
                            time:''
                        }
                    ]
                }
            }
        },
        methods: {
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.$Message.success('Success!');
                    } else {
                        this.$Message.error('Fail!');
                    }
                })
            },
            handleReset (name) {
                // this.$refs[name].resetFields();
                this.formDynamic.items = [
                        {
                            value: '',
                            index: 1,
                            status: 1,
                            time:''
                        }
                    ]
            },
            handleAdd () {
                this.index++;
                this.formDynamic.items.push({
                    value: '',
                    index: this.index,
                    status: 1,
                    time:''
                });
            },
            handleRemove (index) {
                this.formDynamic.items[index].status = 0;
            }
        },
        props:['selectOptions','data'],
        watch:{
            data:{
                handler(newVal){
                        this.formDynamic.items = newVal
                }
            }
        }
    }
</script>