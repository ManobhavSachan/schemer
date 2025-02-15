import { SkeletonCard } from "./SkeletonCard";
import ContentCard from "./ContentCard";

const Content = ({ isLoading, data }: { isLoading: boolean; data: any }) => {
  if (isLoading) {
    return (
      <div className="flex p-4 mt-10">
        <div className="flex flex-row flex-wrap gap-4 justify-center items-center">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex p-4 mt-10">
        <div className="flex flex-row flex-wrap gap-4 justify-center items-center">
          {Array.from({ length: 9 }).map((_, index) => (
            <ContentCard key={index} />
          ))}
        </div>
      </div>
  );
};

export default Content;
