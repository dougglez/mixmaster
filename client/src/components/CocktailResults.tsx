import React from "react";
import CocktailCard from "./CocktailCard";
import { Button } from "@/components/ui/button";
import { Cocktail } from "@shared/schema";

interface CocktailResultsProps {
  cocktails: Cocktail[];
  onStartOver: () => void;
}

export default function CocktailResults({ cocktails, onStartOver }: CocktailResultsProps) {
  const [expandedCard, setExpandedCard] = React.useState<number | null>(0);

  // Toggle expanded state for a card
  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <section className="mb-6 sm:mb-10">
      {/* Header with count badge */}
      <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-8 gap-3">
        <h3 className="gradient-heading text-xl sm:text-3xl font-bold">
          Your Perfect Cocktail Matches
        </h3>
        <div className="bg-primary/10 text-primary font-semibold px-4 py-1 rounded-full text-sm">
          {cocktails.length} {cocktails.length === 1 ? 'Recipe' : 'Recipes'}
        </div>
      </div>
      
      {/* Results introduction - more compact on mobile */}
      <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 border border-neutral-100 dark:border-neutral-700">
        <div className="flex items-start">
          <div className="bg-primary/10 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
            <i className="ri-magic-line text-lg sm:text-xl text-primary"></i>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-0.5 sm:mb-1">Personalized for You</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Our AI mixologist has crafted these cocktails based on your preferences. 
              Each recipe has been tailored to match your taste profile.
            </p>
          </div>
        </div>
      </div>
      
      {/* Mobile horizontal scroll on small screens, grid on medium and up */}
      <div className="mb-8">
        {/* Mobile carousel view */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 flex space-x-4 snap-x snap-mandatory scrollbar-hide">
          {cocktails.map((cocktail, index) => (
            <div 
              key={index} 
              className="snap-start shrink-0 w-[90%] max-w-[320px]"
              onClick={() => toggleCard(index)}
            >
              <CocktailCard 
                cocktail={cocktail} 
                isCompact={true} 
                isExpanded={expandedCard === index}
              />
            </div>
          ))}
        </div>
        
        {/* Desktop grid view */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          {cocktails.map((cocktail, index) => (
            <div key={index} className="transform transition-all duration-300 hover:-translate-y-1">
              <CocktailCard cocktail={cocktail} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom actions with gradient separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-neutral-50 dark:bg-neutral-900 px-4 text-sm text-neutral-500 dark:text-neutral-400">Want to try something else?</span>
        </div>
      </div>
      
      <div className="mt-6 sm:mt-8 text-center">
        <Button
          onClick={onStartOver}
          variant="outline"
          className="button-outline px-6 sm:px-8 py-2 sm:py-3"
        >
          <div className="flex items-center justify-center">
            <i className="ri-restart-line mr-2"></i>
            Start Over
          </div>
        </Button>
      </div>
    </section>
  );
}
