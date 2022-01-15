<template>

<div class="section-small">

  <div class="d-flex justify-content-between flex-wrap">

    <!-- Option data -->
    <div class="div-flex justify-content-center flex-wrap">
      <OptionDataItem class="data-item" title="Strike" :data="'$' + option.strike" :divider="true" />
      <OptionDataItem class="data-item" title="Break even" :data="getBreakEvenPrice" :divider="true" />
      <OptionDataItem class="data-item" title="Price" :green="true" :data="optionPriceFormatted" v-if="isGetBuy" />
      <OptionDataItem class="data-item" title="Price" :green="true" :data="optionPriceFormattedSell" v-if="isGetSell" />
    </div>

    <!-- Action button -->
    <div>
      <button @click="toggleForm" class="btn btn-success" v-if="!showForm && isGetBuy">
        Buy
        <i class="fas fa-chevron-down"></i>
        <i class="fas fa-chevron-up" v-if="showForm"></i>
      </button>

      <button @click="toggleForm" class="btn btn-success" v-if="!showForm && isGetSell">
        Sell
        <i class="fas fa-chevron-down"></i>
        <i class="fas fa-chevron-up" v-if="showForm"></i>
      </button>

      <button @click="toggleForm" class="btn btn-outline-success" v-if="showForm">
        Close
        <i class="fas fa-chevron-up"></i>
      </button>

      <span></span>
    </div>
  </div>

  <!-- Buy option form -->
  <div v-if="showForm && isGetBuy" class="show-form">
    <h3>Option size</h3>

    <div class="d-flex flex-wrap">
      <div>
        <input type="text" v-model="selectedOptionSize" class="form-control show-input" placeholder="0.0" aria-describedby="show-text">
        <div class="show-text form-text" v-if="!isOptionSizeNotValid.status">
          Maximum option size to buy: <span class="max-buy" @click="selectedOptionSize = getMaxOptionSize">{{getMaxOptionSize}}</span>
          <span v-if="Number(this.option.holding) > Number(getMaxOptionSize)"> 
            (Your total holding is bigger: {{this.option.holding}})
          </span>.
        </div>

        <div v-if="isOptionSizeNotValid.status" class="show-text form-text" >{{ isOptionSizeNotValid.message }}</div>
      </div>

      <div class="form-button-mobile">
        <div class="btn-group" aria-describedby="button-text">
          <button type="button" class="btn btn-outline-success dropdown-toggle text-uppercase" data-bs-toggle="dropdown" aria-expanded="false">
            {{buyWith}}
          </button>
          <ul class="dropdown-menu">
            <li>
              <span class="dropdown-item text-uppercase" @click="setBuyWith('DAI')">DAI</span>
              <span class="dropdown-item text-uppercase" @click="setBuyWith('USDC')">USDC</span>
              <span class="dropdown-item text-uppercase" @click="setBuyWith('Exchange Balance')">Exchange Balance</span>
            </li>
          </ul>
        </div>

        <div class="show-text form-text">
          Balance: {{Number(getUserStablecoinBalance).toFixed(2)}} {{buyWith}}.
        </div>
      </div>
      
    </div>

    <div class="row mt-3">
      <button v-if="!allowanceNeeded" @click="buyOption" class="btn btn-success form-control" :disabled="isOptionSizeNotValid.status">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Buy for ${{getTotal.toFixed(2)}}
      </button>

      <button 
        v-if="allowanceNeeded" 
        class="btn btn-success form-control" 
        data-bs-toggle="modal" :data-bs-target="'#approveModal'+getUniqueOptionId"
        :disabled="isOptionSizeNotValid.status"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Approve {{buyWith}} for ${{getTotal.toFixed(2)}}
      </button>

      <small v-if="allowanceNeeded" class="show-text form-text text-center">
        You'll need to make 2 transactions: approve & buy.
      </small>
    </div>
  </div>

  <!-- Sell option form -->
  <div v-if="showForm && isGetSell" class="sell-form">
    <div class="row">
      <div class="btn-group mt-2" role="group" aria-label="Basic example">
          <button @click="changeSellType('WRITE')" type="button" class="btn btn-outline-primary btn-md" :class="{'btn-outline-primary-active':'WRITE' === selectedSellType}">WRITE</button>
          <button @click="changeSellType('SELL')" type="button" class="btn btn-outline-primary btn-md" :class="{'btn-outline-primary-active':'SELL' === selectedSellType}">SELL</button>
      </div>
    </div>

    <h3>
      Option size
      <i 
        @mouseover="showInfo" 
        id="infoEl" 
        class="fas fa-info-circle" 
        data-bs-toggle="tooltip" 
        data-bs-placement="bottom" 
        title="The Sell button shows the price the liquidity pool is willing to pay for your options, 
        consisting of the option's intrinsic value and a potential premium on top of it. If you sell
        your option before expiry, you may get a lesser value due to a spread."
      ></i>
    </h3>

    <div class="d-flex flex-wrap">

      <div>
        <input type="text" v-model="selectedOptionSize" class="form-control sell-input" placeholder="0.0">

        <div class="form-text sell-text">
          <span v-if="isOptionSizeNotValid.status" >
            {{ isOptionSizeNotValid.message }}
          </span>

          <span class="form-text sell-text">
            Max size: <span class="max-sell" @click="selectedOptionSize = getMaxOptionSize">{{getMaxOptionSize}}</span>
            <span v-if="Number(this.option.holding) > Number(getMaxOptionSize)"> 
              (Your total holding is bigger: {{this.option.holding}})
            </span>.
          </span>
        </div>

      </div>

      <div role="group" aria-label="Basic example" v-if="!getSellType">
          <button @click="changeCoveredType('COVERED')" type="button" class="btn btn-outline-primary btn-md" :class="{'btn-outline-primary-active':'COVERED' === selectedCoveredType}">COVERED</button>
          <button @click="changeCoveredType('NAKED')" type="button" class="btn btn-outline-primary btn-md" :class="{'btn-outline-primary-active':'NAKED' === selectedCoveredType}">NAKED</button>
      </div>

      <div class="form-button-mobile" v-if="getCoveredType && !getSellType">
        <div class="show-text form-text" :key="writingOptionsBalance">
          Balance: {{Number(getUserUnderlyingBalance).toFixed(2)}} {{getUnderlying}}.
        </div>
      </div>

      <div class="form-button-mobile" v-if="!getCoveredType">
        <div class="btn-group" aria-describedby="button-text">
          <button type="button" class="btn btn-outline-success dropdown-toggle text-uppercase" data-bs-toggle="dropdown" aria-expanded="false">
            {{buyWith}}
          </button>
          <ul class="dropdown-menu">
            <li>
              <span class="dropdown-item text-uppercase" @click="setBuyWith('DAI')">DAI</span>
              <span class="dropdown-item text-uppercase" @click="setBuyWith('USDC')">USDC</span>
              <span class="dropdown-item text-uppercase" @click="setBuyWith('Exchange Balance')">Exchange Balance</span>
            </li>
          </ul>
        </div>

        <div class="show-text form-text">
          Balance: {{Number(getUserStablecoinBalance).toFixed(2)}} {{buyWith}}.
        </div>
      </div>
    </div>

     <!-- write to open (sell) -->
    <div class="d-flex flex-row" v-if="!getSellType">
      <div class="p-2" v-if="(!getCoveredType) && (!isBuyWithExchangeBalance)">
        <button @click="approveStablecoinCollateralDeposit" class="btn btn-success form-control" :disabled="(isOptionSizeNotValid.status || isEnoughAllowance) || (writingStepTx > 0)">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Approve Stablecoin
        </button>
      </div>
      <!-- <div></div> -->

      <div class="p-2" v-if="getCoveredType">
        <button @click="approveAllowanceCovered" class="btn btn-success form-control" :disabled="(isOptionSizeNotValid.status || isEnoughAllowance) || (writingStepTx > 0)">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Approve Underlying
        </button>
      </div>
      <!-- <div></div> -->

      <div class="p-2"  v-if="(!getCoveredType) && (!isBuyWithExchangeBalance)">
        <button @click="depositCollateral" class="btn btn-success form-control" :disabled="(isOptionSizeNotValid.status || isEnoughAllowance) || (writingStepTx < 1)">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Deposit Stablecoin
        </button>
      </div>
      <!-- <div></div> -->

      <div class="p-2" v-if="!getCoveredType">
        <button @click="writeOptions" class="btn btn-success form-control" :disabled="(isOptionSizeNotValid.status || isEnoughAllowance) || ((writingStepTx < 2) && (!isBuyWithExchangeBalance))">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Write Options
        </button>
      </div>
      <!-- <div></div> -->

      <div class="p-2" v-if="getCoveredType">
        <button @click="writeCovered" class="btn btn-success form-control" :disabled="(isOptionSizeNotValid.status || isEnoughAllowance) || (writingStepTx < 1)">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Write Covered
        </button>
      </div>
      <!-- <div></div> -->
    </div>

     <!-- sell to pool -->
    <div class="row mt-3" v-if="getSellType">
      <button v-if="isEnoughAllowance" @click="sellOption" class="btn btn-success form-control" :disabled="isOptionSizeNotValid.status">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Sell for ${{getTotal.toFixed(2)}}
      </button>
      <div></div>

      <button v-if="!isEnoughAllowance" @click="approveAllowanceOption" class="btn btn-success form-control" :disabled="isOptionSizeNotValid.status">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Approve the sell (${{getTotal.toFixed(2)}})
      </button>
      <div></div>
    </div>

    <small v-if="allowanceNeeded && getSellType" class="show-text form-text text-center">
      You'll need to make 2 transactions (if already holding options): approve & sell. If you want to sell to open, you must toggle "WRITE" first.
    </small>
    <div></div>

    <small v-if="allowanceNeeded && !getSellType" class="show-text form-text text-center">
        You'll need to make 1-3 transactions (if not holding options): approve (and deposit) collateral.
    </small>
  </div>

  <!-- Approve Confirmation Modal -->
  <div v-if="isGetBuy" class="modal fade" :id="'approveModal'+getUniqueOptionId" tabindex="-1" aria-labelledby="approveModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="approveModalLabel">Confirm allowance</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Choose the amount of {{buyWith}} that you want to give 
          <a target="_blank" :href="'https://polygonscan.com/address/'+getLiquidityPoolAddress">this pool</a> 
          on DeFi Options spending approval for:

          <div class="form-check" @click="unlimitedApproval=false">
            <input 
              class="form-check-input" 
              name="buyApprovalCheckbox" 
              type="radio" id="specifiedRadio" 
              :value="!unlimitedApproval"
              :checked="!unlimitedApproval"
            >
            <label class="form-check-label" for="specifiedRadio">
              ${{getTotal.toFixed(2)}}
            </label>
          </div>

          <div class="form-check" @click="unlimitedApproval=true">
            <input 
              class="form-check-input" 
              name="buyApprovalCheckbox" 
              type="radio" id="unlimitedRadio"
              :value="unlimitedApproval"
              :checked="unlimitedApproval"
            >
            <label class="form-check-label" for="unlimitedRadio">
              Unlimited amount of {{buyWith}}
            </label>
          </div>

          <p class="mt-3">
            After the approval transaction goes through you can click the Buy button and actually buy the option.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cancel</button>
          <button @click="approveAllowance" type="button" class="btn btn-success" data-bs-dismiss="modal">
            <span v-if="!unlimitedApproval">Approve {{buyWith}} for ${{getTotal.toFixed(2)}}</span>
            <span v-if="unlimitedApproval">Approve {{buyWith}} (unlimited)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  
</div>
  
</template>

<script>
import { mapGetters } from "vuex";
import OptionDataItem from '../OptionDataItem.vue';
import OptionTokenContractJson from "../../contracts/RedeemableToken.json";
import ChainlinkContractJson from "../../contracts/ChainlinkFeed.json";
import ERC20ContractJson from "../../contracts/ERC20.json";
import addresses from "../../contracts/addresses.json";
//import OptionTokenContractJson from "../../contracts/RedeemableToken.json";

export default {
  name: "Option",
  props: ["option", "side"],
  data() {
    return {
      buyWith: "DAI",
      loading: false,
      optionPrice: null,
      optionPriceSell: null,
      optionPriceFormatted: "loading",
      optionPriceFormattedSell: "loading",
      selectedOptionSize: 0.1,
      selectedOptionVolume: null,
      showForm: false,
      selectedSellType: "SELL",
      selectedCoveredType: "COVERED",
      slippage: 2, // 2% by default
      tooLowVolume: false,
      unlimitedApproval: false,
      underlyingBalance: 0,
      underlyingSymbol: "N/A",
      underlyingAddr: "N/A",
      writingOptionsBalance: 0,
      writingStepTx: 0,
    }
  },

  components: { 
    OptionDataItem
  },

  created() {
    this.getOptionPrice();
    this.fetchUnderlyingAssetBalance();

    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("dai/fetchLpAllowance");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("usdc/fetchLpAllowance");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
    this.$store.dispatch("optionsExchange/fetchExchangeBalanceAllowance");
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainId", "getWeb3"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolContract", "getLiquidityPoolAddress"]),
    ...mapGetters("dai", ["getDaiAddress", "getUserDaiBalance", "getDaiContract", "getLpDaiAllowance"]),
    ...mapGetters("optionsExchange", ["getOptionsExchangeAddress", "getOptionsExchangeContract", "getExchangeUserBalance", "getUserExchangeBalanceAllowance, getOptionTokenAddress"]),
    ...mapGetters("usdc", ["getUsdcAddress", "getUserUsdcBalance", "getUsdcContract", "getLpUsdcAllowance"]),

    allowanceNeeded() {
      if (this.buyWith === "DAI") {
        return this.getLpDaiAllowance < this.getTotal;

      } else if (this.buyWith === "USDC") {
        return this.getLpUsdcAllowance < this.getTotal;

      } else if (this.buyWith === "USDT") { // Tether
        return true; // TODO

      } else if (this.buyWith === "Exchange Balance") {
        return this.getUserExchangeBalanceAllowance < this.getTotal;
      } 

      return false;
    },

    getBreakEvenPrice() {
      if (this.side == "BUY") {
        if (this.option.symbol.includes("EC")) { // CALL
          return "$" + Number(Number(this.optionPrice)+Number(this.option.strike)).toFixed(2);
        } else if (this.option.symbol.includes("EP")) { // PUT
          return "$" + Number(Number(this.option.strike)-Number(this.optionPrice)).toFixed(2);
        }
      } else {
        return "N/A";
      }
      return null;
    },
    
    getMaxOptionSize() {
      let availableOptionVolume = Math.floor(Number(this.selectedOptionVolume*1000))/1000;
      let optionPrice = Number(this.optionPrice);
      let maxTotal = availableOptionVolume * optionPrice;

      if (this.isGetSell) {
        // max option size that current user can write

        if (this.selectedCoveredType === "COVERED") {
          console.log("in covered");
          let userBalance = Number(this.underlyingBalance);

          if (maxTotal > userBalance) {
            return userBalance;
          } else {
            return availableOptionVolume;
          }
        } else {
          // NAKED
          let userBalance = Number(this.getUserStablecoinBalance);
          console.log("userBalance: " + userBalance);
          console.log("collateralNeededRaw: " + this.collateralNeededRaw);
          console.log("selectedOptionSize: " + this.selectedOptionSize);
          if (this.collateralNeededRaw > userBalance) {
            return (this.selectedOptionSize * (userBalance / this.collateralNeededRaw)).toFixed(4);
          } else {
            return (this.selectedOptionSize * this.collateralNeededRaw).toFixed(4);
          }
        }
      } else {
        let userBalance = Number(this.getUserStablecoinBalance);

        if (maxTotal > Number(this.getUserStablecoinBalance)) {
          return Math.floor(Number(userBalance / optionPrice * 1000))/1000;
        } else {
          return availableOptionVolume;
        }
      }
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
      return Number(this.selectedOptionSize) * ((this.side == "BUY") ? Number(this.optionPrice) : Number(this.optionPriceSell));
    },
    getUniqueOptionId() {
      return this.option.symbol.replace("/", "-");
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

    getUserUnderlyingBalance() {
      return this.underlyingBalance;
    },

    getReqiredCollateral() {
      return this.collateralNeededRaw;
    },

    getUnderlying() {
      return this.underlyingSymbol + " (" + this.underlyingAddr + ")";
    },

    isGetBuy() {
      return this.side == "BUY"
    },
    isGetSell() {
      return this.side == "SELL"
    },
    isOptionSizeNotValid() { // validation for option size
      // option size bigger than volume.
      if (Number(this.selectedOptionSize) > Number(this.selectedOptionVolume)) {
        return {status: true, message: "Must not be bigger than " + Math.floor(Number(this.selectedOptionVolume*1000))/1000 + "!"};
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
        return {status: true, message: "Must not be empty or zero!"};
      }

      // total bigger than balance
      if ((this.getTotal > Number(this.getUserStablecoinBalance)) && (this.side == "BUY")) {
        if (this.buyWith === "Exchange Balance") {
          return {status: true, message: "Your exchange balance is too low."};
        }

        return {status: true, message: "Your " + this.buyWith + " balance is too low."};
      }

      return {status: false, message: "Valid option size"};
    },
    isEnoughAllowance() {
      if (Number(this.optionAllowance) >= Number(this.selectedOptionSize)) {
        return true;
      }

      return false;
    },

    isBuyWithExchangeBalance() {
      return this.buyWith === "Exchange Balance";
    },

    getSellType() {
      return this.selectedSellType == "SELL";
    },

    getCoveredType() {
      return this.selectedCoveredType == "COVERED";
    }
  },

  watch: {
      selectedOptionSize: async function() {
        console.log("before calcCollateral");
        this.calcCollateral().then(this.writingOptionsBalance += 1);
        console.log("after calcCollateral");
      }
  },

  methods: {
    async approveAllowance() {
      let component = this;
      component.loading = true;

      component.getOptionPrice(); // refresh the option price
      component.fetchUnderlyingAssetBalance();

      // define unit and token contract
      let unit = "ether"; // Exchange Balance & DAI - 18 decimals
      let tokenContract = component.getOptionsExchangeContract; // Exchange Balance contract

      if (component.buyWith === "USDT") {
        unit = "kwei"; // USDT (Tether) - 4 decimals
        // TODO: tokenContract = ...; // USDT contract
      }

      if (component.buyWith === "USDC") {
        unit = "mwei"; // USDC - 6 decimals
        tokenContract = component.getUsdcContract; // USDC contract
      }

      if (component.buyWith === "DAI") {
        tokenContract = component.getDaiContract; // DAI contract
      }

      // define allowance value
      let allowanceValue = component.getTotal * 1.05; // make it 5% bigger to avoid slippage issues

      if (component.unlimitedApproval) {
        allowanceValue = 10 ** 9; // 1B tokens as "unlimited" value
      }

      const allowanceValueWei = component.getWeb3.utils.toWei(String(allowanceValue.toFixed(4)), unit); // round to 4 decimals
      
      // call the approve method
      try {
        await tokenContract.methods.approve(component.getLiquidityPoolAddress, allowanceValueWei).send({
          from: component.getActiveAccount
        }).on('transactionHash', function(hash){
          console.log("tx hash: " + hash);
          component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

        }).on('receipt', function(receipt){
          console.log(receipt);

          if (receipt.status) {
            component.$toast.success("The approval was successfull. You can buy the option now.");

            // refresh values
            if (component.buyWith === "DAI") {
              // needs to be updated this way because Polygon RPC nodes are slow with updating state
              component.$store.state.dai.lpAllowance = allowanceValue;
            } else if (component.buyWith === "USDC") {
              // needs to be updated this way because Polygon RPC nodes are slow with updating state
              component.$store.state.usdc.lpAllowance = allowanceValue;
            } else if (component.buyWith === "USDT") {
              // needs to be updated this way because Polygon RPC nodes are slow with updating state
              // component.$store.state.tether.lpAllowance = allowanceValue;
            } else if (component.buyWith === "Exchange Balance") {
              // needs to be updated this way because Polygon RPC nodes are slow with updating state
              component.$store.state.optionsExchange.userExchangeBalanceAllowance = allowanceValue;
            }

            component.getOptionPrice(); // refresh the option price

          } else {
            component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
          }

        }).on('error', function(error){
          console.log(error);
          component.$toast.error("There has been an error. Please contact the DeFi Options support.");
        });
      } catch (e) {
          window.console.log("Error:", e);
          component.$toast.error("The transaction has been reverted. Please try again or contact DeFi Options support.");
      } finally {
        component.loading = false;
      }

    },

    async buyOption() {
      let component = this;
      component.loading = true;

      component.getOptionPrice(); // refresh the option price

      let optionSizeWei = component.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether");
      let optionUnitPrice = component.getWeb3.utils.toWei(String(component.optionPrice), "ether");

      // buy option transaction
      try {
        await component.getLiquidityPoolContract.methods.buy(
          component.option.symbol, // symbol
          optionUnitPrice, // price per one option
          optionSizeWei, // volume a.k.a. user's selected option size
          component.getStablecoinAddress, // selected stablecoin
        ).send({
          from: component.getActiveAccount
        }).on('transactionHash', function(hash){
          console.log("tx hash: " + hash);
          component.$toast.info("The Buy transaction has been submitted. Please wait for it to be confirmed.");

        }).on('receipt', function(receipt){
          console.log(receipt);

          if (receipt.status) {
            component.$toast.success("You have successfully bought an option.");

            // refresh values
            if (component.buyWith === "DAI") {
              component.$store.dispatch("dai/fetchUserBalance");

              if (component.getTotal === Number(component.$store.state.dai.lpAllowance)) {
                console.log("equal")
                component.$store.state.dai.lpAllowance = 0;
              } else {
                console.log("not equal")
                component.$store.state.dai.lpAllowance = Number(component.$store.state.dai.lpAllowance) - component.getTotal;
              }

              //component.$store.dispatch("dai/fetchLpAllowance");

            } else if (component.buyWith === "USDC") {
              component.$store.dispatch("usdc/fetchUserBalance");
              
              if (component.getTotal === Number(component.$store.state.usdc.lpAllowance)) {
                component.$store.state.usdc.lpAllowance = 0;
              } else {
                component.$store.state.usdc.lpAllowance = Number(component.$store.state.usdc.lpAllowance) - component.getTotal;
              }
              //component.$store.dispatch("usdc/fetchLpAllowance");

            } else if (component.buyWith === "USDT") {
              // TODO
              //component.$store.dispatch("tether/fetchUserBalance");
              

              //this.$store.dispatch("tether/fetchLpAllowance");

            } else if (component.buyWith === "Exchange Balance") {
              component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");

              if (component.getTotal === Number(component.$store.state.optionsExchange.userExchangeBalanceAllowance)) {
                component.$store.state.optionsExchange.userExchangeBalanceAllowance = 0;
              } else {
                component.$store.state.optionsExchange.userExchangeBalanceAllowance = Number(component.$store.state.optionsExchange.userExchangeBalanceAllowance) - component.getTotal;
              }
              
              //component.$store.dispatch("optionsExchange/fetchExchangeBalanceAllowance");
            }
            
          } else {
            component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
          }

        }).on('error', function(error){
          console.log(error);
          component.$toast.error("There has been an error. Please contact the DeFi Options support.");
        });
      } catch (e) {
          window.console.log("Error:", e);
          //component.$toast.error("The transaction has been reverted. Please contact DeFi Options support.");
          
      } finally {
        component.setFormData(); // refresh the option price
        component.loading = false;
      }
    },

    async getOptionPrice() {
      // fetch option price
      let result = await this.getLiquidityPoolContract.methods.queryBuy(this.option.symbol).call();
      let resultSell = await this.getLiquidityPoolContract.methods.querySell(this.option.symbol).call();
      
      if (result) {
        this.optionPrice = this.getWeb3.utils.fromWei(result.price, "ether") * (1 + (this.slippage/100));
        this.optionPriceFormatted = "$" + Number(this.optionPrice).toFixed(2);
      }

      if (resultSell) {
        this.optionPriceSell = this.getWeb3.utils.fromWei(resultSell.price, "ether") * (1 + (this.slippage/100));
        this.optionPriceFormattedSell = "$" + Number(this.optionPriceSell).toFixed(2);
      }
    },

    setBuyWith(choice) {
      this.buyWith = choice;
    },

    async setFormData() {
      this.selectedOptionSize = 0.1;
      this.optionPrice = null;
      this.optionPriceSell = null;
      this.optionPriceFormatted = "loading";
      this.optionPriceFormattedSell = "loading";
      this.selectedOptionVolume = null;

      // fetch option price and volume
      let result = await this.getLiquidityPoolContract.methods.queryBuy(this.option.symbol).call();
      let resultSell = await this.getLiquidityPoolContract.methods.querySell(this.option.symbol).call();
      
      if (result) {
        this.optionPrice = this.getWeb3.utils.fromWei(result.price, "ether") * (1 + (this.slippage/100));

        this.optionPriceFormatted = "$" + Number(this.optionPrice).toFixed(2);
        this.selectedOptionVolume = this.getWeb3.utils.fromWei(result.volume, "ether");

        if (this.selectedOptionVolume < 0.001) {
          this.tooLowVolume = true;
        }
      }

      if (resultSell) {
        this.optionPriceSell = this.getWeb3.utils.fromWei(resultSell.price, "ether") * (1 + (this.slippage/100));

        this.optionPriceFormattedSell = "$" + Number(this.optionPriceSell).toFixed(2);
        this.selectedOptionVolume = this.getWeb3.utils.fromWei(resultSell.volume, "ether");

        if (this.selectedOptionVolume < 0.001) {
          this.tooLowVolume = true;
        }
      }
      
    },

    toggleForm() {
      this.getOptionPrice(); // refresh the option price
      this.fetchUnderlyingAssetBalance(); // refresh underlying balance

      if (this.showForm) {
        this.showForm = false;
      } else {
        this.setFormData();
        this.calcCollateral();
        this.showForm = true;
      }
    },
    
    // approve allowance to sell an option
    async approveAllowanceOption() {
      let component = this;
      component.loading = true;

      // convert selected option size to wei
      let tokensWei = component.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether");
      const allowanceValue = component.selectedOptionSize;

      if (this.option.address === undefined) {
        this.option.address = await component.getOptionsExchangeContract.methods.resolveToken(this.option.symbol).call();
      }

      // option token contract
      const optionContract = new component.getWeb3.eth.Contract(OptionTokenContractJson.abi, this.option.address);

      // call the approve method
      await optionContract.methods.approve(component.getLiquidityPoolAddress, tokensWei).send({
        from: component.getActiveAccount

      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("The approval was successfull. You can sell the option now.");

          component.optionAllowance += allowanceValue; // manually increase the allowance amount
          component.$store.dispatch("optionsExchange/fetchUserOptions"); // refresh values
          
        } else {
          component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
        }
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the DeFi Options support.");
      });

    },

    async fetchExpiryPrice() {
      if (Number(this.option.timestamp)*1e3 < Date.now()) {
        let priceFeedType = this.option.pair;

        const feedAddress = addresses[priceFeedType][parseInt(this.getChainId)];
        const feedContract = new this.getWeb3.eth.Contract(ChainlinkContractJson.abi, feedAddress);
        const historicPriceObj = await feedContract.methods.getPrice(this.option.timestamp).call();
        this.expiryPrice = Number(this.getWeb3.utils.fromWei(historicPriceObj.price, "ether")).toFixed(0);
      }

    },

    async fetchUnderlyingAssetBalance() {

      let priceFeedType = this.option.pair;

      const feedAddress = addresses[priceFeedType][parseInt(this.getChainId)];
      const feedContract = new this.getWeb3.eth.Contract(ChainlinkContractJson.abi, feedAddress);
      const underlyingAddr = await feedContract.methods.getUnderlyingAddr().call();
      const underlyingContract = new this.getWeb3.eth.Contract(ERC20ContractJson.abi, underlyingAddr);
      const underlyingBalanceWei = await underlyingContract.methods.balanceOf(this.getActiveAccount).call();
      const underlyingDecimals = await underlyingContract.methods.decimals().call();
      const underlyingSymbol = await underlyingContract.methods.symbol().call();
      this.underlyingSymbol = underlyingSymbol;
      this.underlyingAddr = underlyingAddr;
      this.underlyingBalance = Number(underlyingBalanceWei / (this.getWeb3.utils.toBN(10 ** underlyingDecimals))).toFixed(4);
    },

    async fetchOptionAllowance() {
      if (this.option.address === undefined) {
        this.option.address = await this.getOptionsExchangeContract.methods.resolveToken(this.option.symbol).call();
      }

      const optionContract = new this.getWeb3.eth.Contract(OptionTokenContractJson.abi, this.option.address);

      const allowanceWei = await optionContract.methods.allowance(this.getActiveAccount, this.getLiquidityPoolAddress).call();

      this.optionAllowance = this.getWeb3.utils.fromWei(String(allowanceWei), "ether");
    },

    isOptionExpired(option) {
      return Math.floor(Date.now()/1000) > Number(option.timestamp);
    },

    async sellOption() {
      const component = this;
      component.loading = true;

      component.setSellData(component.option); // fetch price again to avoid errors 

      const optionSizeWei = component.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether");
      const optionUnitPrice = component.getWeb3.utils.toWei(String(component.selectedOptionPrice), "ether");

      // sell option transaction
      await component.getLiquidityPoolContract.methods.sell(
        component.option.symbol, // symbol
        optionUnitPrice, // price per one option
        optionSizeWei, // volume a.k.a. user's selected option size
      ).send({
        from: component.getActiveAccount
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("You have successfully sold an option. Please reload the website to refresh values.");

          // reduce the amount of options user can sell
          // needs to be reduced manually, because Polygon nodes have a lag
          // BigNumber needs to be used to avoid precision errors
          let bnHolding = component.getWeb3.utils.toBN(component.getWeb3.utils.toWei(String(component.option.holding), "ether"));
          let bnSold = component.getWeb3.utils.toBN(component.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether"));
          component.option.holding = component.getWeb3.utils.fromWei(bnHolding.sub(bnSold), "ether").toString();
        } else {
          component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
        }
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the DeFi Options support.");
      });

    },

    async setSellData() {
      const result = await this.getLiquidityPoolContract.methods.querySell(this.option.symbol).call();

      if (result) {
        this.selectedOptionPrice = this.getWeb3.utils.fromWei(String(result.price), "ether");
        this.selectedOptionVolume = this.getWeb3.utils.fromWei(String(result.volume), "ether");

        if (!this.selectedOptionSize) {
          this.selectedOptionSize = this.getMaxOptionSize;
        }

        // hardcoded 1% slippage
        this.selectedOptionPrice -= Number(this.selectedOptionPrice) * 0.01;
      }
    },

    // approve the amount of underlying to use as collateral
    async approveAllowanceCovered() {
      let component = this;
      component.loading = true;

      let priceFeedType = this.option.pair;

      const feedAddress = addresses[priceFeedType][parseInt(component.getChainId)];
      const feedContract = new component.getWeb3.eth.Contract(ChainlinkContractJson.abi, feedAddress);
      const underlyingAddr = await feedContract.methods.getUnderlyingAddr().call();

      // underlying token contract
      const underlyingContract = new component.getWeb3.eth.Contract(ERC20ContractJson.abi, underlyingAddr);
      // get underlying balance in wei
      const underlyingBalanceWei = await underlyingContract.methods.balanceOf(this.getActiveAccount).call();
      const selectedUnderlyingBalanceWei = component.selectedOptionSize * underlyingBalanceWei;
      const underlyingDecimals = await underlyingContract.methods.decimals().call();
      const allowanceValue = Number(selectedUnderlyingBalanceWei / (this.getWeb3.utils.toBN(10 ** underlyingDecimals))).toFixed(4);

      // call the approve method
      await underlyingContract.methods.approve(component.getOptionsExchangeAddress, selectedUnderlyingBalanceWei).send({
        from: component.getActiveAccount

      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("The approval was successfull. You can write the option now.");

          component.underlyingAllowance = allowanceValue; // manually increase the allowance amount
          component.writingStepTx = 1;
          
        } else {
          component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
        }
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.writingStepTx = 0;
        component.$toast.error("There has been an error. Please contact the DeFi Options support.");
      });
    },

    // write option covered by underlying balance
    async writeCovered() {
      let component = this;
      component.loading = true;

      let priceFeedType = this.option.pair;

      // get underlying balance in wei
      const feedAddress = addresses[priceFeedType][parseInt(this.getChainId)];
      const optionSizeWei = this.getWeb3.utils.toWei(String(component.selectedOptionSize), "ether");
      const strikeInWei = this.getWeb3.utils.toWei(String(component.option.strikeRaw / 10 **18), "ether");

      // write covered option transaction
      console.log("optionSizeWei: "+optionSizeWei);
      console.log("strikeRaw: "+ component.option.strikeRaw);
      console.log("strikeInWei: "+ strikeInWei);
      console.log("timestamp: " + parseInt(component.option.timestamp));
      console.log("getActiveAccount: "+ component.getActiveAccount);
      try {
        await component.getOptionsExchangeContract.methods.writeCovered(
          feedAddress, // feed address
          component.getWeb3.utils.toBN(optionSizeWei), // volume of options to write,
          strikeInWei, // strike price of option
          parseInt(component.option.timestamp), // maturity of option in utc
          component.getActiveAccount, // option writer
        ).send({
          from: component.getActiveAccount
        }).on('transactionHash', function(hash){
          console.log("tx hash: " + hash);
          component.$toast.info("The writeCovered transaction has been submitted. Please wait for it to be confirmed.");

        }).on('receipt', function(receipt){
          console.log(receipt);

          if (receipt.status) {
            component.$toast.success("You have successfully wrote an option. Now you may sell it.");
            component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
            component.writingStepTx = 0;
          } else {
            component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
          }

        }).on('error', function(error){
          console.log(error);
          component.$toast.error("There has been an error. Please contact the DeFi Options support.");
        });
      } catch (e) {
          window.console.log("Error:", e);
          //component.$toast.error("The transaction has been reverted. Please contact DeFi Options support.");
          
      } finally {
        component.loading = false;
        
      }
    },

    //calculated the mount of collateral needed to write the option
    async calcCollateral() {
      let priceFeedType = this.option.pair;

      const feedAddress = addresses[priceFeedType][parseInt(this.getChainId)];

      console.log("in calcCollateral ");
      const optionSizeWei = this.getWeb3.utils.toWei(String(this.selectedOptionSize), "ether");
      console.log("optionSizeWei: "+optionSizeWei);
      console.log("this.option.strikeRaw: "+ this.option.strikeRaw);
      console.log("this.option.timestamp: "+ this.option.timestamp);

      const collateralNeeded = await this.getOptionsExchangeContract.methods.calcCollateral(
        feedAddress, // feed address
        this.getWeb3.utils.toBN(optionSizeWei), //volume of options to write
        (this.option.type === "CALL") ? 0 : 1, //option type
        parseInt(this.option.strikeRaw), // strike price of option
        parseInt(this.option.timestamp), // maturity of option in utc
      ).call();

      console.log(collateralNeeded * 1.0025);

      this.collateralNeededRaw = collateralNeeded * 1.0025; //estimate higher just in case

      console.log(this.collateralNeededRaw);
    },

    // approve the amount of stablecoins to use as collateral agaisnt exchange

    async approveStablecoinCollateralDeposit() {
      let component = this;
      component.loading = true;

      component.fetchUnderlyingAssetBalance();

      // define unit and token contract
      let unit = "ether"; // Exchange Balance & DAI - 18 decimals
      let tokenContract;

      if (component.buyWith === "USDT") {
        unit = "kwei"; // USDT (Tether) - 4 decimals
        // TODO: tokenContract = ...; // USDT contract
      }

      if (component.buyWith === "USDC") {
        unit = "mwei"; // USDC - 6 decimals
        tokenContract = component.getUsdcContract; // USDC contract
      }

      if (component.buyWith === "DAI") {
        tokenContract = component.getDaiContract; // DAI contract
      }

      // define allowance value
      let allowanceValue = component.getTotal * 1.05; // make it 5% bigger to avoid slippage issues

      if (component.unlimitedApproval) {
        allowanceValue = 10 ** 9; // 1B tokens as "unlimited" value
      }

      const allowanceValueWei = component.getWeb3.utils.toWei(String(allowanceValue.toFixed(4)), unit); // round to 4 decimals
      
      // call the approve method
      try {
        await tokenContract.methods.approve(component.getOptionsExchangeAddress, allowanceValueWei).send({
          from: component.getActiveAccount
        }).on('transactionHash', function(hash){
          console.log("tx hash: " + hash);
          component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

        }).on('receipt', function(receipt){
          console.log(receipt);

          if (receipt.status) {
            component.$toast.success("The approval was successfull. You can write the option now.");

            // refresh values
            if (component.buyWith === "DAI") {
              // needs to be updated this way because Polygon RPC nodes are slow with updating state
              component.$store.state.dai.exchangeAllowance = allowanceValue;
            } else if (component.buyWith === "USDC") {
              // needs to be updated this way because Polygon RPC nodes are slow with updating state
              component.$store.state.usdc.exchangeAllowance = allowanceValue;
            } else if (component.buyWith === "USDT") {
              // needs to be updated this way because Polygon RPC nodes are slow with updating state
              // component.$store.state.tether.exchangeAllowance = allowanceValue;
            }

          } else {
            component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
          }

        }).on('error', function(error){
          console.log(error);
          component.$toast.error("There has been an error. Please contact the DeFi Options support.");
        });
      } catch (e) {
          window.console.log("Error:", e);
          component.$toast.error("The transaction has been reverted. Please try again or contact DeFi Options support.");
      } finally {
        component.loading = false;
        component.writingStepTx = 1;
      }

    },

    //deposit collateral into exchange if not avaialble exchnage balance
    async depositCollateral() {
      let component = this;
      component.loading = true;

      // define unit and token contract
      let unit = "ether"; // Exchange Balance & DAI - 18 decimals

      if (component.buyWith === "USDT") {
        unit = "kwei"; // USDT (Tether) - 4 decimals
        // TODO: tokenContract = ...; // USDT contract
      }

      if (component.buyWith === "USDC") {
        unit = "mwei"; // USDC - 6 decimals
      }

      let tokensWei = component.getWeb3.utils.toWei(component.depositValue, unit);

      // make a deposit
      await component.getOptionsExchangeContract.methods.depositTokens(
        component.getActiveAccount, 
        component.getStablecoinContract._address, 
        tokensWei
      ).send({
        from: component.getActiveAccount
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("Your collateral deposit was successfull.");

          component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
          
          component.depositValue = null;
        } else {
          component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
        }
        
        component.loading = false;
        component.writingStepTx = 2;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the DeFi Options support.");
      });
    },

    // write stablecoin collateral options
    async writeOptions() {
      let component = this;
      component.loading = true;

      let priceFeedType = this.option.pair;

      // get underlying balance in wei
      const feedAddress = addresses[priceFeedType][parseInt(this.getChainId)];
      const feedContract = new this.getWeb3.eth.Contract(ChainlinkContractJson.abi, feedAddress);
      const underlyingAddr = await feedContract.methods.getUnderlyingAddr().call();
      const underlyingContract = new component.getWeb3.eth.Contract(ERC20ContractJson.abi, underlyingAddr);
      const underlyingBalanceWei = await underlyingContract.methods.balanceOf(this.getActiveAccount).call();
      //const underlyingDecimals = await underlyingContract.methods.decimals().call();
      //const allowanceValue = Number(underlyingBalanceWei / (this.getWeb3.utils.toBN(10 ** underlyingDecimals))).toFixed(0);

      // write stablecoin collateral options transaction
      try {
        await component.getOptionsExchangeContract.methods.writeOptions(
          feedAddress, // feed address
          underlyingBalanceWei / (100), // volume of options to write, TODO: NEED TO FIX THIS TO ALLOW FOR USER DEFINABLE
          component.option.strikeRaw, // stike price of option
          component.option.timestamp, // maturity of option in utc
          component.getActiveAccount, // option writer
        ).send({
          from: component.getActiveAccount
        }).on('transactionHash', function(hash){
          console.log("tx hash: " + hash);
          component.$toast.info("The writeOptions transaction has been submitted. Please wait for it to be confirmed.");

        }).on('receipt', function(receipt){
          console.log(receipt);

          if (receipt.status) {
            component.$toast.success("You have successfully wrote an option. Now you may sell it.");
            component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
          } else {
            component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
          }

        }).on('error', function(error){
          console.log(error);
          component.$toast.error("There has been an error. Please contact the DeFi Options support.");
        });
      } catch (e) {
          window.console.log("Error:", e);
          //component.$toast.error("The transaction has been reverted. Please contact DeFi Options support.");
          
      } finally {
        component.loading = false;
        component.writingStepTx = 0;
      }
    },

    showInfo() {
      // enable tooltip
      var infoEl = document.getElementById('infoEl')
      var tooltip = new window.bootstrap.Tooltip(infoEl)
      tooltip.show();
    },

    changeSellType(sellType) {
      this.selectedSellType = sellType;
    },

    changeCoveredType(sellType) {
      this.selectedCoveredType = sellType;
    }
  }
}
</script>

<style>
.data-item {
  margin-right: 5px;
}

.div-flex {
  display: flex;
}

.fa-chevron-down, .fa-chevron-up {
  margin-left: 10px;
}

.max-buy {
  color: #5AFFB0;
  text-decoration: underline;
}

.max-buy:hover {
  color: #5AFFB0;
  text-decoration: none;
  cursor: pointer;
}

.show-form {
  margin-top: 24px;
}

.show-input {
  max-width: 200px;
  margin-right: 10px;
}

.show-text {
  color: white;
  font-weight: 400;
  font-size: 12px;
}

.section-small {
  margin-top: 16px;
}

/* Mobile screens */
@media screen and (max-width: 600px) {
  .data-time {
    margin-right: 0px;
  }

  .div-flex {
    display: block;
  }
}
</style>