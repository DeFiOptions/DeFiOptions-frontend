<template>
  <div>
    <div class="section-big row mt-4 mx-3">
      <div class="col-md-3 mb-4">
        <h3>Markets</h3>

        <div v-for="pair in pairs" v-bind:key="pair">
          <button @click="changePair(pair)" class="btn btn-outline-primary btn-xl mt-2" :class="{'btn-outline-primary-active':pair === selectedPair}">
            {{pair}}
          </button>
        </div>
      </div>

      <div class="col-md-9">
        <div class="d-flex flex-wrap justify-content-between">
          <div class="mb-4">
            <h3>Type</h3>

            <div class="btn-group mt-2" role="group" aria-label="Basic example">
              <button @click="changeOptionType('CALL')" type="button" class="btn btn-outline-primary btn-md" :class="{'btn-outline-primary-active':'CALL' === selectedType}">CALL</button>
              <button @click="changeOptionType('PUT')" type="button" class="btn btn-outline-primary btn-md" :class="{'btn-outline-primary-active':'PUT' === selectedType}">PUT</button>
            </div>
          </div>

          <div class="mb-4">
            <h3>Current price</h3>

            <button class="btn btn-primary mt-2 btn-md">
              ${{getUnderlyingPrice}}
            </button>
          </div>

          <div class="mb-4">
            <h3>Maturity</h3>

            <div class="btn-group mt-2">
              <button type="button" class="btn btn-primary btn-md dropdown-toggle text-uppercase" data-bs-toggle="dropdown" aria-expanded="false">
                {{getSelectedMaturity}}
              </button>
              <ul class="dropdown-menu">
                <li>
                  <span class="dropdown-item text-uppercase" @click="changeMaturity(maturity)" v-for="maturity in maturities" v-bind:key="maturity">{{maturity}}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <OptionsList :symbols="getFilteredSymbols" />
        <h3 v-if="Object.keys(this.getSymbolsListJson).length === 0">No options available.</h3>
        
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import OptionsList from '../components/trade/OptionsList.vue';

export default {
  name: 'Trade',
  beforeDestroy() {
    this.unsubscribe();
  },
  components: {
    OptionsList
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth", "getWeb3", "isUserConnected", "getLastSelectedTradePair", "getLastSelectedTradeMaturity", "getLastSelectedTradeType"]),
    ...mapGetters("optionsExchange", ["getOptionsExchangeAddress", "getExchangeUserBalance", "getUnderlyingPrice"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getLiquidityPoolAddress", "getSymbolsListJson", "getDefaultMaturity", "getDefaultPair", "getDefaultType"]),
    ...mapGetters("dai", ["getDaiAddress", "getUserDaiBalance", "getDaiContract"]), // todo: delete
    ...mapGetters("usdc", ["getUsdcAddress", "getUserUsdcBalance", "getUsdcContract"]),

    getFilteredSymbols() {
      try {
        const filteredList = this.getSymbolsListJson[this.getSelectedPair][this.getSelectedMaturity][this.getSelectedType];
        return filteredList.sort((a, b) => a.strike - b.strike);
      } catch {
        return [];
      }
    },
    getSelectedMaturity() {
      if (this.selectedMaturity) {
        return this.selectedMaturity;
      }
      return this.getDefaultMaturity;
    },
    getSelectedPair() {
      if (this.selectedPair) {
        return this.selectedPair;
      }
      return this.getDefaultPair;
    },
    getSelectedType() {
      if (this.selectedType) {
        return this.selectedType;
      }
      return this.getDefaultType;
    }
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      // if web3 is not yet loaded or user not connected, redirect to home page
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("optionsExchange/storeAddress");
    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("liquidityPool/fetchSymbolsList");
    this.$store.dispatch("liquidityPool/storeAddress");
    this.$store.dispatch("dai/fetchContract");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("dai/storeAddress");
    this.$store.dispatch("usdc/fetchContract");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("usdc/storeAddress");

    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'liquidityPool/setSymbolsList' && Object.keys(this.getSymbolsListJson).length > 0) {
        // extract values from getSymbolsListJson and pre-populate dropdowns (pair, maturity, type)
        this.pairs = Object.keys(this.getSymbolsListJson);
        this.selectedPair = this.pairs[0];

        this.maturities = Object.keys(this.getSymbolsListJson[this.selectedPair]);
        this.selectedMaturity = this.maturities[0];

        this.typeNames = Object.keys(this.getSymbolsListJson[this.selectedPair][this.selectedMaturity]);
        this.selectedType = this.typeNames[0];

        
        if (this.getLastSelectedTradePair) {
          // persistent storage for a user that's switching between pages
          this.selectedPair = this.getLastSelectedTradePair;
        }

        if (this.getLastSelectedTradeMaturity) {
          // persistent storage for a user that's switching between pages
          this.selectedMaturity = this.getLastSelectedTradeMaturity;
        }

        if (this.getLastSelectedTradeType) {
          // persistent storage for a user that's switching between pages
          this.selectedType = this.getLastSelectedTradeType;
        }

        let symbol = this.getSymbolsListJson[this.selectedPair][this.selectedMaturity][this.selectedType][0].symbol;
        this.$store.dispatch("optionsExchange/fetchUnderlyingPrice", {symbol});
      }
    });
  },
  data() {
    return {
      maturities: null,
      pairs: null,
      selectedMaturity: null,
      selectedPair: null,
      selectedType: null,
      typeNames: null // PUT, CALL
    }
  },
  methods: {
    changePair(pair) {
      this.selectedPair = pair;
      this.$store.commit("accounts/setLastSelectedTradePair", pair);

      // fetch new underlying price
      let symbol = this.getSymbolsListJson[this.selectedPair][this.selectedMaturity][this.selectedType][0].symbol;
      this.$store.dispatch("optionsExchange/fetchUnderlyingPrice", {symbol});
    },
    changeMaturity(maturity) {
      this.selectedMaturity = maturity;
      this.$store.commit("accounts/setLastSelectedTradeMaturity", maturity);
    },
    changeOptionType(optionType) {
      this.selectedType = optionType;
      this.$store.commit("accounts/setLastSelectedTradeType", optionType);
    }
  }
}
</script>
