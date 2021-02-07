import Vue from 'vue';
import { Loading, Notification } from 'element-ui';
import VueClipboard from 'vue-clipboard2';
import {
  checkAuthorized,
} from '@/utils';
import ConnexService from '@/api';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
import Axios from 'axios';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/scss/common.scss';
import 'normalize.scss/normalize.scss';

locale.use(lang);

Vue.config.productionTip = false;

Vue.use(VueClipboard);
Vue.use(Loading.directive);
Vue.prototype.$notify = Notification;

const signer = sessionStorage.getItem('signer');
if (signer) {
  store.dispatch('setSigner', signer);
}

router.beforeEach(async (to, from, next) => {
  if (to.meta.auth && !checkAuthorized()) {
    if (from.fullPath !== '/home') {
      next('/home');
    } else {
      next();
    }
  } else {
    next();
  }
  next();
});

Axios.create().get(`${process.env.BASE_URL}config.json`).then(({ status, data }) => {
  if (status === 200) {
    ConnexService.getInstance(data.contractAddress);
    store.dispatch('setConfig', data);
    new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount('#app');
  }
});
