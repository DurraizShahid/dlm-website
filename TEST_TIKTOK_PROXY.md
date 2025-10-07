# TikTok Proxy Deployment Test

This document outlines how to test the TikTok proxy function once it's deployed.

## Testing the Proxy Function

Once the `tiktok-proxy` function is deployed, you can test it with the following curl command:

```bash
curl -X POST "https://extalgkjlveevbkcpkuz.supabase.co/functions/v1/tiktok-proxy" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "endpoint": "/user/info/",
    "headers": {
      "Authorization": "Bearer YOUR_ACCESS_TOKEN"
    }
  }'
```

## Expected Response

If the proxy is working correctly, you should receive a response similar to:

```json
{
  "data": {
    "user": {
      "open_id": "user_open_id",
      "union_id": "user_union_id",
      "display_name": "User Name",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

## Troubleshooting Proxy Issues

If the proxy is not working:

1. Check that the function is deployed:
   ```bash
   npx supabase functions list
   ```

2. Verify the function code is correct in `supabase/functions/tiktok-proxy/index.ts`

3. Check Supabase logs:
   ```bash
   npx supabase functions logs tiktok-proxy
   ```

4. Ensure the Supabase project URL is correct in your `.env` file

## Next Steps

Once the proxy is confirmed working, the TikTok integration in the admin dashboard should function without CORS errors.