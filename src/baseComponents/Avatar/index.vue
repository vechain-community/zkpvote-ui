<template>
  <div class="zkp-avatar" v-if="signer">
    <div
      class="zkp-avatar__img"
      :style="{
        background: `url('data:image/svg+xml;utf8,${avatarImg}')`,
        backgroundSize: 'contain'
      }"
      @click="handleChangeSigner"
    />
    <div>
      <span class='zkp-avatar__text'>Hi, </span>
      <router-link to='/my-proposal' class='zkp-avatar__text'>{{ signer | ellipsis }}</router-link>
    </div>
  </div>
</template>

<script lang='ts'>
import { picasso } from '@vechain/picasso';
import { Vue, Component, Inject } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import {
  ellipsis,
  isTestNet,
  isOnLine,
} from '@/utils';
import ConnexService from '@/api';

@Component({
  filters: {
    ellipsis,
  },
})
export default class Avatar extends Vue {
  @State('signer') private signer!: string;

  @Action private setSigner!: (data: string) => void

  @Inject('reload') private reload!: () => void

  private get avatarImg() {
    return picasso(this.signer);
  }

  private async handleChangeSigner() {
    try {
      if (!isOnLine()) {
        throw Error('Connection Error');
      }
      if (!isTestNet()) {
        throw Error('ZKPVote only runs in Testnet');
      }

      const signer = await ConnexService.login();

      if (signer) {
        sessionStorage.setItem('signer', signer);
        this.setSigner(signer);
        this.reload();
      }
    } catch (err) {
      this.$notify({
        type: 'error',
        title: 'Error',
        message: `${err.message || err}`,
      });
    }
  }
}
</script>

<style lang='scss' scoped>
.zkp-avatar {
  height: 34px;
  display: flex;
  align-items: center;

  #{&}__img {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 8px;
  }

  #{&}__text {
    font-size: 14px;
    color: #ffffff;
    font-family: Courier;
    font-weight: 400;
  }
}
</style>
