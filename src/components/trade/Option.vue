<template>

<div class="section-small">

  <div class="d-flex justify-content-between">

    <!-- Option data -->
    <div class="d-flex justify-content-center">
      <OptionDataItem class="data-item" title="Strike" :data="'$' + option.strike" :divider="true" />
      <OptionDataItem class="data-item" title="Break even" data="???" :divider="true" />
      <OptionDataItem class="data-item" title="Price" :green="true" :data="optionPrice" />
    </div>

    <!-- Action button -->
    <div>
      <button @click="toggleForm" class="btn btn-success">
        Sell
        <i class="fas fa-chevron-down"></i>
      </button>

      <span></span>
    </div>

  </div>

  
</div>
  
</template>

<script>
import { mapGetters } from "vuex";
//import { signERC2612Permit } from 'eth-permit';
import OptionDataItem from '../OptionDataItem.vue';
//import OptionTokenContractJson from "../../contracts/RedeemableToken.json";

export default {
  name: "Option",
  props: ["option"],
  data() {
    return {
      optionPrice: "loading",
      showForm: false
    }
  },

  components: { 
    OptionDataItem 
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getLiquidityPoolAddress"]),

  },

  created() {
    this.getOptionPrice();
  },

  methods: {
    async getOptionPrice() {
      console.log("fetching option price");

      // fetch option price
      let result = await this.getLiquidityPoolContract.methods.queryBuy(this.option.symbol).call();
      
      if (result) {
        console.log("done fetching option price: " + result);

        const rPrice = this.getWeb3.utils.fromWei(result.price, "ether");
        this.optionPrice = "$" + Number(rPrice).toFixed(2);
      }
    },

    toggleForm() {
      if (this.showSellForm) {
        this.showForm = false;
      } else {
        this.showForm = true;
      }
    }
  }
}
</script>

<style>
.data-item {
  margin-right: 5px;
}

.fa-chevron-down, .fa-chevron-up {
  margin-left: 10px;
}

.max-sell {
  color: #5AFFB0;
  text-decoration: underline;
}

.max-sell:hover {
  color: #5AFFB0;
  text-decoration: none;
  cursor: pointer;
}

.sell-form {
  margin-top: 24px;
}

.sell-input {
  max-width: 200px;
  margin-right: 10px;
}

#sellText {
  color: white;
  font-weight: 400;
  font-size: 12px;
}

.section-small {
  margin-top: 16px;
}
</style>