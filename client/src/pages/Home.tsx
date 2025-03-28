import { useState } from "react";
import CocktailForm from "@/components/CocktailForm";
import CocktailResults from "@/components/CocktailResults";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfigModal from "@/components/ConfigModal";
import SettingsModal from "@/components/SettingsModal";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Cocktail } from "@shared/schema";

export default function Home() {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [noRecommendations, setNoRecommendations] = useState(false);

  type CocktailFormData = {
    ingredients: string;
    requiredIngredients: string[];
    alcohol: string;
    characteristics: string[];
  };

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (formData: CocktailFormData) => {
      const response = await apiRequest("POST", "/api/cocktails/recommendations", formData);
      const data = await response.json();
      return data.cocktails as Cocktail[];
    },
    onSuccess: (data) => {
      if (data.length === 0) {
        setNoRecommendations(true);
      } else {
        setCocktails(data);
        setNoRecommendations(false);
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("API key")) {
        setIsConfigModalOpen(true);
      } else {
        setErrorMessage(error.message);
      }
    },
  });

  const handleSubmit = (formData: CocktailFormData) => {
    // Check if API key is set in localStorage
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      setIsConfigModalOpen(true);
      return;
    }

    mutate(formData);
    setErrorMessage("");
  };

  const handleStartOver = () => {
    setCocktails([]);
  };

  const handleTryAgain = () => {
    setNoRecommendations(false);
  };

  const handleRetry = () => {
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-neutral-900">
      <Header 
        onConfigClick={() => setIsConfigModalOpen(true)} 
        onThemeClick={() => setIsSettingsModalOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
        <section className="mb-10 text-center">
          <h2 className="gradient-heading text-4xl font-bold mb-4 leading-tight">
            Discover Your Perfect Cocktail
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto text-lg dark:text-neutral-300">
            Tell us what you're in the mood for, and our AI mixologist will craft the perfect cocktail recommendations just for you.
          </p>
        </section>

        {cocktails.length === 0 && !isPending && !isError && !noRecommendations && (
          <CocktailForm onSubmit={handleSubmit} />
        )}

        {isPending && <LoadingState />}

        {errorMessage && (
          <ErrorState
            errorMessage={errorMessage}
            onRetry={handleRetry}
          />
        )}

        {noRecommendations && (
          <section className="my-16 text-center bg-white rounded-2xl shadow-md p-8 dark:bg-neutral-800 dark:shadow-none">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="bg-neutral-100 rounded-full h-20 w-20 flex items-center justify-center mb-6 dark:bg-neutral-700">
                <i className="ri-cocktail-line text-4xl text-neutral-400 dark:text-neutral-300"></i>
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-3 dark:text-white">No Cocktails Found</h3>
              <p className="text-neutral-600 mb-8 text-lg dark:text-neutral-300">
                We couldn't find cocktails matching your exact criteria. Try adjusting your preferences or ingredients.
              </p>
              <Button
                onClick={handleTryAgain}
                className="button-outline px-8 py-3"
              >
                <div className="flex items-center space-x-2">
                  <i className="ri-restart-line"></i>
                  <span>Try Different Options</span>
                </div>
              </Button>
            </div>
          </section>
        )}

        {cocktails.length > 0 && (
          <CocktailResults cocktails={cocktails} onStartOver={handleStartOver} />
        )}
      </main>

      <Footer />

      {/* API Configuration Modal */}
      <ConfigModal 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)} 
      />
      
      {/* Theme Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
