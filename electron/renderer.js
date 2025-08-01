// Check if we're in Electron
const isElectron = window.electronAPI && window.electronAPI.isElectron;

// DOM Elements
const addressInput = document.getElementById('addressInput');
const webview = document.getElementById('webview');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reloadBtn = document.getElementById('reloadBtn');
const homeBtn = document.getElementById('homeBtn');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const bookmarksBtn = document.getElementById('bookmarksBtn');
const historyBtn = document.getElementById('historyBtn');
const downloadsBtn = document.getElementById('downloadsBtn');
const settingsBtn = document.getElementById('settingsBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const progressFill = document.getElementById('progressFill');
const securityIcon = document.getElementById('securityIcon');

// State
let currentUrl = 'https://asenturisk.github.io/asn/';
let displayUrl = 'hello.asn';
let isLoading = false;
let history = ['hello.asn'];
let historyIndex = 0;
let bookmarks = [];

// Initialize
async function init() {
    if (isElectron) {
        // Load saved data
        bookmarks = await window.electronAPI.getBookmarks();
        history = await window.electronAPI.getHistory();
        
        // Set up Electron event listeners
        window.electronAPI.onNavigateBack(() => handleGoBack());
        window.electronAPI.onNavigateForward(() => handleGoForward());
        window.electronAPI.onNavigateHome(() => handleHome());
        window.electronAPI.onAddBookmark(() => addBookmark());
        window.electronAPI.onShowBookmarks(() => showBookmarks());
    }
    
    // Set initial URL
    addressInput.value = displayUrl;
    updateNavigationButtons();
    
    // Navigate to home page
    await handleNavigate('hello.asn');
}

// URL validation
function isValidUrl(string) {
    try {
        new URL(string.startsWith('http') ? string : `https://${string}`);
        return true;
    } catch (_) {
        return false;
    }
}

// ASN Domain translation
async function translateAsnDomain(url) {
    if (isElectron) {
        return await window.electronAPI.translateAsnDomain(url);
    }
    
    // Fallback for web version
    try {
        let domain = url;
        if (url.includes('/')) {
            domain = url.split('/')[0];
        }
        if (!domain.endsWith('.asn')) {
            domain += '.asn';
        }

        const response = await fetch('https://asenturisk.github.io/asn/domains.json');
        const domains = await response.json();
        
        if (domains && domains[domain]) {
            const targetUrl = domains[domain];
            
            if (url.includes('/') && url !== domain) {
                const path = url.substring(url.indexOf('/'));
                return targetUrl + (targetUrl.endsWith('/') ? path.substring(1) : path);
            }
            
            return targetUrl;
        }

        return null;
    } catch (error) {
        console.error('Error translating .asn domain:', error);
        return null;
    }
}

// Navigation
async function handleNavigate(url) {
    if (!url.trim()) return;
    
    setLoading(true);
    let finalUrl = '';
    let finalDisplayUrl = '';
    
    try {
        // Check if it's an .asn domain
        if (url.endsWith('.asn') || url.includes('.asn/')) {
            const translatedUrl = await translateAsnDomain(url);
            if (translatedUrl) {
                finalUrl = translatedUrl;
                finalDisplayUrl = url;
            } else {
                // Show error for invalid .asn domain
                showError(`The .asn domain "${url}" could not be resolved.`);
                setLoading(false);
                return;
            }
        } else if (isValidUrl(url) || url.includes('.')) {
            // Regular URL or domain
            finalUrl = url.startsWith('http') ? url : `https://${url}`;
            finalDisplayUrl = url;
        } else {
            // Search query - use Google
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            finalDisplayUrl = `Search: ${url}`;
        }
        
        // Update state
        currentUrl = finalUrl;
        displayUrl = finalDisplayUrl;
        addressInput.value = finalDisplayUrl;
        
        // Update security icon
        updateSecurityIcon(finalUrl);
        
        // Navigate webview
        webview.src = finalUrl;
        
        // Update history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(finalDisplayUrl);
        history = newHistory;
        historyIndex = newHistory.length - 1;
        
        // Save history if in Electron
        if (isElectron) {
            await window.electronAPI.saveHistory(history);
        }
        
        updateNavigationButtons();
        
    } catch (error) {
        console.error('Navigation error:', error);
        showError('Failed to navigate to the requested URL.');
        setLoading(false);
    }
}

function updateSecurityIcon(url) {
    if (url.endsWith('.asn') || url.includes('.asn/')) {
        securityIcon.textContent = '🌐';
        securityIcon.title = 'ASN Domain';
    } else if (url.startsWith('https://')) {
        securityIcon.textContent = '🔒';
        securityIcon.title = 'Secure Connection';
    } else {
        securityIcon.textContent = '⚠️';
        securityIcon.title = 'Not Secure';
    }
}

function handleGoBack() {
    if (historyIndex > 0) {
        historyIndex--;
        const previousUrl = history[historyIndex];
        handleNavigate(previousUrl);
    }
}

function handleGoForward() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const nextUrl = history[historyIndex];
        handleNavigate(nextUrl);
    }
}

function handleReload() {
    webview.reload();
}

function handleHome() {
    handleNavigate('hello.asn');
}

function updateNavigationButtons() {
    backBtn.disabled = historyIndex <= 0;
    forwardBtn.disabled = historyIndex >= history.length - 1;
}

// Loading state
function setLoading(loading) {
    isLoading = loading;
    loadingOverlay.style.display = loading ? 'flex' : 'none';
    progressFill.style.width = loading ? '100%' : '0%';
}

// Error handling
function showError(message) {
    const errorHtml = `
        <div class="error-page">
            <div class="error-icon">⚠️</div>
            <h2>Unable to load page</h2>
            <p>${message}</p>
        </div>
    `;
    
    webview.style.display = 'none';
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = errorHtml;
    errorDiv.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #0f172a; display: flex; align-items: center; justify-content: center;';
    document.querySelector('.content-area').appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
        webview.style.display = 'block';
    }, 3000);
}

// Bookmarks
async function addBookmark() {
    const bookmark = {
        url: displayUrl,
        title: displayUrl,
        favicon: ''
    };
    
    bookmarks.push(bookmark);
    
    if (isElectron) {
        await window.electronAPI.saveBookmarks(bookmarks);
    }
    
    updateBookmarkButton();
}

function updateBookmarkButton() {
    const isBookmarked = bookmarks.some(b => b.url === displayUrl);
    bookmarkBtn.style.color = isBookmarked ? '#fbbf24' : '';
}

function showBookmarks() {
    showModal('Bookmarks', bookmarks.map(bookmark => `
        <div class="bookmark-item" onclick="navigateToBookmark('${bookmark.url}')">
            <div class="favicon"></div>
            <div class="item-info">
                <div class="item-title">${bookmark.title}</div>
                <div class="item-url">${bookmark.url}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn" onclick="event.stopPropagation(); removeBookmark('${bookmark.url}')" title="Remove">🗑️</button>
            </div>
        </div>
    `).join('') || '<p style="text-align: center; color: rgba(255,255,255,0.6); padding: 40px;">No bookmarks yet</p>');
}

function showHistory() {
    showModal('History', history.slice().reverse().map(url => `
        <div class="history-item" onclick="navigateToHistory('${url}')">
            <div class="favicon"></div>
            <div class="item-info">
                <div class="item-title">${url}</div>
            </div>
        </div>
    `).join('') || '<p style="text-align: center; color: rgba(255,255,255,0.6); padding: 40px;">No history yet</p>');
}

function showDownloads() {
    showModal('Downloads', '<p style="text-align: center; color: rgba(255,255,255,0.6); padding: 40px;">No downloads yet</p>');
}

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Modal actions
function navigateToBookmark(url) {
    document.querySelector('.modal-overlay').remove();
    handleNavigate(url);
}

function navigateToHistory(url) {
    document.querySelector('.modal-overlay').remove();
    handleNavigate(url);
}

async function removeBookmark(url) {
    bookmarks = bookmarks.filter(b => b.url !== url);
    if (isElectron) {
        await window.electronAPI.saveBookmarks(bookmarks);
    }
    updateBookmarkButton();
    document.querySelector('.modal-overlay').remove();
    showBookmarks();
}

// Event Listeners
addressInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleNavigate(addressInput.value);
    }
});

addressInput.addEventListener('focus', () => {
    addressInput.select();
});

backBtn.addEventListener('click', handleGoBack);
forwardBtn.addEventListener('click', handleGoForward);
reloadBtn.addEventListener('click', handleReload);
homeBtn.addEventListener('click', handleHome);
bookmarkBtn.addEventListener('click', addBookmark);
bookmarksBtn.addEventListener('click', showBookmarks);
historyBtn.addEventListener('click', showHistory);
downloadsBtn.addEventListener('click', showDownloads);

// Webview events
webview.addEventListener('dom-ready', () => {
    setLoading(false);
    updateBookmarkButton();
});

webview.addEventListener('did-start-loading', () => {
    setLoading(true);
});

webview.addEventListener('did-stop-loading', () => {
    setLoading(false);
});

webview.addEventListener('did-fail-load', (event) => {
    setLoading(false);
    if (event.errorCode !== -3) { // Ignore aborted loads
        showError('Failed to load the page. Please check your connection and try again.');
    }
});

webview.addEventListener('page-title-updated', (event) => {
    const title = event.title;
    if (title) {
        document.title = `${title} - Asentu Browser`;
    }
});

// Initialize the app
init();