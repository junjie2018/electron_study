const marked = require('marked');
const {remote, ipcRenderer} = require('electron');
const mainProcess = remote.require('./main.js');
const path = require('path');

let filePath = null;
let originalContent = '';

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

document.addEventListener('dargstart', event => {
    event.preventDefault();
});

document.addEventListener('dargover', event => {
    event.preventDefault();
});

document.addEventListener('dargleave', event => {
    event.preventDefault();
});

document.addEventListener('drop', event => {
    event.preventDefault();
});

const currentWindow = remote.getCurrentWindow();

markdownView.addEventListener('keyup', (event) => {
    const currentContent = event.target.value;
    renderMarkdownToHtml(currentContent);
    updateUserInterface(currentContent !== originalContent);
});

newFileButton.addEventListener('click', () => {
    mainProcess.createWindow();
});

openFileButton.addEventListener('click', () => {
    mainProcess.getFileFromUser(currentWindow);
});

saveHtmlButton.addEventListener('click', () => {
    mainProcess.saveHtml(currentWindow, htmlView.innerHTML);
});

saveMarkdownButton.addEventListener('click', () => {
    mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

revertButton.addEventListener('click', () => {
    markdownView.value = originalContent;
    renderMarkdownToHtml(originalContent);
});

ipcRenderer.on('file-opened', (event, file, content) => {
    filePath = file;
    originalContent = content;

    markdownView.value = content;
    renderMarkdownToHtml(content);
});

const renderMarkdownToHtml = (markdown) => {
    htmlView.innerHTML = marked(markdown, {sanitize: true})
};

const updateUserInterface = (isEdited) => {
    let title = 'Fire Sale';
    if (filePath) {
        title = `${path.basename(filePath)} - ${title}`;
    }
    if (isEdited) {
        title = `${title} (Edited)`;
    }
    currentWindow.setTitle(title);

    saveMarkdownButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;
};

