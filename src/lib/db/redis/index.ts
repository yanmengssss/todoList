import { Redis } from "@upstash/redis";
const redis = new Redis({
  url: "https://powerful-dogfish-36998.upstash.io",
  token: "AZCGAAIncDFjZGQwMGJmMjVjNGI0M2U0OTJlMTAwOGY3OGZiY2FjYnAxMzY5OTg",
});
export default redis;
