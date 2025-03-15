import './style.css';
import './app.css';

// import logo from './assets/images/logo-universal.png';
import {UnlockFile, SaveFile, GetVersion} from '../wailsjs/go/main/App';

window.save = function(content) {
    try {
        let text = document.getElementById("editor").innerHTML;
        let password = document.getElementById("password").value;
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
                    editorBlock.style.display = "block";
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

// MAIN


document.querySelector('#app').innerHTML = `
    <div class="flex-1 overflow-y-auto" style="height: 90vh;">
        <div class="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24" id="unlockBlock">
            <div class="result" id="result">Please enter your password below 👇</div>
            <div class="input-box" id="input">
                <input class="input" id="password" type="password" autocomplete="off" />
                <button class="btn" onclick="unlock()">Unlock</button>
            </div>
        </div>
        <div class="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24" id="editorBlock">
            <div id="editor" contenteditable="true" oninput="formatTextInRealTime()"></div>
            <div class="flex flex-row">
                <div class="flex editor-buttons">
                    <button class="editor-button" onclick="formatText('bold')"><i class="fas fa-bold"></i></button>
                    <button class="editor-button" onclick="formatText('italic')"><i class="fas fa-italic"></i></button>
                    <button class="editor-button" onclick="alignText('align-left')"><i class="fas fa-align-left"></i></button>
                    <button class="editor-button" onclick="alignText('align-center')"><i class="fas fa-align-center"></i></button>
                    <button class="editor-button" onclick="alignText('align-right')"><i class="fas fa-align-right"></i></button>
                </div>
                <div class="flex flex-1">
                    <button class="btn flex-1" onclick="save()">Save</button>
                </div>
            </div>
        </div>
    </div>
    <div class="bg-gray-800 p-4 flex justify-between items-center border-t border-gray-700">
        <div class="flex items-center">
            <span class="text-lg mr-4" id="version"></span>
        </div>
        <div class="flex items-center">
            <span class="text-lg mr-4" id="status">Unlock</span>
        </div>
    </div>
`;

// Blocks
let unlockBlock = document.getElementById("unlockBlock");
let editorBlock = document.getElementById("editorBlock");
// Status
let statusElement = document.getElementById("status");

let resultElement = document.getElementById("result");
let passwordElement = document.getElementById("password");
passwordElement.focus();

// editorBlock
editorBlock.style.display = "none";

// Load version
GetVersion().then((version) => {
    document.getElementById("version").innerHTML = `v${version}`;
});