import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useTheme } from "./ui/theme-provider";
import { COLOR_THEMES, TITLE_FONTS, FONT_CATEGORIES } from "@/lib/theme-data";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { isDarkMode, toggleTheme, setThemeColor, setTitleFont } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");
  
  const [fontCategory, setFontCategory] = useState<string>(FONT_CATEGORIES.ALL);
  const [fontWeight, setFontWeight] = useState<string>("regular");
  
  const form = useForm({
    defaultValues: {
      themeColor: "purple",
      titleFont: "lobster",
      mode: isDarkMode ? "dark" : "light",
      fontWeight: "regular",
    },
  });

  // Load saved values from localStorage when component mounts
  useEffect(() => {
    const savedThemeColor = localStorage.getItem("themeColor") || "purple";
    const savedTitleFont = localStorage.getItem("titleFont") || "lobster";
    const savedFontWeight = localStorage.getItem("fontWeight") || "regular";
    
    form.reset({
      themeColor: savedThemeColor as keyof typeof COLOR_THEMES,
      titleFont: savedTitleFont as keyof typeof TITLE_FONTS,
      mode: isDarkMode ? "dark" : "light",
      fontWeight: savedFontWeight,
    });
    
    setFontWeight(savedFontWeight);
  }, [form, isOpen, isDarkMode]);

  const onSubmit = form.handleSubmit((data) => {
    // Save theme settings
    localStorage.setItem("themeColor", data.themeColor);
    localStorage.setItem("titleFont", data.titleFont);
    localStorage.setItem("fontWeight", data.fontWeight);
    
    // Apply settings
    setThemeColor(data.themeColor as keyof typeof COLOR_THEMES);
    setTitleFont(data.titleFont as keyof typeof TITLE_FONTS);
    
    // Update font weight css class
    document.documentElement.classList.remove("font-light", "font-regular", "font-medium", "font-bold");
    document.documentElement.classList.add(`font-${data.fontWeight}`);
    
    // Update dark/light mode if changed
    if ((data.mode === "dark" && !isDarkMode) || (data.mode === "light" && isDarkMode)) {
      toggleTheme();
    }
    
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-2 gradient-heading">
            Appearance Settings
          </DialogTitle>
          <DialogDescription className="text-neutral-600 dark:text-neutral-400">
            Customize the look and feel of your MixMaster experience.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="appearance">Theme</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4 overflow-hidden flex-1 flex flex-col">
              <TabsContent value="appearance" className="mt-0">
                {/* Mode Selection */}
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-3">
                        Mode
                      </FormLabel>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Apply mode change immediately for live preview
                          if ((value === "dark" && !isDarkMode) || (value === "light" && isDarkMode)) {
                            toggleTheme();
                          }
                        }}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="relative">
                          <label 
                            className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all w-full
                              ${field.value === "light" 
                                ? "border-primary bg-primary/5 dark:bg-primary/10" 
                                : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"}`}
                            onClick={() => {
                              form.setValue("mode", "light");
                              // Apply mode change immediately for live preview
                              if (isDarkMode) {
                                toggleTheme();
                              }
                            }}
                          >
                            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-2">
                              <i className="ri-sun-line text-xl text-neutral-800"></i>
                            </div>
                            <span className="text-sm font-medium">Light Mode</span>
                          </label>
                          <RadioGroupItem
                            value="light"
                            id="light"
                            className="sr-only"
                          />
                        </div>
                        
                        <div className="relative">
                          <label 
                            className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all w-full
                              ${field.value === "dark" 
                                ? "border-primary bg-primary/5 dark:bg-primary/10" 
                                : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"}`}
                            onClick={() => {
                              form.setValue("mode", "dark");
                              // Apply mode change immediately for live preview
                              if (!isDarkMode) {
                                toggleTheme();
                              }
                            }}
                          >
                            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-2">
                              <i className="ri-moon-line text-xl text-white"></i>
                            </div>
                            <span className="text-sm font-medium">Dark Mode</span>
                          </label>
                          <RadioGroupItem
                            value="dark"
                            id="dark"
                            className="sr-only"
                          />
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                
                {/* Color Themes */}
                <FormField
                  control={form.control}
                  name="themeColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-3">
                        Color Theme
                      </FormLabel>
                      <RadioGroup 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Apply theme color change immediately for live preview
                          setThemeColor(value as keyof typeof COLOR_THEMES);
                        }} 
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                          <div key={key} className="relative">
                            <label 
                              className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all w-full
                                ${field.value === key 
                                  ? "border-primary bg-primary/5 dark:bg-primary/10" 
                                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"}`}
                              onClick={() => {
                                form.setValue("themeColor", key);
                                // Apply theme color change immediately for live preview
                                setThemeColor(key as keyof typeof COLOR_THEMES);
                              }}
                            >
                              <div className="w-full flex items-center">
                                {key === "accessible" ? (
                                  <div className="w-8 h-8 rounded-full" style={{ background: theme.primary }}></div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r" 
                                       style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>
                                  </div>
                                )}
                                <span className="ml-2 text-sm font-medium line-clamp-1">{theme.name}</span>
                              </div>
                              <span className="text-[10px] mt-1 text-neutral-500 dark:text-neutral-400 line-clamp-1">{theme.description}</span>
                            </label>
                            <RadioGroupItem
                              value={key}
                              id={key}
                              className="sr-only"
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="fonts" className="mt-0 overflow-hidden flex-1 flex flex-col">
                {/* Font Category Filter */}
                <div className="mb-4">
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                    Font Category
                  </FormLabel>
                  <Select 
                    value={fontCategory}
                    onValueChange={(value) => setFontCategory(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a font category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={FONT_CATEGORIES.ALL}>All Fonts</SelectItem>
                        <SelectItem value={FONT_CATEGORIES.SANS_SERIF}>Sans-Serif</SelectItem>
                        <SelectItem value={FONT_CATEGORIES.SERIF}>Serif</SelectItem>
                        <SelectItem value={FONT_CATEGORIES.DISPLAY}>Display</SelectItem>
                        <SelectItem value={FONT_CATEGORIES.HANDWRITING}>Handwriting</SelectItem>
                        <SelectItem value={FONT_CATEGORIES.MONOSPACE}>Monospace</SelectItem>
                        <SelectItem value={FONT_CATEGORIES.ACCESSIBLE}>Accessible</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Font Weight Selector */}
                <FormField
                  control={form.control}
                  name="fontWeight"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                        Font Weight: <span className="font-medium">{field.value}</span>
                      </FormLabel>
                      <div className="w-full flex gap-6 items-center">
                        <span className="text-xs text-neutral-500">Light</span>
                        <div className="flex-1">
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              setFontWeight(value);
                              // Apply immediately for live preview
                              document.documentElement.classList.remove("font-light", "font-regular", "font-medium", "font-bold");
                              document.documentElement.classList.add(`font-${value}`);
                            }}
                            defaultValue={field.value}
                            className="flex w-full justify-between"
                          >
                            <div>
                              <label className={`inline-block px-3 py-2 border-2 rounded-l-lg cursor-pointer ${field.value === "light" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                <RadioGroupItem value="light" id="light" className="sr-only" />
                                <span className="text-xs sm:text-sm font-light">Light</span>
                              </label>
                            </div>
                            <div>
                              <label className={`inline-block px-3 py-2 border-t-2 border-b-2 border-l-2 cursor-pointer ${field.value === "regular" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                <RadioGroupItem value="regular" id="regular" className="sr-only" />
                                <span className="text-xs sm:text-sm font-normal">Regular</span>
                              </label>
                            </div>
                            <div>
                              <label className={`inline-block px-3 py-2 border-t-2 border-b-2 border-l-2 cursor-pointer ${field.value === "medium" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                <RadioGroupItem value="medium" id="medium" className="sr-only" />
                                <span className="text-xs sm:text-sm font-medium">Medium</span>
                              </label>
                            </div>
                            <div>
                              <label className={`inline-block px-3 py-2 border-2 rounded-r-lg cursor-pointer ${field.value === "bold" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                <RadioGroupItem value="bold" id="bold" className="sr-only" />
                                <span className="text-xs sm:text-sm font-bold">Bold</span>
                              </label>
                            </div>
                          </RadioGroup>
                        </div>
                        <span className="text-xs text-neutral-500">Bold</span>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Title Font Selection */}
                <FormField
                  control={form.control}
                  name="titleFont"
                  render={({ field }) => (
                    <FormItem className="overflow-hidden flex-1 flex flex-col">
                      <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-3">
                        Title Font
                      </FormLabel>
                      <RadioGroup 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Apply font change immediately for live preview
                          setTitleFont(value as keyof typeof TITLE_FONTS);
                        }} 
                        defaultValue={field.value}
                        className="space-y-3 max-h-[35vh] overflow-y-auto pr-1 flex-1"
                      >
                        {Object.entries(TITLE_FONTS)
                          .filter(([_, font]) => 
                            fontCategory === FONT_CATEGORIES.ALL || 
                            font.category === fontCategory
                          )
                          .map(([key, font]) => (
                          <div key={key} className="relative">
                            <label 
                              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all w-full
                                ${field.value === key 
                                  ? "border-primary bg-primary/5 dark:bg-primary/10" 
                                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"}`}
                              onClick={() => {
                                form.setValue("titleFont", key);
                                // Apply font change immediately for live preview
                                setTitleFont(key as keyof typeof TITLE_FONTS);
                              }}
                            >
                              <div className="flex flex-1 justify-between items-center">
                                <div>
                                  <span className={`text-lg block ${font.className || ''}`} style={{ fontFamily: `${font.name}, ${font.fallback}` }}>
                                    {font.name}
                                  </span>
                                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {font.description} • <span className="capitalize">{font.category}</span>
                                  </span>
                                </div>
                                <span className={`text-sm ${font.className || ''}`} style={{ fontFamily: `${font.name}, ${font.fallback}` }}>
                                  MixMaster
                                </span>
                              </div>
                            </label>
                            <RadioGroupItem
                              value={key}
                              id={key}
                              className="sr-only"
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <DialogFooter className="pt-6 pb-2 mt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-lg shadow hover:from-primary-dark hover:to-secondary-dark focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
                >
                  Save Settings
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}