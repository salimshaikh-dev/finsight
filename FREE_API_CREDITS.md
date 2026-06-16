# Get Free Anthropic API Credits

## Free Trial for New Accounts

If you're a new user, Anthropic provides **$5 in free trial credits**:

1. Go to https://console.anthropic.com
2. Sign up for a new account (if you haven't already)
3. **Verify your email address**
4. You'll automatically get $5 in free credits to test the API
5. Credits are valid for 30 days

---

## Academic & Student Programs

### For Students
- **Claude for Education** program offers free access
- Go to https://docs.anthropic.com/en/docs/build-a-chatbot-with-claude
- Apply at https://console.anthropic.com/accounts/login

### For Researchers & Academics
- Contact: support@anthropic.com
- Request: academic or research program access
- Typically approved within 48 hours

---

## Startup & Nonprofit Programs

### Y Combinator Startups
- $500-5,000 in credits depending on funding stage
- Apply at: https://console.anthropic.com

### Nonprofits & NGOs
- Contact support@anthropic.com for special programs
- Usually includes reduced rates + credit allowances

---

## Pay-As-You-Go (Cheapest for Testing)

If you have a credit card and want full control:

1. Go to https://console.anthropic.com/account/keys
2. Create an API key
3. Add a payment method (credit/debit card)
4. You only pay for what you use
   - claude-sonnet-4 is ~$0.003 per 1K input tokens
   - A typical bank statement analysis costs $0.10-0.50

**Cost estimate for FinSight**:
- Simple 1-page statement: $0.05-0.10
- Complex 10-page statement: $0.30-0.50
- 100 monthly analyses: ~$15-30

---

## Get Your API Key (Free or Paid)

1. Go to https://console.anthropic.com
2. Sign in (or sign up for the $5 free trial)
3. Navigate to **Account → API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. Paste into your `.env` file:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

---

## Using Demo Mode (No API Key Needed)

If you don't have API credits yet, FinSight automatically falls back to **Demo Mode**:

- Upload any PDF (or a fake one)
- The app returns sample transaction data
- Shows all 10 transaction categories
- Perfect for testing UI/UX without API costs
- Once you get API credits, remove demo mode by restarting with a valid key

### Current Demo Transactions
- Salary (2 transactions)
- Rent (1 transaction)
- Food (2 transactions)
- Software (1 transaction)
- Transport (1 transaction)
- Utilities (1 transaction)
- Healthcare (1 transaction)
- Entertainment (1 transaction)
- Transfers (1 transaction)
- Other (1 transaction)

**Total**: 12 sample transactions with realistic amounts and dates

---

## Most Recommended Path

1. **Best for Quick Testing**: Use the **free $5 trial**
   - No credit card required
   - Takes 5 minutes to set up
   - Enough for 50-100 test uploads
   - Most reliable option

2. **Best for Learning**: Use **Demo Mode**
   - Zero cost forever
   - Test the app immediately
   - See how categorization works
   - No API key needed

3. **Best for Production**: Use **Pay-As-You-Go**
   - Only pay $0.10-0.50 per analysis
   - Full power of Claude API
   - Scale as you grow
   - Best pricing for real users

---

## Troubleshooting

### "Your credit balance is too low"
1. Check your trial status at https://console.anthropic.com/account/billing
2. If trial expired (30 days), add a credit card to continue
3. FinSight will fall back to Demo Mode automatically

### "Invalid API key"
1. Go to https://console.anthropic.com/account/keys
2. Verify you copied the full key (starts with `sk-ant-`)
3. Make sure it's in `.env` or your Railway environment variable
4. Restart the backend server

### "API key not found"
1. Create a new key at https://console.anthropic.com/account/keys
2. Copy the full key
3. Update your `.env` file: `ANTHROPIC_API_KEY=sk-ant-...`
4. If deployed to Railway, update the env var in the dashboard
5. Restart the backend

---

## Support

For help:
- Anthropic support: https://support.anthropic.com
- Documentation: https://docs.anthropic.com
- Rate limits: https://docs.anthropic.com/en/docs/resources/rate-limits

---

**Built with Claude · Anthropic**

Get started at https://console.anthropic.com 🚀
