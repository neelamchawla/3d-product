/* eslint-disable react/prop-types */
import { useSnapshot } from "valtio";

import state from "../store";

const Tab = ({ tab, isFilterTab, isActiveTab, handleClick }) => {
  const snap = useSnapshot(state);

  const activeStyles =
    isFilterTab && isActiveTab
      ? { backgroundColor: snap.color, opacity: 0.5 }
      : { backgroundColor: "#6969694d", borderRadius: "50%", padding: "3px" };

  return (
    <div
      key={tab.name}
      className={`tab-btn ${
        isFilterTab ? "rounded-full glassmorphism" : "rounded-4"
      }`}
      onClick={handleClick}
      style={activeStyles}
    >
      <a
        href="#"
        className="transititext-primary text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
        data-te-toggle="tooltip"
        title={tab.title}
      >
        <img
          src={tab.icon}
          alt={tab.name}
          className={`${
            isFilterTab ? "w-2/3 h-2/3 ml-2" : "w-11/12 h-11/12 object-contain ml-[3px]"
          }`}
        />
      </a>
    </div>
  );
};

export default Tab;
