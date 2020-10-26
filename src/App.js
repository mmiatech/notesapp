import React, {useEffect, useReducer} from 'react';
import logo from './logo.svg';
import './App.css';

import { API } from 'aws-amplify';
import { List, Input, Button } from 'antd';
import 'antd/dist/antd.css';
import { listNotes } from './graphql/queries';

import { v4 as uuid } from 'uuid';
import {
  createNote as CreateNote
  , deleteNote as DeleteNote
} from './graphql/mutations';

const CLIENT_ID = uuid();
//console.log(CLIENT_ID);

const App = () => {

  const initialState = {
    notes: []
    , loading: true
    , error: false
    , form: {name: '', description: ''}
  };

  const reducer = (state, action) => {
    switch(action.type) {
      case 'SET_NOTES':
        return {
          ...state
          , notes: action.notes
          , loading: false
        }

      case 'ADD_NOTE':
        return {
          ...state
          , notes: [
            ...state.notes
            , action.note
          ]
        }

      case 'RESET_FORM':
        return {
          ...state
          , form: initialState.form
        }

      case 'SET_INPUT':
        return {
          ...state
          , form: {
            ...state.form
            , [action.name]: action.value
          }
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

  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchNotes = async () => {
    try {
      const notesData = await API.graphql({
        query: listNotes
      });

      dispatch({
        type: 'SET_NOTES'
        , notes: notesData.data.listNotes.items
      });
    }
    
    catch (err) {
      console.error(err);
      dispatch({
        type: 'ERROR'
      });
    }
  }

  const createNote = async () => {
    const { form } = state;

    if ( !form.name || !form.description) {
      return alert('Please enter a name and description')
    };

    const note = {
      ...form
      , clientId: CLIENT_ID
      , completed: false
      , id: uuid()
    };

    dispatch ({
      type: 'ADD_NOTE'
      , note //shorthand for note: note, prop w/ same name is its value
    });

    dispatch ({
      type: 'RESET_FORM'
    });

    try {
      await API.graphql ({
        query: CreateNote
        , variables: { input: note }
      });
      console.log('successfully created note!');
    }

    catch (err) {
      console.error(err);
    }
  }

  const deleteNote = async ({ id }) => {
    const index = state.notes.findIndex(n => n.id === id);

    const notes = [
      ...state.notes.slice(0, index)
      , ...state.notes.slice(index + 1)
    ];

    dispatch({
      type: 'SET_NOTES'
      , notes
    });

    try {
      await API.graphql({
        query: DeleteNote
        , variables: { input: { id } }
      });
      console.log('successfully deleted note!')
    }
    
    catch (err) {
        console.error({ err });
    }
  }

  const onChange = (e) => {
    dispatch({
      type: 'SET_INPUT'
      , name: e.target.name
      , value: e.target.value
    });
  }

  useEffect (
    () => {
     fetchNotes();
    }
    , []
  );

  const styles = {
    container: { padding: 20 },
    input: { marginBottom: 10 },
    item: { textAlign: 'left' },
    p: { color: '#1890ff' }
  }

  const renderItem = (item) => {
    return(
      <List.Item
        style={styles.item}
        actions={[
          <p
            style={styles.p}
            onClick={() => deleteNote(item)}
          >
            Delete
          </p>
        ]}
      >
        <List.Item.Meta
          title={item.name}
          description={item.description}
        >
        </List.Item.Meta>
      </List.Item>
    );
  }

  return (
    <div style={styles.container}>
      <Input
        style={styles.input}
        onChange={onChange}
        placeholder='Note Name'
        name='name'
        value={state.form.name}
      />
      <Input
        style={styles.input}
        onChange={onChange}
        placeholder='Note Description'
        name='description'
        value={state.form.description}
      />
      <Button
        onClick={createNote}
        type='primary'
      >
        Create New Note
      </Button>
      <List
        loading={state.loading}
        dataSource={state.notes}
        renderItem={renderItem}
      />
    </div>
  );
}


export default App;
