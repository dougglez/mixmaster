import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const form = useForm<{
    apiKey: string;
    model: string;
  }>({
    defaultValues: {
      apiKey: "",
      model: "gpt-4o",
    },
  });

  // Load saved values from localStorage when component mounts
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key") || "";
    const savedModel = localStorage.getItem("openai_model") || "gpt-4o";
    
    form.reset({
      apiKey: savedApiKey,
      model: savedModel,
    });
  }, [form, isOpen]);

  const onSubmit = form.handleSubmit((data) => {
    localStorage.setItem("openai_api_key", data.apiKey);
    localStorage.setItem("openai_model", data.model);
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold mb-2 text-neutral-800">
            API Configuration
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            Enter your OpenAI API key to enable cocktail recommendations.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    OpenAI API Key
                  </FormLabel>
                  <div className="relative">
                    <i className="ri-key-2-line absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="sk-..."
                        {...field}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300"
                      />
                    </FormControl>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Your API key will be stored locally in your browser.
                  </p>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    OpenAI Model
                  </FormLabel>
                  <div className="relative">
                    <i className="ri-robot-line absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 z-10"></i>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    GPT-4o is required for image generation capabilities.
                  </p>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-lg shadow hover:from-primary-dark hover:to-secondary-dark focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              >
                Save Configuration
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
