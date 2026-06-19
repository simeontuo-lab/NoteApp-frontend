const baseURL = `https://appnote-backend-1.onrender.com`;
const loginForm = document.getElementById("login-form");
const statusMessage = document.getElementById("status-message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    statusMessage.innerText = "Logging in...";
    statusMessage.className = "status-message";

    try {
        const response = await fetch(`${baseURL}/login/password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            statusMessage.innerText = "Invalid username or password.";
            statusMessage.className = "status-message error";
            return false;
        }

        const data = await response.json();
        
        // Store auth token in localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("username", username);
        
        statusMessage.innerText = `Welcome, ${username}!`;
        statusMessage.className = "status-message success";
        
        // Redirect to the note page
        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);
        
    } catch (err) {
        console.error("Login error:", err);
        statusMessage.innerText = "Network error. Please try again.";
        statusMessage.className = "status-message error";
    }
});
