const publishableKey = "pk_test_YWN0aXZlLW1vbmdvb3NlLTkzLmNsZXJrLmFjY291bnRzLmRldiQ"; // <- Add Publishable Key here

const startClerk = async () => {
  const Clerk = window.Clerk;

  try {
    // Load Clerk environment and session if available
    await Clerk.load();

    const userButton = document.getElementById("user-button");
    const authLinks = document.getElementById("auth-links");

    Clerk.addListener(({ user }) => {
      // Display links conditionally based on user state
      authLinks.style.display = user ? "none" : "block";
    });

    if (Clerk.user) {
      console.log("login sucessful, now we do soemthing")
      // Mount user button component
      Clerk.mountUserButton(userButton);
      userButton.style.margin = "auto";
      window.location.href = '/landing_page.html?user='+ Clerk.user.username;
      
    }
  } catch (err) {
    console.error("Error starting Clerk: ", err);
  }
};

(() => {
  const script = document.createElement("script");
  script.setAttribute("data-clerk-publishable-key", publishableKey);
  script.async = true;
  script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
  script.crossOrigin = "anonymous";
  script.addEventListener("load", startClerk);
  script.addEventListener("error", () => {
    document.getElementById("no-frontend-api-warning").hidden = false;
  });
  document.body.appendChild(script);
})();
