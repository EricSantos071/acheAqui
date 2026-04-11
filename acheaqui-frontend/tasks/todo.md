# Codebase audit implementation

## Security fixes
- [ ] Remove SQL injection pattern detection (app uses APIs, not SQL; rejects legitimate input like "Select Solutions Inc.")
- [ ] Tighten Vercel preview origin validation (use VERCEL_URL env var)
- [ ] Add Content-Security-Policy header to next.config.ts
- [ ] Add safety comment for dangerouslySetInnerHTML in legal-template.tsx
- [ ] Remove console.log/console.error from production API routes

## Performance and code quality
- [ ] Replace `<img>` with `<Image>` in partner-template.tsx and resource-hub-template.tsx
- [ ] Use NEXT_PUBLIC_SITE_URL env var instead of hardcoded URLs
- [ ] Remove unused exports from analytics.ts (buildURLWithUTM, getUTMFormFields)
- [ ] Remove unused exports from icon.tsx (getIconByName, iconMap export)
- [ ] Fix checkbox type fallback in form-section.tsx
- [ ] Add canonical URLs to metadata in page.tsx

## README update
- [ ] Simplify code examples (one full example, reference codebase for others)
- [ ] Add image directory convention documentation
- [ ] Add HubSpot field mapping documentation
- [ ] Update page registry example to match current structure
