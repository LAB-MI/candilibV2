<template>
  <div class="login" v-bind:style="{ backgroundImage: 'url(' + backgroundImgUrl + ')' }">
    <form class="login-form">
      <h2>
        ADMINISTRATEUR
      </h2>
      <h3>
        C<span class="col-red">A</span>NDILIB
      </h3>
      <div class="wrap-input100 validate-input" data-validate="Courriel incorrect">
        <input class="input100" type="text" name="email">
        <span class="focus-input100" data-placeholder="Courriel"></span> </div>
      <div class="wrap-input100 validate-input" data-validate="Mot de passe incorrect"> <span class="btn-show-pass"> <i class="zmdi zmdi-eye"></i> </span>
        <input class="input100" type="password" name="pass">
        <span class="focus-input100" data-placeholder="Mot de passe"></span> </div>
      <div class="container-login100-form-btn">
        <div class="wrap-login100-form-btn">
          <div class="login100-form-bgbtn"></div>
          <a href="../site_candilib_admin/administrateurs.html" class="login100-form-btn lien-spec"> Valider </a>
        </div>
      </div>
      <div class="text-center">
        <a href="#" class="forgotten-password" data-toggle="modal">
          Mot de passe oublié ?
        </a>
      </div>
      <!--
      -->
    </form>
  </div>
</template>

<script>
import backgroundImgUrl from '../assets/bg-login.jpg'

export default {
  name: 'Login',
  data () {
    return {
      backgroundImgUrl,
    }
  },
}
</script>

<style scoped lang="stylus">
  .login {
    display: flex;
    min-height: 100vh;
    flex-wrap: wrap;
    justify-content:center;
    align-items:center;
    padding:15px;
    background-repeat:no-repeat;
    background-size:cover;
    background-position:center;
    position:relative;
    z-index:1;
  }

  .login-form {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    padding: 3.5em 3.5em 2em 3.5em;
    box-shadow: 0 5px 10px 0px rgba(0, 0, 0, 0.9);
  }

  .forgotten-password {
    color: #888;
    font-size: 0.8em;
    text-decoration: none;
    &:hover {
      color: #555;
    }
  }
</style>
