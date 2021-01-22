<template>
  <footer class='zkp-footer'>
    <span>© VeChain Foundation 2020</span>
    <span>Powered by VeChain</span>
  </footer>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Footer extends Vue {}
</script>

<style lang='scss' scoped>
  .zkp-footer {
    width: 100%;
    height: 68px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: rgba(255, 255, 255, .15);
    font-family: 'Courier';
    font-size: 14px;
    color: #ffffff;
    box-sizing: border-box;
  }
</style>
