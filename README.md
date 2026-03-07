# Trybet – Simulated Betting Platform

Trybet is a full-stack simulated betting platform that allows users to place virtual bets on real football matches using a wallet-based balance system.

The platform automatically retrieves match results and resolves bets accordingly, creating a realistic betting experience without using real money.

---

## Live Demo

[Live Application](YOUR_LIVE_LINK)

---

## Screenshots

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Betting Page

![Betting](screenshots/betting.png)

### Admin Panel

![Admin](screenshots/admin.png)

---

## Features

### User Authentication

Secure authentication system allowing users to register, log in, and access a personalized dashboard.

### Virtual Wallet System

Each user is assigned a virtual balance used to place bets on matches. Wallet balances update automatically when bets are placed or resolved.

### Betting Engine

Users can browse available football matches and place predictions such as:

- Home win
- Draw
- Away win

The system validates wallet balance and match availability before accepting bets.

### Automated Match Result Resolution

Match results are automatically retrieved and used to resolve bets. The system updates bet outcomes and wallet balances without manual intervention.

### Admin Dashboard

A hidden admin route allows administrators to monitor platform activity and manage match data while keeping administrative tools separate from the public interface.

---

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- API Routes / Server Logic

### Database

- MongoDB

### Infrastructure

- Vercel deployment
- VPS deployment (DigitalOcean)
- Nginx reverse proxy
- SSL with Certbot

---

## System Architecture

The platform follows a full-stack architecture where the frontend and backend are integrated within a Next.js environment.

User actions such as placing bets interact with server logic that validates input, updates wallet balances, and records bet transactions in the database.

Match result automation triggers bet settlement logic that determines winning predictions and updates user balances accordingly.

---

## Key Technical Challenges Solved

- Automated bet resolution using real match results
- Maintaining wallet balance consistency
- Secure authentication and protected routes
- Admin-only dashboard access
- Deploying scalable infrastructure with VPS and reverse proxy configuration

---

## Installation

Clone the repository

Install dependencies
npm install

## Environment Variables

Create a `.env.local` file and include:

# PayStack details

MSK=

# MongoDB Atlas

MONGODB_URI=

# Upstash Redis

UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

Run the development server
npm run dev

---

---

## Author

Richard Chukwuchekwa
Full Stack TypeScript Engineer

GitHub: https://github.com/Chekwasy  
Portfolio: https://portfolio-nine-lovat-86.vercel.app/
