<template>
  <div>

    <AccountBalance 
      :exchangeBalance="Number(getExchangeUserBalance)" 
      :creditTokens="Number(getCreditTokenUserBalance).toFixed(2)" 
    />

    <MyOptions :getUserOptions="getUserOptions" class="mb-5" />

    <MintFakeStablecoin v-if="getChainName === 'Kovan'" class="mb-5" />

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import AccountBalance from '../components/portfolio/AccountBalance.vue';
import MintFakeStablecoin from '../components/portfolio/MintFakeStablecoin.vue';
import MyOptions from '../components/portfolio/MyOptions.vue';

export default {
  name: 'Portfolio',
  components: {
    AccountBalance,
    MyOptions,
    MintFakeStablecoin
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainName", "getWeb3", "isUserConnected"]),
    ...mapGetters("optionsExchange", ["getExchangeUserBalance", "getUserOptions"]),
    ...mapGetters("creditToken", ["getCreditTokenUserBalance"]),
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("dai/fetchContract");
    this.$store.dispatch("usdc/fetchContract");
    this.$store.dispatch("creditToken/fetchContract");
    this.$store.dispatch("liquidityPool/fetchUserBalance");
    this.$store.dispatch("liquidityPool/storeAddress");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
    this.$store.dispatch("optionsExchange/fetchUserOptions");
    this.$store.dispatch("creditToken/fetchUserBalance");
    this.$store.dispatch("accounts/fetchActiveBalance");
  }
}
</script>
