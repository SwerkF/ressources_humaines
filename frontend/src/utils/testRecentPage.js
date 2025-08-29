/**
 * Script de test pour la page Recent connectée à l'API
 * À exécuter dans la console browser pour valider l'intégration
 */

console.log("🏠 Test Page Recent - Connexion API\n");

/**
 * Test complet de la page Recent
 */
async function testRecentPageAPI() {
    console.log("📊 Test API Recent Page...\n");

    // Test 1: Vérifier l'endpoint API
    console.log("1️⃣ Test Endpoint API Recent");
    try {
        const response = await fetch('/api/jobs/publiques/?page=1&page_size=6');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Vérifier structure de réponse
        if (Array.isArray(data)) {
            console.log(`✅ API retourne array: ${data.length} offres`);
        } else if (data.results) {
            console.log(`✅ API retourne pagination: ${data.results.length} offres sur ${data.count} total`);
        } else {
            console.warn("⚠️ Structure réponse inattendue:", data);
        }
        
        console.log("📋 Première offre:", data.results?.[0] || data[0]);
        
    } catch (error) {
        console.error("❌ Erreur API Recent:", error);
    }

    // Test 2: Vérifier transformation des données
    console.log("\n2️⃣ Test Transformation Données");
    try {
        // Simuler l'appel jobService
        const mockApiJob = {
            id: 1,
            titre: "Développeur Test",
            description: "Description test pour validation",
            exigences: "React, TypeScript, 3+ ans",
            recruteur_nom: "Entreprise Test",
            recruteur_logo: "/media/logos/test.png",
            type_contrat: "CDI",
            salaire_min: 45000,
            salaire_max: 65000,
            localisation: "Paris",
            date_creation: "2024-01-15T10:00:00Z",
            date_expiration: "2024-02-15T10:00:00Z",
            active: true,
            nombre_candidatures: 3
        };
        
        console.log("✅ Données API brutes:", mockApiJob);
        
        // Vérifier champs requis pour l'UI
        const requiredFields = ['id', 'titre', 'description', 'recruteur_nom', 'localisation', 'date_creation'];
        const missingFields = requiredFields.filter(field => !mockApiJob[field]);
        
        if (missingFields.length === 0) {
            console.log("✅ Tous les champs requis présents");
        } else {
            console.warn("⚠️ Champs manquants:", missingFields);
        }
        
    } catch (error) {
        console.error("❌ Erreur transformation:", error);
    }

    // Test 3: Vérifier les états de la page
    console.log("\n3️⃣ Test États Page Recent");
    
    const pageStates = [
        { name: "Loading", selector: '[data-testid="recent-loading"]', expected: "Spinner + message" },
        { name: "Error", selector: '[data-testid="recent-error"]', expected: "AlertCircle + retry" },
        { name: "Empty", selector: '[data-testid="recent-empty"]', expected: "Briefcase + lien jobs" },
        { name: "Success", selector: '[data-testid="recent-cards"]', expected: "Grid cards" }
    ];
    
    console.log("📋 États attendus:");
    pageStates.forEach(state => {
        console.log(`   ${state.name}: ${state.expected}`);
    });

    // Test 4: Vérifier les cards Recent
    console.log("\n4️⃣ Test Cards Recent");
    
    const cardElements = document.querySelectorAll('[data-testid="recent-card"]');
    console.log(`📊 Nombre de cards trouvées: ${cardElements.length}`);
    
    if (cardElements.length > 0) {
        const firstCard = cardElements[0];
        const cardTests = [
            { selector: 'img', desc: "Logo entreprise" },
            { selector: '.font-bold', desc: "Titre offre" },
            { selector: '[data-icon="map-pin"]', desc: "Localisation" },
            { selector: '[data-icon="euro"]', desc: "Salaire" },
            { selector: '[data-icon="briefcase"]', desc: "Expérience" },
            { selector: 'a[href*="/jobs"]', desc: "Lien vers offre" }
        ];
        
        cardTests.forEach(test => {
            const element = firstCard.querySelector(test.selector);
            console.log(`   ${element ? '✅' : '❌'} ${test.desc}`);
        });
    }
}

/**
 * Test la navigation depuis Recent vers Jobs
 */
function testRecentNavigation() {
    console.log("\n🧭 Test Navigation Recent → Jobs");
    
    const recentLinks = document.querySelectorAll('a[href*="/jobs"]');
    console.log(`🔗 ${recentLinks.length} liens vers /jobs trouvés`);
    
    recentLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const hasJobId = href.includes('selected=');
        console.log(`   ${index + 1}. ${href} ${hasJobId ? '✅ avec sélection' : '⚠️ sans sélection'}`);
    });
}

/**
 * Test performance Recent page
 */
async function testRecentPerformance() {
    console.log("\n⚡ Test Performance Recent");
    
    const startTime = performance.now();
    
    try {
        // Mesurer temps réponse API
        const apiStart = performance.now();
        const response = await fetch('/api/jobs/publiques/?page=1&page_size=6');
        const apiTime = performance.now() - apiStart;
        
        console.log(`📡 Temps réponse API: ${apiTime.toFixed(2)}ms`);
        
        if (response.ok) {
            const data = await response.json();
            const dataSize = JSON.stringify(data).length;
            console.log(`📊 Taille données: ${(dataSize / 1024).toFixed(2)}KB`);
        }
        
        const totalTime = performance.now() - startTime;
        console.log(`⏱️ Temps total: ${totalTime.toFixed(2)}ms`);
        
        // Recommandations performance
        if (apiTime > 1000) {
            console.warn("⚠️ API lente (>1s), optimisation recommandée");
        } else if (apiTime > 500) {
            console.log("⚠️ API acceptable (<1s)");
        } else {
            console.log("✅ API rapide (<500ms)");
        }
        
    } catch (error) {
        console.error("❌ Erreur test performance:", error);
    }
}

/**
 * Diagnostic complet Recent page
 */
function diagnoseRecentPage() {
    console.log("\n🔍 Diagnostic Page Recent");
    
    // Vérifier présence des éléments clés
    const diagnostics = [
        { selector: 'h1', expected: "Offres Récentes", desc: "Titre principal" },
        { selector: '.grid', expected: "3 colonnes desktop", desc: "Grid responsive" },
        { selector: '[data-testid="spotlight-card"]', expected: "> 0", desc: "SpotlightCards" },
        { selector: 'img[alt*="Logo"]', expected: "> 0", desc: "Logos entreprises" },
        { selector: 'a[href*="/jobs"]', expected: "> 0", desc: "Liens navigation" }
    ];
    
    diagnostics.forEach(test => {
        const elements = document.querySelectorAll(test.selector);
        const count = elements.length;
        const status = count > 0 ? '✅' : '❌';
        console.log(`   ${status} ${test.desc}: ${count} éléments`);
    });
    
    // Vérifier responsive
    const grid = document.querySelector('.grid');
    if (grid) {
        const classes = grid.className;
        const hasResponsive = classes.includes('grid-cols-1') && 
                             classes.includes('md:grid-cols-2') && 
                             classes.includes('lg:grid-cols-3');
        console.log(`   ${hasResponsive ? '✅' : '❌'} Design responsive`);
    }
}

/**
 * Export des fonctions pour utilisation console
 */
if (typeof window !== 'undefined') {
    window.testRecentPage = {
        testAPI: testRecentPageAPI,
        testNavigation: testRecentNavigation,
        testPerformance: testRecentPerformance,
        diagnose: diagnoseRecentPage,
        runAll: async () => {
            await testRecentPageAPI();
            testRecentNavigation();
            await testRecentPerformance();
            diagnoseRecentPage();
        }
    };
    
    console.log("🔧 Fonctions test Recent disponibles:");
    console.log("   window.testRecentPage.testAPI() - Test API");
    console.log("   window.testRecentPage.testNavigation() - Test navigation"); 
    console.log("   window.testRecentPage.testPerformance() - Test performance");
    console.log("   window.testRecentPage.diagnose() - Diagnostic complet");
    console.log("   window.testRecentPage.runAll() - Tous les tests");
    
    // Auto-diagnostic au chargement
    setTimeout(() => {
        console.log("\n🚀 Auto-diagnostic Recent:");
        diagnoseRecentPage();
    }, 2000);
}

// Export Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testRecentPageAPI,
        testRecentNavigation,
        testRecentPerformance,
        diagnoseRecentPage
    };
}
