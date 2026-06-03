# Static Mockup Deployment

This folder is ready for temporary static hosting.

## Recommended Option: Netlify Drop

1. Go to https://app.netlify.com/drop
2. Drag the entire `outputs` folder into the drop area.
3. Wait for Netlify to upload and publish the site.
4. Share the generated Netlify URL.

## Share Links

After deployment, use these paths:

- Manager mockup: `/manager-updated.html`
- Regular user mockup: `/user-updated.html`
- Direct manager route: `/index.html?mockup=manager&v=detail-redesign#management`
- Direct regular user route: `/index.html?mockup=user&v=detail-redesign#all`

## Static Hosting Notes

- No backend is required.
- No Supabase connection is required.
- No auth is required.
- All routes use hash navigation, so no server rewrite rule is required.
- Data is stored in `localStorage`, separately per browser/device.
- The mockup is a static prototype; shared users will not see each other's local changes.

