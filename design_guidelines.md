# Heritage Condominium Management Platform - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Material Design + shadcn/ui hybrid)

**Justification:** This is a utility-focused, information-dense financial management platform where efficiency, data clarity, and trust are paramount. The application requires consistent patterns for data tables, financial metrics, and multi-role dashboards. A design system approach ensures scalability across 8+ major features while maintaining professional credibility for financial transactions.

**Core Design Principles:**
1. **Data Clarity First** - Financial information must be scannable and unambiguous
2. **Role-Based Hierarchy** - Board members see comprehensive data; owners see focused, personal information
3. **Trust Through Transparency** - Real-time updates and clear status indicators build confidence
4. **Efficiency Over Decoration** - Minimal cognitive load for frequent users

---

## Typography System

**Font Families:**
- **Headings:** Inter Bold (600-700 weight) - Professional, highly legible
- **Body Text:** Inter Regular (400 weight) - Excellent readability at all sizes
- **Financial Numbers:** JetBrains Mono Medium - Tabular numerals for perfect alignment in tables
- **Small Labels:** Inter Medium (500 weight) - Subtle emphasis without boldness

**Type Scale:**
- **Page Titles:** 2xl to 3xl (24-30px) - Bold, establishes hierarchy
- **Section Headers:** xl (20px) - Medium weight, defines content blocks
- **Card Titles:** lg (18px) - Medium weight for metric cards
- **Body Text:** base (16px) - Primary reading size
- **Table Content:** sm (14px) - Dense data presentation
- **Captions/Labels:** xs (12px) - Metadata and timestamps

**Number Formatting Rules:**
- Currency always with JetBrains Mono, right-aligned
- Use comma separators: $7,488.01
- Negative values in parentheses: ($2,365.12)
- Large numbers with "K" suffix for summaries: $129K

---

## Layout System & Spacing

**Spacing Primitives (Tailwind units):**
- **Core rhythm:** 4, 8, 12, 16, 24, 32
- **Component padding:** p-4 (16px) for cards, p-6 (24px) for larger containers
- **Vertical spacing:** space-y-4 between card groups, space-y-8 between major sections
- **Horizontal gaps:** gap-4 for grid layouts, gap-6 for feature sections

**Grid Structure:**
- **Dashboard Cards:** 3-column grid on desktop (grid-cols-3), 1-column mobile
- **Data Tables:** Full-width with horizontal scroll on mobile
- **Sidebar Navigation:** 240px fixed width, collapsible on tablets
- **Content Area:** max-w-7xl with px-4 to px-8 responsive padding

**Responsive Breakpoints:**
- Mobile: < 640px - Single column, stacked cards
- Tablet: 640-1024px - 2-column grids, collapsible sidebar
- Desktop: 1024px+ - 3-column grids, persistent sidebar

---

## Component Library & Patterns

### Dashboard Metric Cards
Clean card design with clear visual hierarchy:
- Card header with label (text-sm, muted color)
- Large metric display (text-3xl, bold, primary value)
- Status badge in top-right (success/warning/danger variants)
- Optional trend indicator (↑↓ icons with percentage change)
- Subtle card borders, no heavy shadows

### Status Badge System
Consistent color-coding for immediate recognition:
- **Current/Paid:** Green background with white text
- **Pending:** Yellow background with dark text
- **30-60 days late:** Orange background with white text
- **90+ days late:** Red background with white text
- **With Attorney:** Dark red with strong emphasis
- Rounded-full pill shape, px-3 py-1 sizing

### Data Tables
Professional financial table design:
- Zebra striping for row distinction (subtle gray alternation)
- Sticky header row on scroll
- Right-aligned numeric columns with monospace font
- Left-aligned text columns
- Sortable column headers with arrow indicators
- Row hover state with slight background change
- Action buttons in rightmost column (icon buttons)
- Mobile: Convert to card layout with stacked fields

### Navigation Structure
**Sidebar Navigation (Board/Management):**
- Logo/Building name at top
- Grouped menu sections: Dashboard, Financial, Operations, Reports
- Active state: Left border accent + background tint
- Icons from Heroicons paired with labels
- Collapse to icon-only on tablet

**Owner Portal Navigation:**
- Simplified top navigation bar
- Limited to: My Account, Payments, Documents, Support
- User dropdown in top-right with logout option

### Forms & Inputs
Clean, accessible form design:
- Label above input (text-sm, font-medium)
- Input height: h-10 for comfortable touch targets
- Border on all states, stronger on focus (ring-2 ring-primary)
- Error states with red border + error message below
- Required fields marked with red asterisk
- Group related fields with section headings

### Alert & Notification System
**Critical Alerts (Top of dashboard):**
- Red background for financial/legal urgency
- Orange for pending approvals requiring action
- Blue for informational updates
- Close button in top-right
- Icon on left aligned with text

**Toast Notifications:**
- Bottom-right corner positioning
- Auto-dismiss after 5 seconds
- Success (green), Error (red), Info (blue) variants

---

## Data Visualization

**Financial Charts (Recharts):**
- **Bar charts** for month-over-month comparisons
- **Line charts** for reserve fund trends over time
- **Donut charts** for budget allocation breakdown
- Consistent color mapping: Operating (blue), Reserves (green), Special Assessment (purple)
- Clean grid lines, no heavy borders
- Tooltips on hover showing exact values
- Legend below chart, horizontally aligned

**Progress Indicators:**
- Linear progress bars for payment plans (0-100%)
- Circular progress for collection status milestones
- Color transitions: gray → yellow → green as completion increases

---

## Content Density & Whitespace

**Dashboard View:**
- Generous padding around metric cards (p-6)
- Moderate spacing between cards (gap-6)
- Maximum 3 cards per row to prevent overwhelming scan

**Table Views:**
- Compact row height (py-3) for data density
- Adequate column padding (px-4) for readability
- Maximum 8 columns visible before horizontal scroll

**Detail Pages:**
- Two-column layout: Main content (66%) + Sidebar (33%)
- Related information grouped in secondary cards
- Consistent 24px spacing between content sections

---

## Accessibility & Interaction

**Focus States:**
- All interactive elements have visible focus rings (ring-2 ring-offset-2)
- Keyboard navigation fully supported throughout application
- Skip-to-content links for screen readers

**Loading States:**
- Skeleton screens for table data (shimmer animation)
- Spinner overlay for form submissions
- Disabled state with reduced opacity for unavailable actions

**Empty States:**
- Centered icon + heading + description
- Call-to-action button when applicable
- Friendly illustration or icon (muted color)

---

## Role-Specific Considerations

**Board Dashboard:**
- Comprehensive overview with all metrics visible
- Quick-action buttons prominently placed
- Alert panel always visible at top
- Dense information layout acceptable

**Owner Portal:**
- Simplified, focused on personal account
- Large, clear balance display
- Prominent "Make Payment" call-to-action
- Friendly, less formal tone in microcopy

**Management Interface:**
- Task-oriented workflow design
- Queue-based views (invoices pending, approvals needed)
- Bulk action capabilities
- Efficiency tools (quick filters, batch operations)

---

## Images & Visual Assets

**No hero images** - This is a dashboard application, not a marketing site. Visual assets limited to:
- Building logo in navigation (small, 40x40px)
- Icons throughout interface (Heroicons library)
- Empty state illustrations (subtle, supportive)
- User avatars in navigation dropdown (32x32px circular)
- Document thumbnails in document management (100x100px preview)

Focus remains on data clarity and functional design over decorative imagery.