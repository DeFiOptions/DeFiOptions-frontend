<template>
  <div>
    <div class="section-big row mt-4 mx-3">
      <div class="col-md-3 mb-4">
        <h3>Markets</h3>

        <div v-for="pair in pairs" v-bind:key="pair">
          <button @click="changePair(pair)" class="btn btn-outline-primary btn-xl mt-2" :class="{'btn-outline-primary-active':pair === selectedPair}">
            {{pair}}
          </button>
        </div>
      </div>

      <div class="col-md-9">
        <div class="d-flex flex-wrap justify-content-between">
          <div class="mb-4">
            <h3>Type</h3>

            <div class="btn-group mt-2" role="group" aria-label="Basic example">
              <button @click="changeOptionType('CALL')" type="button" class="btn btn-outline-primary btn-md" :class="{'btn-outline-primary-active':'CALL' === selectedType}">CALL</button>
              <button @click="changeOptionType('PUT')" type="button" class="btn btn-outline-primary btn-md" :class="{'btn-outline-primary-active':'PUT' === selectedType}">PUT</button>
            </div>
          </div>

          <div class="mb-4">
            <h3>Current price</h3>

            <button class="btn btn-primary mt-2 btn-md">
              ${{getUnderlyingPrice}}
            </button>
          </div>

          <div class="mb-4">
            <h3>Maturity</h3>

            <div class="btn-group mt-2">
              <button type="button" class="btn btn-primary btn-md dropdown-toggle text-uppercase" data-bs-toggle="dropdown" aria-expanded="false">
                {{getSelectedMaturity}}
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item text-uppercase" href="#" @click="changeMaturity(maturity)" v-for="maturity in maturities" v-bind:key="maturity">{{maturity}}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <OptionsList />
      </div>
    </div>

    <br />
    <br />
    <br />
    <br />
    <br />

    <!-- Card -->
    <div class="card shadow mt-4">

      <div class="card-body">

        <!-- Dropdowns START -->
        <div class="form-inline justify-content-between">

          <div>
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

          <div>
            <!-- Underlying price -->
            <div class="btn-group mb-3">
              <button type="button" class="btn btn-light" disabled>
                {{getSelectedPair}}: ${{getUnderlyingPrice}}
              </button>
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
                    <th>Option price</th>
                    <th>Buy option</th>
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
                      <OptionPrice :symbol="option.symbol" :contract="getLiquidityPoolContract" :web3="getWeb3" />
                    </td>
                    <td>
                      <button class="btn btn-outline-success btn-sm mr-2 mb-1" @click="setModalData('Buy', option.symbol, option.strike)" data-toggle="modal" data-target="#optionsModal">Buy</button>
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

    <!-- Buy Modal START-->
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
                <input type="text" readonly class="form-control-plaintext ml-1" id="optionSymbol" :value="selectedPair+' '+selectedType+' at $'+selectedStrike+' ('+selectedMaturity+')'">
              </div>
            </div>

            <div class="form-group row" v-if="!tooLowVolume">
              <label for="optionSize" class="col-sm-3 col-form-label font-weight-bold">Option size</label>
              <div class="col-sm-8">
                <span v-if="loadingVolume" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <input v-if="!loadingVolume" type="text" class="form-control ml-1" :class="isOptionSizeNotValid.status ? 'is-invalid' : ''" id="optionSize" v-model="selectedOptionSize">
                
                <small v-if="isOptionSizeNotValid.status" class="invalid-feedback ml-1">{{ isOptionSizeNotValid.message }}. Try <a @click="selectedOptionSize = getMaxOptionSize" href="#">{{getMaxOptionSize}}</a>.</small>
                <small v-if="!isOptionSizeNotValid.status" class="ml-1">Maximum option size: <a @click="selectedOptionSize = getMaxOptionSize" href="#">{{getMaxOptionSize}}</a>.</small>
              </div>
            </div>

            <div class="form-group row" v-if="tooLowVolume">
              <label for="optionSizeTooSmall" class="col-sm-3 col-form-label font-weight-bold">Option size</label>
              <div class="col-sm-9">
                <input type="text" readonly class="form-control-plaintext ml-1 text-danger" id="optionSizeTooSmall" value="Option purchase not possible (low volume).">
              </div>
            </div>

            <div class="form-group row">
              <label for="optionPrice" class="col-sm-3 col-form-label font-weight-bold">Option price</label>
              <div class="col-sm-9">
                <input type="text" readonly class="form-control-plaintext ml-1" id="optionPrice" :value="'$'+Number(selectedOptionPrice).toFixed(2)">
              </div>
            </div>

            <div class="form-group row">
              <label for="optionBuyWith" class="col-sm-3 col-form-label font-weight-bold">Buy with</label>
              <div class="col-sm-9">
                <div class="dropdown" id="optionBuyWith">
                  <button class="btn btn-light dropdown-toggle" type="button" id="buyWithDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {{ buyWith }}
                  </button>
                  
                  <div class="dropdown-menu" aria-labelledby="buyWithDropdown">
                    <button class="dropdown-item" type="button" @click="changeBuyWith('DAI')">DAI</button>
                    <button class="dropdown-item" type="button" @click="changeBuyWith('USDC')">USDC</button>
                    <button class="dropdown-item" type="button" @click="changeBuyWith('Exchange Balance')">Exchange Balance</button>
                  </div>
                  
                </div>
                <small class="ml-1">Balance: {{ Number(getUserStablecoinBalance).toFixed(2) }} {{buyWith}}.</small>
              </div>
            </div>

            <div class="form-group row">
              <label for="optionTotal" class="col-sm-3 col-form-label font-weight-bold">TOTAL</label>
              <div class="col-sm-9">
                <input type="text" readonly class="form-control-plaintext ml-1 font-weight-bold" id="optionTotal" :value="'$'+Number(getTotal).toFixed(2)">
              </div>
            </div>

          </div>

          <div class="modal-footer">

            <button @click="buyOption" type="button" class="btn btn-success" :disabled="isOptionSizeNotValid.status ? true : false">
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Buy option
            </button>
            
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
          

        </div>
      </div>
    </div>
    <!-- Buy Modal END-->

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { signERC2612Permit } from 'eth-permit';
import OptionPrice from '../components/OptionPrice.vue';
import OptionsList from '../components/trade/OptionsList.vue';

export default {
  name: 'Trade',
  beforeDestroy() {
    this.unsubscribe();
  },
  components: {
    OptionPrice,
    OptionsList
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth", "getWeb3", "isUserConnected", "getLastSelectedTradePair", "getLastSelectedTradeMaturity", "getLastSelectedTradeType"]),
    ...mapGetters("optionsExchange", ["getOptionsExchangeAddress", "getExchangeUserBalance", "getUnderlyingPrice"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getLiquidityPoolAddress", "getSymbolsListJson", "getDefaultMaturity", "getDefaultPair", "getDefaultType"]),
    ...mapGetters("dai", ["getDaiAddress", "getUserDaiBalance", "getDaiContract"]),
    ...mapGetters("usdc", ["getUsdcAddress", "getUserUsdcBalance", "getUsdcContract"]),

    getFilteredSymbols() {
      try {
        const filteredList = this.getSymbolsListJson[this.getSelectedPair][this.getSelectedMaturity][this.getSelectedType];
        return filteredList.sort((a, b) => a.strike - b.strike);
      } catch {
        return [];
      }
    },
    getMaxOptionSize() {
      // max option size that current user can buy
      let availableOptionVolume = Math.floor(Number(this.selectedOptionVolume*1000))/1000;
      let optionPrice = Number(this.selectedOptionPrice);
      let maxTotal = availableOptionVolume * optionPrice;
      let userBalance = Number(this.getUserStablecoinBalance);

      if (maxTotal > Number(this.getUserStablecoinBalance)) {
        return Math.floor(Number(userBalance / optionPrice * 1000))/1000;
      } else {
        return availableOptionVolume;
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
    getStablecoinAddress() {
      if (this.buyWith === "DAI") {
        return this.getDaiAddress;
      } else if (this.buyWith === "USDC") {
        return this.getUsdcAddress;
      } else if (this.buyWith === "Exchange Balance") {
        return this.getOptionsExchangeAddress;
      } 

      return null;
    },
    getTotal() {
      return Number(this.selectedOptionSize) * Number(this.selectedOptionPrice);
    },
    getUserStablecoinBalance() {
      if (this.buyWith === "DAI") {
        return this.getUserDaiBalance;
      } else if (this.buyWith === "USDC") {
        return this.getUserUsdcBalance;
      } else if (this.buyWith === "Exchange Balance") {
        return this.getExchangeUserBalance;
      }

      return null;
    },
    isOptionSizeNotValid() { // validation for option size
      // option size bigger than volume.
      if (Number(this.selectedOptionSize) > Number(this.selectedOptionVolume)) {
        return {status: true, message: "Option size must not be bigger than " + (Math.floor(Number(this.selectedOptionVolume*1000))/1000) + "!"};
      }

      // too many digits
      if (String(this.selectedOptionSize).length > 14) {
        return {status: true, message: "Please reduce the number of digits."};
      }

      // negative option size
      if (Number(this.selectedOptionSize) < 0) {
        return {status: true, message: "Option size must not be negative!"};
      }

      // not a number
      if (isNaN(this.selectedOptionSize)) {
        return {status: true, message: "Please enter a number."};
      }

      // null option size
      if (this.selectedOptionSize === null || Number(this.selectedOptionSize) === 0 || this.selectedOptionSize === undefined || this.selectedOptionSize === "") {
        return {status: true, message: "Option size must not be empty or zero!"};
      }

      // total bigger than balance
      if (this.selectedAction === "Buy" && this.getTotal > Number(this.getUserStablecoinBalance)) {
        return {status: true, message: "Your " + this.buyWith + " balance is too low."};
      }

      return {status: false, message: "Valid option size"};
    }

  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      // if web3 is not yet loaded or user not connected, redirect to home page
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("optionsExchange/storeAddress");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("liquidityPool/fetchSymbolsList");
    this.$store.dispatch("liquidityPool/storeAddress");
    this.$store.dispatch("dai/fetchContract");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("dai/storeAddress");
    this.$store.dispatch("usdc/fetchContract");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("usdc/storeAddress");

    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'liquidityPool/setSymbolsList') {
        // extract values from getSymbolsListJson and pre-populate dropdowns (pair, maturity, type)
        this.pairs = Object.keys(this.getSymbolsListJson);
        this.selectedPair = this.pairs[0];

        this.maturities = Object.keys(this.getSymbolsListJson[this.selectedPair]);
        this.selectedMaturity = this.maturities[0];

        this.typeNames = Object.keys(this.getSymbolsListJson[this.selectedPair][this.selectedMaturity]);
        this.selectedType = this.typeNames[0];

        
        if (this.getLastSelectedTradePair) {
          // persistent storage for a user that's switching between pages
          this.selectedPair = this.getLastSelectedTradePair;
        }

        if (this.getLastSelectedTradeMaturity) {
          // persistent storage for a user that's switching between pages
          this.selectedMaturity = this.getLastSelectedTradeMaturity;
        }

        if (this.getLastSelectedTradeType) {
          // persistent storage for a user that's switching between pages
          this.selectedType = this.getLastSelectedTradeType;
        }

        let symbol = this.getSymbolsListJson[this.selectedPair][this.selectedMaturity][this.selectedType][0].symbol;
        this.$store.dispatch("optionsExchange/fetchUnderlyingPrice", {symbol});
      }
    });
  },
  data() {
    return {
      buyWith: "DAI",
      loading: false,
      loadingVolume: false,
      maturities: null,
      pairs: null,
      selectedAction: "Buy", // Buy or some other action (Write?)
      selectedMaturity: null,
      selectedOptionPrice: null,
      selectedOptionSize: 0.1, // the amount that user enters in the option modal
      selectedOptionVolume: null, // max possible option size
      selectedPair: null,
      selectedStrike: null,
      selectedSymbol: null,
      selectedType: null,
      showModal: false,
      typeNames: null, // PUT, CALL
      tooLowVolume: false
    }
  },
  methods: {
    async buyOption() {
      let component = this;

      let optionSizeWei = component.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether");
      let optionUnitPrice = component.getWeb3.utils.toWei(String(component.selectedOptionPrice), "ether");
      
      // define max value (and unit)
      let unit = "ether"; // DAI
      if (component.buyWith === "USDC") {
        unit = "mwei"; // USDC
      }

      let maxValue = component.getWeb3.utils.toWei(String(component.getTotal.toFixed(4)), unit); // round to 4 decimals

      let buyObj;

      if (component.buyWith === "Exchange Balance") {
        // buy with exchange balance (no permit needed)
        buyObj = component.getLiquidityPoolContract.methods.buy(
          component.selectedSymbol, // symbol
          optionUnitPrice, // price per one option
          optionSizeWei, // volume a.k.a. user's selected option size
          component.getStablecoinAddress, // selected stablecoin
        )
      } else {
        // buy with DAI or USDC - allowance through permit()
        let result = await signERC2612Permit(
          window.ethereum, 
          component.getStablecoinAddress, 
          component.getActiveAccount, 
          component.getLiquidityPoolAddress, 
          maxValue
        );

        buyObj = component.getLiquidityPoolContract.methods.buy(
          component.selectedSymbol, // symbol
          optionUnitPrice, // price per one option
          optionSizeWei, // volume a.k.a. user's selected option size
          component.getStablecoinAddress, // selected stablecoin
          maxValue, // maxValue
          result.deadline,
          result.v,
          result.r,
          result.s
        )
      }

      // buy option transaction
      try {
        await buyObj.send({
          from: component.getActiveAccount
        }, function(error, hash) {
          component.loading = true;

          // close the modal after tx is sent
          window.$("#optionsModal").modal('hide');

          // Deposit tx error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
            component.loading = false;
          }

          // Deposit transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Buy transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the Transfer event
            component.getLiquidityPoolContract.once("Buy", {
              filter: { buyer: component.getActiveAccount }
            }, function(error, event) {
              component.loading = false;
              
              // failed transaction
              if (error) {
                component.$toast.error("The Buy transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("You have successfully bought an option.");

                // refresh values
                if (component.buyWith === "DAI") {
                  component.$store.dispatch("dai/fetchUserBalance");
                } else if (component.buyWith === "USDC") {
                  component.$store.dispatch("usdc/fetchUserBalance");
                } else if (component.buyWith === "Exchange Balance") {
                  component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
                }
                
                component.selectedOptionSize = 0.1;
                component.setModalData('Buy', component.selectedSymbol, component.selectedStrike);
              }
            });
          }
        });
      } catch (e) {
          window.console.log("Error:", e);
          component.$toast.error("The transaction has been reverted. Please try again or contact project admins.");
          component.loading = false;
      }
    },
    changeBuyWith(stablecoin) {
      this.buyWith = stablecoin;
    },
    changePair(pair) {
      this.selectedPair = pair;
      this.$store.commit("accounts/setLastSelectedTradePair", pair);

      // fetch new underlying price
      let symbol = this.getSymbolsListJson[this.selectedPair][this.selectedMaturity][this.selectedType][0].symbol;
      this.$store.dispatch("optionsExchange/fetchUnderlyingPrice", {symbol});
    },
    changeMaturity(maturity) {
      this.selectedMaturity = maturity;
      this.$store.commit("accounts/setLastSelectedTradeMaturity", maturity);
    },
    changeOptionType(optionType) {
      this.selectedType = optionType;
      this.$store.commit("accounts/setLastSelectedTradeType", optionType);
    },
    async setModalData(action, symbol, strike) {
      this.loadingVolume = true;
      this.selectedOptionSize = 0.1;
      this.selectedOptionPrice = null;
      this.selectedOptionVolume = null;

      this.selectedAction = action;
      this.selectedSymbol = symbol;
      this.selectedStrike = strike;

      // fetch option price and volume
      let result = await this.getLiquidityPoolContract.methods.queryBuy(this.selectedSymbol).call();
      
      if (result) {
        this.selectedOptionPrice = this.getWeb3.utils.fromWei(result.price, "ether");
        this.selectedOptionVolume = this.getWeb3.utils.fromWei(result.volume, "ether");

        this.loadingVolume = false;

        if (this.selectedOptionVolume < 0.001) {
          this.tooLowVolume = true;
        }
      }
      
    }
  }
}
</script>
