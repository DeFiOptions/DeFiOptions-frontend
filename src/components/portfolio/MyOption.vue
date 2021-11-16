<template>

<div class="section-small">

  <div class="d-flex justify-content-between flex-wrap">

    <!-- Option data -->
    <div class="div-flex justify-content-center">
      <OptionDataItem class="data-item" title="Option" :data="option.pair+' · ' + option.type" :divider="true" />
      <OptionDataItem class="data-item" title="Size" :data="option.holding" :divider="true" />
      <OptionDataItem class="data-item" title="Strike" :data="strikePrice" :divider="true" />
      <OptionDataItem v-if="Number(option.timestamp)*1e3 < Date.now()" class="data-item" title="Expiry price" :data="'$'+expiryPrice" :divider="true" />
      <OptionDataItem class="data-item" title="Expiration" :data="option.maturity" :divider="true" />
      <OptionDataItem class="data-item" title="Intrinsic value" :green="true" :data="'$'+intrinsicValue" info="Intrinsic value is the difference between the current price of the underlying asset and the strike price of the option." />
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
    <h3>
      Option size
      <i 
        @mouseover="showInfo" 
        id="infoEl" 
        class="fas fa-info-circle" 
        data-bs-toggle="tooltip" 
        data-bs-placement="bottom" 
        title="The Sell button shows the price the liquidity pool is willing to pay for your options, consisting of the option's intrinsic value and a potential premium on top of it."
      ></i>
    </h3>

    <div class="d-flex flex-wrap">

      <div>
        <input type="text" v-model="selectedOptionSize" class="form-control sell-input" placeholder="0.0">

        <div class="form-text sell-text">
          <span v-if="isOptionSizeNotValid.status" >
            {{ isOptionSizeNotValid.message }}
          </span>

          <span class="form-text sell-text">
            Max size: <span class="max-sell" @click="selectedOptionSize = getMaxOptionSize">{{getMaxOptionSize}}</span>
            <span v-if="Number(this.option.holding) > Number(getMaxOptionSize)"> 
              (Your total holding is bigger: {{this.option.holding}})
            </span>.
          </span>
        </div>

      </div>

      <div class="form-button-mobile">
        <button @click="sellOption" class="btn btn-success form-control" :disabled="isOptionSizeNotValid.status">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
import { signERC2612Permit } from 'eth-permit';
import OptionDataItem from '../OptionDataItem.vue';
import OptionTokenContractJson from "../../contracts/RedeemableToken.json";
import ChainlinkContractJson from "../../contracts/ChainlinkFeed.json";
import addresses from "../../contracts/addresses.json";

export default {
  name: "MyOption",
  props: ["option"],
  data() {
    return {
      loading: false,
      expiryPrice: null, // price at the expiration date (if option expired already)
      selectedOptionPrice: null, // sell option data
      selectedOptionSize: null, // sell option data
      selectedOptionVolume: null, // sell option data
      showSellForm: false
    }
  },

  components: { 
    OptionDataItem 
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainId", "getWeb3"]),
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
        return {status: true, message: "Reduce the number of digits."};
      }

      // negative option size
      if (Number(this.selectedOptionSize) < 0) {
        return {status: true, message: "Must not be negative!"};
      }

      // not a number
      if (isNaN(this.selectedOptionSize)) {
        return {status: true, message: "Please enter a number."};
      }

      // null option size
      if (this.selectedOptionSize === null || Number(this.selectedOptionSize) === 0 || this.selectedOptionSize === undefined || this.selectedOptionSize === "") {
        return {status: true, message: "Must not be empty/zero!"};
      }

      return {status: false, message: "Valid option size"};
    },
    strikePrice() {
      return "$"+Number(this.option.strike).toFixed(0);
    }
  },

  created() {
    this.fetchExpiryPrice();
  },

  methods: {
    isOptionExpired(option) {
      return Math.floor(Date.now()/1000) > Number(option.timestamp);
    },

    async fetchExpiryPrice() {
      if (Number(this.option.timestamp)*1e3 < Date.now()) {
        let priceFeedType = "";

        if (this.option.pair === "ETH/USD") {
          priceFeedType = "ChainlinkFeedEth";
        } else if (this.option.pair === "BTC/USD") {
          priceFeedType = "ChainlinkFeedBtc";
        }

        const feedAddress = addresses[priceFeedType][parseInt(this.getChainId)];
        const feedContract = new this.getWeb3.eth.Contract(ChainlinkContractJson.abi, feedAddress);
        const historicPriceObj = await feedContract.methods.getPrice(this.option.timestamp).call();
        this.expiryPrice = Number(this.getWeb3.utils.fromWei(historicPriceObj.price, "ether")).toFixed(0);
      }

    },

    async redeemOption() {
      let component = this;
      component.loading = true;

      // get option contract
      let optionContract = new this.getWeb3.eth.Contract(OptionTokenContractJson.abi, this.option.address);

      // redeem option transaction
      await optionContract.methods.redeem(
        component.getActiveAccount
      ).send({
        from: component.getActiveAccount,
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("You have successfully redeemed your expired option. It may take 10 seconds or more for values to update.");

          // refresh values
          component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
          component.$store.dispatch("optionsExchange/fetchUserOptions");
          
        } else {
          component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
        }
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the DeFi Options support.");
      });
    },

    async sellOption() {
      let component = this;
      component.loading = true;

      this.setSellData(component.option); // fetch price again to avoid errors 

      let optionSizeWei = component.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether");
      let optionUnitPrice = component.getWeb3.utils.toWei(String(component.selectedOptionPrice), "ether");

      let sigDeadline = Math.floor(new Date().getTime()/1000) + (3600 * 1); // valid for 1 hour

      // allowance through permit()
      const result = await signERC2612Permit(
        window.ethereum, 
        component.option.address, // option token address
        component.getActiveAccount, // option owner
        component.getLiquidityPoolAddress, // spender
        optionSizeWei, // value: the amount of option tokens that user decided to sell
        sigDeadline // deadline/expiry for the signature
      );

      // sell option transaction
      await component.getLiquidityPoolContract.methods.sell(
        component.option.symbol, // symbol
        optionUnitPrice, // price per one option
        optionSizeWei, // volume a.k.a. user's selected option size
        result.deadline,
        result.v,
        result.r,
        result.s
      ).send({
        from: component.getActiveAccount
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("You have successfully sold an option. Please reload the website to refresh values.");

          // reduce the amount of options user can sell
          // needs to be reduced manually, because Polygon nodes have a lag
          // BigNumber needs to be used to avoid precision errors
          let bnHolding = component.getWeb3.utils.toBN(component.getWeb3.utils.toWei(String(component.option.holding), "ether"));
          let bnSold = component.getWeb3.utils.toBN(component.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether"));
          component.option.holding = component.getWeb3.utils.fromWei(bnHolding.sub(bnSold), "ether").toString();
        } else {
          component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
        }
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the DeFi Options support.");
      });

    },

    async setSellData() {
      const result = await this.getLiquidityPoolContract.methods.querySell(this.option.symbol).call();

      if (result) {
        this.selectedOptionPrice = this.getWeb3.utils.fromWei(String(result.price), "ether");
        this.selectedOptionVolume = this.getWeb3.utils.fromWei(String(result.volume), "ether");

        if (!this.selectedOptionSize) {
          this.selectedOptionSize = this.getMaxOptionSize;
        }

        // hardcoded 1% slippage
        this.selectedOptionPrice -= Number(this.selectedOptionPrice) * 0.01;
      }
    },

    toggleSellForm() {
      if (this.showSellForm) {
        this.showSellForm = false;
      } else {
        this.setSellData();
        this.showSellForm = true;
      }
    },

    showInfo() {
      // enable tooltip
      var infoEl = document.getElementById('infoEl')
      var tooltip = new window.bootstrap.Tooltip(infoEl)
      tooltip.show();
    }
  }
  
}
</script>

<style>
.data-item {
  margin-right: 5px;
}

.div-flex {
  display: flex;
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

.sell-text {
  color: white;
  font-weight: 400;
  font-size: 12px;
}

.section-small {
  margin-top: 16px;
}

/* Mobile screens */
@media screen and (max-width: 600px) {
  .data-time {
    margin-right: 0px;
  }

  .div-flex {
    display: block;
  }
}
</style>