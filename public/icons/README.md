# Icons Directory

This directory contains reusable icon components for the application.

## Available Icons

- **IconTemplate.tsx** - Template for creating new icon components
- **SoundIcon.tsx** - Sound control icon with mute/unmute states
- **index.ts** - Exports all icon components

## How to Use

### Import Icons

```tsx
import { SoundIcon, IconTemplate } from "@/assets/icons";
```

### Basic Usage

```tsx
<SoundIcon size={32} color="#374151" />
<IconTemplate size={24} color="#FF6B6B" className="hover:scale-110" />
```

## Creating New Icons

1. **Copy the template**: Use `IconTemplate.tsx` as a starting point
2. **Replace SVG content**: Update the path data with your actual icon
3. **Add to index.ts**: Export your new icon component
4. **Customize props**: Add any additional props your icon needs

### Example: Creating a Home Icon

```tsx
// HomeIcon.tsx
export const HomeIcon: React.FC<{
  className?: string;
  size?: number;
  color?: string;
}> = ({ className = "", size = 24, color = "currentColor" }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Your home icon SVG path here */}
      <path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
```

## Icon Sources

You can find free SVG icons from:

- [Heroicons](https://heroicons.com/)
- [Feather Icons](https://feathericons.com/)
- [Lucide Icons](https://lucide.dev/)
- [Material Design Icons](https://materialdesignicons.com/)

## Best Practices

- Use consistent sizing (24px, 32px, 48px)
- Maintain consistent stroke width (usually 2px)
- Use semantic color names or CSS variables
- Add hover effects with CSS classes
- Keep icons simple and recognizable
