import Vue from 'vue';
import Vuex from 'vuex';
import accounts from "./modules/accounts";
import optionsExchange from "./modules/optionsExchange";
import liquidityPool from "./modules/liquidityPool";
import creditToken from "./modules/creditToken";
import fakecoin from "./modules/fakecoin";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        accounts,
        optionsExchange,
        liquidityPool,
        creditToken,
        fakecoin
    }
});