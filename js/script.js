window.addEventListener("scroll", function () {
  const header = document.querySelector(".site-header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

document.querySelector(".search-toggle").addEventListener("click", function () {
  document.querySelector(".search-form").classList.toggle("active");
});

document.querySelectorAll(".btn-outline").forEach((button) => {
  button.addEventListener("click", function () {
    this.classList.toggle("active");
    this.textContent = this.classList.contains("active")
      ? "✓ Ma Liste"
      : "+ Ma Liste";
  });
});
