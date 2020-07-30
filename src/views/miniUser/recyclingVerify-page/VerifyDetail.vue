<!-- 引入组件库 -->
 <script src="//unpkg.com/iview@1.0.1/dist/iview.min.js"></script>
<template>
  <div>
    <br />
    <Row>
      <i-col span="30">
        <Card shadow>
          <span slot="title">
            <Icon type="ios-contact" size="25"/>&nbsp;回收人员信息
            <span style="float:right;width:100px;position:absolute;top: 10px;right: 10px;">
              <i-button type="primary" @click="back">返回</i-button>
            </span>
          </span>
          <!-- <Form ref="verifyDetail" :label-width="70" >
            <FormItem label="姓名" >
              <p> {{verifyDetail.name}}</p>
            </FormItem>
          </Form> -->
          <p style="font-size:17px;font-weight:normal"><Icon type="md-man" size="25" />&nbsp;姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：{{verifyDetail.name}}</p>
          <br />
          <p style="font-size:17px;font-weight:normal"><Icon type="ios-book" size="25"/>&nbsp;身份证号：{{verifyDetail.idCard}}</p>
          <br />
          <p style="font-size:17px;font-weight:normal" ><Icon type="ios-call" size="25"/>&nbsp;手机号码：{{verifyDetail.phone}}</p>
          <br />
          <p style="font-size:17px;font-weight:normal"><Icon type="ios-home" size="25"/>&nbsp;地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;址：{{verifyDetail.address}}</p>
          <br />
          <p style="font-size:17px;font-weight:normal"><Icon type="md-time" size="25"/>&nbsp;申请时间：{{verifyDetail.createTime}}</p>
          <br />
          <!-- <p>更新时间:{{verifyDetail.updateTime}}</p>
          <br />-->
          <p style="font-size:17px;font-weight:normal"><Icon type="md-contacts" size="25"/>&nbsp;人员类型：{{type}}</p>
          <br />
          <p v-bind:hidden="verifyDetail.memo==null" style="font-size:17px;font-weight:normal"><Icon type="md-close" size="25"/>&nbsp;审核未通过原因:{{verifyDetail.memo}}</p>
          <br v-bind:hidden="verifyDetail.memo==null" />
          <P style="font-size:17px;font-weight:normal"><Icon type="md-paper" size="25"/>&nbsp;身份证正反面照片</P>
          <Poptip trigger="hover" title="提示" content="点击可查看大图">
            <img
              :src="verifyDetail.positiveImgUrl"
              width="100px"
              height="100px"
              @click="watchBigImg(verifyDetail.positiveImgUrl)"
            />
          </Poptip>
          <Poptip trigger="hover" title="提示" content="点击可查看大图">
            <img
              :src="verifyDetail.reverseImgUrl"
              width="100px"
              height="100px"
              @click="watchBigImg(verifyDetail.reverseImgUrl)"
            />
          </Poptip>
          <br />
          <p>
            <Steps :current="whichStatus">
              <Step title="待审核" content="正在等待管理员审核"></Step>
              <Step title="审核通过" content="审核通过" v-if="isPassOrWait"></Step>
              <Step status="error" title="审核未通过" content="审核未通过" v-if="isFaild"></Step>
              <!-- <Step status="error" title="拒绝接单" content="回收人员拒绝接单" v-if="isRefuse"></Step>
              <Step title="待支付" content="等待用户支付" v-if="isPay"></Step>
              <Step status="error" title="已取消" content="订单已取消" v-if="isCancel"></Step>
              <Step title="已完成" content="订单已完成" v-if="isFinish"></Step>-->
            </Steps>
          </p>
          <br />
          <p>
            <i-button type="error" v-if="isFaild" @click="back">该用户审核未通过</i-button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <i-button type="success" @click="verifyPass" v-if="isNoPass">审核通过</i-button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <i-button type="error" @click="verifyFaild" v-if="isNoPass">审核不通过</i-button>
            <i-button type="success" v-if="isPass" @click="go">该用户已经通过审核，请移步管理页面进行管理</i-button>
          </p>
        </Card>
      </i-col>
    </Row>
    <br />
    <!-- 查看大图 -->
    <Modal v-model="imgModal" :width="600" :styles="{top: '30px'}">
      <div width="100%">
        <img :src="bigImgUrl" @click="watchBigImg(null)" width="100%" height="100%" />
      </div>
    </Modal>
    <Modal :loading="true" ref="verify" @on-ok="submit" v-model="verifyModal" title="原因">
      <Input v-model="memo" :autofocus="true" placeholder="请输入审核不通过的原因"  />
    </Modal>
  </div>
</template>
<script>
import {
  getVerifyPersonById,
  changeStatusToPass,
  changeStatusToFaild
} from "@/api/miniUser";
export default {
  //入口
  created() {
    var data = this.$route.query.verifyData;
    if (data != null && data != undefined && data.id != undefined) {
      this.verifyDetail = data;
      this.setStore("id", data.id);
    } else {
      this.verifyDetail.id = this.getStore("id");
    }
  },
  data() {
    return {
      verifyModal: false,
      memo: "",
      imgModal: false, //查看大图
      bigImgUrl: null, //大图链接
      isBigImg: false,
      isVerify: null,
      operationLoading: false,
      // isRefuse: null,
      // isCancel: null,
      // isFinish: null,
      // isPay: null,
      color: "color",
      //前一个页面传来的数据
      verifyDetail: {
        id: "", //主键
        openId:"",//用户唯一标识
        idCard: "",
        phone: "", //回收人员手机号码-
        type: -1, //回收人员类型 --- 后台通过判断值是否小于0决定是否进行条件查询，小于0则查询所有type-
        positiveImgUrl: "", //身份证正面照片
        reverseImgUrl: "", //身份证反面照片
        address: "", //回收人员地址
        longitude: "", //回收人员的经度
        latitude: "", //回收人员纬度
        name: "", //回收人员姓名-
        status: -1 //回收人员状态 -后台通过判断值是否小于0决定是否进行条件查询，小于0则查询所有type
      }
    };
  },
  computed: {
    type: function() {
      if (this.verifyDetail.type == 0) {
        return "社会回收人员";
      } else if (this.verifyDetail.type == 1) {
        return "公司员工";
      }
    },
    whichStatus: function() {
      if (this.verifyDetail.status == 0) {
        return 0;
      } else if (this.verifyDetail.status == 1) {
        return 1;
      } else if (this.verifyDetail.status == 2) {
        return 2;
      }
    },
    isNoPass: function() {
      if (this.verifyDetail.status == 0) {
        return true;
      } else return false;
    },
    isPassOrWait: function() {
      if (this.verifyDetail.status == 0 || this.verifyDetail.status == 1) {
        return true;
      } else return false;
    },
    isPass: function() {
      if (this.verifyDetail.status == 1) {
        return true;
      } else return false;
    },
    isFaild: function() {
      if (this.verifyDetail.status == 2) {
        return true;
      } else return false;
    }
  },
  methods: {
    go() {
      this.$router.push({ path: "recyclingPersonnelManage" });
    },
    back() {
      this.$router.go(-1);
    },
    watchBigImg(v) {
      this.imgModal = !this.imgModal;
      this.bigImgUrl = v;
    },
    //发起请求根据ID获取回收人员信息
    getVerifyMethod() {
      getVerifyPersonById(this.verifyDetail.id).then(res => {
        if (res.success === true) {
          this.verifyDetail = res.result; // 数据渲染
        }
      });
    },
    //审核通过,改变用户的状态
    verifyPass() {
      this.$Modal.confirm({
        title: "审核",
        content: "您确定该用户通过审核吗",
        onOk: () => {
          this.operationLoading = true;
          changeStatusToPass(this.verifyDetail.id,this.verifyDetail.name,this.verifyDetail.openId).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("该用户通过审核");
              this.getVerifyMethod();
            }
          });
        }
      });
    },
    verifyFaild() {
      this.verifyModal = true;
    },
    submit() {
      this.operationLoading = true;
      if (this.memo == null || this.memo == "") {
        this.$Message.error("请输入不通过原因");
        this.$refs["verify"].buttonLoading = false;
        this.$nextTick(() => {
          this.$refs["verify"].loading = true;
        });
      } else {
        changeStatusToFaild(this.verifyDetail.id,this.memo,this.verifyDetail.name,this.verifyDetail.openId).then(res => {
          this.operationLoading = false;
          if (res.success === true) {
            this.$Message.error("审核不通过");
            this.getVerifyMethod();
            this.verifyModal = false;
          }
        });
      }
    }
    //审核不通过
    // verifyFaild(){
    //   this.$Modal.confirm({
    //     title:"审核",
    //     content:"确定该用户审核不通过吗？",
    //     onOk: ()=>{
    //       this.operationLoading = true;
    //       changeStatusToFaild(this.verifyDetail.id).then(res =>{
    //         this.operationLoading = false;
    //         if(res.success === true){
    //           this.$Message.error("审核不通过")
    //           this.getVerifyMethod();
    //         }
    //       });
    //     }
    //   });
    // },
  },
  //渲染完毕
  mounted() {
    this.getVerifyMethod(); //重新获取回收人员信息
  },
  watch: {
    verifyModal(newVal) {
      if (!newVal) {
        this.memo = "";
      }
    }
  }
};
</script>

<style>
.color {
  color: #f07625;
}
</style>