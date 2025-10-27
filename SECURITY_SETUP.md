# Heritage Condo Management - Security Setup

## ⚠️ CRITICAL: Key Rotation Required

All API keys and secrets in the repository history have been compromised and must be rotated immediately.

### Keys to Rotate:

1. **Database Credentials**
   - Action: Generate new database password in Supabase/Neon dashboard
   - Update: DATABASE_URL and DIRECT_URL in Netlify and Render

2. **Stripe Keys**
   - Action: Roll API keys in Stripe Dashboard → Developers → API Keys
   - Update: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY
   - Update: Webhook secret after recreating webhooks

3. **NextAuth Secret**
   - Action: Generate new random string (min 32 characters)
   - Command: `openssl rand -base64 32`
   - Update: NEXTAUTH_SECRET in both Netlify and Render

4. **Anthropic API Key**
   - Action: Generate new key at https://console.anthropic.com
   - Update: ANTHROPIC_API_KEY in environment variables

### Deployment Environment Variables:

#### Netlify (Frontend):
1. Go to: https://app.netlify.com/sites/heritage-condo-management-north-miami/settings/deploys#environment
2. Add all NEXT_PUBLIC_* variables
3. Add NEXTAUTH_URL and NEXTAUTH_SECRET

#### Render (Backend):
1. Go to: https://dashboard.render.com/web/[your-service-id]/env
2. Add all private keys (DATABASE_URL, STRIPE_SECRET_KEY, etc.)
3. Save and trigger redeploy

### After Rotation:
- [ ] Test login functionality
- [ ] Test Stripe payments
- [ ] Test database connections
- [ ] Verify API endpoints

**NEVER commit .env files to Git again.**
