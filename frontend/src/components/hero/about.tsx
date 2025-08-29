import { Marquee3D } from "../reviews/reviews";

export default function About() {
    return (
        <div className="relative max-h-[50dvh] py-10 h-screen w-full flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-5 gap-4">
                <div className="flex flex-col justify-center col-span-2 gap-4">
                    <h2 className="text-4xl font-bold uppercase">Qui sommes-nous ?</h2>
                    <p className="text-sm">
                        Traverse la rue est une plateforme de recherche d'emploi qui permet aux
                        entreprises de recruter des travailleurs qualifiés et motivés. Nous sommes
                        une équipe de passionnés qui cherchent à simplifier la recherche d'emploi
                        pour les entreprises et les travailleurs. Il nous semble important de
                        permettre aux entreprises de trouver les meilleurs travailleurs pour leur
                        entreprise et aux travailleurs de trouver le meilleur emploi pour eux.
                    </p>
                    <p className="text-sm">
                        Regardez les avis de nos utilisateurs pour voir ce qu'ils en pensent !
                    </p>
                </div>
                <div className="flex flex-row items-center justify-center col-span-3">
                    <Marquee3D />
                </div>
            </div>
        </div>
    );
}
