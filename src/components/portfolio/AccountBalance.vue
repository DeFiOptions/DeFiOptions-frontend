<template>
  <div class="section-big row mt-4 mx-3">
    <div class="col-md-3">
      <h3>Account balance</h3>

      <Card 
        cardClass="card-green" 
        title="Your balance" 
        :text="'$'+exchangeBalance.toFixed(2)" 
        info="Your exchange balance in USD, deposited in the options exchange, which you can withdraw at any time free of charge, use to purchase options from the liquidity pool, or provide as collateral for writing options."
      />

      <Card 
        cardClass="card-blue" 
        title="Credit tokens" 
        :text="creditTokens" class="mb-3" 
        info="Your Credit Tokens balance, which accrues interest over time and is redeemable for stablecoins at a 1:1 value conversion ratio in the options exchange as long as there's enough stablecoin supply available."
      />

      <Card 
        cardClass="card-blueblue" 
        title="Collateral Surplus" 
        :text="'$'+collateralSurplus" class="mb-3" 
        info="How much your exchange balance is exceeding collateral requirements for all options positons. If this reaches $0 and you are naked short any positions, you are at risk of being liquidated."
      />
    </div>

    <div class="col-md-9">
      <h3>
        Withdraw
        <i 
          class="fas fa-info-circle" 
          data-bs-toggle="tooltip" 
          data-bs-placement="bottom" 
          title="Withdraw stablecoins from your DeFi Options account balance to your Polygon account. Important: you may recieve multiple types of stablecoins (DAI, USDC etc.), not just one."
        ></i>
      </h3>

      <div class="section-small d-flex flex-wrap">
        <div>
          <input type="text" v-model="withdrawValue" class="form-control withdraw-input" placeholder="0.0" aria-describedby="withdrawText">
          <div id="withdrawText" class="form-text">
            Balance: ${{ exchangeBalance.toFixed(2) }}
            <a href="#" class="withdraw-max-text" @click="withdrawValue=String(Math.floor(exchangeBalance*100000)/100000)">(max)</a>
          </div>
        </div>

        <div class="form-button-mobile">
          <button @click="withdrawBalance" class="btn btn-success btn-user btn-block text-uppercase form-control">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Withdraw
          </button>
          <div></div>
        </div>
        
      </div>

      <br>

      <h3>Deposit Into Exchange</h3>

      <div class="section-small">
        <div class="d-flex flex-wrap">
          <div>
            <input type="text" v-model="depositValue" class="form-control deposit-input" placeholder="0.0" aria-describedby="depositText">
          </div>

          <div class="token-dropdown form-button-mobile">
            <div class="btn-group" aria-describedby="button-text">
              <button type="button" class="btn btn-outline-success dropdown-toggle text-uppercase" data-bs-toggle="dropdown" aria-expanded="false">
                {{selectedToken}}
              </button>
              <ul class="dropdown-menu">
                <li>
                  <span class="dropdown-item text-uppercase" @click="changeStablecoin('DAI')">DAI</span>
                  <span class="dropdown-item text-uppercase" @click="changeStablecoin('USDC')">USDC</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="deposit-button form-button-mobile" v-if="isEnoughAllowance">
            <button 
              class="btn btn-success btn-user btn-block text-uppercase form-control" @click="depositIntoExchange"
              :disabled="isDepositValueNotValid.status || Number(this.depositValue) === 0"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Deposit
            </button>
            <div></div>
          </div>

          <div class="deposit-button form-button-mobile" v-if="!isEnoughAllowance">
            <button 
              class="btn btn-success btn-user btn-block text-uppercase form-control" 
              :disabled="isDepositValueNotValid.status || Number(this.depositValue) === 0" 
              @click="approveAllowance"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Approve
            </button>
            <div></div>
          </div>
          
        </div>

        <!-- Help text -->
        <div class="help-text" v-if="isDepositValueNotValid.status">
          {{ isDepositValueNotValid.message }} 
          <span v-if="(Math.floor(Number(this.getUserStablecoinBalance*1000))/1000) > 0">
            Try <a href="#" @click="depositValue = String(Math.floor(Number(getUserStablecoinBalance*1000))/1000)">
              {{ Math.floor(Number(this.getUserStablecoinBalance*1000))/1000 }}
            </a> {{selectedToken}}.
          </span>
        </div>

        <div class="help-text" v-if="!isDepositValueNotValid.status">
          Your {{selectedToken}} balance: 
          <a href="#" @click="depositValue = String(Math.floor(Number(getUserStablecoinBalance*1000))/1000)">
            {{ Math.floor(Number(this.getUserStablecoinBalance*1000))/1000 }}
          </a> {{selectedToken}}.
        </div>
    
      </div>

      <br>

      <h3>
        Force Reset Cached Collateral Requriements
        <i 
          class="fas fa-info-circle" 
          data-bs-toggle="tooltip" 
          data-bs-placement="bottom" 
          title="Occasionally, collateral requirmements cached within the smart contracts will become out of date with the volitility of the underlying when writing, so if you run into issues with writing you may try to force reset the contracts collateral requirements to match the live calculation."
        ></i>
      </h3>

      <div class="section-small d-flex flex-wrap">
        <div class="form-button-mobile">
          <button @click="setCollateral" class="btn btn-success btn-user btn-block text-uppercase form-control">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Reset
          </button>
          <div></div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Card from '../Card.vue';

export default {
  components: { Card },
  name: "AccountBalance",
  props: ["exchangeBalance", "creditTokens", "collateralSurplus"],

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("optionsExchange", ["getOptionsExchangeAddress", "getOptionsExchangeContract", "getUserExchangeBalanceAllowance"]), 
     ...mapGetters("dai", ["getUserDaiBalance", "getDaiContract", "getExchangeDaiAllowance"]),
    ...mapGetters("usdc", ["getUsdcAddress", "getUserUsdcBalance", "getUsdcContract", "getExchangeUsdcAllowance"]),

    isDepositValueNotValid() { // validation for deposit value
      // too many digits
      if (String(this.depositValue).length > 14) {
        return {status: true, message: "Please reduce the number of digits."};
      }

      // negative number
      if (Number(this.depositValue) < 0) {
        return {status: true, message: "Deposit value must not be negative!"};
      }

      // not a number
      if (isNaN(this.depositValue)) {
        return {status: true, message: "Please enter a number."};
      }

      // deposit value bigger than balance
      if (Number(this.depositValue) > Number(this.getUserStablecoinBalance)) {
        return {status: true, message: "Your " + this.selectedToken + " balance is too low."};
      }

      return {status: false, message: "Valid deposit value"};
    },
    isEnoughAllowance() {
      if (this.selectedToken === "DAI") {
        return Number(this.depositValue) <= Number(this.getExchangeDaiAllowance);
      } else if (this.selectedToken === "USDC") {
        return Number(this.depositValue) <= Number(this.getExchangeUsdcAllowance);
      }

      return false;
    },
    getStablecoinContract() {
      if (this.selectedToken === "DAI") {
        return this.getDaiContract;
      } else if (this.selectedToken === "USDC") {
        return this.getUsdcContract;
      }

      return null;
    },
    getUserStablecoinBalance() {
      if (this.selectedToken === "DAI") {
        return this.getUserDaiBalance;
      } else if (this.selectedToken === "USDC") {
        return this.getUserUsdcBalance;
      }

      return null;
    },
  },

  created() {
    this.$store.dispatch("creditToken/fetchUserBalance");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("dai/fetchExchangeAllowance");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("usdc/fetchExchangeAllowance");
  },

  data() {
    return {
      depositValue: null,
      selectedToken: "DAI",
      withdrawValue: null,
      loading: false
    }
  },

  methods: {
    async withdrawBalance() {
      let component = this;
      component.loading = true;

      let tokensWei = this.getWeb3.utils.toWei(this.withdrawValue, "ether");

      await this.getOptionsExchangeContract.methods.withdrawTokens(tokensWei).send({
        from: this.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("Your withdrawal was successfull. It may take 10s or more for values to update.");

          // refresh values
          component.$store.dispatch("dai/fetchUserBalance"); // refresh the user's dai balance
          component.$store.dispatch("usdc/fetchUserBalance"); // refresh the user's usdc balance
          component.$store.dispatch("creditToken/fetchUserBalance"); // refresh the user's credit token balance
          component.withdrawValue = null;

          component.withdrawAmount = null;
          
        } else {
          component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
        }

        // Refresh the exchange balance no matter if the tx was successful or not
        component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the DeFi Options support.");
      });
    },
    async approveAllowance() {
      let component = this;
      component.loading = true;

      // define unit and token contract
      let unit = "ether"; // DAI - 18 decimals
      
      if (component.selectedToken === "USDT") {
        unit = "kwei"; // USDT (Tether) - 4 decimals
      }

      if (component.selectedToken === "USDC") {
        unit = "mwei"; // USDC - 6 decimals
      }

      // convert deposit value to wei
      let tokensWei = component.getWeb3.utils.toWei(component.depositValue, unit);
      const allowanceValue = component.depositValue;

      // call the approve method
      await component.getStablecoinContract.methods.approve(component.getOptionsExchangeAddress, tokensWei).send({
        from: component.getActiveAccount

      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("The approval was successfull. You can make the deposit now.");

          // refresh values
          if (component.selectedToken === "DAI") {
            // needs to be updated this way because Polygon RPC nodes are slow with updating state
            component.$store.state.dai.exchangeAllowance = allowanceValue;
          } else if (component.selectedToken === "USDC") {
            // needs to be updated this way because Polygon RPC nodes are slow with updating state
            component.$store.state.usdc.exchangeAllowance = allowanceValue;
          }
          
          
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
    changeStablecoin(token) {
      this.selectedToken = token;
    },
    async depositIntoExchange() {
      let component = this;
      component.loading = true;

      let unit = "ether"; // DAI
      if (component.selectedToken === "USDC") {
        unit = "mwei"; // USDC
      }

      let tokensWei = component.getWeb3.utils.toWei(component.depositValue, unit);

      // make a deposit
      await component.getOptionsExchangeContract.methods.depositTokens(
        component.getActiveAccount, 
        component.getStablecoinContract._address, 
        tokensWei
      ).send({
        from: component.getActiveAccount
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("Your deposit was successfull.");

          // refresh values
          if (component.selectedToken === "DAI") {
            component.$store.dispatch("dai/fetchUserBalance");
            component.$store.dispatch("dai/fetchExchangeAllowance");
          } else if (component.selectedToken === "USDC") {
            component.$store.dispatch("usdc/fetchUserBalance");
            component.$store.dispatch("usdc/fetchExchangeAllowance");
          }
          
          component.depositValue = null;
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
    async setCollateral() {
      let component = this;
      component.loading = true;

      // set transaction
      await component.getOptionsExchangeContract.methods.setCollateral(
        component.getActiveAccount
      ).send({
        from: component.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("You have reset your collateral requirements on-chain.");

          // hide the option manually, because Polygon's nodes have a lag
          component.hide = true;
          
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
  }
}
</script>

<style scoped>
  .section-small {
    margin-top: 16px;
  }

  .withdraw-input {
    max-width: 200px;
    margin-right: 10px;
  }

  #withdrawText {
    color: white;
    font-weight: 400;
    font-size: 12px;
  }

  .deposit-button, .token-dropdown {
    margin-left: 10px;
  }

  .help-text {
    margin-top: .25rem;
    font-size: .775em;
    color: #ffffff;
  }

  /* Mobile screens */
  @media screen and (max-width: 600px) {
    .deposit-button, .token-dropdown {
      margin-left: 0px;
    }
  }

</style>