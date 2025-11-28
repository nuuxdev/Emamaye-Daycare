import pwa from "next-pwa";

const withPWA = pwa({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
