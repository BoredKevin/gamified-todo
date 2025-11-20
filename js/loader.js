// js/loader.js

// Map from id -> URL for partials
function idToUrl(id) {
  const name = id.replace(/^partial-/, '');
  return `partials/${name}.html`;
}

async function loadPartials() {
  const containers = document.querySelectorAll('[id^="partial-"]');
  for (const el of containers) {
    try {
      const res = await fetch(idToUrl(el.id));
      if (res.ok) el.innerHTML = await res.text();
    } catch (err) {
      console.error('Error loading partial', el.id, err);
    }
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

async function bootstrapApp() {
  try {
    await loadPartials();

    // Vendor Scripts
    await loadScript('vendor/jquery/jquery.min.js');
    await loadScript('vendor/bootstrap/js/bootstrap.bundle.min.js');
    await loadScript('vendor/jquery-easing/jquery.easing.min.js');
    await loadScript('js/sb-admin-2.min.js');
    await loadScript('vendor/chart.js/Chart.min.js');

    // App Core & Services
    await loadScript('js/utils/helpers.js');
    await loadScript('js/services/notificationService.js');
    await loadScript('js/services/gamificationService.js');
    await loadScript('js/services/taskService.js');

    // UI & Controller
    await loadScript('js/ui/taskRenderer.js');
    await loadScript('js/app.js');

    // Demos (Keep existing if needed, might need minor tweaks if they depended on globals)
    // await loadScript('js/demo/chart-area-demo.js'); 
    
    console.log('All scripts loaded successfully');
    document.dispatchEvent(new Event('scripts:loaded'));
    document.getElementById('loading-spinner').style.visibility = 'hidden';
  } catch (err) {
    console.error('Error bootstrapping app:', err);
  }
}

document.addEventListener('DOMContentLoaded', bootstrapApp);