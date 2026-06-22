import React, { useState, useEffect, useCallback } from "react";
import { fetchProducts, injectConcurrentData } from "./services/api";
import FilterBar from "./components/FilterBar";
import ProductList from "./components/ProductList";

export default function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState("");
  const [error, setError] = useState(null);
  const [injecting, setInjecting] = useState(false);

  // Core data fetch function
  const loadProducts = useCallback(
    async (isInitial = false, currentCategory = category) => {
      try {
        setLoading(true);
        setError(null);

        // If initial load, we clear the cursor state entirely
        const searchCursor = isInitial ? null : cursor;

        const data = await fetchProducts({
          category: currentCategory,
          cursor: searchCursor,
        });

        if (data.success) {
          setProducts((prev) =>
            isInitial ? data.products : [...prev, ...data.products],
          );
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
          setExecutionTime(data.executionTimeMs);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data from server.");
      } finally {
        setLoading(false);
      }
    },
    [cursor, category],
  );

  // Handle initial page load or category switching
  useEffect(() => {
    loadProducts(true);
  }, [category]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadProducts(false);
    }
  };

  const handleSimulateInjection = async () => {
    setInjecting(true);
    try {
      const activeCategory = category || "Electronics"; // fall back if 'All' is selected
      const res = await injectConcurrentData(activeCategory);
      if (res.success) {
        alert(
          `Successfully injected 5 newer items into "${activeCategory}" behind the scenes!`,
        );
      }
    } catch (err) {
      alert("Failed to simulate injection");
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.25rem",
            color: "#0f172a",
            margin: "0 0 0.5rem 0",
          }}
        >
          CodeVector Catalog
        </h1>
        <p style={{ color: "#475569", margin: 0 }}>
          High-performance real-size pagination engine (200,000 items)
        </p>
      </header>

      <FilterBar
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
        executionTime={executionTime}
        totalLoaded={products.length}
      />
      
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={handleSimulateInjection}
          disabled={injecting}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {injecting ? "Injecting..." : "⚠️ Simulate 5 Concurrent New Items"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#fef2f2",
            color: "#991b1b",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <ProductList products={products} />

      {hasMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "Loading items..." : "Load More Products"}
          </button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p
          style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}
        >
          You've reached the end of the catalog.
        </p>
      )}
    </div>
  );
}
