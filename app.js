// PWA MAIN SCRIPT
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 PWA Initialisée');

    // 1. GESTION DU RÉSEAU (Online/Offline)
    const updateNetworkStatus = () => {
        const isOnline = navigator.onLine;
        const connStatus = document.getElementById('connectionStatus');
        const netStatus = document.getElementById('networkStatus');
        const wifiIcon = document.getElementById('wifiIcon');

        if (connStatus) {
            connStatus.innerHTML = `
                <i class="fas fa-circle" style="color:${isOnline ? '#2ecc71' : '#e74c3c'}"></i>
                <span>${isOnline ? 'En ligne' : 'Hors ligne'}</span>
            `;
        }
        if (netStatus) netStatus.textContent = isOnline ? 'En ligne' : 'Hors ligne';
        if (wifiIcon) {
            wifiIcon.className = isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash';
            wifiIcon.style.color = isOnline ? '#2ecc71' : '#e74c3c';
        }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // 2. ENREGISTREMENT DU SERVICE WORKER
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => {
                console.log('✅ SW enregistré sur le scope:', reg.scope);
                document.getElementById('statusSw').innerHTML = `<i class="fas fa-check-circle" style="color:#2ecc71"></i> <span>Service Worker : <strong>Actif</strong></span>`;
                document.getElementById('swStatus').innerHTML = `<i class="fas fa-check-circle"></i> <span>Actif</span>`;
            })
            .catch(err => {
                console.error('❌ Échec SW:', err);
                document.getElementById('statusSw').innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#e74c3c"></i> <span>Service Worker : <strong>Erreur</strong></span>`;
            });
    }

    // 3. GESTION DE L'INSTALLATION (PWA)
    let deferredPrompt;
    const installBtn = document.getElementById('installBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.style.display = 'flex';
        
        document.getElementById('statusPwa').innerHTML = `<i class="fas fa-download" style="color:#3498db"></i> <span>Installation : <strong>Disponible</strong></span>`;
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                    showToast('🎉 Merci d\'avoir installé l\'app !');
                }
                deferredPrompt = null;
            }
        });
    }

    // 4. NAVIGATION ET SIMULATION
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('pageTitle').textContent = this.querySelector('span').textContent;
        });
    });

    document.getElementById('testBtn').onclick = () => {
        showToast('Simulation en cours...');
        let i = 0;
        const timer = setInterval(() => {
            menuItems[i].click();
            i++;
            if (i >= menuItems.length) {
                clearInterval(timer);
                menuItems[0].click();
                showToast('Prêt pour l\'installation !');
            }
        }, 600);
    };

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:12px 25px; border-radius:30px; z-index:9999; font-size:14px; box-shadow:0 4px 12px rgba(0,0,0,0.3);`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});