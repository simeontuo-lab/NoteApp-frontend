const baseURL = `https://megaphone-server.onrender.com` ///////////////////
const form = document.getElementById("new-user-form")
const statusMessage = document.getElementById("status-message")

form.addEventListener("submit", async (event) => {
    event.preventDefault()
    
    const username = form.elements.username.value
    const password = form.elements.password.value

    const response = await fetch(`${baseURL}/users`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username,
            password: password
        })
    })

    if (!response.ok) {
        statusMessage.innerText = `Failed to create new user.`
        return false
    }

    const user = await response.json()
    statusMessage.innerText = `Created new user: ${username}.`
    form.reset()
})