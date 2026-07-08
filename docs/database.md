# Life Admin Database Schema

## Overview

Life Admin is built around a few core concepts:

- Users
- Documents
- Assets
- Reminders
- Activities (coming next)

---

## Tables

### documents

Stores every uploaded document.

Examples:

- Receipt
- Warranty
- Manual
- Passport
- Insurance Policy

Relationships:

- Can belong to an asset
- Can create reminders
- Can create activities

---

### assets

Represents physical or digital things a user owns.

Examples:

- Refrigerator
- Car
- Laptop
- Camera

Relationships:

- Has many documents
- Has many activities

---

### asset_documents

Join table between assets and documents.

---

### reminders

Stores reminders for future events.

Examples:

- Warranty expires
- Registration renewal
- Filter replacement

---

### activities

Tracks everything that happens inside Life Admin.

Examples:

- Document uploaded
- Asset created
- Reminder completed
- Warranty added

This table powers:

- Dashboard
- Asset Timeline
- Personal Timeline
- Recent Activity