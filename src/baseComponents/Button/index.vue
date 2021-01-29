<template>
  <button
    class="zkp-button"
    :class="[`zkp-button__${size}`, `zkp-button__${colorType}`, loading && 'zkp-button__loading']"
    :style="{width}"
    @click="e => $emit('click', e)"
  >
    <slot />
    <div class="loading" />
  </button>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';

type TSize = 'lg' | 'md' | 'sm';
type TType = 'light' | 'dark';

@Component
export default class Button extends Vue {
  @Prop({ type: String, default: 'md' }) private size!: TSize;

  @Prop({ type: String, default: 'light' }) private colorType!: TType;

  @Prop({ type: String, default: '280px' }) private width!: string;

  @Prop({ type: Boolean, default: false }) private loading!: boolean;
}
</script>

<style lang='scss' scoped>
@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.zkp-button {
  outline: unset;
  border: unset;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.25;
  border-radius: 0.375em;
  position: relative;
  top: 0;
  transition: all .15s;
  margin: 0 auto;
  font-family: Courier;

  &#{&}__light {
    background-color: #ffffff;
  }
  &#{&}__dark {
    background-color: #f3f3f3;
  }

  &:disabled {
    background-color: #f3f3f3;
    &::before {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(255, 255, 255, .65);
      border-radius: 0.25em;
    }
  }

  &#{&}__loading {
    overflow: hidden;
    pointer-events: none;
    .loading {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: #ffffff;
      color: #000000;

      &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 1.5em;
        height: 1.5em;
        border-radius: 50%;
        border: 2px #000000 solid;
        clip: rect(0, 1em, 4em, 0);
        animation: loading 1.1s infinite linear;
        margin-top: -.75em;
        margin-left: -.75em;
        opacity: 0.75;
      }
    }
  }

  &#{&}__lg {
    font-size: 20px;
    padding: 1.25rem 3rem;
    box-shadow: 0 0.35em 0 #c3c3c3;
    &:active {
      box-shadow: 0 0.1em 0 #c3c3c3;
      top: 0.25em;
    }
  }

  &#{&}__md {
    font-size: 18px;
    padding: 1rem 2.5rem;
    box-shadow: 0 0.25em 0 #c3c3c3;
    &:active {
      box-shadow: 0 0.075em 0 #c3c3c3;
      top: 0.125em;
    }
  }

  &#{&}__sm {
    font-size: 14px;
    padding: .75rem 2rem;
    box-shadow: 0 0.15em 0 #c3c3c3;

    &:active {
      box-shadow: 0 0.05em 0 #c3c3c3;
      top: 0.1em;
    }
  }
}
</style>
