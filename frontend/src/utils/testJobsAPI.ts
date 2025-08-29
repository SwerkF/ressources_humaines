/**
 * Script utilitaire pour tester la connexion à l'API Jobs
 * Peut être exécuté dans la console du navigateur pour débugger
 */

import { jobService } from "@/services/jobService";
import type { JobFilters } from "@/types/job";

/**
 * Teste la recherche de jobs basique
 */
export async function testJobsSearch() {
    console.log("🔍 Test de recherche de jobs...");
    
    try {
        const filters: JobFilters = {
            search: "",
            contract: "all",
            work: "all",
            salaryMin: 0,
            salaryMax: 100000,
            dateRange: "all",
        };

        const result = await jobService.searchJobs({
            page: 1,
            limit: 5,
            filters,
        });

        console.log("✅ Recherche réussie:", result);
        console.log(`📊 ${result.total} offres trouvées sur ${result.totalPages} pages`);
        
        if (result.jobs.length > 0) {
            console.log("📄 Première offre:", result.jobs[0]);
        }

        return result;
    } catch (error) {
        console.error("❌ Erreur lors de la recherche:", error);
        throw error;
    }
}

/**
 * Teste la récupération d'un job par ID
 */
export async function testJobById(id: number) {
    console.log(`🔍 Test de récupération du job ID ${id}...`);
    
    try {
        const job = await jobService.getJobById(id);
        
        if (job) {
            console.log("✅ Job trouvé:", job);
        } else {
            console.log("⚠️ Aucun job trouvé avec cet ID");
        }

        return job;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération:", error);
        throw error;
    }
}

/**
 * Teste les différents filtres
 */
export async function testJobsFilters() {
    console.log("🔍 Test des filtres...");
    
    const testCases = [
        {
            name: "Recherche textuelle",
            filters: { search: "développeur", contract: "all" as const, work: "all" as const, salaryMin: 0, salaryMax: 100000, dateRange: "all" as const }
        },
        {
            name: "Filtrage par contrat CDI",
            filters: { search: "", contract: "CDI" as const, work: "all" as const, salaryMin: 0, salaryMax: 100000, dateRange: "all" as const }
        },
        {
            name: "Filtrage par salaire minimum",
            filters: { search: "", contract: "all" as const, work: "all" as const, salaryMin: 30000, salaryMax: 100000, dateRange: "all" as const }
        }
    ];

    for (const testCase of testCases) {
        try {
            console.log(`\n🧪 Test: ${testCase.name}`);
            const result = await jobService.searchJobs({
                page: 1,
                limit: 3,
                filters: testCase.filters
            });
            console.log(`✅ ${result.total} résultats trouvés`);
        } catch (error) {
            console.error(`❌ Erreur pour ${testCase.name}:`, error);
        }
    }
}

/**
 * Lance tous les tests
 */
export async function runAllJobsTests() {
    console.log("🚀 Lancement de tous les tests API Jobs...\n");
    
    try {
        // Test de recherche basique
        await testJobsSearch();
        
        // Test des filtres
        await testJobsFilters();
        
        // Test de récupération par ID (avec le premier job trouvé)
        const searchResult = await jobService.searchJobs({
            page: 1,
            limit: 1,
            filters: {
                search: "",
                contract: "all",
                work: "all", 
                salaryMin: 0,
                salaryMax: 100000,
                dateRange: "all"
            }
        });
        
        if (searchResult.jobs.length > 0) {
            await testJobById(searchResult.jobs[0].id);
        }
        
        console.log("\n🎉 Tous les tests terminés avec succès !");
        
    } catch (error) {
        console.error("\n💥 Échec des tests:", error);
    }
}

// Exporter pour utilisation dans la console du navigateur
if (typeof window !== 'undefined') {
    (window as any).testJobsAPI = {
        testJobsSearch,
        testJobById,
        testJobsFilters,
        runAllJobsTests
    };
    
    console.log("🔧 Tests API Jobs disponibles dans window.testJobsAPI");
    console.log("   - testJobsSearch()");
    console.log("   - testJobById(id)");
    console.log("   - testJobsFilters()");
    console.log("   - runAllJobsTests()");
}
