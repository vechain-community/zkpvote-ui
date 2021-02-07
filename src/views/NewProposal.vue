<template>
  <Main className="zkp-newProposal">
    <div class="zkp-newProposal__container">
      <Avatar />
      <h2 class="zkp-newProposal__title">New proposal</h2>
      <Form
        label-position='top'
        ref="form"
        :model='formData'
        @submit.native.prevent="handleSubmit"
        :disabled='isLoading'
      >
        <FormItem
          class="zkp-newProposal__formItem"
          label='Topic'
          prop='topic'
          :rules="[
            { required: true, message: 'Required.', trigger: 'blur' },
            {
              validator: (_, value, callback) => {
                if (!value.trim()) {
                  callback('Required.')
                } else {
                  callback()
                }
              },
              trigger: 'blur'
            }
          ]"
        >
          <Input
            v-model="formData.topic"
            placeholder="What is your question"
            class="zkp-newProposal__input"
            maxlength="200"
          />
        </FormItem>
        <template v-for='(item, index) in formData.choices.length'>
          <FormItem
            class="zkp-newProposal__formItem"
            :label="index === 0 ? 'Choices' : ''"
            :key='String(index)'
            :prop='`choices.${index}`'
            :rules="[
              { required: true, message: 'Required.', trigger: 'blur' },
              {
                validator: (_, value, callback) => {
                  if (!value.trim()) {
                    callback('Required.')
                  } else {
                    callback()
                  }
                },
                trigger: 'blur'
                }
            ]"
          >
            <Input
              maxlength="50"
              v-model="formData.choices[index]"
              :placeholder="`Choice ${index + 1}`"
              class="zkp-newProposal__input"
            />
          </FormItem>
        </template>
        <FormItem
          class="zkp-newProposal__formItem"
          label='End Time'
          prop='endTime'
          :rules="[
            { required: true, message: 'Required.', trigger: 'blur' },
          ]"
        >
          <DatePicker
            format='yyyy-MM-dd HH:mm'
            placeholder='People cannot cast after end time'
            class="zkp-newProposal__input zkp-newProposal__date"
            v-model="formData.endTime"
            type='datetime'
            :picker-options="pickerOptions"
            prefix-icon='el-icon-date'
          />
        </FormItem>
        <div class="zkp-newProposal__footer">
          <Button type="submit" :loading="isLoading">Publish</Button>
        </div>
      </Form>
    </div>
  </Main>
</template>

<script lang='ts'>
import { Vue, Component, Ref } from 'vue-property-decorator';
import { Main } from '@/components';
import { Avatar, Button } from '@/baseComponents';
import ConnexService from '@/api';
import {
  Form, FormItem, Input, DatePicker,
} from 'element-ui';
import { State } from 'vuex-class';
import { createHmac } from 'crypto';
import {
  checkIsConnex,
  isOnLine,
  isTestNet,
  checkProtocolDetection,
} from '@/utils';

import { Topic, Config } from '@/interface/index.d';

import ipfsApi from '@/api/ipfs';

@Component({
  components: {
    Main,
    Avatar,
    Button,
    Form,
    FormItem,
    Input,
    DatePicker,
  },
})
export default class NewProposal extends Vue {
  @Ref('form') private form!: HTMLFormElement;

  @State('signer') private signer!: string;

  @State('config') private config!: Config;

  private formData: Topic & { endTime: string } = {
    topic: '',
    choices: [
      '',
      '',
    ],
    endTime: '',
  }

  private get rangeTime() {
    const nowDate = new Date();
    const currentDateTime = new Date(nowDate.toLocaleDateString());
    const oneDayTime = 24 * 60 * 60 * 1000 - 1000;
    const selectedDateStartTime = new Date(this.formData.endTime).getTime();
    if (this.formData.endTime && selectedDateStartTime < nowDate.getTime()) {
      this.formData.endTime = new Date(nowDate).toString();
    }

    if (currentDateTime.getTime() + oneDayTime < selectedDateStartTime) {
      return ['00:00:00', '23:59:00'];
    }
    return [`${nowDate.getHours()}:${nowDate.getMinutes()}:00`, '23:59:00'];
  }

  private get pickerOptions() {
    return {
      disabledDate(time: Date) {
        return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
        || time.getTime() > Date.now() + 30 * 24 * 60 * 60 * 1000;
      },
      selectableRange: this.rangeTime.join('-'),
      minTime: this.rangeTime[0],
    };
  }

  private isLoading = false;

  private handleSubmit() {
    this.form.validate(async (valida: boolean) => {
      try {
        if (this.isLoading) {
          return false;
        }

        if (!await checkIsConnex()) {
          return checkProtocolDetection();
        }

        if (!valida) {
          return false;
        }

        if (!await isOnLine()) {
          throw Error('Connection Error');
        }

        if (!await isTestNet()) {
          throw Error('ZKPVote only runs in Testnet');
        }

        const endTime = parseInt(`${new Date(this.formData.endTime).getTime() / 1000}`, 10);

        const data = [
          endTime,
          `0x${createHmac('sha256', this.formData.topic).digest('hex')}`,
          `0x${createHmac('sha256', this.formData.choices[0]).digest('hex')}`,
          `0x${createHmac('sha256', this.formData.choices[1]).digest('hex')}`,
        ];

        this.isLoading = true;

        const response = await ConnexService.newProposal(this.signer, data);

        if (!response || !('signer' in response)) {
          return false;
        }

        const { signer, voteID } = response;

        const ipfsResponse = await ipfsApi(this.config.ipfsConfig)
          .files.write(
            `/${signer}/${voteID}`,
            Buffer.from(JSON.stringify({
              topic: this.formData.topic,
              choices: this.formData.choices,
            })),
            { parents: true, create: true },
          );

        this.isLoading = false;

        if (!ipfsResponse) { return false; }

        return this.$router.push(`/vote/${voteID}`);
      } catch (err) {
        this.isLoading = false;
        return this.$notify({
          type: 'error',
          title: 'Error',
          message: `${err.message || err}`,
        });
      }
    });
  }
}
</script>

<style lang='scss' scoped>
.zkp-newProposal {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 46px 0 78px;
  max-width: 800px;

  #{&}__container {
    width: 100%;
    min-height: 100%;
    background-color: rgba(255, 255, 255, .15);
    padding: 24px 24px 90px;
    box-sizing: border-box;
  }

  #{&}__title {
    font-family: AlibabaSans;
    font-weight: 700;
    margin: 20px 0 0;
    text-align: center;
    font-size: 30px;
    line-height: 47px;
    color: #ffffff;
  }

  #{&}__form {
    padding: 0 36px;
  }

  #{&}__formItem {
    /deep/ .el-form-item__label {
      font-size: 20px;
      line-height: 31px;
      font-family: AlibabaSans;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 13px;
      margin-top: 17px;
      &::before {
        display: none;
      }
    }

    /deep/ .el-form-item__error {
      font-size: 14px;
      color: #f7f200;
    }
  }

  #{&}__input {
    width: 100%;

    /deep/ .el-input__inner {
      outline: unset;
      box-shadow: unset;
      border: unset;
      border-radius: unset;

      display: block;
      height: 60px;
      padding: 16px;
      box-sizing: border-box;

      color: #ffffff;
      font-size: 16px;
      line-height: 28px;
      background-color: rgba(255, 255, 255, .3);

      &::placeholder {
        color: rgba(255, 255, 255, .54);
      }
    }
  }

  #{&}__date {
    /deep/ .el-input__prefix {
      left: unset;
      right: 22px;
      font-size: 30px;
      color: #ffffff;
      width: 30px;
      .el-input__icon {
        line-height: 60px;
      }
    }
  }

  #{&}__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 48px;

    & > p {
      font-size: 16px;
      line-height: 25px;
      color: #ffffff;
      margin: 54px 0 22px;
    }
  }
}
</style>
