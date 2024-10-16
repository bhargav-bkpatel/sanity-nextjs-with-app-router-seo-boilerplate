import { CustomImageType } from "../lib";

export const resolveImage = (image?: CustomImageType) => {
  return image?.asset?.url ?? "";
};