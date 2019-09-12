import "./wallet.scss";

document.querySelectorAll("[data-send-message]").forEach((el) => {
  el.addEventListener("click", function(e) {
    const message = this.getAttribute("data-send-message");
    window.parent.postMessage({ message }, "*");
    e.target.classList.add("loading");
  });
});

const url = new URL(document.location);
document.querySelectorAll("[data-replace]").forEach((el) => {
  const key = el.getAttribute("data-replace");
  el.textContent = url.searchParams.get(key);
});
