<template>
<div>
  <p class="info">小区编码:{{code}}</p>
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
        name:"qrCode",
        data(){
            return {
            }
        },
      methods: {
        useqrcode(){
          var canvas = document.getElementById('canvas')
          QRCode.toCanvas(canvas, process.env.VUE_APP_QR_CODE+this.code, function (error) {
            if (error) console.error(error)
            // console.log('QRCode success!');
          })
        }
      },
      props:['code'],
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