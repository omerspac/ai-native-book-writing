// frontend/my-book/src/js/askQuestion.js

// Function to get selected text
function getSelectedText() {
    let text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text.trim();
}

// Function to create and show a floating button
function createFloatingButton(x, y) {
    let button = document.getElementById('ask-ai-button');
    if (!button) {
        button = document.createElement('button');
        button.id = 'ask-ai-button';
        button.textContent = 'Ask AI about this text';
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

        button.addEventListener('click', async () => {
            const selectedText = getSelectedText();
            if (selectedText) {
                const question = prompt("What do you want to ask about this text?", selectedText);
                if (question) {
                    await sendQueryToBackend(selectedText, question);
                }
            }
            button.style.display = 'none'; // Hide button after click
        });
    }

    // Position the button
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.style.display = 'block';
    return button;
}

// Function to hide the floating button
function hideFloatingButton() {
    const button = document.getElementById('ask-ai-button');
    if (button) {
        button.style.display = 'none';
    }
}

// Function to send query to backend
async function sendQueryToBackend(selectedText, question) {
    // Replace with your actual backend URL
    const backendUrl = window.location.origin + '/api/query'; 

    try {
        // Show loading indicator (e.g., a simple alert or a modal)
        alert("Asking AI... please wait.");

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: question }), // Assuming backend takes just the question
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Display AI answer (e.g., in an alert, modal, or new div)
        // For now, using an alert for simplicity. A modal would be better.
        alert("AI Answer:\n\n" + data.answer + "\n\nSources:\n" + JSON.stringify(data.sources, null, 2));

    } catch (error) {
        console.error('Error querying backend:', error);
        alert("Error asking AI: " + error.message + ". Please try again.");
    }
}

// Event listener for text selection
document.addEventListener('mouseup', (event) => {
    const selectedText = getSelectedText();
    if (selectedText.length > 0 && selectedText.length < 500) { // Limit selection length
        const button = createFloatingButton(event.pageX + 10, event.pageY - 30);
    } else {
        hideFloatingButton();
    }
});

// Hide button if click outside selection
document.addEventListener('mousedown', (event) => {
    const button = document.getElementById('ask-ai-button');
    if (button && event.target !== button && !button.contains(event.target)) {
        // Check if the click is outside the button and outside of an active selection
        if (!window.getSelection || window.getSelection().toString().length === 0) {
             hideFloatingButton();
        }
    }
});

console.log('AskQuestion.js loaded');
