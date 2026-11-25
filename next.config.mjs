/** @type {import("next").NextConfig} */
const nextConfig = {
  // Gera um servidor mínimo em .next/standalone (usado pela imagem Docker).
  output: "standalone",
};

export default nextConfig;
