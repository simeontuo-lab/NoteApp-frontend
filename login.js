const baseURL = window.location.protocol === "file:" ? "http://localhost:3000" : window.location.origin;
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
        
        // Store auth token, user ID, and username in localStorage
        localStorage.setItem("userId", data._id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("authToken", data._id);
        
        statusMessage.innerText = `Welcome, ${data.username}!`;
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
