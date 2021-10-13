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
            {{Number(maxWithdrawalAmount).toFixed(2)}}
          </a>
        </span>
      </div>

      <div class="help-text" v-if="!isWithdrawAmountNotValid.status">
        Your LP balance:
        <a href="#" @click="withdrawAmount = String(getLiquidityPoolUserBalance)">
          {{Number(getLiquidityPoolUserBalance).toFixed(2)}}
        </a> tokens 
        (worth ${{Number(getUserPoolUsdValue).toFixed(2)}}).
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
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getLiquidityPoolUserBalance", 
                                    "getUserPoolUsdValue", "getLiquidityPoolFreeBalance"]),

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
      // TODO
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