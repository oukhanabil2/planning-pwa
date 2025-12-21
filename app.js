// PWA MAIN SCRIPT
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 PWA initialisée');
    
    // NETWORK STATUS
    function updateNetworkStatus() {
        const isOnline = navigator.onLine;
        document.getElementById('connectionStatus').innerHTML = `
            <i class="fas fa-circle" style="color:${isOnline ? '#2ecc71' : '#e74c3c'}"></i>
            <span>${isOnline ? 'En ligne' : 'Hors ligne'}</span>
        `;
        document.getElementById('networkStatus').textContent = isOnline ? 'En ligne' : 'Hors ligne';
        document.getElementById('wifiIcon').className = isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash';
        document.getElementById('wifiIcon').style.color = isOnline ? '#2ecc71' : '#e74c3c';
    }
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
    
    // HTTPS CHECK
    const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    document.getElementById('statusHttps').innerHTML = `
        <i class="fas fa-${isHttps ? 'lock' : 'unlock'}"></i>
        <span>HTTPS : <strong>${isHttps ? '✅ Actif' : '❌ Non sécurisé'}</strong></span>
    `;
    
    // SERVICE WORKER
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js', { scope: './' })
            .then(registration => {
                console.log('✅ Service Worker enregistré');
                document.getElementById('statusSw').innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>Service Worker : <strong>✅ Actif</strong></span>
                `;
                document.getElementById('swStatus').innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>Actif</span>
                `;
            })
            .catch(err => {
                console.log('❌ Service Worker échec:', err);
                document.getElementById('statusSw').innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Service Worker : <strong>⚠️ Échec</strong></span>
                `;
            });
    }
    
    // PWA INSTALLATION
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installBtn = document.getElementById('installBtn');
        installBtn.style.display = 'flex';
        installBtn.onclick = () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(choice => {
                if (choice.outcome === 'accepted') {
                    document.getElementById('statusPwa').innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <span>Installation : <strong>✅ Installée</strong></span>
                    `;
                    installBtn.style.display = 'none';
                    showToast('Application installée !');
                }
                deferredPrompt = null;
            });
        };
        
        document.getElementById('statusPwa').innerHTML = `
            <i class="fas fa-download"></i>
            <span>Installation : <strong>✅ Disponible</strong></span>
        `;
    });
    
    // CHECK IF ALREADY INSTALLED
    if (window.matchMedia('(display-mode: standalone)').matches) {
        document.getElementById('statusPwa').innerHTML = `
            <i class="fas fa-mobile-alt"></i>
            <span>Installation : <strong>✅ Déjà installée</strong></span>
        `;
        document.getElementById('installBtn').style.display = 'none';
    }
    
    // SIMULATE USAGE
    document.getElementById('testBtn').onclick = () => {
        const menuItems = document.querySelectorAll('.menu-item');
        let index = 0;
        
        const interval = setInterval(() => {
            menuItems.forEach(item => item.classList.remove('active'));
            menuItems[index].classList.add('active');
            document.getElementById('pageTitle').textContent = menuItems[index].querySelector('span').textContent;
            
            index++;
            if (index >= menuItems.length) {
                clearInterval(interval);
                menuItems[0].classList.add('active');
                document.getElementById('pageTitle').textContent = 'Tableau de bord';
                showToast('Simulation terminée. Vérifiez le menu Chrome (⋮)');
                
                // Check if install prompt available
                if (deferredPrompt) {
                    showToast('PWA prête à installer !', 5000);
                }
            }
        }, 800);
    };
    
    // MENU CLICKS
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('pageTitle').textContent = this.querySelector('span').textContent;
        });
    });
    
    // TOAST FUNCTION
    function showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    // INITIAL MESSAGE
    setTimeout(() => {
        if (deferredPrompt) {
            showToast('PWA prête à installer ! Utilisez le bouton en haut à droite.', 5000);
        }
    }, 2000);
});
