<template>
  <footer class='zkp-footer'>
    <a href='https://www.vechain.org' target="_blank">© VeChain Foundation {{ year }}</a>
    <span>Powered by VeChain</span>
  </footer>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import dayjs from 'dayjs';

@Component
export default class Footer extends Vue {
  private get year() {
    return dayjs().format('YYYY');
  }
}
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

    a {
      color: #ffffff;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
