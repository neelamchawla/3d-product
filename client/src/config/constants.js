import { swatch, fileIcon, ai, pmndrsLogoShirt, reactLogoShirt, threejsLogoShirt, stylishShirt, logoShirt } from "../assets";

export const EditorTabs = [
  {
    name: "colorpicker",
    title: "Color Picker",
    icon: swatch,
  },
  {
    name: "filepicker",
    title: "File Picker",
    icon: fileIcon,
  },
  {
    name: "aipicker",
    title: "AI Picker",
    icon: ai,
  },
];

export const FilterTabs = [
  {
    name: "reactLogoShirt",
    title: "React Logo",
    icon: reactLogoShirt,
  },
  {
    name: "threejsLogoShirt",
    title: "ThreeJs Logo",
    icon: threejsLogoShirt,
  },
  {
    name: "pmndrsLogoShirt",
    title: "PMNDRS Logo",
    icon: pmndrsLogoShirt,
  },
  {
    name: "logoShirt",
    title: "Stylish Logo",
    icon: logoShirt,
  },
  {
    name: "stylishShirt",
    title: "Stylish Full TShirt",
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
