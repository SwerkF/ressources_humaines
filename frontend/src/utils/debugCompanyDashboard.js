/**
 * Script de debug pour CompanyDashboard
 * À exécuter dans la console browser pour diagnostiquer les problèmes
 */

console.log("🏢 Debug CompanyDashboard - Tests API et Connexions\n");

/**
 * Test complet des fonctionnalités CompanyDashboard
 */
async function testCompanyDashboard() {
    console.log("📊 Test CompanyDashboard complet...\n");

    // Test 1: Vérifier l'authentification
    console.log("1️⃣ Test Authentification");
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log(`✅ Utilisateur connecté: ${user.email} (${user.role})`);
        if (user.role !== 'recruteur') {
            console.warn(`⚠️  Attention: Role ${user.role} au lieu de 'recruteur'`);
        }
    } catch (error) {
        console.error("❌ Erreur récupération utilisateur:", error);
        return;
    }

    // Test 2: Test API Jobs
    console.log("\n2️⃣ Test API Jobs");
    try {
        const response = await fetch('/api/jobs/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const jobs = await response.json();
        console.log(`✅ Jobs récupérés: ${jobs.length} offres`);
        console.log("📋 Premier job:", jobs[0]);
    } catch (error) {
        console.error("❌ Erreur API Jobs:", error);
    }

    // Test 3: Test API Candidatures
    console.log("\n3️⃣ Test API Candidatures");
    try {
        const response = await fetch('/api/candidatures/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const candidatures = await response.json();
        console.log(`✅ Candidatures récupérées: ${candidatures.length} candidatures`);
        
        // Analyser les statuts
        const statuts = {
            en_attente: candidatures.filter(c => c.statut === 'en_attente').length,
            acceptee: candidatures.filter(c => c.statut === 'acceptee').length,
            refusee: candidatures.filter(c => c.statut === 'refusee').length
        };
        console.log("📊 Répartition statuts:", statuts);
        
    } catch (error) {
        console.error("❌ Erreur API Candidatures:", error);
    }

    // Test 4: Test Calcul Statistiques
    console.log("\n4️⃣ Test Calcul Statistiques");
    try {
        // Simuler le calcul des stats comme dans companyService
        const jobsResponse = await fetch('/api/jobs/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });
        const jobs = await jobsResponse.json();
        
        const candidaturesResponse = await fetch('/api/candidatures/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });
        const candidatures = await candidaturesResponse.json();
        
        const stats = {
            totalJobs: jobs.length,
            activeJobs: jobs.filter(job => job.active).length,
            totalApplications: jobs.reduce((sum, job) => sum + job.nombre_candidatures, 0),
            pendingApplications: candidatures.filter(c => c.statut === 'en_attente').length,
            acceptedApplications: candidatures.filter(c => c.statut === 'acceptee').length,
            rejectedApplications: candidatures.filter(c => c.statut === 'refusee').length,
        };
        
        console.log("✅ Statistiques calculées:", stats);
        
    } catch (error) {
        console.error("❌ Erreur calcul statistiques:", error);
    }
}

/**
 * Test spécifique pour un job et ses candidatures
 */
async function testJobCandidatures(jobId) {
    if (!jobId) {
        console.error("❌ Veuillez fournir un jobId");
        return;
    }
    
    console.log(`\n🎯 Test candidatures pour job ${jobId}`);
    
    try {
        const response = await fetch(`/api/jobs/${jobId}/candidatures/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const candidatures = await response.json();
        console.log(`✅ ${candidatures.length} candidatures pour ce job`);
        
        candidatures.forEach((c, index) => {
            console.log(`📝 ${index + 1}. ${c.candidat_nom} - ${c.statut} - ${c.date_candidature}`);
        });
        
    } catch (error) {
        console.error("❌ Erreur candidatures job:", error);
    }
}

/**
 * Test création d'une offre
 */
async function testCreateJob() {
    console.log("\n➕ Test création offre");
    
    const testJob = {
        titre: "Test - Développeur Frontend",
        description: "Poste de test créé depuis le debugger",
        exigences: "React, TypeScript, Tests unitaires",
        type_contrat: "CDI",
        salaire_min: 45000,
        salaire_max: 55000,
        localisation: "Paris",
        date_expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    try {
        const response = await fetch('/api/jobs/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testJob)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        const newJob = await response.json();
        console.log("✅ Offre créée avec succès:", newJob);
        console.log("⚠️  N'oubliez pas de la supprimer après test");
        
        return newJob.id;
        
    } catch (error) {
        console.error("❌ Erreur création offre:", error);
    }
}

/**
 * Diagnostic complet des problèmes potentiels
 */
function diagnoseCompanyDashboard() {
    console.log("🔍 Diagnostic CompanyDashboard\n");
    
    // Vérifier l'état de l'authentification
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    console.log("📋 État authentification:");
    console.log(`   Token: ${authToken ? 'Présent' : '❌ Manquant'}`);
    console.log(`   User: ${user ? 'Présent' : '❌ Manquant'}`);
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log(`   Role: ${userData.role}`);
            console.log(`   Email: ${userData.email}`);
        } catch (e) {
            console.log("   ❌ User data malformé");
        }
    }
    
    // Vérifier la connectivité API
    console.log("\n🌐 Test connectivité backend:");
    fetch('/api/')
        .then(response => {
            console.log(`   API Backend: ${response.ok ? '✅ Accessible' : '❌ Erreur'} (${response.status})`);
        })
        .catch(error => {
            console.log(`   API Backend: ❌ Inaccessible (${error.message})`);
        });
    
    // Vérifier les composants requis
    console.log("\n🧩 Composants disponibles:");
    console.log(`   CompanyDashboard: ${typeof window.CompanyDashboard !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   React: ${typeof window.React !== 'undefined' ? '✅' : '❌'}`);
}

// Export des fonctions pour utilisation dans la console
if (typeof window !== 'undefined') {
    window.debugCompanyDashboard = {
        testAll: testCompanyDashboard,
        testJobCandidatures,
        testCreateJob,
        diagnose: diagnoseCompanyDashboard
    };
    
    console.log("🔧 Fonctions debug disponibles:");
    console.log("   window.debugCompanyDashboard.testAll() - Test complet");
    console.log("   window.debugCompanyDashboard.testJobCandidatures(jobId) - Test candidatures");
    console.log("   window.debugCompanyDashboard.testCreateJob() - Test création");
    console.log("   window.debugCompanyDashboard.diagnose() - Diagnostic");
    
    // Auto-diagnostic au chargement
    setTimeout(() => {
        diagnoseCompanyDashboard();
    }, 1000);
}

// Pour Node.js/tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testCompanyDashboard,
        testJobCandidatures,
        testCreateJob,
        diagnoseCompanyDashboard
    };
}
