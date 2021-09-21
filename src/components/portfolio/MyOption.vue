<template>

<div class="section-small">

  <div class="d-flex justify-content-between">

    <!-- Option data -->
    <div class="d-flex justify-content-center">
      <MyOptionDataItem class="data-item" title="Option" :data="option.pair+' · ' + option.type" :divider="true" />
      <MyOptionDataItem class="data-item" title="Option size" :data="option.holding" :divider="true" />
      <MyOptionDataItem class="data-item" title="Expiration" :data="option.maturity" :divider="true" />
      <MyOptionDataItem class="data-item" title="Intrinsic value" :green="true" :data="'$'+intrinsicValue" />
    </div>

    <!-- Action button -->
    <div>
      <button @click="toggleSellForm" v-if="!isOptionExpired(option) && !showSellForm" class="btn btn-success">
        Sell
        <i class="fas fa-chevron-down"></i>
      </button>

      <button @click="toggleSellForm" v-if="!isOptionExpired(option) && showSellForm" class="btn btn-outline-success">
        Close
        <i class="fas fa-chevron-up"></i>
      </button>

      <button @click="redeemOption" v-if="isOptionExpired(option) && intrinsicValue > 0" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Redeem
      </button>
      
      <button v-if="isOptionExpired(option) && intrinsicValue == 0" class="btn btn-danger" disabled>Expired</button>

      <span></span>
    </div>

  </div>

  <!-- Sell option form -->
  <div v-if="showSellForm" class="sell-form">
    <h3>Option size</h3>

    <div class="d-flex">
      <div>
        <input type="text" v-model="selectedOptionSize" class="form-control sell-input" placeholder="0.0" aria-describedby="sellText">
        <div id="sellText" class="form-text" v-if="!isOptionSizeNotValid.status">
          Maximum option size to sell: <span class="max-sell" @click="selectedOptionSize = getMaxOptionSize">{{getMaxOptionSize}}</span>
          <span v-if="Number(this.option.holding) > Number(getMaxOptionSize)"> 
            (Your total holding is bigger: {{this.option.holding}})
          </span>.
        </div>

        <div v-if="isOptionSizeNotValid.status" id="sellText" class="form-text" >{{ isOptionSizeNotValid.message }}</div>
      </div>

      <div>
        <button @click="sellOption" class="btn btn-success form-control" :disabled="isOptionSizeNotValid.status">
          Sell for ${{getTotal.toFixed(2)}}
        </button>
        <div></div>
      </div>
      
    </div>
  </div>
  
</div>
  
</template>

<script>
import { mapGetters } from "vuex";
import MyOptionDataItem from './MyOptionDataItem.vue';
import OptionTokenContractJson from "../../contracts/RedeemableToken.json";

export default {
  name: "MyOption",
  props: ["option"],
  data() {
    return {
      loading: false,
      selectedOptionPrice: null, // sell option data
      selectedOptionSize: null, // sell option data
      selectedOptionVolume: null, // sell option data
      showSellForm: false
    }
  },

  components: { 
    MyOptionDataItem 
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getLiquidityPoolAddress"]),
    
    getMaxOptionSize() {
      // max option size that current user can sell
      let availableOptionVolume = Math.floor(Number(this.selectedOptionVolume*1000))/1000;
      let userOptionBalance = Number(this.option.holding);

      if (userOptionBalance > availableOptionVolume) {
        return availableOptionVolume;
      } else {
        return userOptionBalance;
      }
    },
    getTotal() {
      return Number(this.selectedOptionSize) * Number(this.selectedOptionPrice);
    },
    intrinsicValue() {
      return (Number(this.option.intrinsicValue)*Number(this.option.holding)).toFixed(2);
    },
    isOptionSizeNotValid() { // validation for option size
      // option size bigger than volume.
      if (Number(this.selectedOptionSize) > Number(this.getMaxOptionSize)) {
        return {status: true, message: "Option size too big!"};
      }

      // too many digits
      if (String(this.selectedOptionSize).length > 14) {
        return {status: true, message: "Please reduce the number of digits."};
      }

      // negative option size
      if (Number(this.selectedOptionSize) < 0) {
        return {status: true, message: "Option size must not be negative!"};
      }

      // not a number
      if (isNaN(this.selectedOptionSize)) {
        return {status: true, message: "Please enter a number."};
      }

      // null option size
      if (this.selectedOptionSize === null || Number(this.selectedOptionSize) === 0 || this.selectedOptionSize === undefined || this.selectedOptionSize === "") {
        return {status: true, message: "Option size must not be empty or zero!"};
      }

      return {status: false, message: "Valid option size"};
    }
  },

  methods: {
    isOptionExpired(option) {
      return Math.floor(Date.now()/1000) > Number(option.timestamp);
    },

    async redeemOption() {
      let component = this;

      // get option contract
      let optionContract = new this.getWeb3.eth.Contract(OptionTokenContractJson.abi, this.option.address);

      // redeem option transaction
      try {
        await optionContract.methods.redeem(
          component.getActiveAccount
        ).send({
          from: component.getActiveAccount,
          gas: Number(150000)
        }, function(error, hash) {
          component.loading = true;

          // transaction error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
            component.loading = false;
          }

          // transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Redeem transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the event
            optionContract.once("Transfer", {
              filter: { owner: component.getActiveAccount }
            }, function(error, event) {
              component.loading = false;
              
              // failed transaction
              if (error) {
                component.$toast.error("The Redeem transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("You have successfully redeemed your expired option.");
                component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
                component.$store.dispatch("optionsExchange/fetchUserOptions");
              }
            });
          }
        });
      } catch (e) {
          window.console.log("Error:", e);
          component.$toast.error("The transaction has been reverted. Please try again or contact project admins.");
          component.loading = false;
      }
    },

    async sellOption() {
      console.log("SELL OPTION");
    },

    async setSellData() {
      const result = await this.getLiquidityPoolContract.methods.querySell(this.option.symbol).call();

      if (result) {
        this.selectedOptionPrice = this.getWeb3.utils.fromWei(String(result.price), "ether");
        this.selectedOptionVolume = this.getWeb3.utils.fromWei(String(result.volume), "ether");

        this.selectedOptionSize = this.getMaxOptionSize;

        // Reducing the query price to avoid precision errors in the smart contract (-0.01%)
        this.selectedOptionPrice -= Number(this.selectedOptionPrice) * 0.0001;
      }
    },

    toggleSellForm() {
      if (this.showSellForm) {
        this.showSellForm = false;
      } else {
        this.setSellData();
        this.showSellForm = true;
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