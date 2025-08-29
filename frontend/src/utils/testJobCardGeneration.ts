/**
 * Script de test pour les nouvelles fonctionnalités de génération de données JobCard
 * Exécutable dans la console pour tester la transformation intelligente
 */

import { jobService } from "@/services/jobService";
import type { Job } from "@/types/job";

// Mock data simulant des réponses Django
const mockApiJobs = [
    {
        id: 1,
        titre: "Développeur React Senior",
        description: "Nous recherchons un développeur React expérimenté pour rejoindre notre équipe en télétravail. Maîtrise de TypeScript et Node.js souhaitée.",
        exigences: "5+ ans d'expérience en React, senior level, anglais courant, autonomie",
        recruteur_nom: "TechCorp Solutions",
        recruteur_logo: "/media/recruteurs/logos/techcorp.png",
        type_contrat: "CDI",
        salaire_min: 45000,
        salaire_max: 65000,
        localisation: "Paris",
        date_creation: "2024-01-15T10:00:00Z",
        date_expiration: "2024-03-15T18:00:00Z",
        active: true,
        nombre_candidatures: 12
    },
    {
        id: 2,
        titre: "Designer UX/UI Junior",
        description: "Poste en hybride, 3 jours au bureau et 2 jours à distance. Travail sur Figma et Adobe Creative Suite.",
        exigences: "Débutant accepté, formation en design, portfolio requis, 0-2 ans d'expérience",
        recruteur_nom: "Creative Agency",
        recruteur_logo: null, // Pas de logo - test du fallback
        type_contrat: "CDD",
        salaire_min: 28000,
        salaire_max: 35000,
        localisation: "Lyon",
        date_creation: "2024-01-10T14:30:00Z",
        date_expiration: "2024-02-28T18:00:00Z",
        active: true,
        nombre_candidatures: 8
    },
    {
        id: 3,
        titre: "Data Scientist Python",
        description: "Travail en présentiel uniquement, équipe data science, projets machine learning avec AWS et Docker.",
        exigences: "Expérience intermédiaire 3-4 ans, Python, SQL, Machine Learning, statistiques",
        recruteur_nom: "DataTech",
        recruteur_logo: "media/recruteurs/logos/datatech.jpg", // Logo avec chemin relatif
        type_contrat: "CDI",
        salaire_min: 50000,
        salaire_max: 70000,
        localisation: "Toulouse",
        date_creation: "2024-01-12T09:15:00Z",
        date_expiration: "2024-04-12T18:00:00Z",
        active: true,
        nombre_candidatures: 15
    }
];

/**
 * Teste la transformation des données mock
 */
export function testJobTransformation() {
    console.log("🧪 Test des transformations JobCard...\n");
    
    mockApiJobs.forEach((apiJob, index) => {
        console.log(`=== Job ${index + 1}: ${apiJob.titre} ===`);
        
        try {
            // Simuler la transformation (accéder à la méthode privée via reflection)
            const service = jobService as any;
            const transformedJob: Job = service.transformJob(apiJob);
            
            console.log("📊 Données originales Django:");
            console.log(`   Titre: ${apiJob.titre}`);
            console.log(`   Description: ${apiJob.description.substring(0, 50)}...`);
            console.log(`   Exigences: ${apiJob.exigences.substring(0, 50)}...`);
            
            console.log("\n🤖 Données générées intelligemment:");
            console.log(`   🖼️  Logo: ${transformedJob.image}`);
            console.log(`   💼 Travail: ${transformedJob.work}`);
            console.log(`   📈 Expérience: ${transformedJob.experience}`);
            console.log(`   🏷️  Keywords: [${transformedJob.keywords.join(', ')}]`);
            console.log(`   💰 Salaire: ${transformedJob.salary}`);
            
            console.log("\n✅ Vérifications sécurité:");
            console.log(`   Keywords array: ${Array.isArray(transformedJob.keywords) ? '✅' : '❌'}`);
            console.log(`   Keywords length: ${transformedJob.keywords.length}`);
            console.log(`   Image présente: ${transformedJob.image ? '✅' : '❌'}`);
            console.log(`   Experience définie: ${transformedJob.experience ? '✅' : '❌'}`);
            
            console.log("\n" + "=".repeat(60) + "\n");
            
        } catch (error) {
            console.error(`❌ Erreur lors de la transformation du job ${index + 1}:`, error);
        }
    });
}

/**
 * Teste les générateurs individuels
 */
export function testGenerators() {
    console.log("🔧 Test des générateurs individuels...\n");
    
    const service = jobService as any; // Cast pour accéder aux méthodes privées
    
    console.log("=== Test generateCompanyLogo ===");
    const companies = ["TechCorp", "Google", "Ma Super Entreprise", "123 & Co"];
    companies.forEach(company => {
        const logo = service.generateCompanyLogo(company);
        console.log(`${company} → ${logo}`);
    });
    
    console.log("\n=== Test inferWorkType ===");
    const descriptions = [
        "Travail en remote complet",
        "Télétravail possible 3 jours par semaine",
        "Poste hybride flexible",
        "Travail en présentiel uniquement",
        "Bureau moderne avec possibilité de flex office"
    ];
    descriptions.forEach(desc => {
        const workType = service.inferWorkType(desc);
        console.log(`"${desc}" → ${workType}`);
    });
    
    console.log("\n=== Test inferExperience ===");
    const requirements = [
        "Junior accepté, débutant bienvenu",
        "5+ ans d'expérience, senior level requis",
        "3 à 4 ans d'expérience souhaitée",
        "Expert confirmé, 7 ans minimum",
        "Tout niveau accepté"
    ];
    requirements.forEach(req => {
        const experience = service.inferExperience(req);
        console.log(`"${req}" → ${experience}`);
    });
    
    console.log("\n=== Test extractKeywords ===");
    const jobData = [
        {
            titre: "Développeur Full Stack React Node.js",
            desc: "Développement d'applications web avec TypeScript et MongoDB",
            exig: "Maîtrise de JavaScript, React, API REST, Docker souhaité"
        },
        {
            titre: "Designer UX/UI Figma",
            desc: "Conception d'interfaces utilisateur avec Photoshop et Illustrator",
            exig: "Portfolio design, expérience Figma, créativité"
        }
    ];
    
    jobData.forEach((job, i) => {
        const keywords = service.extractKeywords(job.titre, job.desc, job.exig);
        console.log(`Job ${i+1}: [${keywords.join(', ')}]`);
    });
}

/**
 * Lance tous les tests
 */
export function runAllJobCardTests() {
    console.log("🚀 Lancement tests JobCard complets...\n");
    
    testJobTransformation();
    testGenerators();
    
    console.log("🎉 Tests terminés ! JobCard devrait maintenant fonctionner sans erreurs.");
}

// Exporter pour la console
if (typeof window !== 'undefined') {
    (window as any).testJobCard = {
        testJobTransformation,
        testGenerators,
        runAllJobCardTests
    };
    
    console.log("🔧 Tests JobCard disponibles:");
    console.log("   window.testJobCard.runAllJobCardTests()    - Tests complets");
    console.log("   window.testJobCard.testJobTransformation() - Test transformation");
    console.log("   window.testJobCard.testGenerators()        - Test générateurs");
}
