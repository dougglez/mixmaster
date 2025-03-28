import React from "react";
import { Cocktail } from "@shared/schema";

interface CocktailCardProps {
  cocktail: Cocktail;
  isCompact?: boolean;
  isExpanded?: boolean;
}

export default function CocktailCard({ cocktail, isCompact = false, isExpanded = false }: CocktailCardProps) {
  return (
    <article className={`cocktail-card group relative bg-white dark:bg-neutral-800 rounded-xl shadow-md ${isCompact ? 'cursor-pointer' : ''}`}>
      {/* Image container with gradient overlay */}
      <div className={`relative overflow-hidden ${isCompact ? 'aspect-[3/2]' : 'aspect-[4/3]'} rounded-t-xl`}>
        {/* Main image with hover effect */}
        <img
          src={cocktail.image_url}
          alt={`${cocktail.name} cocktail`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Gradient overlay at the bottom of the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
        
        {/* Popular badge */}
        {cocktail.is_popular && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-gradient-to-r from-primary to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
              Popular
            </span>
          </div>
        )}
        
        {/* Cocktail name overlay on the image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 z-10">
          <h4 className="text-white text-xl sm:text-2xl font-bold drop-shadow-md">
            {cocktail.name}
          </h4>
        </div>
      </div>
      
      {/* Content section */}
      <div className={`p-4 sm:p-7 ${isCompact && !isExpanded ? 'max-h-32 overflow-hidden' : ''}`}>
        {/* Characteristics tags - show fewer on compact mode */}
        <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-6">
          {cocktail.characteristics.slice(0, isCompact && !isExpanded ? 3 : undefined).map((char, index) => (
            <span
              key={index}
              className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-600 hover:bg-primary/10 hover:border-primary/30 transition-colors duration-200"
            >
              {char}
            </span>
          ))}
          {isCompact && !isExpanded && cocktail.characteristics.length > 3 && (
            <span className="text-xs text-neutral-500">+{cocktail.characteristics.length - 3} more</span>
          )}
        </div>
        
        {/* Compact mode: condensed info with expandable details */}
        {isCompact ? (
          <div>
            {isExpanded ? (
              <>
                {/* Expanded content for mobile */}
                <div className="mb-4">
                  <h5 className="text-primary dark:text-primary-400 font-semibold mb-2 flex items-center text-sm">
                    <i className="ri-flask-line mr-2"></i> Ingredients
                  </h5>
                  <ul className="text-neutral-600 dark:text-neutral-400 text-xs space-y-1.5">
                    {cocktail.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start">
                        <span className="h-4 w-4 mt-0.5 rounded-full bg-primary/10 flex items-center justify-center mr-1.5 shrink-0">
                          <i className="ri-check-line text-primary text-[10px]"></i>
                        </span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-primary dark:text-primary-400 font-semibold mb-2 flex items-center text-sm">
                    <i className="ri-file-list-3-line mr-2"></i> Instructions
                  </h5>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                    {cocktail.instructions}
                  </p>
                </div>
                
                {/* Footer */}
                <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-700 flex justify-between items-center">
                  <div className="flex items-center text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    <span className="bg-primary/10 text-primary dark:text-primary-400 rounded-full h-5 w-5 flex items-center justify-center mr-1.5">
                      <i className="ri-time-line text-[10px]"></i>
                    </span>
                    <span>Prep: {cocktail.prep_time || "5 min"}</span>
                  </div>
                  <div className="flex items-center text-xs font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                    <span className="bg-primary/10 text-primary dark:text-primary-400 rounded-full h-5 w-5 flex items-center justify-center mr-1.5">
                      <i className="ri-goblet-line text-[10px]"></i>
                    </span>
                    <span>Serve: {cocktail.serving_style}</span>
                  </div>
                </div>
                
                {/* Tap to collapse hint */}
                <div className="text-center mt-3 text-xs text-neutral-400">
                  <i className="ri-arrow-up-s-line"></i> Tap to collapse
                </div>
              </>
            ) : (
              <>
                {/* Preview content for mobile */}
                <div className="relative">
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Ingredients:</span> {cocktail.ingredients.join(', ')}
                  </div>
                  
                  {/* Fade out effect and tap to expand hint */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white dark:from-neutral-800 to-transparent flex items-end justify-center pt-6">
                    <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                      <i className="ri-arrow-down-s-line"></i> Tap for details
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Full desktop view with 2-column layout */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Ingredients column */}
              <div>
                <h5 className="text-primary dark:text-primary-400 font-semibold mb-2 sm:mb-3 flex items-center">
                  <i className="ri-flask-line mr-2"></i> Ingredients
                </h5>
                <ul className="text-neutral-600 dark:text-neutral-400 text-sm space-y-1.5 sm:space-y-2">
                  {cocktail.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="h-5 w-5 mt-0.5 rounded-full bg-primary/10 flex items-center justify-center mr-2 shrink-0">
                        <i className="ri-check-line text-primary text-xs"></i>
                      </span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Instructions column */}
              <div>
                <h5 className="text-primary dark:text-primary-400 font-semibold mb-2 sm:mb-3 flex items-center">
                  <i className="ri-file-list-3-line mr-2"></i> Instructions
                </h5>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                  {cocktail.instructions}
                </p>
              </div>
            </div>
            
            {/* Footer with prep time and serving style */}
            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-neutral-100 dark:border-neutral-700 flex justify-between items-center">
              <div className="flex items-center text-xs font-medium text-neutral-500 dark:text-neutral-400">
                <span className="bg-primary/10 text-primary dark:text-primary-400 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                  <i className="ri-time-line"></i>
                </span>
                <span>Prep: {cocktail.prep_time || "5 min"}</span>
              </div>
              <div className="flex items-center text-xs font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                <span className="bg-primary/10 text-primary dark:text-primary-400 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                  <i className="ri-goblet-line"></i>
                </span>
                <span>Serve: {cocktail.serving_style}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
