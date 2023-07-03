import { swatch, fileIcon, ai, pmndrsLogoShirt, reactLogoShirt, threejsLogoShirt, stylishShirt, logoShirt } from "../assets";

export const EditorTabs = [
  {
    name: "colorpicker",
    icon: swatch,
  },
  {
    name: "filepicker",
    icon: fileIcon,
  },
  {
    name: "aipicker",
    icon: ai,
  },
];

export const FilterTabs = [
  {
    name: "reactLogoShirt",
    icon: reactLogoShirt,
  },
  {
    name: "threejsLogoShirt",
    icon: threejsLogoShirt,
  },
  {
    name: "pmndrsLogoShirt",
    icon: pmndrsLogoShirt,
  },
  {
    name: "logoShirt",
    icon: logoShirt,
  },
  {
    name: "stylishShirt",
    icon: stylishShirt,
  },
];

export const DecalTypes = {
  logo: {
    stateProperty: "logoDecal",
    filterTab: "logoShirt",
  },
  full: {
    stateProperty: "fullDecal",
    filterTab: "stylishShirt",
  },
};
