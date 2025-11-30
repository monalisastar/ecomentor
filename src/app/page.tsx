import { getMergedContent } from "@/lib/cms";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const content = await getMergedContent("home");
  return <HomeClient content={content} />;
}
