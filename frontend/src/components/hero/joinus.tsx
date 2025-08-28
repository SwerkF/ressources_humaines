import { Button } from "../ui/button";
import SpotlightCard from "../spotlightcard/spotlightcard";
import { Link } from "react-router-dom";

export default function JoinUs() {

    const randomColor = (): `rgba(${number}, ${number}, ${number}, ${number})` => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }

    return (
        <div className="relative rounded-3xl min-h-[50dvh] mt-20 h-screen w-full flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SpotlightCard className="custom-spotlight-card w-full" spotlightColor={randomColor()}>
                <div className="flex flex-col items-center justify-center h-72 w-full">
                    <h2 className="text-3xl font-bold uppercase text-black dark:text-white">Rejoignez-nous</h2>
                    <p className="text-black text-sm w-[70%] text-center dark:text-white mb-4">
                        Rejoignez notre plateforme et trouvez facilement des personnes compétentes et motivées pour faire avancer votre entreprise. 
                    </p>
                    <Button>
                        <Link to="/register">
                            Rejoindre l'équipe
                        </Link>
                    </Button>
               </div>
            </SpotlightCard>
        </div>
    )
}