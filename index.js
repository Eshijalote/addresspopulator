

const addressElement = document.getElementById("addressSmarty");
const suggestionElement = document.getElementById("suggestionBox");

addressElement.addEventListener("keyup", (e) => {
  $('NextButton').hide();
  const searchValue = e.target.value;
  suggestionElement.innerHTML = "";
  if (!searchValue) {
    suggestionElement.classList.remove("active");
    suggestionElement.classList.add("inactive");
    return;
  }

  suggestionElement.classList.remove("inactive");
  suggestionElement.classList.add("active");

  sendLookupRequest(searchValue);
});

const sendLookupRequest = async (searchValue, selected = "") => {
  const params = new URLSearchParams({
    key: Qualtrics.SurveyEngine.getEmbeddedData('smartyKey'),
    search: searchValue,
    source: "all",
    selected
  });

  const request = await fetch(
    `https://us-autocomplete-pro.api.smarty.com/lookup?${params}`
  );
  const data = await request.json();

  if (data?.suggestions?.length > 0) formatSuggestions(data.suggestions);
};

const formatSuggestions = (suggestions) => {
  const formattedSuggestions = suggestions.map((suggestion) => {
    const divElement = document.createElement("div");
    const {
      street_line,
      city,
      state,
      zipcode,
      secondary,
      entries
    } = suggestion;
    const hasSecondaryData = secondary && entries > 1;

    divElement.innerText = `${street_line} ${secondary} ${
      hasSecondaryData ? `(${entries} entries)` : ""
    } ${city} ${state} ${zipcode}`;

    divElement.addEventListener("click", async () => {
      const streetLineWithSecondary = `${street_line} ${secondary}`.trim();
      if (hasSecondaryData) {
        suggestionElement.innerHTML = "";
        const selected = `${streetLineWithSecondary} (${entries}) ${city} ${state} ${zipcode}`;
        await sendLookupRequest(streetLineWithSecondary, selected);
      } else {
        suggestionElement.classList.remove("active");
        suggestionElement.classList.add("inactive");
      }
      populateForm({ streetLineWithSecondary, city, state, zipcode });
    });

    return divElement;
  });

  suggestionElement.append(...formattedSuggestions);
};

const populateForm = ({ streetLineWithSecondary, city, state, zipcode }) => {
  document.getElementById("addressSmarty").value = streetLineWithSecondary;
  document.getElementById("city").value = city;
  document.getElementById("state").value = state;
  document.getElementById("zipcode").value = zipcode;
  Qualtrics.SurveyEngine.setEmbeddedData("addressEmbeddedData", document.getElementById("addressSmarty").value);
  Qualtrics.SurveyEngine.setEmbeddedData("cityEmbeddedData", document.getElementById("city").value);
  Qualtrics.SurveyEngine.setEmbeddedData("stateEmbeddedData", document.getElementById("state").value);
  Qualtrics.SurveyEngine.setEmbeddedData("zipCodeEmbeddedData", document.getElementById("zipcode").value);
  $('NextButton').show();
};
