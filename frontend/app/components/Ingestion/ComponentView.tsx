"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FileData, FileMap } from "./types";
import { FaTrash } from "react-icons/fa";
import { GoTriangleDown } from "react-icons/go";
import { IoAddCircleSharp } from "react-icons/io5";
import { CgDebug } from "react-icons/cg";

import UserModalComponent from "../Navigation/UserModal";
import { RAGConfig, RAGSetting, ConfigSetting } from "../RAG/types";
import { IoIosCheckmark } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";

import { statusTextMap } from "./types";

import { closeOnClick } from "./util";

export const MultiInput: React.FC<{
  component_name: string;
  values: string[];
  config_title: string;
  updateConfig: (
    component_n: string,
    configTitle: string,
    value: string | boolean | string[]
  ) => void;
}> = ({ values, config_title, updateConfig, component_name }) => {
  const [currentInput, setCurrentInput] = useState("");
  const [currentValues, setCurrentValues] = useState(values);

  useEffect(() => {
    updateConfig(component_name, config_title, currentValues);
  }, [currentValues]);

  const addValue = (v: string) => {
    if (!currentValues.includes(v)) {
      setCurrentValues((prev) => [...prev, v]);
      setCurrentInput("");
    }
  };

  const removeValue = (v: string) => {
    if (currentValues.includes(v)) {
      setCurrentValues((prev) => prev.filter((label) => label !== v));
    }
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex gap-2 justify-between">
        <label className="input flex items-center gap-2 w-full bg-bg-verba">
          <input
            type="text"
            className="grow w-full"
            value={currentInput}
            onChange={(e) => {
              setCurrentInput(e.target.value);
            }}
          />
        </label>
        <button
          onClick={() => {
            addValue(currentInput);
          }}
          className="btn btn-square bg-button-verba border-none hover:bg-secondary-verba text-text-verba"
        >
          <IoAddCircleSharp size={15} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {values.map((value, index) => (
          <div
            key={value + index}
            className="flex bg-bg-verba w-full p-2 text-center text-sm text-text-verba justify-between items-center rounded-xl"
          >
            <div className="flex w-full justify-center items-center">
              <p> {value}</p>
            </div>
            <button
              onClick={() => {
                removeValue(value);
              }}
              className="btn btn-sm btn-square bg-button-verba border-none hover:bg-warning-verba text-text-verba"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ComponentViewProps {
  RAGConfig: RAGConfig;
  component_name: "Chunker" | "Embedder" | "Reader" | "Generator" | "Retriever";
  selectComponent: (component_n: string, selected_component: string) => void;
  updateConfig: (
    component_n: string,
    configTitle: string,
    value: string | boolean | string[]
  ) => void;
}

const ComponentView: React.FC<ComponentViewProps> = ({
  RAGConfig,
  component_name,
  selectComponent,
  updateConfig,
}) => {
  function renderComponents(rag_config: RAGConfig) {
    return Object.entries(rag_config[component_name].components).map(
      ([key, component]) => (
        <li
          key={"ComponentDropdown_" + component.name}
          onClick={() => {
            selectComponent(component_name, component.name);
            closeOnClick();
          }}
        >
          <a>{component.name}</a>
        </li>
      )
    );
  }
  function renderConfigOptions(rag_config: RAGConfig, configKey: string) {
    return rag_config[component_name].components[
      rag_config[component_name].selected
    ].config[configKey].values.map((configValue) => (
      <li
        key={"ConfigValue" + configValue}
        onClick={() => {
          updateConfig(component_name, configKey, configValue);
          closeOnClick();
        }}
      >
        <a>{configValue}</a>
      </li>
    ));
  }

  return (
    <div className="flex flex-col justify-start gap-3 rounded-2xl p-1 w-full ">
      <div className="divider text-text-alt-verba">{component_name}</div>
      {/* Component */}
      <div className="flex gap-2 justify-between items-center text-text-verba">
        <p className="flex min-w-[8vw]">{component_name}</p>
        <div className="dropdown dropdown-bottom flex justify-start items-center w-full">
          <button
            tabIndex={0}
            role="button"
            className="btn bg-button-verba hover:bg-button-hover-verba text-text-verba w-full flex justify-start border-none"
          >
            <GoTriangleDown size={15} />
            <p>{RAGConfig[component_name].selected}</p>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow"
          >
            {renderComponents(RAGConfig)}
          </ul>
        </div>
      </div>

      <div className="flex gap-2 items-center text-text-verba">
        <p className="flex min-w-[8vw]"></p>
        <p className="text-sm text-text-alt-verba text-start">
          {
            RAGConfig[component_name].components[
              RAGConfig[component_name].selected
            ].description
          }
        </p>
      </div>

      {Object.entries(
        RAGConfig[component_name].components[RAGConfig[component_name].selected]
          .config
      ).map(([configTitle, config]) => (
        <div key={"Configuration" + configTitle + component_name}>
          <div className="flex gap-3 justify-between items-center text-text-verba">
            <p className="flex min-w-[8vw]">{configTitle}</p>

            {/* Dropdown */}
            {config.type === "dropdown" && (
              <div className="dropdown dropdown-bottom flex justify-start items-center w-full">
                <button
                  tabIndex={0}
                  role="button"
                  className="btn bg-button-verba hover:bg-button-hover-verba text-text-verba w-full flex justify-start border-none"
                >
                  <GoTriangleDown size={15} />
                  <p>{config.value}</p>
                </button>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 max-h-[20vh] overflow-auto rounded-box z-[1] w-full p-2 shadow"
                >
                  {renderConfigOptions(RAGConfig, configTitle)}
                </ul>
              </div>
            )}

            {/* Text Input */}
            {typeof config.value != "boolean" &&
              ["text", "number", "password"].includes(config.type) && (
                <label className="input flex items-center gap-2 w-full bg-bg-verba">
                  <input
                    type={config.type}
                    className="grow w-full"
                    value={config.value}
                    onChange={(e) => {
                      updateConfig(component_name, configTitle, e.target.value);
                    }}
                  />
                </label>
              )}

            {/* Multi Input */}
            {typeof config.value != "boolean" && config.type == "multi" && (
              <MultiInput
                component_name={component_name}
                values={config.values}
                config_title={configTitle}
                updateConfig={updateConfig}
              />
            )}

            {/* Checkbox Input */}
            {typeof config.value === "boolean" && (
              <input
                type="checkbox"
                className="checkbox checkbox-md"
                onChange={(e) =>
                  updateConfig(
                    component_name,
                    configTitle,
                    (e.target as HTMLInputElement).checked
                  )
                }
                checked={config.value}
              />
            )}
          </div>
          <div className="flex gap-2 items-center text-text-verba">
            <p className="flex min-w-[8vw]"></p>
            <p className="text-sm text-text-alt-verba text-start">
              {config.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComponentView;