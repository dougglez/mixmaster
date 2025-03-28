export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-neutral-300 py-10 px-4 mt-16">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-r from-primary to-pink-500 text-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm">
                <i className="ri-cocktail-fill text-sm"></i>
              </div>
              <h2 className="gradient-heading text-xl font-bold">MixMaster</h2>
            </div>
            <p className="text-sm text-neutral-400">AI-powered cocktail recommendations</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
              <i className="ri-github-fill text-2xl"></i>
            </a>
            <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
              <i className="ri-twitter-fill text-2xl"></i>
            </a>
            <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
              <i className="ri-instagram-fill text-2xl"></i>
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-neutral-700/50 text-center text-xs text-neutral-500">
          <p>Powered by OpenAI GPT-4o. This is a demo application. Not for commercial use.</p>
          <p className="mt-2">© {new Date().getFullYear()} MixMaster. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
