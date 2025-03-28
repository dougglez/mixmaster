import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
}

export default function ErrorState({ errorMessage, onRetry }: ErrorStateProps) {
  return (
    <section className="my-12 text-center bg-red-50 dark:bg-red-950/30 rounded-2xl shadow-md p-8 border border-red-100 dark:border-red-900">
      <div className="flex flex-col items-center max-w-md mx-auto">
        <div className="text-red-500 mb-6 bg-white dark:bg-red-900/50 rounded-full h-20 w-20 flex items-center justify-center shadow-sm">
          <i className="ri-error-warning-line text-4xl"></i>
        </div>
        <h3 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-3">
          Something Went Wrong
        </h3>
        <p className="text-red-700 dark:text-red-400 mb-6">
          We encountered an error while crafting your cocktail recommendations. This might be due to API key configuration or network issues.
        </p>
        <div className="text-left w-full bg-white dark:bg-red-950/50 p-5 rounded-xl text-sm font-mono text-red-800 dark:text-red-300 mb-8 overflow-x-auto border border-red-100 dark:border-red-900 shadow-sm">
          <code>{errorMessage || "An unexpected error occurred"}</code>
        </div>
        <Button
          onClick={onRetry}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg hover:shadow-red-200 transition-all"
        >
          <div className="flex items-center space-x-2">
            <i className="ri-refresh-line"></i>
            <span>Try Again</span>
          </div>
        </Button>
      </div>
    </section>
  );
}
