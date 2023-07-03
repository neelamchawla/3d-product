/* eslint-disable react/no-unknown-property */
// import React, { useState, useEffect } from 'react';
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";

import state from "../store";
// import config from '../config/config';
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
  const [generatingImg, setGeneratingImg] = useState(false);

  const [activeEditorTab, setActiveEditorTab] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState({
    reactLogoShirt: true,
    threejsLogoShirt: false,
    pmndrsLogoShirt: false,
    logoShirt: false,
    stylishShirt: false,
  });
  const [open, setOpen] = useState(false);
  // show tab content depending on the activeTab
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
            generatingImg={generatingImg}
            handleSubmit={handleSubmit}
            open={open}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt) return alert("Please enter a prompt");

    try {
      setGeneratingImg(true);

      const response = await fetch("http://localhost:8080/api/v1/dalle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();
      console.log(type);
      console.log(data);
      console.log(response);
      // handleDecals(type, `data:image/png;base64,${data.photo}`)
    } catch (error) {
      alert(error);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  };

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleActiveFilterTab = (tabName) => {
    // console.log(tabName);
    // console.log(activeFilterTab);

    switch (tabName) {
      case "reactLogoShirt":
        if (tabName === "reactLogoShirt") {
          state.isLogoReact = !activeFilterTab[tabName];
          state.isLogoThree = false;
          state.isLogoPmndrs = false;
          state.isLogoTexture = false;
          setActiveFilterTab(activeFilterTab["reactLogoShirt"]);
          setActiveFilterTab(!activeFilterTab["threejsLogoShirt"]);
          setActiveFilterTab(!activeFilterTab["pmndrsLogoShirt"]);
          setActiveFilterTab(!activeFilterTab["logoShirt"]);
        }
        break;
      case "threejsLogoShirt":
        if (tabName === "threejsLogoShirt") {
          state.isLogoReact = false;
          state.isLogoThree = !activeFilterTab[tabName];
          state.isLogoPmndrs = false;
          state.isLogoTexture = false;
          setActiveFilterTab(!activeFilterTab["reactLogoShirt"]);
          setActiveFilterTab(activeFilterTab["threejsLogoShirt"]);
          setActiveFilterTab(!activeFilterTab["pmndrsLogoShirt"]);
          setActiveFilterTab(!activeFilterTab["logoShirt"]);
        }
        break;
      case "pmndrsLogoShirt":
        if (tabName === "pmndrsLogoShirt") {
          state.isLogoReact = false;
          state.isLogoThree = false;
          state.isLogoPmndrs = !activeFilterTab[tabName];
          state.isLogoTexture = false;
          setActiveFilterTab(!activeFilterTab["reactLogoShirt"]);
          setActiveFilterTab(!activeFilterTab["threejsLogoShirt"]);
          setActiveFilterTab(activeFilterTab["pmndrsLogoShirt"]);
          setActiveFilterTab(!activeFilterTab["logoShirt"]);
        }
        break;
      case "logoShirt":
        if (tabName === "logoShirt") {
          state.isLogoReact = false;
          state.isLogoThree = false;
          state.isLogoPmndrs = false;
          state.isLogoTexture = !activeFilterTab[tabName];
          setActiveFilterTab(!activeFilterTab["reactLogoShirt"]);
          setActiveFilterTab(!activeFilterTab["threejsLogoShirt"]);
          setActiveFilterTab(!activeFilterTab["pmndrsLogoShirt"]);
        }
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoReact = true;
        state.isLogoThree = false;
        state.isLogoPmndrs = false;
        state.isLogoTexture = false;
        state.isFullTexture = false;
        break;
    }

    // after setting the state, activeFilterTab is updated

    setActiveFilterTab((prevState) => {
      console.log(tabName);

      // if (tabName === "reactLogoShirt") {
      //   setActiveFilterTab(activeFilterTab["reactLogoShirt"])
      //   setActiveFilterTab(!activeFilterTab["threejsLogoShirt"])
      //   setActiveFilterTab(!activeFilterTab["logoShirt"])
      // }

      // else if (tabName === "threejsLogoShirt") {
      //   setActiveFilterTab(!activeFilterTab["reactLogoShirt"])
      //   setActiveFilterTab(activeFilterTab["threejsLogoShirt"])
      //   setActiveFilterTab(!activeFilterTab["pmndrsLogoShirt"])
      //   setActiveFilterTab(!activeFilterTab["logoShirt"])
      // }

      // else if (tabName === "pmndrsLogoShirt") {
      //   setActiveFilterTab(!activeFilterTab["reactLogoShirt"])
      //   setActiveFilterTab(!activeFilterTab["threejsLogoShirt"])
      //   setActiveFilterTab(activeFilterTab["pmndrsLogoShirt"])
      //   setActiveFilterTab(!activeFilterTab["logoShirt"])
      // }

      // else if (tabName === "logoShirt") {
      //   setActiveFilterTab(!activeFilterTab["reactLogoShirt"])
      //   setActiveFilterTab(!activeFilterTab["threejsLogoShirt"])
      //   setActiveFilterTab(!activeFilterTab["pmndrsLogoShirt"])
      //   // setActiveFilterTab(activeFilterTab["logoShirt"])
      // }

      return {
        ...prevState,
        [tabName]: !prevState[tabName],
      };
    });
  };

  const readFile = (type) => {
    reader(file).then((result) => {
      handleDecals(type, result);
      setActiveEditorTab("");
    });
  };

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          {/* left bar */}
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation("left")}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => {
                      setActiveEditorTab(tab.name);
                      setOpen(!open);
                    }}
                  />
                ))}
                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          {/* back button */}
          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => (state.intro = true)}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>

          {/* bottom buttons */}
          <motion.div
            className="filtertabs-container"
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <>
                <a
                  href="#"
                  class="transititext-primary text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                  data-te-toggle="tooltip"
                  title={tab.name}
                >
                  <Tab
                    key={tab.name}
                    tab={tab}
                    isFilterTab
                    isActiveTab={activeFilterTab[tab.name]}
                    handleClick={() => handleActiveFilterTab(tab.name)}
                  />
                </a>
              </>
            ))}

            <button
              className="download-btn"
              onClick={downloadCanvasToImage}
              class="transititext-primary text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
              data-te-toggle="tooltip"
              title="Download Image"
            >
              <img
                src={download}
                alt="download_image"
                className="w-5/12 h-3/5 object-contain"
              />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customizer;
