<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Invest in the liquidity pool</h1>
    </div>
    <!-- END Page Heading -->

    <div class="row">

      <!-- Pool balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                              Pool balance
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold text-gray-800">
                            ${{ Number(getLiquidityPoolBalance).toFixed(2) }}
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- APY -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                              Yield (Since start)</div>
                          <div class="h5 mb-0 font-weight-bold text-gray-800">{{Number(getApy).toFixed(2)}}%</div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-percent fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>

    <div class="col-xl-6">
        <div class="card o-hidden border-0 shadow-lg">
            <div class="card-body p-0">
                <div class="p-5">
                  <div class="text-center">
                      <h2 class="h4 text-gray-900 mb-2">Deposit funds in the liquidity pool</h2>
                  </div>

                  <form @submit.prevent="depositIntoPool" class="mt-3">
                      <div class="form-group">
                          <input type="text" v-model="depositValue" class="form-control form-control-user"
                              placeholder="Enter the amount to deposit">
                          
                          <small>
                            Your DAI balance: {{ Number(getUserDaiBalance).toFixed(2) }} DAI
                            (allowance: 
                            <span v-if="allowance > 100000000000">unlimited)</span>
                            <span v-if="allowance < 100000000000">{{Number(allowance).toFixed(2)}} DAI)</span>
                          </small>
                      </div>

                      <div v-if="Number(allowance) < Number(depositValue)" class="mb-3">
                        <div class="form-check">
                          <input class="form-check-input" v-model="allowanceOption" type="radio" id="limitedApprovalChoice" value="limited" checked>
                          <label class="form-check-label" for="limitedApprovalChoice">
                            Approval for {{depositValue}} DAI.
                          </label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" v-model="allowanceOption" type="radio" id="unlimitedApprovalChoice" value="unlimited">
                          <label class="form-check-label" for="unlimitedApprovalChoice">
                            Unlimited approval (you won't need to do approval transactions anymore).
                          </label>
                        </div>
                      </div>

                      <button v-if="Number(allowance) < Number(depositValue)" class="btn btn-success btn-block">Approve DAI</button>
                      <button v-if="Number(allowance) >= Number(depositValue)" :disabled="depositValue == null || Number(depositValue) == 0" class="btn btn-primary btn-block">Deposit DAI</button>

                      <span v-if="Number(allowance) < Number(depositValue)">
                        <small>
                          (Two transactions are needed: 1. Approval, 2. Deposit)
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

export default {
  name: 'Invest',
  components: {
    
  },
  computed: {
    ...mapGetters("accounts", ["getChainName", "isUserConnected", "getActiveAccount", "getWeb3"]),
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth"]),
    ...mapGetters("optionsExchange", ["getLiquidityPoolBalance"]),
    ...mapGetters("liquidityPool", ["getApy", "getLiquidityPoolContract", "getLiquidityPoolAddress"]),
    ...mapGetters("dai", ["getDaiAddress", "getUserDaiBalance", "getDaiContract"])
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
    this.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
    this.$store.dispatch("liquidityPool/fetchApy");
    this.$store.dispatch("liquidityPool/storeAddress");

    this.checkDaiAllowance();
  },
  data() {
    return {
      depositValue: null,
      allowanceWei: null,
      allowance: null,
      allowanceOption: "limited"
    }
  },
  methods: {
    async checkDaiAllowance() {
      // check current allowance size
      this.allowanceWei = await this.getDaiContract.methods.allowance(this.getActiveAccount, this.getLiquidityPoolAddress).call();
      this.allowance = this.getWeb3.utils.fromWei(this.allowanceWei, "ether");
    },
    async depositIntoPool() {
      let component = this;
      let tokensWei = this.getWeb3.utils.toWei(this.depositValue, "ether");

      if (Number(this.allowanceWei) < Number(tokensWei)) {
        let approvalValue = tokensWei;
        if (this.allowanceOption === "unlimited") {
          approvalValue = "1000000000000000000000000000000000"; // "unlimited" value
        }

        // call the approve method to increase the allowance
        await this.getDaiContract.methods.approve(this.getLiquidityPoolAddress, approvalValue).send({
          from: this.getActiveAccount
        }, function(error, hash) {

          // Approval tx error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
          }

          // Approval transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Approval transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the Approval event
            component.getDaiContract.once("Approval", {
              filter: { owner: component.getActiveAccount }
            }, function(error, event) {
              // failed transaction
              if (error) {
                component.$toast.error("The Approval transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("Approval was successful. Please make a deposit now.");

                // refresh values
                component.checkDaiAllowance();
                component.$store.dispatch("dai/fetchUserBalance"); // refresh the user's DAI balance
              }
            });
          }
        });

      } else {
        // make a deposit
        await this.getLiquidityPoolContract.methods.depositTokens(this.getActiveAccount, this.getDaiAddress, tokensWei).send({
          from: this.getActiveAccount
        }, function(error, hash) {
          // Deposit tx error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
          }

          // Deposit transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Deposit transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the Transfer event
            component.getDaiContract.once("Transfer", {
              filter: { owner: component.getActiveAccount }
            }, function(error, event) {
              // failed transaction
              if (error) {
                component.$toast.error("The Deposit transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("Your deposit was successfull.");

                // refresh values
                component.checkDaiAllowance();
                component.$store.dispatch("dai/fetchUserBalance");
                component.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
              }
            });
          }
        });
      }
    }
  }
}
</script>
