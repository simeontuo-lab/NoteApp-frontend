const baseURL = `https://appnote-backend-1.onrender.com`
const form = document.getElementById("new-user-form")
const statusMessage = document.getElementById("status-message")

form.addEventListener("submit", async (event) => {
    event.preventDefault()
    
    const username = form.elements.username.value
    const password = form.elements.password.value

    statusMessage.innerText = "Creating account..."
    statusMessage.className = "status-message"

    const response = await fetch(`${baseURL}/users`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username,
            password: password
        })
    })

    if (!response.ok) {
        statusMessage.innerText = `Failed to create account.`
        statusMessage.className = "status-message error"
        return false
    }

    const user = await response.json()
    statusMessage.innerText = `Account created! Redirecting to login...`
    statusMessage.className = "status-message success"
    form.reset()
    
    // Redirect to login page after 1 second
    setTimeout(() => {
        window.location.href = "login.html"
    }, 1000)
})