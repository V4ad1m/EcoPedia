document.addEventListener("DOMContentLoaded", function () {
  // Мобильное меню
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const nav = document.querySelector(".nav");

  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener("click", function () {
      nav.style.display = nav.style.display === "block" ? "none" : "block";
    });
  }

  // Подсветка активной ссылки в меню
  const currentPage = location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav a");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (currentPage === linkPage) {
      link.classList.add("active");
    }
  });

  // Плавная прокрутка для якорных ссылок
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
});
