// Global app controller
import Search from './model/Search';
import Recipe from './model/Recipe';
import * as searchView from './views/SearchView';
import * as recipeView from './views/recipeView';
import {elements, renderLoader, clearLoader} from './views/base';



//const search = new Search('pizza');
const state = {};

const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes
            await state.search.getResults();
    
            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something wrong with the search...');
            clearLoader();
        }
    }
}
    
elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }

});

/** 
 * Recipe Controller
 */
const controlRecipe = async () =>{
   // Get id from URL 
    const id = window.location.hash.replace('#', '');

    if(id){
        //Prepare for UI change
        recipeView.clearRecipe();
         renderLoader(elements.recipe);
         //Hightlight the selected recipe
         if(state.search) {
             searchView.hightlightSelected(id);
         }
        // Create a new Recipe object
        state.recipe = new Recipe(id);
        
        //Get recipe data
       try{
            await state.recipe.getRecipe(); 
            console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();

            // calculate serving and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            clearLoader();
            recipeView.renderRecipe(state.recipe);
             
        }
        catch(err){
            alert('Error in processing recipe');
        }
       
       
        //Render Recipe
        

    }
    

};

['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});
