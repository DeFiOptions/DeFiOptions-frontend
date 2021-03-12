<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Welcome to DeFiOptions</h1>
    </div>
    <!-- END Page Heading -->

    <p>Lorem ipsum</p>

    <p v-if="isUserConnected">
      <strong>Your current chain:</strong> {{getChainName}}
    </p>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Home",
  computed: {
    ...mapGetters("accounts", ["getChainName", "isUserConnected"]),
  },
}
</script>
