/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

//module.exports = nextConfig

module.exports = {
  // ... rest of the configuration.
  output: 'standalone',
}
