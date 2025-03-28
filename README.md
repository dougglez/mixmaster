# MixMaster: AI-Powered Cocktail Recommendation App

![MixMaster App](/generated-icon.png)

## Overview

MixMaster is a mobile-friendly web application that uses advanced AI to provide personalized cocktail recommendations. The app engages users through an intuitive interface, allowing them to search for cocktails based on ingredients, alcohol preferences, and desired drink characteristics. 

## Features

### Core Features
- **AI-Powered Recommendations**: Integrates with OpenAI to generate custom cocktail suggestions based on user preferences
- **Image Generation**: Creates appealing images for each recommended cocktail
- **Voice Input**: Futuristic voice interface for hands-free ingredient input
- **Email Authentication**: Secure account creation and login via email verification codes
- **Responsive Design**: Optimized for both mobile and desktop use

### User Experience
- **Personalized Preferences**: Save default alcohol preferences, characteristics, and ingredients
- **Cocktail Collections**: Organize drinks into custom lists (favorites, want to make, made it, not for me)
- **Theme Customization**: Extensive theme options including colors, fonts, and appearance modes
- **Feedback System**: Rate the quality of cocktail suggestions and generated images

### Technical Features
- **Real-time Voice Recognition**: Continuous speech processing with command recognition
- **Advanced Animation**: Sleek UI with responsive animations and visual feedback
- **Secure Authentication**: Email verification system with time-limited codes

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI library
- **State Management**: React Context API, TanStack Query
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom email verification system
- **AI Integration**: OpenAI API (GPT-4o, DALL-E)

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL database
- OpenAI API key

### Environment Variables
Create a `.env` file with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/mixmaster
SESSION_SECRET=your-session-secret
OPENAI_API_KEY=your-openai-api-key
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mixmaster.git
cd mixmaster
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
npm run db:push
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser to `http://localhost:5000`

## Usage Guide

### Finding Cocktail Recommendations

1. **Input Ingredients**: Enter ingredients you have or want to use
2. **Specify Preferences**: Select alcohol type and desired characteristics
3. **Get Recommendations**: View personalized cocktail suggestions with recipes and images

### Using Voice Search

1. Click the microphone icon in the search bar
2. When prompted, speak naturally about your ingredients
3. Use commands like "start search" or "I'm ready" to submit your request
4. Review the transcript and edit if needed before submitting

### Managing Your Account

1. **Registration**: Sign up with your email
2. **Verification**: Enter the code sent to your email
3. **Preferences**: Configure your default settings in the user profile
4. **Cocktail Lists**: Create and manage collections of your favorite drinks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API that powers the cocktail recommendations
- The Shadcn UI team for the excellent component library
- All contributors and testers who have helped improve the application