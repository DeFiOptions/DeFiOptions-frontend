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
        <img src="@/assets/polygon-logo-inverted.svg" class="polygon-logo" />
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

    </section>
    <!-- END Hero -->

    <!-- If user not connected -->
    <div v-if="!isUserConnected" class="text-center">
      <h2 class="text-center text-white mb-5">Please connect your crypto wallet.</h2>

      <button type="button" class="btn btn-success mb-5" @click="connectWeb3Modal">Connect wallet</button>
    </div>
    <!-- END If user not connected -->

    <!-- Footer -->
    <footer class="text-center mt-5">

      <div class="row mb-5">
        <div class="col-md-6 offset-md-3">
          <h3 class="section-title">
            Join us
          </h3>
        </div>
      </div>

      <ul class="nav justify-content-center pb-3 mb-3">

        <li class="nav-item">
          <a href="https://discord.gg/WCeKgHNz3z" target="_blank" class="btn btn-social">
            <i class="fab fa-discord"></i>
          </a>
        </li>

        <li class="nav-item ml-40-px">
          <a href="https://twitter.com/DeFiOptionsDAO" target="_blank" class="btn btn-social">
            <i class="fab fa-twitter"></i>
          </a>
        </li>

        <li class="nav-item ml-40-px">
          <a href="https://www.reddit.com/r/DeFiOptionsDAO/" target="_blank" class="btn btn-social">
            <i class="fab fa-reddit"></i>
          </a>
        </li>

      </ul>

      <ul class="nav justify-content-center pb-3 mb-5">

        <li class="nav-item">
          <a href="https://github.com/DeFiOptions" target="_blank" class="btn btn-social">
            <i class="fab fa-github"></i>
          </a>
        </li>

        <li class="nav-item ml-40-px">
          <a href="https://t.me/DeFiOptionsDiscussions" target="_blank" class="btn btn-social">
            <i class="fab fa-telegram"></i>
          </a>
        </li>

      </ul>

    </footer>
    <!-- END Footer -->


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

.section-title {
  font-weight: 400;
  font-size: 32px;
  color: #FFFFFF;
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