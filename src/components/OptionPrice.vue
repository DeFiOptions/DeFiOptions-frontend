<template>
  <span>
    <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    <span v-if="!loading">{{"$" + Number(price).toFixed(2)}}</span>
  </span>
</template>

<script>
export default {
  name: "OptionPrice",
  computed: {
    
  },
  created() {
    this.getOptionPrice();
  },
  data() {
    return {
      loading: true,
      price: null
    }
  },
  methods: {
    async getOptionPrice() {
      this.loading = true;

      // fetch option price
      let result = await this.contract.methods.queryBuy(this.symbol).call();
      
      if (result) {
        this.price = this.web3.utils.fromWei(result.price, "ether");
        this.loading = false;
      }
    }
  },
  props: ["symbol", "contract", "web3"]
}
</script>
