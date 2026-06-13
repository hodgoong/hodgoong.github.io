/**
 * PortfolioApp - Modernized Portfolio Management Module
 * Handles fetching, parsing, and rendering of Markdown-based content.
 */

const PortfolioApp = (function() {
    const CONFIG = {
        repoRootUrl: 'https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/master',
        contentsBaseUrl: 'https://hodgoong.github.io/contents/',
        gaID: 'UA-154366933-1'
    };

    const state = {
        isInitialized: false,
        contents: []
    };

    /**
     * Initialize the application
     */
    async function init() {
        if (state.isInitialized) return;

        // Clear hash on initial load if needed, but allow deep links
        // if(location.hash !== '' && !location.hash.includes('contentId_')){
        //     location.hash=''
        // }

        try {
            await loadAllContents();
            handleInitialHash();
            state.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize PortfolioApp:', error);
        }
    }

    /**
     * Handle initial hash for deep linking
     */
    function handleInitialHash() {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            // Check if it's an About or specific project link
            if (id === 'about') {
                switcher('cardId_about');
            } else {
                switcher(`cardId_${id}`);
            }
        }
    }

    /**
     * Fetch and load all contents from the GitHub repository
     */
    async function loadAllContents() {
        const rootResponse = await fetch(CONFIG.repoRootUrl);
        const rootData = await rootResponse.json();
        
        const contentsFolder = rootData.tree.find(item => item.path === 'contents');
        if (!contentsFolder) throw new Error('Contents folder not found');

        const contentsResponse = await fetch(contentsFolder.url);
        const contentsData = await contentsResponse.json();

        const loadPromises = contentsData.tree
            .filter(item => item.path.endsWith('.md'))
            .map(item => loadMarkdown(item.path));

        await Promise.all(loadPromises);
    }

    /**
     * Load an individual Markdown file and render it
     * @param {string} fileName - Name of the markdown file
     */
    async function loadMarkdown(fileName) {
        try {
            const response = await fetch(CONFIG.contentsBaseUrl + fileName);
            if (!response.ok) throw new Error(`Failed to load ${fileName}`);
            
            const text = await response.text();
            const cleanFileName = fileName.replace('.md', '');
            
            renderContent(text, cleanFileName);
        } catch (error) {
            console.error(`Error loading markdown ${fileName}:`, error);
        }
    }

    /**
     * Parse markdown text and render card/content
     * @param {string} data - Raw markdown content
     * @param {string} fileName - File name without extension
     */
    function renderContent(data, fileName) {
        if (!data.trim()) return;

        const lines = data.split('\n');
        const title = lines[0] || '';
        const imgURL = lines[1] || '';
        const desc = lines[2] || '';
        const body = lines.slice(3).join('\n');

        const cardId = `cardId_${fileName}`;
        const contentId = `contentId_${fileName}`;

        // Create popup content first
        createContentPopup(body, contentId, imgURL);

        // Don't render "about" as a card on the main grid
        if (fileName === 'about') return;

        // Render project card
        const cardHtml = createCardHtml(title, imgURL, desc, cardId);
        const container = document.createElement('div');
        container.id = fileName;
        container.className = 'card-container';
        container.innerHTML = cardHtml;

        const tag = createTag(fileName);
        if (tag) container.appendChild(tag);

        document.getElementById('products').appendChild(container);
    }

    /**
     * Create HTML for the card
     */
    function createCardHtml(title, img, desc, id) {
        return `
            <div class='microcard' id='${id}' onClick='PortfolioApp.switcher(this.id)'>
                <div class='microcard-img'>
                    <img src='${img}' alt='${title}'>
                </div>
                <div class='microcard-text'>
                    <a class='title'>${title}</a>
                    <p class='description'>${desc}</p>
                </div>
            </div>
        `;
    }

    /**
     * Create content popup element
     */
    function createContentPopup(contents, id, img) {
        const converter = new showdown.Converter();
        const convertedHtml = converter.makeHtml(contents);
        const popupHtml = `
            <div class='contents' id='${id}'>
                <div class='contents-header'>
                    <img src='${img}' alt='header'>
                </div>
                <a class='x' id='${id}_button' onClick='PortfolioApp.switcher(this.id)'>X</a>
                <div class='contents-body'>
                    ${convertedHtml}
                </div>
            </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.className = 'contents-popup';
        wrapper.innerHTML = popupHtml;
        document.getElementById('container-contents').appendChild(wrapper);
    }

    /**
     * Create tag element based on file prefix
     */
    function createTag(fileName) {
        const tag = document.createElement('div');
        if (fileName.startsWith('prod_')) {
            tag.className = 'tag tag-prod';
            tag.innerHTML = 'product';
        } else if (fileName.startsWith('proj_')) {
            tag.className = 'tag tag-proj';
            tag.innerHTML = 'project';
        } else if (fileName.startsWith('pub_')) {
            tag.className = 'tag tag-pub';
            tag.innerHTML = 'publication';
        } else if (fileName.startsWith('rnd_')) {
            tag.className = 'tag tag-rnd';
            tag.innerHTML = 'research';
        } else {
            return null;
        }
        return tag;
    }

    /**
     * Switch between card view and content view
     * @param {string} id - ID of the clicked element
     */
    function switcher(id) {
        let hashAddress = '';
        let contentId = '';

        if (id.startsWith('cardId_')) {
            hashAddress = id.replace('cardId_', '');
            contentId = id.replace('cardId_', 'contentId_');
            if (typeof gtag === 'function') {
                gtag('config', CONFIG.gaID, { 'page_path': '/' + hashAddress });
            }
        } else if (id.startsWith('contentId_') && id.endsWith('_button')) {
            contentId = id.replace('_button', '');
            hashAddress = '';
            if (typeof gtag === 'function') {
                gtag('config', CONFIG.gaID, { 'page_path': '/' });
            }
        }

        const element = document.getElementById(contentId);
        if (!element) return;

        if (location.hash.replace('#', '') !== hashAddress) {
            element.style.display = 'inline';
            element.style.overflowY = 'scroll';
            document.body.style.overflowY = 'hidden';
            location.hash = hashAddress;
        } else {
            element.style.display = 'none';
            element.style.overflowY = 'hidden';
            document.body.style.overflow = 'initial';
            location.hash = '';
        }
    }

    // Public API
    return {
        init: init,
        switcher: switcher
    };
})();

// Start the app
document.addEventListener('DOMContentLoaded', PortfolioApp.init);
