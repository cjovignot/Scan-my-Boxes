import { useCloudinaryImage } from "../../hooks/useCloudinaryImage";

export interface ContentItem {
  _id: string;
  name: string;
  quantity?: number;
  picture?: string;
}

const BoxDetailsItem = ({ item }: { item: ContentItem }) => {
  const { src: optimizedPic } = useCloudinaryImage(item.picture, { w: 200 });

  return (
    <li className="flex items-start justify-start gap-3 px-3 py-2 text-sm text-gray-200 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between w-full">
        <div className="flex">
          {item.picture && (
            <img
              src={optimizedPic}
              alt={item.name}
              className="object-cover w-20 h-20 border border-gray-700 rounded-lg"
            />
          )}
          <span className="ml-3 font-medium text-yellow-400 text-md">
            {item.name}
          </span>
        </div>

        {item.quantity && (
          <span className="h-full p-2 text-xl text-gray-300">
            x{item.quantity}
          </span>
        )}
      </div>
    </li>
  );
};

export default BoxDetailsItem;
