<template>
  <div class='not-found'>
    <img src='@/assets/images/not-found/bg.png' />
    <router-link tag='div' to='/' class='bottom'>
      Back Home
    </router-link>
  </div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class NotFound extends Vue {}
</script>

<style lang='scss' scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: absolute;
  top: 100px;
  bottom: 68px;
  img {
    display: block;
    max-height: 80%;
  }
}

.bottom {
  width: 194px;
  height: 50px;
  line-height: 50px;
  background: url('../../assets/images/not-found/bottom.png') no-repeat center;
  background-size: cover;
  position: absolute;
  left: 12%;
  top: 58%;
  font-size: 16px;
  color: #000000;
  font-family: Courier-Bold, Courier;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
}
</style>
