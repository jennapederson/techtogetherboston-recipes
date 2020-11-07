import React, { useState, useEffect } from 'react'
import { css } from 'emotion';
import { useParams } from 'react-router-dom';
import { API, Storage } from 'aws-amplify';
import { getRecipe } from './graphql/queries';

export default function Recipe() {
  const [loading, updateLoading] = useState(true);
  const [recipe, updateRecipe] = useState(null);
  const { id } = useParams()
  useEffect(() => {
    fetchRecipe()
  }, [])
  async function fetchRecipe() {
    try {
      const recipeData = await API.graphql({
        query: getRecipe, variables: { id }
      });
      const currentRecipe = recipeData.data.getRecipe
      if (currentRecipe.image) {
        const image = await Storage.get(currentRecipe.image);
        currentRecipe.image = image;
      }
      updateRecipe(currentRecipe);
      updateLoading(false);
    } catch (err) {
      console.log('error: ', err)
    }
  }
  if (loading) return <h3>Loading...</h3>
  return (
    <>
      <h1 className={titleStyle}>{recipe.name}</h1>
      <p>posted by @{recipe.owner}</p>
      <p>{recipe.instructions}</p>
      { recipe.image && (
        <img alt="recipe" src={recipe.image} className={imageStyle} />
      )}
    </>
  )
}

const titleStyle = css`
  margin-bottom: 7px;
  color: #181d46;
`

const imageStyle = css`
  max-width: 500px;
  @media (max-width: 500px) {
    width: 100%;
  }
`