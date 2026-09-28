/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow backend API calls from the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  },
};

export default nextConfig;
