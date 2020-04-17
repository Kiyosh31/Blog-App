import Search from "./modules/search"
import Chat from "./modules/Chat"
import RegistrationForm from "./modules/registrationForm"



if (document.querySelector(".header-search-icon")) {
    new Search()
}

if (document.querySelector("#chat-wrapper")) {
    new Chat()
}

if (document.querySelector("#registration-form")) {
    new RegistrationForm()
}