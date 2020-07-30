<!-- 引入组件库 -->
 <script src="//unpkg.com/iview@1.0.1/dist/iview.min.js"></script>
<template>
  <div>
    <br />
    <Row>
      <i-col span="30">
        <Card shadow>
          <span slot="title">
            订单信息
            <span style="float:right;width:100px;position:absolute;top: 10px;right: 10px;">
              <i-button type="primary" @click="back">返回</i-button>
            </span>
          </span>
          <p>订单号：{{orderDetail.orderId}}</p>
          <br />

          <p>预约时间：{{orderDetail.appointmentDay}} {{orderDetail.appointmentStartTime}}～{{orderDetail.appointmentEndTime}}</p>
          <br />
          <p>订单类型：{{CpType}}</p>
          <br />
            <p  style="font-size:20px;font-weight:bold">
            预估价格(元)：<b style="font-size:20px;color:#FF7F00;font-weight:bold">{{orderDetail.estimatedPrice}} </b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;实收价格(元)：<b style="font-size:20px;color:#FF7F00;font-weight:bold">{{orderDetail.paidPrice}} </b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;附加费用(元)：<b style="font-size:20px;color:#FF7F00;font-weight:bold">{{orderDetail.additionalCosts}}</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

          </p>
          <br />
          
          <p v-if="isTrac">收货人姓名:{{orderDetail.destContactsName}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;收货人手机号:{{orderDetail.destContactsPhone}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;收货人地址:{{orderDetail.destContactsAdderss}}</p>
          <br />
          <span>
            <img
              width="100px"
              height="100px"
              v-for="item in urlsList"
              :src="item"
              @click="watchBigImg(item)"
            />
            <br />
          </span>
          <br />
          <p>
            <Steps :current="whichSatatus">
              <Step title="待分配" content="正在等待系统分配"></Step>
              <Step title="系统派单中" content="正在等待系统派单"></Step>
              <Step title="已接单" content="订单已被接单，等待回收人员上门"></Step>
              <Step status="error" title="拒绝接单" content="回收人员拒绝接单" v-if="isRefuse"></Step>
              <Step title="待支付" content="等待用户支付" v-if="isPay"></Step>
              <Step title="已支付" content="用户已完成支付" v-if="isPayed"></Step>
              <Step status="error" title="已取消" content="订单已取消" v-if="isCancel"></Step>
              <Step title="已完成" content="订单已完成" v-if="isFinish"></Step>
            </Steps>
          </p>
           <br v-if="isRemark"/>
                  <p v-if="isRemark"> 
            用户评价：{{orderDetail.comment}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  评分：<Rate disabled allow-half v-model="orderDetail.score" />
          </p>
          <br v-if="isRemark"/>
          <p v-if="isRemark"> 
            回收人员评价： {{orderDetail.recComment}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;评分：<Rate disabled allow-half v-model="orderDetail.recScore" />
          </p>
          <br v-if="isRemark"/>
          <br />
                      <i-button type="primary" @click="dispatchOrderDialog" v-if="isDispactched">人工派单</i-button>&nbsp;&nbsp;&nbsp;
            <i-button type="success" @click="this.manualFinish" v-if="isManualFinish">完成订单</i-button>
        

        </Card>
      </i-col>
    </Row>
    <br />
    <Row>
      <i-col span="30">
        <Card shadow>
          <p slot="title">下单人信息</p>
          <br />
          <p>姓名：{{orderDetail.contactsName}}</p>
          <br />
          <p>手机号码：{{orderDetail.contactsPhone}}</p>
          <br />
          <p>地址：{{orderDetail.contactsAdderss}}</p>
          <br />
          <p>电梯房：{{isElevatorRoom}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 楼层：{{orderDetail.contactsFloor}}</p>
          <p></p>
        </Card>
      </i-col>
    </Row>
    <br />
    <Row>
      <i-col span="30">
        <Card shadow>
          <p slot="title">回收人员信息</p>
          <p>名字：{{orderDetail.name}}</p>
          <br />
          <p>手机号码：{{orderDetail.phone}}</p>
        </Card>
      </i-col>
    </Row>
    <br />
    <Row>
      <p>预估商品总价：{{orderDetail.minPrice}} ~{{orderDetail.maxPrice}}&nbsp;(元)</p>
    </Row>
    <!-- 商品信息 -->
    <span>
      <i-table height="400" :columns="columns" :data="OrderGoodsList"></i-table>
    </span>
    <br />

    <!-- 弹出对话框 -->
    <Modal title="人工派单    (仅限公司员工)" v-model="dispatchModalVisible" :width="800" :styles="{top: '30px'}">
      <!-- 在线回收人员 -->
      <i-table
        highlight-row
        @on-current-change="selectRc"
        height="400"
        :columns="RecyclingPersonnelColumns"
        :data="RecyclingPersonnel"
      ></i-table>
      <div slot="footer">
        <Button type="text" @click="cancelDispactch">取消</Button>
        <Button type="primary" @click="comfirmDispactch">确定分配</Button>
      </div>
    </Modal>
    <!-- 查看大图 -->
    <Modal v-model="imgModal" :width="600" :styles="{top: '30px'}">
      <div width="100%">
        <img :src="bigImgUrl" @click="watchBigImg(null)" width="100%" height="100%" />
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  getOrderDetail,
  getOnlineRp,
  dispatchOrder,
  manualFinishOrder
} from "@/api/orders";
import { truncate } from "fs";
export default {
  data() {
    return {
      //图片url list
      // urlsList: [],
      imgModal: false, //查看大图
      bigImgUrl: null, //大图链接

      isBigImg: false,
      isRefuse: null,
      isCancel: null,
      isFinish: null,
      isPay: null,
      isPayed: null,
      //在线回收人员
      RecyclingPersonnel: [],
      color: "color",
      dispatchForm: {
        RecyclingPersonnelId: "",
        orderId: "",
        RecyclingPersonnelName: ""
      },
      // confirmDialog: false, //人工派单确定对话框

      dispatchModalVisible: false, //人工派单对话框是否显示

      orderDetailForm: {
        id: "", //主键
        orderId: "" //订单号-
      },
      //前一个页面传来的数据
      orderDetail: {
        userRemark:"",
        recyclinRemark: "",
        score: null,   //用户评分
        recScore: null,  //回收人员评分
        comment: "" , //用户评价
        recComment: "",  //回收人员评分
        estimatedPrice:0.00,
        paidPrice:0.00,
        additionalCosts:0.00,
        destContactsAdderss:"",
        destContactsName:"",
        destContactsPhone:"",
        additionalCosts:0,
        id: "", //主键
        imgUrls: "",
        appointmentDay: "",
        appointmentStartTime: "",
        appointmentEndTime: "",
        phone: "", //回收人员手机号码-
        orderId: "", //订单号-
        type: -1, //后台通过判断值是否小于0决定是否进行条件查询，小于0则查询所有type-
        contactsPhone: "", //联系人手机号-
        contactsName: "", //联系人名字 -
        isElevatorRoom: -1, //是否电梯房-
        contactsFloor: -1, //联系人楼层 -
        contactsAdderss: "", //联系人地址-
        name: "", //回收人员姓名-
        status: -1 //-后台通过判断值是否小于0决定是否进行条件查询，小于0则查询所有type
      },

      //商品的表格
      columns: [
        {
          title: "商品名称",
          key: "name"
        },
        {
          title: "商品数量",
          key: "goodsNum"
        },
        {
          title: "预估最小价格(单价)",
          key: "minPrice"
        },
        {
          title: "预估最大价格(单价)",
          key: "maxPrice"
        },
        {
          title: "该类商品预估最小价格",
          key: "goodMinTotalPrice"
        },
        {
          title: "该类商品预估最大价格",
          key: "goodMaxTotalPrice"
        }
      ],

      //在线回收人员的表格
      RecyclingPersonnelColumns: [
        {
          title: "姓名",
          key: "name"
        },
        {
          title: "手机号码",
          key: "phone"
        },
        {
          title: "地址",
          key: "address"
        }
      ],
      //订单商品的明细
      OrderGoodsList: []
    };
  },
  computed: {
    //展示评价
    isRemark: function(){
      if ((this.orderDetail.recyclinRemark=null&&this.orderDetail.recyclinRemark!="")
      ||(this.orderDetail.userRemark!=null&&this.orderDetail.userRemark!="")){
        return true;
      }else {
        return false;
      }
    },
    //type=2  ---> 运输服务
    isTrac: function(){
      if(this.orderDetail.type==2){
        return true;
      }else{
        return false;
      }
    },
    urlsList: function() {
      return this.orderDetail.imgUrls.split(";");
    },
    isManualFinish: function() {
      if (this.orderDetail.status != 5 && this.orderDetail.status != 6) {
        return true;
      } else {
        return false;
      }
    },
    CpType: function() {
      if (this.orderDetail.type === 0) {
        return "可再生回收";
      } else if (this.orderDetail.type === 1) {
        return "付费回收";
      } else if (this.orderDetail.type === 2) {
        return "运输服务";
      }
    },
    // isPay: function() {
    //   if (this.orderDetail.type === 0) {
    //     //可再生垃圾回收是回收人员支付钱给用户
    //     return false;
    //   } else {
    //     return true;
    //   }
    // },
    isDispactched: function() {
      if (
        this.orderDetail.status === 0 ||
        this.orderDetail.status === 1 ||
        this.orderDetail.status === 3
      ) {
        return true;
      } else return false;
    },
    isElevatorRoom: function() {
      if (this.orderDetail.isElevatorRoom == 0) {
        return "是";
      } else if (this.orderDetail.isElevatorRoom == 1) {
        return "否";
      }
    },
    status: function() {
      if (this.orderDetail.status == 0) {
        return "待分配";
      } else if (this.orderDetail.status == 1) {
        return "系统派单中";
      } else if (this.orderDetail.status == 2) {
        return "已接单";
      } else if (this.orderDetail.status == 3) {
        return "拒绝接单";
      } else if (this.orderDetail.status == 4) {
        return "待支付";
      } else if (this.orderDetail.status == 5) {
        return "已取消";
      } else if (this.orderDetail.status == 6) {
        return "已完成";
      }
    },
    type: function() {
      if (this.orderDetail.type == 0) {
        return "可再生回收";
      } else if (this.orderDetail.type == 1) {
        return "付费回收";
      } else if (this.orderDetail.type == 2) {
        return "运输服务";
      }
    },

    //订单状态
    //type=0的话用户是不需要支付的，是回收人员支付钱，故待支付为false
    //状态：0待分配 1系统已派单,待接单 2已接单 3拒绝接单 4等待用户支付（付费回收才有） 5已取消 6已完成'  7已支付
    whichSatatus: function() {
      if (this.orderDetail.status == 0 && this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isRefuse = false;
        this.isCancel = false;
        this.isPay = false;
        this.isPayed = false;
        this.isFinish = true;
        return 0;
      } else if (this.orderDetail.status == 0 && !this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isRefuse = false;
        this.isCancel = false;
        this.isPayed = true;
        this.isPay = true;
        this.isFinish = true;
        return 0;
      } else if (this.orderDetail.status == 1 && this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isRefuse = false;
        this.isCancel = false;
        this.isPay = false;
        this.isPayed = true;
        this.isFinish = true;
        return 1;
      } else if (this.orderDetail.status == 1 && !this.orderDetail.type == 0) {
        this.isRefuse = false;
        this.isCancel = false;
        this.isPay = true;
        this.isPayed = true;
        this.isFinish = true;
        return 1;
      } else if (this.orderDetail.status == 2 && this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isRefuse = false;
        this.isCancel = false;
        this.isPay = false;
        this.isPayed = false;
        this.isFinish = true;
        return 2;
      } else if (this.orderDetail.status == 2 && !this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isRefuse = false;
        this.isCancel = false;
        this.isPay = true;
        this.isPayed = true;
        this.isFinish = true;
        return 2;
      } else if (this.orderDetail.status == 3 && this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isCancel = false;
        this.isFinish = true;
        this.isPay = false;
        this.isPayed = false;
        this.isRefuse = true;
        return 3;
      } else if (this.orderDetail.status == 3 && !this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isCancel = false;
        this.isFinish = true;
        this.isPay = false;
        this.isPayed = false;
        this.isRefuse = true;
        return 3;
      } else if (this.orderDetail.status == 4 && this.orderDetail.type == 0) {
        //本身就是待支付状态
        // console.log(this.orderDetail.status);
        this.isCancel = false;
        this.isFinish = true;
        this.isPay = true;
        this.isPayed = true;
        this.isRefuse = false;
        return 3; //因为拒绝接单被隐藏了  所以要显示待支付下标要-1
      } else if (this.orderDetail.status == 4 && !this.orderDetail.type == 0) {
        //本身就是待支付状态
        // console.log(this.orderDetail.status);
        this.isRefuse = false;
        this.isPay = true;
        this.isPayed = true;
        this.isCancel = false;
        this.isFinish = true;
        return 3; //因为拒绝接单被隐藏了  所以要显示待支付下标要-1
      } else if (this.orderDetail.status == 5 && this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isCancel = true;
        this.isFinish = false;
        this.isPay = false;
        this.isPayed = false;
        this.isRefuse = false;
        return 3;
      } else if (this.orderDetail.status == 5 && !this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isCancel = true;
        this.isFinish = false;
        this.isPay = true;
        this.isPayed = true;
        this.isRefuse = false;
        return 5;
      } else if (this.orderDetail.status == 6 && this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);
        this.isCancel = false;
        this.isFinish = true;
        this.isPay = false;
        this.isPayed = false;
        this.isRefuse = false;
        return 3;
      } else if (this.orderDetail.status == 6 && !this.orderDetail.type == 0) {
        // console.log(this.orderDetail.status);

        this.isRefuse = false;
        this.isPay = true;
        this.isPayed = false;
        this.isCancel = false;
        this.isFinish = true;
        return 5;//已支付
      } else if (this.orderDetail.status == 7) {
        // console.log(this.orderDetail.status);
        this.isRefuse = false;
        this.isPay = true;
        this.isPayed = true;
        this.isCancel = false;
        this.isFinish = true;
        return 4;
      }
    }
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
    watchBigImg(v) {
      this.imgModal = !this.imgModal;
      this.bigImgUrl = v;
    },
    cancelDispactch() {
      this.dispatchModalVisible = false;
    },
    manualFinish() {
      this.$Modal.confirm({
        title: "确认完成",
        content: "确认人工完成订单" + this.orderDetail.orderId + "吗？",
        onOk: () => {
          manualFinishOrder(this.orderDetail).then(res => {
            if (res.success === true) {
              this.$Message.success("订单已完成!");
              location.reload();
            } else if (res.success === false) {
              this.$Message.error(res.message + "错误代码:" + res.code);
            }
          });
        }
      });
    },
    //选择了一个回收人员  赋值给请求参数
    selectRc(currentRow, oldCurrentRow) {
      this.dispatchForm.orderId = this.orderDetail.orderId;
      this.dispatchForm.RecyclingPersonnelId = currentRow.id;
      this.dispatchForm.RecyclingPersonnelName = currentRow.name;
    },
    comfirmDispactch() {
      if (
        this.dispatchForm.RecyclingPersonnelName != "" &&
        this.dispatchForm.RecyclingPersonnelName != null
      ) {
        this.$Modal.confirm({
          title: "确认分配",
          content:
            "您确认要分配订单给" +
            this.dispatchForm.RecyclingPersonnelName +
            "?",
          onOk: () => {
            dispatchOrder(this.dispatchForm).then(res => {
              if (res.success === true) {
                this.dispatchModalVisible = false;
                location.reload();
              }
            });
            this.confirmDialog = true;
          }
        });
      } else {
        this.$Message.error("请选择人员");
      }
    },

    //发起请求通过订单号获取订单商品明细
    getOrderDetailMethod() {
      this.orderDetailForm.id = this.orderDetail.id;
      this.orderDetailForm.orderId = this.orderDetail.orderId;
      getOrderDetail(this.orderDetailForm).then(res => {
        if (res.success === true) {
          if (res.result.orderGoodsList != null) {
            this.OrderGoodsList = res.result.orderGoodsList;
          }
          this.orderDetail = res.result; //传数据渲染
         
        }
      });
    },

    // 人工派单的逻辑方法
    dispatchOrderDialog() {
      this.dispatchModalVisible = true; //弹出对话框

      //发送请求获取所有在线的回收人员
      getOnlineRp().then(res => {
        if (res.success === true) {
          this.RecyclingPersonnel = res.result;
        }
      });
    }
  },

  //渲染完毕
  mounted() {
    this.getOrderDetailMethod(); //获取订单详情
  },

  //组件加载完毕
  created() {
    var data = this.$route.query.orderData;
    // if (data != null && data != undefined && data.orderId != undefined) {
    //   this.orderDetail = data;
    //   this.setStore("orderDetail", JSON.stringify(data));
    // } else {
    //   this.orderDetail = JSON.parse(this.getStore("orderDetail") || "{}");
    //   console.log("缓存取出orderDetail");
    // console.log(this.orderDetail);
    // }

    if (data != null && data != undefined && data.orderId != undefined) {
      this.orderDetail = data;
      this.setStore("orderId", data.orderId);
      this.setStore("id", data.id);
    } else {
      this.orderDetail.id = this.getStore("id");
      this.orderDetail.orderId = this.getStore("orderId");
    }
  }
};
</script>

<style>
.color {
  color: #f07625;
}
</style>