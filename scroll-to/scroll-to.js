// Main function to add scroll-to navigation
function addScrollToFeature() {
  // Variables declaration
  const SCENE_CONTAINER = document.querySelector('.kn-scene');
  const NAV_CONTAINER_ID = 'scroll-to-nav';
  const NAV_ITEM_CLASS = 'scroll-to-item';
  const NAV_ITEM_ACTIVE_CLASS = 'scroll-to-item-active';
  const NAV_TITLE = 'Jump to:';
  const MIN_VIEWS_THRESHOLD = 3;
  const MIN_HEIGHT_RATIO = 1.5;
  
  if (!SCENE_CONTAINER) return;
  
  // Find actual view containers
  const VIEWS = Array.from(document.querySelectorAll('[id^="view_"]')).filter(el => {
    // Basic view filtering
    const isValidView = el.id && 
           /^view_\d+$/.test(el.id) && 
           !el.classList.contains('kn-menu') &&
           (el.classList.contains('kn-view') || 
            el.querySelector('.kn-view') ||
            el.hasAttribute('data-view'));
    
    if (!isValidView) return false;
    
    // Check if view has a header title
    const hasHeader = Boolean(
      el.querySelector('.kn-title') || 
      el.querySelector('.section-header') || 
      el.querySelector('h1, h2, h3, h4, h5, h6')
    );
    
    if (!hasHeader) return false;
    
    // Check if view is visually hidden
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    
    const isHidden = 
      // Check for common CSS hiding techniques
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      // Check for "visually hidden" pattern (positioned far off-screen)
      (Math.abs(rect.left) > 5000 || Math.abs(rect.top) > 5000) ||
      // Check for zero dimensions with overflow hidden
      (parseFloat(style.width) <= 1 && parseFloat(style.height) <= 1 && style.overflow === 'hidden') ||
      // Check for clip technique
      style.clip === 'rect(0px, 0px, 0px, 0px)' ||
      style.position === 'absolute' && style.left.includes('-9999');
    
    return !isHidden;
  });
  
  // Check if we should add navigation based on views count or page height
  const hasEnoughViews = VIEWS.length > MIN_VIEWS_THRESHOLD;
  const sceneHeight = SCENE_CONTAINER.scrollHeight;
  const heightRatio = sceneHeight / window.innerHeight;
  const isLongEnough = heightRatio > MIN_HEIGHT_RATIO;
  
  if ((!hasEnoughViews && !isLongEnough) || VIEWS.length === 0) return;
  
  // Remove existing navigation if it exists
  const existingNav = document.getElementById(NAV_CONTAINER_ID);
  if (existingNav) existingNav.remove();
  
  // Create navigation container
  const navContainer = document.createElement('div');
  navContainer.id = NAV_CONTAINER_ID;
  navContainer.className = 'scroll-to-nav-container';
  
  // Add heading
  const heading = document.createElement('div');
  heading.textContent = NAV_TITLE;
  heading.className = 'scroll-to-nav-title';
  navContainer.appendChild(heading);
  
  // Create link container
  const linkContainer = document.createElement('div');
  linkContainer.className = 'scroll-to-nav-links';
  navContainer.appendChild(linkContainer);
  
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
  
  // Add separator
  if (VIEWS.length > 0) {
    const separator = document.createElement('span');
    separator.textContent = '|';
    separator.className = 'scroll-to-nav-separator';
    linkContainer.appendChild(separator);
  }
  
  // Add links for each view
  VIEWS.forEach(view => {
    const viewId = view.id;
    const viewName = getViewName(view, viewId);
    
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
  
  // Insert at the beginning of the scene
  SCENE_CONTAINER.insertBefore(navContainer, SCENE_CONTAINER.firstChild);
  
  // Set active navigation item
  function setActiveNavItem(targetId) {
    Object.values(navLinks).forEach(link => link.classList.remove(NAV_ITEM_ACTIVE_CLASS));
    
    const activeLink = navLinks[targetId];
    if (activeLink) activeLink.classList.add(NAV_ITEM_ACTIVE_CLASS);
  }
  
  // Get view name from various possible sources
  function getViewName(view, viewId) {
    const heading = view.querySelector('.kn-title') || 
                   view.querySelector('.section-header') || 
                   view.querySelector('h1, h2, h3, h4, h5, h6');
    
    if (heading && heading.textContent.trim()) {
      return heading.textContent.trim();
    }
    
    const viewAttr = view.getAttribute('data-view');
    if (viewAttr) {
      return `View ${viewAttr.replace(/view_/i, '')}`;
    }
    
    return `View ${viewId.replace('view_', '')}`;
  }
  
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
