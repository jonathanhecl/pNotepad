import './style.css';
import './app.css';

// import logo from './assets/images/logo-universal.png';
import {UnlockFile, SaveFile, GetVersion} from '../wailsjs/go/main/App';

// Variables globales
let unlockBlock, editorBlock, statusElement, resultElement, passwordElement;
let matches = [], currentMatch = -1;
let savedSelection = null;

window.save = function(content) {
    try {
        let text = document.getElementById("editor").innerHTML;
        let password = passwordElement.value;
        SaveFile(text, password).then((result) => {
            if (result) {
                statusElement.innerText = result;
            } else {
                statusElement.innerText = "File saved.";
            }
        });
    } catch (err) {
        console.error(err);
    }
}

window.unlock = function () {
    let password = passwordElement.value;

    try {
        UnlockFile(password)
            .then((result) => {
                if (result.substring(0,1)==";") {
                    statusElement.innerText = "File loaded.";
                    unlockBlock.style.display = "none";
                    editorBlock.style.display = "flex";
                    document.getElementById("editor").innerHTML = result.substring(1);
                    document.getElementById("editor").focus();
                } else {
                    resultElement.innerText = result;
                }
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (err) {
        console.error(err);
    }
};

// editor
window.formatTextInRealTime = function () {
    statusElement.innerText = "Changes unsaved.";
    document.execCommand('defaultParagraphSep', false, 'p');
}

// Función para aplicar formato de texto
window.formatText = function (type) {
    document.execCommand(type, false);
}

// Alinear texto
window.alignText = function (alignment) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const clonedContents = range.cloneContents();
    const p = document.createElement('p');
    p.classList.add(alignment);
    p.appendChild(clonedContents);
    range.deleteContents();
    range.insertNode(p);
}

document.querySelector('#app').innerHTML = `
    <div class="flex flex-col h-screen">
        <div class="flex-grow flex items-center justify-center" id="unlockBlock">
            <div class="unlock-container">
                <h1 class="unlock-title">pNotepad2</h1>
                <div class="result" id="result">Please enter your password</div>
                <form class="input-box" id="unlockForm" onsubmit="event.preventDefault(); unlock();">
                    <input class="input" id="password" type="password" autocomplete="off" placeholder="Enter password..." />
                    <button type="submit" class="btn">Unlock</button>
                </form>
            </div>
        </div>
        <div class="flex flex-col h-screen" id="editorBlock" style="display: none;">
            <div class="editor-toolbar">
                <div class="editor-buttons">
                    <button class="editor-button" onclick="formatText('bold')"><i class="fas fa-bold"></i></button>
                    <button class="editor-button" onclick="formatText('italic')"><i class="fas fa-italic"></i></button>
                    <button class="editor-button" onclick="alignText('align-left')"><i class="fas fa-align-left"></i></button>
                    <button class="editor-button" onclick="alignText('align-center')"><i class="fas fa-align-center"></i></button>
                    <button class="editor-button" onclick="alignText('align-right')"><i class="fas fa-align-right"></i></button>
                    <button id="openSearch" class="editor-button"><i class="fas fa-search"></i></button>
                    <button class="editor-button" onclick="save()">Save</button>
                </div>
            </div>
            <div id="editor" contenteditable="true" spellcheck="false" oninput="formatTextInRealTime()" oncontextmenu="return true;"></div>
            <div class="status-bar">
                <span id="version"></span>
                <span id="status"></span>
            </div>
        </div>
        <div id="searchPopup" class="hidden fixed inset-0 z-50 flex items-center justify-center">
            <div class="bg-gray-800 p-4 rounded">
                <div class="flex gap-2 items-center">
                    <input type="text" id="searchInput" placeholder="Search..." class="search-input"/>
                    <button id="findBtn" class="search-button">Find</button>
                    <button id="nextBtn" class="search-button">Next</button>
                    <button id="closeBtn" class="search-button">Close</button>
                </div>
                <div id="matchCount" class="mt-2 text-sm text-gray-300"></div>
            </div>
        </div>
    </div>
`;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar variables globales
    unlockBlock = document.getElementById("unlockBlock");
    editorBlock = document.getElementById("editorBlock");
    statusElement = document.getElementById("status");
    resultElement = document.getElementById("result");
    passwordElement = document.getElementById("password");
    
    // Set focus after a small delay to ensure the element is ready
    setTimeout(() => {
        passwordElement.focus();
    }, 100);

    // Load version
    GetVersion().then((version) => {
        document.getElementById("version").innerHTML = `v${version}`;
    });

    // Search UI event listeners
    document.getElementById('findBtn').addEventListener('click', window.findText);
    document.getElementById('nextBtn').addEventListener('click', window.nextMatch);
    document.getElementById('openSearch').addEventListener('click', window.openSearchPopup);
    document.getElementById('closeBtn').addEventListener('click', window.closeSearchPopup);
    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If there are already matches, go to next; otherwise, search
            if (matches.length > 0) {
                window.nextMatch();
            } else {
                window.findText();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            window.closeSearchPopup();
        }
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // F3 to open search
        if (e.key === 'F3') {
            e.preventDefault();
            window.openSearchPopup();
        }
    });

    // Editor-specific paste handling
    const editor = document.getElementById('editor');
    
    editor.addEventListener('paste', function(e) {
        e.preventDefault();
        
        // Get plain text from clipboard
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        
        // Use execCommand to insert text so it's added to undo history
        document.execCommand('insertText', false, text);
        
        // Trigger the input event to mark as unsaved
        formatTextInRealTime();
    });

    // Close popup on outside click
    const popupOverlay = document.getElementById('searchPopup');
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) window.closeSearchPopup();
    });
});

// Utility to escape regex special characters
window.escapeRegExp = function(string) {
    return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
};

// Function to find and highlight matches
window.findText = function() {
    const term = document.getElementById('searchInput').value;
    const editor = document.getElementById('editor');
    // Remove existing highlights
    editor.innerHTML = editor.innerHTML.replace(/<mark class=\"search-highlight(?: current)?\">([^<]*)<\/mark>/g, '$1');
    if (!term) {
        matches = [];
        currentMatch = -1;
        document.getElementById('matchCount').innerText = '';
        return;
    }
    // Require at least 2 characters
    if (term.length < 2) {
        document.getElementById('matchCount').innerText = 'Enter at least 2 characters';
        return;
    }
    const regex = new RegExp(window.escapeRegExp(term), 'gi');
    editor.innerHTML = editor.innerHTML.replace(regex, match => `<mark class=\"search-highlight\">${match}</mark>`);
    matches = Array.from(editor.querySelectorAll('mark.search-highlight'));
    currentMatch = 0;
    document.getElementById('matchCount').innerText = `${matches.length} matches`;
    if (matches.length > 0) {
        matches[0].classList.add('current');
        matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

// Function to navigate to next match
window.nextMatch = function() {
    if (matches.length === 0) return;
    matches[currentMatch].classList.remove('current');
    currentMatch = (currentMatch + 1) % matches.length;
    matches[currentMatch].classList.add('current');
    matches[currentMatch].scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Popup control functions
window.openSearchPopup = function() {
    const popup = document.getElementById('searchPopup');
    popup.classList.remove('hidden');
    // Save current cursor position/selection
    const editor = document.getElementById('editor');
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        savedSelection = selection.getRangeAt(0).cloneRange();
    }
    // Clear previous search
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    // Clear highlights
    editor.innerHTML = editor.innerHTML.replace(/<mark class="search-highlight(?: current)?">([^<]*)<\/mark>/g, '$1');
    matches = [];
    currentMatch = -1;
    // Clear match count
    document.getElementById('matchCount').innerText = '';
    searchInput.focus();
};

window.closeSearchPopup = function() {
    const editor = document.getElementById('editor');
    
    // Calculate text position before clearing highlights
    let textOffset = null;
    
    // Priority 1: If there's a current match, use that position
    if (currentMatch >= 0 && matches.length > 0) {
        const currentElement = matches[currentMatch];
        
        // Walk through all text nodes to find the position
        let offset = 0;
        let foundMatch = false;
        
        function walkNodes(node) {
            if (foundMatch) return;
            
            if (node.nodeType === Node.TEXT_NODE) {
                offset += node.length;
            } else if (node === currentElement) {
                // Found the match element, add its text length
                offset += currentElement.textContent.length;
                foundMatch = true;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (let child of node.childNodes) {
                    walkNodes(child);
                    if (foundMatch) break;
                }
            }
        }
        
        walkNodes(editor);
        
        if (foundMatch) {
            textOffset = offset;
        }
    }
    // Priority 2: If no match but there's a saved selection, calculate its offset
    else if (savedSelection) {
        try {
            const range = document.createRange();
            range.setStart(editor, 0);
            range.setEnd(savedSelection.startContainer, savedSelection.startOffset);
            textOffset = range.toString().length;
        } catch (e) {
            console.log('Could not calculate saved selection offset');
        }
    }
    
    // Clear highlights
    editor.innerHTML = editor.innerHTML.replace(/<mark class="search-highlight(?: current)?">([^<]*)<\/mark>/g, '$1');
    matches = [];
    currentMatch = -1;
    
    // Clear match count
    document.getElementById('matchCount').innerText = '';
    
    // Hide popup
    document.getElementById('searchPopup').classList.add('hidden');
    
    // Return focus to editor
    editor.focus();
    
    // Restore cursor position at the calculated offset
    if (textOffset !== null) {
        try {
            const selection = window.getSelection();
            const range = document.createRange();
            let currentOffset = 0;
            let targetNode = null;
            let targetOffset = 0;
            
            function findPosition(node) {
                if (targetNode) return;
                
                if (node.nodeType === Node.TEXT_NODE) {
                    if (currentOffset + node.length >= textOffset) {
                        targetNode = node;
                        targetOffset = textOffset - currentOffset;
                    } else {
                        currentOffset += node.length;
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    for (let child of node.childNodes) {
                        findPosition(child);
                        if (targetNode) break;
                    }
                }
            }
            
            findPosition(editor);
            
            if (targetNode) {
                range.setStart(targetNode, targetOffset);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Scroll to cursor position
                const tempSpan = document.createElement('span');
                range.insertNode(tempSpan);
                tempSpan.scrollIntoView({ behavior: 'auto', block: 'center' });
                tempSpan.remove();
                
                // Re-set the selection after removing the temp span
                range.setStart(targetNode, targetOffset);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } catch (e) {
            console.log('Could not restore cursor position:', e);
        }
    }
    
    savedSelection = null;
};