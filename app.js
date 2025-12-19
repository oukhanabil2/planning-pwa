// Application principale
class PlanningPWA {
    constructor() {
        this.db = null;
        this.currentPage = 'dashboard';
        this.currentDate = new Date();
        this.apiBaseUrl = '/api';
        this.init();
    }

    async init() {
        // Configurer les événements
        this.setupEventListeners();
        
        // Charger la page initiale
        await this.loadPage(this.currentPage);
        
        // Vérifier la connexion
        await this.checkConnection();
    }

    setupEventListeners() {
        // Navigation du menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.loadPage(page);
                
                // Mettre à jour l'état actif
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Thème sombre/clair
        document.getElementById('themeToggle').addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            
            const icon = document.querySelector('#themeToggle i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            
            // Sauvegarder la préférence
            localStorage.setItem('theme', newTheme);
        });

        // Charger le thème sauvegardé
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = document.querySelector('#themeToggle i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        // Fermer le modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
                this.closeModal();
            }
        });
    }

    async loadPage(pageName) {
        this.currentPage = pageName;
        
        // Mettre à jour le titre
        const titles = {
            dashboard: 'Tableau de bord',
            planning: 'Planning',
            agents: 'Gestion des agents',
            statistics: 'Statistiques',
            conges: 'Gestion des congés',
            equipement: 'Équipement',
            import: 'Import Excel',
            settings: 'Paramètres'
        };
        
        document.getElementById('pageTitle').textContent = titles[pageName];
        document.getElementById('breadcrumb').innerHTML = `<span>${titles[pageName]}</span>`;
        
        // Charger le contenu de la page
        const content = document.getElementById('pageContent');
        content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement...</div>';
        
        try {
            switch (pageName) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'planning':
                    await this.loadPlanning();
                    break;
                case 'agents':
                    await this.loadAgents();
                    break;
                case 'statistics':
                    await this.loadStatistics();
                    break;
                case 'conges':
                    await this.loadConges();
                    break;
                case 'equipement':
                    await this.loadEquipement();
                    break;
                case 'import':
                    await this.loadImport();
                    break;
                case 'settings':
                    await this.loadSettings();
                    break;
            }
        } catch (error) {
            console.error(`Erreur chargement page ${pageName}:`, error);
            content.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erreur de chargement</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="app.loadPage('${pageName}')">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        }
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/system/health`);
            if (response.ok) {
                const status = document.querySelector('.connection-status');
                status.innerHTML = '<i class="fas fa-wifi online-icon"></i><span>Connecté</span>';
                return true;
            }
        } catch (error) {
            const status = document.querySelector('.connection-status');
            status.innerHTML = '<i class="fas fa-wifi-slash offline-icon"></i><span>Hors ligne</span>';
            this.showToast('Mode hors ligne activé', 'warning');
        }
        return false;
    }

    async loadDashboard() {
        const content = document.getElementById('pageContent');
        
        try {
            // Récupérer les données depuis l'API
            const [dashboardResponse, agentsResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/dashboard`),
                fetch(`${this.apiBaseUrl}/agents`)
            ]);
            
            let dashboardData = {};
            let agentsData = [];
            
            if (dashboardResponse.ok) {
                dashboardData = await dashboardResponse.json();
            }
            
            if (agentsResponse.ok) {
                const agentsResult = await agentsResponse.json();
                agentsData = agentsResult.agents || [];
            }
            
            const stats = {
                totalAgents: agentsData.length,
                presentToday: dashboardData.present_today || 0,
                shiftsToday: dashboardData.shifts_today || 0,
                congesThisMonth: 0, // À calculer
                radiosAvailable: dashboardData.radios_disponibles || 0,
                totalRadios: 0, // À calculer
                avertissements: dashboardData.avertissements_actifs || 0
            };
            
            content.innerHTML = `
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">Agents actifs</div>
                            <i class="fas fa-users" style="color: #4361ee"></i>
                        </div>
                        <div class="card-value">${stats.totalAgents}</div>
                        <div class="card-subtitle">Total</div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">Présents aujourd'hui</div>
                            <i class="fas fa-user-check" style="color: #4caf50"></i>
                        </div>
                        <div class="card-value">${stats.presentToday}</div>
                        <div class="card-subtitle">Sur ${stats.totalAgents}</div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">Shifts aujourd'hui</div>
                            <i class="fas fa-calendar-day" style="color: #ff9800"></i>
                        </div>
                        <div class="card-value">${stats.shiftsToday}</div>
                        <div class="card-subtitle">Crénaux</div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">Radios disponibles</div>
                            <i class="fas fa-walkie-talkie" style="color: #9c27b0"></i>
                        </div>
                        <div class="card-value">${stats.radiosAvailable}</div>
                        <div class="card-subtitle">Sur ${stats.totalRadios || '?'}</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Actions rapides</h3>
                    </div>
                    <div class="quick-actions">
                        <button class="btn btn-primary" onclick="app.showAddAgentModal()">
                            <i class="fas fa-user-plus"></i> Nouvel agent
                        </button>
                        <button class="btn btn-success" onclick="app.loadPage('import')">
                            <i class="fas fa-file-import"></i> Importer Excel
                        </button>
                        <button class="btn btn-secondary" onclick="app.showAddAbsenceModal()">
                            <i class="fas fa-calendar-times"></i> Ajouter absence
                        </button>
                        <button class="btn btn-info" onclick="app.loadPage('planning')">
                            <i class="fas fa-calendar-alt"></i> Voir planning
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Derniers agents ajoutés</h3>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Nom</th>
                                    <th>Prénom</th>
                                    <th>Groupe</th>
                                    <th>Date entrée</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${agentsData.slice(0, 5).map(agent => `
                                    <tr>
                                        <td><strong>${agent.code}</strong></td>
                                        <td>${agent.nom}</td>
                                        <td>${agent.prenom}</td>
                                        <td><span class="badge badge-group-${agent.code_groupe}">${agent.code_groupe}</span></td>
                                        <td>${agent.date_entree || 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
        } catch (error) {
            content.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erreur de chargement du dashboard</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    async loadPlanning() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        
        const content = document.getElementById('pageContent');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Planning - ${this.getMonthName(month)} ${year}</h3>
                    <div class="planning-controls">
                        <button class="btn btn-secondary btn-sm" onclick="app.changePlanningMonth(-1)">
                            <i class="fas fa-chevron-left"></i> Mois précédent
                        </button>
                        <select id="planningGroupFilter" class="form-control" style="width: auto;">
                            <option value="">Tous les groupes</option>
                            <option value="A">Groupe A</option>
                            <option value="B">Groupe B</option>
                            <option value="C">Groupe C</option>
                            <option value="D">Groupe D</option>
                            <option value="E">Groupe E</option>
                        </select>
                        <button class="btn btn-primary btn-sm" onclick="app.exportPlanning()">
                            <i class="fas fa-download"></i> Exporter
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="app.changePlanningMonth(1)">
                            Mois suivant <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="table-responsive">
                    <div id="planningTable">
                        <div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement du planning...</div>
                    </div>
                </div>
            </div>
        `;
        
        await this.loadPlanningTable(month, year);
        
        // Configurer le filtre
        document.getElementById('planningGroupFilter').addEventListener('change', (e) => {
            this.filterPlanningByGroup(e.target.value, month, year);
        });
    }

    async loadPlanningTable(month, year) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/planning/mensuel/${month}/${year}`);
            const data = await response.json();
            
            if (data.erreur) {
                document.getElementById('planningTable').innerHTML = `
                    <div class="error">
                        <p>${data.erreur}</p>
                    </div>
                `;
                return;
            }
            
            let html = '<table class="planning-table">';
            
            // En-têtes avec les jours
            html += '<thead><tr><th>Agent</th><th>Groupe</th>';
            data.jours.forEach(jour => {
                const jourClasse = jour.ferie ? 'ferie' : jour.jour_semaine.toLowerCase();
                html += `<th class="${jourClasse}">${jour.jour_semaine}<br>${jour.numero}</th>`;
            });
            html += '</tr></thead>';
            
            // Corps avec les shifts
            html += '<tbody>';
            data.agents.forEach(agent => {
                html += '<tr>';
                html += `<td><strong>${agent.code}</strong><br><small>${agent.nom_complet}</small></td>`;
                html += `<td><span class="badge badge-group-${agent.groupe}">${agent.groupe}</span></td>`;
                
                agent.shifts.forEach((shift, index) => {
                    const jour = data.jours[index];
                    const shiftClasse = this.getShiftClass(shift);
                    html += `<td class="${shiftClasse}">${shift}</td>`;
                });
                
                html += '</tr>';
            });
            html += '</tbody></table>';
            
            document.getElementById('planningTable').innerHTML = html;
            
        } catch (error) {
            document.getElementById('planningTable').innerHTML = `
                <div class="error">
                    <p>Erreur de chargement: ${error.message}</p>
                </div>
            `;
        }
    }

    async loadAgents() {
        const content = document.getElementById('pageContent');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Liste des agents</h3>
                    <div class="agent-controls">
                        <input type="text" id="agentSearch" class="form-control" 
                               placeholder="Rechercher un agent..." style="width: 200px;">
                        <button class="btn btn-primary" onclick="app.showAddAgentModal()">
                            <i class="fas fa-user-plus"></i> Nouvel agent
                        </button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Groupe</th>
                                <th>Date entrée</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="agentsTableBody">
                            <tr><td colspan="7" class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement des agents...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        await this.loadAgentsList();
        
        // Configurer la recherche
        document.getElementById('agentSearch').addEventListener('input', (e) => {
            this.searchAgents(e.target.value);
        });
    }

    async loadAgentsList() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/agents`);
            const data = await response.json();
            
            if (data.erreur) {
                document.getElementById('agentsTableBody').innerHTML = `
                    <tr><td colspan="7" class="error">${data.erreur}</td></tr>
                `;
                return;
            }
            
            const agents = data.agents || [];
            
            let html = '';
            agents.forEach(agent => {
                html += `
                    <tr>
                        <td><strong>${agent.code}</strong></td>
                        <td>${agent.nom}</td>
                        <td>${agent.prenom}</td>
                        <td><span class="badge badge-group-${agent.code_groupe}">${agent.code_groupe}</span></td>
                        <td>${agent.date_entree || 'N/A'}</td>
                        <td><span class="badge badge-success">${agent.statut || 'actif'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="app.viewAgent('${agent.code}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="app.editAgent('${agent.code}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            document.getElementById('agentsTableBody').innerHTML = html || `
                <tr><td colspan="7" class="empty">Aucun agent trouvé</td></tr>
            `;
            
        } catch (error) {
            document.getElementById('agentsTableBody').innerHTML = `
                <tr><td colspan="7" class="error">Erreur: ${error.message}</td></tr>
            `;
        }
    }

    async loadStatistics() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        
        const content = document.getElementById('pageContent');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Statistiques</h3>
                    <div class="stats-controls">
                        <select id="statsMonth" class="form-control" style="width: auto;">
                            ${Array.from({length: 12}, (_, i) => {
                                const monthNum = i + 1;
                                const selected = monthNum === month ? 'selected' : '';
                                return `<option value="${monthNum}" ${selected}>${this.getMonthName(monthNum)}</option>`;
                            }).join('')}
                        </select>
                        <select id="statsYear" class="form-control" style="width: auto;">
                            ${Array.from({length: 5}, (_, i) => {
                                const yearNum = year - 2 + i;
                                const selected = yearNum === year ? 'selected' : '';
                                return `<option value="${yearNum}" ${selected}>${yearNum}</option>`;
                            }).join('')}
                        </select>
                        <select id="statsType" class="form-control" style="width: auto;">
                            <option value="global">Globales</option>
                            <option value="agent">Par agent</option>
                            <option value="groupe">Par groupe</option>
                        </select>
                        <button class="btn btn-primary" onclick="app.loadStatisticsData()">
                            <i class="fas fa-chart-bar"></i> Charger
                        </button>
                    </div>
                </div>
                <div id="statisticsContent">
                    <div class="loading"><i class="fas fa-spinner fa-spin"></i> Sélectionnez les options ci-dessus</div>
                </div>
            </div>
        `;
        
        // Configurer les événements
        document.getElementById('statsMonth').addEventListener('change', () => this.loadStatisticsData());
        document.getElementById('statsYear').addEventListener('change', () => this.loadStatisticsData());
        document.getElementById('statsType').addEventListener('change', () => this.loadStatisticsData());
    }

    async loadStatisticsData() {
        const month = document.getElementById('statsMonth').value;
        const year = document.getElementById('statsYear').value;
        const type = document.getElementById('statsType').value;
        
        const content = document.getElementById('statisticsContent');
        content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement...</div>';
        
        try {
            let endpoint = '';
            switch(type) {
                case 'global':
                    endpoint = `${this.apiBaseUrl}/stats/global/${month}/${year}`;
                    break;
                case 'agent':
                    const agentCode = prompt('Code agent:');
                    if (!agentCode) return;
                    endpoint = `${this.apiBaseUrl}/stats/agent/${agentCode}/${month}/${year}`;
                    break;
                case 'groupe':
                    const groupe = prompt('Groupe (A,B,C,D,E):');
                    if (!groupe) return;
                    endpoint = `${this.apiBaseUrl}/stats/jours-travailles/groupe/${groupe}/${month}/${year}`;
                    break;
            }
            
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (data.erreur) {
                content.innerHTML = `<div class="error">${data.erreur}</div>`;
                return;
            }
            
            this.displayStatistics(data, type);
            
        } catch (error) {
            content.innerHTML = `<div class="error">Erreur: ${error.message}</div>`;
        }
    }

    displayStatistics(data, type) {
        const content = document.getElementById('statisticsContent');
        
        if (type === 'global') {
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <h4><i class="fas fa-users"></i> Agents</h4>
                        <div class="stat-value">${data.total_agents || 0}</div>
                    </div>
                    <div class="stat-card">
                        <h4><i class="fas fa-calendar-check"></i> Total jours</h4>
                        <div class="stat-value">
                            ${data.statistiques?.find(s => s.description.includes('TOTAL'))?.valeur || 0}
                        </div>
                    </div>
                    <div class="stat-card">
                        <h4><i class="fas fa-sun"></i> Shifts matin</h4>
                        <div class="stat-value">
                            ${data.statistiques?.find(s => s.description.includes('Matin'))?.valeur || 0}
                        </div>
                    </div>
                    <div class="stat-card">
                        <h4><i class="fas fa-moon"></i> Shifts nuit</h4>
                        <div class="stat-value">
                            ${data.statistiques?.find(s => s.description.includes('Nuit'))?.valeur || 0}
                        </div>
                    </div>
                </div>
                
                <div class="stats-details">
                    <h4>Détails</h4>
                    <table class="table">
                        <tbody>
                            ${(data.statistiques || []).map(stat => `
                                <tr ${stat.important ? 'class="important"' : ''}>
                                    <td>${stat.description}</td>
                                    <td><strong>${stat.valeur}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            // Afficher les données brutes pour debug
            content.innerHTML = `
                <div class="alert alert-info">
                    <h4>Données ${type}</h4>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            `;
        }
    }

    // Les autres méthodes restent similaires mais doivent être adaptées...
    // Je te montre juste la structure correcte

    showModal(title, content, footer = '') {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modalFooter').innerHTML = footer;
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        toast.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    getMonthName(month) {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return months[month - 1];
    }

    getShiftClass(shift) {
        const classes = {
            '1': 'shift-matin',
            '2': 'shift-aprem',
            '3': 'shift-nuit',
            'R': 'shift-repos',
            'C': 'shift-conge',
            'M': 'shift-maladie',
            'A': 'shift-absence',
            '-': 'shift-none'
        };
        return classes[shift] || 'shift-unknown';
    }

    // Méthode pour ajouter un agent
    showAddAgentModal() {
        this.showModal(
            'Ajouter un nouvel agent',
            `
            <div class="form-group">
                <label>Code agent *</label>
                <input type="text" id="agentCode" class="form-control" placeholder="A01" required>
            </div>
            <div class="form-group">
                <label>Nom *</label>
                <input type="text" id="agentNom" class="form-control" placeholder="Dupont" required>
            </div>
            <div class="form-group">
                <label>Prénom *</label>
                <input type="text" id="agentPrenom" class="form-control" placeholder="Jean" required>
            </div>
            <div class="form-group">
                <label>Groupe *</label>
                <select id="agentGroupe" class="form-control" required>
                    <option value="">Sélectionner...</option>
                    <option value="A">Groupe A</option>
                    <option value="B">Groupe B</option>
                    <option value="C">Groupe C</option>
                    <option value="D">Groupe D</option>
                    <option value="E">Groupe E</option>
                </select>
            </div>
            `,
            `
            <button class="btn btn-secondary" onclick="app.closeModal()">Annuler</button>
            <button class="btn btn-primary" onclick="app.saveNewAgent()">Enregistrer</button>
            `
        );
    }

    async saveNewAgent() {
        const code = document.getElementById('agentCode').value.trim();
        const nom = document.getElementById('agentNom').value.trim();
        const prenom = document.getElementById('agentPrenom').value.trim();
        const groupe = document.getElementById('agentGroupe').value;
        
        if (!code || !nom || !prenom || !groupe) {
            this.showToast('Tous les champs sont requis', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/agents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, nom, prenom, code_groupe: groupe })
            });
            
            const result = await response.json();
            
            if (response.ok && result.succes) {
                this.showToast(result.message, 'success');
                this.closeModal();
                await this.loadAgentsList(); // Recharger la liste
                if (this.currentPage === 'dashboard') {
                    await this.loadDashboard();
                }
            } else {
                this.showToast(result.erreur || 'Erreur d\'ajout', 'error');
            }
        } catch (error) {
            this.showToast('Erreur de connexion: ' + error.message, 'error');
        }
    }
}

// Initialiser l'application quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlanningPWA();
});
