# Knack Customizations

A collection of reusable functions to enhance Knack applications.

## Available Functions

### Scroll-To Navigation

Adds a sticky navigation bar that automatically detects views and creates "jump to" links for easier navigation on long pages.

#### Features:
- Automatically creates navigation links based on Knack views
- Highlights the currently visible section
- Responsive design (button style on desktop, text links on mobile)
- Only appears on pages where it's needed (long content or multiple views)
- No URL changes when clicking navigation links (preserves page refresh)

#### Usage:

Add this to your Knack app's JavaScript section:

```javascript
$.getScript('https://cdn.jsdelivr.net/gh/ivojolo/knack-customizations@main/loader/loader.js', function() {
  loadKnackFunction('scroll-to');
});
