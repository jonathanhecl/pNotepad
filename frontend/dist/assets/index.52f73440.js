(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))l(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&l(c)}).observe(document,{childList:!0,subtree:!0});function i(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerpolicy&&(o.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?o.credentials="include":e.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function l(e){if(e.ep)return;e.ep=!0;const o=i(e);fetch(e.href,o)}})();function d(){return window.go.main.App.GetVersion()}function u(n,t){return window.go.main.App.SaveFile(n,t)}function f(n){return window.go.main.App.UnlockFile(n)}window.save=function(n){try{let t=document.getElementById("editor").innerHTML,i=document.getElementById("password").value;u(t,i).then(l=>{l?s.innerText=l:s.innerText="File saved."})}catch(t){console.error(t)}};window.unlock=function(){let n=a.value;try{f(n).then(t=>{t.substring(0,1)==";"?(s.innerText="File loaded.",m.style.display="none",r.style.display="block",document.getElementById("editor").innerHTML=t.substring(1),document.getElementById("editor").focus()):p.innerText=t}).catch(t=>{console.error(t)})}catch(t){console.error(t)}};window.formatTextInRealTime=function(){s.innerText="Changes unsaved.",document.execCommand("defaultParagraphSep",!1,"p")};window.formatText=function(n){document.execCommand(n,!1)};window.alignText=function(n){const i=window.getSelection().getRangeAt(0),l=i.cloneContents(),e=document.createElement("p");e.classList.add(n),e.appendChild(l),i.deleteContents(),i.insertNode(e)};document.querySelector("#app").innerHTML=`
    <div class="flex-1 overflow-y-auto" style="height: 90vh;">
        <div class="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24" id="unlockBlock">
            <div class="result" id="result">Please enter your password below \u{1F447}</div>
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
`;let m=document.getElementById("unlockBlock"),r=document.getElementById("editorBlock"),s=document.getElementById("status"),p=document.getElementById("result"),a=document.getElementById("password");a.focus();r.style.display="none";d().then(n=>{document.getElementById("version").innerHTML=`v${n}`});
