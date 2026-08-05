import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  "https://zcshqqrjxiharymzesnl.supabase.co",
  "sb_publishable_kaHcZU4PciFFO5YICmkh_w_YBru5T2X",
);

// ========== AUTH LISTENER ==========================

supabase.auth.onAuthStateChange((event, session) => {
  const path = window.location.pathname;

  const isAuthpage =
    path.includes("index") || path.includes("register") || path === "/";

  const signOutBtn = document.getElementById("signOutBtn");

  if (session) {
    const user = session.user;

    if (isAuthpage) {
      window.location.href = "touren.html";
    }
  } else {
    if (!isAuthpage) {
      window.location.href = "/";
    }
  }
});

// ========== BUTTON EVENT LISTENERS & AUTH ==========
const emailInput = document.getElementById("authenticationEmailInput");
const passwordInput = document.getElementById("authenticationPasswordInput");

// Sign Up
const authenticationSignUpBtn = document
  .getElementById("authenticationSignUpBtn")
  ?.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Bitte E-Mail und Passwort eingeben!");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error at SignUp:", error.message);
      return;
    }

    alert(
      "Registrierung erfolgreich! Bitte überprüfe dein E-Mail-Postfach, um den Account zu bestätigen.",
    );
  });

// Sign In
const authenticationSignInBtn = document
  .getElementById("authenticationSignInBtn")
  ?.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Bitte E-Mail und Passwort eingeben!");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error at SignIn:", error.message);
      return;
    }
  });

// Sign Out
const signOutBtn = document
  .getElementById("signOutBtn")
  ?.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
  });
