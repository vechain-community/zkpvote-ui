<template>
  <router-link tag='header' to='/' class='zkp-header'>ZKPVOTE</router-link>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Header extends Vue {}
</script>

<style lang='scss' scoped>
  .zkp-header {
    width: 100%;
    height: 80px;
    background-color: rgba(255, 255, 255, .35);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    color: #ffffff;
    font-weight: 700;
    backdrop-filter: blur(4px);
    font-family: 'Montserrat';
    cursor: pointer;
  }
</style>
