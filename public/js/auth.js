renderNavbar();
renderFooter();

let mode = "login"; // or "signup"

const nameGroup = document.getElementById("nameGroup");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");
const errorMsg = document.getElementById("errorMsg");

function setMode(newMode) {
  mode = newMode;
  errorMsg.textContent = "";
  if (mode === "login") {
    nameGroup.classList.add("hidden");
    formTitle.textContent = "Welcome back";
    formSubtitle.textContent = "Log in to your account";
    submitBtn.textContent = "Log In";
    toggleText.innerHTML = `Don't have an account? <a id="toggleLink">Sign up</a>`;
  } else {
    nameGroup.classList.remove("hidden");
    formTitle.textContent = "Create an account";
    formSubtitle.textContent = "Sign up to start shopping";
    submitBtn.textContent = "Sign Up";
    toggleText.innerHTML = `Already have an account? <a id="toggleLink">Log in</a>`;
  }
  document.getElementById("toggleLink").addEventListener("click", () => {
    setMode(mode === "login" ? "signup" : "login");
  });
}

document.getElementById("toggleLink").addEventListener("click", () => setMode("signup"));

document.getElementById("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;

  try {
    const path = mode === "login" ? "/auth/login" : "/auth/signup";
    const body = mode === "login" ? { email, password } : { name, email, password };

    const data = await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
    setSession(data.token, data.user);
    window.location.href = data.user.role === "admin" ? "/admin.html" : "/index.html";
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});