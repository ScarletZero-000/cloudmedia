import { prisma } from "@/lib/prisma";
import UploadForm from "@/components/media/UploadForm";

export const dynamic = "force-dynamic"; // queries DB — never prerender statically
export const metadata = { title: "Upload" };

export default async function UploadPage() {
  const albums = await prisma.album.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-classic py-16 md:py-24">
      <div className="mb-12 max-w-2xl">
        <p className="label-caps mb-4">Contribute</p>
        <h1 className="heading-classic text-4xl md:text-5xl">Upload media</h1>
        <p className="mt-4 text-ink-soft">
          Files go straight to blob storage and become shareable URLs — nothing touches a local disk.
        </p>
      </div>
      <UploadForm albums={albums} />
    </div>
  );
}
