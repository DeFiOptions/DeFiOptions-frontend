import Vue from 'vue';
import Vuex from 'vuex';
import accounts from "./modules/accounts";
import optionsExchange from "./modules/optionsExchange";
import liquidityPool from "./modules/liquidityPool";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        accounts,
        optionsExchange,
        liquidityPool
    }
});