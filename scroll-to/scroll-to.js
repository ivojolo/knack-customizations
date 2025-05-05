// Main function to add scroll-to navigation
function addScrollToFeature() {
  // Variables declaration
  const SCENE_CONTAINER = document.querySelector('.kn-scene');
  const NAV_CONTAINER_ID = 'scroll-to-nav';
  const NAV_ITEM_CLASS = 'scroll-to-item';
  const NAV_ITEM_ACTIVE_CLASS = 'scroll-to-item-active';
  const NAV_TITLE = 'Scroll to:';
  const STORAGE_KEY = 'scrollToNavVisibility';
  
  if (!SCENE_CONTAINER) return;
  
  // Remove existing navigation if it exists
  const existingNav = document.getElementById(NAV_CONTAINER_ID);
  if (existingNav) existingNav.remove();
  
  // Get the visibility state from localStorage
  let isNavVisible = true;
  try {
    const storedVisibility = localStorage.getItem(STORAGE_KEY);
    if (storedVisibility !== null) {
      isNavVisible = storedVisibility === 'true';
    }
  } catch (e) {
    // Fallback if localStorage is not available
  }
  
  // Create navigation container
  const navContainer = document.createElement('div');
  navContainer.id = NAV_CONTAINER_ID;
  navContainer.className = 'scroll-to-nav-container';
  
  // Create a single row layout
  const navRow = document.createElement('div');
  navRow.className = 'scroll-to-nav-row';
  navContainer.appendChild(navRow);
  
  // Create title section with toggle below
  const titleSection = document.createElement('div');
  titleSection.className = 'scroll-to-nav-title-section';
  
  // Add heading and toggle button
  const heading = document.createElement('div');
  heading.textContent = NAV_TITLE;
  heading.className = 'scroll-to-nav-title';
  titleSection.appendChild(heading);
  
  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'scroll-to-nav-toggle';
  toggleButton.setAttribute('aria-label', isNavVisible ? 'Hide navigation' : 'Show navigation');
  toggleButton.textContent = isNavVisible ? '< hide' : '> show';
  titleSection.appendChild(toggleButton);
  
  navRow.appendChild(titleSection);
  
  // Create link container
  const linkContainer = document.createElement('div');
  linkContainer.className = 'scroll-to-nav-links';
  if (!isNavVisible) {
    linkContainer.style.display = 'none';
  }
  navRow.appendChild(linkContainer);
  
  // Store links for later use
  const navLinks = {};
  
  // Add "Top" button first
  const topLink = document.createElement('a');
  topLink.href = '#';
  topLink.className = NAV_ITEM_CLASS;
  topLink.dataset.target = 'top';
  topLink.textContent = 'Top';
  
  topLink.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveNavItem('top');
  });
  
  linkContainer.appendChild(topLink);
  navLinks['top'] = topLink;
  
  // Find views on the page
  const VIEWS = Array.from(document.querySelectorAll('[id^="view_"]')).filter(el => {
    if (!el.id || !el.querySelector('h1, h2, h3, h4, h5, h6, .kn-title, .section-header')) {
      return false;
    }
    
    const style = window.getComputedStyle(el);
    const isHidden = 
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0';
    
    return !isHidden;
  });
  
  // Add separator if we have views
  if (VIEWS.length > 0) {
    const separator = document.createElement('span');
    separator.textContent = '|';
    separator.className = 'scroll-to-nav-separator';
    linkContainer.appendChild(separator);
  }
  
  // Add links for each view
  VIEWS.forEach(view => {
    const viewId = view.id;
    
    // Get view name
    const heading = view.querySelector('.kn-title, .section-header, h1, h2, h3, h4, h5, h6');
    let viewName = heading && heading.textContent.trim() ? heading.textContent.trim() : `View ${viewId.replace('view_', '')}`;
    
    const link = document.createElement('a');
    link.href = '#';
    link.className = NAV_ITEM_CLASS;
    link.dataset.target = viewId;
    link.textContent = viewName;
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const navHeight = navContainer.offsetHeight;
      const viewPosition = view.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = viewPosition - navHeight;
      
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setActiveNavItem(viewId);
    });
    
    linkContainer.appendChild(link);
    navLinks[viewId] = link;
  });
  
  // Toggle visibility event
  toggleButton.addEventListener('click', function() {
    isNavVisible = !isNavVisible;
    
    // Update toggle button text and aria-label
    toggleButton.textContent = isNavVisible ? '< hide' : '> show';
    toggleButton.setAttribute('aria-label', isNavVisible ? 'Hide navigation' : 'Show navigation');
    
    // Show/hide the link container
    linkContainer.style.display = isNavVisible ? '' : 'none';
    
    // Save state to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, String(isNavVisible));
    } catch (e) {
      // Silent fail if localStorage isn't available
    }
  });
  
  // Insert at the beginning of the scene
  SCENE_CONTAINER.insertBefore(navContainer, SCENE_CONTAINER.firstChild);
  
  // Set active navigation item
  function setActiveNavItem(targetId) {
    Object.values(navLinks).forEach(link => link.classList.remove(NAV_ITEM_ACTIVE_CLASS));
    
    const activeLink = navLinks[targetId];
    if (activeLink) activeLink.classList.add(NAV_ITEM_ACTIVE_CLASS);
  }
  
  // Function to check if dropdown menus are open
  function areDropdownMenusOpen() {
    return document.querySelectorAll('.knHeader__menu-dropdown-list--open').length > 0;
  }
  
  // Update navigation visibility based on dropdown menus
  function updateNavigationVisibility() {
    if (areDropdownMenusOpen()) {
      navContainer.style.visibility = 'hidden';
    } else {
      navContainer.style.visibility = 'visible';
    }
  }
  
  // Setup a mutation observer to watch for dropdown menu changes
  const headerElement = document.querySelector('.knHeader');
  if (headerElement) {
    const headerObserver = new MutationObserver(updateNavigationVisibility);
    
    headerObserver.observe(headerElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }
  
  // Initial check for open dropdowns
  updateNavigationVisibility();
  
  // Update active state based on scroll position
  function updateActiveStateBasedOnScroll() {
    if (window.scrollY < 10) {
      setActiveNavItem('top');
      return;
    }
    
    const viewportMidpoint = window.innerHeight / 2;
    const navHeight = navContainer.offsetHeight;
    
    const viewsAboveMidpoint = VIEWS.filter(view => {
      const rect = view.getBoundingClientRect();
      return rect.top < viewportMidpoint && rect.top > -rect.height + navHeight;
    });
    
    if (viewsAboveMidpoint.length === 0) return;
    
    // Sort by distance from top and highlight the topmost view
    viewsAboveMidpoint.sort((a, b) => {
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    });
    
    setActiveNavItem(viewsAboveMidpoint[0].id);
  }
  
  // Add scroll event (debounced)
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveStateBasedOnScroll, 100);
  });
  
  window.addEventListener('resize', updateActiveStateBasedOnScroll);
  
  // Initial active state
  updateActiveStateBasedOnScroll();
}

// Run on each scene render
$(document).on('knack-scene-render.any', function() {
  setTimeout(addScrollToFeature, 500);
});

// Run the function
addScrollToFeature();
