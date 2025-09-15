  // submenu
  document.addEventListener("click", function (e) {
    const dropdown = document.querySelector(".dropdown_menu");
    // if click is outside dropdown
    if (dropdown && !e.target.closest(".dropdown_menu")) {
      dropdown.classList.remove("submenu");
    }
  });
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".menu-list");
  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      menu.classList.toggle("show");
      hamburger.classList.toggle("showbar");
    });
  }
