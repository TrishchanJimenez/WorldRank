const tableBody = document.getElementById('table-body');
const resultsCount = document.getElementById('results-found');
const regionFilterContainer = document.getElementById('region-filter');
const sortBy = document.getElementById('sort-by');
const borderCountries = document.getElementById('border-countries');
const searchBar = document.getElementById('search-bar');

const countryRank = document.getElementById('world-rank');
const countryPage = document.getElementById('country-page');

const independentCheckbox = document.getElementById('independent');
const memberCheckbox = document.getElementById('member');

let sortByChanged = false;
let regionFilters = [];
let data = [];
let countryRows = [];
let filteredArray = [];
let countryData = [];

const fetchData = async () => {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=flags,name,cca3,independent,unMember,currencies,capital,region,subregion,languages,borders,area,population');
    data = await res.json();
    displayCountriesRank(data);
}

const displayCountriesRank = (data) => {
    countryPage.style.display = "none";
    countryRank.style.display = "block";
    resultsCount.innerText = data.length;
    data.sort((a, b) => b.population - a.population).forEach((object, index) => 
    {
        createCountryRow(object, index);
        const {name, region, subregion, independent, unMember} = object;
        let country = {name: name.common.toLowerCase(), region: region.toLowerCase(), subregion: subregion.toLowerCase(), independent, unMember, rowIndex: index, isHidden: false};
        countryData.push(country);
    });
    countryRows = [...document.querySelectorAll('[data-index]')];
    // eventlisteners for the filters
    regionFilterContainer.addEventListener('click', (e) => {
        let target = e.target;
        if(target.classList.contains('region-selector')) {
            if(target.classList.contains('selected')) {
                target.classList.remove('selected');
                regionFilters.splice(regionFilters.indexOf(target.value), 1);
            } else {
                target.classList.add('selected');
                regionFilters.push(target.value);
            }
            sortByChanged = false;
            filterCountries();
        }
    });    
    sortBy.addEventListener('change', () => {
        sortByChanged = true;
        console.log(sortByChanged);
        sortTable(sortBy.value);
    });
    searchBar.addEventListener('keypress', () => {
        sortByChanged = false;
        filterCountries();
    })
    searchBar.addEventListener('keydown', () => {
        sortByChanged = false;
        filterCountries();
    })
    tableBody.addEventListener('click', (e) => {
        let clickedCountry = e.target.closest('tr').dataset.index;
        if(!(clickedCountry == null)) {
            displayCountryPage(data[clickedCountry], data);
        }
    })
    document.getElementById('member').addEventListener('change', () => {
        filterCountries();
    })
    document.getElementById('independent').addEventListener('change', () => {
        filterCountries();
    })
}

const filterCountries = () => {
    let filterCount = 0;
    const regionFiltersLen = regionFilters.length;
    const searchBarValue = searchBar.value.toLowerCase();
    
    countryData.forEach((country) => {
        // Region Filtering 
        if (regionFiltersLen > 0) {
            if (!regionFilters.includes(country.region)) {
                country.isHidden = true;
            } else {
                country.isHidden = false;
            }
        } else {
            country.isHidden = false;
        }
        //Name filtering
        if(searchBarValue !== '') {
            if (!(country.name.includes(searchBarValue) || country.region.includes(searchBarValue) || country.subregion.includes(searchBarValue))) {
                country.isHidden = true;
            }   
        }
        //Country Status Filtering
        if(independentCheckbox.checked && !(country.independent)) {
            country.isHidden = true;
        } 
        if (memberCheckbox.checked && !(country.unMember)) {
            country.isHidden = true;
        }

        if(!(country.isHidden)) {
            filterCount++;
        }
    });
    countryRows.forEach((row, index) => {
        if(countryData[index].isHidden) {
            row.classList.add('hidden');
        } else {
            row.classList.remove('hidden');
        }
    })
    resultsCount.innerText = filterCount;
}

const createCountryRow = ({flags, name, population, area, region}, index) => {
    let row = tableBody.insertRow(index);
    row.setAttribute('data-index', index);
    row.setAttribute('data-population', population);
    row.setAttribute('data-area', area);
    row.setAttribute('data-name', name.common.toLowerCase());
    (row.insertCell(0)).innerHTML = `<img src="${flags.svg}" alt="" class="flag" width="60px" height="40px" loading="lazy"></img>`;
    (row.insertCell(1)).innerHTML = name.common;
    (row.insertCell(2)).innerHTML = population.toLocaleString("en-us");
    (row.insertCell(3)).innerHTML = area.toLocaleString("en-us");
    (row.insertCell(4)).innerHTML = region;
}

const displayCountryPage = (data, allCountry) => {
    const {flags, name, population, area, capital, subregion, currencies, region, borders, languages} = data;
    countryPage.style.display = "block";
    countryRank.style.display = "none";

    document.getElementById('country-flag').src = flags.svg;
    document.getElementById('common-name').innerText = name.common;
    document.getElementById('official-name').innerText = name.official;
    document.getElementById('population').innerText = population.toLocaleString("en-us");
    document.getElementById('area').innerText = area.toLocaleString("en-us");
    
    document.getElementById('capital').innerText = capital;
    document.getElementById('subregion').innerText = subregion;
    document.getElementById('languages').innerText = Object.values(languages).join();
    document.getElementById('currencies').innerText = Object.values(currencies).map((obj) => obj.name).join();
    document.getElementById('continent').innerText = region;

    if(borders.length > 0) {
        borderCountries.innerHTML = borders.map((border) => {
            let borderCountry = allCountry.find((country) => country.cca3 === border);
            return `
                <div class="neighbour" data-country="${borderCountry.name.common}">
                    <img src="${borderCountry.flags.svg}" alt="" class="neighbour-flag" width="100px" height="60px">
                    <p class="neighbour-name">${borderCountry.name.common}</p>
                </div>
            `}).join('');
    }
}

const sortTable = (val) => {
    if (sortByChanged) {
        //Sort rows
        if (val === 'population') {
            countryRows.sort((a, b) => Number(b.dataset.population) - Number(a.dataset.population));
        } else if (val === 'name') {
            countryRows.sort((a,b) => {
                const nameA = a.dataset.name;
                const nameB = b.dataset.name;
                return nameA.localeCompare(nameB);
            })
        } else if (val === 'area') {
            countryRows.sort((a, b) => Number(b.dataset.area) - Number(a.dataset.area));
        }

        //Update Table
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        tableBody.append(...countryRows);
        sortByChanged = false;
    }
}

borderCountries.addEventListener('click', (e) => {
    let selectedCountry = e.target.parentNode.dataset.country;
    if(selectedCountry !== undefined) {
        displayCountryPage(data.find((country) => country.name.common === selectedCountry), data);
    }
})

document.getElementById('logo').addEventListener('click', () => {
    if (countryRank.style.display === "none") {
        countryRank.style.display = "block";
        countryPage.style.display = "none";
    }
})

fetchData();