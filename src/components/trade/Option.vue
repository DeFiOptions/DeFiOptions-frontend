<template>

<div class="section-small">

  <div class="d-flex justify-content-between flex-wrap">

    <!-- Option data -->
    <div class="div-flex justify-content-center flex-wrap">
      <OptionDataItem class="data-item" title="Strike" :data="'$' + option.strike" :divider="true" />
      <OptionDataItem class="data-item" title="Break even" :data="getBreakEvenPrice" :divider="true" />
      <OptionDataItem class="data-item" title="Price" :green="true" :data="optionPriceFormatted" />
    </div>

    <!-- Action button -->
    <div>
      <button @click="toggleForm" class="btn btn-success" v-if="!showForm">
        Buy
        <i class="fas fa-chevron-down"></i>
        <i class="fas fa-chevron-up" v-if="showForm"></i>
      </button>

      <button @click="toggleForm" class="btn btn-outline-success" v-if="showForm">
        Close
        <i class="fas fa-chevron-up"></i>
      </button>

      <span></span>
    </div>
  </div>

  <!-- Buy option form -->
  <div v-if="showForm" class="show-form">
    <h3>Option size</h3>

    <div class="d-flex flex-wrap">
      <div>
        <input type="text" v-model="selectedOptionSize" class="form-control show-input" placeholder="0.0" aria-describedby="show-text">
        <div class="show-text form-text" v-if="!isOptionSizeNotValid.status">
          Maximum option size to buy: <span class="max-buy" @click="selectedOptionSize = getMaxOptionSize">{{getMaxOptionSize}}</span>
          <span v-if="Number(this.option.holding) > Number(getMaxOptionSize)"> 
            (Your total holding is bigger: {{this.option.holding}})
          </span>.
        </div>

        <div v-if="isOptionSizeNotValid.status" class="show-text form-text" >{{ isOptionSizeNotValid.message }}</div>
      </div>

      <div class="form-button-mobile">
        <div class="btn-group" aria-describedby="button-text">
          <button type="button" class="btn btn-outline-success dropdown-toggle text-uppercase" data-bs-toggle="dropdown" aria-expanded="false">
            {{buyWith}}
          </button>
          <ul class="dropdown-menu">
            <li>
              <span class="dropdown-item text-uppercase" @click="setBuyWith('DAI')">DAI</span>
              <span class="dropdown-item text-uppercase" @click="setBuyWith('USDC')">USDC</span>
              <span class="dropdown-item text-uppercase" @click="setBuyWith('Exchange Balance')">Exchange Balance</span>
            </li>
          </ul>
        </div>

        <div class="show-text form-text">
          Balance: {{Number(getUserStablecoinBalance).toFixed(2)}} {{buyWith}}.
        </div>
      </div>
      
    </div>

    <div class="row mt-3">
      <button v-if="!allowanceNeeded" @click="buyOption" class="btn btn-success form-control" :disabled="isOptionSizeNotValid.status">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Buy for ${{getTotal.toFixed(2)}}
      </button>

      <button v-if="allowanceNeeded" @click="approveAllowance" class="btn btn-success form-control" :disabled="isOptionSizeNotValid.status">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Approve {{buyWith}} for ${{getTotal.toFixed(2)}}
      </button>

      <small v-if="allowanceNeeded" class="show-text form-text text-center">
        You'll need to make 2 transactions: approve & buy.
      </small>
    </div>
  </div>
  
</div>
  
</template>

<script>
import { mapGetters } from "vuex";
import { signERC2612Permit } from 'eth-permit';
import OptionDataItem from '../OptionDataItem.vue';
//import OptionTokenContractJson from "../../contracts/RedeemableToken.json";

export default {
  name: "Option",
  props: ["option"],
  data() {
    return {
      buyWith: "DAI",
      loading: false,
      optionPrice: null,
      optionPriceFormatted: "loading",
      selectedOptionSize: 0.1,
      selectedOptionVolume: null,
      showForm: false,
      tooLowVolume: false
    }
  },

  components: { 
    OptionDataItem 
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getLiquidityPoolAddress"]),
    ...mapGetters("dai", ["getDaiAddress", "getUserDaiBalance", "getDaiContract"]),
    ...mapGetters("optionsExchange", ["getOptionsExchangeAddress", "getOptionsExchangeContract", "getExchangeUserBalance", "getUserExchangeBalanceAllowance"]),
    ...mapGetters("usdc", ["getUsdcAddress", "getUserUsdcBalance", "getUsdcContract"]),

    allowanceNeeded() {
      if (this.buyWith === "DAI") {
        return false; // allowance tx not needed due to permit()

      } else if (this.buyWith === "USDC") {
        return false; // allowance tx not needed due to permit()

      } else if (this.buyWith === "USDT") { // Tether
        return true;

      } else if (this.buyWith === "Exchange Balance") {
        if (this.getUserExchangeBalanceAllowance < this.getTotal) {
          return true;
        } else {
          return false;
        }
      } 

      return false;
    },

    getBreakEvenPrice() {
      if (this.option.symbol.includes("EC")) { // CALL
        return "$" + Number(Number(this.optionPrice)+Number(this.option.strike)).toFixed(2);
      } else if (this.option.symbol.includes("EP")) { // PUT
        return "$" + Number(Number(this.option.strike)-Number(this.optionPrice)).toFixed(2);
      }
      return null;
    },
    
    getMaxOptionSize() {
      // max option size that current user can buy
      let availableOptionVolume = Math.floor(Number(this.selectedOptionVolume*1000))/1000;
      let optionPrice = Number(this.optionPrice);
      let maxTotal = availableOptionVolume * optionPrice;
      let userBalance = Number(this.getUserStablecoinBalance);

      if (maxTotal > Number(this.getUserStablecoinBalance)) {
        return Math.floor(Number(userBalance / optionPrice * 1000))/1000;
      } else {
        return availableOptionVolume;
      }
    },

    getStablecoinAddress() {
      if (this.buyWith === "DAI") {
        return this.getDaiAddress;
      } else if (this.buyWith === "USDC") {
        return this.getUsdcAddress;
      } else if (this.buyWith === "Exchange Balance") {
        return this.getOptionsExchangeAddress;
      } 

      return null;
    },
    getTotal() {
      return Number(this.selectedOptionSize) * Number(this.optionPrice);
    },
    getUserStablecoinBalance() {
      if (this.buyWith === "DAI") {
        return this.getUserDaiBalance;
      } else if (this.buyWith === "USDC") {
        return this.getUserUsdcBalance;
      } else if (this.buyWith === "Exchange Balance") {
        return this.getExchangeUserBalance;
      }

      return null;
    },
    isOptionSizeNotValid() { // validation for option size
      // option size bigger than volume.
      if (Number(this.selectedOptionSize) > Number(this.selectedOptionVolume)) {
        return {status: true, message: "Must not be bigger than " + (Math.floor(Number(this.selectedOptionVolume*1000))/1000) + "!"};
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
        return {status: true, message: "Must not be empty or zero!"};
      }

      // total bigger than balance
      if (this.getTotal > Number(this.getUserStablecoinBalance)) {
        if (this.buyWith === "Exchange Balance") {
          return {status: true, message: "Your exchange balance is too low."};
        }

        return {status: true, message: "Your " + this.buyWith + " balance is too low."};
      }

      return {status: false, message: "Valid option size"};
    }
  },

  created() {
    this.getOptionPrice();
  },

  methods: {
    async approveAllowance() {
      let component = this;
      component.loading = true;

      // define unit and token contract
      let unit = "ether"; // Exchange Balance - 18 decimals
      let tokenContract = component.getOptionsExchangeContract; // Exchange Balance contract
      if (component.buyWith === "USDT") {
        unit = "kwei"; // USDT (Tether) - 4 decimals
        // TODO: tokenContract = ...; // USDT contract
      }

      // define allowance value
      const allowanceValue = component.getTotal * 1.01; // make it 1% bigger to avoid rounding errors
      const allowanceValueWei = component.getWeb3.utils.toWei(String(allowanceValue.toFixed(4)), unit); // round to 4 decimals

      // call the approve method
      try {
        await tokenContract.methods.approve(component.getLiquidityPoolAddress, allowanceValueWei).send({
          from: component.getActiveAccount
        }, function(error, hash) {
          // Approval tx error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
            component.loading = false;
          }

          // Approval transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Approval transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the Approval event
            component.getOptionsExchangeContract.once("Approval", {
              filter: { owner: component.getActiveAccount }
            }, function(error, event) {
              component.loading = false;
              
              // failed transaction
              if (error) {
                component.$toast.error("The Approval transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("The approval was successfull. Now you can buy the option.");

                component.$store.dispatch("optionsExchange/fetchExchangeBalanceAllowance");
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
    async buyOption() {
      let component = this;
      component.loading = true;

      let optionSizeWei = component.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether");
      let optionUnitPrice = component.getWeb3.utils.toWei(String(component.optionPrice), "ether");
      
      // define max buy value (and unit)
      let unit = "ether"; // DAI - 18 decimals
      if (component.buyWith === "USDC") {
        unit = "mwei"; // USDC - 6 decimals
      }

      let buyValue = component.getWeb3.utils.toWei(String(component.getTotal.toFixed(4)), unit); // round to 4 decimals

      let buyObj;

      if (component.buyWith === "Exchange Balance") {
        // buy with exchange balance (allowance needs to be given before)
        buyObj = component.getLiquidityPoolContract.methods.buy(
          this.option.symbol, // symbol
          optionUnitPrice, // price per one option
          optionSizeWei, // volume a.k.a. user's selected option size
          component.getStablecoinAddress, // selected stablecoin
        )
      } else {
        // buy with DAI or USDC - allowance through permit()
        try {
          let result = await signERC2612Permit(
            window.ethereum, 
            component.getStablecoinAddress, 
            component.getActiveAccount, 
            component.getLiquidityPoolAddress, 
            buyValue
          );

          buyObj = component.getLiquidityPoolContract.methods.buy(
            component.option.symbol, // symbol
            optionUnitPrice, // price per one option
            optionSizeWei, // volume a.k.a. user's selected option size
            component.getStablecoinAddress, // selected stablecoin
            buyValue, // buyValue
            result.deadline,
            result.v,
            result.r,
            result.s
          )
        } catch (e) {
          window.console.log("Error:", e);
          component.$toast.error("The signature has been rejected.");
          component.loading = false;
        } 
      }

      // buy option transaction
      try {
        await buyObj.send({
          from: component.getActiveAccount
        }, function(error, hash) {
          // Deposit tx error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
            component.loading = false;
          }

          // Deposit transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Buy transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the Transfer event
            component.getLiquidityPoolContract.once("Buy", {
              filter: { buyer: component.getActiveAccount }
            }, function(error, event) {
              component.loading = false;
              
              // failed transaction
              if (error) {
                component.$toast.error("The Buy transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("You have successfully bought an option.");

                // refresh values
                if (component.buyWith === "DAI") {
                  component.$store.dispatch("dai/fetchUserBalance");
                } else if (component.buyWith === "USDC") {
                  component.$store.dispatch("usdc/fetchUserBalance");
                } else if (component.buyWith === "Exchange Balance") {
                  component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
                }
                
                component.selectedOptionSize = 0.1;
                component.setFormData();
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

    async getOptionPrice() {
      // fetch option price
      let result = await this.getLiquidityPoolContract.methods.queryBuy(this.option.symbol).call();
      
      if (result) {
        this.optionPrice = this.getWeb3.utils.fromWei(result.price, "ether");
        this.optionPriceFormatted = "$" + Number(this.optionPrice).toFixed(2);
      }
    },

    setBuyWith(choice) {
      this.buyWith = choice;
    },

    async setFormData() {
      this.selectedOptionSize = 0.1;
      this.optionPrice = null;
      this.optionPriceFormatted = "loading";
      this.selectedOptionVolume = null;

      // fetch option price and volume
      let result = await this.getLiquidityPoolContract.methods.queryBuy(this.option.symbol).call();
      
      if (result) {
        this.optionPrice = this.getWeb3.utils.fromWei(result.price, "ether");
        this.optionPriceFormatted = "$" + Number(this.optionPrice).toFixed(2);
        this.selectedOptionVolume = this.getWeb3.utils.fromWei(result.volume, "ether");

        if (this.selectedOptionVolume < 0.001) {
          this.tooLowVolume = true;
        }
      }
      
    },

    toggleForm() {
      if (this.showForm) {
        this.showForm = false;
      } else {
        this.setFormData();
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

.div-flex {
  display: flex;
}

.fa-chevron-down, .fa-chevron-up {
  margin-left: 10px;
}

.max-buy {
  color: #5AFFB0;
  text-decoration: underline;
}

.max-buy:hover {
  color: #5AFFB0;
  text-decoration: none;
  cursor: pointer;
}

.show-form {
  margin-top: 24px;
}

.show-input {
  max-width: 200px;
  margin-right: 10px;
}

.show-text {
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