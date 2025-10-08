# Deploy Instagram Proxy Function

This document explains how to deploy the Instagram proxy function to Supabase.

## Prerequisites

1. Supabase CLI installed
2. Supabase project created
3. Supabase project linked to your local environment

## Deployment Steps

### 1. Link your Supabase project (if not already done)

```bash
supabase link --project-ref your_project_id
```

### 2. Deploy the Instagram proxy function

```bash
supabase functions deploy instagram-proxy --project-ref your_project_id
```

### 3. Verify the deployment

You can verify the function is deployed by checking the Supabase dashboard or using:

```bash
supabase functions list
```

## Testing the Deployment

After deployment, you can test the function using the test files:

1. Open `test-instagram-proxy.html` in your browser
2. Click the "Test Instagram Proxy Connection" button
3. You should see a response from the Instagram API (likely an error about missing access token, but no CORS error)

## Troubleshooting

### Function Not Found

If you get a "function not found" error:
1. Verify the function is in the correct directory: `supabase/functions/instagram-proxy/`
2. Check that the `index.ts` file exists in that directory
3. Ensure you're using the correct project reference

### CORS Errors

If you still see CORS errors:
1. Verify the proxy function is correctly setting CORS headers
2. Check that requests are being sent to the proxy URL, not directly to Instagram
3. Confirm the proxy URL in your environment variables matches your deployment

### Permission Errors

If you get permission errors:
1. Verify your Facebook App has the correct permissions
2. Check that your Instagram account is a Business or Creator account
3. Confirm the access token has the required scopes

## Environment Variables

The Instagram proxy function doesn't require any special environment variables, but your frontend application needs:

```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## Updating the Function

To update the function after making changes:

```bash
supabase functions deploy instagram-proxy --project-ref your_project_id
```

## Logs and Monitoring

To view function logs:

```bash
supabase functions logs instagram-proxy
```

This will help you debug any issues with the proxy function.