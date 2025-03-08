import { useEffect, useState } from "react";

function App() {
    // States
    const [fusionFileData, setFusionFileData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterList, setFilterList] = useState(() => {
        return JSON.parse(localStorage.getItem("filterList")) || [];
    });
    const [selectedFile, setSelectedFile] = useState("");
    const [fusionResults, setFusionResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [ignoreList, setIgnoreList] = useState(() => {
        return JSON.parse(localStorage.getItem("ignoreList")) || [];
    });

    // Load filters and ignoreList from local storage when the app starts
    useEffect(() => {
        const savedFilters = JSON.parse(localStorage.getItem("filterList"));
        const savedIgnoreList = JSON.parse(localStorage.getItem("ignoreList"));

        if (savedFilters) {
            setFilterList(savedFilters);
            updateFusionResults(savedFilters, savedIgnoreList || []);
        }

        if (savedIgnoreList) {
            setIgnoreList(savedIgnoreList);
        }
    }, []);

    // Save filters to local storage when filterList is changed
    useEffect(() => {
        localStorage.setItem("filterList", JSON.stringify(filterList));
    }, [filterList]);

    // save ignoreList to local storage when ignoreList is changed
    useEffect(() => {
        localStorage.setItem("ignoreList", JSON.stringify(ignoreList));
        updateFusionResults(filterList, ignoreList);
    }, [ignoreList]);

    // Read and process an uploaded file
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            processFile(e.target.result);
            setSelectedFile(file.name);
        };

        reader.readAsText(file);
    };

    // Process the file content
    // Split each line break then each line will split into 3 parts, "material1 + material2 = result"
    const processFile = (fileContent) => {
        const parsedData = fileContent
            .split("\n")
            .map((line) => {
                const parts = line.split(" = ");
                if (parts.length !== 2) return null;

                const materials = parts[0].split(" + ");
                if (materials.length !== 2) return null;

                return {
                    material1: materials[0].trim(),
                    material2: materials[1].trim(),
                    result: parts[1].trim(),
                };
            })
            .filter((entry) => entry !== null);

        setFusionFileData(parsedData);
    };

    // getAllMaterials to be ready for the drop down selection from the search bar
    const getAllMaterials = () => {
        const materials = new Set();
        fusionFileData.forEach(({ material1, material2 }) => {
            materials.add(material1.toLowerCase());
            materials.add(material2.toLowerCase());
        });
        return Array.from(materials);
    };

    // If the user selectSuggestion from the dropdown
    const selectSuggestion = (suggestion) => {
        setSearchTerm(suggestion);
        setSuggestions([]); // Hide suggestions when selected
    };

    // Add search term to filter list
    // Checks the searchTerm trim and lower case and will add it to the filtered list while will updateFusionResults
    const addFilter = () => {
        if (
            searchTerm.trim() &&
            !filterList.includes(searchTerm.trim().toLowerCase())
        ) {
            const newFilters = [...filterList, searchTerm.trim().toLowerCase()];
            setFilterList(newFilters);
            updateFusionResults(newFilters);
        }
        setSearchTerm("");
    };

    // Apply filtering logic
    // Basically means that it will filter the list if the fusion includes the material1 and material2 to show the user what fusions they can do
    const filteredFusions =
        filterList.length > 0
            ? fusionFileData
                  .filter(
                      (fusion) =>
                          filterList.includes(fusion.material1.toLowerCase()) &&
                          filterList.includes(fusion.material2.toLowerCase())
                  )
                  .reduce((uniqueFusions, fusion) => {
                      // Check if this fusion is already included (to prevent duplicates)
                      // For example "Dancing Elf + Dancing Elf = Dark Witch"
                      const exists = uniqueFusions.some(
                          (f) =>
                              (f.material1 === fusion.material1 &&
                                  f.material2 === fusion.material2) ||
                              (f.material1 === fusion.material2 &&
                                  f.material2 === fusion.material1)
                      );
                      if (!exists) {
                          uniqueFusions.push(fusion);
                      }
                      return uniqueFusions;
                  }, [])
            : [];

    // Update Fusion Results based on active filters
    // Filters out the file data and show you fusions base on your materials you have
    // It now also exclude any ignored results
    const updateFusionResults = (filters, ignored) => {
        const results = fusionFileData
            .filter(
                (fusion) =>
                    filters.includes(fusion.material1.toLowerCase()) &&
                    filters.includes(fusion.material2.toLowerCase()) &&
                    !ignored.includes(fusion.result.toLowerCase())
            )
            .map((fusion) => fusion.result);

        setFusionResults([...new Set(results)]);
    };

    // Removes the item from the filter from the list then updateFusionResults
    const removeFilter = (item) => {
        const newFilters = filterList.filter((filter) => filter !== item);
        setFilterList(newFilters);
        updateFusionResults(newFilters);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilterList([]);
        localStorage.removeItem("filterList");
        setFusionResults([]);
    };

    // handleSearchChange when the search bar has change when more than 3 letters
    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (value.length >= 3) {
            const allMaterials = getAllMaterials();
            const filteredSuggestions = allMaterials.filter((material) =>
                material.startsWith(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions.slice(0, 10)); // Show max 10 suggestions
        } else {
            setSuggestions([]);
        }
    };

    // Once user clicks on a row, it'll filter out the list without the selected ignored
    const ignoreFusionResult = (result) => {
        const lowerCaseResult = result.toLowerCase();
        if (!ignoreList.includes(lowerCaseResult)) {
            const newIgnoreList = [...ignoreList, lowerCaseResult];
            setIgnoreList(newIgnoreList);
            updateFusionResults(filterList, newIgnoreList); // Updates the fusion results
        }
    };

    // removeIgnoredItem on selected item
    const removeIgnoredItem = (item) => {
        const newIgnoreList = ignoreList.filter((ignored) => ignored !== item);
        setIgnoreList(newIgnoreList);
    };

    //
    return (
        <main>
            <h1>YuGiOh DM Search & Filter Fusion Combinations</h1>
            <a
                href="https://github.com/Mingrkli/YuGiOh-DM-Search-Filter-Fusion-Combinations"
                target="_blank"
            >
                Link to Github Repo
            </a>

            {/* File Upload */}

            <input type="file" onChange={handleFileUpload} />

            {selectedFile && (
                <p>
                    <strong>Current File:</strong> {selectedFile}
                </p>
            )}

            {/* Search bar for adding multiple filters */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Add filter..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />

                {/* Dropdown Suggestions */}
                {suggestions.length > 0 && (
                    <ul className="suggestions">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => selectSuggestion(suggestion)}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button className="btn" onClick={addFilter}>
                Add
            </button>

            {/* Display selected filters */}
            {filterList.length > 0 && (
                <div className="active-filters-container">
                    <h3>Active Filters:</h3>
                    <button className="clear-all-btn" onClick={clearFilters}>
                        Clear All
                    </button>
                    <ul>
                        {filterList.map((item, index) => {
                            // Check if the filter is actually used in fusions that are still visible
                            const isUsed = filteredFusions.some(
                                (fusion) =>
                                    (fusion.material1.toLowerCase() === item ||
                                        fusion.material2.toLowerCase() ===
                                            item) &&
                                    !ignoreList.includes(
                                        fusion.result.toLowerCase()
                                    ) // Ensure the fusion result is not ignored
                            );

                            return (
                                <li
                                    key={index}
                                    style={{ color: isUsed ? "white" : "red" }} // Change color if not used due to ignored results
                                >
                                    <button
                                        className="remove-filter"
                                        onClick={() => removeFilter(item)}
                                    >
                                        ❌
                                    </button>
                                    {item}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {ignoreList.length > 0 && (
                <div className="active-filters-container">
                    <h3>Ignored Results:</h3>
                    <ul>
                        {ignoreList.map((item, index) => (
                            <li key={index}>
                                <button
                                    className="remove-filter"
                                    onClick={() => removeIgnoredItem(item)}
                                >
                                    ❌
                                </button>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Show filtered results */}
            {filterList.length > 0 && filteredFusions.length > 0 ? (
                <div>
                    <h3>Fusions:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Material 1</th>
                                <th>Material 2</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFusions
                                .filter(
                                    (fusion) =>
                                        !ignoreList.includes(
                                            fusion.result.toLowerCase()
                                        )
                                ) // Remove ignored results from display
                                .map((fusion, index) => (
                                    <tr
                                        key={index}
                                        onClick={() =>
                                            ignoreFusionResult(fusion.result)
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{fusion.material1}</td>
                                        <td>{fusion.material2}</td>
                                        <td>{fusion.result}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            ) : filterList.length > 0 ? (
                <p>No results found.</p>
            ) : null}
        </main>
    );
}

export default App;
