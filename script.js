
function checkAuthentication() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login.html';
        return false;
    }
    
    
    const username = localStorage.getItem('username');
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay && username) {
        usernameDisplay.textContent = `Welcome, ${username}`;
    }
    
    return true;
}


function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}


if (!checkAuthentication()) {
    throw new Error('Not authenticated');
}

const noteForm = document.getElementById('note-form');
const baseURL = window.location.protocol === "file:" ? "http://localhost:3000" : window.location.origin;
const bodyInput = document.getElementById('content'); 
const titleInput = document.getElementById('title');  
const allPostsContainer = document.getElementById('allNotes'); 


let currentTitleFilter = null;


const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const bodyText = bodyInput.value.trim();
    const titleText = titleInput.value.trim();
    const username = localStorage.getItem('username');

    if (!bodyText || !titleText) return;

    try {
        const response = await fetch(`${baseURL}/posts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                body: bodyText,
                title: titleText,
                username: username
            })
        });

        if (response.ok) {
            noteForm.reset();
            
            fetchAndRenderPosts(currentTitleFilter);
        } else {
            console.error("Failed to save post to the server.");
        }
    } catch (err) {
        console.error("Network error while creating post:", err);
    }
});


fetchAndRenderPosts();


async function fetchAndRenderPosts(titleFilter = null) {
    currentTitleFilter = titleFilter; 
    allPostsContainer.innerHTML = '<li class="empty-state">Loading notes...</li>';

    try {
        const username = localStorage.getItem('username');
        const response = await fetch(`${baseURL}/posts?username=${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error("Server response error");
        
        let posts = await response.json();

        
        if (titleFilter) {
            posts = posts.filter(post => post.title === titleFilter);
            renderHeaderMeta(titleFilter, posts.length);
        } else {
            
            const existingMeta = document.getElementById('filter-meta');
            if (existingMeta) existingMeta.remove();
        }

        renderPostsToPage(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        allPostsContainer.innerHTML = '<li class="empty-state">Failed to load posts from server.</li>';
    }
}


async function deletePost(postId) {
    try {
        const username = localStorage.getItem('username');
        const response = await fetch(`${baseURL}/posts/${postId}?username=${encodeURIComponent(username)}`, {
            method: "DELETE"
        });
        
        if (response.ok) {
            fetchAndRenderPosts(currentTitleFilter);
        } else {
            console.error("Failed to delete post from server.");
        }
    } catch (err) {
        console.error("Error deleting post:", err);
    }
}


function renderHeaderMeta(titleValue, count) {
    let metaDiv = document.getElementById('filter-meta');
    
    if (!metaDiv) {
        metaDiv = document.createElement("div");
        metaDiv.id = "filter-meta";
        metaDiv.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-radius: 4px;";
        allPostsContainer.parentNode.insertBefore(metaDiv, allPostsContainer);
    }

    metaDiv.innerHTML = `
        <p style="margin: 0; font-weight: bold;">Notes with title '${escapeHTML(titleValue)}': ${count}</p>
        <button id="clear-filter" class="cancel-button" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
    `;

    document.getElementById('clear-filter').addEventListener('click', () => {
        fetchAndRenderPosts(null);
    });
}


function renderPostsToPage(posts) {
    allPostsContainer.innerHTML = '';

    if (posts.length === 0) {
        allPostsContainer.innerHTML = '<li class="empty-state">No notes found. Start typing above!</li>';
        return;
    }

    
    [...posts].reverse().forEach(post => {
        const li = document.createElement('li');
        li.className = 'note-item';

        const relativeTime = getRelativeTime(post.timecreated || Date.now());

        li.innerHTML = `
            <article>
                <header class="note-header">
                    <h3 class="note-title">
                        <a href="#" class="title-filter-link" data-title="${escapeHTML(post.title)}">
                            ${escapeHTML(post.title)}
                        </a>
                    </h3>
                    <span class="note-date">${relativeTime}</span>
                </header>
                <p class="note-content">${escapeHTML(post.body)}</p>
                <button class="delete-btn" data-id="${post._id}" aria-label="Delete note">❌ Delete</button>
            </article>
        `;

        
        li.querySelector('.title-filter-link').addEventListener('click', (e) => {
            e.preventDefault();
            fetchAndRenderPosts(e.target.dataset.title);
        });

        
        li.querySelector('.delete-btn').addEventListener('click', () => {
            deletePost(post._id);
        });

        allPostsContainer.appendChild(li);
    });
}


function getRelativeTime(timestamp) {
    const secondsSincePosted = Math.round((Date.now() - new Date(timestamp).getTime()) / 1000);
    
    let numberOfUnits = secondsSincePosted;
    let unitOfTime = "second";

    if (secondsSincePosted >= 60) {
        unitOfTime = "minute";
        numberOfUnits = Math.round(secondsSincePosted / 60);
    }
    if (secondsSincePosted >= 3600) {
        unitOfTime = "hour";
        numberOfUnits = Math.round(secondsSincePosted / 3600);
    }
    if (secondsSincePosted >= 86400) {
        unitOfTime = "day";
        numberOfUnits = Math.round(secondsSincePosted / 86400);
    }

   
    if (numberOfUnits < 0) return "Just now";

    return `posted ${numberOfUnits} ${unitOfTime}${numberOfUnits !== 1 ? "s" : ""} ago.`;
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}