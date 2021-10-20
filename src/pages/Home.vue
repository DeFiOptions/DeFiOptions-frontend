<template>
  <div>

    <!-- Hero -->
    <section class="text-center hero">

      <div class="row">
        <div class="col-md-6 offset-md-3">
          <h1 class="hero-title">Decentralized Options Exchange</h1>
        </div>
      </div>

      <div class="d-flex flex-row justify-content-center text-white">
        <div class="hero-line-left"></div>
        <div>on</div>
        <img src="@/assets/img/polygon-logo-inverted.svg" class="polygon-logo" />
        <div class="hero-line-right"></div>
      </div>
      
      <div class="d-flex flex-wrap flex-row justify-content-center text-uppercase hero-buttons" v-if="isUserConnected">
        <router-link to="/trade" style="text-decoration: none">
          <a class="btn btn-success m-1" href="/trade">Trade</a>
        </router-link>

        <router-link to="/invest" style="text-decoration: none">
          <a class="btn btn-outline-success m-1" href="/invest">Liquidity Pool</a>
        </router-link>

        <router-link to="/portfolio" style="text-decoration: none">
          <a class="btn btn-success m-1" href="/portfolio">Portfolio</a>
        </router-link>
      </div> 

      <div class="d-flex flex-wrap flex-row justify-content-center text-uppercase hero-buttons" v-if="!isUserConnected">
        <a class="btn btn-outline-success m-1" target="_blank" href="https://discord.gg/WCeKgHNz3z">Join Discord</a>
        <button class="btn btn-success m-1" @click="connectWeb3Modal">Connect wallet</button>
      </div> 

    </section>
    <!-- END Hero -->

    <div class="d-flex flex-row justify-content-center mb-5 mt-3">
      <hr class="section-divider" />
    </div>

        <!-- Why Options -->
    <section id="why-options" class="text-center">

      <div class="row mb-5">
        <div class="col-md-6 offset-md-3">
          <h3 class="section-title">Why options?</h3>
        </div>
      </div>

      <div class="row text-white text-center why-options-row mx-5">

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/arrow-down.svg" class="feature-image" />
          
          <h3 class="feature-title">Limit losses</h3>

          <p class="feature-text">
            Options present an alternative over stop orders, while keeping independence of the underlying asset.
          </p>
        </div>

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/leverage.svg" class="feature-image" />
          
          <h3 class="feature-title">Leverage</h3>

          <p class="feature-text">
            Because options are much cheaper to purchase in comparison to the underlying asset, you can 
            purchase more and get more upside potential.
          </p>
        </div>

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/strategies.svg" class="feature-image" />
          
          <h3 class="feature-title">Strategies</h3>

          <p class="feature-text">
            Options allow us the flexibility to come up with many strategies that both limit risk and 
            maximize return.
          </p>
        </div>

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/yield.svg" class="feature-image" />
          
          <h3 class="feature-title">Yield</h3>

          <p class="feature-text">
            Providing liquidity in stablecoin-based pool allows diversification of capital allocation, and 
            exposing users to significantly lower risk than writing actual options.
          </p>
        </div>
      </div>
    </section>
    <!-- END Why Options -->

    <!-- PeckShield -->
    <div class="d-flex flex-wrap flex-row justify-content-center mx-3">
      <div class="peckshield-banner d-flex flex-wrap flex-row justify-content-around align-items-center">
        <img src="@/assets/img/security-icon.svg" class="img-fluid peckshield-image" />

        <div class="peckshield-text">
          <h2 class="peckshield-title">Security is our top priority.</h2>

          <p class="text-white peckshield-description">DeFi Options DAO is currently being audited.</p>
        </div>
        
      </div>
    </div>
    <!-- END PeckShield -->

    <div class="d-flex flex-row justify-content-center mb-5 mt-5">
      <hr class="section-divider" />
    </div>

    <!-- Why DeFi Options -->
    <section id="why-defi-options" class="text-center mt-5 mb-5">

      <div class="row mb-5">
        <div class="col-md-6 offset-md-3">
          <h3 class="section-title">Why DeFi Options?</h3>
        </div>
      </div>

      <div class="row text-white text-center why-options-row mx-5">

        <div class="col-md-6 why-options-col">
          <img src="@/assets/img/efficient.svg" class="feature-image" />
          
          <h3 class="feature-title">Efficient Option Prices</h3>

          <div class="d-flex flex-row justify-content-center">
            <p class="feature-text-short">
              Our flexible pricing model will allow traders to get DeFi options at the most efficient 
              prices on the market.
            </p>
          </div>
        </div>

        <div class="col-md-6 why-options-col">
          <img src="@/assets/img/pool.svg" class="feature-image" />
          
          <h3 class="feature-title">Stablecoin Pool</h3>

          <div class="d-flex flex-row justify-content-center">
            <p class="feature-text-short">
              Provide liquidity in stablecoins to mitigate impermanent loss and start earning 
              stablecoin-based yield in any market condition. 
            </p>
          </div>
        </div>

        <div class="col-md-6 why-options-col">
          <img src="@/assets/img/scalability.svg" class="feature-image" />
          
          <h3 class="feature-title">Scalability & Flexibility</h3>

          <div class="d-flex flex-row justify-content-center">
            <p class="feature-text-short">
              DeFi Options supports buying put and call options for a wide range of underlying 
              assets selected and approved by the DAO.
            </p>
          </div>
          
        </div>

        <div class="col-md-6 why-options-col">
          <img src="@/assets/img/settled.svg" class="feature-image" />
          
          <h3 class="feature-title">Stablecoin-Settled Calls & Puts</h3>

          <div class="d-flex flex-row justify-content-center">
            <p class="feature-text-short">
              Buy, sell and earn profits in stablecoins. Stablecoins allow simplicity while removing 
              volatility risk for users.
            </p>
          </div>
        </div>

      </div>

    </section>
    <!-- END Why DeFi Options -->

    <div class="d-flex flex-row justify-content-center mb-5 mt-5">
      <hr class="section-divider" />
    </div>

    <!-- Community -->
    <section id="why-defi-options" class="text-center mt-5">

      <div class="row mb-5">
        <div class="col-md-6 offset-md-3">
          <h3 class="section-title">
            We are a community<br>
            - not a company.
          </h3>
        </div>
      </div>

      <div class="row text-white text-center why-options-row mx-5">

        <div class="col-md-6 why-options-col">
          <img src="@/assets/img/noncustodial.svg" class="feature-image" />
          
          <h3 class="feature-title">Non-custodial</h3>

          <div class="d-flex flex-row justify-content-center">
            <p class="feature-text-short">
              Users of DeFi Options have full ownership of their funds at all times
            </p>
          </div>
        </div>

        <div class="col-md-6 why-options-col">
          <img src="@/assets/img/decentralized.svg" class="feature-image" />
          
          <h3 class="feature-title">Decentralised</h3>

          <div class="d-flex flex-row justify-content-center">
            <p class="feature-text-short">
              All users play a part in shaping the future of the platform.
            </p>
          </div>
        </div>

      </div>
    </section>
    <!-- END Community -->

    <div class="d-flex flex-row justify-content-center mb-5 mt-5">
      <hr class="section-divider" />
    </div>

    <!-- Join us -->
    <div class="text-center mt-5">

      <div class="row mb-5">
        <div class="col-md-6 offset-md-3">
          <h3 class="section-title">
            Join us
          </h3>
        </div>
      </div>

      <ul class="nav pb-3 mb-3 row">

        <li class="nav-item col mt-4">
          <a href="https://discord.gg/WCeKgHNz3z" target="_blank" class="btn btn-social">
            <i class="fab fa-discord"></i>
          </a>
        </li>

        <li class="nav-item col mt-4">
          <a href="https://twitter.com/DeFiOptionsDAO" target="_blank" class="btn btn-social">
            <i class="fab fa-twitter"></i>
          </a>
        </li>

        <li class="nav-item col mt-4">
          <a href="https://www.reddit.com/r/DeFiOptionsDAO/" target="_blank" class="btn btn-social">
            <i class="fab fa-reddit"></i>
          </a>
        </li>

        <li class="nav-item col mt-4">
          <a href="https://github.com/DeFiOptions" target="_blank" class="btn btn-social">
            <i class="fab fa-github"></i>
          </a>
        </li>

        <li class="nav-item col mt-4">
          <a href="https://t.me/DeFiOptionsDiscussions" target="_blank" class="btn btn-social">
            <i class="fab fa-telegram"></i>
          </a>
        </li>

      </ul>

    </div>
    <!-- END Join us -->

    <div class="row mt-5">
      <div class="col-md-10 offset-md-1 text-center text-white">
        <small class="disclaimer-text">
          DISCLAIMER: DeFi Options DAO (DOD) tokens are utility tokens targeted solely at creating a 
          community of supporters of the protocol. They don't hold any monetary value, nor can they be 
          characterized as investment, shares or securities of any type. Owning DOD tokens doesn't entitle 
          you any rights or guarantees of any kind. This project doesn't provide any assurance of being 
          finished or launched in any network other than Kovan testnet. If you've swapped any other token 
          or crypto to acquire DOD tokens be advised that you WON'T be refunded under any circumstances. 
          Acquire DOD tokens at your own discretion. You are waiving your rights and agreeing to these terms 
          and conditions if you decide to go further and become a holder of DOD tokens. If you are uncertain 
          as to anything in this informative website or you are not prepared to lose all tokens or crypto that 
          you swap for acquiring DOD tokens, we strongly urge you not to acquire any DOD tokens, not to engage 
          with DOD and to leave this website immediately.
        </small>
      </div>
    </div>


  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Home",
  computed: {
    ...mapGetters("accounts", ["getChainName", "isUserConnected"]),
  },
  created() {
    this.$store.dispatch("accounts/initWeb3Modal");
    this.$store.dispatch("accounts/ethereumListener");
  },
  methods: {
    ...mapActions("accounts", ["connectWeb3Modal"]),
  }
}
</script>

<style scoped>
.btn-social:hover {
  background-color: #00072D;
  border-color: #5AFFB0;
  color: #5AFFB0;
}

.btn-social {
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  padding: 0;
  border-radius: 50%;
  font-size: 1.3rem;
  background-color: #5AFFB0;
  border-color: #5AFFB0;
  color: #00072D;
}

.feature-image {
  margin-bottom: 24px;
}

.feature-text {
  font-size: 14px;
  font-weight: 300;
}

.feature-text-short {
  font-size: 14px;
  font-weight: 300;
  width: 460px;
}

.feature-title {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  text-transform: none;
}

.hero {
  margin-top: 120px;
  margin-bottom: 120px;
}

.hero-buttons {
  margin-top: 70px;
}

.hero-line-left {
  width: 190px;
  height: 1px;
  background: linear-gradient(270deg, #7951DD 0%, rgba(32, 164, 221, 0) 100%);
  margin-top: 11px;
  margin-right: 16px;
}

.hero-line-right {
  width: 190px;
  height: 1px;
  background: linear-gradient(270deg, #7951DD 0%, rgba(32, 164, 221, 0) 100%);
  margin-top: 11px;
  transform: rotate(180deg);
  margin-left: 16px;
}

.hero-title {
  font-weight: 400;
  font-size: 60px;
  color: #FFFFFF;
}

.ml-40-px {
  margin-left: 40px;
}

.nav-item {
  color: #5AFFB0;
  font-weight: 500;
}

.polygon-logo {
  height: 26px;
  margin-left: 16px;
}

.section-divider {
  background: linear-gradient(270deg, rgba(32, 164, 221, 0) 0%, #5AFFB0 48.96%, rgba(32, 164, 221, 0) 100%);
  width: 220px;
  height: 1px;
}

.section-title {
  font-weight: 400;
  font-size: 32px;
  color: #FFFFFF;
  text-transform: none;
}

.why-options-col {
  padding-right: 20px;
  padding-left: 20px;
  margin-bottom: 40px;
}

/* iPhone 8 */
@media screen and (max-width: 375px) {
  .hero-title {
    font-size: 50px;
  }
}

/* iPhone SE */
@media screen and (max-width: 320px) {
  .hero-title {
    font-size: 45px;
  }

  .ml-40-px {
    margin-left: 30px;
  }
}
</style>