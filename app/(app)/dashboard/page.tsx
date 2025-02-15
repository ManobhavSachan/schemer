import { UserButton } from "@clerk/nextjs";
import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import Content from "@/components/dashboard/Content";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Content isLoading={true} data={[]} />
      </main>
      <Footer />
    </div>
  );
}
