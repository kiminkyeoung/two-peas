<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-copyright">
        &copy; {{ new Date().getFullYear() }} Twopeace. All Rights Reserved.
      </div>
      <div class="footer-links">
        <router-link to="/privacy-policy">개인정보처리방침</router-link>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
};
</script>

<style scoped src="../assets/footer.css"></style>
