# Design System: AttendAI (macOS Style)

## 1. Design Philosophy
- **Fluid & Organic**: Smooth transitions, rounded corners (`rounded-2xl`, `rounded-3xl`).
- **Depth & Translucency**: Heavy use of glassmorphism (`backdrop-blur-xl`, `bg-white/70`).
- **Content-First**: Minimal borders, relying on spacing and shadows for hierarchy.
- **Playful yet Professional**: Use of "squircle" shapes and subtle bounce animations.

## 2. Typography
**Font Family**: System UI (San Francisco on Mac, Segoe UI on Windows, Roboto on Android).
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

**Scale**:
- **Display**: `text-4xl font-bold tracking-tight` (Page Titles)
- **Heading**: `text-2xl font-semibold` (Section Headers)
- **Body**: `text-base font-normal text-slate-600 dark:text-slate-300`
- **Caption**: `text-sm font-medium text-slate-400`

## 3. Color Palette (Tailwind)

### Neutrals (Slate)
- **Background (Light)**: `bg-slate-50` / `bg-white`
- **Background (Dark)**: `dark:bg-slate-900` / `dark:bg-slate-800`
- **Text (Light)**: `text-slate-900` (Primary), `text-slate-500` (Secondary)
- **Text (Dark)**: `dark:text-white` (Primary), `dark:text-slate-400` (Secondary)

### Primary (Indigo - macOS Wallpaper vibe)
- **Main**: `bg-indigo-500`
- **Hover**: `hover:bg-indigo-600`
- **Subtle**: `bg-indigo-50 text-indigo-600`

### Functional (Traffic Lights)
- **Success**: `text-emerald-500 bg-emerald-50`
- **Warning**: `text-amber-500 bg-amber-50`
- **Error**: `text-rose-500 bg-rose-50`

## 4. Components & Effects

### Glass Card (The "Finder" look)
```tsx
<div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6">
  {/* Content */}
</div>
```

### Action Button
```tsx
<button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
  Action
</button>
```

### Animations (Framer Motion)
- **Page Load**: Fade in + Slide up (`initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`)
- **Hover**: Slight lift (`whileHover={{ y: -2 }}`)
- **Tap**: Scale down (`whileTap={{ scale: 0.95 }}`)

## 5. Layout (Mac App)
- **Sidebar**: Fixed, translucent, blurred.
- **Main Content**: Scrollable area with large headers.
- **Window Controls (Fake)**: Red/Yellow/Green circles for decoration in the header.

## 6. Implementation Steps
1.  **Install Dependencies**: `framer-motion` (for animations), `clsx`, `tailwind-merge`.
2.  **Configure Tailwind**: Enable `darkMode: 'class'`.
3.  **Refactor Layout**: Create a `MainLayout` shell with the sidebar/header.
4.  **Update Pages**: Apply the glassmorphism and typography rules.
