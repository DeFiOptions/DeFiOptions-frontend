<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-gray-800">Trade options</h1>
    </div>
    <!-- END Page Heading -->

    <!-- DataTales Example -->
    <div class="card shadow mt-4">

      <div class="card-body">

        <!-- Dropdowns START -->
        <div class="form-inline">

          <!-- Pair dropdown -->
          <div class="btn-group mt-3 mb-3 mr-3">
            <button type="button" class="btn btn-light dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {{selectedPair}}
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#" @click="changePair(pair)" v-for="pair in pairs" v-bind:key="pair">{{pair}}</a>
            </div>
          </div>

          <!-- Maturity dropdown -->
          <div class="btn-group mt-3 mb-3 mr-3">
            <button type="button" class="btn btn-light dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {{selectedMaturity}}
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#" @click="changeMaturity(maturity)" v-for="maturity in maturities" v-bind:key="maturity">{{maturity}}</a>
            </div>
          </div>

          <!-- Type dropdown -->
          <div class="btn-group mt-3 mb-3">
            <button type="button" class="btn btn-light dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {{selectedType}}
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#" @click="changeOptionType('CALL')">CALL</a>
              <a class="dropdown-item" href="#" @click="changeOptionType('PUT')">PUT</a>
            </div>
          </div>

        </div>
        <!-- Dropdowns END -->

        <!-- Table START -->
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

                <tr v-for="(option, index) in getFilteredSymbols" v-bind:key="index">
                    <td>{{index + 1}}</td>
                    <td>{{selectedPair}}</td>
                    <td>{{selectedType}}</td>
                    <td><strong>${{option.strike}}</strong></td>
                    <td>{{selectedMaturity}}</td>
                </tr>
                
            </tbody>
          </table>
        </div>
        <!-- Table END-->
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

    getFilteredSymbols() {
      if (this.selectedPair && this.selectedMaturity && this.selectedType) {
        return this.getSymbolsListJson[this.selectedPair][this.selectedMaturity][this.selectedType];
      }
      
      return [];
    }
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      // if web3 is not yet loaded or user not connected, redirect to home page
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("liquidityPool/fetchSymbolsList");

    // extract values from getSymbolsListJson and pre-populate dropdowns (pair, maturity, type)
    this.pairs = Object.keys(this.getSymbolsListJson);
    this.selectedPair = this.pairs[0];

    this.maturities = Object.keys(this.getSymbolsListJson[this.selectedPair]);
    this.selectedMaturity = this.maturities[0];

    this.typeNames = Object.keys(this.getSymbolsListJson[this.selectedPair][this.selectedMaturity]);
    this.selectedType = this.typeNames[0];
  },
  data() {
    return {
      pairs: null,
      selectedPair: null,
      maturities: null,
      selectedMaturity: null,
      typeNames: null,
      selectedType: null
    }
  },
  methods: {
    changePair(pair) {
      this.selectedPair = pair;
    },
    changeMaturity(maturity) {
      this.selectedMaturity = maturity;
    },
    changeOptionType(optionType) {
      this.selectedType = optionType;
    }
  }
}
</script>
