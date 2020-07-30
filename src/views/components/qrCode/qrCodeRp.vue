<template>
<div>
  <p class="info">回收人员编码:{{id}}</p>
    <div id="qrCode">
      <!-- <div id='code'></div> -->
      <canvas id="canvas"></canvas>
    </div>
  <p class="info">右键保存二维码</p>
</div>
    
</template>
<style></style>
<script>
  import QRCode from 'qrcode'
    export default {
        name:"qrCodeRp",
        data(){
            return {
            }
        },
      methods: {
        useqrcode(){
          var canvas = document.getElementById('canvas')
          QRCode.toCanvas(canvas, process.env.VUE_RP_QR_CODE+this.id, function (error) {
            if (error) console.error(error)
            // console.log('QRCode success!');
          })
        }
      },
      props:['id'],
      mounted(){
          this.useqrcode();
      }
    }
</script>

<style scoped>
      .info{
        text-align: center;
        font-size: 20px
      }
      #qrCode{
        display: flex;
        justify-content: center
      }
</style>