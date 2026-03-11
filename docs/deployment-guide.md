# Deployment Guide

**Project**: ToDo App + Vecna Mode
**Version**: 1.1.0
**Last Updated**: 2026-03-10

---

## Overview

This guide covers deployment strategies for the ToDo App, which is a **static client-side only** application with no backend dependencies. This makes deployment extremely simple and cost-effective.

### Key Characteristics
- ✅ No backend required
- ✅ No database needed
- ✅ No API endpoints
- ✅ Pure static files (HTML/CSS/JS)
- ✅ Works on any static hosting service

---

## Pre-Deployment Checklist

### 1. Build for Production
```bash
npm run build
```

**Expected Output**:
```
dist/index.html                   # Main HTML file
dist/assets/index-[hash].js       # Bundled JavaScript
dist/assets/index-[hash].css      # Bundled CSS
dist/assets/[hash].[ext]          # Audio files and other assets
```

### 2. Test Production Build Locally
```bash
npm run preview
```

**Verify**:
- App loads correctly
- All features work (create, toggle, delete todos)
- Drag-and-drop functions
- Theme switching works
- Audio effects play
- No console errors

### 3. Check Bundle Size
```bash
npm run build -- --report
```

**Target**:
- Total bundle: <500KB (uncompressed)
- Gzipped: <150KB

---

## Deployment Options

### Option 1: Netlify (Recommended)

#### Advantages
- Free hosting for static sites
- Automatic HTTPS
- Continuous deployment from Git
- Edge caching
- Preview deployments

#### Steps

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "chore: prepare for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Click "Add new site" → "Import an existing project"

3. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy in ~30 seconds

5. **Configure Domain** (Optional)
   - Go to Site settings → Domain management
   - Add custom domain or use default `*.netlify.app`

#### Environment Variables
No environment variables required for this app.

#### Redirects (Single Page App)
Create `netlify.toml` in project root:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 2: Vercel

#### Advantages
- Free hosting for static sites
- Automatic HTTPS
- GitHub integration
- Edge network
- Analytics (free tier)

#### Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow Prompts**
   - Log in or create account
   - Confirm project settings
   - Deploy to production

4. **Set Up Continuous Deployment**
   ```bash
   vercel --prod
   ```

#### Configuration
Create `vercel.json` in project root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### Option 3: GitHub Pages

#### Advantages
- Free hosting
- Direct integration with GitHub
- Automatic HTTPS
- Simple setup

#### Steps

1. **Install gh-pages Package**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update vite.config.js**
   ```javascript
   export default defineConfig({
     base: '/your-repo-name/',  // Add this line
     // ... rest of config
   })
   ```

3. **Add Deploy Script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/root`

#### Access URL
```
https://your-username.github.io/your-repo-name/
```

---

### Option 4: Traditional Web Server

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name todo.yourdomain.com;
    root /var/www/todoapp/dist;
    index index.html;

    # Single page app fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|mp3)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName todo.yourdomain.com
    DocumentRoot /var/www/todoapp/dist

    <Directory /var/www/todoapp/dist>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Enable compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript
    </IfModule>
</VirtualHost>
```

---

## Post-Deployment Verification

### 1. Functionality Testing
- [ ] Create a new todo
- [ ] Toggle todo completion
- [ ] Add subtasks
- [ ] Drag and reorder todos
- [ ] Switch themes
- [ ] Test audio effects
- [ ] Verify confetti celebration
- [ ] Refresh page (data persistence)

### 2. Performance Testing
- [ ] Check load time (<2s on 3G)
- [ ] Verify bundle size in DevTools
- [ ] Test on mobile devices
- [ ] Check Lighthouse score

### 3. Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 4. HTTPS Verification
- [ ] Certificate valid
- [ ] No mixed content warnings
- [ ] All assets load over HTTPS

---

## Environment-Specific Considerations

### Production
- Use production build (`npm run build`)
- Enable gzip compression
- Set cache headers for static assets
- Monitor bundle size

### Development
- Use dev server (`npm run dev`)
- Hot module replacement enabled
- Source maps available
- No minification

### Staging
- Test deployment in staging environment first
- Verify all features work
- Check performance metrics
- Test on multiple devices

---

## Performance Optimization

### 1. Enable Compression
```nginx
# Nginx
gzip on;
gzip_types application/javascript text/css;
```

```apache
# Apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE application/javascript text/css
</IfModule>
```

### 2. Set Cache Headers
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|mp3)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Use CDN (Optional)
- Deploy static assets to CDN
- Reduce latency for global users
- Lower origin server load

---

## Monitoring & Analytics

### Recommended Tools

#### 1. Google Analytics (Optional)
Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### 2. Vercel Analytics (Vercel only)
- Automatic installation
- Real user monitoring
- Core Web Vitals

#### 3. Netlify Analytics (Netlify only)
- Enable in site settings
- Dashboard views
- Bandwidth usage

---

## Troubleshooting

### Issue: 404 on Refresh
**Cause**: Server not configured for SPA routing
**Solution**: Add redirect rules (see above configs)

### Issue: Audio Not Playing
**Cause**: Browser autoplay policies
**Solution**: User interaction required (already implemented)

### Issue: White Screen After Deploy
**Cause**: Base URL incorrect
**Solution**: Update `base` in `vite.config.js`

### Issue: Styles Not Loading
**Cause**: Incorrect path to CSS
**Solution**: Verify `dist/` structure and paths

### Issue: Large Bundle Size
**Cause**: Dependencies not tree-shaken
**Solution**:
- Check bundle analyzer
- Remove unused dependencies
- Enable production mode

---

## Continuous Deployment

### GitHub Actions (Netlify/Vercel)
These platforms handle CD automatically when connected to Git repo.

### Manual CI/CD
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

---

## Rollback Procedure

### Netlify
1. Go to Deploys tab
2. Find previous successful deploy
3. Click "Publish deploy"
4. Choose "Rollback to this deploy"

### Vercel
1. Go to Deployments tab
2. Find previous deployment
3. Click "Promote to Production"

### GitHub Pages
1. Revert commit to previous version
2. Push to main branch
3. GitHub Pages will auto-deploy

---

## Security Considerations

### Recommended Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "no-referrer-when-downgrade";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

### No Backend Security
- No SQL injection risk (no database)
- No XSS from server (no server rendering)
- Client-side XSS already mitigated by Vue

---

## Cost Analysis

### Free Tier Options
- **Netlify**: 100GB bandwidth/month
- **Vercel**: 100GB bandwidth/month
- **GitHub Pages**: 1GB bandwidth/month

### When to Upgrade
- Bandwidth exceeds 100GB/month
- Need custom domain (free on all)
- Need advanced analytics

### Estimated Costs
- Free tier: $0/month
- Pro tier: ~$20/month (if needed)

---

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor bundle size
- Check for security vulnerabilities
- Review performance metrics
- Test on new browser versions

### Update Process
```bash
npm update
npm audit fix
npm run build
# Test thoroughly
# Deploy
```

---

**Last Updated**: 2026-03-10
**Next Review**: After Phase 02 completion
