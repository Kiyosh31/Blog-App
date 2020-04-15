import Search from "./modules/search"
import Chat from "./modules/Chat"


if (document.querySelector(".header-search-icon")) {
    new Search()
}

if (document.querySelector("#chat-wrapper")) {
    new Chat()
}