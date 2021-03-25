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
          <div class="btn-group mb-3 mr-3">
            <button type="button" class="btn btn-light dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {{getSelectedPair}}
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#" @click="changePair(pair)" v-for="pair in pairs" v-bind:key="pair">{{pair}}</a>
            </div>
          </div>

          <!-- Maturity dropdown -->
          <div class="btn-group mb-3 mr-3">
            <button type="button" class="btn btn-light dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {{getSelectedMaturity}}
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#" @click="changeMaturity(maturity)" v-for="maturity in maturities" v-bind:key="maturity">{{maturity}}</a>
            </div>
          </div>

          <!-- Type dropdown -->
          <div class="btn-group mb-3">
            <button type="button" class="btn btn-light dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {{getSelectedType}}
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
                    <th>Buy/Sell</th>
                </tr>
            </thead>
            
            <tbody>

                <tr v-for="(option, index) in getFilteredSymbols" v-bind:key="option.symbol">
                    <td>{{index + 1}}</td>
                    <td>{{getSelectedPair}}</td>
                    <td>{{getSelectedType}}</td>
                    <td><strong>${{option.strike}}</strong></td>
                    <td>{{getSelectedMaturity}}</td>
                    <td>
                      <button class="btn btn-outline-success btn-sm mr-2" @click="setModalData('Buy', option.symbol, option.strike)" data-toggle="modal" data-target="#optionsModal">Buy</button>
                      <button class="btn btn-outline-danger btn-sm" @click="setModalData('Sell', option.symbol, option.strike)" data-toggle="modal" data-target="#optionsModal">Sell</button>
                    </td>
                </tr>

            </tbody>
            
          </table>

          <p v-if="getFilteredSymbols === undefined || getFilteredSymbols.length === 0" class="ml-2">
            No options here. Try other filters.
          </p>
        </div>
        <!-- Table END-->
      </div>
    </div>

    <!-- Buy/Sell Modal START-->
    <div class="modal fade" id="optionsModal" tabindex="-1" aria-labelledby="optionsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title" id="optionsModalLabel">{{selectedAction}} option</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="modal-body">

            <div class="form-group row">
              <label for="optionSymbol" class="col-sm-3 col-form-label font-weight-bold">Option</label>
              <div class="col-sm-9">
                <input type="text" readonly class="form-control-plaintext" id="optionSymbol" :value="selectedPair+' '+selectedType+' at $'+selectedStrike+' ('+selectedMaturity+')'">
              </div>
            </div>

            <div class="form-group row">
              <label for="optionSize" class="col-sm-3 col-form-label font-weight-bold">Option size</label>
              <div class="col-sm-9">
                <input type="text" class="form-control" id="optionSize" v-model="selectedOptionSize">
              </div>
            </div>

            <div class="form-group row">
              <label for="optionPrice" class="col-sm-3 col-form-label font-weight-bold">Option price</label>
              <div class="col-sm-9">
                <input type="text" readonly class="form-control-plaintext" id="optionPrice" :value="'$'+Number(selectedOptionPrice).toFixed(2)">
              </div>
            </div>

            <div class="form-group row">
              <label for="optionTotal" class="col-sm-3 col-form-label font-weight-bold">TOTAL</label>
              <div class="col-sm-9">
                <input type="text" readonly class="form-control-plaintext" id="optionTotal" :value="'$'+Number(selectedOptionSize*selectedOptionPrice).toFixed(2)">
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button v-if="selectedAction === 'Buy'" type="button" class="btn btn-success" disabled>Buy option</button>
            <button v-if="selectedAction === 'Sell'" type="button" class="btn btn-danger" disabled>Sell option</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>

        </div>
      </div>
    </div>
    <!-- Buy/Sell Modal END-->

  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: 'Trade',
  beforeDestroy() {
    this.unsubscribe();
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth", "getWeb3", "isUserConnected"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getSymbolsListJson", "getDefaultMaturity", "getDefaultPair", "getDefaultType"]),

    getFilteredSymbols() {
      try {
        return this.getSymbolsListJson[this.getSelectedPair][this.getSelectedMaturity][this.getSelectedType];
      } catch {
        return [];
      }
    },

    getSelectedMaturity() {
      if (this.selectedMaturity) {
        return this.selectedMaturity;
      }
      return this.getDefaultMaturity;
    },
    getSelectedPair() {
      if (this.selectedPair) {
        return this.selectedPair;
      }
      return this.getDefaultPair;
    },
    getSelectedType() {
      if (this.selectedType) {
        return this.selectedType;
      }
      return this.getDefaultType;
    },
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      // if web3 is not yet loaded or user not connected, redirect to home page
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("liquidityPool/fetchSymbolsList");

    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'liquidityPool/setSymbolsList') {
        // extract values from getSymbolsListJson and pre-populate dropdowns (pair, maturity, type)
        this.pairs = Object.keys(this.getSymbolsListJson);
        this.selectedPair = this.pairs[0];

        this.maturities = Object.keys(this.getSymbolsListJson[this.selectedPair]);
        this.selectedMaturity = this.maturities[0];

        this.typeNames = Object.keys(this.getSymbolsListJson[this.selectedPair][this.selectedMaturity]);
        this.selectedType = this.typeNames[0];
      }
    });
  },
  data() {
    return {
      maturities: null,
      pairs: null,
      selectedAction: "Buy", // Buy or Sell
      selectedMaturity: null,
      selectedOptionPrice: null,
      selectedOptionSize: 1,
      selectedOptionVolume: null, // max possible option size
      selectedPair: null,
      selectedStrike: null,
      selectedSymbol: null,
      selectedType: null,
      showModal: false,
      typeNames: null
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
    },
    async setModalData(action, symbol, strike) {
      this.selectedAction = action;
      this.selectedSymbol = symbol;
      this.selectedStrike = strike;

      // fetch option price and volume
      let result;

      if (action === "Buy") {
        result = await this.getLiquidityPoolContract.methods.queryBuy(this.selectedSymbol).call();
      } else {
        result = await this.getLiquidityPoolContract.methods.querySell(this.selectedSymbol).call();
      }
      
      this.selectedOptionPrice = this.getWeb3.utils.fromWei(result.price, "ether");
      this.selectedOptionVolume = this.getWeb3.utils.fromWei(result.volume, "ether");
    }
  }
}
</script>
