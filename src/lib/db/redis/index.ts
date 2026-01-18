import { Redis } from "@upstash/redis";
const redis = new Redis({
  url: process.env.REDIS_DATABASE_URL as string,
  token: process.env.REDIS_TOKEN as string,
});
export default redis;
