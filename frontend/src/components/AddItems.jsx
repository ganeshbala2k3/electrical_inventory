import React, { useState, useEffect } from "react";
import axios from "axios";
import { port } from "./porturl";

const AddItem = () => {
    const [formData, setFormData] = useState({
        name: "",
        category_name: "",
        brand: "",
        supplier_id: "",
        quantity: "",
        units: "",
        unit_price: "",
        description: ""
    });

    const [suppliers, setSuppliers] = useState([]); // State to store supplier IDs

    // Fetch supplier IDs from the database
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get(`${port}suppliers`);
                setSuppliers(response.data); // Assuming the backend returns an array of suppliers
            } catch (error) {
                console.error("Error fetching suppliers:", error);
                alert("Failed to fetch suppliers. Please try again later.");
            }
        };

        fetchSuppliers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${port}addItem`, formData);
            alert(response.data.message);
        } catch (error) {
            alert("Error adding item: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Add New Item</h2>
            <form onSubmit={handleSubmit}>
                {Object.keys(formData).map((key) => {
                    if (key === "units") {
                        // Render a dropdown for the 'units' field
                        return (
                            <select
                                key={key}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            >
                                <option value="" disabled>
                                    Select Unit
                                </option>
                                <option value="kg">kg</option>
                                <option value="ltr">ltr</option>
                                <option value="no.">no.</option>
                            </select>
                        );
                    }

                    if (key === "supplier_id") {
                        // Render a dropdown for the 'supplier_id' field
                        return (
                            <select
                                key={key}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            >
                                <option value="" disabled>
                                    Select Supplier
                                </option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                        {supplier.supplier_id}
                                    </option>
                                ))}
                            </select>
                        );
                    }

                    return (
                        <input
                            key={key}
                            type={key === "unit_price" || key === "quantity" ? "number" : "text"}
                            name={key}
                            placeholder={key.replace("_", " ").toUpperCase()}
                            value={formData[key]}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    );
                })}
                <button type="submit" style={styles.button}>
                    Add Item
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        maxWidth: "400px",
        margin: "auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    },
    heading: { marginBottom: "20px", color: "#333" },
    input: {
        width: "100%",
        padding: "10px",
        margin: "10px 0",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "16px"
    },
    button: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px"
    }
};

export default AddItem;