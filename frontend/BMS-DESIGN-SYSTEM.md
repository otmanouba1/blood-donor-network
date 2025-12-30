# Blood Management System (BMS) - Unified Design System

## 🎨 Design DNA Overview

This document outlines the comprehensive, premium design language applied across all Blood Management System pages (Donors, Admins, Hospitals, and Public pages).

### Color Palette

- **Page Background**: `bg-slate-50` (#F8FAFC) — Never use pure white for full pages
- **Surfaces**: `bg-white` — For cards and containers
- **Primary Accent**: `red-600` (#DC2626) — For branding, primary actions, and blood-related icons
- **Text Colors**: 
  - Headings: `slate-900` 
  - Body/Subtext: `slate-500`

### Typography

- **Font Family**: Inter (modern sans-serif)
- **Headings**: Use `tracking-tight` for all headings
- **Font Weights**: 
  - Bold: `font-bold` (600)
  - Semibold: `font-semibold` (500)
  - Medium: `font-medium` (400)

## 🧩 Shadcn/UI Global Overrides

### Card Style
```jsx
// Default card styling
className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
```

### Button Style
```jsx
// Primary button
className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"

// Outline button  
className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
```

### Input Style
```jsx
// Input styling
className="rounded-xl bg-white border-slate-200 focus:border-red-300 focus:ring-2 focus:ring-red-100"
```

## 🖼️ Shared Layout Patterns

### Navigation Bar
```jsx
<BMSNavbar>
  {/* Sticky bg-white/80 backdrop-blur-md top bar */}
</BMSNavbar>
```

### Hero Stats (Impact Cards)
```jsx
<ImpactCard
  icon={Droplet}
  title="Total Blood Units"
  value="1,250"
  change="+5%"
  variant="critical" // critical, success, info, warning
/>
```

### Icon Treatment
```jsx
<IconWrapper 
  icon={Heart} 
  variant="red" // red, blue, green, amber, slate
  className="p-3 rounded-xl bg-red-50 text-red-600"
/>
```

## 📦 BMS Component Library

### Core Components

#### 1. PageContainer
```jsx
import { PageContainer } from '@/components/ui/bms-components';

<PageContainer>
  {/* Always wrap entire pages */}
</PageContainer>
```

#### 2. SectionContainer
```jsx
import { SectionContainer } from '@/components/ui/bms-components';

<SectionContainer variant="white"> {/* default, white, gradient */}
  {/* Section content */}
</SectionContainer>
```

#### 3. ImpactCard
```jsx
import { ImpactCard } from '@/components/ui/bms-components';

<ImpactCard
  icon={Users}
  title="Active Donors"
  value="2,450"
  change="+12%"
  variant="success"
/>
```

#### 4. FeatureCard
```jsx
import { FeatureCard } from '@/components/ui/bms-components';

<FeatureCard
  icon={Shield}
  title="Secure Platform"
  description="End-to-end encryption for all data"
  variant="red"
/>
```

#### 5. IconWrapper
```jsx
import { IconWrapper } from '@/components/ui/bms-components';

<IconWrapper 
  icon={Heart} 
  variant="red"
  className="w-12 h-12"
/>
```

## 🏥 Page-Specific Implementations

### Hospital Dashboard
```jsx
// Apply the Master Global Prompt to create a dashboard for Hospital users. 
// Feature a 'Blood Stock' grid, a 'Recent Requests' table, and an 'Emergency Request' button in primary Red-600.

import { ImpactCard, BMSNavbar, PageContainer } from '@/components/ui/bms-components';

const HospitalDashboard = () => {
  return (
    <PageContainer>
      <BMSNavbar>
        {/* Navigation content */}
      </BMSNavbar>
      
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <ImpactCard icon={Droplet} title="Blood Units" value="1,250" variant="critical" />
        <ImpactCard icon={Activity} title="Blood Types" value="8" variant="success" />
        {/* More impact cards */}
      </div>
      
      {/* Emergency Request Button */}
      <Button className="bms-button-primary">
        Emergency Blood Request
      </Button>
    </PageContainer>
  );
};
```

### Admin User Management
```jsx
// Apply the Master Global Prompt to build a donor management table. 
// Use Shadcn Table and Badge components. Ensure table rows have subtle hover effects and filter inputs are rounded-xl.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminUserManagement = () => {
  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>Donor Management</CardTitle>
          <Input className="bms-input" placeholder="Search donors..." />
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <tbody>
              <tr className="hover:bg-slate-50 transition-colors">
                <td>
                  <Badge className="bg-red-100 text-red-800">O+</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
```

### Public About Page
```jsx
// Apply the Master Global Prompt to build an About page. 
// Include sections for 'Our Mission', 'Who We Are', and a team grid using Shadcn Avatars. 
// Use large rounded-3xl cards for content.

import { FeatureCard, SectionContainer } from '@/components/ui/bms-components';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AboutPage = () => {
  return (
    <PageContainer>
      <SectionContainer variant="gradient">
        {/* Hero section */}
      </SectionContainer>
      
      <SectionContainer variant="white">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Heart}
            title="Our Mission"
            description="Connecting donors with those in need"
          />
        </div>
      </SectionContainer>
      
      <SectionContainer>
        <div className="grid md:grid-cols-4 gap-6">
          {team.map(member => (
            <Card key={member.id}>
              <CardContent className="text-center p-6">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="bg-red-50 text-red-600">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-slate-900 tracking-tight">{member.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </PageContainer>
  );
};
```

## 🎯 Usage Guidelines

### DO's ✅
- Always use `PageContainer` as the root wrapper
- Use `ImpactCard` for dashboard statistics
- Apply `tracking-tight` to all headings
- Use `rounded-3xl` for main containers
- Use `rounded-xl` for buttons and inputs
- Implement hover effects: `hover:shadow-lg hover:-translate-y-1`
- Use `IconWrapper` for consistent icon styling
- Apply proper color variants: critical (red), success (emerald), info (blue), warning (amber)

### DON'Ts ❌
- Don't use pure white (`bg-white`) for page backgrounds
- Don't use `rounded-md` or smaller radius for main components
- Don't use colors outside the defined palette
- Don't forget `transition-all duration-300` for interactive elements
- Don't use `font-black` - stick to `font-bold` and `font-semibold`

## 🚀 Quick Start

1. **Import the BMS components**:
```jsx
import { 
  PageContainer, 
  SectionContainer, 
  ImpactCard, 
  FeatureCard, 
  IconWrapper, 
  BMSNavbar 
} from '@/components/ui/bms-components';
```

2. **Use the unified Shadcn components**:
```jsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
```

3. **Apply CSS utility classes**:
```jsx
// For custom components not using BMS components
<div className="bms-card">
  <button className="bms-button-primary">Action</button>
  <input className="bms-input" />
</div>
```

## 🎨 CSS Utility Classes

The following utility classes are available in `src/index.css`:

```css
.bms-card {
  @apply rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300;
}

.bms-button-primary {
  @apply rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 transition-all duration-300;
}

.bms-input {
  @apply rounded-xl bg-white border-slate-200 focus:ring-red-100 focus:border-red-300 transition-all duration-200;
}

.bms-icon-wrapper {
  @apply p-3 rounded-xl bg-red-50 text-red-600;
}

.bms-nav {
  @apply sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50;
}
```

## 📱 Responsive Design

All components are mobile-first and responsive:

- **Mobile**: Single column layouts
- **Tablet**: 2-column grids for cards
- **Desktop**: 3-4 column grids for optimal space usage

## 🔧 Customization

To customize the design system:

1. **Update colors** in `tailwind.config.js`
2. **Modify component defaults** in `src/components/ui/bms-components.jsx`
3. **Adjust CSS variables** in `src/index.css`

---

This unified design system ensures consistency across all Blood Management System interfaces while maintaining the premium, medical-grade aesthetic appropriate for healthcare applications.