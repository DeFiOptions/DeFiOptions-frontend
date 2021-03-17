import Vue from 'vue'
import App from './App.vue'
import store from "./store/index.js";
import router from "./router.js";
import Toast, { POSITION } from 'vue-toastification';
import "vue-toastification/dist/index.css";

const toastOptions = {
  position: POSITION.TOP_LEFT,
  draggable: false,
  closeOnClick: true,
  timeout: 5000
};

Vue.use(Toast, toastOptions);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
