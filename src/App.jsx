import { useState } from "react";

function App() {
    const [fusionFileData, setFusionFileData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterList, setFilterList] = useState([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [fusionResults, setFusionResults] = useState([]);

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

    // Remove a filter from the list
    const removeFilter = (item) => {
        const newFilters = filterList.filter((filter) => filter !== item);
        setFilterList(newFilters);
        updateFusionResults(newFilters);
    };

    // Apply filtering logic
    const filteredFusions =
        filterList.length > 0
            ? fusionFileData.filter(
                  (fusion) =>
                      filterList.includes(fusion.material1.toLowerCase()) &&
                      filterList.includes(fusion.material2.toLowerCase())
              )
            : [];

    // Update Fusion Results based on active filters
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

    return (
        <div>
            <h1>YuGiOh DM Search & Filter Fusion Combinations</h1>

            {/* File Upload */}
            <input type="file" onChange={handleFileUpload} />
            <br />

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
                    <ul>
                        {filterList.map((item, index) => (
                            <li key={index}>
                                {item}{" "}
                                <button onClick={() => removeFilter(item)}>
                                    ❌
                                </button>
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
        </div>
    );
}

export default App;
