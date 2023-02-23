export default () => ({
  app: {
    env: process.env.APP_ENV,
    port: process.env.APP_PORT,
    baseURL: process.env.APP_BASE_URL,
    root: process.env.PWD,
  },
  s3: {
    key: process.env.S3_ACCESS_KEY,
    secret: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET_NAME,
  },
  email: {
    transport: `smtps://${process.env.EMAIL_AUTH_EMAIL}:${process.env.EMAIL_AUTH_PASSWORD}@${process.env.EMAIL_HOST}`,
    defaults: {
      from: `"${process.env.EMAIL_FROM_USER_NAME}" <${process.env.EMAIL_AUTH_EMAIL}>`,
    },
  },
});
