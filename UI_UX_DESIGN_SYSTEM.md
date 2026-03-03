# Threvia App - UI/UX Design System

## Design Philosophy

**Target User**: South African youth (13-25) on mobile devices, often on limited data
**Design Goals**: 
- ✅ Fast & lightweight
- ✅ Intuitive & accessible
- ✅ Youth-friendly aesthetic
- ✅ Offline-capable
- ✅ WCAG 2.1 AA compliant

---

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563EB` (Trust, health, tech)
- **Purple Accent**: `#9333EA` (Energy, growth)
- **Success Green**: `#16A34A` (Positive actions)
- **Warning Orange**: `#EA580C` (Alerts, rewards)

### Semantic Colors
- **Error/Crisis**: `#DC2626` (Red)
- **Info**: `#0891B2` (Cyan)
- **Background**: `#0F172A` (Dark slate for OLED efficiency)
- **Text Primary**: `#F1F5F9` (Off-white for low light)
- **Text Secondary**: `#94A3B8` (Gray for subtle info)

### Gradients
```css
/* Ad completion success */
background: linear-gradient(135deg, #16A34A 0%, #10B981 100%);

/* Data time remaining */
background: linear-gradient(to right, #2563EB 0%, #0891B2 100%);

/* Premium/THREV */
background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%);
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Ubuntu', sans-serif;
```

### Type Scales
```
H1 (Hero):        32px / 1.2  / Bold    (Welcome screens, titles)
H2 (Section):     24px / 1.3  / Bold    (Module headers)
H3 (Card Title):  18px / 1.4  / Semibold (Card headings)
Body Large:       16px / 1.5  / Regular (Body text, buttons)
Body Regular:     14px / 1.6  / Regular (Standard text)
Body Small:       12px / 1.5  / Regular (Captions, hints)
Label:            11px / 1.4  / Semibold (Labels, tabs)
```

---

## Component Library

### 1. Ad Modal (Unskippable)

```jsx
<AdModal
  sponsor={{ name: "Vodacom", logo: "📡" }}
  duration={15}
  youtubeVideoId="dQw4w9WgXcQ"
  onComplete={handleComplete}
  type="first" | "recurring"
/>
```

**States**:
- Playing (0-80% complete) → No skip button
- Can Skip (80%+ complete, first ad only) → Red skip button
- Completed → Auto-redirect

**Layout**:
```
┌─────────────────────────────────┐
│ Header: "Can't skip" badge      │
├─────────────────────────────────┤
│                                 │
│   [YouTube Video Area]          │
│   Progress: ███████░░░          │
│                                 │
├─────────────────────────────────┤
│ Timer: 15s | Sponsor | +50 pts  │
│ [Skip] (if available)           │
└─────────────────────────────────┘
```

### 2. Data Timer Card

```jsx
<DataTimerCard
  timeRemaining={1245} // seconds
  percentRemaining={83}
  isActive={true}
/>
```

**Visual Hierarchy**:
- Large bold time display (3xl)
- Animated progress bar (smooth width change)
- Status text (active/expired)
- Color coding (blue = active, red = expired)

### 3. Feature Module Card

```jsx
<ModuleCard
  icon="📚"
  label="Education"
  description="Study guides and resources"
  requiresData={true}
  isAvailable={true}
  onClick={handleNavigate}
/>
```

**Disabled State** (no data):
- Reduced opacity (60%)
- Lock icon (🔒)
- "Watch ad to unlock" hint
- Cursor: not-allowed

### 4. Points Counter

```jsx
<PointsCounter
  points={850}
  threvBucks={8.5}
  nextConversion={150} // points until next buck
/>
```

**Progressive Disclosure**:
- Shows raw points
- Shows THREV equivalent (points / 100)
- Shows points to next THREV
- On conversion: celebration animation

### 5. Navigation Bar (Bottom Tab)

```jsx
<BottomNav
  tabs={[
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'earn', icon: '⭐', label: 'Earn' },
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'help', icon: '❓', label: 'Help' },
  ]}
  active="home"
/>
```

**Mobile-first**: Sticky bottom, 56px height, tap-friendly (48px min touch target)

---

## Screen Layouts

### 1. Login Screen

```
┌─────────────────┐
│      🌟         │ Hero section
│   Threvia       │
│ Your Health,    │
│ Your Control    │
├─────────────────┤
│ [Email input]   │
│ [Password input]│
│ [Login button]  │
├─────────────────┤
│ OR              │ Divider
│ [Sign with Base]│ Wallet login
├─────────────────┤
│ No account?     │ Link to register
│ Sign up         │
└─────────────────┘
```

**Validation**:
- Real-time email validation
- Password strength meter
- Clear error messages in red
- Success states with checkmarks

### 2. Home Dashboard (Authenticated, No Data)

```
┌─────────────────────────────────┐
│ Welcome back, [Name]!           │
├─────────────────────────────────┤
│ 📱 [Status Cards]               │
│ ┌─────────────────────────────┐ │
│ │ Data: No Data               │ │
│ │ Points: 850 ⭐             │ │
│ │ Bucks: 8.5 💰              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 🎁 [CTA: Watch ad for data]    │
├─────────────────────────────────┤
│ Modules (Grid 2x2)              │
│ ┌──────────┬──────────┐        │
│ │ 📚 Edu   │ 🏥 Health│        │
│ │ Lock 🔒  │ Lock 🔒  │        │
│ ├──────────┼──────────┤        │
│ │ 🔬 Rsrch │ 📍 Maps  │        │
│ │ Lock 🔒  │ Lock 🔒  │        │
│ └──────────┴──────────┘        │
├─────────────────────────────────┤
│ [Bottom nav]                    │
└─────────────────────────────────┘
```

### 3. Home Dashboard (With Active Data)

```
┌─────────────────────────────────┐
│ Welcome back, [Name]!           │
│ 🎉 You have free data access!  │
├─────────────────────────────────┤
│ ⏱️ Data: 23:45 (progress bar)  │
│ ⭐ Points: 850 (next 100 → 1🪙) │
│ 💰 Bucks: 8.5 THREV             │
├─────────────────────────────────┤
│ 🎬 Next ad in: 3:42             │
│ (Can't skip - earn 50 points!)  │
├─────────────────────────────────┤
│ Modules (Grid 2x2)              │
│ ┌──────────┬──────────┐        │
│ │ 📚 Edu ✓ │ 🏥 Health✓        │
│ │ Available│ Available        │
│ ├──────────┼──────────┤        │
│ │ 🔬 Rsrch ✓│ 📍 Maps ✓        │
│ │ Available│ Available        │
│ └──────────┴──────────┘        │
├─────────────────────────────────┤
│ [Bottom nav]                    │
└─────────────────────────────────┘
```

### 4. Health Module (Example)

```
┌─────────────────────────────────┐
│ 🏥 Health                       │
├─────────────────────────────────┤
│ [Search: "period tracking"]     │
├─────────────────────────────────┤
│ Quick Actions (Swipeable):      │
│ ┌──────────────────────────────┐│
│ │ 📅 Log Period                ││
│ │ Track your cycle             ││
│ └──────────────────────────────┘│
├─────────────────────────────────┤
│ Articles & Resources            │
│ ┌──────────────────────────────┐│
│ │ 🌿 Sexual Health             ││
│ │ 7 articles                   ││
│ └──────────────────────────────┘│
│ ┌──────────────────────────────┐│
│ │ 🧠 Mental Health             ││
│ │ 12 articles                  ││
│ └──────────────────────────────┘│
├─────────────────────────────────┤
│ [Bottom nav]                    │
└─────────────────────────────────┘
```

### 5. Ad Watching Screen (Mid-Session)

```
┌─────────────────────────────────┐
│ ⏰ Data: 19:32                  │
├─────────────────────────────────┤
│ 🎬 Next ad in: 2:15             │
│ (Mandatory - earn 50 points)    │
│                                 │
│ [Feature: Education browsing]   │
│                                 │
│ Time until ad: ██████░░░        │
└─────────────────────────────────┘
```

**On ad trigger**:
- Full-screen ad modal appears
- Semi-transparent overlay behind
- Cannot dismiss or navigate away

---

## Animations & Interactions

### Success Animations
```css
/* Ad completion */
@keyframes celebrationPop {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* Points earned */
@keyframes pointsFloat {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-100px); opacity: 0; }
}

/* Data timer ticking */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Transitions
- Page transitions: 300ms fade
- Button hover: 150ms background change
- Progress bar: 300ms smooth width change
- Toast/notifications: 400ms slide-in

---

## Accessibility

### Keyboard Navigation
- Tab order follows visual hierarchy
- Focusable elements: min 44px × 44px
- Focus indicators: 3px outline in primary color
- ARIA labels for all interactive elements

### Screen Reader Text
```jsx
<button aria-label="Watch advertisement to earn 25 minutes data">
  Watch Ad
</button>
```

### Color Contrast
- Text on background: min 4.5:1 ratio
- UI components: min 3:1 ratio
- All passes WCAG AAA standard

### Responsive Design
```css
/* Mobile (320px - 480px) */
Card padding: 16px
Font size: 14px
Button height: 48px

/* Tablet (481px - 768px) */
Card padding: 20px
Font size: 16px
Grid: 3 columns

/* Desktop (769px+) */
Card padding: 24px
Font size: 18px
Grid: 4 columns
Max width: 1200px
```

---

## Micro-interactions

### Loading States
- Skeleton screens instead of spinners
- Animated dots for streaming content
- Progress indicators for data uploads

### Error States
- Red text with error icon
- Specific, actionable error messages
- Retry buttons where applicable

### Empty States
- Helpful illustrations
- Clear CTA (e.g., "Watch an ad to unlock")
- Encouraging messaging

---

## Dark Mode Compliance

**All screens use dark mode by default**:
- Reduces battery drain on OLED screens
- More comfortable for night browsing
- South African youth use case (load shedding)
- Backgrounds: `#0F172A`, `#1E293B`, `#334155`
- Text: `#F1F5F9` (primary), `#94A3B8` (secondary)

---

## Mobile Performance

### Bundle Size Targets
- Initial load: <50KB (gzipped)
- First contentful paint: <2s
- Time to interactive: <4s

### Optimization Strategies
- Code splitting by route
- Image optimization (WebP with fallbacks)
- Lazy loading for off-screen content
- Service worker for offline mode

---

## Testing Checklist

- [ ] All components responsive (320px - 1440px)
- [ ] Touch targets ≥48px × 48px
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] Works offline after first load
- [ ] Color contrast WCAG AAA
- [ ] Load time <4s on 3G
- [ ] No console errors
- [ ] Tested on iOS Safari & Android Chrome
- [ ] Ad skip logic working correctly
- [ ] Data timer accurate

---

## Figma Design Kit

**Coming Soon**: Interactive Figma prototype with all components
- Current status: In design phase
- Timeline: Week 5-6 of implementation
- Link: [Will be added]

