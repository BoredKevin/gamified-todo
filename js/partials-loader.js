// js/partials-loader.js

// Map from id -> URL, based on a convention:
// "partial-sidebar" -> "partials/sidebar.html"
function idToUrl(id) {
  // remove "partial-" prefix
  const name = id.replace(/^partial-/, '');
  return `partials/${name}.html`;
}

async function loadPartials() {
  // Find all elements whose id starts with "partial-"
  const containers = document.querySelectorAll('[id^="partial-"]');

  for (const el of containers) {
    const url = idToUrl(el.id);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed to load partial ${url}: ${res.status}`);
        continue;
      }
      const html = await res.text();
      el.innerHTML = html;
    } catch (err) {
      console.error('Error loading partial', url, err);
    }
  }
  document.dispatchEvent(new Event('partials:loaded'));
}

// Helper function to dynamically load JavaScript files
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    
    document.head.appendChild(script);
  });
}

async function bootstrapApp() {
  try {
    // 1. Load partial HTML first
    await loadPartials();

    // 2. Then load all the JS files in order
    await loadScript('vendor/jquery/jquery.min.js');
    await loadScript('vendor/bootstrap/js/bootstrap.bundle.min.js');
    await loadScript('vendor/jquery-easing/jquery.easing.min.js');
    await loadScript('js/sb-admin-2.min.js');
    await loadScript('js/app/todo-list.js');
    await loadScript('vendor/chart.js/Chart.min.js');
    await loadScript('js/demo/chart-area-demo.js');
    await loadScript('js/demo/chart-pie-demo.js');
    
    console.log('All scripts loaded successfully');
  } catch (err) {
    console.error('Error bootstrapping app:', err);
  }
}

// Start everything once DOM is parsed
document.addEventListener('DOMContentLoaded', bootstrapApp);