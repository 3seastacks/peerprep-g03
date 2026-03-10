import { useNavigate } from 'react-router-dom';
import { TextArea, Card, Button} from '../../../../components'
import { TextField as MuiTextField} from '@mui/material';
import { darkBlue } from '../../../../commons';
import { useSelector, useDispatch } from 'react-redux';
import { reset } from '../../../../features/User/Collaboration/collaborationSlice';
import { postAttempt } from '../../../../services/Attempts'

import { useState, useRef } from 'react'
import Editor from "@monaco-editor/react"
import * as Y from "yjs"
import { MonacoBinding } from "y-monaco"

export function Code() {
    type RootState = {
    collaboration: any
    authentication: any
    }

    const {
        value: collabValue,
        stateStatus: collabStatus
    } = useSelector((state: RootState) => state.collaboration);

    const {
        value: authValue,
        stateStatus: authStatus
    } = useSelector((state: RootState) => state.authentication);

    const partner: string = collabValue.partner

    const havePartner : boolean = !!partner
    const message: string = havePartner ? "Participants: " + partner + " and you": "Private Room"
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleQuitClick = () => {
        dispatch(reset())
        navigate('/start');
    };

    const handleSubmitClick = () => {
        const question: string = collabValue.question
        const partner: string = collabValue.partner
        const timestamp = new Date().toISOString();
        const username: string = authValue.username
        postAttempt(timestamp, username, partner, question, "Sample code")
        dispatch(reset())
        navigate('/start');
    };

    const editorRef = useRef(null);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        console.log(editorRef.current); // should log the editor instance
        // Initialize YJS
        const doc = new Y.Doc(); // a collection of shared objects -> Text
        // Connect to peers (or start connection) with WebRTC
        const type = doc.getText("monaco"); // doc { "monaco": "what our IDE is showing" }
        // Bind YJS to Monaco 
        const binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]));
    }

    return (
        <div className="flex flex-col h-screen p-2 py-4">
            <p style={{ color: darkBlue }} className= "text-right"> {message} </p>
            <div className="rounded-lg overflow-hidden order border-black border-1">
                <Editor
                    height="350px"
                    theme="vs"
                    onMount={handleEditorDidMount}
                    options={{
                        automaticLayout: true,
                        lineNumbersMinChars: 2,
                        lineDecorationsWidth: 0,
                    }}
                />
            </div>
            
            <div className="flex justify-end py-5 gap-x-10">
                <Button label = "Quit" onClick = {handleQuitClick}/>
                <Button label = "Submit" onClick = {handleSubmitClick}/>
            </div>
            </div>
    );
}

//           <MuiTextField multiline rows = {15}/>
/*
<div className="flex-1 max-h-[60vh] mb-2">
                <Editor
                    theme="vs-dark"
                    onMount={handleEditorDidMount}
                    className="h-full w-full"
                    />
            </div>
            */
