import "./wallet.css";
const $ = qs => document.querySelector(qs);

const continueButton = $("[data-continue-button]");

if (continueButton) {
  continueButton.addEventListener("click", function() {
    window.parent.postMessage({ continue: true }, "*");
  });
}

const url = new URL(document.location);
document.querySelectorAll("[data-replace]").forEach(el => {
  const key = el.getAttribute("data-replace");
  el.textContent = url.searchParams.get(key);
  console.log("EL", el);
});
