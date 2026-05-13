const editor = document.getElementById('editor');
const themeToggle = document.getElementById('theme-toggle');
const alignmentButtons = document.querySelectorAll('#alignment-controls button');
const editorWrapper = document.getElementById('editor-wrapper');
const textCodeInput = document.getElementById('text-code-input');
const exportBtn = document.getElementById('export-btn');
const instructionPopup = document.getElementById('instruction-popup');

// --- INSTRUCTION TOGGLE ---
function toggleInstructions() {
    instructionPopup.classList.toggle('hidden');
}

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        toggleInstructions();
    }
    if (e.key === 'Escape' && !instructionPopup.classList.contains('hidden')) {
        toggleInstructions();
    }
});

instructionPopup.addEventListener('mousedown', (e) => {
    if (e.target === instructionPopup) {
        toggleInstructions();
    }
});

// --- HIGH-EFFICIENCY SERIALIZATION (Deflate + Base64) ---

async function encodeText(text) {
    try {
        const bytes = new TextEncoder().encode(text);
        const stream = new Blob([bytes]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream('deflate'));
        const response = new Response(compressedStream);
        const buffer = await response.arrayBuffer();
        
        return await new Promise((resolve) => {
            const blob = new Blob([buffer]);
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Compression failed", e);
        return "";
    }
}

async function decodeText(code) {
    try {
        const binary = atob(code);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        
        const stream = new Blob([bytes]).stream();
        const decompressedStream = stream.pipeThrough(new DecompressionStream('deflate'));
        const response = new Response(decompressedStream);
        return await response.text();
    } catch (e) {
        return null;
    }
}

async function updateEditorFromCode(code) {
    const text = await decodeText(code);
    if (text === null) return;

    editor.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '\n') {
            fragment.appendChild(document.createElement('br'));
        } else {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;
            fragment.appendChild(span);
        }
    }
    
    editor.appendChild(fragment);
    
    editor.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

textCodeInput.addEventListener('input', async (e) => {
    const code = e.target.value.trim();
    if (code) {
        await updateEditorFromCode(code);
    }
});

exportBtn.addEventListener('click', async () => {
    let text = "";
    
    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeName === 'BR') {
            text += '\n';
        } else if (node.nodeName === 'DIV' || node.nodeName === 'P') {
            if (text.length > 0 && !text.endsWith('\n')) text += '\n';
            node.childNodes.forEach(walk);
        } else {
            node.childNodes.forEach(walk);
        }
    }
    
    editor.childNodes.forEach(walk);

    if (!text.trim()) {
        text = editor.innerText.replace(/\n\n/g, '\n');
    }

    const code = await encodeText(text);
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            const originalText = exportBtn.textContent;
            exportBtn.textContent = 'COPIED!';
            setTimeout(() => exportBtn.textContent = originalText, 2000);
        });
    }
});

// --- THEME CONTROLS ---
themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.documentElement.style.setProperty('--bg-color', '#ffffff');
        document.documentElement.style.setProperty('--text-color', '#000000');
        document.documentElement.style.setProperty('--text-rgb', '0, 0, 0');
    } else {
        document.documentElement.style.setProperty('--bg-color', '#000000');
        document.documentElement.style.setProperty('--text-color', '#ffffff');
        document.documentElement.style.setProperty('--text-rgb', '255, 255, 255');
    }
});

// --- ALIGNMENT CONTROLS ---
alignmentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const align = btn.getAttribute('data-align');
        editor.style.textAlign = align;
        alignmentButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        editor.focus();
    });
});

// --- ZOOM CONTROLS ---
let zoomLevel = 1;
window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        zoomLevel = Math.min(Math.max(0.1, zoomLevel + delta), 50);
        document.documentElement.style.setProperty('--zoom-level', zoomLevel);
    }
}, { passive: false });

// --- SMOOTH TYPING & PASTE SANITIZATION ---
editor.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const fragment = document.createDocumentFragment();
    for (const char of text) {
        if (char === '\n') {
            fragment.appendChild(document.createElement('br'));
        } else {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;
            fragment.appendChild(span);
        }
    }
    range.insertNode(fragment);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
});

editor.addEventListener('beforeinput', (e) => {
    if (e.inputType === 'insertText' || e.inputType === 'insertCompositionText') {
        const data = e.data;
        if (!data) return;
        e.preventDefault();
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const fragment = document.createDocumentFragment();
        for (const char of data) {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;
            fragment.appendChild(span);
        }
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak') {
        // Explicitly handle Enter key to ensure caret visibility
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const br = document.createElement('br');
        range.insertNode(br);
        
        // Browser needs a trailing BR or a zero-width space on a new line 
        // in contenteditable to keep the caret visible and at the right height.
        const secondBr = document.createElement('br');
        range.setStartAfter(br);
        range.setEndAfter(br);
        range.insertNode(secondBr);
        
        // Place cursor between them
        range.setStartAfter(br);
        range.setEndAfter(br);
        
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

editor.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
        e.preventDefault();
    }
});

editorWrapper.addEventListener('mousedown', (e) => {
    if (e.target === editorWrapper) {
        e.preventDefault();
        editor.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

window.addEventListener('load', () => {
    editor.focus();
});
