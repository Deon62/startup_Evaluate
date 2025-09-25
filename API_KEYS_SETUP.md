# 🔑 API Keys Setup Guide

## 📋 Required API Keys

To run the Evalio platform, you need to obtain the following API keys:

### 1. DeepSeek API Key
**Purpose**: AI-powered startup evaluation and analysis

**How to get it**:
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-`)

**Usage**: Used for generating comprehensive startup evaluations based on user answers

**Cost**: Check DeepSeek's pricing page for current rates

### 2. Tavily API Key
**Purpose**: Real-time market research and competitive analysis

**How to get it**:
1. Visit [Tavily](https://tavily.com/)
2. Sign up for an account
3. Go to your dashboard
4. Generate an API key
5. Copy the key

**Usage**: Used for fetching real-time market data and competitor information

**Cost**: Check Tavily's pricing page for current rates

## 🔧 Configuration

### Environment Variables
Add these keys to your `.env` file:

```env
# AI API Keys
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
TAVILY_API_KEY=your-tavily-api-key-here
```

### Security Best Practices
1. **Never commit API keys to version control**
2. **Use environment variables only**
3. **Rotate keys regularly**
4. **Monitor usage and costs**
5. **Set up billing alerts**

## 🧪 Testing API Keys

### Test DeepSeek API
```bash
curl -X POST "https://api.deepseek.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello, world!"}],
    "max_tokens": 50
  }'
```

### Test Tavily API
```bash
curl -X POST "https://api.tavily.com/search" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_TAVILY_API_KEY" \
  -d '{
    "query": "startup evaluation tools",
    "search_depth": "basic",
    "max_results": 5
  }'
```

## 💰 Cost Management

### DeepSeek Pricing
- Check current pricing at [DeepSeek Pricing](https://platform.deepseek.com/pricing)
- Monitor usage in your DeepSeek dashboard
- Set up billing alerts

### Tavily Pricing
- Check current pricing at [Tavily Pricing](https://tavily.com/pricing)
- Monitor usage in your Tavily dashboard
- Set up billing alerts

### Cost Optimization Tips
1. **Implement rate limiting** to prevent excessive API calls
2. **Cache responses** when possible
3. **Monitor usage patterns** and optimize queries
4. **Set up usage alerts** to avoid unexpected charges

## 🚨 Troubleshooting

### Common Issues

#### "Invalid API Key" Error
- Verify the API key is correct
- Check for extra spaces or characters
- Ensure the key is active in your account

#### "Rate Limit Exceeded" Error
- Check your API usage limits
- Implement proper rate limiting
- Consider upgrading your plan

#### "Insufficient Credits" Error
- Check your account balance
- Add credits to your account
- Review usage patterns

### Debug Mode
Enable debug logging to troubleshoot API issues:

```env
DEBUG=true
LOG_LEVEL=debug
```

## 📞 Support

### DeepSeek Support
- Documentation: [DeepSeek Docs](https://platform.deepseek.com/docs)
- Support: Contact through DeepSeek platform

### Tavily Support
- Documentation: [Tavily Docs](https://docs.tavily.com/)
- Support: Contact through Tavily platform

## 🔄 Key Rotation

### Regular Rotation Schedule
- **Monthly**: Review and rotate API keys
- **Quarterly**: Audit API usage and costs
- **Annually**: Review and update security practices

### Rotation Process
1. Generate new API keys
2. Update environment variables
3. Test the new keys
4. Deploy the changes
5. Revoke old keys after verification

## 📊 Monitoring

### Key Metrics to Track
- API call volume
- Response times
- Error rates
- Cost per evaluation
- User satisfaction

### Monitoring Tools
- Use your API provider's dashboard
- Implement custom logging
- Set up alerts for anomalies
- Regular cost reviews

---

**⚠️ Important**: Keep your API keys secure and never share them publicly. If a key is compromised, revoke it immediately and generate a new one.
