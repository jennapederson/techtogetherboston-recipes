import React, { useState } from 'react';
import { css } from 'emotion';
import { v4 as uuid } from 'uuid';
import { API, Auth, Storage } from 'aws-amplify';
import { createRecipe, updateRecipe } from './graphql/mutations';

/* Initial state to hold form input, saving state */
const initialState = {
  name: '',
  instructions: '',
  image: {},
  file: '',
  saving: false
};

export default function CreateRecipe({
  updateOverlayVisibility, updateRecipes, recipes
}) {
  /* 1. Create local state with useState hook */
  const [formState, updateFormState] = useState(initialState)

  /* 2. onChangeText handler updates the form state when a user types into a form field */
  function onChangeText(e) {
    e.persist();
    updateFormState(currentState => ({ ...currentState, [e.target.name]: e.target.value }));
  }

  /* 3. onChangeFile handler will be fired when a user uploads a file  */
  function onChangeFile(e) {
    e.persist();
    if (! e.target.files[0]) return;
    const image = { fileInfo: e.target.files[0], name: `${e.target.files[0].name}_${uuid()}`}
    updateFormState(currentState => ({ ...currentState, file: URL.createObjectURL(e.target.files[0]), image }))
  }

  /* 4. Save the recipe  */
  async function save() {
    try {
      const { name, instructions, image } = formState;
      if (!name || !instructions || !image) return;
      updateFormState(currentState => ({ ...currentState, saving: true }));
      const recipeId = uuid();
      const { username } = await Auth.currentAuthenticatedUser();
      const recipeInfo = { name, instructions, id: recipeId, owner: username, image: formState.image.name };

      await Storage.put(formState.image.name, formState.image.fileInfo);

      await API.graphql({
        query: createRecipe,
        variables: { input: recipeInfo },
      });
      updateRecipes([...recipes, { ...recipeInfo, image: formState.file }]);
      updateFormState(currentState => ({ ...currentState, saving: false }));
      updateOverlayVisibility(false);
    } catch (err) {
      console.log('error: ', err);
    }
  }

  return (
    <div className={containerStyle}>
      <input
        placeholder="Recipe name"
        name="name"
        className={inputStyle}
        onChange={onChangeText}
      />
      <textarea
        placeholder="Instructions"
        name="instructions"
        className={inputStyle}
        onChange={onChangeText}
      />
      {/* image file upload /> */}
      <input
        type="file"
        onChange={onChangeFile}
      />
      { formState.file && <img className={imageStyle} alt="preview" src={formState.file} /> }
      <button className={buttonStyle} onClick={save}>
        Create New Recipe
      </button>
      <button className={buttonStyle} onClick={() => updateOverlayVisibility(false)}>
        Cancel
      </button>
      { formState.saving && <p className={savingMessageStyle}>Saving recipe...</p> }
    </div>
  )
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 420px;
  position: fixed;
  left: 0;
  border-radius: 4px;
  top: 0;
  margin-left: calc(50vw - 220px);
  margin-top: calc(50vh - 230px);
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0.125rem 0.25rem;
  padding: 20px;
`

const inputStyle = css`
  margin-bottom: 10px;
  outline: none;
  padding: 7px;
  border: 1px solid #ddd;
  font-size: 16px;
  border-radius: 4px;
`

const buttonStyle = css`
  background-color: #363e95;
  color: white;
  border: none;
  outline: none;
  margin: 10px 0;
  padding: 10px;
  cursor: pointer;
  :hover {
    background-color: #181d46;
  }
`

const savingMessageStyle = css`
  margin-bottom: 0px;
`

const imageStyle = css`
  height: 120px;
  margin: 10px 0px;
  object-fit: contain;
`