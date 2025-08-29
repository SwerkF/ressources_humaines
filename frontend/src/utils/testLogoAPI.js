/**
 * Script de test pour vérifier que les logos des entreprises sont bien inclus dans l'API des jobs
 * À exécuter dans la console browser après avoir ouvert la page /jobs
 */

console.log("🧪 Test de l'API Logos dans les Jobs...\n");

async function testLogoAPI() {
    try {
        console.log("📡 Test 1: Récupération des jobs via l'API...");
        
        // Simuler un appel API comme dans jobService
        const response = await fetch('http://localhost:8000/api/jobs/publiques/');
        const data = await response.json();
        
        console.log("✅ Réponse API reçue:", {
            status: response.status,
            count: Array.isArray(data) ? data.length : data.count || 'unknown',
            structure: Array.isArray(data) ? 'Array' : 'Paginated Object'
        });
        
        // Extraire les jobs selon le format de réponse
        const jobs = Array.isArray(data) ? data : data.results || [];
        
        if (jobs.length === 0) {
            console.warn("⚠️ Aucun job trouvé dans l'API");
            return;
        }
        
        console.log("\n🔍 Test 2: Analyse des champs des jobs...");
        
        jobs.slice(0, 3).forEach((job, index) => {
            console.log(`--- Job ${index + 1}: ${job.titre} ---`);
            console.log(`  📋 ID: ${job.id}`);
            console.log(`  🏢 Entreprise: ${job.recruteur_nom}`);
            console.log(`  🖼️  Logo: ${job.recruteur_logo || 'null/undefined'}`);
            console.log(`  📍 Champs présents: [${Object.keys(job).join(', ')}]`);
            
            // Tester la construction d'URL logo
            const logoUrl = getLogoUrl(job.recruteur_logo, job.recruteur_nom);
            console.log(`  🔗 URL Logo finale: ${logoUrl}`);
            
            console.log("");
        });
        
        console.log("\n🎯 Test 3: Statistiques des logos...");
        
        const stats = {
            total: jobs.length,
            withLogo: jobs.filter(job => job.recruteur_logo).length,
            withoutLogo: jobs.filter(job => !job.recruteur_logo).length,
            logoTypes: {}
        };
        
        jobs.forEach(job => {
            if (job.recruteur_logo) {
                const type = job.recruteur_logo.startsWith('http') ? 'URL complète' :
                           job.recruteur_logo.startsWith('/media/') ? 'Chemin absolu' :
                           job.recruteur_logo.includes('media/') ? 'Chemin relatif' : 'Autre';
                stats.logoTypes[type] = (stats.logoTypes[type] || 0) + 1;
            }
        });
        
        console.log("📊 Statistiques:");
        console.log(`  Total jobs: ${stats.total}`);
        console.log(`  Avec logo: ${stats.withLogo} (${Math.round(stats.withLogo/stats.total*100)}%)`);
        console.log(`  Sans logo: ${stats.withoutLogo} (${Math.round(stats.withoutLogo/stats.total*100)}%)`);
        console.log("  Types de logos:", stats.logoTypes);
        
        console.log("\n🎉 Test terminé ! Vérifiez les JobCards dans l'UI pour voir les logos.");
        
    } catch (error) {
        console.error("❌ Erreur lors du test de l'API Logo:", error);
    }
}

/**
 * Reproduit la logique de getCompanyLogo du jobService
 */
function getLogoUrl(recruteurLogo, companyName) {
    if (recruteurLogo) {
        if (recruteurLogo.startsWith('http')) {
            return recruteurLogo;
        }
        
        const baseUrl = 'http://localhost:8000';
        
        if (recruteurLogo.startsWith('/media/')) {
            return `${baseUrl}${recruteurLogo}`;
        }
        
        if (recruteurLogo.includes('media/')) {
            return `${baseUrl}/${recruteurLogo}`;
        }
        
        return `${baseUrl}/media/${recruteurLogo}`;
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=128&background=random`;
}

/**
 * Test de validation d'une URL d'image
 */
async function testImageUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return {
            url,
            status: response.status,
            accessible: response.ok,
            contentType: response.headers.get('content-type')
        };
    } catch (error) {
        return {
            url,
            status: 'error',
            accessible: false,
            error: error.message
        };
    }
}

// Exporter pour utilisation dans la console
if (typeof window !== 'undefined') {
    window.testLogoAPI = testLogoAPI;
    window.testImageUrl = testImageUrl;
    
    console.log("🔧 Tests Logo API disponibles:");
    console.log("   window.testLogoAPI()           - Test complet de l'API logos");
    console.log("   window.testImageUrl(url)       - Test d'accessibilité d'une image");
}

// Lancer automatiquement le test
testLogoAPI();
