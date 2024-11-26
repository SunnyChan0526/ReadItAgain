/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => {
        return [
          {
            source: "/api/py/:path*",
            destination:
              process.env.NODE_ENV === "development"
                ? "http://localhost:8000/:path*"
                : "/",
          },
          {
            source: "/api/py/docs",
            destination:
              process.env.NODE_ENV === "development"
                ? "http://localhost:8000/docs"
                : "/docs",
          },
          {
            source: "/api/py/openapi.json",
            destination:
              process.env.NODE_ENV === "development"
                ? "http://localhost:8000/openapi.json"
                : "/openapi.json",
          },
        ];
      },
}

module.exports = nextConfig
