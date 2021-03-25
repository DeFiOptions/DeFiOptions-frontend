<template>
  <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

      <!-- Sidebar Toggle (Topbar) -->
      <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3" @click="toggleSidebar">
          <i class="fa fa-bars"></i>
      </button>

      <!-- Topbar Navbar -->
      <ul class="navbar-nav ml-auto">

          <!-- Nav Item - Connect Wallet -->
          <li class="nav-item">
            <a class="nav-link text-muted" href="#" v-if="!isUserConnected" @click="connectWeb3Modal">Connect your wallet</a>
            <a class="nav-link text-muted" href="#" v-if="isUserConnected" @click="disconnectWeb3Modal">Disconnect {{getActiveAccount.substring(0, 7)}}...</a>
          </li>
          <!-- End of Nav Item - Connect Wallet -->
      </ul>

  </nav>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Navbar",
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "isUserConnected", "getWeb3Modal"]),
    ...mapGetters("sidebar", ["getCollapsedStatus"]),
  },
  created() {
    this.$store.dispatch("accounts/initWeb3Modal");
    this.$store.dispatch("accounts/ethereumListener");
  },
  methods: {
    ...mapActions("accounts", ["connectWeb3Modal", "disconnectWeb3Modal"]),
    
    toggleSidebar() {
      const el = document.body;

      if (this.getCollapsedStatus === true) {
        this.$store.dispatch("sidebar/sidebarCollapsedFalse");
        el.classList.remove("sidebar-toggled");
      } else {
        this.$store.dispatch("sidebar/sidebarCollapsedTrue");
        el.classList.add("sidebar-toggled");
      }
    }
  }
}
</script>
