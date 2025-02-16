"use client";

import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import Content from "@/components/dashboard/Content";

function getRandomImageUrl() {
  const randomId = Math.floor(Math.random() * 1000); // Generates a random number between 0 and 999
  return `https://picsum.photos/250/${randomId}`;
}

const data = [
  {
    id: "1",
    description: "Description 1",
    image_url: getRandomImageUrl(),
    name: "Item 1",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: "2",
    description: "Description 2",
    image_url: getRandomImageUrl(),
    name: "Item 2",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: "3",
    description: "Description 3",
    image_url: getRandomImageUrl(),
    name: "Item 3",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: "4",
    description: "Description 4",
    image_url: getRandomImageUrl(),
    name: "Item 4",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: "5",
    description: "Description 5",
    image_url: getRandomImageUrl(),
    name: "Item 5",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
];

export default function DashboardPage() {
  

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Content isLoading={false} data={data} />
      </main>
      <Footer />
    </div>
  );
}
