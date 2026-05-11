import path from "path";
/** @type {import('next').NextConfig} */

const nextConfig = {
  turbopack: {
    root: path.join(__dirname), // force root to /web
  },
  allowedDevOrigins: ["10.100.0.8"],
  transpilePackages: ["books-and-author"],
};




export default nextConfig;