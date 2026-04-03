/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled for Three.js/WebGL compatibility
  turbopack: {}, // Enable Turbopack (default in Next.js 16)
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    return config
  },
}

module.exports = nextConfig
