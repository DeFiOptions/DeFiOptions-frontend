<template>
  <div class="section-big row mt-4 mx-3">
    <div class="col-md-3">
      <LpData />
    </div>

    <div class="col-md-9">
      <h3>Deposit funds</h3>

      <div class="section-small d-flex">
        <div>
          <input type="text" v-model="depositValue" class="form-control withdraw-input" placeholder="0.0" aria-describedby="depositText">
          <div id="depositText" class="form-text">
            Balance: $0.0000000
            <a href="#" class="deposit-max-text" @click="depositValue=1234567890">(max)</a>
          </div>
        </div>

        <div>
          <button @click="depositBalance" class="btn btn-success btn-user btn-block text-uppercase form-control">Deposit</button>
          <div></div>
        </div>
        
      </div>
    </div>
    


    <br />
    <br />
    <br />
    <br />

    <div class="col-xl-6">
        <div class="card o-hidden border-0 shadow-lg">
            <div class="card-body p-0">
                <div class="p-5">
                  <div class="text-center">
                      <h2 class="h4 text-gray-900 mb-2">Deposit funds in the liquidity pool</h2>
                  </div>

                  <form @submit.prevent="depositIntoPool" class="mt-3">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{selectedToken}}</button>
                        <div class="dropdown-menu dropdown-menu-left">
                          <a class="dropdown-item" @click="changeStablecoin('DAI')" href="#">DAI</a>
                          <a class="dropdown-item" @click="changeStablecoin('USDC')" href="#">USDC</a>
                        </div>
                      </div>
                      <input type="text" class="form-control" v-model="depositValue" :class="isDepositValueNotValid.status ? 'is-invalid' : ''" placeholder="0.0">
                      <small v-if="isDepositValueNotValid.status" class="invalid-feedback ml-1">
                        {{ isDepositValueNotValid.message }} 
                        <span v-if="(Math.floor(Number(this.getUserStablecoinBalance*1000))/1000) > 0">
                          Try <a href="#" @click="depositValue = String(Math.floor(Number(getUserStablecoinBalance*1000))/1000)">
                            {{ Math.floor(Number(this.getUserStablecoinBalance*1000))/1000 }}
                          </a> {{selectedToken}}.
                        </span>
                      </small>
                    </div>

                    <small v-if="!isDepositValueNotValid.status">
                      Your {{selectedToken}} balance: 
                      <a href="#" @click="depositValue = String(Math.floor(Number(getUserStablecoinBalance*1000))/1000)">
                        {{ Math.floor(Number(this.getUserStablecoinBalance*1000))/1000 }}
                      </a> {{selectedToken}}.
                    </small>

                    <div class="mt-2">
                      <button :disabled="depositValue == null || Number(depositValue) == 0" class="btn btn-primary btn-block">
                        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Deposit {{depositValue}} {{selectedToken}}
                      </button>
                    </div>
                    
                    <span>
                      <small>
                        (You will need to confirm two actions in MetaMask: Sign + Confirm transaction.)
                      </small>
                    </span>
                  </form>
              </div>
            </div>
        </div>
    </div>
    
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { signERC2612Permit } from 'eth-permit';
import LpData from '../components/invest/LpData.vue';

export default {
  name: 'Invest',
  components: { 
    LpData
  },
  computed: {
    ...mapGetters("accounts", ["getChainName", "isUserConnected", "getActiveAccount", "getWeb3"]),
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth"]),
    ...mapGetters("optionsExchange", ["getLiquidityPoolBalance"]),
    ...mapGetters("liquidityPool", ["getApy", "getLiquidityPoolContract", "getLiquidityPoolAddress", "getLiquidityPoolUserBalance", "getUserPoolUsdValue"]),
    ...mapGetters("dai", ["getDaiAddress", "getUserDaiBalance", "getDaiContract"]),
    ...mapGetters("usdc", ["getUsdcAddress", "getUserUsdcBalance", "getUsdcContract"]),

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

      // deposit value than balance
      if (Number(this.depositValue) > Number(this.getUserStablecoinBalance)) {
        return {status: true, message: "Your " + this.selectedToken + " balance is too low."};
      }

      return {status: false, message: "Valid deposit value"};
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
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("dai/fetchContract");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("dai/storeAddress");
    this.$store.dispatch("usdc/fetchContract");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("usdc/storeAddress");
    this.$store.dispatch("liquidityPool/fetchUserBalance");
    this.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
    this.$store.dispatch("liquidityPool/fetchApy");
    this.$store.dispatch("liquidityPool/storeAddress");
    this.$store.dispatch("liquidityPool/fetchUserPoolUsdValue");
  },
  data() {
    return {
      depositValue: 1,
      loading: false,
      selectedToken: "DAI"
    }
  },
  methods: {
    changeStablecoin(token) {
      this.selectedToken = token;
    },
    async depositIntoPool() {
      let component = this;

      let unit = "ether"; // DAI
      if (component.selectedToken === "USDC") {
        unit = "mwei"; // USDC
      }

      let tokensWei = component.getWeb3.utils.toWei(component.depositValue, unit);

      const result = await signERC2612Permit(
        window.ethereum, 
        component.getStablecoinContract._address, 
        component.getActiveAccount, 
        component.getLiquidityPoolAddress, 
        tokensWei
      );

      // make a deposit
      try {
        await component.getLiquidityPoolContract.methods.depositTokens(
          component.getActiveAccount, 
          component.getStablecoinContract._address, 
          tokensWei,
          result.deadline,
          result.v,
          result.r,
          result.s
        ).send({
          from: component.getActiveAccount
        }, function(error, hash) {
          component.loading = true;

          // Deposit tx error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
            component.loading = false;
          }

          // Deposit transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Deposit transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the Transfer event
            component.getStablecoinContract.once("Transfer", {
              filter: { owner: component.getActiveAccount }
            }, function(error, event) {
              component.loading = false;
              
              // failed transaction
              if (error) {
                component.$toast.error("The Deposit transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("Your deposit was successfull.");

                // refresh values
                if (component.selectedToken === "DAI") {
                  component.$store.dispatch("dai/fetchUserBalance");
                } else if (component.selectedToken === "USDC") {
                  component.$store.dispatch("usdc/fetchUserBalance");
                }
                
                component.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
                component.$store.dispatch("liquidityPool/fetchUserBalance");
                component.depositValue = null;
              }
            });
          }
        });
      } catch (e) {
          window.console.log("Error:", e);
          component.$toast.error("The transaction has been reverted. Please try again or contact project admins.");
          component.loading = false;
      }
 
    }
  }
}
</script>
