import { useState, useEffect } from "react";

export default function LoadingState() {
  const [statusIndex, setStatusIndex] = useState(0);
  
  // Loading status messages to show progress and keep user engaged
  const loadingStatuses = [
    "Analyzing your flavor preferences...",
    "Checking ingredient combinations...",
    "Searching for creative recipes...",
    "Exploring mixology techniques...",
    "Generating beautiful visualizations...",
    "Crafting detailed instructions...",
    "Finalizing your personalized cocktails..."
  ];
  
  // Cocktail facts to entertain users during the wait
  const cocktailFacts = [
    "The word 'cocktail' first appeared in print in 1806!",
    "The Martini was originally much sweeter than today's dry version.",
    "The Bloody Mary was invented in the 1920s as a hangover cure.",
    "The Margarita was named after a woman in the 1940s.",
    "A proper Mojito should always be stirred, never shaken.",
    "The oldest recorded cocktail is the Old Fashioned from the early 1800s.",
    "James Bond's famous 'shaken, not stirred' Martini is actually unconventional."
  ];
  
  // Randomly select a cocktail fact to display
  const [cocktailFact] = useState(() => {
    const randomIndex = Math.floor(Math.random() * cocktailFacts.length);
    return cocktailFacts[randomIndex];
  });
  
  // Change the status message every few seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setStatusIndex((prevIndex) => 
        prevIndex < loadingStatuses.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <section className="my-8 sm:my-16 text-center glass-effect p-6 sm:p-8 rounded-2xl shadow-sm">
      <div className="inline-flex flex-col items-center max-w-md mx-auto">
        <div className="relative w-24 sm:w-28 h-24 sm:h-28 mb-4 sm:mb-6">
          {/* Base circle */}
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-neutral-200"></div>
          
          {/* Spinning loader */}
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary/80 border-t-transparent animate-spin"></div>
          
          {/* Pulsing inner glow */}
          <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full bg-gradient-to-br from-primary/10 to-pink-500/10 animate-pulse"></div>
          
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center text-3xl text-primary">
            <i className="ri-cocktail-fill"></i>
          </div>
          
          {/* Small bubbles animation */}
          <div className="absolute w-3 h-3 bg-primary/30 rounded-full top-1/4 right-0 animate-[ping_2s_ease-in-out_infinite]"></div>
          <div className="absolute w-2 h-2 bg-pink-400/30 rounded-full bottom-1/4 left-0 animate-[ping_3s_ease-in-out_0.5s_infinite]"></div>
        </div>
        
        <h4 className="brand-heading gradient-heading text-xl sm:text-2xl mb-2 sm:mb-3">
          Crafting Your Perfect Cocktails
        </h4>
        
        {/* Dynamic status message */}
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base h-6">
          {loadingStatuses[statusIndex]}
        </p>
        
        {/* Loading progress */}
        <div className="w-full max-w-xs mt-5 bg-neutral-100 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-pink-500 transition-all duration-500"
            style={{ width: `${Math.min(15 + (statusIndex * 12), 95)}%` }}
          ></div>
        </div>
        
        {/* Entertaining cocktail fact */}
        <div className="mt-6 bg-primary/5 rounded-lg p-3 max-w-xs">
          <p className="text-neutral-600 text-xs sm:text-sm italic">
            <span className="font-medium">Cocktail Fact:</span> {cocktailFact}
          </p>
        </div>
        
        <p className="text-neutral-500 text-xs sm:text-sm mt-4">
          This might take up to 20 seconds to generate high-quality recommendations
        </p>
      </div>
    </section>
  );
}
