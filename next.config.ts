import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel builds its own output; `standalone` was for the Docker image. */
  transpilePackages: ['@clerk/nextjs'],
  serverExternalPackages: [
    '@opentelemetry/sdk-node',
    '@opentelemetry/sdk-logs',
    '@opentelemetry/auto-instrumentations-node',
    '@opentelemetry/exporter-trace-otlp-http',
    '@opentelemetry/exporter-logs-otlp-http',
    '@opentelemetry/instrumentation-http',
  ],
  typescript: {
    // The data layer lives in this repo now, so a type error is a real defect
    // and must fail the build rather than ship silently.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Lint findings are not worth failing a deploy over yet; types are.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
