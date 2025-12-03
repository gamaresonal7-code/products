// ==== UI helpers ====
const cartCountEl = document.getElementById("cart-count");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const showLoginBtn = document.getElementById("show-login");
const showSignupBtn = document.getElementById("show-signup");
const goToSignupLink = document.getElementById("go-to-signup");
const goToLoginLink = document.getElementById("go-to-login");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const logoutBtn = document.getElementById("logout-btn");
const loginLink = document.getElementById("login-link");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginEmailError = document.getElementById("login-email-error");
const loginPasswordError = document.getElementById("login-password-error");
const loginFeedback = document.getElementById("login-feedback");

const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupConfirm = document.getElementById("signup-confirm");
const signupNameError = document.getElementById("signup-name-error");
const signupEmailError = document.getElementById("signup-email-error");
const signupPasswordError = document.getElementById("signup-password-error");
const signupConfirmError = document.getElementById("signup-confirm-error");
const signupFeedback = document.getElementById("signup-feedback");
const passwordStrength = document.getElementById("password-strength");

const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
if (cartCountEl) cartCountEl.textContent = cartCount;

// ==== Form toggling ====
function showLogin() {
  showLoginBtn.classList.add("active");
  showSignupBtn.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
}
function showSignup() {
  showSignupBtn.classList.add("active");
  showLoginBtn.classList.remove("active");
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
}
showLoginBtn?.addEventListener("click", showLogin);
showSignupBtn?.addEventListener("click", showSignup);
goToSignupLink?.addEventListener("click", (e) => { e.preventDefault(); showSignup(); });
goToLoginLink?.addEventListener("click", (e) => { e.preventDefault(); showLogin(); });

// ==== Password visibility toggles ====
document.querySelectorAll(".toggle-visibility").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    btn.textContent = isPassword ? "Hide" : "Show";
  });
});

// ==== Validation helpers ====
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) { return emailRegex.test(email.trim()); }
function isStrongPassword(pw) {
  return /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && pw.length >= 8;
}
function strengthLabel(pw) {
  if (!pw) return "Strength: —";
  const score = [/[A-Z]/, /[a-z]/, /\d/, /.{10,}/].reduce((s, r) => s + (r.test(pw) ? 1 : 0), 0);
  return ["Strength: Weak", "Strength: Fair", "Strength: Good", "Strength: Strong"][Math.max(0, score - 1)];
}

// Live validation
signupPassword?.addEventListener("input", () => {
  passwordStrength.textContent = strengthLabel(signupPassword.value);
});

// ==== Firebase init (replace with your config) ====
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Persistence (default is local; can set to session if desired)
// auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ==== Forgot password ====
forgotPasswordLink?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  loginFeedback.textContent = "";
  loginEmailError.textContent = "";
  if (!isValidEmail(email)) {
    loginEmailError.textContent = "Enter a valid email to reset your password.";
    return;
  }
  try {
    await auth.sendPasswordResetEmail(email);
    loginFeedback.textContent = "Password reset email sent. Check your inbox.";
  } catch (err) {
    loginFeedback.textContent = `Error: ${err.message}`;
  }
});

// ==== Signup ====
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Clear errors
  signupNameError.textContent = "";
  signupEmailError.textContent = "";
  signupPasswordError.textContent = "";
  signupConfirmError.textContent = "";
  signupFeedback.textContent = "";

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const pw = signupPassword.value;
  const confirm = signupConfirm.value;

  // Validate
  let valid = true;
  if (!name) { signupNameError.textContent = "Full name is required."; valid = false; }
  if (!isValidEmail(email)) { signupEmailError.textContent = "Invalid email format."; valid = false; }
  if (!isStrongPassword(pw)) {
    signupPasswordError.textContent = "Min 8 chars with uppercase, lowercase, and a number.";
    valid = false;
  }
  if (pw !== confirm) { signupConfirmError.textContent = "Passwords do not match."; valid = false; }

  if (!valid) return;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pw);
    // Update display name
    await cred.user.updateProfile({ displayName: name });
    signupFeedback.textContent = "Signup successful! Redirecting...";
    setTimeout(() => window.location.href = "index.html", 800);
  } catch (err) {
    signupFeedback.textContent = `Error: ${err.message}`;
  }
});

// ==== Login ====
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Clear errors
  loginEmailError.textContent = "";
  loginPasswordError.textContent = "";
  loginFeedback.textContent = "";

  const email = loginEmail.value.trim();
  const pw = loginPassword.value;

  let valid = true;
  if (!isValidEmail(email)) { loginEmailError.textContent = "Invalid email format."; valid = false; }
  if (!pw) { loginPasswordError.textContent = "Password is required."; valid = false; }
  if (!valid) return;

  try {
    await auth.signInWithEmailAndPassword(email, pw);
    loginFeedback.textContent = "Login successful! Redirecting...";
    setTimeout(() => window.location.href = "index.html", 800);
  } catch (err) {
    loginFeedback.textContent = `Error: ${err.message}`;
  }
});

// ==== Auth state & Logout ====
auth.onAuthStateChanged((user) => {
  if (user) {
    // Logged in
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (loginLink) loginLink.style.display = "none";
    // Optionally reflect username somewhere
    // document.querySelector('.logo').textContent = `🛍️ MyStore — Hi, ${user.displayName || 'User'}`;
  } else {
    // Logged out
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginLink) loginLink.style.display = "inline-block";
  }
});

logoutBtn?.addEventListener("click", async () => {
  try {
    await auth.signOut();
    // Clear any session-only data if needed
    // localStorage.removeItem('sessionKey');
    window.location.href = "auth.html";
  } catch (err) {
    alert(`Logout error: ${err.message}`);
  }
});
