# ASPIRO AI - Career Guidance Platform

A comprehensive AI-powered career guidance platform built with React, TypeScript, and Supabase.

## 🚀 Features

- **Personalized Career Recommendations**: AI-powered career path suggestions based on skills and interests
- **Skill Gap Analysis**: Detailed analysis of missing skills with learning resource recommendations
- **Resume Optimization**: AI-powered resume analysis and improvement suggestions
- **Industry Trends**: Real-time market insights and trending skills
- **Interactive Chat**: AI assistant for career guidance (coming soon)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Deployment**: Docker, Kubernetes, Nginx
- **Monitoring**: Prometheus, Grafana

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/aspiro-ai.git
cd aspiro-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. Start the development server:
```bash
npm run dev
```

## 🐳 Docker Deployment

### Build and run locally:
```bash
npm run docker:build
npm run docker:run
```

### Using Docker Compose:
```bash
docker-compose up -d
```

## ☸️ Kubernetes Deployment

1. Update secrets in `k8s/secrets.yaml`
2. Apply Kubernetes manifests:
```bash
kubectl apply -f k8s/
```

## 🔧 Configuration

### Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NODE_ENV`: Environment (development/production)

### Database Setup

The application uses Supabase with the following key tables:
- `careers`: Career path definitions
- `skills`: Master skills database
- `user_skills`: User's current skills
- `career_recommendations`: AI-generated recommendations
- `learning_resources`: Educational content

## 🎨 Design System

The application follows an Awwwards-level design aesthetic with:
- Modern color palette (primary teal, secondary grays)
- Inter font family for excellent readability
- Subtle animations and micro-interactions
- Responsive design for all devices
- Accessibility compliance (WCAG 2.1 AA)

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- HTTPS enforcement
- Security headers (CSP, HSTS, etc.)

## 📊 Monitoring

The application includes comprehensive monitoring:
- Health checks for all services
- Prometheus metrics collection
- Grafana dashboards
- Error tracking and logging

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚀 Performance Optimizations

- Code splitting and lazy loading
- Image optimization
- Gzip compression
- CDN integration
- Database indexing
- Caching strategies

## 📱 Accessibility

- Semantic HTML structure
- ARIA attributes for interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@aspiro-ai.com or create an issue in the repository.

## 🗺️ Roadmap

- [ ] Advanced AI chat interface
- [ ] Mobile app development
- [ ] Integration with job boards
- [ ] Salary negotiation tools
- [ ] Career coaching marketplace
- [ ] Advanced analytics dashboard