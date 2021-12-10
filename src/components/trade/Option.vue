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
    </div>

    <div class="row mt-3">
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

    <small v-if="allowanceNeeded" class="show-text form-text text-center">
        You'll need to make 2 transactions: approve & sell.
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
      slippage: 2, // 2% by default
      tooLowVolume: false,
      unlimitedApproval: false
    }
  },

  components: { 
    OptionDataItem
  },

  created() {
    this.getOptionPrice();

    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("dai/fetchLpAllowance");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("usdc/fetchLpAllowance");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
    this.$store.dispatch("optionsExchange/fetchExchangeBalanceAllowance");
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
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
      // max option size that current user can buy
      let availableOptionVolume = Math.floor(Number(this.selectedOptionVolume*1000))/1000;
      let optionPrice = Number(this.optionPrice);
      let maxTotal = availableOptionVolume * optionPrice;
      let userBalance = Number(this.getUserStablecoinBalance);

      if (maxTotal > Number(this.getUserStablecoinBalance)) {
        return Math.floor(Number(userBalance / optionPrice * 1000))/1000;
      } else {
        return availableOptionVolume;
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
  },

  methods: {
    async approveAllowance() {
      let component = this;
      component.loading = true;

      component.getOptionPrice(); // refresh the option price

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

              if (!component.unlimitedApproval) {
                component.$store.state.dai.lpAllowance = 0;
              }
              //component.$store.dispatch("dai/fetchLpAllowance");

            } else if (component.buyWith === "USDC") {
              component.$store.dispatch("usdc/fetchUserBalance");
              
              if (!component.unlimitedApproval) {
                component.$store.state.usdc.lpAllowance = 0;
              }
              //component.$store.dispatch("usdc/fetchLpAllowance");

            } else if (component.buyWith === "USDT") {
              // TODO
              //component.$store.dispatch("tether/fetchUserBalance");
              
              /*
              if (!component.unlimitedApproval) {
                component.$store.state.tether.lpAllowance = 0;
              }*/

              //this.$store.dispatch("tether/fetchLpAllowance");

            } else if (component.buyWith === "Exchange Balance") {
              component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");

              if (!component.unlimitedApproval) {
                component.$store.state.optionsExchange.userExchangeBalanceAllowance = 0;
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

      if (this.showForm) {
        this.showForm = false;
      } else {
        this.setFormData();
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
        let priceFeedType = "";

        if (this.option.pair === "ETH/USD") {
          priceFeedType = "ChainlinkFeedEth";
        } else if (this.option.pair === "BTC/USD") {
          priceFeedType = "ChainlinkFeedBtc";
        } /*else if (this.option.pair === "MATIC/USD") {
          priceFeedType = "ChainlinkFeedBtc";
        }*/

        const feedAddress = addresses[priceFeedType][parseInt(this.getChainId)];
        const feedContract = new this.getWeb3.eth.Contract(ChainlinkContractJson.abi, feedAddress);
        const historicPriceObj = await feedContract.methods.getPrice(this.option.timestamp).call();
        this.expiryPrice = Number(this.getWeb3.utils.fromWei(historicPriceObj.price, "ether")).toFixed(0);
      }

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

    toggleSellForm() {
      if (this.showSellForm) {
        this.showSellForm = false;
      } else {
        this.setSellData();
        this.showSellForm = true;
      }
    },

    showInfo() {
      // enable tooltip
      var infoEl = document.getElementById('infoEl')
      var tooltip = new window.bootstrap.Tooltip(infoEl)
      tooltip.show();
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