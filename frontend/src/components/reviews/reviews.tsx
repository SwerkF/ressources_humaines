/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  {
    name: "Marie Dubois",
    username: "@marie_d",
    body: "Grâce à TLR, j'ai trouvé mon emploi de rêve en 2 semaines ! Interface intuitive et offres de qualité.",
    img: "https://avatar.vercel.sh/marie",
  },
  {
    name: "Pierre Martin",
    username: "@pierre_m",
    body: "Plateforme révolutionnaire ! Le processus de candidature est simplifié et les recruteurs sont très réactifs.",
    img: "https://avatar.vercel.sh/pierre",
  },
  {
    name: "Sophie Léger",
    username: "@sophie_l",
    body: "Enfin une solution qui met en relation efficacement candidats et entreprises. Très satisfaite de mon expérience !",
    img: "https://avatar.vercel.sh/sophie",
  },
  {
    name: "Thomas Rousseau",
    username: "@thomas_r",
    body: "Interface moderne et fluide. J'ai pu postuler à plusieurs offres rapidement. Excellent service !",
    img: "https://avatar.vercel.sh/thomas",
  },
  {
    name: "Emma Lefebvre",
    username: "@emma_l",
    body: "TLR m'a permis de décrocher un entretien dès ma première candidature. Je recommande vivement !",
    img: "https://avatar.vercel.sh/emma",
  },
  {
    name: "Lucas Bernard",
    username: "@lucas_b",
    body: "Outil indispensable pour la recherche d'emploi. Design soigné et fonctionnalités très pratiques.",
    img: "https://avatar.vercel.sh/lucas",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);
const thirdRow = reviews.slice(0, reviews.length / 2);
const fourthRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-fit sm:w-72 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function Marquee3D() {
  return (
    <div className="relative flex h-96 w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px]">
      <div
        className="flex flex-row items-center gap-4"
        style={{
          transform:
            "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
        }}
      >
        <Marquee pauseOnHover vertical className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:10s]" vertical>
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
          {thirdRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee pauseOnHover className="[--duration:20s]" vertical>
          {fourthRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}
