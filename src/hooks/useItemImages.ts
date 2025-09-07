import { useMemo } from 'react';
import itemImages from '../data/itemImages.json';

export interface ItemImageData {
  imageMap: Record<string, string>;
  categories: Array<{
    name: string;
    images: string[];
  }>;
  itemNameToImage: Record<string, string>;
}

export const useItemImages = () => {
  const imageData = useMemo(() => itemImages as ItemImageData, []);

  const getImageUrl = (imageKey: string): string => {
    const filename = imageData.imageMap[imageKey];
    if (!filename) return '';
    const basePath = import.meta.env.BASE_URL || '/';
    return `${basePath}Items/${filename}`;
  };

  const getImageOptions = (category?: string) => {
    if (category) {
      const categoryData = imageData.categories.find(cat => 
        cat.name.toLowerCase() === category.toLowerCase()
      );
      return categoryData?.images || [];
    }
    
    // Return all images if no category specified
    return Object.keys(imageData.imageMap);
  };

  const getAllImageOptions = () => {
    return Object.keys(imageData.imageMap).map(key => ({
      key,
      filename: imageData.imageMap[key],
      url: getImageUrl(key),
      displayName: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  };

  const getImageOptionsByCategory = () => {
    return imageData.categories.map(category => ({
      ...category,
      options: category.images.map(key => ({
        key,
        filename: imageData.imageMap[key],
        url: getImageUrl(key),
        displayName: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))
    }));
  };

  return {
    getImageUrl,
    getImageOptions,
    getAllImageOptions,
    getImageOptionsByCategory,
    imageData
  };
};