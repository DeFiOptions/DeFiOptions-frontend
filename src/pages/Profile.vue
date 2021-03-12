<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Your profile</h1>
    </div>
    <!-- END Page Heading -->

    <div class="row">
      <div class="col-md-5 text-center">
        <div class="card">
          <div class="card-body">
            <Gravatar v-if="getActiveAccount" class="img-fluid" :email="getActiveAccount" default-img="robohash" :size=200 />

            <p>{{ getActiveAccount }}</p>
            <p><strong>Your ETH balance:</strong> {{ Number(getActiveBalanceEth).toFixed(4) }} ETH</p>
            <p><strong>Your Exchange balance:</strong> {{ Number(getExchangeUserBalance).toFixed(4) }} ???</p>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Gravatar from "vue-gravatar";

export default {
  name: 'Profile',
  components: {
    Gravatar
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth"]),
    ...mapGetters("optionsExchange", ["getExchangeUserBalance"]),
  },
  created() {
    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
  }
}
</script>
