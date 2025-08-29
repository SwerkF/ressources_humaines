/**
 * Script de debug à exécuter dans la console du navigateur
 * pour tester la correction du bug de pagination des jobs
 */

// Test direct de l'API
async function testJobsAPIResponse() {
    console.log("🔍 Test direct de l'API jobs...");
    
    try {
        const response = await fetch('http://localhost:8000/api/jobs/publiques/?page=1&page_size=5');
        const data = await response.json();
        
        console.log("📡 Réponse API:", data);
        
        if (Array.isArray(data)) {
            console.log("✅ Format: Array direct");
            console.log(`📊 ${data.length} offres trouvées`);
            console.log("⚠️  Pagination côté client sera utilisée");
        } else if (data.results && Array.isArray(data.results)) {
            console.log("✅ Format: DRF Paginated Response");
            console.log(`📊 ${data.results.length} offres sur ${data.count} total`);
            console.log("🚀 Pagination server-side active");
        } else {
            console.log("❌ Format de réponse inattendu:", data);
        }
        
        return data;
        
    } catch (error) {
        console.error("❌ Erreur lors du test API:", error);
        return null;
    }
}

// Test du service jobService
async function testJobService() {
    console.log("🔍 Test du jobService...");
    
    try {
        // Import dynamique du service
        const { jobService } = await import('/src/services/jobService.ts');
        
        const result = await jobService.searchJobs({
            page: 1,
            limit: 5,
            filters: {
                search: "",
                contract: "all",
                work: "all",
                salaryMin: 0,
                salaryMax: 100000,
                dateRange: "all"
            }
        });
        
        console.log("✅ jobService.searchJobs() fonctionne:", result);
        console.log(`📊 ${result.total} offres, ${result.totalPages} pages`);
        
        if (result.jobs.length > 0) {
            console.log("📄 Première offre:", result.jobs[0]);
        }
        
        return result;
        
    } catch (error) {
        console.error("❌ Erreur dans jobService:", error);
        return null;
    }
}

// Test complet
async function debugJobsIntegration() {
    console.log("🚀 Démarrage du debug complet...\n");
    
    // 1. Test API direct
    console.log("=== 1. Test API Direct ===");
    const apiResponse = await testJobsAPIResponse();
    
    // 2. Test du service
    console.log("\n=== 2. Test jobService ===");
    const serviceResponse = await testJobService();
    
    // 3. Vérifications
    console.log("\n=== 3. Vérifications ===");
    
    if (apiResponse && serviceResponse) {
        console.log("✅ L'intégration fonctionne correctement");
        
        if (Array.isArray(apiResponse)) {
            console.log("ℹ️  API retourne un array → Pagination côté client active");
        } else {
            console.log("🚀 API utilise la pagination DRF → Performance optimale");
        }
    } else {
        console.log("❌ Des problèmes persistent, vérifiez :");
        console.log("   - Le serveur Django est-il démarré ?");
        console.log("   - Y a-t-il des offres dans la base de données ?");
        console.log("   - Les CORS sont-ils configurés ?");
    }
    
    console.log("\n🏁 Debug terminé.");
}

// Exporter les fonctions pour usage dans la console
window.debugJobsAPI = {
    testJobsAPIResponse,
    testJobService, 
    debugJobsIntegration
};

console.log("🔧 Debug Jobs API disponible :");
console.log("   window.debugJobsAPI.debugJobsIntegration()  - Test complet");
console.log("   window.debugJobsAPI.testJobsAPIResponse()   - Test API seul");
console.log("   window.debugJobsAPI.testJobService()        - Test service seul");
