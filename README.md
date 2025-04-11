# Comfort PG Website

A modern, responsive website for Comfort PG, a premium Paying Guest accommodation in Hinjawadi, Pune.

## Features

- Modern UI with Glassmorphism design
- Fully responsive layout
- Dark/Light mode support
- Interactive animations
- SEO optimized
- Contact form
- Image gallery
- Google Maps integration

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Next Themes

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/comfort-pg.git
cd comfort-pg
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Amenities.tsx
│   ├── Rooms.tsx
│   ├── Gallery.tsx
│   ├── Location.tsx
│   ├── Testimonials.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── public/          # Static assets
└── styles/          # Global styles
```

## Deployment

The website can be deployed on Vercel:

1. Push your code to a GitHub repository
2. Import the project on Vercel
3. Add your environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any queries, please contact:

- Email: info@comfortpg.com
- Phone: +91 98765 43210
