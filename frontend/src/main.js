import './style.css';
import './app.css';

// import logo from './assets/images/logo-universal.png';
import {UnlockFile, SaveFile, GetVersion} from '../wailsjs/go/main/App';

// Variables globales
let unlockBlock, editorBlock, statusElement, resultElement, passwordElement;

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
                    <button class="editor-button" onclick="save()">Save</button>
                </div>
            </div>
            <div id="editor" contenteditable="true" oninput="formatTextInRealTime()"></div>
            <div class="status-bar">
                <span id="version"></span>
                <span id="status"></span>
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
});