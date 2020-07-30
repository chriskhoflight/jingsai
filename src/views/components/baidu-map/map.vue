<template>
   <baidu-map
     :center="center"  
     :zoom="zoom" 
     :dragging="true" 
     :scroll-wheel-zoom="true"
     class="map"
     @ready="handler" 
     @click="getClickInfo"
     @moving="syncCenterAndZoom"  
     @moveend="syncCenterAndZoom"
     @zoomend="syncCenterAndZoom"
   >
   <!-- <label>关键词：<input v-model="keyword"></label>
  <label>地区：<input v-model="location"></label> -->
  <Alert show-icon>若没有搜索到具体位置,请在地图上选择最相近的位置,然后点击使用当前经纬度的按钮,最后再手动输入地址即可</Alert>
  <Form  :label-width="50" inline>
       <FormItem label="详细地址">
            <Input v-model="keyword" placeholder="请输入详细地址"/>
        </FormItem>
        <FormItem label="地区">
            <Input v-model="location" placeholder="Enter something..."/>
        </FormItem>
        <FormItem label="经度">
            <Input v-model="longitude" placeholder="Enter something..."/>
        </FormItem>
        <FormItem label="纬度">
            <Input v-model="latitude" placeholder="Enter something..."/>
        </FormItem> 
        <FormItem>
            <Button type="primary" @click="ensure">使用当前经纬度</Button>
        </FormItem>

    </Form>

     <bm-local-search
       :keyword="keyword"
       :auto-viewport="true"
       :location="location"
       @infohtmlset="getResult"
     ></bm-local-search>
     <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
     <bm-geolocation
       anchor="BMAP_ANCHOR_BOTTOM_RIGHT"
       :showAddressBar="true"
       :autoLocation="true"
       @locationSuccess="getAddress"
     ></bm-geolocation>
     <bm-marker :position="{lng:center.lng, lat: center.lat}"></bm-marker>
   </baidu-map>
</template>
<script>
 //import {MP} from '../../map'
   export default {
    name:"vueMap",
       data(){
           return {
             baidumapSwitch:false,
              center: { lng: 114.220941, lat: 22.690015 },
              zoom: 16,
              location: "广州市",
              keyword: "",
              longitude:'',
              latitude:'',
              address:''

           }
       },
       mounted(){
           
       },
       methods:{
           handler({ BMap, map }) {},
            //点击获取到当前经纬度
            getClickInfo(e) {
              // console.log(e)
              // console.log("lng is"+e.point.lng);
              // console.log("lat is"+e.point.lat);
              this.longitude = e.point.lng
              this.latitude = e.point.lat

              this.center.lng = e.point.lng;
              this.center.lat = e.point.lat;
            },
            //双向绑定经纬度以及缩放尺寸
            syncCenterAndZoom(e) {
              const { lng, lat } = e.target.getCenter();
              this.center.lng = lng;
              this.center.lat = lat;
              // this.zoom = e.target.getZoom();
            },
            //经纬度同步
            baidumap(){
            this.baiduDevicelocationx = this.center.lng
            this.baiduDevicelocationy = this.center.lat
            },
            getAddress(point,AddressComponent,marker){
              // console.log(point)
              // console.log(AddressComponent)
              // console.log(marker)
            },
            getResult(v){
              // console.log(v)
              this.longitude = v.point.lng
              this.latitude = v.point.lat
              this.address = v.title
            },
            ensure(){
              if(this.latitude===''||this.latitude===undefined||this.latitude===null){
                this.$Message.warning("经纬度还未进行提取,请输入关键词搜索或在地图上进行选择");
                return
              }
              if(this.address===''){
                this.$Modal.warning({
                    title: '警告提示',
                    content: '经纬度已经提取,但未选择详细地址，请在“地址”框中输入详细地址'
                });
              }
              this.$emit("selected",{longitude:this.longitude,latitude:this.latitude,address:this.address})
            }

       }
   }
</script>
<style scoped>
  .map {
  width: 100%;
  height: 400px;
}
</style>