import { useState, useEffect, useRef, useCallback } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, HelpCircle, Mic, MicOff, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Cocktail } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Grouped characteristics by category
const characteristicGroups = [
  {
    groupName: "Taste",
    characteristics: [
      { value: "sweet", label: "Sweet", description: "Drinks with sugary or fruity sweetness" },
      { value: "sour", label: "Sour", description: "Drinks with citrus or acidic notes" },
      { value: "fruity", label: "Fruity", description: "Drinks highlighting fruit flavors like berries, citrus, or tropical fruits" },
      { value: "bitter", label: "Bitter", description: "Drinks with complex bitterness from ingredients like amaro or bitters" },
    ]
  },
  {
    groupName: "Profile",
    characteristics: [
      { value: "spicy", label: "Spicy", description: "Drinks with heat from ingredients like chili or ginger" },
      { value: "strong", label: "Strong", description: "Drinks with higher alcohol content and bold flavors" },
      { value: "smoky", label: "Smoky", description: "Drinks with smoky notes from ingredients like mezcal or smoked ingredients" },
      { value: "herbal", label: "Herbal", description: "Drinks featuring herbs like basil, mint, or botanical spirits" },
      { value: "refreshing", label: "Refreshing", description: "Light, bright drinks perfect for warm weather" },
    ]
  },
  {
    groupName: "Feel",
    characteristics: [
      { value: "sparkling", label: "Sparkling", description: "Drinks with carbonation or effervescence" },
      { value: "dry", label: "Dry", description: "Drinks with minimal sweetness and a clean finish" },
      { value: "creamy", label: "Creamy", description: "Drinks with a smooth, rich texture often from cream or egg whites" },
      { value: "slushy", label: "Slushy", description: "Frozen or partially frozen drinks with an icy texture" },
      { value: "hot", label: "Hot", description: "Warm drinks, often served steaming" },
    ]
  }
];

// Flatten the characteristics array for selection logic
const allCharacteristics = characteristicGroups.flatMap(group => group.characteristics);

const alcoholOptions = [
  { value: "any", label: "Any alcohol type" },
  { value: "vodka", label: "Vodka" },
  { value: "gin", label: "Gin" },
  { value: "rum", label: "Rum" },
  { value: "tequila", label: "Tequila" },
  { value: "whiskey", label: "Whiskey" },
  { value: "bourbon", label: "Bourbon" },
  { value: "scotch", label: "Scotch" },
  { value: "brandy", label: "Brandy" },
  { value: "cognac", label: "Cognac" },
  { value: "mezcal", label: "Mezcal" },
  { value: "sake", label: "Sake" },
  { value: "soju", label: "Soju" },
  { value: "cachaca", label: "Cachaça" },
  { value: "pisco", label: "Pisco" },
  { value: "absinthe", label: "Absinthe" },
  { value: "vermouth", label: "Vermouth" },
  { value: "aperol", label: "Aperol" },
  { value: "campari", label: "Campari" },
  { value: "amaro", label: "Amaro" },
  { value: "non-alcoholic", label: "Non-alcoholic" },
];

const quickSuggestions = [
  { 
    name: "Mojito", 
    ingredients: "rum, mint, lime, sugar, soda",
    alcohol: "rum", 
    characteristics: ["refreshing", "sweet"]
  },
  { 
    name: "Old Fashioned", 
    ingredients: "bourbon, sugar, bitters",
    alcohol: "bourbon", 
    characteristics: ["strong", "bitter"]
  },
  { 
    name: "Margarita", 
    ingredients: "tequila, lime, triple sec",
    alcohol: "tequila", 
    characteristics: ["sour", "refreshing"] 
  }
];

interface CocktailFormProps {
  onSubmit: (data: {
    ingredients: string;
    requiredIngredients: string[];
    alcohol: string;
    characteristics: string[];
  }) => void;
}

export default function CocktailForm({ onSubmit }: CocktailFormProps) {
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>([]);
  const [requiredIngredients, setRequiredIngredients] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const { toast } = useToast();
  
  // Speech recognition reference
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Function reference for submit to avoid stale closures
  const submitFunctionRef = useRef<(() => void) | null>(null);
  
  // Voice command trigger phrases
  const SEARCH_TRIGGER_PHRASES = ["start search", "search now", "ok i'm ready", "find cocktails", "submit"];
  
  // Form setup
  const form = useForm<{
    ingredients: string;
    alcohol: string;
  }>({
    defaultValues: {
      ingredients: "",
      alcohol: "any",
    },
  });
  
  // Process ingredients when input changes
  const onIngredientsChange = useCallback((value: string) => {
    // Update the form's ingredients field
    form.setValue('ingredients', value);
    
    // Parse into an array of ingredients
    const ingredientsArray = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setIngredients(ingredientsArray);
    
    // Remove any required ingredients that are no longer in the list
    setRequiredIngredients(prev => 
      prev.filter(item => ingredientsArray.includes(item))
    );
  }, [form]);
  
  // Form submission handler
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      ...data,
      requiredIngredients,
      characteristics: selectedCharacteristics,
    });
  });
  
  // Update the ref to the most recent submitFunction
  useEffect(() => {
    submitFunctionRef.current = handleSubmit;
  }, [handleSubmit]);
  
  // Initialize speech recognition on mount
  useEffect(() => {
    // Only set up once
    if (recognitionRef.current) return;
    
    // Check if the browser supports speech recognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setSpeechError("Your browser doesn't support speech recognition");
      return;
    }
    
    // Create recognition instance
    recognitionRef.current = new SpeechRecognitionAPI();
    
    // Configure the recognition
    const recognition = recognitionRef.current;
    recognition.continuous = true; // Keep listening even after pauses
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Handle speech recognition state changes
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    const recognition = recognitionRef.current;
    
    // Handle recognition results
    const handleResult = (event: SpeechRecognitionEvent) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      
      // Update the transcript for display
      setTranscript(currentTranscript);
      
      if (event.results[0].isFinal) {
        const lowerTranscript = currentTranscript.toLowerCase();
        
        // Check if any search trigger phrase was spoken
        const triggerPhrase = SEARCH_TRIGGER_PHRASES.find(phrase => 
          lowerTranscript.includes(phrase)
        );
        
        if (triggerPhrase) {
          // Stop listening and start the search
          toast({
            title: "Starting search...",
            description: `Voice command detected: "${triggerPhrase}"`,
          });
          
          // Stop recognition
          recognition.stop();
          setIsListening(false);
          
          // Trigger the search using the ref
          if (submitFunctionRef.current) {
            submitFunctionRef.current();
          }
          return;
        }
        
        // Remove any trigger phrases from the transcript
        let cleanedTranscript = lowerTranscript;
        SEARCH_TRIGGER_PHRASES.forEach(phrase => {
          cleanedTranscript = cleanedTranscript.replace(phrase, '');
        });
        
        // Format ingredients as comma-separated list
        const formattedText = cleanedTranscript
          .replace(/and/g, ',')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Update form with recognized speech
        onIngredientsChange(formattedText);
      }
    };
    
    // Handle recognition end
    const handleEnd = () => {
      if (isListening) {
        // If we're still supposed to be listening, restart recognition
        // This helps with the browser's automatic timeout
        recognition.start();
      } else {
        setIsListening(false);
      }
    };
    
    // Handle recognition errors
    const handleError = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      toast({
        title: "Speech Recognition Error",
        description: `Unable to recognize speech: ${event.error || "Unknown error"}`,
        variant: "destructive",
      });
      console.error('Speech recognition error:', event);
    };
    
    // Add event listeners when listening starts
    if (isListening) {
      recognition.onresult = handleResult;
      recognition.onend = handleEnd;
      recognition.onerror = handleError;
      
      // Start listening immediately
      try {
        recognition.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    } else {
      // Stop recognition when not listening
      try {
        recognition.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    
    // Cleanup event listeners
    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
  }, [isListening, SEARCH_TRIGGER_PHRASES, toast, onIngredientsChange]);
  
  const toggleCharacteristic = (value: string) => {
    setSelectedCharacteristics((prev) =>
      prev.includes(value)
        ? prev.filter((char) => char !== value)
        : [...prev, value]
    );
  };
  
  const toggleRequiredIngredient = (ingredient: string) => {
    setRequiredIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const applyQuickSuggestion = (suggestion: typeof quickSuggestions[0]) => {
    onIngredientsChange(suggestion.ingredients);
    form.setValue("alcohol", suggestion.alcohol);
    setSelectedCharacteristics(suggestion.characteristics);
  };
  
  // Toggle voice recognition
  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      });
      return;
    }
    
    setIsListening(prevState => {
      if (!prevState) {
        // Clear the input field before starting a new recognition
        if (!form.getValues().ingredients) {
          onIngredientsChange("");
        }
        
        toast({
          title: "Listening for ingredients...",
          description: "Speak the ingredients you have separated by commas or 'and'",
        });
      }
      return !prevState;
    });
  };

  return (
    <>
      {/* Futuristic Voice UI Overlay */}
      {isListening && (
        <div className="voice-ui-overlay">
          <div className="voice-ui-container">
            <h3 className="voice-ui-title">Listening...</h3>
            
            <div className="voice-ui-visualizer">
              <div className="voice-ui-circle outer">
                <div className="voice-ui-circle middle">
                  <div className="voice-ui-circle inner">
                    <Volume2 className="voice-icon" />
                  </div>
                </div>
              </div>
            </div>
            
            {transcript && (
              <div className="voice-ui-transcript">
                {transcript}
              </div>
            )}
            
            <div className="voice-ui-instructions">
              Speak the ingredients you have available, separated by "and" or commas
            </div>
            
            <div className="voice-ui-commands">
              <div className="voice-command-tag">
                <Play className="h-3.5 w-3.5" />
                <span>start search</span>
              </div>
              <div className="voice-command-tag">
                <Play className="h-3.5 w-3.5" />
                <span>ok I'm ready</span>
              </div>
              <div className="voice-command-tag">
                <Play className="h-3.5 w-3.5" />
                <span>search now</span>
              </div>
            </div>
            
            <button 
              className="voice-ui-close"
              onClick={() => setIsListening(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <section id="cocktailForm" className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-10">
        <h3 className="brand-heading gradient-heading text-xl sm:text-2xl mb-4 sm:mb-6">
          What Are You in the Mood For?
        </h3>
      
        {/* Voice recognition error notice */}
        {!!speechError && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-4 text-sm text-red-600 dark:text-red-400 flex items-center">
            <i className="ri-error-warning-line mr-2 text-base"></i>
            <span>{speechError}</span>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-5">
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Available ingredients
                    </FormLabel>
                    <div className="relative">
                      <i className="ri-leaf-line absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., vodka, lime, mint, sugar"
                          className="form-input w-full pl-10 pr-10 py-6"
                          onChange={(e) => onIngredientsChange(e.target.value)}
                        />
                      </FormControl>
                      
                      {/* Voice recognition button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleVoiceRecognition}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full ${
                          isListening 
                            ? 'bg-primary/20 text-primary animate-pulse animate-soundwave' 
                            : 'text-neutral-400 hover:text-primary hover:bg-primary/10'
                        }`}
                        disabled={!!speechError}
                        title={speechError || "Use voice to add ingredients"}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-neutral-500 mb-2">
                        Separate multiple ingredients with commas
                      </p>
                      
                      {/* Required ingredients tags */}
                      {ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {ingredients.map((ingredient, idx) => (
                            <span
                              key={idx}
                              onClick={() => toggleRequiredIngredient(ingredient)}
                              className={`
                                inline-flex items-center text-xs px-2 py-1 rounded-full cursor-pointer transition-colors
                                ${requiredIngredients.includes(ingredient) 
                                  ? 'bg-primary/20 text-primary dark:text-primary-400 border border-primary/30 font-medium' 
                                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-700'}
                              `}
                            >
                              {requiredIngredients.includes(ingredient) && (
                                <i className="ri-star-fill mr-1 text-primary text-xs"></i>
                              )}
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {ingredients.length > 0 && requiredIngredients.length === 0 && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                          <i className="ri-information-line mr-1"></i>
                          Click any ingredient to mark it as required
                        </p>
                      )}
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="alcohol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Preferred alcohol
                    </FormLabel>
                    <div className="relative">
                      <i className="ri-glass-line absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 z-30"></i>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="form-select w-full justify-between pl-10 pr-4 py-6 text-left font-normal"
                            >
                              {field.value ? alcoholOptions.find((option) => option.value === field.value)?.label : "Any alcohol type"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command className="w-full">
                            <CommandInput placeholder="Search for alcohol..." />
                            <CommandList>
                              <CommandEmpty>No alcohol found.</CommandEmpty>
                              <CommandGroup>
                                {alcoholOptions.map((option) => (
                                  <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                      form.setValue("alcohol", option.value);
                                      setOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === option.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {option.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Drink characteristics grouped by category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Drink characteristics
                </label>

                {characteristicGroups.map((group) => (
                  <details key={group.groupName} className="characteristics-group border-b pb-2 last:border-b-0" open={false}>
                    <summary className="group-label cursor-pointer flex items-center justify-between hover:text-primary transition-colors dark:text-neutral-300">
                      <span>{group.groupName}</span>
                      <i className="ri-arrow-down-s-line text-sm"></i>
                    </summary>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                      {group.characteristics.map((char) => (
                        <div className="tooltip" key={char.value}>
                          <label
                            className="inline-flex items-center cursor-pointer bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors w-full"
                          >
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={selectedCharacteristics.includes(char.value)}
                              onChange={() => toggleCharacteristic(char.value)}
                            />
                            <span className="rounded-full w-3.5 h-3.5 mr-1 border-2 border-neutral-400 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary">
                              {selectedCharacteristics.includes(char.value) && (
                                <i className="ri-check-line text-white scale-75"></i>
                              )}
                            </span>
                            <span className="text-neutral-700 dark:text-neutral-300 peer-checked:text-neutral-900 dark:peer-checked:text-neutral-100 font-medium text-xs sm:text-sm truncate">
                              {char.label}
                            </span>
                          </label>
                          <span className="tooltip-text">
                            {char.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}

                {/* Quick suggestions */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Need inspiration?</span>
                    <div className="h-px bg-neutral-200 dark:bg-neutral-700 flex-grow mx-2"></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quickSuggestions.map((suggestion) => (
                      <Button
                        key={suggestion.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyQuickSuggestion(suggestion)}
                        className="text-xs py-1 px-3 rounded-full bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                      >
                        Try {suggestion.name === "Old Fashioned" ? "an" : "a"} {suggestion.name}!
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                className="button-primary w-full py-6 text-base"
              >
                <div className="flex items-center justify-center">
                  <span>Get Cocktail Recommendations</span>
                  <i className="ri-cocktail-fill ml-2 text-lg"></i>
                </div>
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </>
  );
}