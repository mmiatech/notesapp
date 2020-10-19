import React, {useEffect, useReducer} from 'react';
import logo from './logo.svg';
import './App.css';

import { API } from 'aws-amplify';
import { List } from 'antd';
import 'antd/dist/antd.css';
import { listNotes } from './graphql/queries';



function App() {

  const initialState = {
    notes: []
    , loading: true
    , error: false
    , form: {name: '', description: ''}
  };

  const reducer = (state, action) => {
    switch(action.type) {
      case 'SET NOTES':
        return {
          ...state
          , notes: action.notes
          , loading: false
        }
      case 'ERROR':
        return {
          ...state
          , loading: false
          , error: true
        }
      default:
        return { ...state }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}


export default App;
