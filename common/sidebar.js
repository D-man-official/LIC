document.addEventListener("DOMContentLoaded", () => {
  const userNameEl = document.getElementById("userName");
  const userAvatarEl = document.getElementById("userAvatar");

  const name = localStorage.getItem("loggedInUser");
  const userId = localStorage.getItem("loggedInUserId");

  if (name && userNameEl) {
    userNameEl.textContent = name.toUpperCase();

    // Animation start state (moved from home.js)
    userNameEl.style.opacity = "0";
    userNameEl.style.transform = "translateY(10px)";

    // Animate in
    setTimeout(() => {
      userNameEl.style.transition = "all 0.6s ease";
      userNameEl.style.opacity = "1";
      userNameEl.style.transform = "translateY(0)";
    }, 150);
  }

  if (userId && userAvatarEl) {
    userAvatarEl.src = `../userImg/${userId}.jpg`;

    // Simple fade-in animation for avatar
    userAvatarEl.style.opacity = "0";
    userAvatarEl.style.transition = "opacity 0.6s ease";
    setTimeout(() => {
      userAvatarEl.style.opacity = "1";
    }, 150);

    // Optional: Fallback if image fails to load (create default.jpg in userImg/)
    userAvatarEl.onerror = () => {
      userAvatarEl.src = '../userImg/default.jpg';
    };
  }
});