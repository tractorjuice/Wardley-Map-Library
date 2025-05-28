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
            
            listItem.innerHTML = `
                <div class="book-title">${this.escapeHtml(book.title)}</div>
                <div class="book-category">${this.escapeHtml(book.category)}</div>
            `;
            
            listItem.addEventListener('click', () => this.selectBook(book));
            fragment.appendChild(listItem);
        });

        booksList.appendChild(fragment);
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterBooks(e.target.value));
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

    filterBooks(searchTerm) {
        const bookItems = document.querySelectorAll('.book-item');
        const lowercaseSearch = searchTerm.toLowerCase();

        bookItems.forEach(item => {
            const title = item.querySelector('.book-title').textContent.toLowerCase();
            const category = item.querySelector('.book-category').textContent.toLowerCase();
            const matches = title.includes(lowercaseSearch) || category.includes(lowercaseSearch);
            
            item.style.display = matches ? 'block' : 'none';
        });

        // Update visible count
        const visibleItems = Array.from(bookItems).filter(item => item.style.display !== 'none');
        this.updateBookCount(visibleItems.length);
    }

    async selectBook(book, updateUrl = true) {
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
                this.updateUrl(book.id);
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
        if (bookCategory) bookCategory.textContent = book.category;

        // Convert markdown to HTML and display
        const bookContent = document.getElementById('bookContent');
        if (bookContent) {
            try {
                bookContent.innerHTML = marked.parse(content);
                
                // Make external links open in new tabs
                this.processExternalLinks(bookContent);
                
                // Highlight code blocks if Prism is available
                if (typeof Prism !== 'undefined') {
                    Prism.highlightAllUnder(bookContent);
                }
            } catch (error) {
                console.error('Error parsing markdown:', error);
                bookContent.innerHTML = `<pre>${this.escapeHtml(content)}</pre>`;
            }
        }

        // Scroll to top
        const bookContentContainer = document.querySelector('.book-content');
        if (bookContentContainer) {
            bookContentContainer.scrollTop = 0;
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

    updateBookCount(visibleCount = null) {
        const bookCountElement = document.getElementById('bookCount');
        if (bookCountElement) {
            const count = visibleCount !== null ? visibleCount : this.books.length;
            bookCountElement.textContent = count;
        }
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
        
        // Handle GitHub file structure: books/[directory]/markdown/wardley_map_reports/[filename]
        if (href.includes('books/') && href.includes('/markdown/wardley_map_reports/')) {
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

    // URL routing methods
    handleInitialRoute() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('book');
        
        if (bookId) {
            let book = this.books.find(b => b.id === bookId);
            
            // If not found with exact ID, try to find by fixing common URL issues
            if (!book) {
                book = this.findBookByFuzzyMatch(bookId);
            }
            
            if (book) {
                this.selectBook(book, true); // Update URL to correct ID if needed
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
        
        if (bookId) {
            const book = this.books.find(b => b.id === bookId);
            if (book) {
                this.selectBook(book, false);
            }
        } else {
            // No book selected, show welcome screen
            this.showWelcomeScreen();
        }
    }
    
    updateUrl(bookId) {
        const url = new URL(window.location);
        
        if (bookId) {
            url.searchParams.set('book', bookId);
        } else {
            url.searchParams.delete('book');
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