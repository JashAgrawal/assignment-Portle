"use client";
import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  ContentState,
  convertToRaw,
  convertFromRaw,
  Modifier,
  RawDraftContentState,
  ContentBlock,
  SelectionState,
  DraftComponent,
} from "draft-js";

const CustomEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(() => {
    // Load content from local storage on initial render
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(
        JSON.parse(savedContent) as RawDraftContentState
      );
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  const [isStyleActive, setIsStyleActive] = useState(false);
  const [tag, setTag] = useState("");

  const types = {
    "#": "header-one",
    "*": "BOLD",
    "**": "RED_LINE",
    "***": "UNDERLINE",
  };
  const getTypes = (type: string) => {
    if (type in types) {
      //@ts-ignore
      return types[type];
    }
    return "unstyled";
  };
  const handledChars = Object.keys(types);

  const blockStyleFunction = (contentBlock: ContentBlock) => {
    const type = contentBlock.getType();
    return type;
  };

  const removeChars = (editorState: EditorState, length: number) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    const blockText = currentBlock.getText();

    const newContent = Modifier.replaceText(
      currentContent,
      selection.merge({
        anchorOffset: 0,
        focusOffset: blockText.length,
      }),
      blockText.slice(length) // Remove the trigger character and space
    );
    const newEditorState = EditorState.push(
      editorState,
      newContent,
      "remove-range"
    );
    return newEditorState;
    // setEditorState(newEditorState);
  };

  const changeStyle = (editorState: EditorState, style: string) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const newContent = Modifier.setBlockType(currentContent, selection, style);

    const newEditorState = EditorState.push(
      editorState,
      newContent,
      "change-block-data"
    );
    return newEditorState;
    // setEditorState(newEditorState);
  };

  const reset = () => {
    setIsStyleActive(false);
    setTag("");
    setCurrentStyle("");
  };

  const handleBeforeInput = (char: string, editorState: EditorState) => {
    const currentOffset = editorState.getSelection().getStartOffset();
    const isKeyChar = char === "#" || char === "*";
    if (currentOffset === 0) {
      // reseting these to incase user need to change
      setTag("");
      setIsStyleActive(false);
      if (isKeyChar) {
        setIsStyleActive(true);
        setTag(char);
      }
    }

    if (isStyleActive && isKeyChar && currentOffset !== 0) {
      console.log("add to tag");
      setTag(tag + char);
    }

    if (isStyleActive && char === " ") {
      if (handledChars.includes(tag)) {
        const styleName = getTypes(tag);
        const ne = changeStyle(editorState, styleName);
        const nee = removeChars(ne, tag.length);
        setEditorState(nee);
        return "handled";
      }
    }
    return "not-handled";
  };

  const handleChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  };

  const handleReturn = (e: any, editorState: EditorState) => {
    reset();
    if (false) {
      return "handled";
    }
    return "not-handled";
  };

  const saveContentToLocalStorage = () => {
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    localStorage.setItem("editorContent", JSON.stringify(rawContentState));
  };

  useEffect(() => {
    reset();
  }, []);

  return (
    <>
      <div className="w-full h-full py-4 flex flex-col justify-between items-stretch">
        <div className="flex flex-row justify-between items-center border-b mx-12 px-4">
          <div />
          <h1>Demo Editor By Jash Agrawal</h1>
          <button
            className="px-8 py-2 border border-white rounded-xl my-4"
            onClick={() => saveContentToLocalStorage()}
          >
            Save
          </button>
        </div>
        <div className="border rounded-xl border-white h-96 mx-12 p-4">
          <Editor
            placeholder="Start typing from here"
            editorState={editorState}
            onChange={handleChange}
            handleBeforeInput={handleBeforeInput}
            blockStyleFn={blockStyleFunction}
            // customStyleMap={customStyles}
            handleReturn={(e, editorState) => handleReturn(e, editorState)}
          />
        </div>
      </div>
    </>
  );
};

export default CustomEditor;
