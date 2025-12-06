// frontend/my-book/src/js/interactivity.js

// --- Helper Functions ---
function getSelectedText() {
    let text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text.trim();
}

// Function to safely decode JWT
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Function to get current user info from token
function getCurrentUser() {
    const token = localStorage.getItem('access_token');
    if (token) {
        const decodedToken = decodeJwt(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) { // Check if token is expired
            return { username: decodedToken.sub, token: token };
        }
    }
    return null;
}

// --- Floating Button for Ask AI ---
function createFloatingButton(x, y, id, text, onClickHandler) {
    let button = document.getElementById(id);
    if (!button) {
        button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        Object.assign(button.style, {
            position: 'absolute',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 12px',
            cursor: 'pointer',
            zIndex: '10000',
            display: 'none', // Hidden by default
            boxShadow: '0px 2px 10px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontFamily: 'sans-serif'
        });
        document.body.appendChild(button);
        button.addEventListener('click', onClickHandler);
    }

    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.style.display = 'block';
    return button;
}

function hideFloatingButton(id) {
    const button = document.getElementById(id);
    if (button) {
        button.style.display = 'none';
    }
}

// --- AI Q&A Logic ---
async function sendQueryToBackend(question) {
    const backendUrl = window.location.origin + '/api/query'; 
    const user = getCurrentUser();

    if (!user) {
        alert("Please log in to ask questions to AI.");
        window.location.href = `${window.location.origin}/login`;
        return;
    }

    try {
        alert("Asking AI... please wait.");

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify({ question: question }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        alert("AI Answer:\n\n" + data.answer + "\n\nSources:\n" + JSON.stringify(data.sources, null, 2));

    } catch (error) {
        console.error('Error querying backend:', error);
        alert("Error asking AI: " + error.message + ". Please try again.");
    }
}

document.addEventListener('mouseup', (event) => {
    const selectedText = getSelectedText();
    if (selectedText.length > 0 && selectedText.length < 500) {
        createFloatingButton(event.pageX + 10, event.pageY - 30, 'ask-ai-button', 'Ask AI about this text', async () => {
            const question = prompt("What do you want to ask about this text?", selectedText);
            if (question) {
                await sendQueryToBackend(question);
            }
            hideFloatingButton('ask-ai-button');
        });
    } else {
        hideFloatingButton('ask-ai-button');
    }
});

document.addEventListener('mousedown', (event) => {
    const askAiButton = document.getElementById('ask-ai-button');
    if (askAiButton && event.target !== askAiButton && !askAiButton.contains(event.target)) {
        if (!window.getSelection || window.getSelection().toString().length === 0) {
             hideFloatingButton('ask-ai-button');
        }
    }
});


// --- Personalization Logic ---
async function fetchAndRenderPersonalizedContent(chapterId) {
    const backendUrl = `${window.location.origin}/api/personalize_chapter/${chapterId}`;
    const user = getCurrentUser();

    if (!user) {
        alert("Please log in to personalize content.");
        window.location.href = `${window.location.origin}/login`;
        return;
    }

    try {
        alert("Fetching personalized content... please wait.");

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const contentContainer = document.querySelector('.markdown') || document.querySelector('.theme-doc-markdown') || document.querySelector('.docs-content');

        if (contentContainer) {
            // Store original content temporarily for revert functionality
            contentContainer.dataset.originalContent = contentContainer.innerHTML;
            contentContainer.dataset.currentLanguage = 'en'; // Track current language

            const personalizationMessage = document.createElement('div');
            personalizationMessage.className = 'alert alert--info';
            personalizationMessage.style.marginBottom = '1rem';
            personalizationMessage.innerHTML = `<strong>Content Personalized for You!</strong> (Level: ${data.personalization_applied})<br/>This is a dynamically personalized version based on your profile. <button id="revert-content" class="button button--link">Show Original</button>`;
            
            contentContainer.innerHTML = data.personalized_content;
            contentContainer.prepend(personalizationMessage);

            document.getElementById('revert-content')?.addEventListener('click', () => {
                if (contentContainer.dataset.originalContent) {
                    contentContainer.innerHTML = contentContainer.dataset.originalContent;
                    contentContainer.style.direction = 'ltr'; // Ensure LTR for original
                    contentContainer.style.textAlign = 'left';
                    contentContainer.dataset.currentLanguage = 'en';
                    alert("Reverted to original content.");
                }
            });

            alert(`Chapter "${data.title}" personalized for you!`);
        } else {
            alert("Could not find content area to personalize.");
        }

    } catch (error) {
        console.error('Error personalizing content:', error);
        alert("Error personalizing content: " + error.message + ". Please ensure you are logged in and have a profile.");
    }
}

// --- Translation Logic (Urdu) ---
async function fetchAndRenderTranslatedContent(chapterId) {
    const backendUrl = `${window.location.origin}/api/translate_chapter/${chapterId}`;
    const user = getCurrentUser(); // Translation doesn't strictly require auth, but good practice

    if (!user) {
        alert("Please log in to translate content.");
        window.location.href = `${window.location.origin}/login`;
        return;
    }

    try {
        alert("Fetching Urdu translation... please wait.");

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user.token}`, // Send token if auth is required for translation
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const contentContainer = document.querySelector('.markdown') || document.querySelector('.theme-doc-markdown') || document.querySelector('.docs-content');

        if (contentContainer) {
            // Store original content if not already stored by personalization
            if (!contentContainer.dataset.originalContent) {
                contentContainer.dataset.originalContent = contentContainer.innerHTML;
            }
            contentContainer.dataset.currentLanguage = 'ur'; // Mark as Urdu

            const translationMessage = document.createElement('div');
            translationMessage.className = 'alert alert--success';
            translationMessage.style.marginBottom = '1rem';
            translationMessage.innerHTML = `<strong>اردو ترجمہ:</strong> (Urdu Translation)<br/>This content is translated into Urdu. <button id="revert-content" class="button button--link">Show Original</button>`;
            
            contentContainer.innerHTML = data.translated_content;
            contentContainer.prepend(translationMessage);

            // Apply RTL class
            contentContainer.classList.add('rtl-text');

            document.getElementById('revert-content')?.addEventListener('click', () => {
                if (contentContainer.dataset.originalContent) {
                    contentContainer.innerHTML = contentContainer.dataset.originalContent;
                    contentContainer.classList.remove('rtl-text');
                    contentContainer.dataset.currentLanguage = 'en';
                    alert("Reverted to original content.");
                }
            });

            alert(`Chapter "${data.title}" translated to Urdu!`);
        } else {
            alert("Could not find content area to translate.");
        }

    } catch (error) {
        console.error('Error translating content:', error);
        alert("Error translating content: " + error.message + ". Please ensure you are logged in.");
    }
}


// --- Add Buttons to Chapter Pages ---
function addChapterInteractivityButtons() {
    const isDocsPage = document.body.classList.contains('docs-wrapper');
    const chapterIdMatch = window.location.pathname.match(/\/docs\/(chapter\d+)/);

    if (isDocsPage && chapterIdMatch) {
        const chapterId = chapterIdMatch[1];
        const contentHeader = document.querySelector('article header h1');

        if (contentHeader) {
            let buttonGroup = document.getElementById('chapter-buttons');
            if (!buttonGroup) {
                buttonGroup = document.createElement('div');
                buttonGroup.id = 'chapter-buttons';
                Object.assign(buttonGroup.style, {
                    display: 'inline-flex',
                    marginLeft: '1rem',
                    verticalAlign: 'middle',
                    gap: '0.5rem' // Space between buttons
                });
                // Insert after the h1 element
                contentHeader.parentNode?.insertBefore(buttonGroup, contentHeader.nextSibling);
            }
            
            // Personalize Button
            let personalizeBtn = document.getElementById('personalize-chapter-button');
            if (!personalizeBtn) {
                personalizeBtn = document.createElement('button');
                personalizeBtn.id = 'personalize-chapter-button';
                personalizeBtn.textContent = 'Personalize Chapter';
                personalizeBtn.className = 'button button--primary button--sm'; // Docusaurus button styling
                personalizeBtn.addEventListener('click', () => fetchAndRenderPersonalizedContent(chapterId));
                buttonGroup.appendChild(personalizeBtn);
            }

            // Translate Button
            let translateBtn = document.getElementById('translate-chapter-button');
            if (!translateBtn) {
                translateBtn = document.createElement('button');
                translateBtn.id = 'translate-chapter-button';
                translateBtn.textContent = 'Translate to Urdu';
                translateBtn.className = 'button button--secondary button--sm';
                translateBtn.addEventListener('click', () => fetchAndRenderTranslatedContent(chapterId));
                buttonGroup.appendChild(translateBtn);
            }
        }
    }
}

// Run functions on page load and on Docusaurus route change
function onDocusaurusRouteDidUpdate() {
    addChapterInteractivityButtons();
    // Re-initialize any other interactivity if needed for new page content
}

// Attach to Docusaurus lifecycle event if available, otherwise just run on load
if (typeof window !== 'undefined' && window.docusaurus) {
    window.docusaurus.addListener('onRouteDidUpdate', onDocusaurusRouteDidUpdate);
} else {
    document.addEventListener('DOMContentLoaded', addChapterInteractivityButtons);
}

console.log('Interactivity.js loaded');

