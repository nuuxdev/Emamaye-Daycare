import pwa from "next-pwa";

const withPWA = pwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  customWorkerDir: "worker",
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
