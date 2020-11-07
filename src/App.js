import React, { useState, useEffect } from "react";
import {
  HashRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { css } from 'emotion';
import { API, Auth } from 'aws-amplify';
import { listRecipes } from './graphql/queries';

function Router() {
  /* create a couple of pieces of initial state */
  const [showOverlay, updateOverlayVisibility] = useState(false);
  const [recipes, updateRecipes] = useState([]);
  const [myRecipes, updateMyRecipes] = useState([]);

  /* fetch recipes when component loads */
  useEffect(() => {
      fetchRecipes();
  }, []);
  async function fetchRecipes() {
    /* query the API, ask for 100 items */
    let recipeData = await API.graphql({ query: listRecipes, variables: { limit: 100 }});
    let recipesArray = recipeData.data.listRecipes.items;
    /* update the recipe array in the local state */
    setRecipeState(recipesArray);
  }
  async function setRecipeState(recipesArray) {
    const user = await Auth.currentAuthenticatedUser();
    const myRecipeData = recipesArray.filter(r => r.owner === user.username);
    updateMyRecipes(myRecipeData);
    updateRecipes(recipesArray);
  }
  return (
    <>
      <HashRouter>
          <div className={contentStyle}>
            <div className={headerContainer}>
              <h1 className={headerStyle}>Recipes</h1>
              <Link to="/" className={linkStyle}>All Recipes</Link>
              <Link to="/myrecipes" className={linkStyle}>My Recipes</Link>
            </div>
            <hr className={dividerStyle} />
            <button className={buttonStyle} onClick={() => updateOverlayVisibility(true)}>
              New Recipe
            </button>
            <Switch>
              <Route exact path="/" >
                {
                  recipes.map(recipe => (
                    <Link to={`/recipe/${recipe.id}`} className={linkStyle} key={recipe.id}>
                      <div key={recipe.id} className={recipeContainer}>
                        <h1 className={recipeTitleStyle}>{recipe.name}</h1>
                        <p>posted by @{recipe.owner}</p>
                        <p className={recipeInstructionsStyle}>{recipe.instructions}</p>
                      </div>
                    </Link>
                  ))
                }
              </Route>
              <Route exact path="/myrecipes" >
                {
                  myRecipes.map(recipe => (
                    <Link to={`/recipe/${recipe.id}`} className={linkStyle} key={recipe.id}>
                      <div key={recipe.id} className={recipeContainer}>
                        <h1 className={recipeTitleStyle}>{recipe.name}</h1>
                        <p className={recipeInstructionsStyle}>{recipe.instructions}</p>
                      </div>
                    </Link>
                  ))
                }
              </Route>
            </Switch>
          </div>
          <AmplifySignOut />
        </HashRouter>
    </>
  );
}

export default withAuthenticator(Router);

const contentStyle = css`
  min-height: calc(100vh - 45px);
  padding: 0px 40px;
`

const headerContainer = css`
  padding-top: 20px;
`

const headerStyle = css`
  font-size: 40px;
  margin-top: 0px;
  color: #181d46;
`

const linkStyle = css`
  color: #181d46;
  font-weight: bold;
  text-decoration: none;
  margin-right: 10px;
  :hover {
    color: #363e95;
  }
`

const dividerStyle = css`
  margin-top: 15px;
`

const recipeTitleStyle = css`
  margin: 15px 0px;
  color: #181d46;
`

const recipeContainer = css`
  border-radius: 10px;
  padding: 1px 20px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  :hover {
    border-color: #181d46;
  }
`

const recipeInstructionsStyle = css`
  font-weight: normal;
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

const imageStyle = css`
  height: 120px;
  margin: 10px 0px;
  object-fit: contain;
`