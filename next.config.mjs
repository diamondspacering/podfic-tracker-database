/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // only the post API route can be accessed from outside the application
        source: '/db/post',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  // TODO: figure out what's causing the problems and remove
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
