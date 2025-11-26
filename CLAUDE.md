# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 C2C marketplace application connecting users through goods and services listings. Users can register with just a phone number and password to publish listings, while anyone (even without registration) can search and contact service providers. The platform features natural language search powered by Elasticsearch and real-time chat via WebSocket.

## Development Commands

- **Start development server**: `pnpm dev` (uses Turbopack for fast builds)
- **Build production**: `pnpm build` (uses Turbopack)
- **Start production**: `pnpm start`
- **Database push**: `pnpm prisma db push` (sync schema to database)
- **Generate Prisma client**: `pnpm prisma generate`
- **Add shadcn components**: `pnpm dlx shadcn@latest add <component-name>`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Package Manager**: pnpm (preferred)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider (phone + password)
- **Real-time Chat**: Socket.IO for WebSocket communication
- **Search**: Elasticsearch (index configuration pending)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui (New York style, Lucide icons)
- **Type Safety**: TypeScript with strict mode

### User Model & Features
- **Simple Registration**: Phone number + password only
- **User Scoring System**: Initial score of 50/100, adjusts based on reviews and activity
- **Public Search**: Anyone can search without registration (Google-like interface)
- **Multi-currency Support**: CFA (default), EUR, USD, XOF, XAF, MAD, TND, DZD

### Database Models (Prisma)
- **User**: Phone, password, name, avatar, score system (score, totalRating, ratingCount)
- **Category**: Hierarchical categories with slug and icons
- **Listing**: Products/services with price, currency, images, tags, location
- **Review**: 1-5 star ratings with comments, prevents duplicate reviews
- **Conversation**: Chat initiation linked to listings
- **Message**: Real-time messages with read status and typing indicators

### Authentication System
- **Provider**: Credentials-based (phone + password)
- **Session Strategy**: JWT tokens
- **Custom Pages**: `/auth/login`, `/auth/register`
- **User Score Integration**: Score displayed in session data

### Real-time Chat Features
- **WebSocket Server**: Socket.IO integration with Next.js
- **Chat Initiation**: Users can contact listing owners
- **Message Types**: Text, image, file, system messages
- **Real-time Features**: Typing indicators, read receipts, message history
- **API Fallback**: REST endpoints for message history and sending

### Key Files & Directories
- **app/**: Next.js App Router with Google-like homepage
- **app/api/auth/**: NextAuth.js configuration and routes
- **app/api/conversations/**: Chat API endpoints
- **components/ui/**: shadcn/ui components (Button, Badge, Input, Card, etc.)
- **lib/auth.ts**: NextAuth configuration with phone/password auth
- **lib/socket.ts**: Socket.IO server setup and event handlers
- **prisma/schema.prisma**: Database schema with relationships
- **types/next-auth.d.ts**: TypeScript extensions for NextAuth

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **NEXTAUTH_SECRET**: JWT signing secret
- **NEXTAUTH_URL**: Application URL
- **ELASTICSEARCH_***: Search service configuration (pending setup)

### Homepage Features
- **Google-like Search**: Central search bar with focus effects
- **Popular Searches**: Quick access buttons for common services
- **Featured Listings**: Showcase of top-rated services
- **Public Access**: No authentication required for browsing
- **Responsive Design**: Mobile-first with gradient backgrounds

### Chat System Architecture
- **Connection Flow**: User searches → finds listing → contacts owner → chat starts
- **Message Storage**: Persistent storage in PostgreSQL via Prisma
- **Real-time Sync**: WebSocket events for instant message delivery
- **Conversation Management**: Linked to specific listings for context

### Development Notes
- **Turbopack**: Fast development builds enabled
- **Minimal Shadows**: UI design avoids excessive shadows per user preference
- **Path Aliases**: `@/*` configured for clean imports
- **Currency System**: Extensible enum for multiple African and international currencies
- **Score Algorithm**: User reputation system ready for enhancement