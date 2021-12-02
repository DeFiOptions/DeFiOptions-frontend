<template>
  <div>
    <h3>Deposit funds</h3>

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
            class="btn btn-success btn-user btn-block text-uppercase form-control" 
            data-bs-toggle="modal" data-bs-target="#depositModal"
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
    
      <!-- Deposit Confirmation Modal -->
      <div class="modal fade" id="depositModal" tabindex="-1" aria-labelledby="depositModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="depositModalLabel">Deposit Confirmation</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              By making a deposit you confirm being aware that:

              <ul>
                <li>Deposits are held by the liquidity pool until its maturity date ({{getLiquidityPoolMaturityDate}}).</li>
                <li>Depositors receive pool tokens proportionally to the amount of funds deposited</li>
                <li>Upon maturity, each depositor is able to redeem their share of the pool's stablecoin balance free of any charge.</li>
                <li>Early withdrawal of funds is possible, but the Early Withdrawal Fee of {{getLiquidityPoolWithdrawalFee}}% is charged in that case.</li>
                <li>The Early Withdrawal Fee can be changed at any time by the DeFi Options DAO.</li>
                <li>
                  Depositors should be aware of the 
                  <a href="https://docs.defioptions.org/knowledge-base/risk-factors" target="_blank">risk factors</a> 
                  related to options trading.
                </li>
              </ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cancel</button>
              <button @click="depositIntoPool" type="button" class="btn btn-success" data-bs-dismiss="modal">Deposit</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: 'LpDeposit',
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getLiquidityPoolAddress", 
                                    "getLiquidityPoolWithdrawalFee", "getLiquidityPoolMaturityDate"]),
    ...mapGetters("dai", ["getUserDaiBalance", "getDaiContract", "getLpDaiAllowance"]),
    ...mapGetters("usdc", ["getUserUsdcBalance", "getUsdcContract", "getLpUsdcAllowance"]),

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
        return Number(this.depositValue) <= Number(this.getLpDaiAllowance);
      } else if (this.selectedToken === "USDC") {
        return Number(this.depositValue) <= Number(this.getLpUsdcAllowance);
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
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("dai/fetchLpAllowance");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("usdc/fetchLpAllowance");
  },
  data() {
    return {
      depositValue: null,
      loading: false,
      selectedToken: "DAI"
    }
  },
  methods: {
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
      await component.getStablecoinContract.methods.approve(component.getLiquidityPoolAddress, tokensWei).send({
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
            component.$store.state.dai.lpAllowance = allowanceValue;
          } else if (component.selectedToken === "USDC") {
            // needs to be updated this way because Polygon RPC nodes are slow with updating state
            component.$store.state.usdc.lpAllowance = allowanceValue;
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
    async depositIntoPool() {
      let component = this;
      component.loading = true;

      let unit = "ether"; // DAI
      if (component.selectedToken === "USDC") {
        unit = "mwei"; // USDC
      }

      let tokensWei = component.getWeb3.utils.toWei(component.depositValue, unit);

      // make a deposit
      await component.getLiquidityPoolContract.methods.depositTokens(
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

          component.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
          component.$store.dispatch("liquidityPool/fetchUserBalance");
          component.$store.dispatch("liquidityPool/fetchUserPoolUsdValue");

          // refresh values
          if (component.selectedToken === "DAI") {
            component.$store.dispatch("dai/fetchUserBalance");
            component.$store.dispatch("dai/fetchLpAllowance");
          } else if (component.selectedToken === "USDC") {
            component.$store.dispatch("usdc/fetchUserBalance");
            component.$store.dispatch("usdc/fetchLpAllowance");
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
 
    }
  }
}
</script>

<style>
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