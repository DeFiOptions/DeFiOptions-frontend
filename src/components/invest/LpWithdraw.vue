<template>
  <div class="mt-3">
    <h3>Withdraw funds</h3>

    <div class="section-small">

      <div class="d-flex flex-wrap">
        <div>
          <input type="text" v-model="withdrawAmount" class="form-control deposit-input" placeholder="0.0" aria-describedby="depositText">
        </div>

        <div class="withdraw-button form-button-mobile">
          <button @click="withdraw" class="btn btn-success btn-user btn-block text-uppercase form-control">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Withdraw
          </button>
          <div></div>
        </div>
      </div>

      <!-- Help text -->
      <div class="help-text" v-if="isWithdrawAmountNotValid.status">
        {{ isWithdrawAmountNotValid.message }} 
        <span>
          Try <a href="#" @click="withdrawAmount = String(maxWithdrawalAmount)">
            {{Number(maxWithdrawalAmount).toFixed(2)}}.
          </a>
        </span>
        An early withdrawal fee of {{getLiquidityPoolWithdrawalFee}}% will be taken.
      </div>

      <div class="help-text" v-if="!isWithdrawAmountNotValid.status">
        Your LP balance:
        <a href="#" @click="withdrawAmount = String(getLiquidityPoolUserBalance)">
          {{Number(getLiquidityPoolUserBalance).toFixed(2)}}
        </a> tokens 
        (worth ${{Number(getUserPoolUsdValue).toFixed(2)}}). 
        An early withdrawal fee of {{getLiquidityPoolWithdrawalFee}}% will be taken.
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "LpWithdraw",

  data() {
    return {
      loading: false,
      withdrawAmount: null
    }
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getLiquidityPoolUserBalance", 
                                    "getUserPoolUsdValue", "getLiquidityPoolFreeBalance",
                                    "getLiquidityPoolWithdrawalFee"]),

    isWithdrawAmountNotValid() { // validation for withdrawal amount
      // negative number
      if (Number(this.withdrawAmount) < 0) {
        return {status: true, message: "Amount must not be negative!"};
      }

      // cannot be bigger than pool's available/free balance
      if (Number(this.withdrawAmount) > Number(this.getLiquidityPoolFreeBalance)) {
        return {status: true, message: "Amount must not be bigger than pool's free balance (" + Number(this.getLiquidityPoolFreeBalance).toFixed(2) + " tokens)!"};
      }

      // cannot be bigger than LP balance
      if (Number(this.withdrawAmount) > Number(this.getLiquidityPoolUserBalance)) {
        return {status: true, message: "Amount must not be bigger than balance!"};
      }

      // not a number
      if (isNaN(this.withdrawAmount)) {
        return {status: true, message: "Please enter a number."};
      }

      return {status: false, message: "Valid withdrawal amount"};
    },
    maxWithdrawalAmount() {
      if (Number(this.getLiquidityPoolUserBalance) > Number(this.getLiquidityPoolFreeBalance)) {
        return this.getLiquidityPoolFreeBalance;
      }

      return this.getLiquidityPoolUserBalance;
    }
  },

  methods: {
    async withdraw() {
      let component = this;
      component.loading = true;

      const amountWei = component.getWeb3.utils.toWei(component.withdrawAmount, "ether");

      // make a withdrawal
      try {
        await component.getLiquidityPoolContract.methods.withdraw(amountWei).send({
          from: component.getActiveAccount
        }, function(error, hash) {
          // Withdrawal tx error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
            component.loading = false;
          }

          // Withdrawal transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Withdrawal transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the Transfer event
            component.getLiquidityPoolContract.once("Transfer", {
              filter: { owner: component.getActiveAccount }
            }, function(error, event) {
              component.loading = false;
              
              // failed transaction
              if (error) {
                component.$toast.error("The Withdrawal transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("Your withdrawal was successfull.");

                component.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
                component.$store.dispatch("liquidityPool/fetchUserBalance");
                component.$store.dispatch("liquidityPool/fetchUserPoolUsdValue");
                component.$store.dispatch("dai/fetchUserBalance");
                component.$store.dispatch("usdc/fetchUserBalance");

                component.withdrawAmount = null;
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

<style>
.withdraw-button {
  margin-left: 10px;
}

.help-text {
  margin-top: .25rem;
  font-size: .775em;
  color: #ffffff;
}

/* Mobile screens */
@media screen and (max-width: 600px) {
  .withdraw-button {
    margin-left: 0px;
  }
}
</style>