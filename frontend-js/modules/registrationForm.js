import axios from "axios"

export default class RegistrationFrom {
  constructor() {
    this.form = document.querySelector("#registration-form")
    this.allFields = document.querySelectorAll(
      "#registration-form .form-control"
    )
    this.insertValidationElements()
    this.username = document.querySelector("#username-register")
    this.username.previousValue = ""
    this.email = document.querySelector("#email-register")
    this.email.previousValue = ""
    this.password = document.querySelector("#password-register")
    this.password.previousValue = ""

    this.username.isUnique = false
    this.email.isUnique = false

    this.events()
  }

  // Events
  events() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault()
      this.formSubmitHandler()
    })

    this.username.addEventListener("keyup", () => {
      this.isDifferent(this.username, this.usernameHandler)
    })

    this.email.addEventListener("keyup", () => {
      this.isDifferent(this.email, this.emailHandler)
    })

    this.password.addEventListener("keyup", () => {
      this.isDifferent(this.password, this.passwordHandler)
    })

    this.username.addEventListener("blur", () => {
      this.isDifferent(this.username, this.usernameHandler)
    })

    this.email.addEventListener("blur", () => {
      this.isDifferent(this.email, this.emailHandler)
    })

    this.password.addEventListener("blur", () => {
      this.isDifferent(this.password, this.passwordHandler)
    })
  }

  // Methods
  isDifferent(element, handler) {
    if (element.previousValue != element.value) {
      handler.call(this)
    }
    element.previousValue = element.value
  }

  formSubmitHandler() {
    this.usernameImmediately()
    this.usernameAfterDelay()
    this.emailAfterDelay()
    this.passwordImmediately()
    this.passwordAfterDelay()

    if (
      this.username.isUnique &&
      !this.username.errors &&
      this.email.isUnique &&
      !this.username.errors &&
      !this.password.errors
    ) {
      this.form.submit()
    }
  }

  usernameHandler() {
    this.username.errors = false

    this.usernameImmediately()
    clearTimeout(this.username.timer)
    this.username.timer = setTimeout(() => this.usernameAfterDelay(), 800)
  }

  emailHandler() {
    this.email.errors = false

    clearTimeout(this.email.timer)
    this.email.timer = setTimeout(() => this.emailAfterDelay(), 800)
  }

  passwordHandler() {
    this.password.errors = false

    this.passwordImmediately()
    clearTimeout(this.password.timer)
    this.password.timer = setTimeout(() => this.passwordAfterDelay(), 800)
  }

  passwordImmediately() {
    if (this.password.value.length > 50) {
      this.showValidationError(
        this.password,
        "The password cannot exceed 50 characters."
      )
    }

    if (!this.password.errors) {
      this.hideValidationError(this.password)
    }
  }

  passwordAfterDelay() {
    if (this.password.value.length < 12) {
      this.showValidationError(
        this.password,
        "The password must be at least 12 characters."
      )
    }
  }

  emailAfterDelay() {
    if (!/^\S+@\S+$/.test(this.email.value)) {
      this.showValidationError(
        this.email,
        "You must provide a valid email address"
      )
    }

    if (!this.email.error) {
      axios
        .post("/doesEmailExist", { email: this.email.value })
        .then((response) => {
          if (response.data) {
            this.email.isUnique = false
            this.showValidationError(
              this.email,
              "That email is already being used."
            )
          } else {
            this.email.isUnique = true
          }
        })
        .catch(() => {
          console.log("Please try again later.")
        })
    }
  }

  usernameHandler() {
    this.username.errors = false

    this.usernameImmediately()
    clearTimeout(this.username.timer)
    this.username.timer = setTimeout(() => this.usernameAfterDelay(), 800)
  }

  usernameImmediately() {
    if (
      this.username.value != "" &&
      !/^([a-zA-Z0-9]+)$/.test(this.username.value)
    ) {
      this.showValidationError(
        this.username,
        "Username can only contain letters and numbers"
      )
    }

    if (this.username.value.length > 30) {
      this.showValidationError(
        this.username,
        "username cannot exceed more than 30 characters"
      )
    }

    if (!this.username.errors) {
      this.hideValidationError(this.username)
    }
  }

  hideValidationError(element) {
    element.nextElementSibling.classList.remove("liveValidateMessage--visible")
  }

  showValidationError(element, message) {
    element.nextElementSibling.innerHTML = message
    element.nextElementSibling.classList.add("liveValidateMessage--visible")
    element.errors = true
  }

  usernameAfterDelay() {
    if (this.username.value.length < 3) {
      this.showValidationError(
        this.username,
        "username must be at least 3 characters."
      )
    }

    if (!this.username.errors) {
      axios
        .post("/doesUsernameExist", {
          username: this.username.value,
        })
        .then((response) => {
          if (response.data) {
            this.showValidationError(
              this.username,
              "That username is already taken"
            )
            this.username.isUnique = false
          } else {
            this.username.isUnique = true
            this.hideValidationError(this.username)
          }
        })
        .catch(() => {
          console.log("Please try again later.")
        })
    }
  }

  insertValidationElements() {
    this.allFields.forEach((element) => {
      element.insertAdjacentHTML(
        "afterend",
        "<div class='alert alert-danger small liveValidateMessage'></div>"
      )
    })
  }
}
