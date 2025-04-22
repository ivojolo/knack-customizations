function loadKnackFunction(functionName) {
  // Load CSS if it exists
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = `https://cdn.jsdelivr.net/gh/YOUR_USERNAME/knack-customizations@main/${functionName}/${functionName}.css`;
  
  // Handle CSS loading errors gracefully
  cssLink.onerror = function() {
    console.log(`No CSS file found for ${functionName}`);
    document.head.removeChild(cssLink);
  };
  
  document.head.appendChild(cssLink);
  
  // Load JS
  const scriptTag = document.createElement('script');
  scriptTag.src = `https://cdn.jsdelivr.net/gh/YOUR_USERNAME/knack-customizations@main/${functionName}/${functionName}.js`;
  document.body.appendChild(scriptTag);
}
