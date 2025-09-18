interface Metadata {
  title?: string;
  authorsString?: string;
  authorsLink?: string;
  fandomList?: string[];
  rating?: Rating;
  category?: string;
  relationshipList?: string[];
  characterList?: string[];
  wordcount?: number;
  chapterCount?: number;
  chaptered?: boolean;
  chapters?: Chapter[];
}

export type WorkMetadata = Work & Metadata;

export interface ItemMapping {
  [originalItemName: string]: {
    mappedItem: string | null;
    manuallyMapped: boolean;
  };
}

export const getMappedItems = (
  items: string[],
  mapping: Record<string, string>
): ItemMapping => {
  const mappedItems = {};
  items?.forEach((item) => {
    const mappedItem = mapping[item];
    if (mappedItem) {
      mappedItems[item] = {
        mappedItem: mappedItem,
        manuallyMapped: false,
      };
    } else {
      mappedItems[item] = {
        mappedItem: null,
        manuallyMapped: true,
      };
    }
  });

  return mappedItems;
};
