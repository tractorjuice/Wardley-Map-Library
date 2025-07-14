class BooksLibrary {
    constructor() {
        this.books = [];
        this.selectedBook = null;
        this.baseURL = '/api';
        this.splitterDragging = false;
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Initialize dynamic URLs
            this.initializeDynamicUrls();
            
            await this.loadBooksFromAPI();
            this.populateCategoryFilter();
            this.renderBooksList();
            this.setupEventListeners();
            this.updateBookCount();
            
            // Handle initial URL routing
            this.handleInitialRoute();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load books. Please refresh the page.');
        }
    }

    initializeDynamicUrls() {
        // Get the current base URL dynamically
        const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        const imageUrl = `${window.location.protocol}//${window.location.host}/assets/social-preview.png`;
        
        // Update Open Graph URLs
        this.setMetaContent('og:url', baseUrl);
        this.setMetaContent('og:image', imageUrl);
        
        // Update Twitter URLs  
        this.setMetaContent('twitter:url', baseUrl);
        this.setMetaContent('twitter:image', imageUrl);
        
        // Update canonical URL
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute('href', baseUrl);
        }
        
        // Update structured data
        this.updateInitialStructuredData(baseUrl);
    }
    
    setMetaContent(name, content) {
        let selector = `meta[name="${name}"]`;
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
            selector = `meta[property="${name}"]`;
        }
        
        const metaTag = document.querySelector(selector);
        if (metaTag) {
            metaTag.setAttribute('content', content);
        }
    }
    
    updateInitialStructuredData(baseUrl) {
        const structuredDataScript = document.getElementById('structured-data');
        if (structuredDataScript) {
            const structuredData = JSON.parse(structuredDataScript.textContent);
            structuredData.url = baseUrl;
            structuredData.potentialAction.target = `${baseUrl}?book={search_term_string}`;
            structuredDataScript.textContent = JSON.stringify(structuredData, null, 2);
        }
    }

    async loadBooksFromAPI() {
        try {
            const response = await fetch(`${this.baseURL}/books`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load books');
            }
            
            this.books = data.books;
            console.log(`📚 Loaded ${this.books.length} books from API`);
            
        } catch (error) {
            console.error('Error loading books from API:', error);
            throw error;
        }
    }

    populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) {
            console.error('Category filter element not found');
            return;
        }

        // Get all unique categories from books
        const allCategories = new Set();
        this.books.forEach(book => {
            // Handle both single category (string) and multiple categories (array)
            const categories = book.categories || (Array.isArray(book.category) ? book.category : [book.category]);
            categories.forEach(category => {
                if (category && category.trim()) {
                    allCategories.add(category.trim());
                }
            });
        });

        // Sort categories alphabetically
        const sortedCategories = Array.from(allCategories).sort();

        // Clear existing options except "All Categories"
        categoryFilter.innerHTML = '<option value="">All Categories</option>';

        // Add category options
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    renderBooksList() {
        const booksList = document.getElementById('booksList');
        
        if (!booksList) {
            console.error('Books list element not found');
            return;
        }
        
        // Clear existing content
        booksList.innerHTML = '';
        
        if (this.books.length === 0) {
            booksList.innerHTML = '<li class="no-books">No books available</li>';
            return;
        }
        
        const fragment = document.createDocumentFragment();

        this.books.forEach(book => {
            const listItem = document.createElement('li');
            listItem.className = 'book-item';
            listItem.dataset.bookId = book.id;
            
            // Handle multiple categories display
            const categories = book.categories || (Array.isArray(book.category) ? book.category : [book.category]);
            const categoryDisplay = categories.slice(0, 2).join(', ') + (categories.length > 2 ? ` +${categories.length - 2} more` : '');
            
            listItem.innerHTML = `
                <div class="book-title">${this.escapeHtml(book.title)}</div>
                <div class="book-category">${this.escapeHtml(categoryDisplay)}</div>
            `;
            
            listItem.addEventListener('click', () => this.selectBook(book));
            fragment.appendChild(listItem);
        });

        booksList.appendChild(fragment);
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterBooks());
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterBooks());
        }
        
        // Setup splitter functionality
        this.setupSplitter();
        
        // Setup share button
        this.setupShareButton();
        
        // Setup scroll to selected button
        this.setupScrollToSelectedButton();
        
        // Setup browser back/forward navigation
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e);
        });
        
        // Setup hash change handling for in-page navigation
        window.addEventListener('hashchange', (e) => {
            if (window.location.hash && this.selectedBook) {
                this.scrollToHash(window.location.hash);
            }
        });
    }

    setupSplitter() {
        const splitter = document.getElementById('splitter');
        const bookList = document.getElementById('bookList');
        const mainContent = document.querySelector('.main-content');
        
        if (!splitter || !bookList || !mainContent) return;

        let isResizing = false;
        
        splitter.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            this.splitterDragging = true;
            
            splitter.classList.add('dragging');
            document.body.classList.add('no-select');
            
            const startX = e.clientX;
            const startWidth = bookList.offsetWidth;
            
            const handleMouseMove = (e) => {
                if (!isResizing) return;
                
                const deltaX = e.clientX - startX;
                const newWidth = startWidth + deltaX;
                
                // Constrain width within min/max bounds
                const minWidth = parseInt(getComputedStyle(bookList).minWidth) || 200;
                const maxWidth = parseInt(getComputedStyle(bookList).maxWidth) || 600;
                const containerWidth = mainContent.offsetWidth;
                const maxAllowedWidth = Math.min(maxWidth, containerWidth * 0.7); // Max 70% of container
                
                const constrainedWidth = Math.max(minWidth, Math.min(newWidth, maxAllowedWidth));
                
                bookList.style.width = constrainedWidth + 'px';
                
                // Store the width preference
                localStorage.setItem('bookListWidth', constrainedWidth);
            };
            
            const handleMouseUp = () => {
                isResizing = false;
                this.splitterDragging = false;
                
                splitter.classList.remove('dragging');
                document.body.classList.remove('no-select');
                
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        // Restore saved width on load
        this.restoreSplitterWidth();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }

    restoreSplitterWidth() {
        const savedWidth = localStorage.getItem('bookListWidth');
        const bookList = document.getElementById('bookList');
        
        if (savedWidth && bookList) {
            const width = parseInt(savedWidth);
            const minWidth = parseInt(getComputedStyle(bookList).minWidth) || 200;
            const maxWidth = parseInt(getComputedStyle(bookList).maxWidth) || 600;
            
            if (width >= minWidth && width <= maxWidth) {
                bookList.style.width = width + 'px';
            }
        }
    }

    handleWindowResize() {
        const bookList = document.getElementById('bookList');
        const mainContent = document.querySelector('.main-content');
        
        if (!bookList || !mainContent) return;
        
        const currentWidth = bookList.offsetWidth;
        const containerWidth = mainContent.offsetWidth;
        const maxAllowedWidth = containerWidth * 0.7;
        
        if (currentWidth > maxAllowedWidth) {
            bookList.style.width = maxAllowedWidth + 'px';
            localStorage.setItem('bookListWidth', maxAllowedWidth);
        }
    }

    filterBooks() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const bookItems = document.querySelectorAll('.book-item');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';

        bookItems.forEach(item => {
            const title = item.querySelector('.book-title').textContent.toLowerCase();
            const category = item.querySelector('.book-category').textContent.toLowerCase();
            const bookId = item.dataset.bookId;
            
            // Find the book data to get all categories
            const book = this.books.find(b => b.id === bookId);
            const bookCategories = book ? (book.categories || (Array.isArray(book.category) ? book.category : [book.category])) : [];
            
            // Check search term match
            const searchMatch = !searchTerm || title.includes(searchTerm) || category.includes(searchTerm);
            
            // Check category filter match
            const categoryMatch = !selectedCategory || bookCategories.some(cat => cat === selectedCategory);
            
            // Show item only if both conditions are met
            item.style.display = (searchMatch && categoryMatch) ? 'block' : 'none';
        });

        // Update visible count
        const visibleItems = Array.from(bookItems).filter(item => item.style.display !== 'none');
        this.updateBookCount(visibleItems.length);
    }

    async selectBook(book, updateUrl = true, preserveHash = false) {
        try {
            // Update UI selection
            document.querySelectorAll('.book-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            const selectedItem = document.querySelector(`[data-book-id="${book.id}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
                // Scroll the selected book into view in the sidebar
                this.scrollBookIntoView(selectedItem);
            }

            // Show loading state
            this.showLoading();

            // Load book content from API
            const content = await this.loadBookContentFromAPI(book.id);
            
            // Get book details
            const bookDetails = await this.getBookDetails(book.id);
            
            this.displayBook(bookDetails, content);
            
            // Update URL and browser history
            if (updateUrl) {
                this.updateUrl(book.id, preserveHash);
            }
            
            this.selectedBook = book;
            
            // Update meta tags for SEO
            this.updateMetaTags(book);
            
            // Update scroll to selected button visibility
            this.updateScrollToSelectedButton();
            
        } catch (error) {
            console.error('Error selecting book:', error);
            this.showError('Failed to load book content. Please try again.');
        }
    }

    async loadBookContentFromAPI(bookId) {
        try {
            const response = await fetch(`${this.baseURL}/books/${bookId}/content`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load book content');
            }
            
            return data.content;
            
        } catch (error) {
            console.error('Error loading book content:', error);
            throw error;
        }
    }

    async getBookDetails(bookId) {
        try {
            const response = await fetch(`${this.baseURL}/books/${bookId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load book details');
            }
            
            return data.book;
            
        } catch (error) {
            console.error('Error loading book details:', error);
            // Fallback to book from the list
            return this.books.find(b => b.id === bookId);
        }
    }

    displayBook(book, content) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const bookDisplay = document.getElementById('bookDisplay');
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (bookDisplay) bookDisplay.style.display = 'block';

        // Update book header
        const bookTitle = document.getElementById('bookTitle');
        const bookCategory = document.getElementById('bookCategory');
        
        if (bookTitle) bookTitle.textContent = book.title;
        if (bookCategory) {
            const categories = book.categories || (Array.isArray(book.category) ? book.category : [book.category]);
            bookCategory.textContent = categories.join(', ');
        }

        // Convert markdown to HTML and display
        const bookContent = document.getElementById('bookContent');
        if (bookContent) {
            try {
                bookContent.innerHTML = marked.parse(content);
                
                // Process image URLs for GitHub raw content
                this.processImageUrls(bookContent, book);
                
                // Make external links open in new tabs
                this.processExternalLinks(bookContent);
                
                // Highlight code blocks if Prism is available
                if (typeof Prism !== 'undefined') {
                    Prism.highlightAllUnder(bookContent);
                }
                
                // Extract and display TOC
                this.extractAndDisplayTOC(bookContent);
                
                // Append figures list to book content if available
                this.appendFiguresListToContent(book, bookContent);
                
            } catch (error) {
                console.error('Error parsing markdown:', error);
                bookContent.innerHTML = `<pre>${this.escapeHtml(content)}</pre>`;
            }
        }

        // Handle scrolling - check for hash fragment in URL
        const bookContentContainer = document.querySelector('.book-content');
        if (bookContentContainer) {
            // Use setTimeout to ensure content is rendered before scrolling
            setTimeout(() => {
                if (window.location.hash) {
                    this.scrollToHash(window.location.hash);
                } else {
                    bookContentContainer.scrollTop = 0;
                }
            }, 100);
        }
    }

    showLoading() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const bookDisplay = document.getElementById('bookDisplay');
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        if (bookDisplay) bookDisplay.style.display = 'none';
        if (loadingMessage) loadingMessage.style.display = 'block';
    }

    showError(message) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const bookDisplay = document.getElementById('bookDisplay');
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        if (bookDisplay) bookDisplay.style.display = 'none';
        if (loadingMessage) loadingMessage.style.display = 'none';

        const bookContent = document.querySelector('.book-content');
        if (bookContent) {
            bookContent.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 4rem 2rem; color: #dc3545;">
                    <h2>⚠️ Error</h2>
                    <p>${this.escapeHtml(message)}</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    appendFiguresListToContent(book, bookContent) {
        // Check if book has figures
        if (!book.figures || !book.figures.list || book.figures.list.length === 0) {
            return;
        }

        const figures = book.figures.list;
        
        // Create the figures section HTML
        const figuresHtml = `
            <div class="figures-section">
                <h2 id="list-of-figures">List of Figures</h2>
                <div class="figures-summary">
                    <p>This book contains <strong>${book.figures.total}</strong> figures:</p>
                    <ul class="figures-breakdown">
                        ${book.figures.wardleyMaps > 0 ? `<li><strong>${book.figures.wardleyMaps}</strong> Wardley Maps</li>` : ''}
                        ${book.figures.images > 0 ? `<li><strong>${book.figures.images}</strong> Images</li>` : ''}
                    </ul>
                </div>
                
                <div class="figures-index">
                    ${figures.map((figure, index) => `
                        <div class="figure-index-item">
                            <div class="figure-number">Figure ${index + 1}</div>
                            <div class="figure-info">
                                <div class="figure-title">
                                    <a href="#" onclick="library.scrollToFigureInContent('${figure.url}', '${this.escapeHtml(figure.caption).replace(/'/g, "\\'")}'); return false;">
                                        ${this.escapeHtml(figure.caption)}
                                    </a>
                                </div>
                                <div class="figure-details">
                                    <span class="figure-type-badge ${figure.type}">${figure.type === 'wardley_map' ? 'Wardley Map' : 'Image'}</span>
                                    <span class="figure-chapter">Chapter: ${this.escapeHtml(figure.chapter)}</span>
                                    <a href="${figure.url.startsWith('http') ? figure.url : `https://raw.githubusercontent.com/tractorjuice/GenAI-Books/Development/books/${book.directory}/${figure.url}`}" 
                                       target="_blank" class="figure-link" title="View full size">
                                        🔗 View Full Size
                                    </a>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Append the figures section to the book content
        bookContent.insertAdjacentHTML('beforeend', figuresHtml);
    }

    createFigurePreview(figure) {
        if (figure.type === 'wardley_map' && figure.source === 'external') {
            return `<img src="${figure.url}" alt="${this.escapeHtml(figure.alt_text)}" 
                         class="figure-thumbnail wardley-map-thumb" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiIHN0cm9rZT0iIzk5OSIgZmlsbD0iI2Y5ZjlmOSIvPgo8Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIgZmlsbD0iIzk5OSIvPgo8cG9seWxpbmUgcG9pbnRzPSIyMSwxNSAxNiwxMCA1LDIxIiBzdHJva2U9IiM5OTkiLz4KPHN2Zz4K'"/>`;
        } else if (figure.source === 'local') {
            const bookBaseUrl = `https://raw.githubusercontent.com/tractorjuice/GenAI-Books/Development/books/${this.selectedBook.directory}`;
            return `<img src="${bookBaseUrl}/${figure.url}" alt="${this.escapeHtml(figure.alt_text)}" 
                         class="figure-thumbnail" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiIHN0cm9rZT0iIzk5OSIgZmlsbD0iI2Y5ZjlmOSIvPgo8Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIgZmlsbD0iIzk5OSIvPgo8cG9seWxpbmUgcG9pbnRzPSIyMSwxNSAxNiwxMCA1LDIxIiBzdHJva2U9IiM5OTkiLz4KPHN2Zz4K'"/>`;
        } else {
            return `<div class="figure-placeholder">📊</div>`;
        }
    }

    toggleFiguresPanel() {
        const figuresPanel = document.getElementById('figuresPanel');
        const splitterToc = document.getElementById('splitterToc');
        const figuresButton = document.getElementById('showFiguresButton');
        
        if (!figuresPanel) return;
        
        const isVisible = figuresPanel.style.display !== 'none';
        
        if (isVisible) {
            figuresPanel.style.display = 'none';
            if (splitterToc) splitterToc.style.display = 'none';
            if (figuresButton) figuresButton.title = 'Show figures list';
        } else {
            figuresPanel.style.display = 'block';
            if (splitterToc) splitterToc.style.display = 'block';
            if (figuresButton) figuresButton.title = 'Hide figures list';
            
            // Hide TOC panel if it's visible to avoid conflicts
            const tocPanel = document.getElementById('tocPanel');
            if (tocPanel && tocPanel.style.display !== 'none') {
                tocPanel.style.display = 'none';
            }
        }
        
        this.updateLayout();
    }

    scrollToFigureInContent(figureUrl, figureCaption) {
        // Find the figure in the content by its URL or caption
        const bookContent = document.getElementById('bookContent');
        if (!bookContent) return;
        
        // Try to find image by various methods
        const images = bookContent.querySelectorAll('img');
        const links = bookContent.querySelectorAll('a[href*=".png"], a[href*=".jpg"], a[href*=".jpeg"], a[href*=".gif"], a[href*=".svg"]');
        
        let targetElement = null;
        
        // Try to find by URL match
        for (let img of images) {
            const imgSrc = img.getAttribute('src') || img.src;
            if (imgSrc && (imgSrc.includes(figureUrl) || figureUrl.includes(imgSrc))) {
                targetElement = img;
                break;
            }
        }
        
        // Try to find by link text or href
        if (!targetElement) {
            for (let link of links) {
                const linkHref = link.getAttribute('href') || link.href;
                if (linkHref && (linkHref.includes(figureUrl) || figureUrl.includes(linkHref))) {
                    targetElement = link;
                    break;
                }
            }
        }
        
        // Try to find by text content match
        if (!targetElement && figureCaption) {
            const allElements = bookContent.querySelectorAll('*');
            for (let element of allElements) {
                if (element.textContent && element.textContent.includes(figureCaption.substring(0, 50))) {
                    targetElement = element;
                    break;
                }
            }
        }
        
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the element briefly
            targetElement.style.boxShadow = '0 0 10px #007bff';
            targetElement.style.transition = 'box-shadow 0.3s ease';
            setTimeout(() => {
                targetElement.style.boxShadow = '';
                setTimeout(() => {
                    targetElement.style.transition = '';
                }, 300);
            }, 2000);
        }
    }

    openFigure(url) {
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        } else if (this.selectedBook) {
            const bookBaseUrl = `https://raw.githubusercontent.com/tractorjuice/GenAI-Books/Development/books/${this.selectedBook.directory}`;
            window.open(`${bookBaseUrl}/${url}`, '_blank');
        }
    }

    updateBookCount(visibleCount = null) {
        const bookCountElement = document.getElementById('bookCount');
        if (bookCountElement) {
            const count = visibleCount !== null ? visibleCount : this.books.length;
            bookCountElement.textContent = count;
        }
    }

    processImageUrls(container, book) {
        const images = container.querySelectorAll('img');
        
        images.forEach(img => {
            const src = img.getAttribute('src');
            
            // Check if it's a relative path (not already a full URL)
            if (src && !src.startsWith('http') && !src.startsWith('//')) {
                // Convert relative path to GitHub raw URL
                const githubBaseUrl = 'https://raw.githubusercontent.com/tractorjuice/Wardley-Map-Library/Development';
                const fullImageUrl = `${githubBaseUrl}/books/${book.directory}/${src}`;
                
                img.setAttribute('src', fullImageUrl);
                
                // Add error handling for broken images
                img.addEventListener('error', () => {
                    console.warn(`Failed to load image: ${fullImageUrl}`);
                    img.style.display = 'none';
                });
            }
        });
    }

    processExternalLinks(container) {
        const links = container.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Check if it's a Wardley map report link
            if (this.isWardleyMapReportLink(href)) {
                this.handleWardleyMapReportLink(link, href);
                return;
            }
            
            // Check if it's an external link
            if (this.isExternalLink(href)) {
                // Set target="_blank" and security attributes
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                
                // Add visual indicator for external links
                if (!link.querySelector('.external-link-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'external-link-icon';
                    icon.innerHTML = ' ↗';
                    icon.style.fontSize = '0.8em';
                    icon.style.opacity = '0.7';
                    link.appendChild(icon);
                }
                
                // Special styling for Wardley Maps links
                if (href.includes('wardleymaps.ai') || href.includes('create.wardleymaps')) {
                    link.classList.add('wardley-link');
                    link.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
                    link.style.webkitBackgroundClip = 'text';
                    link.style.webkitTextFillColor = 'transparent';
                    link.style.fontWeight = '600';
                    link.title = 'Open Wardley Map in new tab';
                }
            }
        });
    }
    
    isWardleyMapReportLink(href) {
        if (!href) return false;
        
        // Check if it's a link to a wardley map report markdown file
        return (
            href.includes('books/') && href.includes('/markdown/wardley_map_reports/') ||
            href.includes('/wardley/') ||
            href.includes('/markdown/wardley_map_reports/') ||
            href.includes('/markdown_wardley_map_reports/') ||
            href.includes('wardley_map_report_') && href.endsWith('.md')
        );
    }
    
    handleWardleyMapReportLink(link, href) {
        // Prevent default link behavior
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.openWardleyFromLink(href, link.textContent);
        });
        
        // Style the link to indicate it's a Wardley details link
        link.classList.add('wardley-link');
        link.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        link.style.webkitBackgroundClip = 'text';
        link.style.webkitTextFillColor = 'transparent';
        link.style.fontWeight = '600';
        link.title = 'View Wardley Map details in side panel';
        link.style.cursor = 'pointer';
        
        // Add an indicator icon
        if (!link.querySelector('.wardley-details-icon')) {
            const icon = document.createElement('span');
            icon.className = 'wardley-details-icon';
            icon.innerHTML = ' 📊';
            icon.style.fontSize = '0.9em';
            link.appendChild(icon);
        }
    }
    
    openWardleyFromLink(href, title) {
        let bookId = this.selectedBook ? this.selectedBook.id : null;
        let wardleyPath = href;
        
        // Handle relative paths: markdown/wardley_map_reports/[filename]
        if (href.includes('markdown/wardley_map_reports/') && !href.includes('books/')) {
            wardleyPath = href.split('markdown/wardley_map_reports/')[1];
            // Use the currently selected book's ID
            bookId = this.selectedBook ? this.selectedBook.id : null;
        }
        // Handle GitHub file structure: books/[directory]/markdown/wardley_map_reports/[filename]
        else if (href.includes('books/') && href.includes('/markdown/wardley_map_reports/')) {
            const bookDirMatch = href.match(/books\/([^\/]+)\/markdown\/wardley_map_reports\/(.+)/);
            if (bookDirMatch) {
                const bookDirectory = bookDirMatch[1];
                wardleyPath = bookDirMatch[2];
                
                // Convert directory name to book ID (same logic as in manifest generation)
                bookId = bookDirectory
                    .toLowerCase()
                    .replace(/__/g, '-')
                    .replace(/_/g, '-');
            }
        }
        // Handle API format: /wardley/[book-id]/[filename]
        else if (href.includes('/wardley/')) {
            const wardleyMatch = href.match(/\/wardley\/([^\/]+)\/(.+)/);
            if (wardleyMatch) {
                bookId = wardleyMatch[1];
                wardleyPath = wardleyMatch[2];
            }
        }
        // Handle legacy formats
        else if (href.includes('/markdown/wardley_map_reports/')) {
            wardleyPath = href.split('/markdown/wardley_map_reports/')[1];
        } else if (href.includes('/markdown_wardley_map_reports/')) {
            wardleyPath = href.split('/markdown_wardley_map_reports/')[1];
        } else if (href.includes('wardley_map_report_')) {
            // Extract just the filename
            wardleyPath = href.split('/').pop();
        }
        
        if (!bookId) {
            console.error('Cannot determine book ID for Wardley map link:', href);
            return;
        }
        
        // Clean up the title
        const cleanTitle = title.trim() || 'Wardley Map Details';
        
        console.log(`Opening Wardley details: ${wardleyPath} for book ${bookId}`);
        
        // Open the Wardley details panel
        this.openWardleyDetails(bookId, wardleyPath, cleanTitle);
    }
    
    isExternalLink(href) {
        if (!href) return false;
        
        // Consider these as external links:
        // - Full URLs starting with http/https
        // - Protocol-relative URLs starting with //
        // - mailto: links
        // - tel: links
        
        return (
            href.startsWith('http://') ||
            href.startsWith('https://') ||
            href.startsWith('//') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:')
        );
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollBookIntoView(bookElement) {
        if (!bookElement) return;

        const bookList = document.getElementById('bookList');
        if (!bookList) return;

        // Get the container and element positions
        const containerRect = bookList.getBoundingClientRect();
        const elementRect = bookElement.getBoundingClientRect();
        
        // Check if the element is already fully visible
        const isVisible = (
            elementRect.top >= containerRect.top &&
            elementRect.bottom <= containerRect.bottom
        );

        if (!isVisible) {
            // Calculate the scroll position to center the element
            const elementOffsetTop = bookElement.offsetTop;
            const containerHeight = bookList.clientHeight;
            const elementHeight = bookElement.offsetHeight;
            
            // Center the element in the container
            const targetScrollTop = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2);
            
            // Smooth scroll to the target position
            bookList.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
            
            // Add highlight animation after scrolling
            setTimeout(() => {
                bookElement.classList.add('scroll-highlight');
                
                // Remove the highlight class after animation completes
                setTimeout(() => {
                    bookElement.classList.remove('scroll-highlight');
                }, 1500);
            }, 300); // Delay to let scroll animation start
        }
    }

    scrollToHash(hash) {
        if (!hash) return;
        
        // Remove the # if present
        const targetId = hash.startsWith('#') ? hash.slice(1) : hash;
        
        // Find the target element
        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
            console.warn(`Target element with id '${targetId}' not found`);
            return;
        }
        
        // Get the book content container
        const bookContentContainer = document.querySelector('.book-content');
        if (!bookContentContainer) {
            console.warn('Book content container not found');
            return;
        }
        
        // Calculate the scroll position relative to the container
        const containerRect = bookContentContainer.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // Calculate the scroll offset (accounting for container's current scroll position)
        const targetScrollTop = bookContentContainer.scrollTop + (targetRect.top - containerRect.top) - 20; // 20px offset for better visibility
        
        // Smooth scroll to the target
        bookContentContainer.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });
        
        console.log(`Scrolled to element with id: ${targetId}`);
    }

    extractAndDisplayTOC(bookContent) {
        // Find all headings in the book content
        const headings = bookContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const tocPanel = document.getElementById('tocPanel');
        const tocContent = document.getElementById('tocContent');
        const splitterToc = document.getElementById('splitterToc');
        
        if (headings.length > 1) { // Only show TOC if there are multiple headings
            // Extract TOC data
            const tocData = Array.from(headings).map(heading => {
                const level = parseInt(heading.tagName.charAt(1));
                const text = heading.textContent.trim();
                const id = heading.querySelector('a[id]')?.id || this.generateAnchor(text);
                
                return { level, text, id };
            }).filter(item => item.text && item.text !== 'Table of Contents'); // Filter out empty and TOC heading
            
            if (tocData.length > 1) { // Only proceed if we have meaningful content
                // Generate TOC HTML
                const tocHTML = this.generateTOCHTML(tocData);
                tocContent.innerHTML = tocHTML;
                
                // Show TOC panel and splitter
                tocPanel.style.display = 'block';
                splitterToc.style.display = 'block';
                
                // Setup TOC event listeners
                this.setupTOCEventListeners();
                
                return;
            }
        }
        
        // Hide TOC if not enough content
        tocPanel.style.display = 'none';
        splitterToc.style.display = 'none';
    }

    generateTOCHTML(tocData) {
        let html = '<ul>';
        let currentLevel = 0;
        
        tocData.forEach(item => {
            if (item.level > currentLevel) {
                // Open new nested levels
                for (let i = currentLevel; i < item.level; i++) {
                    if (i > 0) html += '<ul>';
                }
            } else if (item.level < currentLevel) {
                // Close nested levels
                for (let i = currentLevel; i > item.level; i--) {
                    html += '</ul>';
                }
            }
            
            html += `<li class="level-${item.level}">
                        <a href="#${item.id}" data-target="${item.id}">${this.escapeHtml(item.text)}</a>
                     </li>`;
            currentLevel = item.level;
        });
        
        // Close all remaining levels
        for (let i = currentLevel; i > 0; i--) {
            html += '</ul>';
        }
        
        return html;
    }

    generateAnchor(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    setupTOCEventListeners() {
        const tocContent = document.getElementById('tocContent');
        const toggleToc = document.getElementById('toggleToc');
        
        // Handle TOC link clicks
        if (tocContent) {
            tocContent.addEventListener('click', (e) => {
                e.preventDefault();
                const link = e.target.closest('a[data-target]');
                if (link) {
                    const targetId = link.getAttribute('data-target');
                    this.scrollToHash(`#${targetId}`);
                    
                    // Update active state
                    tocContent.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Update URL hash
                    window.history.replaceState(null, null, `${window.location.pathname}${window.location.search}#${targetId}`);
                }
            });
        }
        
        // Handle TOC toggle
        if (toggleToc) {
            toggleToc.onclick = () => this.toggleTOCPanel();
        }
    }

    toggleTOCPanel() {
        const tocPanel = document.getElementById('tocPanel');
        const splitterToc = document.getElementById('splitterToc');
        
        if (tocPanel && splitterToc) {
            const isVisible = tocPanel.style.display !== 'none';
            tocPanel.style.display = isVisible ? 'none' : 'block';
            splitterToc.style.display = isVisible ? 'none' : 'block';
        }
    }

    // URL routing methods
    handleInitialRoute() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('book');
        const hasHash = window.location.hash.length > 0;
        
        if (bookId) {
            let book = this.books.find(b => b.id === bookId);
            
            // If not found with exact ID, try to find by fixing common URL issues
            if (!book) {
                book = this.findBookByFuzzyMatch(bookId);
            }
            
            if (book) {
                // Preserve hash fragment if present
                this.selectBook(book, true, hasHash);
            } else {
                console.warn(`Book with ID '${bookId}' not found`);
                // Remove invalid book param from URL
                this.updateUrl(null);
            }
        }
    }
    
    findBookByFuzzyMatch(bookId) {
        // Try to find book by handling common URL formatting issues
        
        // Try with double dashes (common issue)
        const doubleDashId = bookId.replace(/-([a-zA-Z])/g, '--$1');
        let book = this.books.find(b => b.id === doubleDashId);
        if (book) return book;
        
        // Try with single dashes
        const singleDashId = bookId.replace(/--/g, '-');
        book = this.books.find(b => b.id === singleDashId);
        if (book) return book;
        
        // Try partial matches on title keywords
        const searchTerms = bookId.toLowerCase().split('-').filter(term => term.length > 3);
        
        for (const book of this.books) {
            const titleLower = book.title.toLowerCase();
            let matchCount = 0;
            
            for (const term of searchTerms) {
                if (titleLower.includes(term)) {
                    matchCount++;
                }
            }
            
            // If most terms match, it's probably the right book
            if (matchCount >= Math.max(2, searchTerms.length * 0.6)) {
                console.log(`Fuzzy matched '${bookId}' to '${book.id}'`);
                return book;
            }
        }
        
        return null;
    }
    
    handlePopState(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('book');
        const hasHash = window.location.hash.length > 0;
        
        if (bookId) {
            const book = this.books.find(b => b.id === bookId);
            if (book) {
                this.selectBook(book, false, hasHash);
            }
        } else {
            // No book selected, show welcome screen
            this.showWelcomeScreen();
        }
    }
    
    updateUrl(bookId, preserveHash = false) {
        const url = new URL(window.location);
        
        if (bookId) {
            url.searchParams.set('book', bookId);
            // Only clear hash when switching books if not preserving it
            if (!preserveHash) {
                url.hash = '';
            }
        } else {
            url.searchParams.delete('book');
            url.hash = '';
        }
        
        window.history.pushState({ bookId }, '', url);
        
        // Update page title
        if (bookId && this.selectedBook) {
            document.title = `${this.selectedBook.title} - Wardley Map Library`;
        } else {
            document.title = 'Wardley Map Library';
        }
    }
    
    showWelcomeScreen() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const bookDisplay = document.getElementById('bookDisplay');
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (welcomeMessage) welcomeMessage.style.display = 'block';
        if (bookDisplay) bookDisplay.style.display = 'none';
        if (loadingMessage) loadingMessage.style.display = 'none';
        
        // Clear selection
        document.querySelectorAll('.book-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        this.selectedBook = null;
        
        // Reset meta tags to default
        this.resetMetaTags();
        
        // Update scroll to selected button visibility
        this.updateScrollToSelectedButton();
    }
    
    // Share functionality
    setupShareButton() {
        const shareButton = document.getElementById('shareButton');
        if (shareButton) {
            shareButton.addEventListener('click', () => this.shareCurrentBook());
        }
    }
    
    setupScrollToSelectedButton() {
        const scrollButton = document.getElementById('scrollToSelected');
        if (scrollButton) {
            scrollButton.addEventListener('click', () => this.scrollToCurrentlySelected());
        }
    }
    
    scrollToCurrentlySelected() {
        if (!this.selectedBook) return;
        
        const selectedItem = document.querySelector(`[data-book-id="${this.selectedBook.id}"]`);
        if (selectedItem) {
            this.scrollBookIntoView(selectedItem);
        }
    }
    
    updateScrollToSelectedButton() {
        const scrollButton = document.getElementById('scrollToSelected');
        if (scrollButton) {
            if (this.selectedBook) {
                scrollButton.style.display = 'flex';
            } else {
                scrollButton.style.display = 'none';
            }
        }
    }
    
    updateMetaTags(book) {
        if (!book) return;
        
        // Update page title
        document.title = `${book.title} - Wardley Map Library`;
        
        // Update meta description
        const description = `Read "${book.title}" - ${book.category} insights in the Wardley Map Library. Comprehensive digital library of Wardley Mapping resources and strategic analysis reports with interactive features.`;
        this.updateMetaTag('description', description);
        
        // Update Open Graph tags
        this.updateMetaTag('og:title', `${book.title} - Wardley Map Library`);
        this.updateMetaTag('og:description', description);
        this.updateMetaTag('og:url', `${window.location.origin}${window.location.pathname}?book=${book.id}`);
        
        // Update Twitter tags
        this.updateMetaTag('twitter:title', `${book.title} - Wardley Map Library`);
        this.updateMetaTag('twitter:description', description);
        this.updateMetaTag('twitter:url', `${window.location.origin}${window.location.pathname}?book=${book.id}`);
        
        // Update canonical URL
        this.updateCanonicalUrl(`${window.location.origin}${window.location.pathname}?book=${book.id}`);
        
        // Update structured data
        this.updateStructuredData(book);
    }
    
    updateMetaTag(name, content) {
        let selector = `meta[name="${name}"]`;
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
            selector = `meta[property="${name}"]`;
        }
        
        let metaTag = document.querySelector(selector);
        if (metaTag) {
            metaTag.setAttribute('content', content);
        } else {
            // Create new meta tag if it doesn't exist
            metaTag = document.createElement('meta');
            if (name.startsWith('og:') || name.startsWith('twitter:')) {
                metaTag.setAttribute('property', name);
            } else {
                metaTag.setAttribute('name', name);
            }
            metaTag.setAttribute('content', content);
            document.head.appendChild(metaTag);
        }
    }
    
    updateCanonicalUrl(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute('href', url);
        } else {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            canonical.setAttribute('href', url);
            document.head.appendChild(canonical);
        }
    }
    
    updateStructuredData(book) {
        // Remove existing structured data
        const existingSchema = document.querySelector('script[type="application/ld+json"]');
        if (existingSchema) {
            existingSchema.remove();
        }
        
        // Create new structured data for the book
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Book",
            "name": book.title,
            "description": `${book.title} - ${book.category} insights and strategic frameworks`,
            "url": `${window.location.origin}${window.location.pathname}?book=${book.id}`,
            "genre": book.category,
            "inLanguage": "en",
            "isAccessibleForFree": true,
            "publisher": {
                "@type": "Organization",
                "name": "Wardley Map Library"
            },
            "mainEntity": {
                "@type": "WebPage",
                "name": book.title,
                "url": `${window.location.origin}${window.location.pathname}?book=${book.id}`
            }
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
    }
    
    resetMetaTags() {
        // Reset to default when no book is selected
        document.title = 'Wardley Map Library - Strategic Analysis & Business Strategy Resource Collection';
        
        const defaultDescription = 'Comprehensive digital library of Wardley Mapping resources, strategic analysis reports, and business strategy books. Features advanced mapping insights, strategic frameworks, and cutting-edge business analysis for professionals and researchers.';
        this.updateMetaTag('description', defaultDescription);
        this.updateMetaTag('og:title', 'Wardley Map Library - Strategic Analysis Resource Collection');
        this.updateMetaTag('og:description', 'Comprehensive digital library of Wardley Mapping resources and strategic analysis reports with interactive features and advanced mapping insights.');
        this.updateMetaTag('og:url', `${window.location.origin}${window.location.pathname}`);
        
        this.updateCanonicalUrl(`${window.location.origin}${window.location.pathname}`);
    }
    
    async shareCurrentBook() {
        if (!this.selectedBook) return;
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?book=${this.selectedBook.id}`;
        const shareData = {
            title: this.selectedBook.title,
            text: `Check out "${this.selectedBook.title}" in the Wardley Map Library`,
            url: shareUrl
        };
        
        try {
            // Try native Web Share API first (mobile/modern browsers)
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return;
            }
        } catch (error) {
            console.log('Web Share API not available or cancelled, falling back to clipboard');
        }
        
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            this.showShareSuccess();
        } catch (error) {
            // Final fallback: select text in a temporary input
            this.fallbackCopyToClipboard(shareUrl);
        }
    }
    
    showShareSuccess() {
        const shareButton = document.getElementById('shareButton');
        if (!shareButton) return;
        
        const originalText = shareButton.innerHTML;
        shareButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            Copied!
        `;
        shareButton.style.background = '#28a745';
        
        setTimeout(() => {
            shareButton.innerHTML = originalText;
            shareButton.style.background = '#667eea';
        }, 2000);
    }
    
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showShareSuccess();
        } catch (error) {
            console.error('Fallback copy failed:', error);
            alert(`Copy this link to share: ${text}`);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    // Wardley Details Panel functionality
    setupWardleyPanel() {
        const closeButton = document.getElementById('closeWardley');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeWardleyDetails());
        }
        
        // Setup vertical splitter for Wardley panel
        this.setupVerticalSplitter();
    }
    
    setupVerticalSplitter() {
        const splitter = document.getElementById('splitterVertical');
        const wardleyDetails = document.getElementById('wardleyDetails');
        const mainContent = document.querySelector('.main-content');
        
        if (!splitter || !wardleyDetails || !mainContent) return;

        let isResizing = false;
        
        splitter.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            
            splitter.classList.add('dragging');
            document.body.classList.add('no-select');
            
            const startX = e.clientX;
            const startWidth = wardleyDetails.offsetWidth;
            
            const handleMouseMove = (e) => {
                if (!isResizing) return;
                
                const deltaX = startX - e.clientX; // Reverse direction for right panel
                const newWidth = startWidth + deltaX;
                
                // Constrain width within min/max bounds
                const minWidth = parseInt(getComputedStyle(wardleyDetails).minWidth) || 300;
                const maxWidth = parseInt(getComputedStyle(wardleyDetails).maxWidth) || 600;
                const containerWidth = mainContent.offsetWidth;
                const maxAllowedWidth = Math.min(maxWidth, containerWidth * 0.5); // Max 50% of container
                
                const constrainedWidth = Math.max(minWidth, Math.min(newWidth, maxAllowedWidth));
                
                wardleyDetails.style.width = constrainedWidth + 'px';
                
                // Store the width preference
                localStorage.setItem('wardleyDetailsWidth', constrainedWidth);
            };
            
            const handleMouseUp = () => {
                isResizing = false;
                
                splitter.classList.remove('dragging');
                document.body.classList.remove('no-select');
                
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }
    
    async openWardleyDetails(bookId, wardleyPath, title) {
        const wardleyDetails = document.getElementById('wardleyDetails');
        const splitterVertical = document.getElementById('splitterVertical');
        const wardleyTitle = document.getElementById('wardleyTitle');
        const wardleyContent = document.getElementById('wardleyContent');
        const wardleyLoading = document.getElementById('wardleyLoading');
        
        // Show the panel and splitter
        wardleyDetails.style.display = 'flex';
        splitterVertical.style.display = 'block';
        
        // Set title
        if (wardleyTitle) {
            wardleyTitle.textContent = title || 'Wardley Map Details';
        }
        
        // Show loading
        if (wardleyLoading) {
            wardleyLoading.style.display = 'block';
        }
        if (wardleyContent) {
            wardleyContent.innerHTML = '';
        }
        
        try {
            // Fetch the Wardley map content
            const response = await fetch(`/api/wardley/${bookId}/${wardleyPath}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load Wardley map');
            }
            
            // Parse and display the markdown content
            const html = marked.parse(data.content);
            
            if (wardleyContent) {
                wardleyContent.innerHTML = html;
                // Apply syntax highlighting
                if (window.Prism) {
                    Prism.highlightAllUnder(wardleyContent);
                }
            }
            
        } catch (error) {
            console.error('Error loading Wardley map:', error);
            if (wardleyContent) {
                wardleyContent.innerHTML = `
                    <div class="error-message">
                        <h3>Failed to load Wardley map details</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        } finally {
            if (wardleyLoading) {
                wardleyLoading.style.display = 'none';
            }
        }
        
        // Restore saved width
        this.restoreWardleyWidth();
        
        // Setup panel if not already done
        this.setupWardleyPanel();
    }
    
    closeWardleyDetails() {
        const wardleyDetails = document.getElementById('wardleyDetails');
        const splitterVertical = document.getElementById('splitterVertical');
        
        if (wardleyDetails) {
            wardleyDetails.style.display = 'none';
        }
        if (splitterVertical) {
            splitterVertical.style.display = 'none';
        }
    }
    
    restoreWardleyWidth() {
        const savedWidth = localStorage.getItem('wardleyDetailsWidth');
        const wardleyDetails = document.getElementById('wardleyDetails');
        
        if (savedWidth && wardleyDetails) {
            const width = parseInt(savedWidth);
            const minWidth = parseInt(getComputedStyle(wardleyDetails).minWidth) || 300;
            const maxWidth = parseInt(getComputedStyle(wardleyDetails).maxWidth) || 600;
            
            if (width >= minWidth && width <= maxWidth) {
                wardleyDetails.style.width = width + 'px';
            }
        }
    }

    // Health check method for debugging
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            const data = await response.json();
            console.log('API Health:', data);
            return data.success;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add some loading feedback
    console.log('🚀 Initializing Wardley Map Library...');
    
    const app = new BooksLibrary();
    
    // Make app available globally for debugging
    window.booksApp = app;
    
    // Optional: Add a health check
    setTimeout(() => {
        app.healthCheck().then(isHealthy => {
            if (isHealthy) {
                console.log('✅ API connection healthy');
            } else {
                console.warn('⚠️ API connection issues detected');
            }
        });
    }, 1000);
});