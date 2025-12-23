# Cream UI Design System

## 1. Core Identity
- **Brand Name**: CampusBuddy
- **Logo Initial**: 'C' (Serif, Bold)
- **Tagline**: "AI-Powered Internship & Placement Portal"

## 2. Color Palette

### Primary Colors
- **Nobel Gold**: `#C5A059` (Used for accents, highlights, and primary branding elements)
- **Dark Stone**: `#1a1a1a` (Used for primary buttons, footer background, and dark text)
- **Cream/Off-White**: `#F9F8F4` (Main background color, soft and warm)

### Secondary Colors
- **Stone 900**: `#1c1917` (Deep dark for text/headings)
- **Stone 600**: `#57534e` (Muted text for descriptions)
- **Stone 200**: `#e7e5e4` (Borders and subtle dividers)
- **White**: `#FFFFFF` (Card backgrounds)

## 3. Typography

### Font Families
- **Headings**: `Playfair Display` (Serif)
    - Used for: Hero titles, Section headers, Logo text.
    - Weights: 400 (Regular), 600 (Semi-bold), 700 (Bold).
- **Body**: `Inter` (Sans-serif)
    - Used for: Paragraphs, Buttons, Navigation links, UI elements.
    - Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold).

### Text Styles
- **Hero Title**: `text-5xl md:text-7xl lg:text-8xl font-medium font-serif text-stone-900`
- **Section Heading**: `text-4xl md:text-5xl font-serif text-stone-900`
- **Subtitle/Lead**: `text-lg md:text-xl text-stone-700 font-light leading-relaxed`
- **Nav Links**: `text-sm font-medium tracking-wide text-stone-600 uppercase`

## 4. Component Styles

### Buttons
- **Primary (Dark)**:
    - Background: `bg-stone-900`
    - Text: `text-white`
    - Hover: `hover:bg-stone-800`, `hover:scale-105`
    - Shape: `rounded-lg`
    - Shadow: `shadow-lg`
    - Content: Often includes an icon (e.g., Briefcase).
- **Secondary (Light)**:
    - Background: `bg-white`
    - Border: `border border-stone-200`
    - Text: `text-stone-800`
    - Hover: `hover:bg-stone-50`, `hover:border-stone-400`
    - Shape: `rounded-lg`
    - Shadow: `shadow-sm`

### Cards (Feature/Info)
- **Container**: `bg-white rounded-xl border border-stone-200 shadow-sm`
- **Hover Effect**: `hover:shadow-md transition-all duration-300 group`
- **Icon Container**: `w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center group-hover:bg-nobel-gold/10`
- **Icon Color**: `text-stone-700 group-hover:text-nobel-gold`

### Navigation Bar
- **State: Top**: `bg-transparent py-6`
- **State: Scrolled**: `bg-[#F9F8F4]/90 backdrop-blur-md shadow-sm py-4`
- **Logo**: Gold square (`bg-nobel-gold`) with white text.

### Visual Effects
- **Gradients**: Subtle radial gradient in Hero section (`radial-gradient(circle_at_center,rgba(249,248,244,0.92)_0%,...)`).
- **Glassmorphism**: Used sparingly in badges (`backdrop-blur-sm bg-white/30`).
- **Micro-interactions**: `hover:scale-105`, `transition-all duration-300`.

## 5. Layout & Spacing
- **Container**: `container mx-auto px-6`
- **Section Padding**: `py-24`
- **Grid System**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`

## 6. Tailwind Configuration (Reference)
```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        nobel: {
          gold: '#C5A059',
          dark: '#1a1a1a',
          cream: '#F9F8F4',
        }
      }
    }
  }
}
```
