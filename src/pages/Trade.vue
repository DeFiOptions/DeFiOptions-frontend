<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-gray-800">Trade options</h1>
    </div>
    <!-- END Page Heading -->

    <!-- DataTales Example -->
    <div class="card shadow mt-4">

      <div class="dropdown mt-3 ml-4">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          All options
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <a class="dropdown-item" href="#">All options</a>
          <a class="dropdown-item" href="#">Another action</a>
          <a class="dropdown-item" href="#">Something else here</a>
        </div>
      </div>

      <div class="card-body">
          <div class="table-responsive">
              <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                  <thead>
                      <tr>
                          <th>#</th>
                          <th>Pair</th>
                          <th>Type</th>
                          <th>Strike</th>
                          <th>Maturity</th>
                      </tr>
                  </thead>
                  <tbody>

                      <tr v-for="option in getSymbolsListJson" v-bind:key="option.id">
                          <td>{{option.id}}</td>
                          <td>{{option.pair}}</td>
                          <td>{{option.typeName}}</td>
                          <td>${{option.strikePriceBigUnit}}</td>
                          <td>{{option.maturityHumanReadable}}</td>
                      </tr>
                      
                  </tbody>
              </table>
          </div>
      </div>
    </div>

  </div>
</template>


<script>
import { mapGetters } from "vuex";

export default {
  name: 'Trade',
  components: {
    
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth", "getWeb3", "isUserConnected"]),
    ...mapGetters("liquidityPool", ["getSymbolsListJson"]),

    getPairsList() {
      return ["ETH/USD"]
    }
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("liquidityPool/fetchSymbolsList");
  },
  data() {
    return {
      
    }
  },
  methods: {

  }
}
</script>
