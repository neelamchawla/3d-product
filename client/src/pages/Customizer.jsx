import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";

import state from "../store";
import config from "../config/config";
import { generateAIImage } from "../config/imageApi";
import { download } from "../assets";
import { downloadCanvasToImage } from "../config/helpers";
import { reader } from "../config/helpers";
import { EditorTabs, FilterTabs, DecalTypes } from "../config/constants";
import { fadeAnimation, slideAnimation } from "../config/motion";
import {
  AIPicker,
  ColorPicker,
  CustomButton,
  FilePicker,
  Tab,
} from "../components";

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState("");

  const [prompt, setPrompt] = useState("");

  const [activeEditorTab, setActiveEditorTab] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState({
    reactLogoShirt: true,
    threejsLogoShirt: false,
    pmndrsLogoShirt: false,
    logoShirt: false,
    stylishShirt: false,
  });
  const [open, setOpen] = useState(false);

  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker open={open} />;
      case "filepicker":
        return (
          <FilePicker
            file={file}
            setFile={setFile}
            readFile={readFile}
            open={open}
          />
        );
      case "aipicker":
        return (
          <AIPicker
            prompt={prompt}
            setPrompt={setPrompt}
            generatingImg={snap.isGenerating}
            handleSubmit={handleSubmit}
            open={open}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    const backendUrl = import.meta.env.DEV
      ? config.development.backendUrl
      : config.production.backendUrl;

    try {
      state.isGenerating = true;
      state.generatingType = type;

      const data = await generateAIImage(backendUrl, prompt.trim(), type);

      if (!data?.photo) {
        throw new Error("No image was returned");
      }

      handleDecals(type, `data:${data.mimeType || "image/png"};base64,${data.photo}`);
    } catch (error) {
      alert(error.message || "Failed to generate image");
    } finally {
      state.isGenerating = false;
      closeEditorPanel();
    }
  };

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];
    if (!decalType) {
      console.error(`Unknown decal type: ${type}`);
      return;
    }

    state[decalType.stateProperty] = result;

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleEditorTabClick = (tabName) => {
    if (activeEditorTab === tabName && open) {
      setOpen(false);
      setActiveEditorTab("");
      return;
    }

    setActiveEditorTab(tabName);
    setOpen(true);
  };

  const closeEditorPanel = () => {
    setActiveEditorTab("");
    setOpen(false);
  };

  const handleActiveFilterTab = (tabName) => {
    if (activeFilterTab[tabName]) {
      return;
    }

    setActiveFilterTab({
      reactLogoShirt: tabName === "reactLogoShirt",
      threejsLogoShirt: tabName === "threejsLogoShirt",
      pmndrsLogoShirt: tabName === "pmndrsLogoShirt",
      logoShirt: tabName === "logoShirt",
      stylishShirt: tabName === "stylishShirt",
    });

    state.isLogoReact = tabName === "reactLogoShirt";
    state.isLogoThree = tabName === "threejsLogoShirt";
    state.isLogoPmndrs = tabName === "pmndrsLogoShirt";
    state.isLogoTexture = tabName === "logoShirt";
    state.isFullTexture = tabName === "stylishShirt";
  };

  const readFile = (type) => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    reader(file)
      .then((result) => {
        handleDecals(type, result);
        closeEditorPanel();
      })
      .catch((error) => {
        alert(error.message || "Failed to read file");
      });
  };

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            aria-label="Editor tools"
            {...slideAnimation("left")}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs" role="toolbar" aria-label="Design tools">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    isActiveEditor={activeEditorTab === tab.name && open}
                    handleClick={() => handleEditorTabClick(tab.name)}
                  />
                ))}
                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => { state.intro = true; }}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>

          <motion.div
            className="filtertabs-container"
            role="toolbar"
            aria-label="Shirt style filters"
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />
            ))}

            <button
              type="button"
              onClick={downloadCanvasToImage}
              className="download-btn"
              aria-label="Download shirt design as image"
              title="Download Image"
            >
              <img
                src={download}
                alt=""
                aria-hidden="true"
                className="w-3/4 h-3/5 object-contain"
              />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customizer;
