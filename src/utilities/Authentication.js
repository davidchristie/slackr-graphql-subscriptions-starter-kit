import Auth0Lock from 'auth0-lock'
import EventEmitter from 'events'

export default class Authentication extends EventEmitter {

  constructor (clientId, domain) {
    super()
    this.lock = new Auth0Lock(clientId, domain, {})
    this.lock.on('authenticated', this.authenticate.bind(this))
    this.login = this.login.bind(this)
  }

  authenticate (tokenPayload) {
    this.lock.getUserInfo(tokenPayload.accessToken, (error, profile) => {
      if (error) {
        this.emit('error', error)
        return
      }
      this.setProfile(profile)
      this.emit('authenticated', profile, tokenPayload)
    })
    this.setToken(tokenPayload.idToken)
  }

  getProfile () {
    return JSON.parse(window.localStorage.getItem('user_profile'))
  }

  getToken () {
    return window.localStorage.getItem('scaphold_user_token')
  }

  loggedIn () {
    return !!this.getToken()
  }

  login () {
    this.lock.show()
  }

  logout () {
    window.localStorage.clear()
  }

  setProfile (profile) {
    window.localStorage.setItem('user_profile', JSON.stringify(profile))
  }

  setToken (idToken) {
    window.localStorage.setItem('scaphold_user_token', idToken)
  }

}
