"use client";

import React, { useState, useEffect, use } from "react";
import { FileData, FileMap } from "./types";
import { FaTrash } from "react-icons/fa";
import { GoTriangleDown } from "react-icons/go";

import UserModalComponent from "../Navigation/UserModal";
import { RAGConfig } from "../RAG/types";
import { IoIosCheckmark } from "react-icons/io";
import { MdModeEdit } from "react-icons/md";

import { closeOnClick } from "./util";

interface FileComponentProps {
  fileData: FileData;
  fileMap: FileMap;
  setFileMap: (f: FileMap) => void;
  handleDeleteFile: (name: string) => void;
  selectedFileData: string | null;
  setSelectedFileData: (f: string | null) => void;
}

const FileComponent: React.FC<FileComponentProps> = ({
  fileData,
  fileMap,
  setFileMap,
  handleDeleteFile,
  selectedFileData,
  setSelectedFileData,
}) => {
  const [URLValue, setURLValue] = useState("");
  const [editURL, setEditURL] = useState(true);

  useEffect(() => {
    if (selectedFileData) {
      if (fileMap[selectedFileData].isURL) {
        setURLValue(
          fileMap[selectedFileData].content
            ? fileMap[selectedFileData].content
            : ""
        );
      }
    }
  }, [fileMap, selectedFileData]);

  const openDeleteModal = () => {
    const modal = document.getElementById(
      "remove_file_" + fileMap[fileData.fileID].filename
    );
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  const switchEditMode = () => {
    if (editURL) {
      const newFileData: FileData = JSON.parse(
        JSON.stringify(fileMap[fileData.fileID])
      );
      newFileData.content = URLValue;
      const newFileMap: FileMap = { ...fileMap };
      newFileMap[fileData.fileID] = newFileData;
      setFileMap(newFileMap);
    }

    setEditURL((prevState) => !prevState);
  };

  const changeReader = (r: string) => {
    const newFileData: FileData = JSON.parse(
      JSON.stringify(fileMap[fileData.fileID])
    );
    const newRAGConfig: RAGConfig = JSON.parse(
      JSON.stringify(fileMap[fileData.fileID].rag_config)
    );
    newRAGConfig["Reader"].selected = r;
    newFileData.rag_config = newRAGConfig;
    const newFileMap: FileMap = { ...fileMap };
    newFileMap[fileData.fileID] = newFileData;
    setFileMap(newFileMap);

    if (
      selectedFileData &&
      selectedFileData === fileMap[fileData.fileID].filename
    ) {
      setSelectedFileData(fileData.fileID);
    }
  };

  function renderUploadComponents(
    rag_config: RAGConfig,
    changeReader: (r: string) => void,
    closeOnClick: () => void,
    filter: "FILE" | "URL"
  ) {
    return Object.entries(rag_config["Reader"].components)
      .filter(([key, component]) => component.type === filter)
      .map(([key, component]) => (
        <li
          key={"Dropdown_" + component.name}
          onClick={() => {
            changeReader(component.name);
            closeOnClick();
          }}
        >
          <a>{component.name}</a>
        </li>
      ));
  }

  return (
    <div className="flex justify-between items-center gap-2 rounded-2xl p-1 w-full">
      <div
        className="dropdown dropdown-bottom flex justify-start items-center min-w-[11vw] tooltip tooltip-right"
        data-tip={
          fileMap[fileData.fileID].rag_config["Reader"].components[
            fileMap[fileData.fileID].rag_config["Reader"].selected
          ].description
        }
      >
        <button
          tabIndex={0}
          role="button"
          className="btn bg-button-verba hover:bg-button-hover-verba text-text-verba w-full flex justify-start border-none"
        >
          <GoTriangleDown size={15} />
          <p>{fileMap[fileData.fileID].rag_config["Reader"].selected}</p>
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
        >
          {fileMap[fileData.fileID].isURL
            ? renderUploadComponents(
                fileMap[fileData.fileID].rag_config,
                changeReader,
                closeOnClick,
                "URL"
              )
            : renderUploadComponents(
                fileMap[fileData.fileID].rag_config,
                changeReader,
                closeOnClick,
                "FILE"
              )}
        </ul>
      </div>

      {/* If is not URL Component */}
      {!fileMap[fileData.fileID].isURL && (
        <button
          onClick={() => {
            setSelectedFileData(fileData.fileID);
          }}
          className={`flex ${selectedFileData && selectedFileData === fileMap[fileData.fileID].fileID ? "bg-secondary-verba hover:bg-button-hover-verba" : "bg-button-verba hover:bg-secondary-verba"}  w-full p-3 rounded-lg transition-colors duration-300 ease-in-out border-none`}
        >
          <p className="text-text-verba">{fileMap[fileData.fileID].filename}</p>
        </button>
      )}

      {/* If is URL Component and edit mode */}
      {fileMap[fileData.fileID].isURL && editURL && (
        <div className="flex items-center justify-center gap-2 w-full">
          <label className="input flex items-center gap-2 w-full bg-bg-verba">
            <input
              type="text"
              className="grow w-full"
              placeholder={
                "Enter " +
                fileMap[fileData.fileID].rag_config["Reader"].selected +
                " URL here"
              }
              value={URLValue}
              onChange={(e) => {
                setURLValue(e.target.value);
              }}
            />
          </label>
        </div>
      )}

      {fileMap[fileData.fileID].isURL && !editURL && (
        <button
          onClick={() => {
            setSelectedFileData(fileData.fileID);
          }}
          className={`flex ${selectedFileData && selectedFileData === fileMap[fileData.fileID].fileID ? "bg-secondary-verba hover:bg-button-hover-verba" : "bg-button-verba hover:bg-secondary-verba"}  w-full p-3 rounded-lg transition-colors duration-300 ease-in-out border-none`}
        >
          <p className="text-text-verba">{URLValue}</p>
        </button>
      )}

      {fileMap[fileData.fileID].isURL && (
        <div className="flex justify-end items-center">
          <button
            onClick={switchEditMode}
            className="btn btn-square border-none bg-button-verba hover:bg-secondary-verba text-text-verba"
          >
            {editURL ? <IoIosCheckmark size={20} /> : <MdModeEdit size={15} />}
          </button>
        </div>
      )}

      <div className="flex justify-end items-center">
        <button
          onClick={openDeleteModal}
          className="btn btn-square bg-button-verba border-none hover:bg-warning-verba text-text-verba"
        >
          <FaTrash size={15} />
        </button>
      </div>
      <UserModalComponent
        modal_id={"remove_file_" + fileMap[fileData.fileID].filename}
        title={"Remove File"}
        text={
          fileMap[fileData.fileID].isURL
            ? "Do you want to remove the URL?"
            : "Do you want to remove " +
              fileMap[fileData.fileID].filename +
              " from the selection?"
        }
        triggerString="Delete"
        triggerValue={fileMap[fileData.fileID].fileID}
        triggerAccept={handleDeleteFile}
      />
    </div>
  );
};

export default FileComponent;