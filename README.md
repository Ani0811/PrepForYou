# PrepForYou

A full-stack study companion application built with React, Node.js, Express, and PostgreSQL.

## Overview

PrepForYou is your personalized learning assistant that helps you organize notes, create study plans, practice with generated questions, and track your progress through a beautiful, accessible interface.

## Tech Stack

### Frontend (`client/`)
- **React** with Create React App + Craco
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend (`server/`)
- **Node.js** + **Express**
- **PostgreSQL** database
- **JWT** authentication
- RESTful API

## Project Structure

```
PrepForYou/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
│   └── public/
├── server/              # Node.js backend
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Custom middleware
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   └── utils/       # Helper functions
│   ├── database/        # Database schemas
│   └── server.js        # Entry point
├── tests/               # Test files
└── design_guidelines.json  # Design system specification

```

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PrepForYou
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   
   # Create database and run schema
   psql -U postgres -c "CREATE DATABASE prepforyou;"
   psql -U postgres -d prepforyou -f database/schema.sql
   
   # Start the server
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

## Features

- 📝 **Notes Management** - Create, organize, and tag your study notes
- 📅 **Study Planner** - Plan and track your study schedule
- ❓ **Question Generator** - Practice with AI-generated questions
- 📊 **Dashboard** - Monitor your progress and statistics
- 📖 **Blog** - Read study tips and educational content
- 👤 **User Profiles** - Personalized learning experience
- 🔐 **Authentication** - Secure user accounts

## Design Philosophy

PrepForYou follows a strict design system emphasizing:
- **Dark-first UI** with carefully curated color palette
- **Bold focus** and generous spacing (2-3x normal)
- **Accessibility** - WCAG compliant, high contrast, reduced motion support
- **No AI aesthetic** - Premium, distinctive, human-centered design
- **Bento Grid** layouts for intuitive information architecture

See [design_guidelines.json](design_guidelines.json) for complete design specifications.

## Development

### Backend Development
```bash
cd server
npm start  # Starts the backend server
```

### Frontend Development
```bash
cd client
npm run dev  # Starts React dev server
```

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## API Documentation

See [server/README.md](server/README.md) for detailed API endpoint documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.

