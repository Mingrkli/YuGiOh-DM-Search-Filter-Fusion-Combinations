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

    // Load filters from local storage when the app starts
    useEffect(() => {
        const savedFilters = JSON.parse(localStorage.getItem("filterList"));
        if (savedFilters) {
            setFilterList(savedFilters);
            updateFusionResults(savedFilters);
        }
    }, []);

    // Save filters to local storage when they change
    useEffect(() => {
        localStorage.setItem("filterList", JSON.stringify(filterList));
    }, [filterList]);

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

    // Removes the item from the filter from the list then updateFusionResults
    const removeFilter = (item) => {
        const newFilters = filterList.filter((filter) => filter !== item);
        setFilterList(newFilters);
        updateFusionResults(newFilters);
    };

    // Apply filtering logic
    // Basically means that it will filter the list if the fusion includes the material1 and material2 to show the user what fusions they can do
    const filteredFusions =
        filterList.length > 0
            ? fusionFileData.filter(
                  (fusion) =>
                      filterList.includes(fusion.material1.toLowerCase()) &&
                      filterList.includes(fusion.material2.toLowerCase())
              )
            : [];

    // Update Fusion Results based on active filters
    // Filters out the file data and show you fusions base on your materials you have
    const updateFusionResults = (filters) => {
        const results = fusionFileData
            .filter(
                (fusion) =>
                    filters.includes(fusion.material1.toLowerCase()) &&
                    filters.includes(fusion.material2.toLowerCase())
            )
            .map((fusion) => fusion.result);

        setFusionResults([...new Set(results)]); // Ensure unique results
    };

    // Clear all filters
    const clearFilters = () => {
        setFilterList([]);
        localStorage.removeItem("filterList");
        setFusionResults([]);
    };

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
            <input
                type="text"
                placeholder="Add filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={addFilter}>Add</button>

            {/* Display selected filters */}
            {filterList.length > 0 && (
                <div>
                    <h3>Active Filters:</h3>
                    <button onClick={clearFilters}>Clear All</button>
                    <ul>
                        {filterList.map((item, index) => (
                            <li key={index}>
                                <button
                                    className="remove-filter"
                                    onClick={() => removeFilter(item)}
                                >
                                    ❌
                                </button>
                                {item}{" "}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Display Fusion Results */}
            {fusionResults.length > 0 && (
                <div>
                    <h3>Fusions you can make:</h3>
                    <ul>
                        {fusionResults.map((result, index) => (
                            <li key={index}>{result}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Show filtered results */}
            {filterList.length > 0 && filteredFusions.length > 0 ? (
                <div>
                    <h3>Fusions:</h3>
                    <ul>
                        {filteredFusions.map((fusion, index) => (
                            <li key={index}>
                                {fusion.material1} + {fusion.material2} ={" "}
                                {fusion.result}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : filterList.length > 0 ? (
                <p>No results found.</p>
            ) : null}
        </main>
    );
}

export default App;
