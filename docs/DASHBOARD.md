# Dashboard Documentation

## Overview
The dashboard is the main interface for viewing and managing flashcards.

**Important Note:** The UI displays "Tags" labels, but these map to the database "Deck" model. A Deck represents a flashcard set/folder for organizing cards.

## Features

### Statistics Cards
- Total Knowledge: Shows total number of cards
- Due for Review: Cards due today
- Retention Rate: Overall success rate from review logs

### Card Table
- Lists all cards with status, tags, and familiarity
- Sortable by: Next Review, Creation Date, Familiarity
- Paginated with 10 cards per page
- Quick actions: Review, Edit, Delete

### Status Indicators
- **New**: Never reviewed
- **Due Now**: Review date is today or past
- **Overdue**: Review date has passed
- **In X days**: Scheduled for future review

## API Endpoints

### GET /api/dashboard/stats
Returns user statistics.

**Response:**
```json
{
  "totalCards": 100,
  "dueToday": 14,
  "retentionRate": 92
}
```

### GET /api/dashboard/cards
Returns paginated list of cards.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by (default: nextReviewAt)
- `sortOrder`: asc or desc (default: asc)
- `deckId`: Filter by deck ID (optional)

**Response:**
```json
{
  "cards": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

## Components

### StatsCard
Reusable component for displaying statistics with optional trend indicator.

### CardRow
Individual row in the card table with status badges and action buttons.

### FiltersBar
Sorting and filtering controls for the card table.
