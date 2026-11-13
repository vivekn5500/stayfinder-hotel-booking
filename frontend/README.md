# StayFinder – Premium Frontend (React + Vite)

The frontend application for **StayFinder**, an editorial luxury hotel booking platform showcasing curated architectural sanctuaries across India.

---

## 🎨 Visual Identity & Design System

The frontend is styled in accordance with a luxury editorial aesthetic, avoiding generic dashboard or AI-generated card tropes:

- **Color Palette:**
  - **Warm Ivory / Cream (`#FAF8F5`, `#F5F2EB`):** Foundation backgrounds and canvas.
  - **Deep Forest Green (`#1A382B`, `#11261D`):** Primary branding, typography headings, and primary buttons.
  - **Warm Brass (`#C5A572`, `#8A6B32`):** Elegant accents, rating stars, and editorial tags.
  - **Muted Terracotta (`#C26747`):** High-intent calls to action and booking confirmations.
  - **Charcoal (`#2D3430`):** Readable, high-contrast typography.
- **Typography:**
  - **Headings:** *Cormorant Garamond* (Serif).
  - **Body / Interface:** *Plus Jakarta Sans* (Sans-serif).
- **Asymmetric Editorial Layout:** Generous whitespace, high-resolution imagery, and refined micro-interactions.

---

## 🚀 Key Pages & Features

1. **Homepage (`/`):**
   - Editorial hero section with live floating search bar.
   - Curated sanctuaries showcase powered by `GET /api/v1/hotels`.
   - Regional destination guides (Goa, Jaipur, Mumbai, Manali, Alleppey).
   - "StayFinder Standard" explaining physical room allocation and concurrency safety.
2. **Hotel Search & Listing (`/hotels`, `/hotels/search`):**
   - Destination, check-in, check-out, and guest filtering.
   - Paginated hotel catalog with dynamic count and zero-state recovery.
3. **Hotel Detail & Smart Availability (`/hotels/:id`):**
   - High-resolution hero gallery and hotel description.
   - Distinctive amenities grid.
   - **Smart Stay Availability Calendar:** Interactive month navigation with half-open interval date selection.
   - **Physical Suite Selection:** Individual physical rooms with floor number, occupancy, price/night, and live lock status.
4. **Secure Reservation Flow (`/booking`):**
   - Live backend price calculation via `POST /api/v1/bookings/calculate-price`.
   - Comprehensive guest details validation.
   - Double-booking concurrency protection with optimistic recovery for `409 Conflict`.
5. **Booking Confirmation Voucher (`/booking/confirmed/:reference`):**
   - Deterministic reference code badge (`SF-YYYYMM-XXXXXX`).
   - Detailed guest, stay schedule, and room summary.
   - Integrated voucher printing (`window.print()`).
6. **Reservation Management (`/reservations`):**
   - Tab 1: Lookup by unique booking reference with cancellation workflow.
   - Tab 2: Lookup by guest email listing all past and active bookings.
   - Transactional cancellation with modal confirmation via `PATCH /api/v1/bookings/{ref}/cancel`.

---

## 🛠️ Technology Stack

- **React 18.3**
- **Vite 6**
- **React Router DOM 6**
- **Axios** (configured with base URL and error normalization)
- **Lucide React** (modern iconography)
- **CSS3 Variables & Design System** (`src/styles/index.css`)

---

## ⚙️ Development & Build Scripts

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server with proxy to backend (http://localhost:8080)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```
