# META Pixel Integration Guide

This document explains how the META Pixel (Facebook Pixel) is integrated into the DLM website for tracking conversions and optimizing META Ads campaigns.

## Overview

The META Pixel integration tracks user interactions throughout the website, specifically:
- **Page Views**: Automatically tracked on every page navigation
- **InitiateApplication**: Tracked when users click any "Apply Now" button
- **SubmitApplication**: Tracked when users successfully submit the application form
- **Lead**: Standard META event fired on successful form submission for ad optimization

## Setup Instructions

### 1. Get Your META Pixel ID

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2/list/pixel/)
2. Create a new Pixel or select an existing one
3. Copy your Pixel ID (it's a 15-16 digit number)

### 2. Configure Environment Variable

Add your Pixel ID to your `.env` file:

```env
VITE_META_PIXEL_ID=your_pixel_id_here
```

**Example:**
```env
VITE_META_PIXEL_ID=123456789012345
```

### 3. Update Noscript Tag (Optional)

For users with JavaScript disabled, update the noscript tag in `index.html`:

Replace `YOUR_PIXEL_ID_HERE` with your actual Pixel ID:

```html
<noscript>
  <img height="1" width="1" style="display:none" 
  src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID_HERE&ev=PageView&noscript=1"/>
</noscript>
```

## How It Works

### Initialization

The Pixel is automatically initialized when the app loads in `src/App.tsx`:

```typescript
useEffect(() => {
  const pixelId = getMetaPixelId();
  if (pixelId) {
    initMetaPixel(pixelId);
  }
}, []);
```

### Page View Tracking

Page views are automatically tracked on every route change:

```typescript
useEffect(() => {
  trackPageView();
}, [location.pathname]);
```

### "Apply Now" Button Tracking

All "Apply Now" buttons throughout the site track the `InitiateApplication` event with source information:

- **Hero Section**: `trackInitiateApplication('hero')`
- **Navbar**: `trackInitiateApplication('navbar')` or `trackInitiateApplication('mobile-menu')`
- **FAQ Section**: `trackInitiateApplication('faq')`
- **Urgency Section**: `trackInitiateApplication('urgency')`
- **Success Stories**: `trackInitiateApplication('success-stories')`
- **About Page**: `trackInitiateApplication('about')`
- **How It Works Section**: `trackInitiateApplication('how-it-works-section')`
- **How It Works Content**: `trackInitiateApplication('how-it-works-content')`
- **Academy Page**: `trackInitiateApplication('academy')`
- **Final CTA**: `trackInitiateApplication('final-cta')`

### Form Submission Tracking

When a user successfully submits the application form, two events are fired:

1. **Custom Event**: `SubmitApplication` with application details
2. **Standard Event**: `Lead` for META Ads optimization

```typescript
// Track successful form submission
trackSubmitApplication(newApplicationId);
```

## Event Parameters

### InitiateApplication Event

```typescript
{
  content_name: 'DLM Application Form',
  content_category: 'Application',
  source: 'hero' | 'navbar' | 'faq' | etc.
}
```

### SubmitApplication Event

```typescript
{
  content_name: 'DLM Application Form',
  content_category: 'Application',
  value: 0,
  currency: 'PKR',
  application_id: 'application-uuid'
}
```

## Testing

### Verify Pixel is Working

1. Install the [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension
2. Navigate through your website
3. Click "Apply Now" buttons
4. Submit the application form
5. Check the Pixel Helper to see events firing

### Test Events

1. **PageView**: Navigate to any page - should see PageView event
2. **InitiateApplication**: Click any "Apply Now" button - should see InitiateApplication event
3. **SubmitApplication**: Complete and submit the form - should see SubmitApplication and Lead events

## META Ads Campaign Setup

### Conversion Events

In your META Ads Manager, you can optimize for:

1. **InitiateApplication**: Users who clicked "Apply Now"
   - Use this to optimize for clicks and engagement
   
2. **Lead**: Users who submitted the application form
   - Use this to optimize for actual conversions

### Custom Audiences

Create custom audiences based on:

- **Website Visitors**: All users who visited your site
- **Application Initiators**: Users who clicked "Apply Now" but didn't submit
- **Application Submitters**: Users who completed the form

### Retargeting

Set up retargeting campaigns for:

- Users who viewed the site but didn't click "Apply Now"
- Users who clicked "Apply Now" but didn't submit the form
- Users who submitted the form (for follow-up campaigns)

## Files Modified

- `src/utils/metaPixel.ts` - Core Pixel utility functions
- `src/App.tsx` - Pixel initialization and page view tracking
- `src/components/ApplyForm.tsx` - Form submission tracking
- `src/components/HeroSection.tsx` - Hero CTA tracking
- `src/components/FAQContent.tsx` - FAQ CTA tracking
- `src/components/FinalPunchSection.tsx` - Final CTA tracking
- `src/components/Navbar.tsx` - Navigation tracking
- `src/components/UrgencySection.tsx` - Urgency CTA tracking
- `src/components/SuccessStoriesSection.tsx` - Success stories CTA tracking
- `src/components/AboutContent.tsx` - About page CTA tracking
- `src/components/HowItWorksSection.tsx` - How it works section tracking
- `src/components/HowItWorksContent.tsx` - How it works content tracking
- `src/pages/Academy.tsx` - Academy page CTA tracking
- `index.html` - Pixel script loading

## Troubleshooting

### Pixel Not Initializing

- Check that `VITE_META_PIXEL_ID` is set in your `.env` file
- Verify the Pixel ID is correct (15-16 digits)
- Check browser console for errors

### Events Not Firing

- Ensure Pixel Helper extension shows the Pixel is loaded
- Check browser console for tracking errors
- Verify you're not using an ad blocker

### Events Firing Multiple Times

- This is normal for React apps with hot reloading in development
- In production, events should fire once per action

## Support

For issues or questions:
1. Check the browser console for error messages
2. Use Facebook Pixel Helper to debug
3. Verify environment variables are loaded correctly

