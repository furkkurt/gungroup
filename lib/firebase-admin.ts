import admin from 'firebase-admin';

const serviceAccount = {
  type: "service_account",
  project_id: "gungroup-1a3c8",
  private_key_id: "98eb74149ea2e129e97defe7fb280d3e9071d189",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZiU8VEiRLKpT0\n3hS9k3xyysd/s9+/zFrw1TykF72z1Eky7hw2ZMkylGVOifCjlQ3W026Ggvcz2uXS\nPb56U4mTWchJResLIhY42wD1sr1z9LhTMaQXZ7VHR8Mk7kB1+pYBEp1U6/s8EG6b\nuhFt2iGgOdUkuJzyQOFKiogqLAIMw9JEOMnGuIccQyy9agKy3nz8jFAZQjYu0HvX\nqFrS+8gOkfNEnUkJJBSScvUb/9H6YtToq7PVDXg7U1Am43eqcX7Uup8bkJ2nVquK\nbixfcBqFczJLBRvj4jEFxTOzgtlfBPGzAmm+057yvPPPpw5z4dY3sNVIuBOeDx7O\nOrK2ITiVAgMBAAECggEAGxFVdcRmyl48tVCs4/87Yk05EFAhbIwmWgaDynyUbjvh\nSnpg/aOsz/kHDK69R/LUC1cOTvkc0/xOJyA9A0ZBvW6pLUo15Odo5x+Dublz5BR0\nmxAiNYdXVyHmy5bvDmm6dd0LFqCxB4LulbyhTo9F1S9dBiSyjVzlVjvGlaNu3dza\nSbcjpeW1osUoH5R9ADV1irvZfOf2+wkA3fkAuuPXrg4dmeccwPS43mTG4l9HPfrR\nIGGUuOd0V2QFCTVtrXu2r5B9B2uYnMhf4B/15kC/Z/5Kpi8YIz4/KFBehhWVQMbh\ngvTcbZ1KzAnP2P2Ap5gdM3y55UKKgnkXzcWOYEWSQQKBgQD/Qutf3UWQEnLWCAnB\nNpLdC2RUs1vvtM9SZbdVEmPzdzA/zStkQscVTkz93AB/FuWMAiwKNR3+/MZYsO1o\nea95C/icpgKxfK1ixYE8j7OUdgG2VgObm/LV/Rj30hWSQRxdPEwpFiu+5gJ+hNk5\nqACdgmsK8J5w/5wEeSjKWFnkUwKBgQDaKnH/BHJEoH8g0JshhsQpOnJbD3XO1m0d\ngYmXdhxapJgVqdxWX666sIyaGiHY6yBjrCXtcIFkLzgxJMOdPzJni0DcXy7SSW/1\n9acYzdp7vXma9V6lCspHPRfYDqvgHYcQY0Hog1lBCJC62uBysKX34iq/u9Up6YMw\nN69pm0TSdwKBgDMk6loj0ItEVwPxSlsPHy/w12JtKW+Gz79Xp/sAm0wtxloSNq54\n/sCTFrQKf4L3SHjb+oz1BZSQewFMOdUkBHeBYYepb4K2U1sl7XX/6OBHIKKy6zgj\nb+1WL8l/q1jJePBpY20cBxnRphBJd+ioc68bcW0YtvY3EMCIshaQyzoHAoGBAIyY\njAyX1fgqIqOILGFn02TqeKX8iaR5hapdP8mvYUh9CFH1vLyhPx6rBoGNU8DSjnYN\njAe/2HMzBxiMo8/j2VznXi5m3OrCTvgIjt4qU6IpEoRtmsfr8z4DvikME3IENXW3\nMdNhSpThqzvwMHNZKixcwcX8i7xN87CQQmhhmvGzAoGANFRtgb2QwN9wiS+A6O/j\nZVsecipxJOFarlUl8WqxEio2WKbDl4xMnKzAdYcMJqvZuyf84RwgiAYcag5eaGzt\n9bm1HpuhIk7TtoPrn1dSBs0EPS5sboDTDib8qghGOlqSK4GcfH0KDhWSPLaHwJbU\n8CzPisJoEJKCfe7PLyPc0/A=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@gungroup-1a3c8.iam.gserviceaccount.com",
  client_id: "105287473381842620535",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40gungroup-1a3c8.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const adminAuth = admin.auth(); 