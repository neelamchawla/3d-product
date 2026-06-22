/* eslint-disable react/prop-types */
import { useSnapshot } from "valtio";

import state from "../store";

const Tab = ({ tab, isFilterTab, isActiveTab, isActiveEditor, handleClick }) => {
  const snap = useSnapshot(state);

  const filterActiveStyle =
    isFilterTab && isActiveTab
      ? {
          backgroundColor: `${snap.color}20`,
          borderColor: snap.color,
          boxShadow: `0 8px 24px -6px ${snap.color}55, 0 0 0 2px #fff, 0 0 0 4px ${snap.color}`,
        }
      : undefined;

  const editorClass = isFilterTab
    ? ""
    : `tab-btn-editor ${isActiveEditor ? "tab-btn-editor-active" : ""}`;

  const filterClass = isFilterTab
    ? `tab-btn-filter ${isActiveTab ? "tab-btn-filter-active" : ""}`
    : "";

  return (
    <button
      type="button"
      className={`tab-btn ${isFilterTab ? filterClass : editorClass}`}
      onClick={handleClick}
      style={filterActiveStyle}
      aria-label={tab.title}
      aria-pressed={isFilterTab ? Boolean(isActiveTab) : undefined}
      aria-current={isActiveEditor ? "true" : undefined}
      title={tab.title}
    >
      <img
        src={tab.icon}
        alt=""
        aria-hidden="true"
        className={isFilterTab ? "tab-icon-filter" : "tab-icon-editor"}
        draggable={false}
      />
    </button>
  );
};

export default Tab;
