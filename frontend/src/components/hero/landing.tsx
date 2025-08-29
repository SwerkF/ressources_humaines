import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { SparklesText } from "../magicui/sparkles-text";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="relative min-h-[50dvh] h-screen w-full flex flex-col items-center justify-center">
            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.1}
                duration={3}
                repeatDelay={1}
                className={cn(
                    "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                    "inset-x-0 inset-y-[-30%] h-[150%] skew-y-12",
                )}
            />
            <div className="flex flex-col items-center justify-center z-[10] gap-4">
                <SparklesText className="text-8xl">TRAVERSE LA RUE</SparklesText>
                <p className="text-lg">Trouvez votre emploi idéal, en face de chez vous.</p>
                <div className="flex flex-row items-center justify-center gap-4">
                    <Button variant="outline">
                        <Link to="/offres">Voir les offres</Link>
                    </Button>
                    <Button>
                        <Link to="/offres">Voir les offres</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
