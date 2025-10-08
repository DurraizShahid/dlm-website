// Instagram Utilities Test
// This is a simple test to verify the Instagram utilities are properly structured

import { 
  generateInstagramOAuthUrl, 
  exchangeCodeForAccessToken, 
  getInstagramAccounts, 
  postVideoToInstagram, 
  postImageToInstagram, 
  getInstagramUserInfo, 
  testInstagramConnection 
} from '../instagramUtils';

describe('Instagram Utilities', () => {
  test('should export all required functions', () => {
    expect(generateInstagramOAuthUrl).toBeDefined();
    expect(exchangeCodeForAccessToken).toBeDefined();
    expect(getInstagramAccounts).toBeDefined();
    expect(postVideoToInstagram).toBeDefined();
    expect(postImageToInstagram).toBeDefined();
    expect(getInstagramUserInfo).toBeDefined();
    expect(testInstagramConnection).toBeDefined();
  });

  test('generateInstagramOAuthUrl should return a string', () => {
    const url = generateInstagramOAuthUrl();
    expect(typeof url).toBe('string');
    expect(url).toContain('facebook.com');
  });
});