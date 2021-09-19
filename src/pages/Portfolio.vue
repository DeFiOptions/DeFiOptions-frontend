<template>
  <div>

    <div class="section-big row">
      <div class="col-md-3">
        <h3>Account balance</h3>
      </div>

      <div class="col-md-9">
        <h3>Withdraw</h3>
      </div>
    </div>

    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-gray-800">Your portfolio</h1>
    </div>
    <!-- END Page Heading -->

    <div class="row mt-3">

      <!-- Card: Address -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Address
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            {{getActiveAccount.substring(0, 7)}}...{{ getActiveAccount.substring(35, 42) }}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: ETH balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              ETH
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            {{ Number(getActiveBalanceEth).toFixed(2) }} ETH
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fab fa-ethereum fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: Exchange balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Exchange Balance
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getExchangeUserBalance).toFixed(2) }}<br>
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: Credit tokens -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Credit Tokens
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getCreditTokenUserBalance).toFixed(2) }}
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: Pool tokens -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Pool Tokens
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getLiquidityPoolUserBalance).toFixed(2) }}
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: DAI balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Dai
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getUserDaiBalance).toFixed(2) }}

                            <button class="btn btn-primary btn-sm" @click="addDaiToMetaMask" data-toggle="tooltip" data-placement="bottom" title="Add to MetaMask">
                              <i class="fas fa-plus-circle"></i>
                            </button>
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: USDC balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              USDC
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getUserUsdcBalance).toFixed(2) }}

                            <button class="btn btn-primary btn-sm" @click="addUsdcToMetaMask" data-toggle="tooltip" data-placement="bottom" title="Add to MetaMask">
                              <i class="fas fa-plus-circle"></i>
                            </button>
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

    </div>

    <!-- Options table -->
    <div class="row mb-4" v-if="getUserOptions">

      <div class="col-md-12">
        <div class="card shadow mt-4">
          <div class="card-body">
            <h5 class="card-title">Your options</h5>

            <!-- Table START -->
            <div class="table-responsive">
              <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Option</th>
                        <th>Expiration</th>
                        <th>Holding</th>
                        <th>Written</th>
                        <th>Intrinsic value</th>
                        <th>Sell/Redeem</th>
                    </tr>
                </thead>
                
                <tbody>

                    <tr v-for="(option, index) in getUserOptions" v-bind:key="option.symbol">
                        <td>{{index + 1}}</td>
                        <td>
                          {{option.pair}} ({{option.type}}) at ${{option.strike}}
                          <span v-if="isOptionExpired(option)" class="badge badge-info">Expired</span>
                        </td>
                        <td>{{option.maturity}}</td>
                        <td>{{option.holding}}</td>
                        <td>{{option.written}}</td>
                        <td>${{ (Number(option.intrinsicValue)*Number(option.holding)).toFixed(2) }}</td>
                        <td>
                          <button v-if="!isOptionExpired(option)" class="btn btn-outline-danger btn-sm mb-1" @click="setSellModalData(option)" data-toggle="modal" data-target="#sellOptionModal">Sell</button>
                          <button v-if="isOptionExpired(option)" class="btn btn-outline-info btn-sm mb-1" @click="setRedeemModalData(option)" data-toggle="modal" data-target="#redeemOptionModal">Redeem</button>
                        </td>
                    </tr>

                </tbody>
              </table>
            </div>
            <!-- Table END-->
            
          </div>
        </div>
      </div>

      <!-- Sell option Modal START-->
      <div class="modal fade" id="sellOptionModal" tabindex="-1" aria-labelledby="sellOptionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">

            <div class="modal-header">
              <h5 class="modal-title" id="sellOptionModalLabel">Sell your option</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div class="modal-body">

              <div class="form-group row">
                <label for="optionSymbol" class="col-sm-3 col-form-label font-weight-bold">Option</label>
                <div class="col-sm-9">
                  <input type="text" readonly class="form-control-plaintext ml-1" id="optionSymbol" :value="selectedOption.pair+' '+selectedOption.type+' at $'+selectedOption.strike+' ('+selectedOption.maturity+')'">
                </div>
              </div>

              <div class="form-group row">
                <label for="optionSize" class="col-sm-3 col-form-label font-weight-bold">Option size</label>
                <div class="col-sm-8">
                  <span v-if="loadingVolume" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <input v-if="!loadingVolume" type="text" class="form-control ml-1" :class="isOptionSizeNotValid.status ? 'is-invalid' : ''" id="optionSize" v-model="selectedOptionSize">
                  
                  <small v-if="isOptionSizeNotValid.status" class="invalid-feedback ml-1">{{ isOptionSizeNotValid.message }}</small>
                  <small class="ml-1">
                    Maximum option size to sell: <a @click="selectedOptionSize = getMaxOptionSize" href="#">{{getMaxOptionSize}}</a>
                    <span v-if="Number(this.selectedOption.holding) > Number(getMaxOptionSize)"> 
                      (Your total holding is bigger: {{this.selectedOption.holding}})
                    </span>.
                  </small>

                </div>
              </div>

              <div class="form-group row">
                <label for="optionPrice" class="col-sm-3 col-form-label font-weight-bold">Option price</label>
                <div class="col-sm-9">
                  <input type="text" readonly class="form-control-plaintext ml-1" id="optionPrice" :value="'$'+Number(selectedOptionPrice).toFixed(2)">
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
              <button @click="sellOption" type="button" class="btn btn-danger" :disabled="isOptionSizeNotValid.status ? true : false">
                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Sell option
              </button>
              
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
            
          </div>
        </div>
      </div>
      <!-- Sell option Modal END-->

      <!-- Redeem option Modal START-->
      <div class="modal fade" id="redeemOptionModal" tabindex="-1" aria-labelledby="redeemOptionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">

            <div class="modal-header">
              <h5 class="modal-title" id="redeemOptionModalLabel">Redeem your option</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div class="modal-body">

              <div class="form-group row">
                <label for="redeemOptionSymbol" class="col-sm-4 col-form-label font-weight-bold">Option</label>
                <div class="col-sm-8">
                  <input type="text" readonly class="form-control-plaintext ml-1" id="redeemOptionSymbol" :value="selectedOption.pair+' '+selectedOption.type+' at $'+selectedOption.strike">
                </div>
              </div>

              <div class="form-group row">
                <label for="redeemOptionExpired" class="col-sm-4 col-form-label font-weight-bold">Expired on</label>
                <div class="col-sm-8">
                  <input type="text" readonly class="form-control-plaintext ml-1" id="redeemOptionExpired" :value="selectedOption.maturity">
                </div>
              </div>

              <div class="form-group row">
                <label for="optionIv" class="col-sm-4 col-form-label font-weight-bold">Intrinsic value</label>
                <div class="col-sm-8">
                  <input type="text" readonly class="form-control-plaintext ml-1" id="optionIv" :value="'$'+Number(selectedOption.intrinsicValue).toFixed(2)+' for 1 option'">
                </div>
              </div>

              <div class="form-group row">
                <label for="redeemOptionHolding" class="col-sm-4 col-form-label font-weight-bold">Quantity</label>
                <div class="col-sm-8">
                  <input type="text" readonly class="form-control-plaintext ml-1" id="redeemOptionHolding" :value="Number(selectedOption.holding).toFixed(2)">
                </div>
              </div>

              <div class="form-group row">
                <label for="redeemOptionTotal" class="col-sm-4 col-form-label font-weight-bold">TOTAL</label>
                <div class="col-sm-8">
                  <input type="text" readonly class="form-control-plaintext ml-1 font-weight-bold" id="redeemOptionTotal" :value="'$'+Number(selectedOption.intrinsicValue * selectedOption.holding).toFixed(2)">
                </div>
              </div>

            </div>

            <div class="modal-footer">
              <button @click="redeemOption" type="button" class="btn btn-info">
                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Redeem option
              </button>
              
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
            
          </div>
        </div>
      </div>
      <!-- Redeem option Modal END-->
    </div>

    <!-- Withdraw balance -->
    <div class="row justify-content-center mb-4">

      <div class="col-lg-6">
          <div class="card o-hidden border-0 shadow-lg mt-2">
              <div class="card-body p-0">
                  <div class="p-5">
                    <div class="text-center">
                        <h2 class="h4 text-gray-900 mb-2">Withdraw balance</h2>
                        <p class="mb-4">
                          Withdraw your stablecoin balance (except the amount allocated as collateral for written options).
                        </p>
                    </div>

                    <form @submit.prevent="withdrawBalance">
                        <div class="form-group">
                            <input type="text" v-model="withdrawValue" class="form-control form-control-user"
                                placeholder="Enter the amount to withdraw">
                        </div>
                        <button class="btn btn-primary btn-user btn-block">
                            Withdraw balance
                        </button>
                    </form>
                </div>
              </div>
          </div>
      </div>

    </div>

    <!-- Mint fake stablecoins -->
    <div class="row justify-content-center mb-4">

      <div class="col-lg-6">
          <div class="card o-hidden border-0 shadow-lg mt-2">
              <div class="card-body p-0">
                  <div class="p-5">
                    <div class="text-center">
                        <h2 class="h4 text-gray-900 mb-2">Get yourself some DAI</h2>
                        <p class="mb-4">
                          Mint yourself some fake DAI tokens here and use 
                          it on DeFiOptions (Kovan testnet only).
                        </p>
                    </div>

                    <form @submit.prevent="getDai">
                        <div class="form-group">
                            <input type="text" v-model="daiValue" class="form-control form-control-user"
                                placeholder="Enter the amount of DAI to receive">
                        </div>
                        <button class="btn btn-primary btn-user btn-block">
                            Get fake DAI
                        </button>
                    </form>
                </div>
              </div>
          </div>
      </div>

      <div class="col-lg-6">
          <div class="card o-hidden border-0 shadow-lg mt-2">
              <div class="card-body p-0">
                  <div class="p-5">
                    <div class="text-center">
                        <h2 class="h4 text-gray-900 mb-2">Get yourself some USDC</h2>
                        <p class="mb-4">
                          Mint some fake USDC here and use it on DeFiOptions (Kovan testnet only).
                        </p>
                    </div>

                    <form @submit.prevent="getUsdc">
                        <div class="form-group">
                            <input type="text" v-model="usdcValue" class="form-control form-control-user"
                                placeholder="Enter the amount of USDC to receive">
                        </div>
                        <button class="btn btn-primary btn-user btn-block">
                            Get fake USDC
                        </button>
                    </form>
                </div>
              </div>
          </div>
      </div>

    </div>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { signERC2612Permit } from 'eth-permit';
import OptionTokenContractJson from "../contracts/RedeemableToken.json";

export default {
  name: 'Portfolio',
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth", "getWeb3", "isUserConnected"]),
    ...mapGetters("optionsExchange", ["getExchangeUserBalance", "getOptionsExchangeContract", "getUserOptions"]),
    ...mapGetters("dai", ["getDaiContract", "getUserDaiBalance"]),
    ...mapGetters("usdc", ["getUsdcContract", "getUserUsdcBalance"]),
    ...mapGetters("creditToken", ["getCreditTokenUserBalance"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolUserBalance", "getLiquidityPoolContract", "getLiquidityPoolAddress"]),

    getTotal() {
      return Number(this.selectedOptionSize) * Number(this.selectedOptionPrice);
    },
    getMaxOptionSize() {
      // max option size that current user can sell
      let availableOptionVolume = Math.floor(Number(this.selectedOptionVolume*1000))/1000;
      let userOptionBalance = Number(this.selectedOption.holding);

      if (userOptionBalance > availableOptionVolume) {
        return availableOptionVolume;
      } else {
        return userOptionBalance;
      }
    },
    isOptionSizeNotValid() { // validation for option size
      // option size bigger than volume.
      if (Number(this.selectedOptionSize) > Number(this.getMaxOptionSize)) {
        return {status: true, message: "Option size too big!"};
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

      return {status: false, message: "Valid option size"};
    }
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("dai/fetchContract");
    this.$store.dispatch("usdc/fetchContract");
    this.$store.dispatch("creditToken/fetchContract");
    this.$store.dispatch("liquidityPool/fetchUserBalance");
    this.$store.dispatch("liquidityPool/storeAddress");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
    this.$store.dispatch("optionsExchange/fetchUserOptions");
    this.$store.dispatch("creditToken/fetchUserBalance");
    this.$store.dispatch("accounts/fetchActiveBalance");
  },
  data() {
    return {
      daiValue: null,
      loading: false,
      loadingVolume: false,
      selectedOption: {},
      selectedOptionPrice: null,
      selectedOptionSize: 0.1, // the amount that user enters in the option modal
      selectedOptionVolume: null, // max possible option size
      usdcValue: null,
      withdrawValue: null
    }
  },
  methods: {
    async addDaiToMetaMask() {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: this.getDaiContract._address, // The address that the token is at.
            symbol: "DAI", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
            image: "", // TODO: A string url of the token logo
          },
        },
      });
    },
    async addUsdcToMetaMask() {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: this.getUsdcContract._address, // The address that the token is at.
            symbol: "USDC", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 6, // The number of decimals in the token
            image: "", // TODO: A string url of the token logo
          },
        },
      });
    },
    async getDai() {
      let component = this;
      let tokensWei = this.getWeb3.utils.toWei(this.daiValue, "ether");

      await this.getDaiContract.methods.issue(this.getActiveAccount, tokensWei).send({
        from: this.getActiveAccount
      }, function(error, hash) {
        if (error) {
          component.$toast.error("The transaction has been rejected. Please try again.", {
              timeout: 5000
          });
        }

        if (hash) {
          // show a "tx submitted" toast
          component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

          // listen for the Transfer event
          component.getDaiContract.once("Transfer", {
            filter: { owner: component.getActiveAccount }
          }, function(error, event) {
            // failed transaction
            
            if (error) {
              component.$toast.error("The Dai issue transaction has failed. Please try again, perhaps with a higher gas limit.");
            }

            // success
            if (event) {
              component.$toast.success("You have successfully issued yourself DAI! Now go and spend it :)");

              // Refresh values
              component.$store.dispatch("dai/fetchUserBalance"); // refresh the user's dai balance
              component.daiValue = null;
            }

            // Refresh the ETH balance no matter if the tx was successful or not
            component.$store.dispatch("accounts/fetchActiveBalance");
          });
        }
      });
    },
    async getUsdc() {
      let component = this;
      // mwei because USDC has 6 decimals
      let tokensWei = this.getWeb3.utils.toWei(this.usdcValue, "mwei");

      await this.getUsdcContract.methods.issue(this.getActiveAccount, tokensWei).send({
        from: this.getActiveAccount
      }, function(error, hash) {
        if (error) {
          component.$toast.error("The transaction has been rejected. Please try again.", {
              timeout: 5000
          });
        }

        if (hash) {
          // show a "tx submitted" toast
          component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

          // listen for the Transfer event
          component.getUsdcContract.once("Transfer", {
            filter: { owner: component.getActiveAccount }
          }, function(error, event) {
            // failed transaction
            
            if (error) {
              component.$toast.error("The USDC minting transaction has failed. Please try again, perhaps with a higher gas limit.");
            }

            // success
            if (event) {
              component.$toast.success("You have successfully issued yourself USDC! Now go and spend it :)");

              // Refresh values
              component.$store.dispatch("usdc/fetchUserBalance"); // refresh the user's USDC balance
              component.usdcValue = null;
            }

            // Refresh the ETH balance no matter if the tx was successful or not
            component.$store.dispatch("accounts/fetchActiveBalance");
          });
        }
      });
    },
    isOptionExpired(option) {
      return Math.floor(Date.now()/1000) > Number(option.timestamp);
    },
    async redeemOption() {
      let component = this;

      // get option contract
      let optionContract = new this.getWeb3.eth.Contract(OptionTokenContractJson.abi, this.selectedOption.address);

      // redeem option transaction
      try {
        await optionContract.methods.redeem(
          component.getActiveAccount
        ).send({
          from: component.getActiveAccount,
          gas: Number(150000)
        }, function(error, hash) {
          component.loading = true;

          // hide the modal
          window.$("#redeemOptionModal").modal('hide');

          // transaction error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
            component.loading = false;
          }

          // transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Redeem transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the event
            optionContract.once("Transfer", {
              filter: { owner: component.getActiveAccount }
            }, function(error, event) {
              component.loading = false;
              
              // failed transaction
              if (error) {
                component.$toast.error("The Redeem transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("You have successfully redeemed your expired option.");
                component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
                component.$store.dispatch("optionsExchange/fetchUserOptions");
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
    async setRedeemModalData(option) {
      this.selectedOption = option;
    },
    async setSellModalData(option) {
      this.loadingVolume = true;
      this.selectedOption = option;

      let result = await this.getLiquidityPoolContract.methods.querySell(option.symbol).call();

      if (result) {
        this.selectedOptionPrice = this.getWeb3.utils.fromWei(String(result.price), "ether");
        this.selectedOptionVolume = this.getWeb3.utils.fromWei(String(result.volume), "ether");

        this.loadingVolume = false;
        this.selectedOptionSize = this.getMaxOptionSize;

        // Reducing the query price to avoid precision errors in the smart contract (-0.01%)
        this.selectedOptionPrice -= Number(this.selectedOptionPrice) * 0.0001;
      }
    },
    async sellOption() {
      let component = this;

      this.setSellModalData(component.selectedOption); // fetch price again to avoid errors 

      let optionSizeWei = component.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether");
      let optionUnitPrice = component.getWeb3.utils.toWei(String(component.selectedOptionPrice), "ether");

      let sigDeadline = Math.floor(new Date().getTime()/1000) + (3600 * 1); // valid for 1 hour

      // allowance through permit()
      const result = await signERC2612Permit(
        window.ethereum, 
        component.selectedOption.address, // option token address
        component.getActiveAccount, // option owner
        component.getLiquidityPoolAddress, // spender
        optionSizeWei, // value: the amount of option tokens that user decided to sell
        sigDeadline // deadline/expiry for the signature
      );

      // sell option transaction
      try {
        await component.getLiquidityPoolContract.methods.sell(
          component.selectedOption.symbol, // symbol
          optionUnitPrice, // price per one option
          optionSizeWei, // volume a.k.a. user's selected option size
          result.deadline,
          result.v,
          result.r,
          result.s
        ).send({
          from: component.getActiveAccount
        }, function(error, hash) {
          component.loading = true;

          // close the modal after tx is sent
          window.$("#sellOptionModal").modal('hide');

          // transaction error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
            component.loading = false;
          }

          // transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Sell transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the event
            component.getLiquidityPoolContract.once("Sell", {
              filter: { seller: component.getActiveAccount }
            }, function(error, event) {
              component.loading = false;
              
              // failed transaction
              if (error) {
                component.$toast.error("The Sell transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("You have successfully sold an option.");
                component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
                component.$store.dispatch("optionsExchange/fetchUserOptions");
                component.selectedOptionSize = 0.1;
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
    async withdrawBalance() {
      let component = this;
      let tokensWei = this.getWeb3.utils.toWei(this.withdrawValue, "ether");

      await this.getOptionsExchangeContract.methods.withdrawTokens(tokensWei).send({
        from: this.getActiveAccount
      }, function(error, hash) {
        if (error) {
          component.$toast.error("The transaction has been rejected. Please try again.", {
              timeout: 5000
          });
        }

        if (hash) {
          // show a "tx submitted" toast
          component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

          // listen for the WithdrawTokens event
          component.getOptionsExchangeContract.once("WithdrawTokens", {
            filter: { owner: component.getActiveAccount }
          }, function(error, event) {
            // failed transaction
            
            if (error) {
              component.$toast.error("The withdrawal transaction has failed. Please try again, perhaps with a higher gas limit.");
            }

            // success
            if (event) {
              component.$toast.success("You have successfully withdrew your exchange balance (or were credited with Credit Tokens).");

              // Refresh values
              component.$store.dispatch("dai/fetchUserBalance"); // refresh the user's dai balance
              component.$store.dispatch("usdc/fetchUserBalance"); // refresh the user's usdc balance
              component.$store.dispatch("creditToken/fetchUserBalance"); // refresh the user's credit token balance
              component.withdrawValue = null;
            }

            // Refresh the exchange balance no matter if the tx was successful or not
            component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
          });
        }
      });
    }
  }
}
</script>
