const CONFIG = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: true,
  output: "export",
  images: { unoptimized: true },
};
module.exports = CONFIG;
