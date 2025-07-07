# ReGenAI Frontend

This is the frontend application for the ReGenAI platform - an AI-powered lead re-engagement system.

## Features

- 🏠 **Home Dashboard** - Overview and analytics
- 👤 **Persona Training** - AI persona management
- 📚 **Instruction Sets** - Training data management
- 📈 **Campaign Management** - Outreach campaign control
- 📊 **Analytics** - Performance metrics and insights
- 🧠 **Vector Database** - AI embeddings and similarity search
- 🛡️ **AI Safety** - Monitoring and safety controls
- 📋 **Lead Management** - Lead qualification and tracking
- 🎯 **Lead Qualification** - BANT framework implementation
- 📞 **Phone Numbers** - Communication management
- 💬 **Testing Chat** - AI interaction testing
- 📥 **Data Ingestion** - Data import and processing
- 🔍 **Customer Enrichment** - Lead data enhancement
- 📈 **Customer Analytics** - Customer insights
- 🎓 **Advanced Training** - Advanced AI training features
- 🛡️ **Sales Training** - Sales process optimization

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Modern UI** with dark/light mode toggle

## Deployment

This frontend is configured for deployment on Render.com with:

- ✅ `render.yaml` configuration
- ✅ `_redirects` for client-side routing
- ✅ API service for backend communication
- ✅ Production build optimization

## Local Development

```bash
npm install
npm start
```

## Build for Production

```bash
npm run build
```

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (defaults to localhost:3000)
- `NODE_ENV` - Environment (development/production)