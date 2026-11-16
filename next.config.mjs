/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // permite enviar fotos de até ~2 MB nos formulários
    serverActions: { bodySizeLimit: '4mb' },
  },
};

export default nextConfig;
