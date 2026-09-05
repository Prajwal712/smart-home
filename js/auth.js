/* =====================================================
   INITIALIZE LUCIDE ICONS
   ===================================================== */
document.addEventListener("DOMContentLoaded", function () {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
});


/* =====================================================
   THEME
   ===================================================== */

const THEME_KEY = "schoolAutomationTheme";

function applyTheme(theme) {
    const darkMode = theme === "dark";
    document.body.classList.toggle("dark-mode", darkMode);

    const button = document.getElementById("themeToggle");
    if (button) {
        const iconEl = button.querySelector('[data-lucide]');
        const spanEl = button.querySelector('span');
        if (iconEl) {
            iconEl.setAttribute('data-lucide', darkMode ? 'sun' : 'moon');
        }
        if (spanEl) {
            spanEl.textContent = darkMode ? 'Light' : 'Dark';
        }
        button.setAttribute("aria-label", darkMode ? "Switch to light mode" : "Switch to dark mode");
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }
}

function toggleTheme() {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
}


/* =====================================================
   LOGIN
   ===================================================== */

const VALID_CREDENTIALS = [
    ["default", "default"],
    ["admin", "admin"]
];

function login(event) {

    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const normalizedUsername = username.toLowerCase();
    const normalizedPassword = password.toLowerCase();

    const isValidLogin = VALID_CREDENTIALS.some(
        ([validUsername, validPassword]) =>
            normalizedUsername === validUsername.toLowerCase() &&
            normalizedPassword === validPassword.toLowerCase()
    );

    if (isValidLogin) {
        sessionStorage.setItem("smartHomeLoggedIn", "true");
        document.getElementById("loginError").style.display = "none";
        showDashboard();
    } else {
        document.getElementById("loginError").style.display = "block";
    }

}



/* =====================================================
   SHOW DASHBOARD
   ===================================================== */

function showDashboard() {

    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dashboard").classList.add("active");

    // Re-render icons for dynamically-shown elements
    setTimeout(function() {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }, 50);
}



/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {

    sessionStorage.removeItem("smartHomeLoggedIn");

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    document.getElementById("dashboard").classList.remove("active");
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("loginError").style.display = "none";

}



/* =====================================================
   CHECK LOGIN ON LOAD
   ===================================================== */

window.addEventListener("DOMContentLoaded", function () {

    const savedTheme = localStorage.getItem(THEME_KEY) || "light";
    applyTheme(savedTheme);

    const themeButton = document.getElementById("themeToggle");
    if (themeButton) {
        themeButton.addEventListener("click", toggleTheme);
    }

    const loggedIn = sessionStorage.getItem("smartHomeLoggedIn");
    if (loggedIn === "true") {
        showDashboard();
    } else {
        document.getElementById("dashboard").classList.remove("active");
        document.getElementById("loginPage").classList.remove("hidden");
    }

});
