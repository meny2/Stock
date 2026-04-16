/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // เปลี่ยนจาก tailwindcss เป็นตัวนี้
    autoprefixer: {},
  },
};

export default config;
