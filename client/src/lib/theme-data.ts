// Define available color themes
export const COLOR_THEMES = {
  purple: {
    name: "Violet Fusion",
    primary: "rgb(139, 92, 246)", // Purple
    secondary: "rgb(236, 72, 153)", // Pink
    description: "Our signature vibrant purple theme"
  },
  blue: {
    name: "Ocean Breeze",
    primary: "rgb(59, 130, 246)", // Blue
    secondary: "rgb(16, 185, 129)", // Green
    description: "Cool and refreshing blue tones"
  },
  amber: {
    name: "Golden Hour",
    primary: "rgb(245, 158, 11)", // Amber
    secondary: "rgb(239, 68, 68)", // Red
    description: "Warm and inviting amber hues"
  },
  teal: {
    name: "Teal Twilight",
    primary: "rgb(20, 184, 166)", // Teal
    secondary: "rgb(6, 182, 212)", // Cyan
    description: "Soothing teal with cyan accents"
  },
  indigo: {
    name: "Midnight Rush",
    primary: "rgb(79, 70, 229)", // Indigo
    secondary: "rgb(147, 51, 234)", // Purple
    description: "Deep indigo with purple highlights"
  },
  accessible: {
    name: "Accessible",
    primary: "rgb(37, 99, 235)", // Blue-600
    secondary: "rgb(37, 99, 235)", // Same blue, no gradient
    description: "High contrast theme for accessibility"
  },
};

// Define font categories for filtering
export const FONT_CATEGORIES = {
  ALL: "all",
  SANS_SERIF: "sans-serif",
  SERIF: "serif",
  DISPLAY: "display",
  HANDWRITING: "handwriting",
  MONOSPACE: "monospace",
  ACCESSIBLE: "accessible"
};

// Define title font options with categories and weights
export const TITLE_FONTS = {
  // Sans Serif Fonts
  poppins: {
    name: "Poppins",
    className: "font-poppins",
    fallback: "sans-serif",
    description: "Clean and modern",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  montserrat: {
    name: "Montserrat",
    className: "font-montserrat",
    fallback: "sans-serif",
    description: "Bold and contemporary",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  raleway: {
    name: "Raleway",
    className: "font-raleway",
    fallback: "sans-serif",
    description: "Sleek and minimalist",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  oswald: {
    name: "Oswald",
    className: "font-oswald",
    fallback: "sans-serif",
    description: "Strong and distinctive",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  clashGrotesk: {
    name: "Clash Grotesk",
    className: "font-clash",
    fallback: "sans-serif",
    description: "Modern geometric style",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  lexend: {
    name: "Lexend",
    className: "font-lexend",
    fallback: "sans-serif",
    description: "Highly readable, accessible",
    category: "accessible",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  nunitoSans: {
    name: "Nunito Sans",
    className: "font-nunito",
    fallback: "sans-serif",
    description: "Balanced and friendly",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 600,
      bold: 700
    }
  },
  proximaNova: {
    name: "Proxima Nova",
    className: "font-proxima",
    fallback: "sans-serif",
    description: "Clean professional look",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  satoshi: {
    name: "Satoshi",
    className: "font-satoshi",
    fallback: "sans-serif",
    description: "Modern minimal style",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  lato: {
    name: "Lato",
    className: "font-lato",
    fallback: "sans-serif",
    description: "Balanced warm feel",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  avenir: {
    name: "Avenir",
    className: "font-avenir",
    fallback: "sans-serif",
    description: "Modern elegant sans-serif",
    category: "sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  
  // Serif Fonts
  playfair: {
    name: "Playfair Display",
    className: "font-playfair",
    fallback: "serif",
    description: "Elegant and classic",
    category: "serif",
    weights: {
      light: 400,
      regular: 500,
      medium: 600,
      bold: 700
    }
  },
  
  // Handwriting/Script Fonts
  lobster: {
    name: "Lobster",
    className: "font-lobster",
    fallback: "cursive",
    description: "Playful and decorative",
    category: "handwriting",
    weights: {
      regular: 400
    }
  },
  pacifico: {
    name: "Pacifico",
    className: "font-pacifico",
    fallback: "cursive",
    description: "Friendly and casual",
    category: "handwriting",
    weights: {
      regular: 400
    }
  },
  dancingScript: {
    name: "Dancing Script",
    className: "font-dancing",
    fallback: "cursive",
    description: "Flowing and script-like",
    category: "handwriting",
    weights: {
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
};