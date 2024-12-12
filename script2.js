import validwords from "./assets/fooditems.js";

//Function to format the output generated by gemini
const formatBoldText = (text) => {

    const formattedBold = text.replace(/\*\*(.*?)\*\*/g, '<br><br><b>$1</b>');
    const formattedBullets = formattedBold.replace(/##/g, '<h3><b>Recipe:</b></h3>' + '<br>');
    const formatbullet = formattedBullets.replace(/\*/g, '<br><br>' + '<b>•</b>')
    const serialnum = formatbullet.replace(/(\d+\.\s)/g, '');
    return serialnum;
};

//Function to validate if the input is related to a recipe, if not then it will return an unexpected output
const validresponse = (text) => {
    const validation = validwords;
    return validation.some((keyword) => text.includes(keyword));

}

//an event listener DOMcontentloades is used to ensure that the func runs after the html is completely loaded
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("recipe-form");
    const recipeContainer = document.getElementById("recipe-container");

// Function named combine is used to combine the input for API
    function combine() {
        const ingValue = document.getElementById("ingredients").value;
        const timeValue = document.getElementById("time").value;

        if (!ingValue) {
            return null; 
        }

        else if (!validresponse(ingValue)) {
            return `It doesn't seem like a recipe. Please enter valid ingredients.`
        }

        else if (!timeValue) {
            return `Generate a recipe: ${ingValue}. step by step guide`
        }
        else
            return `Generate a recipe: ${ingValue}. Preparation time: ${timeValue} minutes. step by step guide`;
    }



 //Form submission and API calling.
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent page reload

        const combinedInput = combine();

        if (!combinedInput) {
            recipeContainer.innerHTML = "<p>Please fill in all fields.</p>";
            return;
        }

//"try" for error handling       
        try {
            recipeContainer.innerHTML = "<p>Generating your recipe...</p>"; // Show loading message
//API call
            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBTCnyhCrHKS-sDz52x9yAsEEr7hp30cos",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: combinedInput,
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );


            const result = await response.json();
//if response is not ok, error 
            if (!response.ok) {
                throw new Error(result.error.message || "Failed to generate the recipe.");
            }

//accessing the result from nested elements of the object (optional chaining)          
            const rawAnswer = result?.candidates[0]?.content?.parts[0]?.text || "No recipe generated."

//text formatting
           const formattedAnswer = formatBoldText(rawAnswer);
            // Display the API response in the UI
            recipeContainer.innerHTML = `
                <h3>Generated Recipe</h3><br><br>
                <p>${formattedAnswer}</p>
               `
        } catch (error) {
            console.error("Error:", error);
            recipeContainer.innerHTML = `<p>Error: ${error.message || "Failed to generate the recipe. Please try again later."}</p>`;
        }
    });
});
