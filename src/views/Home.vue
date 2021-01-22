<template>
  <Main className="zkp-home">
    <div class="zkp-home__userInfo">
      <Avatar />
    </div>
    <h2 class="zkp-home__slogan">Zero-knowledge Proof Voting</h2>
    <p class="zkp-home__desc">Create anonymous, provable voting</p>
    <Button
      size='lg'
      class="zkp-home__button"
      width='364px'
      @click='handleClick'
    >
      <span>New Proposal</span>
    </Button>
    <div class="zkp-home__img"></div>
  </Main>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import { Avatar, Button } from '@/baseComponents';
import { Main } from '@/components';
import {
  backgroundAnimation, checkAuthorized, checkIsConnex, checkProtocolDetection, isOnLine, isTestNet,
} from '@/utils';
import ConnexService from '@/api';

import { Action } from 'vuex-class';

@Component({
  components: {
    Main,
    Button,
    Avatar,
  },
})
export default class Home extends Vue {
  @Action('setSigner') private setSigner!: (signer: string) => void

  private text = 'VeChain Anonymous Voting'

  private async mounted() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  private resize() {
    backgroundAnimation(this.text);
  }

  // 登录
  private async handleClick() {
    try {
      // 判断是否登录
      if (checkAuthorized()) {
        this.$router.push('/new-proposal');
      } else {
        if (!await checkIsConnex()) {
          checkProtocolDetection();
        }
        if (!await isOnLine()) {
          throw Error('Connection Error');
        }
        if (!await isTestNet()) {
          throw Error('ZKPVote only runs in Testnet');
        }

        const signer = await ConnexService.login();

        if (signer) {
          sessionStorage.setItem('signer', signer);
          this.setSigner(signer);
          this.$router.push('/new-proposal');
        }
      }
    } catch (err) {
      if ((err.message || err).indexOf('connex') === -1) {
        this.$notify({
          type: 'error',
          title: 'Error',
          message: `${err.message || err}`,
        });
      }
    }
  }

  beforeDestroy() {
    const canvasDom = document.querySelector('.zkp-home__background');
    if (canvasDom && canvasDom.parentElement) {
      canvasDom.parentElement.removeChild(canvasDom);
      window.removeEventListener('resize', this.resize);
    }
  }
}
</script>

<style lang='scss' scoped>
.zkp-home {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 96px 0;

  #{&}__userInfo {
    margin-bottom: 8px;
  }

  #{&}__slogan {
    font-size: 40px;
    font-family: Courier-Bold, Courier;
    font-weight: bold;
    line-height: 48px;
    color: #ffffff;
    margin: 0;
  }

  #{&}__desc {
    font-size: 20px;
    font-family: Courier;
    color: #FFFFFF;
    line-height: 24px;
    margin: 18px 0 0 0;
  }

  #{&}__button {
    margin: 30px auto 86px;
  }

  #{&}__img {
    width: 334px;
    height: 326px;
    background: url('../assets/images/group@2x.png') no-repeat;
    background-size: cover;
  }
}
</style>
