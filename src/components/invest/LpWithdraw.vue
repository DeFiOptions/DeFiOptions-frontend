<template>
  <div class="mt-3">
    <h3>
      Withdraw funds
      <i 
        class="fas fa-info-circle" 
        data-bs-toggle="tooltip" 
        data-bs-placement="bottom" 
        title="Withdrawing funds from the pool means increasing your portfolio account balance. It does NOT 
        mean you receive stablecoins. If you want to receive stablecoins, you need to go to 
        the Portfolio page and withdraw from there, too."
      ></i>
    </h3>

    <div class="section-small">

      <p class="text-white">
        Withdraw funds from the pool to your Portfolio account balance:
      </p>

      <div class="d-flex flex-wrap">
        <div>
          <input type="text" v-model="withdrawAmount" class="form-control deposit-input" placeholder="0.0" aria-describedby="depositText">
        </div>

        <div class="withdraw-button form-button-mobile">
          <button 
            @click="withdraw" 
            class="btn btn-success btn-user btn-block text-uppercase form-control"
            :disabled="isWithdrawAmountNotValid.status || Number(this.withdrawAmount) === 0"
          >
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

  created() {
    this.$store.dispatch("liquidityPool/fetchUserPoolUsdValue");
    this.$store.dispatch("liquidityPool/fetchPoolFreeBalance");
    this.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
    this.$store.dispatch("liquidityPool/fetchUserBalance");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("usdc/fetchUserBalance");
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
      await component.getLiquidityPoolContract.methods.withdraw(amountWei).send({
        from: component.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("Your withdrawal was successfull. It may take 10 seconds or more for values to update.");

          // refresh values
          component.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
          component.$store.dispatch("liquidityPool/fetchUserBalance");
          component.$store.dispatch("liquidityPool/fetchUserPoolUsdValue");
          component.$store.dispatch("dai/fetchUserBalance");
          component.$store.dispatch("usdc/fetchUserBalance");
          component.$store.dispatch("liquidityPool/fetchPoolFreeBalance");

          component.withdrawAmount = null;
          
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